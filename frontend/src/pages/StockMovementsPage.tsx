// Page Mouvements de stock — liste paginée, filtres, export Excel et création de mouvements

import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Plus,
  Download,
  Search,
  Filter,
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCw,
  ArrowLeftRight,
  Package,
  Loader2,
  Check,
  ArrowRight,
  Clock,
  MapPin,
  CalendarDays,
  User,
  Hash,
  MessageSquare,
  Zap,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'

import type {
  StockMovement,
  MovementFormData,
  MovementFilters,
  MovementType,
  Article,
  Site,
} from '@/types'
import { stockService } from '@/services/stock.service'
import { exportService } from '@/services/export.service'
import { articlesService } from '@/services/articles.service'
import { sitesService } from '@/services/sites.service'
import { useAuth } from '@/hooks/useAuth'
import { MovementSuccessCelebration } from '@/components/articles/MovementSuccessCelebration'

import { EmptyState } from '@/components/shared/EmptyState'
import { DataTablePagination } from '@/components/shared/DataTablePagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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

// --- Constantes ---

const PAGE_SIZE = 20

/** Configuration visuelle des types de mouvement */
const MOVEMENT_TYPE_CONFIG: Record<
  MovementType,
  {
    label: string
    icon: typeof ArrowDownCircle
    variant: 'success' | 'danger' | 'info' | 'default'
    color: string
    bgColor: string
    glowColor: string
    description: string
  }
> = {
  ENTRY: {
    label: 'Entrée',
    icon: ArrowDownCircle,
    variant: 'success',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    glowColor: 'shadow-emerald-500/20',
    description: 'Ajouter du stock sur un site',
  },
  EXIT: {
    label: 'Sortie',
    icon: ArrowUpCircle,
    variant: 'danger',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    glowColor: 'shadow-rose-500/20',
    description: 'Retirer du stock d\'un site',
  },
  ADJUSTMENT: {
    label: 'Ajustement',
    icon: RefreshCw,
    variant: 'info',
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/10',
    glowColor: 'shadow-sky-500/20',
    description: 'Corriger la quantité en stock',
  },
  TRANSFER: {
    label: 'Transfert',
    icon: ArrowLeftRight,
    variant: 'default',
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
    glowColor: 'shadow-violet-500/20',
    description: 'Déplacer du stock entre deux sites',
  },
}

// --- Composant badge type de mouvement premium ---

function MovementTypeBadge({ type }: { type: MovementType }) {
  const config = MOVEMENT_TYPE_CONFIG[type]
  const Icon = config.icon
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bgColor} ${config.color} ring-1 ring-inset ring-current/20`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  )
}

// --- Squelette de chargement premium ---

function CardSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-5 w-10" />
        </div>
      ))}
    </div>
  )
}

// --- Time ago helper ---
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'À l\'instant'
  if (mins < 60) return `Il y a ${mins}min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `Il y a ${hrs}h`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `Il y a ${days}j`
  return format(new Date(dateStr), 'dd MMM yyyy', { locale: fr })
}

// --- Composant principal ---

