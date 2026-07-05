"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Component, Suspense, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { AdditiveBlending, BufferAttribute, BufferGeometry, PointLight, Points } from "three"
import Model, { ModelHandle } from "./Model"
import { SECTIONS, buildTimeline, resolvePose, type Keyframe, type Pose } from "./choreography"

const FOV = 54
const BASE_Z = 5

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

// Deterministic LCG so the cloud is identical every load (and no Math.random in render).
function ParticleCloud({ color, seed }: { color: string; seed: number }) {
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
  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    ref.current.rotation.y = t * 0.02 * (seed % 2 === 0 ? 1 : -1)
    ref.current.position.y = Math.sin(t * 0.15 + seed) * 0.25
  })
  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial color={color} size={0.035} transparent opacity={0.35} depthWrite={false} blending={AdditiveBlending} sizeAttenuation />
    </points>
  )
}

function ChoreoRig({ mobile, reduced }: { mobile: boolean; reduced: boolean }) {
  const { camera } = useThree()
  const modelRef = useRef<ModelHandle>(null)
  const accentRef = useRef<PointLight>(null)
  const timelineRef = useRef<Keyframe[]>([])
  const dimsRef = useRef({ halfW: 1, halfH: 1 })
  const pageHRef = useRef(0)
  const lastScrollRef = useRef(-1)
  const poseRef = useRef<Pose | null>(null)

  const rebuild = useCallback(() => {
    const vh = window.innerHeight
    const halfH = Math.tan((FOV * Math.PI) / 360) * BASE_Z
    const halfW = halfH * (window.innerWidth / vh)
    dimsRef.current = { halfW, halfH }
    const rects: { id: string; top: number; height: number }[] = []
    for (const s of SECTIONS) {
      const el = document.querySelector(`[data-choreo="${s.id}"]`)
      if (!el) continue
      const r = el.getBoundingClientRect()
      rects.push({ id: s.id, top: r.top + window.scrollY, height: r.height })
    }
    timelineRef.current = buildTimeline(SECTIONS, rects, vh, halfW, halfH)
    pageHRef.current = document.documentElement.scrollHeight
    lastScrollRef.current = -1 // invalidate the cached pose
  }, [])

  useEffect(() => {
    rebuild()
    window.addEventListener("resize", rebuild)
    return () => window.removeEventListener("resize", rebuild)
  }, [rebuild])

  useFrame((state) => {
    // Re-measure when the page height changes (images/embeds finished loading).
    if (document.documentElement.scrollHeight !== pageHRef.current) rebuild()

    const g = modelRef.current?.group
    if (!g) return
    const { halfW, halfH } = dimsRef.current

    if (mobile || reduced) {
      // ponytail: docked mode = pre-choreography behavior; the full show is desktop-only
      g.position.set((0.16 - 0.5) * 2 * halfW, (0.5 - 0.92) * 2 * halfH, 0)
      g.scale.setScalar(0.42)
      g.rotation.y = 0.3
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)
      const t = reduced ? 0.15 : Math.min(Math.max(window.scrollY / maxScroll, 0), 1)
      modelRef.current?.setClipT(t)
      camera.position.set(0, 0, BASE_Z)
      return
    }

    const tl = timelineRef.current
    if (tl.length === 0) return
    // Spec: skip pose work when scroll hasn't moved. Only the idle bob is per-frame.
    const scrollY = window.scrollY
    const scrollChanged = scrollY !== lastScrollRef.current || poseRef.current === null
    if (scrollChanged) {
      lastScrollRef.current = scrollY
      poseRef.current = resolvePose(tl, scrollY)
    }
    const pose = poseRef.current as Pose
    const bob = Math.sin(state.clock.elapsedTime * 1.4) * 0.06
    g.position.set(pose.x, pose.y + bob, 0)
    g.scale.setScalar(pose.scale)
    g.rotation.y = pose.rotY
    if (scrollChanged) {
      modelRef.current?.setClipT(pose.clipT)
      camera.position.set(pose.camX, pose.camY, BASE_Z + pose.camZ)
      accentRef.current?.color.setRGB(pose.accentR, pose.accentG, pose.accentB)
    }
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
  return (
    <CanvasErrorBoundary>
      <Canvas
        gl={{ antialias: true }}
        dpr={[1, 1.5]}
        camera={{ fov: FOV, near: 0.1, far: 100, position: [0, 0, BASE_Z] }}
        className="h-full w-full"
      >
        <ChoreoRig mobile={mobile} reduced={reduced} />
        {!mobile && !reduced && (
          <>
            <ParticleCloud color="#1E94A5" seed={1} />
            <ParticleCloud color="#76007D" seed={2} />
          </>
        )}
      </Canvas>
    </CanvasErrorBoundary>
  )
}
