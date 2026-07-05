"use client"

import { Canvas } from "@react-three/fiber"
import Model from "./Model"
import { Suspense } from "react"

export default function Scene() {
  return (
    <Canvas
      gl={{ antialias: true }}
      dpr={[1, 1.5]}
      camera={{ fov: 54, position: [0, 1.6, 4.5] }}
      className="fixed left-0 top-0 h-screen w-[28vw] z-[100] pointer-events-none"
      style={{ pointerEvents: "none" }}
    >
      <directionalLight position={[-5, -5, 5]} intensity={4} />
      <Suspense fallback={null}>
        <Model />
      </Suspense>
    </Canvas>
  )
}
