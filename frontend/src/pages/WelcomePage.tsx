// Page de bienvenue / Onboarding — 3 slides avec animations
// Reproduit le design de l'app mobile avec fond sombre, particules, icônes glowing

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Box, ScanBarcode, Building2 } from 'lucide-react'

// ─── Données des slides ────────────────────────────────────────
const slides = [
  {
    id: 0,
    title: 'Bienvenue sur',
    titleAccent: 'IT-Inventory',
    description:
      'Gérez votre stock de consommables informatiques avec simplicité et efficacité.',
    icon: Box,
    iconColor: 'from-blue-500 to-blue-600',
    glowColor: 'rgba(59,130,246,0.35)',
    ringColor: 'border-blue-500/30',
  },
  {
    id: 1,
    title: 'Scan en un',
    titleAccent: 'instant',
    description:
      'Utilisez la caméra de votre téléphone pour scanner et identifier vos articles en une seconde.',
    icon: ScanBarcode,
    iconColor: 'from-blue-500 to-indigo-500',
    glowColor: 'rgba(99,102,241,0.35)',
    ringColor: 'border-indigo-500/30',
    scanLine: true,
  },
  {
    id: 2,
    title: 'Gestion',
    titleAccent: 'multi-sites',
    description:
      'Gérez les stocks de plusieurs entrepôts et effectuez des transferts en toute simplicité.',
    icon: Building2,
    iconColor: 'from-amber-500 to-orange-500',
    glowColor: 'rgba(245,158,11,0.35)',
    ringColor: 'border-amber-500/30',
    multiIcon: true,
  },
]

// ─── Particule flottante ────────────────────────────────────────
function Particle({ delay, x, y, size }: { delay: number; x: number; y: number; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full bg-[var(--sidebar-hover)]"
      style={{ width: size, height: size, left: `${x}%`, top: `${y}%` }}
      animate={{
        y: [0, -30, 0],
        opacity: [0.15, 0.5, 0.15],
        scale: [1, 1.3, 1],
      }}
      transition={{
        duration: 4 + Math.random() * 3,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
}

// ─── Composant principal ────────────────────────────────────────
export default function WelcomePage() {
  const navigate = useNavigate()
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)
  const isLast = current === slides.length - 1
  const slide = slides[current]!

  // Générer les particules une seule fois
  const particles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        delay: Math.random() * 4,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 2 + Math.random() * 3,
      })),
    []
  )

  const finish = useCallback(() => {
    localStorage.setItem('it-inventory-onboarding-seen', 'true')
    navigate('/login', { replace: true })
  }, [navigate])

  const next = useCallback(() => {
    if (isLast) {
      finish()
    } else {
      setDirection(1)
      setCurrent((c) => c + 1)
    }
  }, [isLast, finish])

  const skip = useCallback(() => {
    finish()
  }, [finish])

  // Navigation au clavier
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') next()
      if (e.key === 'ArrowLeft' && current > 0) {
        setDirection(-1)
        setCurrent((c) => c - 1)
      }
      if (e.key === 'Escape') skip()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [next, skip, current])

  // Variants pour les animations de slide
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
      scale: 0.9,
    }),
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden select-none">
      {/* ── Fond dégradé ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.06)_0%,transparent_70%)]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.04)_0%,transparent_70%)]" />
      </div>

      {/* ── Particules flottantes ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <Particle key={p.id} {...p} />
        ))}
      </div>

      {/* ── Indicateurs (dots) ── */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-2.5 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setDirection(i > current ? 1 : -1)
              setCurrent(i)
            }}
            className="group p-1"
            aria-label={`Slide ${i + 1}`}
          >
            <motion.div
              className="rounded-full"
              animate={{
                width: i === current ? 28 : 8,
                height: 8,
                backgroundColor: i === current ? '#3B82F6' : 'rgba(255,255,255,0.2)',
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          </button>
        ))}
      </div>

      {/* ── Contenu principal animé ── */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-lg px-6">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={slide.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="flex flex-col items-center text-center w-full"
          >
            {/* ── Icône avec glow ── */}
            <div className="relative mb-12">
              {/* Halo */}
              <motion.div
                className={`absolute inset-[-30px] rounded-full border-2 ${slide.ringColor}`}
                animate={{ scale: [1, 1.06, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className={`absolute inset-[-55px] rounded-full border ${slide.ringColor} opacity-20`}
                animate={{ scale: [1, 1.04, 1], opacity: [0.15, 0.3, 0.15] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              />

              {/* Glow derrière l'icône */}
              <div
                className="absolute inset-0 rounded-3xl blur-2xl"
                style={{ background: slide.glowColor, transform: 'scale(1.5)' }}
              />

              {/* Conteneur icône */}
              <motion.div
                className={`relative w-32 h-32 rounded-3xl bg-gradient-to-br ${slide.iconColor} flex items-center justify-center shadow-2xl`}
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <slide.icon className="w-16 h-16 text-white" strokeWidth={1.5} />

                {/* Ligne de scan animée (slide 2) */}
                {slide.scanLine && (
                  <motion.div
                    className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent rounded-full"
                    animate={{ top: ['25%', '75%', '25%'] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
              </motion.div>

              {/* Icônes secondaires (slide 3 — multi-sites) */}
              {slide.multiIcon && (
                <>
                  <motion.div
                    className="absolute -bottom-4 -left-10 w-12 h-12 rounded-xl bg-surface-elevated border border-blue-500/30 flex items-center justify-center"
                    animate={{ y: [0, -4, 0], x: [0, -2, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                  >
                    <Building2 className="w-6 h-6 text-blue-400" strokeWidth={1.5} />
                  </motion.div>
                  <motion.div
                    className="absolute -bottom-4 -right-10 w-12 h-12 rounded-xl bg-surface-elevated border border-blue-500/30 flex items-center justify-center"
                    animate={{ y: [0, -4, 0], x: [0, 2, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                  >
                    <Building2 className="w-6 h-6 text-blue-400" strokeWidth={1.5} />
                  </motion.div>
                </>
              )}
            </div>

            {/* ── Titre ── */}
            <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary leading-tight tracking-tight mb-5">
              {slide.title}
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                {slide.titleAccent}
              </span>
            </h1>

            {/* ── Description ── */}
            <p className="text-text-secondary text-base md:text-lg leading-relaxed max-w-sm">
              {slide.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Boutons en bas ── */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 w-full max-w-sm px-6 z-20">
        <motion.button
          onClick={next}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold text-lg shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-shadow duration-300 cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          {isLast ? 'Commencer' : 'Suivant'}
        </motion.button>

        {!isLast && (
          <motion.button
            onClick={skip}
            className="text-text-muted hover:text-text-secondary text-sm font-semibold tracking-widest uppercase transition-colors cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Passer
          </motion.button>
        )}
      </div>
    </div>
  )
}
