import type { MutableRefObject } from 'react'

export type SpectralMode = 'static' | 'mobile' | 'desktop'
export type SpectralZone = 'hero' | 'balanced' | 'quiet' | 'focus'
export type SpectralRgb = readonly [number, number, number]
export type SpectralPoint = { x: number; y: number }
export type SpectralPalette = {
  accent: SpectralRgb
  ice: SpectralRgb
  dark: boolean
}
export type SpectralEnvironment = {
  zone: SpectralZone
  palette: SpectralPalette
  visible: boolean
  pointerTarget: MutableRefObject<SpectralPoint>
}
export type SpectralVeilCanvasProps = {
  mode: Exclude<SpectralMode, 'static'>
  onPermanentFailure: () => void
}
export type ZoneCandidate = {
  zone: SpectralZone
  intersectionRatio: number
  centerDistance: number
}

export const SPECTRAL_ZONE_SETTINGS = {
  hero: { intensity: 0.8, motionScale: 1 },
  balanced: { intensity: 0.32, motionScale: 0.72 },
  quiet: { intensity: 0.16, motionScale: 0.5 },
  focus: { intensity: 0.5, motionScale: 0.82 },
} as const satisfies Record<SpectralZone, { intensity: number; motionScale: number }>
