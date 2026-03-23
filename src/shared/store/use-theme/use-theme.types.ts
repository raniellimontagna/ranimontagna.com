export type Theme = 'light' | 'dark'

export type ColorTheme =
  | 'default'
  | 'ocean'
  | 'rose'
  | 'emerald'
  | 'amber'
  | 'violet'
  | 'mono'
  | 'sunset'
  | 'cherry'

export interface ThemeStore {
  theme: Theme
  colorTheme: ColorTheme
  mounted: boolean
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  setColorTheme: (colorTheme: ColorTheme) => void
  initTheme: () => void
}
