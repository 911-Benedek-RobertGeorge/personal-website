"use client"

import { Canvas, useThree } from "@react-three/fiber"
import Model from "./Model"
import { Suspense, useEffect } from "react"
import { PerspectiveCamera as ThreePerspectiveCamera } from "three"

function CameraSetup() {
  const { camera } = useThree()
  useEffect(() => {
    const cam = camera as ThreePerspectiveCamera
    cam.fov = 54
    cam.position.set(0, 1.6, 4.5)
    cam.updateProjectionMatrix()
  }, [camera])
  return null
}

export default function Scene() {
  return (
    <Canvas gl={{ antialias: true }} dpr={[1, 1.5]} className="fixed left-0 top-0 h-screen w-[28vw] z-[100] pointer-events-none" style={{ pointerEvents: "none" }}>
      <CameraSetup />
      <directionalLight position={[-5, -5, 5]} intensity={4} />
      <Suspense fallback={null}>
        <Model />
      </Suspense>
    </Canvas>
  )
}