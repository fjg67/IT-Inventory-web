// ThemeContext — Contexte React pour le système de thème Dark / Light / System
// Source unique de vérité pour le thème de l'application
// Gère la persistance localStorage, la détection système et l'application sur <html>

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { Theme, ThemeContextValue } from '../types/theme'

const STORAGE_KEY = 'it-inventory-theme'

const ThemeContext = createContext<ThemeContextValue | null>(null)

/**
 * Résout le thème réel ('dark' | 'light') à partir de la préférence
 */
function resolveTheme(theme: Theme): 'dark' | 'light' {
  if (theme === 'dark') return 'dark'
  if (theme === 'light') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * Applique la classe du thème sur <html>
 */
function applyToDOM(resolved: 'dark' | 'light') {
  const html = document.documentElement
  html.classList.remove('dark', 'light')
  html.classList.add(resolved)
  html.setAttribute('data-theme', resolved)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialiser depuis localStorage (le script anti-flash a déjà appliqué la classe)
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
    if (stored === 'dark' || stored === 'light' || stored === 'system') return stored
    return 'system'
  })

  // Résoudre le thème réel (dark ou light)
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
    const pref = stored === 'dark' || stored === 'light' || stored === 'system' ? stored : 'system'
    return resolveTheme(pref)
  })

  // Appliquer le thème au DOM et mettre à jour le state
  const applyTheme = useCallback((resolved: 'dark' | 'light') => {
    applyToDOM(resolved)
    setResolvedTheme(resolved)
  }, [])

  // Écouter les changements de préférence système
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        applyTheme(e.matches ? 'dark' : 'light')
      }
    }
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [theme, applyTheme])

  // Appliquer le thème initial (sync avec le script anti-flash)
  useEffect(() => {
    applyTheme(resolveTheme(theme))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem(STORAGE_KEY, newTheme)
    applyTheme(resolveTheme(newTheme))
  }, [applyTheme])

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }, [resolvedTheme, setTheme])

  return (
    <ThemeContext.Provider value={{
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme,
      isDark: resolvedTheme === 'dark',
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * Hook pour accéder au contexte du thème
 * Doit être utilisé à l'intérieur de <ThemeProvider>
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme doit être utilisé à l\'intérieur de <ThemeProvider>')
  return ctx
}
