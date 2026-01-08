export type Theme = 'light' | 'dark'

export interface ThemeStore {
  theme: Theme
  mounted: boolean
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  initTheme: () => void
}
