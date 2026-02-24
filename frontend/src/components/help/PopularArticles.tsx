// Popular Articles — Top 5 articles les plus consultés
// Design : numéro de rang + badge catégorie + temps de lecture

import { motion } from 'framer-motion'
import { Clock, ArrowRight, TrendingUp } from 'lucide-react'
import { POPULAR_ARTICLES, CATEGORY_BADGE_COLORS } from '@/data/helpData'

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
}

const itemVariant = {
  hidden: { opacity: 0, x: -10 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] },
  },
}

export function PopularArticles() {
  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-amber-500/[0.08] border border-amber-500/20 flex items-center justify-center">
          <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
        </div>
        <h2 className="text-[13px] font-semibold text-text-primary uppercase tracking-widest font-['Outfit']">
          Articles populaires
        </h2>
      </div>

      {/* List */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="rounded-2xl bg-[var(--sidebar-hover)] backdrop-blur-xl border border-border overflow-hidden divide-y divide-border"
      >
        {POPULAR_ARTICLES.map((article, i) => (
          <motion.button
            key={article.id}
            variants={itemVariant}
            className="group w-full flex items-center gap-4 px-4 py-3.5 hover:bg-[var(--sidebar-hover)] transition-colors text-left"
          >
            {/* Rank number */}
            <span className="text-lg font-bold font-['JetBrains_Mono'] text-text-muted w-6 text-center shrink-0 group-hover:text-text-secondary transition-colors">
              {i + 1}
            </span>

            {/* Title + meta */}
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-sm text-text-primary group-hover:text-text-primary transition-colors truncate font-medium">
                {article.title}
              </p>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                    CATEGORY_BADGE_COLORS[article.categoryId] ??
                    'bg-surface-elevated text-text-secondary'
                  }`}
                >
                  {article.categoryLabel}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-text-muted">
                  <Clock className="h-2.5 w-2.5" />
                  {article.readTime} min
                </span>
              </div>
            </div>

            {/* Arrow */}
            <ArrowRight className="h-3.5 w-3.5 text-text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
          </motion.button>
        ))}
      </motion.div>
    </section>
  )
}
