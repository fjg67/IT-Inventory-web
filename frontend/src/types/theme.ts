// Types du système de thème Dark / Light / System

export type Theme = 'dark' | 'light' | 'system'
// 'system' = utilise prefers-color-scheme en temps réel

export interface ThemeContextValue {
  theme: Theme                        // Préférence choisie par l'utilisateur
  resolvedTheme: 'dark' | 'light'    // Thème réellement appliqué
  setTheme: (theme: Theme) => void
  toggleTheme: () => void             // Bascule dark ↔ light directement
  isDark: boolean                     // Raccourci booléen
}
