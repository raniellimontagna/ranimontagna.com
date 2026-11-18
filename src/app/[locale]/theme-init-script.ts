import { SEASON_PORTRAITS } from '@/features/home/components/portrait/portrait-image'
import {
  SEASON_HOME_PATHS,
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

    // Windows by edition (the year a season starts): an end before the start is next
    // year's; { easter: n } is n days from Easter Sunday (Meeus/Jones/Butcher).
    const easter = (y) => {
      const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
      const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
      const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4;
      const l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
      const n = h + l - 7 * m + 114;
      return new Date(y, Math.floor(n / 31) - 1, (n % 31) + 1);
    };
    const key = (date) => date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
    const edge = (rule, y) => {
      if (rule.easter === undefined) return key(new Date(y, rule.month - 1, rule.day));
      const sunday = easter(y);
      return key(new Date(y, sunday.getMonth(), sunday.getDate() + rule.easter));
    };
    const now = new Date();
    const today = key(now);
    let dated = null;
    for (const edition of [now.getFullYear() - 1, now.getFullYear()]) {
      for (const season of seasons) {
        const start = edge(season.from, edition);
        let end = edge(season.to, edition);
        if (end < start) end = edge(season.to, edition + 1);
        if (today >= start && today <= end) dated = { id: season.id, edition };
      }
    }
    const forced = valid(preview);
    const season = preview === 'off' ? null : forced || (dated ? dated.id : null);
    let off = false;
    if (season && !forced) {
      try {
        off = localStorage.getItem(${JSON.stringify(SEASON_OFF_PREFIX)} + season + '-' + dated.edition) === '1';
      } catch {}
    }
    if (season && !off && !retroActive) {
      document.documentElement.setAttribute('data-season', season);
      // The seasonal portrait is the home page's LCP image: start it now.
      const portraits = ${JSON.stringify(SEASON_PORTRAITS)};
      const raw = location.pathname;
      const path = raw.length > 1 && raw.endsWith('/') ? raw.slice(0, -1) : raw;
      const portrait = portraits[season];
      if (portrait && ${JSON.stringify(SEASON_HOME_PATHS)}.includes(path)) {
        const link = document.createElement('link');
        link.setAttribute('rel', 'preload');
        link.setAttribute('as', 'image');
        link.setAttribute('imagesrcset', portrait.srcSet);
        link.setAttribute('imagesizes', portrait.sizes);
        link.setAttribute('fetchpriority', 'high');
        document.head.appendChild(link);
      }
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
