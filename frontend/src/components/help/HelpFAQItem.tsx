// HelpFAQItem — Item accordéon individuel avec AnimatePresence
// Design : expand/collapse avec glow border, icône tournante

import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, BookOpen } from 'lucide-react'
import type { FAQItem } from '@/data/helpData'

interface HelpFAQItemProps {
  item: FAQItem
  isOpen: boolean
  onToggle: () => void
}

export function HelpFAQItem({ item, isOpen, onToggle }: HelpFAQItemProps) {
  return (
    <div
      className={`
        rounded-xl border transition-all duration-300
        ${
          isOpen
            ? 'bg-white/[0.03] border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.06)]'
            : 'bg-white/[0.01] border-white/[0.05] hover:border-white/[0.08] hover:bg-white/[0.02]'
        }
      `}
    >
      {/* Question header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
      >
        {/* Status icon */}
        <div
          className={`
            w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-300
            ${isOpen ? 'bg-blue-500/[0.12] border border-blue-500/25' : 'bg-white/[0.04] border border-white/[0.06]'}
          `}
        >
          <BookOpen
            className={`h-3.5 w-3.5 transition-colors duration-300 ${
              isOpen ? 'text-blue-400' : 'text-slate-600'
            }`}
          />
        </div>

        {/* Question text */}
        <span
          className={`flex-1 text-sm font-medium transition-colors duration-300 ${
            isOpen ? 'text-slate-100' : 'text-slate-300'
          }`}
        >
          {item.question}
        </span>

        {/* Level badge */}
        <span
          className={`
            text-[9px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider shrink-0
            ${
              item.level === 'beginner'
                ? 'bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20'
                : 'bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20'
            }
          `}
        >
          {item.level === 'beginner' ? 'Débutant' : 'Avancé'}
        </span>

        {/* Chevron */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          className="shrink-0"
        >
          <ChevronDown
            className={`h-4 w-4 transition-colors ${
              isOpen ? 'text-blue-400' : 'text-slate-600'
            }`}
          />
        </motion.div>
      </button>

      {/* Answer body */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pl-14 space-y-2.5">
              {/* Separator */}
              <div className="h-px bg-gradient-to-r from-blue-500/20 via-white/[0.04] to-transparent" />

              {/* Answer text */}
              <p className="text-[13px] text-slate-400 leading-relaxed">
                {item.answer}
              </p>

              {/* Bullets */}
              {item.bullets && item.bullets.length > 0 && (
                <ul className="space-y-1.5 pt-1">
                  {item.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400/50 shrink-0" />
                      <span className="text-[12px] text-slate-400 leading-relaxed">
                        {b}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
