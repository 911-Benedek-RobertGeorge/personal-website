import { useAnimations, useGLTF, Center } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useEffect, useRef } from "react"
import { Group } from "three"

useGLTF.preload("/robot_playground.glb")

export default function Model() {
  const group = useRef<Group>(null)
  const { animations, scene } = useGLTF("/robot_playground.glb")
  const { actions } = useAnimations(animations, scene)

  // Play the animation but keep it paused; we'll scrub via scroll
  useEffect(() => {
    const action = actions && (actions as any)["Experiment"]
    if (action) {
      action.play()
      action.paused = true
    }
  }, [actions])

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

  // Scrub animation time according to page scroll
  useFrame(() => {
    const action = actions && (actions as any)["Experiment"]
    if (!action) return
    const duration = action.getClip().duration
    const progress = getScrollProgress()
    action.time = duration * progress
  })

  return (
    <group ref={group} scale={1.2}>
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  )
}