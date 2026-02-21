// Help Hero — Section héroïque avec recherche et tags populaires
// Design : glassmorphism, gradient text, glow effects

import { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Sparkles, X } from 'lucide-react'
import {
  POPULAR_TAGS,
  SEARCH_SUGGESTIONS,
  CATEGORY_BADGE_COLORS,
} from '@/data/helpData'

interface HelpHeroProps {
  onSearch: (query: string) => void
  onTagClick: (tag: string) => void
}

export function HelpHero({ onSearch, onTagClick }: HelpHeroProps) {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Filtrer les suggestions
  const filteredSuggestions = useMemo(() => {
    if (!query.trim()) return SEARCH_SUGGESTIONS.slice(0, 5)
    const lower = query.toLowerCase()
    return SEARCH_SUGGESTIONS.filter((s) =>
      s.text.toLowerCase().includes(lower)
    ).slice(0, 5)
  }, [query])

  // Fermer dropdown si clic extérieur
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const showDropdown = isFocused && filteredSuggestions.length > 0

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative"
    >
      {/* Background glow */}
      <div className="absolute inset-0 -top-12 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[340px] bg-gradient-to-b from-blue-500/[0.07] via-indigo-500/[0.04] to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative text-center space-y-6 pt-2 pb-4">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="flex items-center justify-center"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/[0.08] border border-blue-500/20 text-[11px] font-medium text-blue-400 tracking-wide uppercase">
            <Sparkles className="h-3 w-3" />
            Centre d'aide
          </span>
        </motion.div>

        {/* Titre */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="font-['Outfit'] text-3xl sm:text-4xl font-bold"
        >
          <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Comment pouvons-nous
          </span>
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
            vous aider ?
          </span>
        </motion.h1>

        {/* Sous-titre */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed"
        >
          Trouvez rapidement les réponses à vos questions sur la gestion de
          votre inventaire IT.
        </motion.p>

        {/* Barre de recherche */}
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.45 }}
          className="relative max-w-lg mx-auto"
        >
          <div
            className={`
              relative flex items-center gap-2 px-4 py-3 rounded-2xl
              bg-white/[0.04] backdrop-blur-xl
              border transition-all duration-300
              ${
                isFocused
                  ? 'border-blue-500/40 ring-1 ring-blue-500/20 shadow-[0_0_24px_rgba(59,130,246,0.1)]'
                  : 'border-white/[0.06]'
              }
            `}
          >
            <Search className="h-4 w-4 text-slate-500 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                onSearch(e.target.value)
              }}
              onFocus={() => setIsFocused(true)}
              placeholder="Rechercher un sujet, une question…"
              className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-600 outline-none font-['Inter']"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('')
                  onSearch('')
                  inputRef.current?.focus()
                }}
                className="p-0.5 rounded-md hover:bg-white/[0.06] transition-colors"
              >
                <X className="h-3.5 w-3.5 text-slate-500" />
              </button>
            )}
          </div>

          {/* Dropdown suggestions */}
          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="absolute z-50 mt-2 w-full rounded-xl bg-[#0e1630]/95 backdrop-blur-xl border border-white/[0.06] shadow-2xl overflow-hidden"
              >
                {filteredSuggestions.map((s, i) => (
                  <button
                    key={s.text}
                    onClick={() => {
                      setQuery(s.text)
                      onSearch(s.text)
                      setIsFocused(false)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.04] transition-colors text-left"
                  >
                    <Search className="h-3.5 w-3.5 text-slate-600 shrink-0" />
                    <span className="text-sm text-slate-300 flex-1 truncate">
                      {s.text}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${
                        CATEGORY_BADGE_COLORS[s.categoryId] ??
                        'bg-slate-500/10 text-slate-400'
                      }`}
                    >
                      {s.categoryLabel}
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Tags populaires */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-2"
        >
          <span className="text-[11px] text-slate-600 mr-1">Populaire :</span>
          {POPULAR_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setQuery(tag)
                onTagClick(tag)
              }}
              className="text-[11px] px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-slate-400 hover:text-slate-200 hover:border-white/[0.12] hover:bg-white/[0.06] transition-all duration-200"
            >
              {tag}
            </button>
          ))}
        </motion.div>
      </div>
    </motion.section>
  )
}
