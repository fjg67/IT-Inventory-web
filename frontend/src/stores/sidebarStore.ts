// Store de la sidebar — Zustand
// Gère l'état ouvert/fermé de la sidebar et le nombre d'alertes

import { create } from 'zustand'

interface SidebarState {
  isOpen: boolean
  alertCount: number
  toggle: () => void
  setOpen: (open: boolean) => void
  setAlertCount: (count: number) => void
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: true,
  alertCount: 0,

  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  setOpen: (open) => set({ isOpen: open }),
  setAlertCount: (count) => set({ alertCount: count }),
}))
