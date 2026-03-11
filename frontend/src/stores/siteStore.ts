// Store du site sélectionné — Zustand + localStorage

import { create } from 'zustand'
import type { Site } from '@/types'

interface SiteState {
  selectedSite: Site | null
  filterSiteName: string
  setSelectedSite: (site: Site) => void
  clearSelectedSite: () => void
  setFilterSiteName: (name: string) => void
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
  filterSiteName: loadSite()?.name ?? 'Tous les sites',

  setSelectedSite: (site) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(site))
    set({ selectedSite: site, filterSiteName: site.name })
  },

  clearSelectedSite: () => {
    localStorage.removeItem(STORAGE_KEY)
    set({ selectedSite: null, filterSiteName: 'Tous les sites' })
  },

  setFilterSiteName: (name) => set({ filterSiteName: name }),
}))
