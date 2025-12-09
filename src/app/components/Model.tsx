import "@react-three/fiber"
import { useThree } from "@react-three/fiber"
import { useEffect, useRef, useState } from "react"
import { Group, AnimationMixer, AnimationClip, AnimationAction, Object3D, LoopOnce } from "three"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"

export default function Model() {
  const group = useRef<Group>(null)
  const [gltfScene, setGltfScene] = useState<Object3D | null>(null)
  const mixerRef = useRef<AnimationMixer | null>(null)
  const clipRef = useRef<AnimationClip | null>(null)
  const actionRef = useRef<AnimationAction | null>(null)
  // Responsive sizing based on viewport width
  const { size } = useThree()
  const isMobile = size.width <= 640
  const isTablet = size.width > 640 && size.width <= 1024
  // Make the robot smaller across breakpoints
  const scale = isMobile ? 0.75 : isTablet ? 0.9 : 1.05
  // Slight left offset so the right side doesn’t get cut
  const offsetX = isMobile ? -0.15 : isTablet ? -0.22 : -0.15

  // Load GLTF and setup animation (paused for scrub)
  useEffect(() => {
    const loader = new GLTFLoader()
    loader.load(
      "/robot_playground.glb",
      (gltf) => {
        setGltfScene(gltf.scene)
        // Improve visibility & avoid frustum culling issues
        gltf.scene.frustumCulled = false
        gltf.scene.traverse((obj) => {
          obj.frustumCulled = false
        })
        if (gltf.animations && gltf.animations.length > 0) {
          const mixer = new AnimationMixer(gltf.scene)
          mixerRef.current = mixer
          const clip = gltf.animations[0]
          clipRef.current = clip
          const action = mixer.clipAction(clip)
          actionRef.current = action
          action.reset()
          action.setLoop(LoopOnce, 0) // LoopOnce
          action.clampWhenFinished = true
          action.enabled = true
          action.play()
          // Pause; we'll scrub via scroll
          action.paused = true
          // Ensure initial pose is applied
          action.time = 0
          mixer.update(0)
        } else {
          console.warn("GLTF loaded without animations; scrubbing will have no effect.")
        }
      },
      undefined,
      (err) => {
        console.error("Failed to load GLTF:", err)
      }
    )
  }, [])

  // Helper to compute page scroll progress [0,1]
  const getScrollProgress = () => {
    if (typeof window === "undefined") return 0
    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0
    const maxScroll = Math.max(
      (document.documentElement.scrollHeight || 0) - (window.innerHeight || 0),
      0
    )
    return maxScroll > 0 ? Math.min(Math.max(scrollTop / maxScroll, 0), 1) : 0
  }

  // Scrub animation time according to page scroll (RAF loop)
  useEffect(() => {
    let rafId = 0
    const tick = () => {
      const mixer = mixerRef.current
      const clip = clipRef.current
      const action = actionRef.current
      if (mixer && clip && action) {
        const progress = getScrollProgress()
        const t = Math.max(0, Math.min(clip.duration * progress, clip.duration))
        action.time = t
        // Apply keyframes at current time
        mixer.update(0)
      }
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => {
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <group ref={group} scale={scale} position={[offsetX, -0.5, 0]} rotation={[0, 0, 0]}>
      {gltfScene && <primitive object={gltfScene} />}
    </group>
  )
}
