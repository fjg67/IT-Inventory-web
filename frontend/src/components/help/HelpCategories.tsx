// Help Categories — Grille de 6 catégories avec icônes et compteurs
// Design : glassmorphism cards, glow on hover, ring borders

import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { HELP_CATEGORIES } from '@/data/helpData'

interface HelpCategoriesProps {
  onCategoryClick?: (categoryId: string) => void
}

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
}

const cardVariant = {
  hidden: { opacity: 0, y: 14, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
  },
}

export function HelpCategories({ onCategoryClick }: HelpCategoriesProps) {
  return (
    <section className="space-y-4">
      {/* Section header */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <h2 className="text-[13px] font-semibold text-slate-400 uppercase tracking-widest font-['Outfit']">
          Parcourir par catégorie
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>

      {/* Grid */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
      >
        {HELP_CATEGORIES.map((cat) => {
          const Icon = cat.icon
          return (
            <motion.button
              key={cat.id}
              variants={cardVariant}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onCategoryClick?.(cat.id)}
              className={`
                group relative flex items-start gap-3.5 p-4 rounded-2xl text-left
                bg-white/[0.02] backdrop-blur-xl
                border border-white/[0.06]
                hover:border-white/[0.1] hover:bg-white/[0.04]
                transition-all duration-300
              `}
              style={{
                boxShadow: 'none',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLElement).style.boxShadow = `0 0 32px ${cat.colorGlow}`
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
              }}
            >
              {/* Icon */}
              <div
                className={`
                  w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                  ${cat.colorBg} border ${cat.colorBorder}
                `}
              >
                <Icon className={`h-4.5 w-4.5 ${cat.color}`} />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-200 font-['Outfit'] truncate">
                    {cat.title}
                  </h3>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-[12px] text-slate-500 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              {/* Count badge */}
              <span className="text-[10px] font-['JetBrains_Mono'] font-medium text-slate-600 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.06] shrink-0 mt-0.5">
                {cat.count}
              </span>
            </motion.button>
          )
        })}
      </motion.div>
    </section>
  )
}
