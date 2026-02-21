// Sidebar sticky — navigation chapitres, barre de progression, liens rapides
// Design : left border active, glow highlight, progress gradient bar

import { motion, useSpring, useTransform } from 'framer-motion'
import { LifeBuoy, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface SidebarItem {
  id: string
  number: string
  label: string
}

interface TermsSidebarProps {
  items: SidebarItem[]
  activeChapter: string
  readingProgress: number
  onChapterClick: (id: string) => void
}

export function TermsSidebar({
  items,
  activeChapter,
  readingProgress,
  onChapterClick,
}: TermsSidebarProps) {
  const navigate = useNavigate()

  // Spring animée pour la barre de progression
  const springProgress = useSpring(readingProgress, {
    stiffness: 60,
    damping: 20,
  })
  const progressWidth = useTransform(springProgress, (v) => `${v}%`)

  return (
    <aside className="hidden md:block sticky top-6 self-start space-y-5">
      {/* Titre */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-['Outfit'] font-bold tracking-[0.15em] uppercase text-slate-500">
          Dans ce document
        </span>
        <div className="h-px bg-white/[0.06] flex-1" />
      </div>

      {/* Barre de progression lecture */}
      <div className="h-[3px] rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
          style={{ width: progressWidth }}
        />
      </div>

      {/* Navigation chapitres */}
      <nav className="space-y-0.5">
        {items.map((item) => {
          const isActive = activeChapter === item.id
          return (
            <button
              key={item.id}
              onClick={() => onChapterClick(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-left
                border-l-2 transition-all duration-150
                ${
                  isActive
                    ? 'bg-blue-500/[0.06] border-l-blue-500 text-blue-400 font-semibold shadow-[inset_0_0_0_1px_rgba(59,130,246,0.1)]'
                    : 'border-l-transparent text-slate-500 hover:bg-white/[0.03] hover:text-slate-300 hover:border-l-blue-500/20'
                }
              `}
            >
              <span className="text-[11px] font-['JetBrains_Mono'] text-slate-600 mr-0.5">
                {item.number}
              </span>
              <span className="text-[13px] font-['Outfit'] truncate">
                {item.label}
              </span>
            </button>
          )
        })}
      </nav>

      {/* Séparateur */}
      <div className="h-px bg-white/[0.06]" />

      {/* Liens rapides */}
      <div className="space-y-2">
        <span className="text-[11px] font-['Outfit'] font-bold tracking-[0.1em] uppercase text-slate-600">
          Voir aussi
        </span>
        <button
          onClick={() => navigate('/help')}
          className="w-full flex items-center gap-2 text-[12px] font-['Outfit'] text-slate-500 hover:text-blue-400 transition-colors py-1"
        >
          <LifeBuoy className="h-[13px] w-[13px]" />
          Aide & Support
        </button>
        <button
          onClick={() => navigate('/settings')}
          className="w-full flex items-center gap-2 text-[12px] font-['Outfit'] text-slate-500 hover:text-blue-400 transition-colors py-1"
        >
          <Settings className="h-[13px] w-[13px]" />
          Paramètres
        </button>
      </div>
    </aside>
  )
}
