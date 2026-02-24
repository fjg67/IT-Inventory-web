// Page Aide & Support — "Mission Control Documentation"
// Compose : HelpHero, QuickActions, HelpCategories, PopularArticles, HelpFAQ, SupportFooter

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { HelpHero } from '@/components/help/HelpHero'
import { QuickActions } from '@/components/help/QuickActions'
import { HelpCategories } from '@/components/help/HelpCategories'
import { PopularArticles } from '@/components/help/PopularArticles'
import { HelpFAQ } from '@/components/help/HelpFAQ'
import { SupportFooter } from '@/components/help/SupportFooter'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
}

const sectionVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] },
  },
}

export default function HelpSupportPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  const handleTagClick = useCallback((tag: string) => {
    setSearchQuery(tag)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-0">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => navigate('/settings')}
          className="flex items-center gap-1.5 text-[12px] text-text-secondary hover:text-text-primary transition-colors mb-6 group"
        >
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Retour aux paramètres
        </motion.button>

        {/* All sections */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {/* Hero */}
          <motion.div variants={sectionVariants}>
            <HelpHero onSearch={handleSearch} onTagClick={handleTagClick} />
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={sectionVariants}>
            <QuickActions />
          </motion.div>

          {/* Categories */}
          <motion.div variants={sectionVariants}>
            <HelpCategories />
          </motion.div>

          {/* Popular Articles */}
          <motion.div variants={sectionVariants}>
            <PopularArticles />
          </motion.div>

          {/* FAQ */}
          <motion.div variants={sectionVariants}>
            <HelpFAQ searchQuery={searchQuery} />
          </motion.div>

          {/* Support Footer */}
          <motion.div variants={sectionVariants}>
            <SupportFooter />
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
