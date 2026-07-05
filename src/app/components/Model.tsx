import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react"
import { AnimationAction, AnimationClip, AnimationMixer, Group, LoopOnce, Object3D } from "three"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js"

export type ModelHandle = {
  group: Group | null
  /** Scrub the GLB animation to fraction t (0..1) of the clip. */
  setClipT: (t: number) => void
}

// Loads the robot and exposes imperative control to the ChoreoRig in Scene.tsx.
// Position/rotation/scale are owned by the rig; this component only loads and scrubs.
const Model = forwardRef<ModelHandle>(function Model(_props, ref) {
  const group = useRef<Group>(null)
  const [gltfScene, setGltfScene] = useState<Object3D | null>(null)
  const mixerRef = useRef<AnimationMixer | null>(null)
  const clipRef = useRef<AnimationClip | null>(null)
  const actionRef = useRef<AnimationAction | null>(null)

  useImperativeHandle(
    ref,
    () => ({
      get group() {
        return group.current
      },
      setClipT: (t: number) => {
        const mixer = mixerRef.current
        const clip = clipRef.current
        const action = actionRef.current
        if (!mixer || !clip || !action) return
        action.time = Math.max(0, Math.min(clip.duration * t, clip.duration))
        mixer.update(0)
      },
    }),
    []
  )

  useEffect(() => {
    const loader = new GLTFLoader()
    loader.setMeshoptDecoder(MeshoptDecoder)
    loader.load(
      "/robot_playground.glb",
      (gltf) => {
        setGltfScene(gltf.scene)
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
          action.setLoop(LoopOnce, 0)
          action.clampWhenFinished = true
          action.enabled = true
          action.play()
          action.paused = true
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

  return <group ref={group}>{gltfScene && <primitive object={gltfScene} />}</group>
})

export default Model