export default function StockMovementsPage() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  // État des filtres et pagination
  const [filters, setFilters] = useState<MovementFilters>({
    page: 1,
    limit: PAGE_SIZE,
  })
  const [searchInput, setSearchInput] = useState('')

  // État modal
  const [formOpen, setFormOpen] = useState(false)
  const [exporting, setExporting] = useState(false)

  // Recherche avec debounce (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, page: 1 }))
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  // Récupération des mouvements
  const { data, isLoading, isError } = useQuery({
    queryKey: ['movements', filters],
    queryFn: () => stockService.getMovements(filters),
    placeholderData: (prev) => prev,
  })

  const movements = data?.movements ?? []
  const totalPages = data?.totalPages ?? 1
  const total = data?.total ?? 0

  // Récupération des articles pour le formulaire
  const { data: articlesData } = useQuery({
    queryKey: ['articles', 'all'],
    queryFn: () => articlesService.getAll({ limit: 1000 }),
    enabled: formOpen,
  })

  // Récupération des sites pour le formulaire et les filtres
  const { data: sitesData } = useQuery({
    queryKey: ['sites'],
    queryFn: () => sitesService.getAll(),
  })

  const articles = articlesData?.articles ?? []
  const sites = (sitesData?.sites ?? []).filter((s: Site) => s.isActive)

  // Celebration state
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationType, setCelebrationType] = useState<MovementType>('ENTRY')
  const [celebrationArticle, setCelebrationArticle] = useState('')
  const [celebrationQty, setCelebrationQty] = useState(0)

  // Mutation de création de mouvement
  const createMutation = useMutation({
    mutationFn: (data: MovementFormData) => stockService.createMovement(data),
    onSuccess: (_res, variables) => {
      queryClient.invalidateQueries({ queryKey: ['movements'] })
      queryClient.invalidateQueries({ queryKey: ['articles'] })
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setFormOpen(false)
      // Trigger celebration
      setCelebrationType(variables.type)
      setCelebrationQty(variables.quantity)
      const art = articles.find(a => a.id === variables.articleId)
      setCelebrationArticle(art ? `${art.reference} \u2014 ${art.name}` : '')
      setShowCelebration(true)
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la création du mouvement')
    },
  })

  // Export Excel
  const handleExport = useCallback(async () => {
    setExporting(true)
    try {
      await exportService.exportMovements(filters)
      toast.success('Export téléchargé avec succès')
    } catch {
      toast.error("Erreur lors de l'export")
    } finally {
      setExporting(false)
    }
  }, [filters])

  // Handlers de filtres
  const handleFilterType = useCallback((value: string) => {
    setFilters((prev) => ({
      ...prev,
      type: value === '_all' ? undefined : (value as MovementType),
      page: 1,
    }))
  }, [])

  const handleFilterSite = useCallback((value: string) => {
    setFilters((prev) => ({
      ...prev,
      siteId: value === '_all' ? undefined : value,
      page: 1,
    }))
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }, [])

  // Formatage de la date
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd MMM yyyy HH:mm', { locale: fr })
    } catch {
      return dateStr
    }
  }

  // Active filters count
  const activeFiltersCount = [filters.type, filters.siteId, filters.from, filters.to].filter(Boolean).length

  return (
    <div className="space-y-6">
      {/* En-tête premium */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-start justify-between gap-6"
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
              <Zap className="h-7 w-7 text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-emerald-400 border-2 border-[#0a0f1e] animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Mouvements de stock
            </h1>
            <p className="text-sm text-white/50 mt-0.5">
              {total > 0 ? `${total} mouvement${total > 1 ? 's' : ''} enregistré${total > 1 ? 's' : ''}` : 'Historique des mouvements'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={exporting}
            className="bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all"
          >
            {exporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Exporter
          </Button>
          <Button
            onClick={() => setFormOpen(true)}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/25 border-0 transition-all hover:shadow-blue-500/40"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouveau mouvement
          </Button>
        </div>
      </motion.div>

      {/* Barre de filtres premium */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-4"
      >
        {/* Glow decoratif */}
        <div className="absolute top-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
            <Filter className="h-3.5 w-3.5 text-blue-400" />
            <span className="text-xs font-medium text-white/60">Filtres</span>
            {activeFiltersCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
                {activeFiltersCount}
              </span>
            )}
          </div>

          {/* Filtre par type — pills */}
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <button
              onClick={() => handleFilterType('_all')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                !filters.type
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              Tous
            </button>
            {(Object.keys(MOVEMENT_TYPE_CONFIG) as MovementType[]).map((type) => {
              const config = MOVEMENT_TYPE_CONFIG[type]
              const isActive = filters.type === type
              return (
                <button
                  key={type}
                  onClick={() => handleFilterType(type)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? `${config.bgColor} ${config.color}`
                      : 'text-white/40 hover:text-white/60'
                  }`}
                >
                  {config.label}
                </button>
              )
            })}
          </div>

          {/* Séparateur */}
          <div className="h-6 w-px bg-white/[0.06]" />

          {/* Filtre par site */}
          <Select value={filters.siteId ?? '_all'} onValueChange={handleFilterSite}>
            <SelectTrigger className="w-40 h-8 text-xs bg-white/[0.03] border-white/[0.06] rounded-lg">
              <SelectValue placeholder="Site" />
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

          {/* Dates */}
          <div className="flex items-center gap-2 ml-auto">
            <div className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-white/30" />
              <Input
                type="date"
                value={filters.from ?? ''}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    from: e.target.value || undefined,
                    page: 1,
                  }))
                }
                className="w-36 h-8 text-xs bg-white/[0.03] border-white/[0.06] rounded-lg"
              />
            </div>
            <ArrowRight className="h-3 w-3 text-white/20" />
            <Input
              type="date"
              value={filters.to ?? ''}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  to: e.target.value || undefined,
                  page: 1,
                }))
              }
              className="w-36 h-8 text-xs bg-white/[0.03] border-white/[0.06] rounded-lg"
            />
          </div>
        </div>
      </motion.div>

      {/* Liste des mouvements — cartes premium */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        {isLoading ? (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            <CardSkeleton />
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12 text-center">
            <p className="text-danger mb-4">Erreur lors du chargement des mouvements.</p>
            <Button
              variant="outline"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['movements'] })}
            >
              Réessayer
            </Button>
          </div>
        ) : movements.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            <EmptyState
              icon={Package}
              title="Aucun mouvement trouvé"
              description={
                filters.type || filters.from || filters.to || filters.siteId
                  ? 'Essayez de modifier vos filtres de recherche.'
                  : "Aucun mouvement n'a été enregistré pour le moment."
              }
            />
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {movements.map((movement, index) => {
                const config = MOVEMENT_TYPE_CONFIG[movement.type]
                const Icon = config.icon
                const isEntry = movement.type === 'ENTRY'
                const isExit = movement.type === 'EXIT'
                const isTransfer = movement.type === 'TRANSFER'

                // Site display
                const siteName = isTransfer
                  ? null
                  : isEntry
                    ? movement.toSite?.name
                    : movement.fromSite?.name

                return (
                  <motion.div
                    key={movement.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25, delay: index * 0.03 }}
                    className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-300"
                  >
                    {/* Accent bar gauche */}
                    <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${
                      isEntry ? 'bg-emerald-400' : isExit ? 'bg-rose-400' : isTransfer ? 'bg-violet-400' : 'bg-sky-400'
                    } opacity-60 group-hover:opacity-100 transition-opacity`} />

                    <div className="flex items-center gap-4 px-5 py-3.5 pl-6">
                      {/* Icône type */}
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.bgColor} ring-1 ring-inset ring-current/10 ${config.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>

                      {/* Contenu principal */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-semibold text-white truncate">
                            {movement.article?.name ?? '—'}
                          </span>
                          <span className="text-[10px] font-mono text-white/25 bg-white/[0.04] px-1.5 py-0.5 rounded shrink-0">
                            {movement.article?.reference}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-white/40">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {movement.user?.name
                              ? movement.user.name.split(' ').map(w => w[0]).join('').toUpperCase()
                              : '—'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {timeAgo(movement.createdAt)}
                          </span>
                          {movement.reason && (
                            <span className="flex items-center gap-1 truncate max-w-[200px]">
                              <MessageSquare className="h-3 w-3 shrink-0" />
                              {movement.reason}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Site + emplacement */}
                      <div className="hidden md:flex flex-col items-end gap-0.5 shrink-0">
                        {isTransfer ? (
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="text-white/50">{movement.fromSite?.name}</span>
                            <ArrowRight className="h-3 w-3 text-violet-400" />
                            <span className="text-white/70 font-medium">{movement.toSite?.name}</span>
                          </div>
                        ) : siteName ? (
                          <span className="text-xs text-white/50">{siteName}</span>
                        ) : (
                          <span className="text-xs text-white/20">—</span>
                        )}
                        {movement.article?.emplacement && (() => {
                          const emp = movement.article.emplacement;
                          const movSite = isTransfer ? movement.toSite?.name : siteName;
                          const match = (movSite?.includes('5') && emp.startsWith('Stock 5'))
                            || (movSite?.includes('8') && emp.startsWith('Stock 8'));
                          return match ? (
                            <span className="flex items-center gap-1 text-[10px] text-white/30">
                              <MapPin className="h-2.5 w-2.5" />
                              {emp}
                            </span>
                          ) : null;
                        })()}
                      </div>

                      {/* Quantité */}
                      <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-mono text-sm font-bold tabular-nums shrink-0 ${
                        isEntry || movement.type === 'ADJUSTMENT'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {isEntry || movement.type === 'ADJUSTMENT' ? (
                          <TrendingUp className="h-3.5 w-3.5" />
                        ) : (
                          <TrendingDown className="h-3.5 w-3.5" />
                        )}
                        {isEntry || movement.type === 'ADJUSTMENT' ? '+' : '-'}
                        {movement.quantity}
                      </div>

                      {/* Date complète — tooltip on hover */}
                      <span className="text-[10px] text-white/20 w-20 text-right shrink-0 hidden lg:block font-mono">
                        {formatDate(movement.createdAt)}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>

            {/* Pagination */}
            <div className="pt-2">
              <DataTablePagination
                page={filters.page ?? 1}
                totalPages={totalPages}
                total={total}
                onPageChange={handlePageChange}
                pageSize={PAGE_SIZE}
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Modal de création de mouvement */}
      <MovementFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        articles={articles}
        sites={sites}
        onSubmit={(data) => createMutation.mutate(data)}
        loading={createMutation.isPending}
      />

      {/* Celebration animation */}
      <MovementSuccessCelebration
        show={showCelebration}
        type={celebrationType}
        articleName={celebrationArticle}
        quantity={celebrationQty}
        onComplete={() => setShowCelebration(false)}
      />
    </div>
  )
}

// --- Modal formulaire de mouvement — Premium ---

interface MovementFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  articles: Article[]
  sites: Site[]
  onSubmit: (data: MovementFormData) => void
  loading: boolean
  defaultArticleId?: string
  defaultType?: MovementType
  defaultSiteId?: string
}

function MovementFormDialog({
  open,
  onOpenChange,
  articles,
  sites,
  onSubmit,
  loading,
  defaultArticleId,
  defaultType,
  defaultSiteId,
}: MovementFormDialogProps) {
  const [articleSearch, setArticleSearch] = useState('')
  const [selectedType, setSelectedType] = useState<MovementType>(defaultType ?? 'ENTRY')
  const [selectedArticleId, setSelectedArticleId] = useState(defaultArticleId ?? '')

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MovementFormData>({
    defaultValues: {
      type: defaultType ?? 'ENTRY',
      articleId: defaultArticleId ?? '',
      quantity: 1,
      reason: '',
      siteId: '',
      fromSiteId: '',
      toSiteId: '',
    },
  })

  useEffect(() => {
    if (open) {
      const type = defaultType ?? 'ENTRY'
      setSelectedType(type)
      reset({
        type,
        articleId: defaultArticleId ?? '',
        quantity: 1,
        reason: '',
        siteId: defaultSiteId ?? '',
        fromSiteId: '',
        toSiteId: '',
      })
      setArticleSearch('')
      setSelectedArticleId(defaultArticleId ?? '')
    }
  }, [open, defaultArticleId, defaultType, defaultSiteId, reset])

  const watchSiteId = watch('siteId')
  const watchFromSiteId = watch('fromSiteId')
  const activeSiteId = selectedType === 'TRANSFER' ? watchFromSiteId : watchSiteId

  const filteredArticles = articles.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(articleSearch.toLowerCase()) ||
      a.reference.toLowerCase().includes(articleSearch.toLowerCase())
    if (!matchesSearch) return false
    if (activeSiteId && a.stocks) {
      if (selectedType === 'EXIT' || selectedType === 'TRANSFER') {
        return a.stocks.some((s) => s.siteId === activeSiteId && s.quantity > 0)
      }
      return a.stocks.some((s) => s.siteId === activeSiteId)
    }
    return true
  })

  const handleTypeChange = (type: MovementType) => {
    setSelectedType(type)
    setValue('type', type)
    setValue('siteId', '')
    setValue('fromSiteId', '')
    setValue('toSiteId', '')
    setValue('articleId', '')
    setArticleSearch('')
    setSelectedArticleId('')
  }

  const handleArticleSelect = (articleId: string) => {
    setSelectedArticleId(articleId)
    setValue('articleId', articleId, { shouldValidate: true })
  }

  const onFormSubmit = (data: MovementFormData) => {
    const payload: MovementFormData = {
      type: selectedType,
      articleId: data.articleId || selectedArticleId,
      quantity: Number(data.quantity),
      reason: data.reason || undefined,
    }
    if (selectedType === 'TRANSFER') {
      payload.fromSiteId = data.fromSiteId
      payload.toSiteId = data.toSiteId
    } else {
      payload.siteId = data.siteId
    }
    onSubmit(payload)
  }

  const activeTypeConfig = MOVEMENT_TYPE_CONFIG[selectedType]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0 bg-[#0c1222] border-white/[0.08]">
        {/* En-tête avec gradient */}
        <div className="relative overflow-hidden px-6 pt-6 pb-4">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
          
          <div className="relative flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-white">
                Nouveau mouvement
              </DialogTitle>
              <p className="text-xs text-white/40 mt-0.5">Enregistrer un mouvement de stock</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="px-6 pb-6 space-y-5">
          {/* Section 1 — Type de mouvement */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-5 w-5 items-center justify-center rounded-md bg-white/[0.06]">
                <Hash className="h-3 w-3 text-white/40" />
              </div>
              <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Type</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(MOVEMENT_TYPE_CONFIG) as MovementType[]).map((type) => {
                const config = MOVEMENT_TYPE_CONFIG[type]
                const Icon = config.icon
                const isSelected = selectedType === type
                return (
                  <motion.button
                    key={type}
                    type="button"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleTypeChange(type)}
                    className={`
                      relative flex items-center gap-3 p-3 rounded-xl border transition-all text-left
                      ${isSelected
                        ? `border-current/20 ${config.bgColor} ${config.color} shadow-lg ${config.glowColor}`
                        : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] text-white/50'
                      }
                    `}
                  >
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all ${
                      isSelected ? `${config.bgColor}` : 'bg-white/[0.04]'
                    }`}>
                      <Icon className={`h-4.5 w-4.5 ${isSelected ? '' : 'text-white/30'}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-semibold ${isSelected ? '' : 'text-white/60'}`}>
                        {config.label}
                      </p>
                      <p className="text-[10px] text-current/60 mt-0.5 leading-tight">{config.description}</p>
                    </div>
                    {isSelected && (
                      <motion.div
                        layoutId="type-check"
                        className="flex h-5 w-5 items-center justify-center rounded-full bg-current/20"
                      >
                        <Check className="h-3 w-3" />
                      </motion.div>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Section 2 — Site(s) */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-5 w-5 items-center justify-center rounded-md bg-white/[0.06]">
                <MapPin className="h-3 w-3 text-white/40" />
              </div>
              <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Site</span>
            </div>

            {selectedType === 'TRANSFER' ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-white/40">Source</label>
                  <Controller
                    name="fromSiteId"
                    control={control}
                    rules={{ required: 'Sélectionnez un site source' }}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={(v) => { field.onChange(v); setValue('articleId', ''); setArticleSearch(''); setSelectedArticleId(''); }}>
                        <SelectTrigger className="bg-white/[0.03] border-white/[0.08] rounded-lg">
                          <SelectValue placeholder="Site source" />
                        </SelectTrigger>
                        <SelectContent>
                          {sites.map((site: Site) => (
                            <SelectItem key={site.id} value={site.id}>{site.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.fromSiteId && <p className="text-[10px] text-rose-400">{errors.fromSiteId.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-white/40">Destination</label>
                  <Controller
                    name="toSiteId"
                    control={control}
                    rules={{ required: 'Sélectionnez un site destination' }}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="bg-white/[0.03] border-white/[0.08] rounded-lg">
                          <SelectValue placeholder="Site destination" />
                        </SelectTrigger>
                        <SelectContent>
                          {sites.map((site: Site) => (
                            <SelectItem key={site.id} value={site.id}>{site.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.toSiteId && <p className="text-[10px] text-rose-400">{errors.toSiteId.message}</p>}
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Controller
                  name="siteId"
                  control={control}
                  rules={{ required: 'Sélectionnez un site' }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={(v) => { field.onChange(v); setValue('articleId', ''); setArticleSearch(''); setSelectedArticleId(''); }}>
                      <SelectTrigger className="bg-white/[0.03] border-white/[0.08] rounded-lg">
                        <SelectValue placeholder="Sélectionner un site" />
                      </SelectTrigger>
                      <SelectContent>
                        {sites.map((site: Site) => (
                          <SelectItem key={site.id} value={site.id}>{site.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.siteId && <p className="text-[10px] text-rose-400">{errors.siteId.message}</p>}
              </div>
            )}
          </div>

          {/* Section 3 — Article */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-5 w-5 items-center justify-center rounded-md bg-white/[0.06]">
                <Package className="h-3 w-3 text-white/40" />
              </div>
              <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Article</span>
            </div>

            <input type="hidden" {...register('articleId', { required: 'Veuillez sélectionner un article' })} />

            {/* Mode simplifié : article pré-sélectionné (depuis Réapprovisionner) */}
            {defaultArticleId ? (() => {
              const lockedArticle = articles.find(a => a.id === defaultArticleId)
              return lockedArticle ? (
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${activeTypeConfig.bgColor} ${activeTypeConfig.color} ring-1 ring-inset ring-current/20`}>
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-current bg-current/20">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{lockedArticle.name}</p>
                    <p className="text-[10px] opacity-60 font-mono mt-0.5">{lockedArticle.reference}</p>
                  </div>
                </div>
              ) : null
            })() : (
              /* Mode normal : recherche + liste complète */
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
                  <Input
                    placeholder="Rechercher un article…"
                    value={articleSearch}
                    onChange={(e) => setArticleSearch(e.target.value)}
                    className="pl-9 h-9 text-sm bg-white/[0.03] border-white/[0.08] rounded-lg placeholder:text-white/25"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto rounded-xl border border-white/[0.06] bg-white/[0.02] divide-y divide-white/[0.04]">
                  {filteredArticles.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-6">
                      <Package className="h-5 w-5 text-white/20" />
                      <p className="text-xs text-white/30">
                        {activeSiteId ? 'Aucun article en stock sur ce site' : 'Aucun article trouvé'}
                      </p>
                    </div>
                  ) : (
                    filteredArticles.slice(0, 50).map((article) => {
                      const isSelected = selectedArticleId === article.id
                      return (
                        <button
                          key={article.id}
                          type="button"
                          onClick={() => handleArticleSelect(article.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm transition-all cursor-pointer
                            ${isSelected
                              ? `${activeTypeConfig.bgColor} ${activeTypeConfig.color} ring-1 ring-inset ring-current/20`
                              : 'hover:bg-white/[0.04] text-white/70'
                            }
                          `}
                        >
                          <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                            isSelected
                              ? 'border-current bg-current/20'
                              : 'border-white/15 bg-transparent'
                          }`}>
                            {isSelected && <Check className="h-3 w-3" />}
                          </div>
                          <span className="truncate flex-1 font-medium text-[13px]">{article.name}</span>
                          <span className="text-[10px] text-white/25 font-mono shrink-0 bg-white/[0.04] px-1.5 py-0.5 rounded">
                            {article.reference}
                          </span>
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            )}
            {errors.articleId && <p className="text-[10px] text-rose-400">{errors.articleId.message}</p>}
          </div>

          {/* Section 4 — Quantité + Raison */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-white/[0.06]">
                  <Hash className="h-3 w-3 text-white/40" />
                </div>
                <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Quantité</span>
              </div>
              <Input
                id="quantity"
                type="number"
                min={1}
                {...register('quantity', {
                  required: 'La quantité est requise',
                  min: { value: 1, message: 'Minimum 1' },
                  valueAsNumber: true,
                })}
                className="h-10 text-lg font-bold text-center bg-white/[0.03] border-white/[0.08] rounded-lg tabular-nums"
              />
              {errors.quantity && <p className="text-[10px] text-rose-400 mt-1">{errors.quantity.message}</p>}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-white/[0.06]">
                  <MessageSquare className="h-3 w-3 text-white/40" />
                </div>
                <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Raison</span>
              </div>
              <textarea
                id="reason"
                {...register('reason')}
                rows={2}
                placeholder="Optionnel…"
                className="w-full resize-none rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.06]">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] transition-all"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className={`border-0 shadow-lg transition-all ${
                selectedType === 'ENTRY'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-emerald-500/25'
                  : selectedType === 'EXIT'
                    ? 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-rose-500/25'
                    : selectedType === 'TRANSFER'
                      ? 'bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 shadow-violet-500/25'
                      : 'bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 shadow-sky-500/25'
              }`}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer le mouvement
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { MovementFormDialog }
