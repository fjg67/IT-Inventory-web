// Movement success celebration — Cinematic animation after stock movement
// Adapts colors and icon to movement type (entry/exit/transfer)

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogIn, LogOut, ArrowLeftRight, Sparkles } from 'lucide-react'

type MovementType = 'ENTRY' | 'EXIT' | 'TRANSFER' | 'ADJUSTMENT'

interface MovementSuccessCelebrationProps {
  show: boolean
  type: MovementType
  articleName?: string
  quantity?: number
  onComplete: () => void
}

const TYPE_CONFIG: Record<MovementType, {
  label: string
  icon: typeof LogIn
  gradient: string
  glow: string
  particleColors: string[]
  ring: string
}> = {
  ENTRY: {
    label: 'Entrée enregistrée',
    icon: LogIn,
    gradient: 'from-emerald-500 to-emerald-600',
    glow: 'rgba(16,185,129,0.4)',
    particleColors: ['bg-emerald-400', 'bg-green-400', 'bg-teal-400', 'bg-cyan-400', 'bg-lime-400'],
    ring: 'rgba(16,185,129,0.4)',
  },
  EXIT: {
    label: 'Sortie enregistrée',
    icon: LogOut,
    gradient: 'from-red-500 to-rose-600',
    glow: 'rgba(239,68,68,0.4)',
    particleColors: ['bg-red-400', 'bg-rose-400', 'bg-orange-400', 'bg-pink-400', 'bg-amber-400'],
    ring: 'rgba(239,68,68,0.4)',
  },
  TRANSFER: {
    label: 'Transfert effectué',
    icon: ArrowLeftRight,
    gradient: 'from-violet-500 to-purple-600',
    glow: 'rgba(139,92,246,0.4)',
    particleColors: ['bg-violet-400', 'bg-purple-400', 'bg-indigo-400', 'bg-fuchsia-400', 'bg-blue-400'],
    ring: 'rgba(139,92,246,0.4)',
  },
  ADJUSTMENT: {
    label: 'Ajustement effectué',
    icon: ArrowLeftRight,
    gradient: 'from-amber-500 to-orange-600',
    glow: 'rgba(245,158,11,0.4)',
    particleColors: ['bg-amber-400', 'bg-orange-400', 'bg-yellow-400', 'bg-red-400', 'bg-lime-400'],
    ring: 'rgba(245,158,11,0.4)',
  },
}

// ─── Particle ───
function Particle({ index, colors, delay }: { index: number; colors: string[]; delay: number }) {
  const angle = (index / 30) * Math.PI * 2
  const distance = 100 + Math.random() * 160
  const x = Math.cos(angle) * distance
  const y = Math.sin(angle) * distance - 40
  const size = 3 + Math.random() * 5
  const rotation = Math.random() * 540 - 270
  const color = colors[index % colors.length]
  const shapes = ['rounded-full', 'rounded-sm', 'rounded-none']
  const shape = shapes[index % shapes.length]

  return (
    <motion.div
      className={`absolute ${color} ${shape}`}
      style={{
        width: size,
        height: index % 3 === 0 ? size : size * 1.8,
        left: '50%',
        top: '50%',
      }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 0, rotate: 0 }}
      animate={{
        x,
        y: [0, y - 30, y + 80],
        opacity: [1, 1, 0],
        scale: [0, 1.2, 0.5],
        rotate: rotation,
      }}
      transition={{
        duration: 1.4 + Math.random() * 0.5,
        delay: delay + 0.25,
        ease: [0.22, 1.0, 0.36, 1.0],
      }}
    />
  )
}

// ─── Expanding ring ───
function ExpandRing({ delay, size, color }: { delay: number; size: number; color: string }) {
  return (
    <motion.div
      className="absolute left-1/2 top-1/2 rounded-full"
      style={{
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        border: `2px solid ${color}`,
        boxShadow: `0 0 25px ${color}`,
      }}
      initial={{ scale: 0, opacity: 0.7 }}
      animate={{ scale: [0, 1.6, 2.2], opacity: [0.7, 0.25, 0] }}
      transition={{ duration: 1.2, delay, ease: 'easeOut' }}
    />
  )
}

// ─── Main component ───
export function MovementSuccessCelebration({
  show,
  type,
  articleName,
  quantity,
  onComplete,
}: MovementSuccessCelebrationProps) {
  const [visible, setVisible] = useState(false)
  const config = TYPE_CONFIG[type]
  const Icon = config.icon

  useEffect(() => {
    if (show) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        setTimeout(onComplete, 350)
      }, 2400)
      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  const particles = useMemo(
    () => Array.from({ length: 30 }, (_, i) => ({ id: i, delay: Math.random() * 0.15 })),
    []
  )

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-[#080d1c]/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Center */}
          <div className="relative flex flex-col items-center">
            {/* Expanding rings */}
            <ExpandRing delay={0.1} size={120} color={config.ring} />
            <ExpandRing delay={0.2} size={180} color={config.ring.replace('0.4', '0.2')} />
            <ExpandRing delay={0.35} size={250} color={config.ring.replace('0.4', '0.1')} />

            {/* Particles */}
            {particles.map((p) => (
              <Particle key={p.id} index={p.id} colors={config.particleColors} delay={p.delay} />
            ))}

            {/* Icon circle */}
            <motion.div
              className="relative"
              initial={{ scale: 0, rotate: -120 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 0.08 }}
            >
              {/* Outer glow */}
              <div
                className="absolute inset-[-18px] rounded-full blur-2xl"
                style={{ backgroundColor: config.glow }}
              />

              {/* Spinning halo */}
              <motion.div
                className="absolute inset-[-10px] rounded-full opacity-60"
                style={{
                  background: `conic-gradient(from 0deg, transparent, ${config.ring}, transparent)`,
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
              />

              {/* Circle */}
              <div className={`relative w-20 h-20 rounded-full bg-gradient-to-br ${config.gradient} shadow-2xl flex items-center justify-center`}>
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.35, type: 'spring', stiffness: 300, damping: 18 }}
                >
                  <Icon className="w-10 h-10 text-white" strokeWidth={2.5} />
                </motion.div>
              </div>
            </motion.div>

            {/* Text */}
            <motion.div
              className="mt-7 flex flex-col items-center gap-1.5"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <h2 className="text-lg font-bold text-white tracking-tight font-['Outfit',sans-serif]">
                  {config.label}
                </h2>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </div>

              {articleName && (
                <motion.p
                  className="text-xs text-white/60 font-medium font-mono tracking-wide"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 }}
                >
                  {articleName}
                  {quantity && quantity > 0 && (
                    <span className="ml-2 text-white/40">×{quantity}</span>
                  )}
                </motion.p>
              )}
            </motion.div>

            {/* Bottom bar */}
            <motion.div
              className="mt-5 h-0.5 rounded-full overflow-hidden w-40"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <motion.div
                className={`h-full w-full rounded-full bg-gradient-to-r ${config.gradient}`}
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                style={{ backgroundSize: '200% 100%' }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
