'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { Color, Vector2 } from 'three'
import {
  SPECTRAL_ZONE_SETTINGS,
  type SpectralEnvironment,
  type SpectralMode,
} from './spectral-background.types'
import { FRAGMENT_SHADER, VERTEX_SHADER } from './spectral-veil.shaders'

type SpectralVeilSceneProps = {
  environment: SpectralEnvironment
  mode: Exclude<SpectralMode, 'static'>
}

const POINTER_DAMPING = 4.5
const COLOR_DAMPING = 3.2
const ZONE_DAMPING = 2.8

export function SpectralVeilScene({ environment, mode }: SpectralVeilSceneProps) {
  const { height, width } = useThree((state) => state.size)
  const settings = SPECTRAL_ZONE_SETTINGS[environment.zone]
  const initialEnvironment = useRef(environment)
  const initialMode = useRef(mode)
  const initialSettings = useRef(settings)
  const targetColors = useMemo(
    () => ({
      accent: new Color(...initialEnvironment.current.palette.accent),
      ice: new Color(...initialEnvironment.current.palette.ice),
    }),
    [],
  )
  const uniforms = useMemo(
    () => ({
      uAccent: { value: new Color(...initialEnvironment.current.palette.accent) },
      uDark: { value: initialEnvironment.current.palette.dark ? 1 : 0 },
      uDetail: { value: initialMode.current === 'mobile' ? 2 : 3 },
      uIce: { value: new Color(...initialEnvironment.current.palette.ice) },
      uIntensity: { value: initialSettings.current.intensity },
      uMotionScale: { value: initialSettings.current.motionScale },
      uPointer: { value: new Vector2() },
      uResolution: { value: new Vector2(1, 1) },
      uTime: { value: 0 },
    }),
    [],
  )

  useEffect(() => {
    targetColors.accent.setRGB(...environment.palette.accent)
    targetColors.ice.setRGB(...environment.palette.ice)
  }, [environment.palette.accent, environment.palette.ice, targetColors])

  useEffect(() => {
    uniforms.uResolution.value.set(width, height)
  }, [height, uniforms, width])

  useEffect(() => {
    uniforms.uDetail.value = mode === 'mobile' ? 2 : 3
  }, [mode, uniforms])

  useFrame((_state, delta) => {
    const pointerBlend = 1 - Math.exp(-delta * POINTER_DAMPING)
    const colorBlend = 1 - Math.exp(-delta * COLOR_DAMPING)
    const zoneBlend = 1 - Math.exp(-delta * ZONE_DAMPING)
    const pointer = environment.pointerTarget.current
    const pointerX = mode === 'mobile' ? 0 : pointer.x
    const pointerY = mode === 'mobile' ? 0 : pointer.y

    uniforms.uTime.value += delta
    uniforms.uPointer.value.x += (pointerX - uniforms.uPointer.value.x) * pointerBlend
    uniforms.uPointer.value.y += (pointerY - uniforms.uPointer.value.y) * pointerBlend
    uniforms.uAccent.value.lerp(targetColors.accent, colorBlend)
    uniforms.uIce.value.lerp(targetColors.ice, colorBlend)
    uniforms.uIntensity.value += (settings.intensity - uniforms.uIntensity.value) * zoneBlend
    uniforms.uMotionScale.value += (settings.motionScale - uniforms.uMotionScale.value) * zoneBlend
    uniforms.uDark.value += ((environment.palette.dark ? 1 : 0) - uniforms.uDark.value) * colorBlend
  })

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        depthWrite={false}
        fragmentShader={FRAGMENT_SHADER}
        toneMapped={false}
        transparent
        uniforms={uniforms}
        vertexShader={VERTEX_SHADER}
      />
    </mesh>
  )
}
