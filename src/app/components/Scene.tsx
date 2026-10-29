"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Component, Suspense, useEffect, useMemo, useRef, useState, type MutableRefObject, type ReactNode } from "react"
import { AdditiveBlending, BufferAttribute, BufferGeometry, MathUtils, PointLight, Points } from "three"
import Model, { ModelHandle } from "./Model"
import { resolveStage, smoothstep } from "./stage"

const FOV = 54
const BASE_Z = 5
const CLIP_DAMPING = 3

type PointerRef = MutableRefObject<{ x: number; y: number }>

function useMediaFlags() {
  const [flags, setFlags] = useState(() => ({
    mobile: window.matchMedia("(max-width: 767px)").matches,
    reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  }))
  useEffect(() => {
    const mqMobile = window.matchMedia("(max-width: 767px)")
    const mqReduced = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setFlags({ mobile: mqMobile.matches, reduced: mqReduced.matches })
    update()
    mqMobile.addEventListener("change", update)
    mqReduced.addEventListener("change", update)
    return () => {
      mqMobile.removeEventListener("change", update)
      mqReduced.removeEventListener("change", update)
    }
  }, [])
  return flags
}

function usePointer(enabled: boolean): PointerRef {
  const pointer = useRef({ x: 0, y: 0 })
  useEffect(() => {
    if (!enabled) return
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener("pointermove", onMove, { passive: true })
    return () => window.removeEventListener("pointermove", onMove)
  }, [enabled])
  return pointer
}

/** Stage progress 0..1 plus how far we've scrolled past the stage (px). */
function stageProgress(el: HTMLElement, vh: number): { p: number; overshoot: number } {
  const rect = el.getBoundingClientRect()
  const span = rect.height - vh
  const raw = span > 0 ? -rect.top / span : 0
  return {
    p: Math.min(Math.max(raw, 0), 1),
    overshoot: Math.max(-rect.top - span, 0),
  }
}

function StageRig({ mobile, reduced, pointer }: { mobile: boolean; reduced: boolean; pointer: PointerRef }) {
  const { camera } = useThree()
  const modelRef = useRef<ModelHandle>(null)
  const accentRef = useRef<PointLight>(null)
  const stageElRef = useRef<HTMLElement | null>(null)
  const lastClipT = useRef(-1)

  useFrame((state, delta) => {
    const g = modelRef.current?.group
    if (!g) return
    const vh = window.innerHeight
    const halfH = Math.tan((FOV * Math.PI) / 360) * BASE_Z
    const halfW = halfH * (window.innerWidth / vh)

    if (reduced) {
      // Static dock, frozen mid-pose. No travel, no bob, no follow.
      g.position.set((0.13 - 0.5) * 2 * halfW, (0.5 - 0.94) * 2 * halfH, 0)
      g.scale.setScalar(0.34)
      g.rotation.set(0, 0.3, 0)
      if (lastClipT.current !== 0.15) {
        lastClipT.current = 0.15
        modelRef.current?.setClipT(0.15)
      }
      camera.position.set(0, 0, BASE_Z)
      return
    }

    if (!stageElRef.current) {
      stageElRef.current = document.querySelector<HTMLElement>("[data-stage]")
    }
    const el = stageElRef.current
    const { p, overshoot } = el ? stageProgress(el, vh) : { p: 0, overshoot: 0 }
    // One-time transition to the corner dock over ~0.6 viewport of post-stage scroll.
    const dockT = smoothstep(overshoot / (vh * 0.6))

    const center = mobile
      ? // ny 0.68 (was 0.72): the bottom cards sit above the canvas on mobile — keep his torso above their top edge.
        { x: 0, y: (0.5 - 0.68) * 2 * halfH, scale: 0.62 }
      : // ny 0.86 / scale 0.95 (was 0.78 / 1.05): the two-line headline + CTA need the space above his antenna at 720px heights.
        { x: 0, y: (0.5 - 0.86) * 2 * halfH, scale: 0.95 }
    const dock = mobile
      ? // Smaller/lower than v1 (0.16/0.92/0.42): full-width mobile text otherwise disappears behind him.
        { x: (0.13 - 0.5) * 2 * halfW, y: (0.5 - 0.94) * 2 * halfH, scale: 0.34 }
      : // Docked bottom-left (was 0.95/right): nx 0.05 clears the services grid, which starts at col 1 left-aligned.
        { x: (0.05 - 0.5) * 2 * halfW, y: (0.5 - 0.93) * 2 * halfH, scale: 0.36 }

    const bob = Math.sin(state.clock.elapsedTime * 1.2) * 0.05 * (1 - dockT)
    const breath = 1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.02 * (1 - dockT)

    const tx = MathUtils.lerp(center.x, dock.x, dockT)
    const ty = MathUtils.lerp(center.y, dock.y, dockT) + bob
    const ts = MathUtils.lerp(center.scale, dock.scale, dockT) * breath

    g.position.x = MathUtils.damp(g.position.x, tx, 5, delta)
    g.position.y = MathUtils.damp(g.position.y, ty, 5, delta)
    g.scale.setScalar(MathUtils.damp(g.scale.x, ts, 5, delta))

    // Mouse-follow on desktop, fading out as the robot docks.
    const followY = mobile ? 0 : pointer.current.x * 0.18
    const dockRotY = mobile ? 0.3 : 0.35
    g.rotation.y = MathUtils.damp(g.rotation.y, MathUtils.lerp(followY, dockRotY, dockT), 5, delta)
    g.rotation.x = MathUtils.damp(g.rotation.x, mobile ? 0 : -pointer.current.y * 0.05 * (1 - dockT), 5, delta)

    const st = resolveStage(p)
    // Damped: the robot's animation glides toward the scroll position instead of jumping with each wheel tick.
    const clipT = lastClipT.current < 0 ? st.clipT : MathUtils.damp(lastClipT.current, st.clipT, CLIP_DAMPING, delta)
    if (Math.abs(clipT - lastClipT.current) > 1e-4) {
      lastClipT.current = clipT
      modelRef.current?.setClipT(clipT)
      accentRef.current?.color.setRGB(st.accentR, st.accentG, st.accentB)
    }
    camera.position.set(0, 0, BASE_Z)
  })

  return (
    <>
      <hemisphereLight args={["#39B5C4", "#000022", 0.7]} />
      <directionalLight position={[-4, 4, 6]} intensity={2.2} />
      <pointLight ref={accentRef} position={[2, 1, 3]} intensity={8} distance={14} color="#1E94A5" />
      <pointLight position={[-3, -1, 2]} intensity={4} distance={12} color="#76007D" />
      <Suspense fallback={null}>
        <Model ref={modelRef} />
      </Suspense>
    </>
  )
}

