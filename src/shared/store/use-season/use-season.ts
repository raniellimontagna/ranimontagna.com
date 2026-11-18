'use client'

import { create } from 'zustand'
import {
  parseSeason,
  SEASON_PREVIEW_KEY,
  type SeasonId,
  seasonEdition,
  seasonOffKey,
  seasonWindowOn,
} from '@/shared/lib/seasons/seasons'

interface SeasonStore {
  /** The season dressing the page now. */
  active: SeasonId | null
  /** The season the date or a preview offers, even when the visitor turned it off. */
  current: SeasonId | null
  /** The year `current` started in (1 January 2027 is still the 2026 New Year's). */
  edition: number | null
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

function isTurnedOff(season: SeasonId, edition: number): boolean {
  try {
    return localStorage.getItem(seasonOffKey(season, edition)) === '1'
  } catch {
    return false
  }
}

export const useSeason = create<SeasonStore>((set, get) => ({
  active: null,
  current: null,
  edition: null,
  init: () => {
    const now = new Date()
    const preview = readPreview()
    const forced = parseSeason(preview)
    const dated = preview === 'off' || forced ? null : seasonWindowOn(now)
    const current = forced ?? dated?.id ?? null
    const edition = forced ? seasonEdition(forced, now) : (dated?.edition ?? null)
    const active =
      current && edition !== null && (forced || !isTurnedOff(current, edition)) ? current : null
    applySeason(active)
    set({ active, current, edition })
  },
  setEnabled: (enabled) => {
    const { current, edition } = get()
    if (!current || edition === null) return
    const key = seasonOffKey(current, edition)
    let previewing = false
    try {
      const preview = sessionStorage.getItem(SEASON_PREVIEW_KEY)
      previewing = preview === current || preview === 'off'
      if (!enabled && preview === current) sessionStorage.setItem(SEASON_PREVIEW_KEY, 'off')
      if (enabled && preview === 'off') sessionStorage.setItem(SEASON_PREVIEW_KEY, current)
    } catch {
      // Without storage the choice lasts until the page reloads.
    }
    // A preview's switch stays in the tab: it never turns the real season off for the year.
    if (!previewing) {
      try {
        if (enabled) localStorage.removeItem(key)
        else localStorage.setItem(key, '1')
      } catch {
        // Same: the page still changes now.
      }
    }
    applySeason(enabled ? current : null)
    set({ active: enabled ? current : null })
  },
}))
