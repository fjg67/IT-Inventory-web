// ThemeButton — Bouton icône rond animé pour la TopBar
// Bascule dark ↔ light avec animation de rotation

import { motion, AnimatePresence } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

export function ThemeButton() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Mode clair' : 'Mode sombre'}
      title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      className="
        relative
        w-9 h-9 rounded-xl
        flex items-center justify-center
        bg-surface border border-border
        hover:bg-[var(--sidebar-hover)] hover:border-[var(--border)]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
        transition-colors duration-200
        cursor-pointer overflow-hidden
      "
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ opacity: 0, rotate: -30, scale: 0.7 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 30, scale: 0.7 }}
            transition={{ duration: 0.2 }}
          >
            <Moon size={16} className="text-text-secondary" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ opacity: 0, rotate: 30, scale: 0.7 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -30, scale: 0.7 }}
            transition={{ duration: 0.2 }}
          >
            <Sun size={16} className="text-amber-500" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  )
}
