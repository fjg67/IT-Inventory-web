// Store du site sélectionné — Zustand + localStorage

import { create } from 'zustand'
import type { Site } from '@/types'

interface SiteState {
  selectedSite: Site | null
  setSelectedSite: (site: Site) => void
  clearSelectedSite: () => void
}

const STORAGE_KEY = 'it-inventory-selected-site'

function loadSite(): Site | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const useSiteStore = create<SiteState>((set) => ({
  selectedSite: loadSite(),

  setSelectedSite: (site) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(site))
    set({ selectedSite: site })
  },

  clearSelectedSite: () => {
    localStorage.removeItem(STORAGE_KEY)
    set({ selectedSite: null })
  },
}))
