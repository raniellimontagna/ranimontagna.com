import type { ColorTheme } from './use-theme.types'

/** Accent themes with the swatch each one shows in light and dark mode. */
export const COLOR_THEMES: readonly {
  id: ColorTheme
  label: string
  swatch: string
  swatchDark: string
}[] = [
  { id: 'default', label: 'Default', swatch: '#4f46e5', swatchDark: '#ddff6f' },
  { id: 'ocean', label: 'Ocean', swatch: '#0284c7', swatchDark: '#38bdf8' },
  { id: 'emerald', label: 'Emerald', swatch: '#059669', swatchDark: '#34d399' },
  { id: 'violet', label: 'Violet', swatch: '#7c3aed', swatchDark: '#a78bfa' },
  { id: 'rose', label: 'Rose', swatch: '#e11d48', swatchDark: '#fb7185' },
  { id: 'cherry', label: 'Cherry', swatch: '#db2777', swatchDark: '#f472b6' },
  { id: 'amber', label: 'Amber', swatch: '#d97706', swatchDark: '#fbbf24' },
  { id: 'sunset', label: 'Sunset', swatch: '#ea580c', swatchDark: '#fb923c' },
  { id: 'mono', label: 'Mono', swatch: '#525252', swatchDark: '#d4d4d4' },
]
