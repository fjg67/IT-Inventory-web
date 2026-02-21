// Page Alertes — redesign premium avec glassmorphisme et micro-interactions

import { useState, useMemo, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  AlertTriangle,
  PackageX,
  ArrowDownCircle,
  TrendingDown,
  ShieldCheck,
  MapPin,
  ChevronDown,
  Sparkles,
  Flame,
  Gauge,
  Package,
  Activity,
  Zap,
  BarChart3,
  CheckCircle2,
} from 'lucide-react'

import type { AlertItem, Site, MovementFormData } from '@/types'
import { alertsService } from '@/services/alerts.service'
import { sitesService } from '@/services/sites.service'
import { stockService } from '@/services/stock.service'
import { articlesService } from '@/services/articles.service'

import { EmptyState } from '@/components/shared/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MovementFormDialog } from '@/pages/StockMovementsPage'

/* ─────────────────────────── helpers ─────────────────────────── */

const CATEGORY_GRADIENTS: Record<string, string> = {
  'Câbles': 'from-cyan-500/80 via-blue-500/80 to-indigo-600/80',
  'Écrans': 'from-violet-500/80 via-purple-500/80 to-fuchsia-600/80',
  'Claviers/Souris': 'from-amber-500/80 via-orange-500/80 to-red-500/80',
  'RAM/SSD': 'from-emerald-500/80 via-teal-500/80 to-cyan-600/80',
  'Réseau': 'from-blue-500/80 via-indigo-500/80 to-violet-600/80',
  'Divers': 'from-rose-500/80 via-pink-500/80 to-fuchsia-600/80',
}

const CATEGORY_EMOJI: Record<string, string> = {
  'Câbles': '🔌',
  'Écrans': '🖥️',
  'Claviers/Souris': '⌨️',
  'RAM/SSD': '💾',
  'Réseau': '🌐',
  'Divers': '📦',
}

/* ─────────────────────────── Main ─────────────────────────── */