// Deterministic LCG so the cloud is identical every load (and no Math.random in render).
function ParticleCloud({ color, seed, pointer }: { color: string; seed: number; pointer: PointerRef }) {
  const ref = useRef<Points>(null)
  const geometry = useMemo(() => {
    const g = new BufferGeometry()
    const N = 100
    const pos = new Float32Array(N * 3)
    let s = seed * 16807 + 1
    const rand = () => {
      s = (s * 16807) % 2147483647
      return s / 2147483647
    }
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (rand() - 0.5) * 12
      pos[i * 3 + 1] = (rand() - 0.5) * 7
      pos[i * 3 + 2] = -1.5 + rand() * 3
    }
    g.setAttribute("position", new BufferAttribute(pos, 3))
    return g
  }, [seed])
  useFrame((state, delta) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    const dir = seed % 2 === 0 ? 1 : -1
    ref.current.rotation.y = t * 0.02 * dir
    ref.current.position.y = Math.sin(t * 0.15 + seed) * 0.25
    // Subtle pointer parallax, opposite directions per cloud for depth.
    ref.current.position.x = MathUtils.damp(ref.current.position.x, pointer.current.x * 0.35 * dir, 2, delta)
  })
  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial color={color} size={0.035} transparent opacity={0.35} depthWrite={false} blending={AdditiveBlending} sizeAttenuation />
    </points>
  )
}

class CanvasErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(err: unknown) {
    console.error("3D scene disabled:", err)
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

export default function Scene() {
  const { mobile, reduced } = useMediaFlags()
  const pointer = usePointer(!mobile && !reduced)
  return (
    <CanvasErrorBoundary>
      <Canvas
        gl={{ antialias: true }}
        dpr={[1, 1.5]}
        camera={{ fov: FOV, near: 0.1, far: 100, position: [0, 0, BASE_Z] }}
        className="h-full w-full"
        // R3F forces inline pointer-events:auto on its container, defeating the overlay's
        // pointer-events-none and swallowing every click on the page. We use window
        // listeners for mouse-follow, so the canvas never needs pointer events.
        style={{ pointerEvents: "none" }}
      >
        <StageRig mobile={mobile} reduced={reduced} pointer={pointer} />
        {!mobile && !reduced && (
          <>
            <ParticleCloud color="#1E94A5" seed={1} pointer={pointer} />
            <ParticleCloud color="#76007D" seed={2} pointer={pointer} />
          </>
        )}
      </Canvas>
    </CanvasErrorBoundary>
  )
}
