// Liste des derniers mouvements — tableau de bord
// Design premium avec animations staggered et badges colorés

import { motion } from 'framer-motion'
import { ArrowRight, Clock, ArrowDownCircle, ArrowUpCircle, RefreshCw, ArrowLeftRight, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import type { StockMovement } from '@/types'

interface RecentMovementsProps {
  movements: StockMovement[]
  loading?: boolean
}

const typeConfig = {
  ENTRY: {
    icon: ArrowDownCircle,
    label: 'Entrée',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    ring: 'ring-emerald-500/20',
    iconBg: 'bg-emerald-500/15',
  },
  EXIT: {
    icon: ArrowUpCircle,
    label: 'Sortie',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    ring: 'ring-red-500/20',
    iconBg: 'bg-red-500/15',
  },
  ADJUSTMENT: {
    icon: RefreshCw,
    label: 'Ajustement',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    ring: 'ring-blue-500/20',
    iconBg: 'bg-blue-500/15',
  },
  TRANSFER: {
    icon: ArrowLeftRight,
    label: 'Transfert',
    bg: 'bg-violet-500/10',
    text: 'text-violet-400',
    ring: 'ring-violet-500/20',
    iconBg: 'bg-violet-500/15',
  },
}

function timeAgo(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "À l'instant"
  if (minutes < 60) return `Il y a ${minutes}min`
  if (hours < 24) return `Il y a ${hours}h`
  if (days < 7) return `Il y a ${days}j`
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

export function RecentMovements({ movements, loading }: RecentMovementsProps) {
  if (loading) {
    return (
      <div className="glass-card p-6 ring-1 ring-white/5">
        <div className="flex items-center gap-3 mb-5">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="glass-card p-6 ring-1 ring-white/5"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/15">
            <Zap className="h-4 w-4 text-blue-400" />
          </div>
          <h3 className="text-base font-semibold text-text-primary">Derniers mouvements</h3>
        </div>
        <Link
          to="/movements"
          className="text-xs text-text-muted hover:text-primary transition-colors flex items-center gap-1 group"
        >
          Voir tout
          <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {movements.length === 0 ? (
        <div className="py-10 text-center">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white/5 flex items-center justify-center">
            <Clock className="h-7 w-7 text-text-muted" />
          </div>
          <p className="text-text-secondary text-sm font-medium">Aucun mouvement</p>
          <p className="text-text-muted text-xs mt-1">Les mouvements récents apparaîtront ici</p>
        </div>
      ) : (
        <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin">
          {movements.slice(0, 10).map((movement, i) => {
            const config = typeConfig[movement.type]
            const IconComponent = config.icon
            const createdAt = new Date(movement.createdAt)
            
            return (
              <motion.div
                key={movement.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + i * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-transparent hover:border-white/5 transition-all duration-200"
              >
                {/* Type icon */}
                <div className={`p-1.5 rounded-lg flex-shrink-0 ${config.iconBg}`}>
                  <IconComponent className={`h-3.5 w-3.5 ${config.text}`} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm text-text-primary truncate font-medium">
                    {movement.article?.name ?? 'Article'}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-text-muted">
                      {movement.user?.name
                        ? movement.user.name.split(' ').map(w => w[0]).join('').toUpperCase()
                        : '??'}
                    </span>
                    <span className="text-text-muted/30">•</span>
                    <span className="text-[11px] text-text-muted">
                      {timeAgo(createdAt)}
                    </span>
                  </div>
                </div>

                {/* Type badge */}
                <div className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-bold ring-1 ${config.bg} ${config.text} ${config.ring}`}>
                  {config.label} ×{movement.quantity}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
