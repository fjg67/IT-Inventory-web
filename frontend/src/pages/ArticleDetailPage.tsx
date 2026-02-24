// Page dÃ©tail article â€” Premium redesign v2

import { useState, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  Package,
  LogIn,
  LogOut,
  ArrowLeftRight,
  Calendar,
  MapPin,
  History,
  Barcode,
  AlertTriangle,
  Download,
  FileSpreadsheet,
  Pencil,
  Check,
  X,
  TrendingUp,
  TrendingDown,
  Hash,
  Activity,
  Layers,
  ChevronRight,
  Box,
} from 'lucide-react'

import type { Article, MovementFormData, MovementType, Site, StockMovement } from '@/types'
import { articlesService } from '@/services/articles.service'
import { sitesService } from '@/services/sites.service'
import { stockService } from '@/services/stock.service'
import { exportService } from '@/services/export.service'
import { useAuth } from '@/hooks/useAuth'
import { MovementSuccessCelebration } from '@/components/articles/MovementSuccessCelebration'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataTablePagination } from '@/components/shared/DataTablePagination'

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// CONSTANTES
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

const HISTORY_PAGE_SIZE = 15

const MOVEMENT_LABELS: Record<MovementType, string> = {
  ENTRY: 'EntrÃ©e',
  EXIT: 'Sortie',
  TRANSFER: 'Transfert',
  ADJUSTMENT: 'Ajustement',
}

const MOVEMENT_BADGE_VARIANT: Record<MovementType, 'success' | 'danger' | 'info' | 'warning'> = {
  ENTRY: 'success',
  EXIT: 'danger',
  TRANSFER: 'info',
  ADJUSTMENT: 'warning',
}

const CATEGORY_COLORS: Record<string, { gradient: string; glow: string }> = {
  'Accessoires': { gradient: 'from-blue-500 via-indigo-600 to-violet-700', glow: 'shadow-blue-500/25' },
  'Audio':       { gradient: 'from-purple-500 via-fuchsia-600 to-pink-700', glow: 'shadow-purple-500/25' },
  'CÃ¢ble':       { gradient: 'from-rose-500 via-red-600 to-orange-600',     glow: 'shadow-rose-500/25' },
  'Chargeur':    { gradient: 'from-emerald-500 via-green-600 to-teal-700',  glow: 'shadow-emerald-500/25' },
  'Electrique':  { gradient: 'from-amber-500 via-orange-600 to-red-600',    glow: 'shadow-amber-500/25' },
  'Ergonomie':   { gradient: 'from-cyan-500 via-teal-600 to-blue-700',      glow: 'shadow-cyan-500/25' },
  'Kit':         { gradient: 'from-indigo-500 via-violet-600 to-purple-700', glow: 'shadow-indigo-500/25' },
  'Divers':      { gradient: 'from-slate-500 via-gray-600 to-zinc-700',     glow: 'shadow-slate-500/25' },
}

const FAMILLES_EMOJI: Record<string, string> = {
  'Accessoires': 'ðŸ–±ï¸', 'Audio': 'ðŸŽ§', 'CÃ¢ble': 'ðŸ”Œ', 'Chargeur': 'ðŸ”‹',
  'Electrique': 'âš¡', 'Ergonomie': 'ðŸª‘', 'Kit': 'ðŸ“¦',
}

