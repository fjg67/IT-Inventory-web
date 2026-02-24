// HelpFAQ — Section FAQ avec onglets (Tous / Débutant / Avancé) et accordéon
// Design : tabs avec glow active, groupes avec labels

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { HelpCircle } from 'lucide-react'
import { FAQ_ITEMS, FAQ_GROUPS } from '@/data/helpData'
import type { FAQLevel } from '@/data/helpData'
import { HelpFAQItem } from './HelpFAQItem'

type TabFilter = 'all' | FAQLevel

const TABS: { id: TabFilter; label: string }[] = [
  { id: 'all', label: 'Tous' },
  { id: 'beginner', label: 'Débutant' },
  { id: 'advanced', label: 'Avancé' },
]

interface HelpFAQProps {
  searchQuery?: string
}

export function HelpFAQ({ searchQuery = '' }: HelpFAQProps) {
  const [activeTab, setActiveTab] = useState<TabFilter>('all')
  const [openId, setOpenId] = useState<string | null>(null)

  // Filtrer les items
  const filteredItems = useMemo(() => {
    let items = FAQ_ITEMS
    if (activeTab !== 'all') {
      items = items.filter((i) => i.level === activeTab)
    }
    if (searchQuery.trim()) {
      const lower = searchQuery.toLowerCase()
      items = items.filter(
        (i) =>
          i.question.toLowerCase().includes(lower) ||
          i.answer.toLowerCase().includes(lower)
      )
    }
    return items
  }, [activeTab, searchQuery])

  // Grouper les items
  const grouped = useMemo(() => {
    return FAQ_GROUPS.map((g) => ({
      ...g,
      items: filteredItems.filter((i) => i.groupId === g.id),
    })).filter((g) => g.items.length > 0)
  }, [filteredItems])

  return (
    <section className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/[0.08] border border-indigo-500/20 flex items-center justify-center">
            <HelpCircle className="h-3.5 w-3.5 text-indigo-400" />
          </div>
          <h2 className="text-[13px] font-semibold text-text-primary uppercase tracking-widest font-['Outfit']">
            Questions fréquentes
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--sidebar-hover)] border border-border">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-300
                ${
                  activeTab === tab.id
                    ? 'text-text-primary'
                    : 'text-text-secondary hover:text-text-primary'
                }
              `}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="faq-tab"
                  className="absolute inset-0 rounded-lg bg-[var(--sidebar-hover)] border border-border shadow-[0_0_12px_rgba(99,102,241,0.1)]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grouped FAQ */}
      <div className="space-y-6">
        {grouped.length === 0 && (
          <div className="text-center py-10">
            <p className="text-sm text-text-muted">Aucune question trouvée.</p>
          </div>
        )}

        {grouped.map((group) => (
          <div key={group.id} className="space-y-2.5">
            {/* Group label */}
            <div className="flex items-center gap-2 pl-1">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400/40" />
              <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider font-['Outfit']">
                {group.label}
              </span>
              <span className="text-[10px] text-text-muted font-['JetBrains_Mono']">
                ({group.items.length})
              </span>
            </div>

            {/* Items */}
            <div className="space-y-2">
              {group.items.map((item) => (
                <HelpFAQItem
                  key={item.id}
                  item={item}
                  isOpen={openId === item.id}
                  onToggle={() =>
                    setOpenId(openId === item.id ? null : item.id)
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
