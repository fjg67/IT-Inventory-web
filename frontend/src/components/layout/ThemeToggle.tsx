// ThemeToggle — bouton animé pour basculer entre mode clair et sombre
// Design moderne avec animation soleil/lune

import { motion, AnimatePresence } from 'framer-motion'
import { useThemeStore } from '@/stores/themeStore'

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore()
  const isDark = theme === 'dark'

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative h-9 w-9 flex items-center justify-center rounded-xl
                 hover:bg-[var(--sidebar-hover)] transition-colors duration-200 cursor-pointer"
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      aria-label={isDark ? 'Activer le mode clair' : 'Activer le mode sombre'}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ scale: 0, rotate: -90, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0, rotate: 90, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="relative"
          >
            {/* Lune */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              className="text-blue-300"
            >
              <motion.path
                d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              />
            </svg>
            {/* Étoiles */}
            {[
              { x: -8, y: -6, size: 2, delay: 0.2 },
              { x: 8, y: -8, size: 1.5, delay: 0.3 },
              { x: 10, y: 4, size: 1.5, delay: 0.25 },
            ].map((star, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-blue-300"
                style={{
                  width: star.size,
                  height: star.size,
                  top: '50%',
                  left: '50%',
                }}
                initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                animate={{
                  x: star.x,
                  y: star.y,
                  opacity: [0, 1, 0.6, 1],
                  scale: 1,
                }}
                transition={{
                  duration: 0.4,
                  delay: star.delay,
                  ease: 'easeOut',
                }}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ scale: 0, rotate: 90, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0, rotate: -90, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="relative"
          >
            {/* Soleil */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              className="text-amber-500"
            >
              <circle cx="12" cy="12" r="5" fill="currentColor" />
              {/* Rayons */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
                const rad = (angle * Math.PI) / 180
                const x1 = 12 + Math.cos(rad) * 8
                const y1 = 12 + Math.sin(rad) * 8
                const x2 = 12 + Math.cos(rad) * 10.5
                const y2 = 12 + Math.sin(rad) * 10.5
                return (
                  <motion.line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={{ opacity: 0, pathLength: 0 }}
                    animate={{ opacity: 1, pathLength: 1 }}
                    transition={{ duration: 0.3, delay: 0.05 * i }}
                  />
                )
              })}
            </svg>
            {/* Glow effect */}
            <motion.div
              className="absolute inset-[-4px] rounded-full bg-amber-400/20 blur-md"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
