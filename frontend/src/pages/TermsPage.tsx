// Page Conditions d'utilisation & Politique de confidentialité — "Legal Codex"
// Layout : header + grid (sidebar sticky + contenu chapitres) + footer
// Logique : tabs, IntersectionObserver, scroll progress, smooth scroll

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { TermsHeader } from '@/components/terms/TermsHeader'
import { TermsSidebar } from '@/components/terms/TermsSidebar'
import { TermsChapter } from '@/components/terms/TermsChapter'
import { TermsTableRetention } from '@/components/terms/TermsTableRetention'
import { RightsGrid } from '@/components/terms/RightsGrid'
import { TermsFooter } from '@/components/terms/TermsFooter'

import { TERMS_CHAPTERS, TERMS_SIDEBAR_ITEMS } from '@/data/termsData'
import {
  PRIVACY_CHAPTERS,
  PRIVACY_SIDEBAR_ITEMS,
} from '@/data/privacyData'

type TabType = 'terms' | 'privacy'

export default function TermsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('terms')
  const [activeChapter, setActiveChapter] = useState('chapter-1')
  const [readingProgress, setReadingProgress] = useState(0)

  // ── Titre de la page ──
  useEffect(() => {
    document.title = "Conditions d'utilisation — IT-Inventory"
    return () => {
      document.title = 'IT-Inventory'
    }
  }, [])

  // ── Progress de lecture ──
  useEffect(() => {
    const handleScroll = () => {
      const el = document.documentElement
      const total = el.scrollHeight - el.clientHeight
      if (total <= 0) return
      const progress = (el.scrollTop / total) * 100
      setReadingProgress(Math.min(progress, 100))
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // ── IntersectionObserver — détecte le chapitre visible ──
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveChapter(entry.target.id)
          }
        }
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    )

    // Observer après un court délai pour laisser le DOM se rendre
    const timer = setTimeout(() => {
      document
        .querySelectorAll('section[id^="chapter-"]')
        .forEach((el) => observer.observe(el))
    }, 100)

    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [activeTab])

  // ── Smooth scroll vers un chapitre ──
  const scrollToChapter = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }, [])

  // ── Changement d'onglet ──
  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab)
    setActiveChapter('chapter-1')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // ── Données selon onglet actif ──
  const chapters =
    activeTab === 'terms' ? TERMS_CHAPTERS : PRIVACY_CHAPTERS
  const sidebarItems =
    activeTab === 'terms' ? TERMS_SIDEBAR_ITEMS : PRIVACY_SIDEBAR_ITEMS

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-10 pb-20">
        {/* Header : breadcrumb, titre, tabs */}
        <TermsHeader activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Grid : sidebar + contenu */}
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 md:gap-12 items-start">
          {/* Sidebar sticky */}
          <TermsSidebar
            items={sidebarItems}
            activeChapter={activeChapter}
            readingProgress={readingProgress}
            onChapterClick={scrollToChapter}
          />

          {/* Contenu principal */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: activeTab === 'terms' ? -16 : 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: activeTab === 'terms' ? 16 : -16 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              {chapters.map((chapter) => {
                // Contenu spécial pour certains chapitres de la politique
                let extra: React.ReactNode = undefined

                if (activeTab === 'privacy') {
                  // Chapitre 3 — Tableau de rétention
                  if (chapter.id === 'chapter-3') {
                    extra = <TermsTableRetention />
                  }
                  // Chapitre 6 — Grille droits RGPD
                  if (chapter.id === 'chapter-6') {
                    extra = <RightsGrid />
                  }
                }

                return (
                  <TermsChapter
                    key={chapter.id}
                    chapter={chapter}
                    extra={extra}
                  />
                )
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer légal */}
        <TermsFooter onTabChange={handleTabChange} />
      </div>

      {/* Styles d'impression */}
      <style>{`
        @media print {
          .sticky { position: static !important; }
          aside { display: none !important; }
          * { color: #000 !important; background: #fff !important; border-color: #ccc !important; }
          [class*="motion"] { animation: none !important; transition: none !important; }
        }
      `}</style>
    </div>
  )
}
