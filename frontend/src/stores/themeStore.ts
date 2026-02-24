// Store du thème — Zustand
// Gère le mode clair/sombre avec persistance dans localStorage

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'dark',

      setTheme: (theme) => {
        set({ theme })
        applyTheme(theme)
      },

      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark'
        set({ theme: next })
        applyTheme(next)
      },
    }),
    {
      name: 'it-inventory-theme',
      onRehydrateStorage: () => {
        return (state) => {
          if (state) {
            applyTheme(state.theme)
          }
        }
      },
    }
  )
)

function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
    root.classList.remove('light')
  } else {
    root.classList.add('light')
    root.classList.remove('dark')
  }
}

// Appliquer le thème au chargement initial
const initialTheme = (() => {
  try {
    const stored = localStorage.getItem('it-inventory-theme')
    if (stored) {
      const parsed = JSON.parse(stored)
      return parsed?.state?.theme || 'dark'
    }
  } catch {}
  return 'dark'
})()
applyTheme(initialTheme)
