// ThemeToggle — Switch animé pour la sidebar
// Petit toggle switch : icône Moon ↔ Sun avec animation spring

import { motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      className="
        relative flex items-center
        w-14 h-7
        rounded-full
        border border-border
        bg-surface-elevated
        hover:border-[var(--border)]
        focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
        focus-visible:ring-offset-background
        transition-colors duration-200
        cursor-pointer
      "
    >
      {/* Track qui change de couleur */}
      <div className={`
        absolute inset-0 rounded-full transition-colors duration-300
        ${isDark ? 'bg-surface-elevated' : 'bg-blue-50'}
      `} />

      {/* Thumb qui glisse */}
      <motion.div
        layout
        animate={{ x: isDark ? 2 : 30 }}
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        className="
          relative z-10
          flex items-center justify-center
          w-5 h-5 rounded-full
          bg-surface
          shadow-sm
          border border-border
        "
      >
        <motion.div
          animate={{ rotate: isDark ? 0 : 180, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {isDark
            ? <Moon size={11} className="text-blue-300" />
            : <Sun size={11} className="text-amber-500" />
          }
        </motion.div>
      </motion.div>

      {/* Label accessibilité */}
      <span className="sr-only">
        {isDark ? 'Mode sombre actif' : 'Mode clair actif'}
      </span>
    </button>
  )
}
