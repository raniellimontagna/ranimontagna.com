import { RETRO_MODES } from '@/shared/store/use-retro-mode/retro-modes'

export const THEME_INIT_SCRIPT = `
(() => {
  try {
    const saved = sessionStorage.getItem('retro-mode');
    const mode = saved === 'true' ? '1998' : saved;
    if (${JSON.stringify(RETRO_MODES)}.includes(mode)) {
      document.documentElement.setAttribute('data-retro', 'true');
      document.documentElement.setAttribute('data-retro-mode', mode);
    }
  } catch {}

  const storageKey = 'theme-storage';
  const fallbackTheme = 'dark';
  const validColorThemes = ['ocean', 'rose', 'emerald', 'amber', 'violet', 'mono', 'sunset', 'cherry'];
  const root = document.documentElement;

  try {
    const savedTheme = localStorage.getItem(storageKey);
    const parsed = savedTheme ? JSON.parse(savedTheme) : null;
    const theme = parsed?.state?.theme === 'light' || parsed?.state?.theme === 'dark'
      ? parsed.state.theme
      : fallbackTheme;
    const colorTheme = typeof parsed?.state?.colorTheme === 'string'
      ? parsed.state.colorTheme
      : 'default';

    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    root.style.colorScheme = theme;

    if (validColorThemes.includes(colorTheme)) {
      root.setAttribute('data-color-theme', colorTheme);
    } else {
      root.removeAttribute('data-color-theme');
    }
  } catch {
    root.classList.remove('light', 'dark');
    root.classList.add(fallbackTheme);
    root.style.colorScheme = fallbackTheme;
    root.removeAttribute('data-color-theme');
  }
})();
`