export default function AlertsPage() {
  const queryClient = useQueryClient()
  const [selectedSite, setSelectedSite] = useState<string>('_all')
  const [replenishOpen, setReplenishOpen] = useState(false)
  const [replenishArticleId, setReplenishArticleId] = useState<string>('')
  const [replenishSiteId, setReplenishSiteId] = useState<string>('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  /* ── Queries ── */
  const { data: alertsData, isLoading, isError } = useQuery({
    queryKey: ['alerts', selectedSite === '_all' ? undefined : selectedSite],
    queryFn: () => alertsService.getAlerts(selectedSite === '_all' ? undefined : selectedSite),
  })

  const { data: sitesData } = useQuery({
    queryKey: ['sites'],
    queryFn: () => sitesService.getAll(),
  })

  const { data: articlesData } = useQuery({
    queryKey: ['articles', 'all'],
    queryFn: () => articlesService.getAll({ limit: 1000 }),
    enabled: replenishOpen,
  })

  const sites = (sitesData?.sites ?? []).filter((s: Site) => s.isActive)
  const alerts = alertsData?.alerts ?? []

  const sortedAlerts = useMemo(() => {
    return [...alerts].sort((a, b) => {
      if (a.quantity === 0 && b.quantity !== 0) return -1
      if (b.quantity === 0 && a.quantity !== 0) return 1
      return b.deficit - a.deficit
    })
  }, [alerts])

  /* ── Stats ── */
  const outOfStockCount = alerts.filter((a) => a.quantity === 0).length
  const lowStockCount = alerts.filter((a) => a.quantity > 0).length
  const totalDeficit = alerts.reduce((sum, a) => sum + a.deficit, 0)

  /* ── Mutations ── */
  const replenishMutation = useMutation({
    mutationFn: (data: MovementFormData) => stockService.createMovement(data),
    onSuccess: () => {
      toast.success('Réapprovisionnement enregistré')
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      queryClient.invalidateQueries({ queryKey: ['articles'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setReplenishOpen(false)
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Erreur lors du réapprovisionnement')
    },
  })

  const handleReplenish = useCallback((articleId: string, siteId?: string) => {
    setReplenishArticleId(articleId)
    setReplenishSiteId(siteId ?? '')
    setReplenishOpen(true)
  }, [])

  /* ─────────────────────── Render ─────────────────────── */
  return (
    <div className="space-y-6 pb-8">
      {/* ═══════ Hero Header ═══════ */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl border border-white/[0.06]"
      >
        {/* Background mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/40 via-[#0c1425] to-amber-950/30" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iLjAzIi8+PC9zdmc+')] opacity-50" />

        {/* Decorative elements */}
        <div className="absolute -top-20 -right-20 h-48 w-48 rounded-full border border-red-500/10 blur-sm" />
        <div className="absolute -bottom-16 -left-16 h-36 w-36 rounded-full border border-amber-500/10 blur-sm" />
        <div className="absolute top-1/2 right-1/4 h-2 w-2 rounded-full bg-red-400/30 animate-pulse" />
        <div className="absolute top-1/3 right-1/3 h-1.5 w-1.5 rounded-full bg-amber-400/25 animate-pulse delay-500" />

        <div className="relative z-10 px-6 py-6 md:px-8 md:py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Title section */}
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500/20 to-amber-500/20 ring-1 ring-red-500/20 backdrop-blur-sm">
                <AlertTriangle className="h-7 w-7 text-red-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Alertes de stock
                </h1>
                <p className="text-sm text-white/40 mt-0.5">
                  Surveillance et réapprovisionnement
                </p>
              </div>
            </div>

            {/* Stat pills */}
            <div className="flex flex-wrap items-center gap-2.5">
              <StatPill
                icon={Flame}
                value={outOfStockCount}
                label="en rupture"
                color="red"
                delay={0.1}
              />
              <StatPill
                icon={TrendingDown}
                value={lowStockCount}
                label="stock bas"
                color="amber"
                delay={0.2}
              />
              <StatPill
                icon={BarChart3}
                value={totalDeficit}
                label="déficit total"
                color="violet"
                delay={0.3}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══════ Filter Bar ═══════ */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="flex flex-wrap items-center justify-between gap-3"
      >
        {/* View toggle */}
        <div className="flex items-center gap-1 rounded-xl bg-white/[0.03] p-1 ring-1 ring-white/[0.06]">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              viewMode === 'grid'
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 16 16">
              <rect x="1" y="1" width="6" height="6" rx="1" />
              <rect x="9" y="1" width="6" height="6" rx="1" />
              <rect x="1" y="9" width="6" height="6" rx="1" />
              <rect x="9" y="9" width="6" height="6" rx="1" />
            </svg>
            Grille
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              viewMode === 'list'
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 16 16">
              <rect x="1" y="2" width="14" height="2.5" rx="0.5" />
              <rect x="1" y="6.75" width="14" height="2.5" rx="0.5" />
              <rect x="1" y="11.5" width="14" height="2.5" rx="0.5" />
            </svg>
            Liste
          </button>
        </div>

        {/* Site filter */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] ring-1 ring-white/[0.06]">
            <MapPin className="h-3.5 w-3.5 text-white/40" />
          </div>
          <Select value={selectedSite} onValueChange={setSelectedSite}>
            <SelectTrigger className="w-52 h-9 bg-white/[0.03] border-white/[0.06] rounded-xl text-sm">
              <SelectValue placeholder="Tous les sites" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">Tous les sites</SelectItem>
              {sites.map((site: Site) => (
                <SelectItem key={site.id} value={site.id}>
                  {site.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* ═══════ Content ═══════ */}
      {isLoading ? (
        <AlertsSkeleton />
      ) : isError ? (
        <ErrorState onRetry={() => queryClient.invalidateQueries({ queryKey: ['alerts'] })} />
      ) : sortedAlerts.length === 0 ? (
        <AllClearState />
      ) : viewMode === 'grid' ? (
        /* ── Grid View ── */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {sortedAlerts.map((alert, index) => (
              <AlertCardGrid
                key={alert.id}
                alert={alert}
                index={index}
                onReplenish={handleReplenish}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* ── List View ── */
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {sortedAlerts.map((alert, index) => (
              <AlertCardList
                key={alert.id}
                alert={alert}
                index={index}
                onReplenish={handleReplenish}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ═══════ Replenish Dialog ═══════ */}
      <MovementFormDialog
        open={replenishOpen}
        onOpenChange={setReplenishOpen}
        articles={articlesData?.articles ?? []}
        sites={sites}
        onSubmit={(data) => replenishMutation.mutate(data)}
        loading={replenishMutation.isPending}
        defaultArticleId={replenishArticleId}
        defaultSiteId={replenishSiteId}
        defaultType="ENTRY"
      />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Stat Pill
   ═══════════════════════════════════════════════════════════════ */

function StatPill({
  icon: Icon,
  value,
  label,
  color,
  delay,
}: {
  icon: React.ElementType
  value: number
  label: string
  color: 'red' | 'amber' | 'violet'
  delay: number
}) {
  const colors = {
    red: {
      bg: 'bg-red-500/10',
      ring: 'ring-red-500/20',
      text: 'text-red-400',
      glow: 'shadow-red-500/10',
      dot: 'bg-red-400',
    },
    amber: {
      bg: 'bg-amber-500/10',
      ring: 'ring-amber-500/20',
      text: 'text-amber-400',
      glow: 'shadow-amber-500/10',
      dot: 'bg-amber-400',
    },
    violet: {
      bg: 'bg-violet-500/10',
      ring: 'ring-violet-500/20',
      text: 'text-violet-400',
      glow: 'shadow-violet-500/10',
      dot: 'bg-violet-400',
    },
  }[color]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl ${colors.bg} ring-1 ${colors.ring} backdrop-blur-sm shadow-lg ${colors.glow}`}
    >
      <Icon className={`h-4 w-4 ${colors.text}`} />
      <span className={`text-sm font-bold tabular-nums ${colors.text}`}>{value}</span>
      <span className="text-xs text-white/40">{label}</span>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Alert Card — Grid
   ═══════════════════════════════════════════════════════════════ */

interface AlertCardProps {
  alert: AlertItem
  index: number
  onReplenish: (articleId: string, siteId?: string) => void
}

function AlertCardGrid({ alert, index, onReplenish }: AlertCardProps) {
  const isOutOfStock = alert.quantity === 0
  const minStock = alert.article.minStock
  const pct = minStock > 0 ? Math.min(Math.round((alert.quantity / minStock) * 100), 100) : 0
  const category = alert.article.category
  const emoji = CATEGORY_EMOJI[category] ?? '📦'

  const accentColor = isOutOfStock
    ? { border: 'border-red-500/25', bar: 'bg-red-500', glow: 'shadow-red-500/20', text: 'text-red-400', badge: 'bg-red-500/15 text-red-400 ring-red-500/20' }
    : { border: 'border-amber-500/20', bar: 'bg-amber-500', glow: 'shadow-amber-500/15', text: 'text-amber-400', badge: 'bg-amber-500/15 text-amber-400 ring-amber-500/20' }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={`group relative overflow-hidden rounded-2xl ${accentColor.border} border bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 hover:shadow-xl ${accentColor.glow}`}
    >
      {/* Noise texture overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iLjAyIi8+PC9zdmc+')] opacity-50 pointer-events-none" />

      {/* Subtle gradient top accent */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${isOutOfStock ? 'from-transparent via-red-500/60 to-transparent' : 'from-transparent via-amber-500/50 to-transparent'}`} />

      <div className="relative z-10 p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] ring-1 ring-white/[0.08] text-lg">
              {emoji}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-white truncate leading-tight">
                {alert.article.name}
              </h3>
              <span className="text-[10px] font-mono text-white/25 mt-0.5 block">
                {alert.article.reference}
              </span>
            </div>
          </div>
          <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ring-1 ${accentColor.badge}`}>
            {isOutOfStock ? (
              <><PackageX className="h-2.5 w-2.5" /> Rupture</>
            ) : (
              <><TrendingDown className="h-2.5 w-2.5" /> Bas</>
            )}
          </span>
        </div>

        {/* Site & Emplacement */}
        <div className="flex items-center gap-3 text-xs text-white/35">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3" />
            {alert.site.name}
          </span>
          {alert.article.emplacement && (
            <span className="flex items-center gap-1 text-white/25">
              <span>•</span>
              <span>📍 {alert.article.emplacement}</span>
            </span>
          )}
        </div>

        {/* Stock metrics */}
        <div className="space-y-2.5">
          <StockRow
            label="Quantité"
            value={alert.quantity}
            valueClass={isOutOfStock ? 'text-red-400 font-bold' : 'text-amber-400 font-bold'}
          />
          <StockRow
            label="Stock min."
            value={minStock}
            valueClass="text-white/60"
          />
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/30">Déficit</span>
            <span className="text-red-400/80 font-semibold tabular-nums">−{alert.deficit}</span>
          </div>

          {/* Progress gauge */}
          <div className="pt-1">
            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, delay: index * 0.04 + 0.3, ease: 'easeOut' }}
                className={`h-full rounded-full ${accentColor.bar}`}
              />
            </div>
          </div>
        </div>

        {/* Replenish button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onReplenish(alert.articleId, alert.siteId)}
          className={`relative w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 overflow-hidden ${
            isOutOfStock
              ? 'bg-gradient-to-r from-red-500/20 via-red-500/25 to-rose-500/20 text-red-300 ring-1 ring-red-500/20 hover:ring-red-500/40 hover:from-red-500/30 hover:to-rose-500/30'
              : 'bg-gradient-to-r from-amber-500/20 via-amber-500/25 to-orange-500/20 text-amber-300 ring-1 ring-amber-500/20 hover:ring-amber-500/40 hover:from-amber-500/30 hover:to-orange-500/30'
          }`}
        >
          <ArrowDownCircle className="h-3.5 w-3.5" />
          Réapprovisionner
        </motion.button>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Alert Card — List
   ═══════════════════════════════════════════════════════════════ */

function AlertCardList({ alert, index, onReplenish }: AlertCardProps) {
  const isOutOfStock = alert.quantity === 0
  const minStock = alert.article.minStock
  const pct = minStock > 0 ? Math.min(Math.round((alert.quantity / minStock) * 100), 100) : 0
  const category = alert.article.category
  const emoji = CATEGORY_EMOJI[category] ?? '📦'

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      className={`group relative overflow-hidden rounded-xl border transition-all duration-300 hover:bg-white/[0.03] ${
        isOutOfStock ? 'border-red-500/15 hover:border-red-500/25' : 'border-amber-500/10 hover:border-amber-500/20'
      }`}
    >
      {/* Left accent */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${
        isOutOfStock ? 'bg-red-500 opacity-60' : 'bg-amber-500 opacity-50'
      } group-hover:opacity-100 transition-opacity`} />

      <div className="flex items-center gap-4 px-5 py-3 pl-6">
        {/* Emoji */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] ring-1 ring-white/[0.06] text-base">
          {emoji}
        </div>

        {/* Article info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-semibold text-white truncate">
              {alert.article.name}
            </span>
            <span className="text-[10px] font-mono text-white/20 bg-white/[0.04] px-1.5 py-0.5 rounded shrink-0">
              {alert.article.reference}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-white/30">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {alert.site.name}
            </span>
            {alert.article.emplacement && (
              <span className="text-white/20">📍 {alert.article.emplacement}</span>
            )}
            <span className={`font-semibold tabular-nums ${isOutOfStock ? 'text-red-400/70' : 'text-amber-400/70'}`}>
              {alert.quantity}/{minStock}
            </span>
          </div>
        </div>

        {/* Gauge mini */}
        <div className="hidden md:flex flex-col items-end gap-1 shrink-0 w-28">
          <div className="w-full h-1 rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, delay: index * 0.03 + 0.2 }}
              className={`h-full rounded-full ${isOutOfStock ? 'bg-red-500' : 'bg-amber-500'}`}
            />
          </div>
          <span className="text-[10px] text-white/20 tabular-nums">
            déficit −{alert.deficit}
          </span>
        </div>

        {/* Status badge */}
        <span className={`hidden sm:inline-flex shrink-0 items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider ring-1 ${
          isOutOfStock
            ? 'bg-red-500/10 text-red-400 ring-red-500/20'
            : 'bg-amber-500/10 text-amber-400 ring-amber-500/20'
        }`}>
          {isOutOfStock ? 'Rupture' : 'Bas'}
        </span>

        {/* Action */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onReplenish(alert.articleId, alert.siteId)}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
            isOutOfStock
              ? 'bg-red-500/15 text-red-300 ring-1 ring-red-500/20 hover:bg-red-500/25'
              : 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/20 hover:bg-amber-500/25'
          }`}
        >
          <Zap className="h-3 w-3" />
          <span className="hidden lg:inline">Réapprovisionner</span>
        </motion.button>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════════════════════ */

function StockRow({ label, value, valueClass }: { label: string; value: number; valueClass: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-white/30">{label}</span>
      <span className={`tabular-nums ${valueClass}`}>{value}</span>
    </div>
  )
}

/* ─── All Clear State ─── */

function AllClearState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="relative overflow-hidden rounded-2xl border border-emerald-500/10 bg-white/[0.02]"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 via-transparent to-teal-950/10" />
      <div className="relative z-10 flex flex-col items-center justify-center py-20 px-6 text-center">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2, type: 'spring', stiffness: 200 }}
          className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/10 ring-1 ring-emerald-500/20 mb-6"
        >
          <ShieldCheck className="h-10 w-10 text-emerald-400" />
        </motion.div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Tout est en ordre
        </h3>
        <p className="text-sm text-white/40 max-w-sm">
          Tous vos articles sont au-dessus du stock minimum. Aucune alerte à signaler.
        </p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-1.5 mt-6 px-4 py-2 rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/15 text-emerald-400 text-xs font-medium"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Stock optimal sur tous les sites
        </motion.div>
      </div>
    </motion.div>
  )
}

/* ─── Error State ─── */

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-red-500/10 bg-white/[0.02] p-12 text-center"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 ring-1 ring-red-500/20 mx-auto mb-4">
        <AlertTriangle className="h-7 w-7 text-red-400" />
      </div>
      <p className="text-sm text-red-300/80 mb-4">Erreur lors du chargement des alertes</p>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onRetry}
        className="px-4 py-2 rounded-xl bg-white/[0.05] ring-1 ring-white/[0.08] text-xs font-medium text-white/60 hover:text-white/80 hover:bg-white/[0.08] transition-all"
      >
        Réessayer
      </motion.button>
    </motion.div>
  )
}

/* ─── Skeleton ─── */

function AlertsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-white/[0.04] bg-white/[0.02] p-5 space-y-4"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-5 w-16 rounded-md" />
          </div>
          <Skeleton className="h-3 w-24" />
          <div className="space-y-2.5">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-8" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-8" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-6" />
            </div>
            <Skeleton className="h-1.5 w-full rounded-full" />
          </div>
          <Skeleton className="h-9 w-full rounded-xl" />
        </div>
      ))}
    </div>
  )
}
