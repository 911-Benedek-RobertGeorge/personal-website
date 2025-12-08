import "@react-three/fiber"
import { useEffect, useRef, useState } from "react"
import { Group, AnimationMixer, AnimationClip, AnimationAction, Object3D } from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"



export default function Model() {
  const group = useRef<Group>(null)
  const [gltfScene, setGltfScene] = useState<Object3D | null>(null)
  const mixerRef = useRef<AnimationMixer | null>(null)
  const clipRef = useRef<AnimationClip | null>(null)
  const actionRef = useRef<AnimationAction | null>(null)

  // Load GLTF and setup animation (paused for scrub)
  useEffect(() => {
    const loader = new GLTFLoader()
    loader.load(
      "/robot_playground.glb",
      (gltf) => {
        setGltfScene(gltf.scene)
        if (gltf.animations && gltf.animations.length > 0) {
          const mixer = new AnimationMixer(gltf.scene)
          mixerRef.current = mixer
          const clip = gltf.animations[0]
          clipRef.current = clip
          const action = mixer.clipAction(clip)
          actionRef.current = action
          action.play()
          // Pause; we'll scrub via scroll
          action.paused = true
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
      const action = actionRef.current
      const clip = clipRef.current
      if (action && clip) {
        const duration = clip.duration
        const progress = getScrollProgress()
        action.time = duration * progress
      }
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => {
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <group ref={group} scale={1.2}>
      {gltfScene && <primitive object={gltfScene} />}
    </group>
  )
}