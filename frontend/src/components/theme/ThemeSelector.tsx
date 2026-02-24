// ThemeSelector — Sélecteur 3 options : Sombre | Système | Clair
// À utiliser dans la page Paramètres

import { motion } from 'framer-motion'
import { Moon, Monitor, Sun } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import type { Theme } from '../../types/theme'

const OPTIONS: { value: Theme; label: string; icon: typeof Moon }[] = [
  { value: 'dark',   label: 'Sombre',  icon: Moon    },
  { value: 'system', label: 'Système', icon: Monitor },
  { value: 'light',  label: 'Clair',   icon: Sun     },
]

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()

  return (
    <div
      role="radiogroup"
      aria-label="Thème de l'application"
      className="
        flex items-center
        bg-surface-elevated border border-border
        rounded-xl p-1 gap-1
        w-fit
      "
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const isActive = theme === value
        return (
          <button
            key={value}
            role="radio"
            aria-checked={isActive}
            onClick={() => setTheme(value)}
            className={`
              relative flex items-center gap-2
              px-4 py-2 rounded-lg
              text-sm font-medium
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
              transition-colors duration-200 cursor-pointer
              z-10
              ${isActive ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'}
            `}
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            {/* Background animé qui glisse sous l'option active */}
            {isActive && (
              <motion.div
                layoutId="theme-selector-bg"
                className="
                  absolute inset-0 rounded-lg
                  bg-surface border border-border
                  shadow-sm
                "
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">
              <Icon size={14} />
            </span>
            <span className="relative z-10">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
