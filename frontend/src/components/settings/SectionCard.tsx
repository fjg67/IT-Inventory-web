// SectionCard — wrapper glassmorphism réutilisable pour la page paramètres

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SectionCardProps {
  children: React.ReactNode
  label?: string
  accentColor?: string
  className?: string
  delay?: number
}

export function SectionCard({
  children,
  label,
  accentColor = 'bg-indigo-500',
  className,
  delay = 0,
}: SectionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        'rounded-xl overflow-hidden',
        'border border-white/[0.06]',
        'bg-[#0E1520]',
        'shadow-[0_1px_3px_rgba(0,0,0,0.5),0_8px_24px_rgba(0,0,0,0.3)]',
        className
      )}
    >
      {/* Label de section avec barre accent */}
      {label && (
        <div className="flex items-center gap-2.5 px-5 pt-5 pb-3">
          <div className={cn('w-[3px] h-3.5 rounded-full', accentColor)} />
          <span
            className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            {label}
          </span>
        </div>
      )}
      {children}
    </motion.div>
  )
}
