'use client'

import { create } from 'zustand'
import {
  parseSeason,
  SEASON_PREVIEW_KEY,
  type SeasonId,
  seasonOffKey,
  seasonOn,
} from '@/shared/lib/seasons/seasons'

interface SeasonStore {
  /** The season dressing the page now. */
  active: SeasonId | null
  /** The season the date or a preview offers, even when the visitor turned it off. */
  current: SeasonId | null
  init: () => void
  setEnabled: (enabled: boolean) => void
}

function applySeason(season: SeasonId | null) {
  if (typeof document === 'undefined') return
  if (season) document.documentElement.setAttribute('data-season', season)
  else document.documentElement.removeAttribute('data-season')
}

function readPreview(): string | null {
  try {
    return sessionStorage.getItem(SEASON_PREVIEW_KEY)
  } catch {
    return null
  }
}

function isTurnedOff(season: SeasonId): boolean {
  try {
    return localStorage.getItem(seasonOffKey(season, new Date().getFullYear())) === '1'
  } catch {
    return false
  }
}

export const useSeason = create<SeasonStore>((set, get) => ({
  active: null,
  current: null,
  init: () => {
    const preview = readPreview()
    const forced = parseSeason(preview)
    const current = preview === 'off' ? null : (forced ?? seasonOn(new Date()))
    const active = current && (forced || !isTurnedOff(current)) ? current : null
    applySeason(active)
    set({ active, current })
  },
  setEnabled: (enabled) => {
    const { current } = get()
    if (!current) return
    const key = seasonOffKey(current, new Date().getFullYear())
    try {
      const preview = sessionStorage.getItem(SEASON_PREVIEW_KEY)
      if (!enabled && preview === current) sessionStorage.setItem(SEASON_PREVIEW_KEY, 'off')
      if (enabled && preview === 'off') sessionStorage.setItem(SEASON_PREVIEW_KEY, current)
    } catch {
      // Without storage the choice lasts until the page reloads.
    }
    try {
      if (enabled) localStorage.removeItem(key)
      else localStorage.setItem(key, '1')
    } catch {
      // Same: the page still changes now.
    }
    applySeason(enabled ? current : null)
    set({ active: enabled ? current : null })
  },
}))
