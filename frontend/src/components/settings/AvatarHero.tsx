// AvatarHero — section profil hero complète, style "Dark Command Center"

import { motion } from 'framer-motion'
import { Wrench } from 'lucide-react'
import { StatusBadge } from './StatusBadge'

interface AvatarHeroProps {
  initials: string
  role: string
  isActive: boolean
}

export function AvatarHero({ initials, role, isActive }: AvatarHeroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_1px_3px_rgba(0,0,0,0.5),0_8px_24px_rgba(0,0,0,0.3)]"
    >
      {/* Orbe décoratif derrière l'avatar */}
      <div
        className="absolute top-[-40px] left-1/2 -translate-x-1/2 w-[200px] h-[200px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
        }}
      />

      {/* Contenu principal */}
      <div className="relative z-10 flex flex-col items-center gap-4 px-6 py-7">
        {/* Avatar avec ring animé */}
        <div className="relative">
          {/* Ring SVG animé */}
          <motion.svg
            className="absolute -inset-[10px] w-[calc(100%+20px)] h-[calc(100%+20px)]"
            viewBox="0 0 108 108"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            <circle
              cx="54"
              cy="54"
              r="52"
              fill="none"
              stroke="rgba(99,102,241,0.3)"
              strokeWidth="1"
              strokeDasharray="4 6"
            />
          </motion.svg>

          {/* Avatar cercle */}
          <div
            className="relative flex h-[88px] w-[88px] items-center justify-center rounded-full"
            style={{
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)',
              boxShadow:
                '0 0 0 3px rgba(99,102,241,0.2), 0 0 0 6px rgba(99,102,241,0.08), 0 8px 32px rgba(99,102,241,0.4)',
            }}
          >
            <span
              className="text-[32px] font-extrabold text-white select-none"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              {initials}
            </span>
          </div>
        </div>

        {/* Initiales */}
        <h2
          className="text-[20px] font-bold text-text-primary tracking-wide"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          {initials}
        </h2>

        {/* Badges rôle + statut */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 bg-indigo-500/[0.1] border-indigo-500/30">
            <Wrench className="h-3 w-3 text-indigo-300" />
            <span
              className="text-[12px] font-medium text-indigo-300"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              {role === 'ADMIN' ? 'Administrateur' : 'Technicien'}
            </span>
          </span>

          {isActive && <StatusBadge label="Compte Actif" type="success" pulse />}
        </div>
      </div>

      {/* Ligne décorative bas du hero */}
      <div
        className="absolute bottom-0 left-[20%] right-[20%] h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.4), transparent)',
        }}
      />
    </motion.div>
  )
}