const BRANDS_EMOJI: Record<string, string> = {
  'DELL': 'ðŸ’»', 'Cherry': 'ðŸ’', 'StarTec': 'â­', '3M': 'ðŸ·ï¸',
  'GÃ©nÃ©rique': 'âšª', 'Plantronics': 'ðŸŽ§', 'Aurora': 'âœ¨',
  'Urban Factory': 'ðŸ­', 'Epsos': 'ðŸ“·', 'Poly': 'ðŸŽ™ï¸',
  'HP': 'ðŸ’»', 'Ergotron': 'ðŸ–¥ï¸', 'Fujitsu': 'ðŸ’»', 'Logitech': 'ðŸ–±ï¸',
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// HELPERS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 1) return "Ã€ l'instant"
  if (diffMin < 60) return `il y a ${diffMin}min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `il y a ${diffH}h`
  const diffD = Math.floor(diffH / 24)
  if (diffD < 30) return `il y a ${diffD}j`
  const diffM = Math.floor(diffD / 30)
  return `il y a ${diffM} mois`
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// COMPOSANT PRINCIPAL
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export default function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { isAdmin } = useAuth()

  const [movementOpen, setMovementOpen] = useState(false)
  const [movementType, setMovementType] = useState<MovementType>('ENTRY')
  const [historyPage, setHistoryPage] = useState(1)
  const [historyFrom, setHistoryFrom] = useState('')
  const [historyTo, setHistoryTo] = useState('')
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationType, setCelebrationType] = useState<MovementType>('ENTRY')
  const [celebrationQty, setCelebrationQty] = useState(0)

  // â”€â”€â”€ RequÃªtes â”€â”€â”€

  const {
    data: articleData,
    isLoading: articleLoading,
    isError: articleError,
  } = useQuery({
    queryKey: ['article', id],
    queryFn: () => articlesService.getById(id!),
    enabled: !!id,
  })

  const article = articleData?.article

  const { data: sitesData } = useQuery({
    queryKey: ['sites'],
    queryFn: () => sitesService.getAll(),
  })
  const sites = sitesData?.sites ?? []

  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['article-history', id, historyPage, historyFrom, historyTo],
    queryFn: () =>
      articlesService.getHistory(id!, {
        page: historyPage,
        from: historyFrom || undefined,
        to: historyTo || undefined,
      }),
    enabled: !!id,
  })

  const movements = historyData?.movements ?? []
  const historyTotalPages = historyData?.totalPages ?? 1
  const historyTotal = historyData?.total ?? 0

  const handleOpenMovement = useCallback((type: MovementType) => {
    setMovementType(type)
    setMovementOpen(true)
  }, [])

  // â”€â”€â”€ Loading â”€â”€â”€
  if (articleLoading) return <ArticleDetailSkeleton />

  // â”€â”€â”€ Not found â”€â”€â”€
  if (articleError || !article) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="h-20 w-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <Package className="h-10 w-10 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-text-primary">Article introuvable</h2>
          <p className="text-text-muted text-sm">Cet article n'existe pas ou a Ã©tÃ© supprimÃ©.</p>
          <Button onClick={() => navigate('/articles')} className="mt-2">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux articles
          </Button>
        </motion.div>
      </div>
    )
  }

  // â”€â”€â”€ DonnÃ©es dÃ©rivÃ©es â”€â”€â”€
  const totalStock = article.totalStock ?? 0
  const catColors = CATEGORY_COLORS[article.category] ?? CATEGORY_COLORS['Divers']!
  const categoryEmoji = FAMILLES_EMOJI[article.category] ?? 'ðŸ“¦'
  const isOk = article.status === 'ok'
  const isLow = article.status === 'low'
  const isOut = article.status === 'out'

  return (
    <motion.div
      className="pb-8 max-w-4xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {/* HERO HEADER                               */}
      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative mb-8"
      >
        {/* Gradient background */}
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${catColors.gradient} shadow-2xl ${catColors.glow}`}>
          {/* Subtle noise overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=')] opacity-40" />

          {/* Decorative geometry â€” subtle */}
          <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full border border-border" />
          <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full border border-border/50" />

          <div className="relative z-10 px-6 pt-5 pb-20 sm:px-8 sm:pt-6 sm:pb-24">
            {/* Navigation */}
            <div className="flex items-center justify-between mb-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/articles')}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-elevated backdrop-blur-md text-text-primary hover:bg-surface-elevated transition-all border border-border"
              >
                <ArrowLeft className="h-4 w-4" />
              </motion.button>
              {isAdmin && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/articles')}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-elevated backdrop-blur-md text-text-primary hover:bg-surface-elevated transition-all border border-border"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </motion.button>
              )}
            </div>

            {/* Article visual */}
            <div className="flex flex-col items-center">
              {/* Image / placeholder */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="relative mb-5"
              >
                {article.imageUrl ? (
                  <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl overflow-hidden ring-4 ring-border shadow-2xl">
                    <img src={article.imageUrl} alt={article.name} className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl ring-4 ring-border shadow-2xl bg-surface-elevated backdrop-blur-sm flex items-center justify-center">
                    <span className="text-4xl sm:text-5xl drop-shadow-lg">{categoryEmoji}</span>
                  </div>
                )}
                {/* Status dot */}
                <div className={`absolute -bottom-1 -right-1 h-7 w-7 rounded-full flex items-center justify-center shadow-lg ring-3 ring-border ${
                  isOk ? 'bg-emerald-500' : isLow ? 'bg-amber-500' : isOut ? 'bg-red-500' : 'bg-gray-500'
                }`}>
                  {isOk ? <Check className="h-3.5 w-3.5 text-text-primary" /> :
                   isLow ? <AlertTriangle className="h-3.5 w-3.5 text-text-primary" /> :
                   <X className="h-3.5 w-3.5 text-text-primary" />}
                </div>
              </motion.div>

              {/* Reference pill */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="flex items-center gap-1.5 bg-surface-elevated backdrop-blur-md rounded-full px-3.5 py-1 mb-3 border border-border"
              >
                <Hash className="h-3 w-3 text-text-secondary" />
                <span className="text-xs font-mono text-text-primary tracking-wide">{article.reference}</span>
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl sm:text-2xl font-bold text-text-primary text-center leading-snug max-w-md"
              >
                {article.name}
              </motion.h1>
            </div>
          </div>
        </div>

        {/* â”€â”€ STAT CARDS overlay â”€â”€ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="relative -mt-12 z-10 mx-4 sm:mx-8"
        >
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
            {[
              { icon: Package, value: totalStock, label: 'Stock actuel', color: 'emerald' as const },
              { icon: AlertTriangle, value: article.minStock, label: 'Stock minimum', color: 'amber' as const },
              { icon: Activity, value: historyTotal, label: 'Mouvements', color: 'violet' as const },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                whileHover={{ y: -3, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 400 }}
                className="relative overflow-hidden rounded-2xl bg-surface/90 backdrop-blur-xl border border-border p-4 sm:p-5 text-center shadow-xl"
              >
                <div className={`mx-auto mb-2.5 h-10 w-10 rounded-xl flex items-center justify-center ${
                  stat.color === 'emerald' ? 'bg-emerald-500/15 text-emerald-400' :
                  stat.color === 'amber' ? 'bg-amber-500/15 text-amber-400' :
                  'bg-violet-500/15 text-violet-400'
                }`}>
                  <stat.icon className="h-[18px] w-[18px]" />
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold text-text-primary tabular-nums leading-none">
                  {stat.value}
                </p>
                <p className="text-[10px] sm:text-[11px] text-text-muted mt-1.5 font-medium uppercase tracking-wider">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {/* CONTENT                                   */}
      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <div className="space-y-5 px-1">

        {/* â”€â”€ INFORMATIONS â”€â”€ */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-surface/80 backdrop-blur-xl border border-border overflow-hidden"
        >
          <div className="px-5 py-3.5 border-b border-border">
            <h2 className="text-sm font-semibold text-text-primary tracking-wide">Informations</h2>
          </div>

          <div className="divide-y divide-border">
            <InfoRow label="RÃ©fÃ©rence" value={article.reference} />
            {article.codeFamille && (
              <InfoRow label="Code famille" badge={{ text: article.codeFamille, emoji: 'ðŸ·ï¸', color: 'blue' }} />
            )}
            <InfoRow label="Famille" badge={{ text: article.category, emoji: categoryEmoji, color: 'green' }} />
            {article.articleType && (
              <InfoRow label="Type" badge={{ text: article.articleType, emoji: 'â‰¡', color: 'indigo' }} />
            )}
            {article.sousType && (
              <InfoRow label="Sous-type" badge={{ text: article.sousType, emoji: 'â—ˆ', color: 'orange' }} />
            )}
            {article.brand && (
              <InfoRow label="Marque" badge={{ text: article.brand, emoji: BRANDS_EMOJI[article.brand] ?? 'ðŸ·ï¸', color: 'teal' }} />
            )}
            {article.emplacement && (
              <InfoRow label="Emplacement" badge={{ text: article.emplacement, emoji: 'ðŸ“', color: 'pink' }} />
            )}
            {article.barcode && (
              <InfoRow label="Code-barres" value={article.barcode} mono />
            )}
            {article.description && <InfoRow label="Description" value={article.description} />}
          </div>
        </motion.section>

        {/* â”€â”€ STOCK PAR SITE â”€â”€ */}
        {article.stocks && article.stocks.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-2xl bg-surface/80 backdrop-blur-xl border border-border overflow-hidden"
          >
            <div className="px-5 py-3.5 border-b border-border flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-400" />
              <h2 className="text-sm font-semibold text-text-primary tracking-wide">Stock par site</h2>
            </div>
            <div className="divide-y divide-border">
              {article.stocks.map((stock) => {
                const qty = stock.quantity
                const stockOut = qty <= 0
                const stockLow = qty > 0 && qty <= article.minStock

                return (
                  <div key={stock.id} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${
                        stockOut ? 'bg-red-500/10' : stockLow ? 'bg-amber-500/10' : 'bg-blue-500/10'
                      }`}>
                        <MapPin className={`h-4 w-4 ${
                          stockOut ? 'text-red-400' : stockLow ? 'text-amber-400' : 'text-blue-400'
                        }`} />
                      </div>
                      <span className="text-sm font-medium text-text-primary">
                        {stock.site?.name ?? stock.siteId}
                      </span>
                    </div>
                    <div className={`h-8 min-w-[2rem] px-2.5 rounded-lg flex items-center justify-center text-sm font-bold tabular-nums ${
                      stockOut
                        ? 'bg-red-500/15 text-red-400 ring-1 ring-red-500/25'
                        : stockLow
                          ? 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/25'
                          : 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/25'
                    }`}>
                      {qty}
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.section>
        )}

        {/* â”€â”€ EXPORT â”€â”€ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <motion.button
            whileHover={{ scale: 1.01, y: -1 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => {
              exportService.exportArticles()
              toast.success('Export en cours de tÃ©lÃ©chargement...')
            }}
            className="w-full flex items-center gap-4 rounded-2xl bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 p-4 sm:p-5 text-left shadow-lg shadow-blue-500/15 hover:shadow-blue-500/25 transition-shadow group cursor-pointer"
          >
            <div className="h-11 w-11 rounded-xl bg-surface-elevated backdrop-blur flex items-center justify-center shrink-0">
              <Download className="h-5 w-5 text-text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-primary">Exporter en CSV</p>
              <p className="text-[11px] text-text-secondary mt-0.5">Fiche article + historique â€¢ TÃ©lÃ©chargement immÃ©diat</p>
            </div>
            <FileSpreadsheet className="h-5 w-5 text-text-muted group-hover:text-text-secondary transition-colors shrink-0" />
          </motion.button>
        </motion.div>

        {/* â”€â”€ ACTIONS RAPIDES â”€â”€ */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <h2 className="text-sm font-semibold text-text-primary tracking-wide mb-3">Actions rapides</h2>
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            <ActionBtn icon={LogIn} label="EntrÃ©e" variant="emerald" onClick={() => handleOpenMovement('ENTRY')} />
            <ActionBtn icon={LogOut} label="Sortie" variant="red" onClick={() => handleOpenMovement('EXIT')} />
            <ActionBtn icon={ArrowLeftRight} label="Transfert" variant="violet" onClick={() => handleOpenMovement('TRANSFER')} />
          </div>
        </motion.section>

        {/* â”€â”€ HISTORIQUE â”€â”€ */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl bg-surface/80 backdrop-blur-xl border border-border overflow-hidden"
        >
          <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-blue-400" />
              <h2 className="text-sm font-semibold text-text-primary tracking-wide">Historique</h2>
            </div>
            <span className="text-[11px] text-text-muted font-medium">
              {historyTotal} mouvement{historyTotal !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Date filters */}
          {historyTotal > 0 && (
            <div className="flex items-center gap-2 px-5 py-2.5 border-b border-border/50 bg-[var(--sidebar-hover)]">
              <Calendar className="h-3.5 w-3.5 text-text-muted shrink-0" />
              <Input
                type="date"
                value={historyFrom}
                onChange={(e) => { setHistoryFrom(e.target.value); setHistoryPage(1) }}
                className="h-7 w-32 text-[11px] bg-[var(--sidebar-hover)] border-border rounded-lg"
              />
              <span className="text-text-muted text-[10px]">â†’</span>
              <Input
                type="date"
                value={historyTo}
                onChange={(e) => { setHistoryTo(e.target.value); setHistoryPage(1) }}
                className="h-7 w-32 text-[11px] bg-[var(--sidebar-hover)] border-border rounded-lg"
              />
              {(historyFrom || historyTo) && (
                <button
                  onClick={() => { setHistoryFrom(''); setHistoryTo(''); setHistoryPage(1) }}
                  className="text-[10px] text-text-muted hover:text-text-primary transition-colors ml-1"
                >
                  Effacer
                </button>
              )}
            </div>
          )}

          <div className="p-4 sm:p-5">
            {historyLoading ? (
              <HistorySkeleton />
            ) : movements.length === 0 ? (
              <div className="flex flex-col items-center py-10">
                <div className="h-14 w-14 rounded-2xl bg-[var(--sidebar-hover)] border border-border flex items-center justify-center mb-3">
                  <TrendingUp className="h-6 w-6 text-text-muted" />
                </div>
                <p className="text-sm font-medium text-text-primary">Aucun mouvement</p>
                <p className="text-[11px] text-text-muted mt-1">Les mouvements de cet article apparaÃ®tront ici</p>
              </div>
            ) : (
              <div className="space-y-2">
                {movements.map((mvt, index) => (
                  <MvtRow key={mvt.id} movement={mvt} index={index} />
                ))}
                {historyTotalPages > 1 && (
                  <div className="border-t border-border pt-3 mt-3">
                    <DataTablePagination
                      page={historyPage}
                      totalPages={historyTotalPages}
                      total={historyTotal}
                      onPageChange={setHistoryPage}
                      pageSize={HISTORY_PAGE_SIZE}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.section>
      </div>

      {/* â”€â”€ MOVEMENT DIALOG â”€â”€ */}
      <MovementDialog
        open={movementOpen}
        onOpenChange={setMovementOpen}
        type={movementType}
        article={article}
        sites={sites}
        onSuccess={(qty) => {
          queryClient.invalidateQueries({ queryKey: ['article', id] })
          queryClient.invalidateQueries({ queryKey: ['article-history', id] })
          queryClient.invalidateQueries({ queryKey: ['articles'] })
          setMovementOpen(false)
          // Trigger celebration
          setCelebrationType(movementType)
          setCelebrationQty(qty ?? 0)
          setShowCelebration(true)
        }}
      />

      {/* Celebration animation */}
      <MovementSuccessCelebration
        show={showCelebration}
        type={celebrationType}
        articleName={`${article.reference} â€” ${article.name}`}
        quantity={celebrationQty}
        onComplete={() => setShowCelebration(false)}
      />
    </motion.div>
  )
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// SUB COMPONENTS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

/* â”€â”€â”€ Info Row â”€â”€â”€ */
function InfoRow({
  label,
  value,
  badge,
  mono = false,
}: {
  label: string
  value?: string
  badge?: { text: string; emoji: string; color: string }
  mono?: boolean
}) {
  const badgeColors: Record<string, string> = {
    blue:   'bg-blue-500/12 text-blue-400 ring-1 ring-blue-500/20',
    green:  'bg-emerald-500/12 text-emerald-400 ring-1 ring-emerald-500/20',
    indigo: 'bg-indigo-500/12 text-indigo-400 ring-1 ring-indigo-500/20',
    orange: 'bg-orange-500/12 text-orange-400 ring-1 ring-orange-500/20',
    teal:   'bg-teal-500/12 text-teal-400 ring-1 ring-teal-500/20',
    pink:   'bg-pink-500/12 text-pink-400 ring-1 ring-pink-500/20',
  }

  return (
    <div className="flex items-center justify-between px-5 py-3 min-h-[48px]">
      <span className="text-[13px] text-text-muted">{label}</span>
      {badge ? (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${badgeColors[badge.color] ?? badgeColors.blue}`}>
          <span className="text-sm leading-none">{badge.emoji}</span>
          {badge.text}
        </span>
      ) : (
        <span className={`text-[13px] font-semibold text-text-primary max-w-[55%] text-right ${mono ? 'font-mono tracking-wider text-xs' : ''}`}>
          {value}
        </span>
      )}
    </div>
  )
}

/* â”€â”€â”€ Action Button â”€â”€â”€ */
function ActionBtn({
  icon: Icon,
  label,
  variant,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  variant: 'emerald' | 'red' | 'violet'
  onClick: () => void
}) {
  const styles = {
    emerald: {
      card: 'bg-emerald-500/[0.06] border-emerald-500/15 hover:bg-emerald-500/[0.12] hover:border-emerald-500/25',
      icon: 'bg-emerald-500/20 text-emerald-400',
      text: 'text-emerald-400',
    },
    red: {
      card: 'bg-red-500/[0.06] border-red-500/15 hover:bg-red-500/[0.12] hover:border-red-500/25',
      icon: 'bg-red-500/20 text-red-400',
      text: 'text-red-400',
    },
    violet: {
      card: 'bg-violet-500/[0.06] border-violet-500/15 hover:bg-violet-500/[0.12] hover:border-violet-500/25',
      icon: 'bg-violet-500/20 text-violet-400',
      text: 'text-violet-400',
    },
  }
  const s = styles[variant]

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`flex flex-col items-center gap-2 rounded-2xl border p-4 sm:p-5 transition-all cursor-pointer ${s.card}`}
    >
      <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${s.icon}`}>
        <Icon className="h-5 w-5" />
      </div>
      <span className={`text-xs font-bold tracking-wide ${s.text}`}>{label}</span>
    </motion.button>
  )
}

/* â”€â”€â”€ Movement Row â”€â”€â”€ */
function MvtRow({ movement, index }: { movement: StockMovement; index: number }) {
  const cfgMap: Record<string, { color: string; bg: string; Icon: React.ComponentType<{ className?: string }> }> = {
    ENTRY:      { color: 'text-emerald-400', bg: 'bg-emerald-500/10 ring-1 ring-emerald-500/15', Icon: TrendingUp },
    EXIT:       { color: 'text-red-400',     bg: 'bg-red-500/10 ring-1 ring-red-500/15',         Icon: TrendingDown },
    TRANSFER:   { color: 'text-blue-400',    bg: 'bg-blue-500/10 ring-1 ring-blue-500/15',       Icon: ArrowLeftRight },
    ADJUSTMENT: { color: 'text-amber-400',   bg: 'bg-amber-500/10 ring-1 ring-amber-500/15',     Icon: AlertTriangle },
  }

  const cfg = cfgMap[movement.type] ?? cfgMap.ENTRY!
  const MvtIcon = cfg.Icon

  const siteText =
    movement.type === 'TRANSFER'
      ? `${movement.fromSite?.name ?? '?'} â†’ ${movement.toSite?.name ?? '?'}`
      : (movement.toSite ?? movement.fromSite)?.name ?? 'â€”'

  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.025 }}
      className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 ${cfg.bg}`}
    >
      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg}`}>
        <MvtIcon className={`h-4 w-4 ${cfg.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Badge variant={MOVEMENT_BADGE_VARIANT[movement.type]} className="text-[10px] px-2 py-0.5">
            {MOVEMENT_LABELS[movement.type]}
          </Badge>
          <span className="text-[11px] text-text-muted truncate">{siteText}</span>
        </div>
        {movement.reason && (
          <p className="text-[11px] text-text-muted mt-0.5 truncate">{movement.reason}</p>
        )}
      </div>
      <div className="flex flex-col items-end shrink-0">
        <span className={`text-sm font-bold tabular-nums ${cfg.color}`}>
          {movement.type === 'EXIT' ? `-${movement.quantity}` : `+${movement.quantity}`}
        </span>
        <span className="text-[10px] text-text-muted">{timeAgo(movement.createdAt)}</span>
      </div>
    </motion.div>
  )
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// MOVEMENT DIALOG
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

interface MovementDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  type: MovementType
  article: Article
  sites: Site[]
  onSuccess: (quantity?: number) => void
}

