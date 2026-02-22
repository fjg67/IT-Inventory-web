// Store de la sidebar — Zustand
// Gère l'état ouvert/fermé de la sidebar, le drawer mobile et le nombre d'alertes

import { create } from 'zustand'

interface SidebarState {
  isOpen: boolean
  isMobileOpen: boolean
  alertCount: number
  toggle: () => void
  setOpen: (open: boolean) => void
  setMobileOpen: (open: boolean) => void
  setAlertCount: (count: number) => void
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: true,
  isMobileOpen: false,
  alertCount: 0,

  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  setOpen: (open) => set({ isOpen: open }),
  setMobileOpen: (open) => set({ isMobileOpen: open }),
  setAlertCount: (count) => set({ alertCount: count }),
}))
