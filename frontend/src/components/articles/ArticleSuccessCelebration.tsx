// Article creation success celebration — Premium cinematic animation
// Fullscreen overlay with animated checkmark, particle burst, glow rings, and article name reveal

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'

// ─── Types ───
interface ArticleSuccessCelebrationProps {
  show: boolean
  articleName?: string
  onComplete: () => void
}

// ─── Confetti particle ───
function ConfettiParticle({ delay, index }: { delay: number; index: number }) {
  const angle = (index / 40) * Math.PI * 2
  const distance = 120 + Math.random() * 200
  const x = Math.cos(angle) * distance
  const y = Math.sin(angle) * distance - 60
  const size = 4 + Math.random() * 6
  const rotation = Math.random() * 720 - 360

  const colors = [
    'bg-blue-400', 'bg-indigo-400', 'bg-cyan-400', 'bg-emerald-400',
    'bg-amber-400', 'bg-violet-400', 'bg-pink-400', 'bg-teal-400',
  ]
  const color = colors[index % colors.length]

  const shapes = ['rounded-full', 'rounded-sm', 'rounded-none']
  const shape = shapes[index % shapes.length]

  return (
    <motion.div
      className={`absolute ${color} ${shape}`}
      style={{
        width: size,
        height: index % 3 === 0 ? size : size * 2,
        left: '50%',
        top: '50%',
      }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 0, rotate: 0 }}
      animate={{
        x,
        y: [0, y - 40, y + 100],
        opacity: [1, 1, 0],
        scale: [0, 1.2, 0.6],
        rotate: rotation,
      }}
      transition={{
        duration: 1.6 + Math.random() * 0.6,
        delay: delay + 0.3,
        ease: [0.22, 1.0, 0.36, 1.0],
      }}
    />
  )
}

// ─── Glowing ring ───
function GlowRing({ delay, size, color }: { delay: number; size: number; color: string }) {
  return (
    <motion.div
      className="absolute left-1/2 top-1/2 rounded-full"
      style={{
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        border: `2px solid ${color}`,
        boxShadow: `0 0 30px ${color}, inset 0 0 30px ${color}`,
      }}
      initial={{ scale: 0, opacity: 0.8 }}
      animate={{ scale: [0, 1.8, 2.5], opacity: [0.8, 0.3, 0] }}
      transition={{ duration: 1.4, delay, ease: 'easeOut' }}
    />
  )
}

// ─── Sparkle dot ───
function SparkleDot({ delay, x, y }: { delay: number; x: number; y: number }) {
  return (
    <motion.div
      className="absolute w-1.5 h-1.5 rounded-full bg-white"
      style={{ left: `${50 + x}%`, top: `${50 + y}%` }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 0],
        scale: [0, 1.5, 0],
      }}
      transition={{ duration: 0.8, delay, ease: 'easeOut' }}
    />
  )
}

// ─── Main component ───
export function ArticleSuccessCelebration({ show, articleName, onComplete }: ArticleSuccessCelebrationProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        setTimeout(onComplete, 400)
      }, 2800)
      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  // Genate particles once
  const confetti = useMemo(
    () => Array.from({ length: 40 }, (_, i) => ({ id: i, delay: Math.random() * 0.2 })),
    []
  )

  const sparkles = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        delay: 0.4 + Math.random() * 0.6,
        x: (Math.random() - 0.5) * 60,
        y: (Math.random() - 0.5) * 60,
      })),
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
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-background/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Center content */}
          <div className="relative flex flex-col items-center">

            {/* Glow rings */}
            <GlowRing delay={0.1} size={140} color="rgba(59,130,246,0.5)" />
            <GlowRing delay={0.2} size={200} color="rgba(99,102,241,0.3)" />
            <GlowRing delay={0.35} size={280} color="rgba(34,211,238,0.15)" />

            {/* Confetti burst */}
            {confetti.map((p) => (
              <ConfettiParticle key={p.id} index={p.id} delay={p.delay} />
            ))}

            {/* Sparkle dots */}
            {sparkles.map((s) => (
              <SparkleDot key={s.id} delay={s.delay} x={s.x} y={s.y} />
            ))}

            {/* Main checkmark circle */}
            <motion.div
              className="relative"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 15,
                delay: 0.1,
              }}
            >
              {/* Outer glow */}
              <div className="absolute inset-[-20px] rounded-full bg-emerald-500/20 blur-2xl" />

              {/* Rotating ring */}
              <motion.div
                className="absolute inset-[-12px] rounded-full"
                style={{
                  background: 'conic-gradient(from 0deg, transparent, rgba(16,185,129,0.4), transparent, rgba(59,130,246,0.4), transparent)',
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />

              {/* Circle background */}
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-[0_0_60px_rgba(16,185,129,0.4)] flex items-center justify-center">
                {/* Checkmark icon */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <Check className="w-12 h-12 text-white" strokeWidth={3} />
                </motion.div>
              </div>
            </motion.div>

            {/* Success text */}
            <motion.div
              className="mt-8 flex flex-col items-center gap-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.5 }}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h2 className="text-xl font-bold text-text-primary tracking-tight font-['Outfit',sans-serif]">
                  Article créé avec succès
                </h2>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              {articleName && (
                <motion.p
                  className="text-sm text-blue-300/80 font-medium font-mono tracking-wide"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.75 }}
                >
                  {articleName}
                </motion.p>
              )}
            </motion.div>

            {/* Bottom shine bar */}
            <motion.div
              className="mt-6 h-1 rounded-full overflow-hidden w-48"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <motion.div
                className="h-full w-full rounded-full bg-gradient-to-r from-blue-500 via-emerald-400 to-cyan-400"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                style={{ backgroundSize: '200% 100%' }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