function MovementDialog({ open, onOpenChange, type, article, sites, onSuccess }: MovementDialogProps) {
  // DÃ©terminer le site principal (celui avec le plus de stock)
  const mainSiteId = useMemo(() => {
    if (!article.stocks || article.stocks.length === 0) return undefined
    const best = article.stocks.reduce((a, b) => (b.quantity > a.quantity ? b : a))
    return best.siteId
  }, [article.stocks])

  const {
    register, handleSubmit, control, reset,
    formState: { errors },
  } = useForm<MovementFormData>({
    defaultValues: {
      type, articleId: article.id, quantity: 1,
      siteId: type !== 'TRANSFER' ? mainSiteId : undefined,
      fromSiteId: type === 'TRANSFER' ? mainSiteId : undefined,
      toSiteId: undefined, reason: '',
    },
  })

  const [prevOpen, setPrevOpen] = useState(false)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      reset({
        type, articleId: article.id, quantity: 1,
        siteId: type !== 'TRANSFER' ? mainSiteId : undefined,
        fromSiteId: type === 'TRANSFER' ? mainSiteId : undefined,
        toSiteId: undefined, reason: '',
      })
    }
  }

  const [lastQuantity, setLastQuantity] = useState(0)

  const createMovement = useMutation({
    mutationFn: (data: MovementFormData) => stockService.createMovement(data),
    onSuccess: () => { onSuccess(lastQuantity) },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Erreur lors du mouvement')
    },
  })

  const onFormSubmit = handleSubmit((data) => {
    const payload: MovementFormData = {
      type, articleId: article.id, quantity: data.quantity,
      reason: data.reason || undefined,
    }
    if (type === 'TRANSFER') { payload.fromSiteId = data.fromSiteId; payload.toSiteId = data.toSiteId }
    else { payload.siteId = data.siteId }
    setLastQuantity(data.quantity)
    createMovement.mutate(payload)
  })

  const activeSites = sites.filter((s) => s.isActive)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{MOVEMENT_LABELS[type]} de stock</DialogTitle>
        </DialogHeader>
        <form onSubmit={onFormSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Article</Label>
            <Input value={`${article.reference} â€” ${article.name}`} disabled />
          </div>

          {article.emplacement && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--sidebar-hover)] border border-border">
              <MapPin className="h-3.5 w-3.5 text-blue-400 shrink-0" />
              <span className="text-xs text-text-muted">Emplacement :</span>
              <span className="text-xs font-medium text-text-primary">{article.emplacement}</span>
            </div>
          )}

          {type === 'TRANSFER' ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Site source *</Label>
                <Controller
                  name="fromSiteId" control={control}
                  rules={{ required: 'Le site source est requis' }}
                  render={({ field }) => (
                    <Select value={field.value ?? ''} onValueChange={field.onChange}>
                      <SelectTrigger><SelectValue placeholder="Source" /></SelectTrigger>
                      <SelectContent>
                        {activeSites.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.fromSiteId && <p className="text-xs text-danger">{errors.fromSiteId.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Site destination *</Label>
                <Controller
                  name="toSiteId" control={control}
                  rules={{ required: 'Le site destination est requis' }}
                  render={({ field }) => (
                    <Select value={field.value ?? ''} onValueChange={field.onChange}>
                      <SelectTrigger><SelectValue placeholder="Destination" /></SelectTrigger>
                      <SelectContent>
                        {activeSites.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.toSiteId && <p className="text-xs text-danger">{errors.toSiteId.message}</p>}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Site *</Label>
              <Controller
                name="siteId" control={control}
                rules={{ required: 'Le site est requis' }}
                render={({ field }) => (
                  <Select value={field.value ?? ''} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="SÃ©lectionner un site" /></SelectTrigger>
                    <SelectContent>
                      {activeSites.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.siteId && <p className="text-xs text-danger">{errors.siteId.message}</p>}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="mvt-quantity">QuantitÃ© *</Label>
            <Input id="mvt-quantity" type="number" min={1}
              {...register('quantity', { required: 'La quantitÃ© est requise', valueAsNumber: true, min: { value: 1, message: 'La quantitÃ© doit Ãªtre â‰¥ 1' } })}
            />
            {errors.quantity && <p className="text-xs text-danger">{errors.quantity.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mvt-reason">Raison</Label>
            <Input id="mvt-reason" placeholder="Motif du mouvement (optionnel)" {...register('reason')} />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={createMovement.isPending}>
              Annuler
            </Button>
            <Button type="submit" loading={createMovement.isPending}>Valider</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// SKELETONS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function ArticleDetailSkeleton() {
  return (
    <div className="pb-8 max-w-4xl mx-auto">
      <div className="relative mb-8">
        <div className="rounded-3xl bg-gradient-to-br from-gray-700/60 to-gray-800/60 p-6 pb-24 animate-pulse">
          <div className="flex justify-between mb-6">
            <Skeleton className="h-9 w-9 rounded-xl" />
            <Skeleton className="h-9 w-9 rounded-xl" />
          </div>
          <div className="flex flex-col items-center">
            <Skeleton className="h-24 w-24 rounded-2xl mb-5" />
            <Skeleton className="h-5 w-28 rounded-full mb-3" />
            <Skeleton className="h-7 w-48" />
          </div>
        </div>
        <div className="relative -mt-12 z-10 mx-8">
          <div className="grid grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-2xl bg-surface/90 border border-border p-5 flex flex-col items-center">
                <Skeleton className="h-10 w-10 rounded-xl mb-2.5" />
                <Skeleton className="h-8 w-10 mb-1.5" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-5 px-1">
        <div className="rounded-2xl bg-surface/80 border border-border overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border">
            <Skeleton className="h-4 w-28" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3 border-b border-border/50 last:border-0">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-2xl bg-surface/80 border border-border p-5 flex flex-col items-center gap-2">
                <Skeleton className="h-11 w-11 rounded-xl" />
                <Skeleton className="h-3 w-14" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-surface/80 border border-border overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border flex justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="p-5 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function HistorySkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-xl" />
      ))}
    </div>
  )
}
