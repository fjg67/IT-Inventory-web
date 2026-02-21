// Liste des alertes du tableau de bord — articles en dessous du stock minimum
// Design premium avec animations staggered et indicateurs visuels

import { motion } from 'framer-motion'
import { AlertTriangle, ArrowRight, Package, ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import type { AlertItem } from '@/types'

interface AlertListProps {
  alerts: AlertItem[]
  loading?: boolean
}

export function AlertList({ alerts, loading }: AlertListProps) {
  if (loading) {
    return (
      <div className="glass-card p-6 ring-1 ring-white/5">
        <div className="flex items-center gap-3 mb-5">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
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
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass-card p-6 ring-1 ring-white/5"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/15">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <h3 className="text-base font-semibold text-text-primary">Alertes stock</h3>
          {alerts.length > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400">
              {alerts.length}
            </span>
          )}
        </div>
        <Link
          to="/alerts"
          className="text-xs text-text-muted hover:text-primary transition-colors flex items-center gap-1 group"
        >
          Voir tout
          <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {alerts.length === 0 ? (
        <div className="py-10 text-center">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white/5 flex items-center justify-center">
            <Package className="h-7 w-7 text-text-muted" />
          </div>
          <p className="text-text-secondary text-sm font-medium">Aucune alerte</p>
          <p className="text-text-muted text-xs mt-1">Tous les stocks sont normaux</p>
        </div>
      ) : (
        <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin">
          {alerts.slice(0, 8).map((alert, i) => {
            const isOutOfStock = alert.quantity === 0
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + i * 0.05 }}
              >
                <Link
                  to={`/articles/${alert.articleId}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-transparent hover:border-white/5 transition-all duration-200 group"
                >
                  {/* Status indicator */}
                  <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                    isOutOfStock ? 'bg-red-500/15' : 'bg-amber-500/15'
                  }`}>
                    <ShieldAlert className={`h-3.5 w-3.5 ${
                      isOutOfStock ? 'text-red-400' : 'text-amber-400'
                    }`} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-text-primary truncate group-hover:text-white transition-colors font-medium">
                      {alert.article.name}
                    </p>
                    <p className="text-[11px] text-text-muted mt-0.5">{alert.site.name}</p>
                  </div>

                  {/* Stock badge */}
                  <div className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold ${
                    isOutOfStock
                      ? 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20'
                      : 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20'
                  }`}>
                    {alert.quantity}/{alert.article.minStock}
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
