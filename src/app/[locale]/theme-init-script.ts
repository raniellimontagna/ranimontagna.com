import {
  SEASON_OFF_PREFIX,
  SEASON_PARAM,
  SEASON_PREVIEW_KEY,
  SEASONS,
} from '@/shared/lib/seasons/seasons'
import { RETRO_MODES } from '@/shared/store/use-retro-mode/retro-modes'

export const THEME_INIT_SCRIPT = `
(() => {
  let retroActive = false;
  try {
    const saved = sessionStorage.getItem('retro-mode');
    const mode = saved === 'true' ? '1998' : saved;
    if (${JSON.stringify(RETRO_MODES)}.includes(mode)) {
      retroActive = true;
      document.documentElement.setAttribute('data-retro', 'true');
      document.documentElement.setAttribute('data-retro-mode', mode);
    }
  } catch {}

  // Season: the same calendar as src/shared/lib/seasons/seasons.ts, by local date.
  (() => {
    const seasons = ${JSON.stringify(SEASONS)};
    const valid = (value) => (seasons.some((season) => season.id === value) ? value : null);
    let preview = null;
    try {
      const param = new URLSearchParams(location.search).get(${JSON.stringify(SEASON_PARAM)});
      if (param === 'off' || valid(param)) preview = param;
    } catch {}
    try {
      if (preview) sessionStorage.setItem(${JSON.stringify(SEASON_PREVIEW_KEY)}, preview);
      else preview = sessionStorage.getItem(${JSON.stringify(SEASON_PREVIEW_KEY)});
    } catch {}

    const now = new Date();
    const today = (now.getMonth() + 1) * 100 + now.getDate();
    const dated = seasons.find(
      (season) =>
        today >= season.from.month * 100 + season.from.day &&
        today <= season.to.month * 100 + season.to.day,
    );
    const forced = valid(preview);
    const season = preview === 'off' ? null : forced || (dated ? dated.id : null);
    let off = false;
    if (season && !forced) {
      try {
        off =
          localStorage.getItem(${JSON.stringify(SEASON_OFF_PREFIX)} + season + '-' + now.getFullYear()) === '1';
      } catch {}
    }
    if (season && !off && !retroActive) {
      document.documentElement.setAttribute('data-season', season);
    }
  })();

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
