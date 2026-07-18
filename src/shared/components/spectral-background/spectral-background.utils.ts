import type {
  SpectralMode,
  SpectralPalette,
  SpectralRgb,
  SpectralZone,
  ZoneCandidate,
} from './spectral-background.types'

type SpectralModeInput = {
  reducedMotion: boolean
  webgl: boolean
  coarsePointer: boolean
  width: number
}

const DEFAULT_ACCENT: SpectralRgb = [124 / 255, 92 / 255, 1]
const DEFAULT_ICE: SpectralRgb = [198 / 255, 246 / 255, 1]

export function resolveSpectralMode({
  reducedMotion,
  webgl,
  coarsePointer,
  width,
}: SpectralModeInput): SpectralMode {
  if (reducedMotion || !webgl) return 'static'
  if (coarsePointer || width < 768) return 'mobile'

  return 'desktop'
}

export function parseCssColor(value: string): SpectralRgb | null {
  const color = value.trim()
  const hexMatch = color.match(/^#([\da-f]{3}|[\da-f]{6})$/i)

  if (hexMatch) {
    const hex =
      hexMatch[1].length === 3
        ? hexMatch[1]
            .split('')
            .map((channel) => channel.repeat(2))
            .join('')
        : hexMatch[1]

    return [
      Number.parseInt(hex.slice(0, 2), 16) / 255,
      Number.parseInt(hex.slice(2, 4), 16) / 255,
      Number.parseInt(hex.slice(4, 6), 16) / 255,
    ]
  }

  const rgbMatch = color.match(/^rgb\((.*)\)$/i)
  if (!rgbMatch) return null

  const channels = rgbMatch[1].trim().split(/[\s,]+/)
  if (channels.length !== 3) return null

  const values = channels.map(Number)
  if (values.some((channel) => !Number.isFinite(channel))) return null

  const normalizeChannel = (channel: number) => Math.min(255, Math.max(0, channel)) / 255
  return [normalizeChannel(values[0]), normalizeChannel(values[1]), normalizeChannel(values[2])]
}

export function readSpectralPalette(root: HTMLElement): SpectralPalette {
  const styles = getComputedStyle(root)

  return {
    accent: parseCssColor(styles.getPropertyValue('--accent')) ?? DEFAULT_ACCENT,
    ice: parseCssColor(styles.getPropertyValue('--accent-ice')) ?? DEFAULT_ICE,
    dark: root.classList.contains('dark'),
  }
}

export function selectSpectralZone(candidates: readonly ZoneCandidate[]): SpectralZone {
  return (
    [...candidates].sort(
      (a, b) => b.intersectionRatio - a.intersectionRatio || a.centerDistance - b.centerDistance,
    )[0]?.zone ?? 'quiet'
  )
}

export function supportsWebGl(document: Document): boolean {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2'))
  } catch {
    return false
  }
}
