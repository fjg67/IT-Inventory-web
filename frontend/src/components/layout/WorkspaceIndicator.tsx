// Indicateur de workspace — affichage visuel du mode Agence vs Site Général

import { motion, AnimatePresence } from 'framer-motion'
import { Building2, Briefcase } from 'lucide-react'
import { useSiteStore } from '@/stores/siteStore'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface WorkspaceIndicatorProps {
  isOpen: boolean
}

export function WorkspaceIndicator({ isOpen }: WorkspaceIndicatorProps) {
  const selectedSite = useSiteStore((s) => s.selectedSite)
  const filterSiteName = useSiteStore((s) => s.filterSiteName)

  if (!selectedSite) return null

  const isAgence = !!selectedSite.edsNumber
  const label = isAgence ? 'Agence' : 'Général'
  const Icon = isAgence ? Briefcase : Building2
  const displayName = filterSiteName || 'Tous les sites'

  const content = (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group relative w-full overflow-hidden rounded-xl',
        isOpen ? 'p-3' : 'p-2 flex items-center justify-center',
      )}
    >
      {/* Fond avec gradient animé */}
      <div
        className={cn(
          'absolute inset-0 rounded-xl opacity-90 transition-opacity duration-300 group-hover:opacity-100',
          isAgence
            ? 'bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-rose-500/15'
            : 'bg-gradient-to-br from-blue-500/15 via-indigo-500/10 to-violet-500/15',
        )}
      />

      {/* Bordure avec glow */}
      <div
        className={cn(
          'absolute inset-0 rounded-xl ring-1 transition-all duration-300',
          isAgence
            ? 'ring-amber-500/30 group-hover:ring-amber-500/50 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]'
            : 'ring-blue-500/30 group-hover:ring-blue-500/50 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]',
        )}
      />

      {/* Contenu */}
      <div className="relative flex items-center gap-2.5">
        {/* Icône avec badge de statut */}
        <div className="relative shrink-0">
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300',
              isAgence
                ? 'bg-gradient-to-br from-amber-500 to-orange-500 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                : 'bg-gradient-to-br from-blue-500 to-indigo-500 shadow-[0_0_12px_rgba(59,130,246,0.3)]',
            )}
          >
            <Icon className="h-4 w-4 text-white" />
          </div>

          {/* Point lumineux animé */}
          <motion.div
            className={cn(
              'absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-surface',
              isAgence ? 'bg-amber-400' : 'bg-blue-400',
            )}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.7, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        {/* Texte (visible uniquement si sidebar ouverte) */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 overflow-hidden text-left"
            >
              {/* Type label */}
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    'text-[10px] font-bold uppercase tracking-widest',
                    isAgence ? 'text-amber-400' : 'text-blue-400',
                  )}
                >
                  {label}
                </span>
              </div>

              {/* Nom du site filtre actif */}
              <p className="truncate text-xs font-semibold text-text-primary leading-tight mt-0.5">
                {displayName}
              </p>

              {/* EDS (pour les agences) */}
              {isAgence && selectedSite.edsNumber && (
                <p className="text-[10px] text-text-muted mt-0.5">
                  EDS {selectedSite.edsNumber}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )

  // Quand la sidebar est fermée, wrap dans un tooltip
  if (!isOpen) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" className="flex flex-col gap-0.5">
          <span className={cn(
            'text-[10px] font-bold uppercase tracking-wider',
            isAgence ? 'text-amber-400' : 'text-blue-400',
          )}>
            {label}
          </span>
          <span className="font-medium">{displayName}</span>
          {isAgence && selectedSite.edsNumber && (
            <span className="text-xs text-text-muted">EDS {selectedSite.edsNumber}</span>
          )}
        </TooltipContent>
      </Tooltip>
    )
  }

  return content
}
