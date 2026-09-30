'use client'

import { create } from 'zustand'
import { parseRetroMode, type RetroMode } from './retro-modes'

interface RetroModeStore {
  active: boolean
  mode: RetroMode | null
  init: () => void
  setActive: (active: boolean) => void
  setMode: (mode: RetroMode | null) => void
}

function applyRetroMode(mode: RetroMode | null) {
  if (typeof document === 'undefined') return
  if (mode) {
    document.documentElement.setAttribute('data-retro', 'true')
    document.documentElement.setAttribute('data-retro-mode', mode)
  } else {
    document.documentElement.removeAttribute('data-retro')
    document.documentElement.removeAttribute('data-retro-mode')
  }
}

export const useRetroMode = create<RetroModeStore>((set, get) => ({
  active: false,
  mode: null,
  init: () => {
    let mode = get().mode
    try {
      mode = parseRetroMode(sessionStorage.getItem('retro-mode'))
    } catch {
      // The easter egg remains usable when browser storage is blocked.
      if (typeof document !== 'undefined') {
        mode ??= parseRetroMode(document.documentElement.dataset.retroMode ?? null)
        if (!mode && document.documentElement.dataset.retro === 'true') mode = '1998'
      }
    }
    applyRetroMode(mode)
    set({ mode, active: mode !== null })
  },
  setActive: (active) => {
    get().setMode(active ? (get().mode ?? '1998') : null)
  },
  setMode: (mode) => {
    applyRetroMode(mode)
    try {
      if (mode) sessionStorage.setItem('retro-mode', mode === '1998' ? 'true' : mode)
      else sessionStorage.removeItem('retro-mode')
    } catch {
      // Persistence is optional; changing the presentation is not.
    }
    set({ mode, active: mode !== null })
  },
}))
