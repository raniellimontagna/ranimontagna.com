'use client'

import { create } from 'zustand'

interface RetroModeStore {
  active: boolean
  init: () => void
  setActive: (active: boolean) => void
}

function applyRetroMode(active: boolean) {
  if (typeof document === 'undefined') return
  if (active) document.documentElement.setAttribute('data-retro', 'true')
  else document.documentElement.removeAttribute('data-retro')
}

export const useRetroMode = create<RetroModeStore>((set, get) => ({
  active: false,
  init: () => {
    let active = get().active
    try {
      active = sessionStorage.getItem('retro-mode') === 'true'
    } catch {
      // The easter egg remains usable when browser storage is blocked.
      active ||= document.documentElement.dataset.retro === 'true'
    }
    applyRetroMode(active)
    set({ active })
  },
  setActive: (active) => {
    applyRetroMode(active)
    try {
      if (active) sessionStorage.setItem('retro-mode', 'true')
      else sessionStorage.removeItem('retro-mode')
    } catch {
      // Persistence is optional; changing the presentation is not.
    }
    set({ active })
  },
}))
