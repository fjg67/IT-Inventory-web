// Composant chapitre réutilisable — structure narrative avec numéro filigrane
// Design : header avec icône + numéro décoratif, corps serif, listes à puces, callout

import { motion } from 'framer-motion'
import type { TermsChapterData } from '@/data/termsData'
import { TermsCallout } from './TermsCallout'

interface TermsChapterProps {
  chapter: TermsChapterData
  /** Contenu additionnel rendu après les paragraphes (ex : TableRetention, RightsGrid) */
  extra?: React.ReactNode
}

const chapterVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
}

export function TermsChapter({ chapter, extra }: TermsChapterProps) {
  const Icon = chapter.icon

  return (
    <motion.section
      id={chapter.id}
      variants={chapterVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      className="relative mb-12 scroll-mt-8"
    >
      {/* ── Header chapitre ── */}
      <div className="relative flex items-center gap-4 mb-6 pb-4 border-b border-white/[0.06]">
        {/* Numéro filigrane */}
        <span className="absolute right-0 -top-2 font-['Outfit'] text-[64px] font-black leading-none text-blue-500/[0.08] pointer-events-none select-none">
          {chapter.number}
        </span>

        {/* Icône */}
        <div
          className={`
            w-10 h-10 rounded-xl flex items-center justify-center shrink-0
            ${chapter.colorBg} border ${chapter.colorBorder}
          `}
        >
          <Icon className={`h-[18px] w-[18px] ${chapter.color}`} />
        </div>

        {/* Titre */}
        <div>
          <p className="text-[10px] font-['JetBrains_Mono'] text-slate-600 mb-0.5">
            {chapter.articleLabel}
          </p>
          <h2 className="text-xl font-bold font-['Outfit'] text-slate-100">
            {chapter.title}
          </h2>
        </div>
      </div>

      {/* ── Corps du chapitre ── */}
      <div className="space-y-0">
        {/* Paragraphes (avant les bullets) */}
        {chapter.paragraphs.map((p, i) => {
          // Si bullets existent, on insère les bullets après le 1er paragraphe
          if (i === 0 && chapter.bullets) {
            return (
              <div key={i}>
                <p className="font-['Lora'] text-[15px] leading-[1.8] text-slate-300/90 mb-4">
                  {p}
                </p>
                {/* Bullets */}
                <ul className="space-y-2.5 mb-4 ml-0">
                  {chapter.bullets.map((b, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                      <span className="font-['Lora'] text-[15px] leading-[1.8] text-slate-300/90">
                        {b}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          }
          return (
            <p
              key={i}
              className="font-['Lora'] text-[15px] leading-[1.8] text-slate-300/90 mb-4"
            >
              {p}
            </p>
          )
        })}

        {/* Contenu extra (TableRetention, RightsGrid…) */}
        {extra}

        {/* Callout */}
        {chapter.callout && (
          <TermsCallout type={chapter.callout.type}>
            {chapter.callout.text}
          </TermsCallout>
        )}
      </div>
    </motion.section>
  )
}
