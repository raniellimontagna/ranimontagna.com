import { create } from 'zustand'

interface CommandMenuState {
  isOpen: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
}

export const useCommandMenu = create<CommandMenuState>((set) => ({
  isOpen: false,
  setOpen: (open) => set({ isOpen: open }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}))
