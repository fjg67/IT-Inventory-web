// Page Articles — liste complète avec filtres, pagination, création et modification

import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  Search,
  Plus,
  Package,
  Eye,
  Pencil,
  Archive,
  Filter,
  Camera,
  X,
  AlertTriangle as AlertIcon,
  MapPin,
  ChevronRight,
  Clock,
  Tag,
  Cpu,
  MoreVertical,
  ScanBarcode,
} from 'lucide-react'

import type { Article, ArticleFormData, ArticleFilters, StockStatus } from '@/types'
import { articlesService } from '@/services/articles.service'
import { sitesService } from '@/services/sites.service'
import { useAuth } from '@/hooks/useAuth'

import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { DataTablePagination } from '@/components/shared/DataTablePagination'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { BarcodeScanner } from '@/components/shared/BarcodeScanner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

// Blueprint Forge sub-components
import { ArticleFormSectionHeader } from '@/components/articles/ArticleFormSectionHeader'
import { ArticleFormInput } from '@/components/articles/ArticleFormInput'
import { ArticleFormSelect } from '@/components/articles/ArticleFormSelect'
import { SiteSelector } from '@/components/articles/SiteSelector'
import { StockInputCard } from '@/components/articles/StockInputCard'
import { PhotoUploadZone } from '@/components/articles/PhotoUploadZone'
import { ArticleFormFooter } from '@/components/articles/ArticleFormFooter'
import { ArticleSuccessCelebration } from '@/components/articles/ArticleSuccessCelebration'

// --- Constantes ---

const PAGE_SIZE = 25

const CODE_FAMILLES = [
  { value: '10', icon: '🏷️' },
  { value: '11', icon: '🏷️' },
  { value: '12', icon: '🏷️' },
  { value: '13', icon: '🏷️' },
  { value: '14', icon: '🏷️' },
  { value: '15', icon: '🏷️' },
  { value: '16', icon: '🏷️' },
  { value: '17', icon: '🏷️' },
  { value: '50', icon: '🏷️' },
]

const FAMILLES = [
  { value: 'Accessoires', icon: '🖱️' },
  { value: 'Audio', icon: '🎧' },
  { value: 'Câble', icon: '🔌' },
  { value: 'Chargeur', icon: '🔋' },
  { value: 'Electrique', icon: '⚡' },
  { value: 'Ergonomie', icon: '🪑' },
  { value: 'Kit', icon: '📦' },
]

const TYPES = [
  { value: 'Souris', icon: '🖱️' },
  { value: 'Clavier', icon: '⌨️' },
  { value: 'Dock', icon: '🔲' },
  { value: 'HUB USB', icon: '🔌' },
  { value: 'Sécurité', icon: '🔒' },
  { value: 'Pointeur laser', icon: '🔴' },
  { value: 'Dongle', icon: '📡' },
  { value: 'Protection', icon: '🛡️' },
  { value: 'Clavier / Souris', icon: '⌨️' },
  { value: 'Casque', icon: '🎧' },
  { value: 'Base de charge', icon: '🔋' },
  { value: 'Affichage', icon: '🖥️' },
  { value: 'Rallonge', icon: '🔌' },
  { value: 'USB A / USB C', icon: '🔗' },
  { value: 'USB C / Lightning', icon: '🔗' },
  { value: 'USB A / Micro USB', icon: '🔗' },
  { value: 'Réseau', icon: '🌐' },
  { value: 'USB C', icon: '🔗' },
  { value: 'Alimentation', icon: '⚡' },
  { value: 'Multiprise', icon: '🔌' },
  { value: "Bras d'écran", icon: '🖥️' },
  { value: 'Scanner doc', icon: '📄' },
  { value: 'Ensemble de matériel', icon: '📦' },
]

const SOUS_TYPES = [
  { value: 'Filaire', icon: '🔗' },
  { value: 'Agence', icon: '🏢' },
  { value: 'Siège', icon: '🏛️' },
  { value: 'Sans fil', icon: '📶' },
  { value: 'D6000', icon: '🔲' },
  { value: '4 ports', icon: '🔌' },
  { value: 'Filtre de confidentialité 14', icon: '🛡️' },
  { value: 'Filtre de confidentialité 15.6', icon: '🛡️' },
  { value: 'Filtre de confidentialité 16', icon: '🛡️' },
  { value: 'Filtre de confidentialité VIP', icon: '🛡️' },
  { value: 'Tablette', icon: '📱' },
  { value: 'Pour présentation', icon: '📊' },
  { value: 'Kit clavier souris', icon: '⌨️' },
  { value: 'Clavier / souris', icon: '⌨️' },
  { value: 'Plantronics', icon: '🎧' },
  { value: 'Sacoche', icon: '💼' },
  { value: 'Sac à dos', icon: '🎒' },
  { value: 'Plantronics SF V1', icon: '🎧' },
  { value: 'Plantronics SF V2', icon: '🎧' },
  { value: 'Plantronics filaire', icon: '🎧' },
  { value: 'Epsos', icon: '📷' },
  { value: 'Poly', icon: '🎙️' },
  { value: 'DisplayPort / USB C 1m', icon: '🔗' },
  { value: 'DisplayPort / HDMI 3 mètre', icon: '🔗' },
  { value: 'HDMI 3 et 2 mètre', icon: '🔗' },
  { value: 'HDMI 5 et 10 mètre', icon: '🔗' },
  { value: '2m', icon: '📏' },
  { value: '3m', icon: '📏' },
  { value: 'Générique', icon: '⚪' },
  { value: 'TP', icon: '🔌' },
  { value: '65 watt', icon: '⚡' },
  { value: 'Mini UC', icon: '💻' },
  { value: 'Bras Ergotron', icon: '🖥️' },
  { value: 'Avec feuille à feuille', icon: '📄' },
  { value: 'Projecteur', icon: '📽️' },
  { value: 'Kit audio', icon: '🎧' },
  { value: 'Kit complet', icon: '📦' },
]

const BRANDS = [
  { value: 'DELL', icon: '💻' },
  { value: 'Cherry', icon: '🍒' },
  { value: 'StarTec', icon: '⭐' },
  { value: '3M', icon: '🏷️' },
  { value: 'Générique', icon: '⚪' },
  { value: 'Plantronics', icon: '🎧' },
  { value: 'Aurora', icon: '✨' },
  { value: 'Urban Factory', icon: '🏭' },
  { value: 'Epsos', icon: '📷' },
  { value: 'Poly', icon: '🎙️' },
  { value: 'HP', icon: '💻' },
  { value: 'Ergotron', icon: '🖥️' },
  { value: 'Fujitsu', icon: '💻' },
]

const EMPLACEMENTS = [
  { value: 'Stock 5 - R2E3', icon: '📍' },
  { value: 'Stock 5 - R2E4', icon: '📍' },
  { value: 'Stock 5 - R4E3', icon: '📍' },
  { value: 'Stock 5 - R4E4', icon: '📍' },
  { value: 'Stock 5 - R5E2', icon: '📍' },
  { value: 'Stock 5 - R5E3', icon: '📍' },
  { value: 'Stock 5 - R5E5', icon: '📍' },
  { value: 'Stock 8 - Armoire', icon: '🗄️' },
  { value: 'Stock 8 - Tiroir', icon: '🗃️' },
]



// --- Composant badge statut ---

function StatusBadge({ status }: { status?: StockStatus }) {
  switch (status) {
    case 'ok':
      return <Badge variant="success">OK</Badge>
    case 'low':
      return <Badge variant="warning">Bas</Badge>
    case 'out':
      return <Badge variant="danger">Rupture</Badge>
    default:
      return <Badge variant="outline">—</Badge>
  }
}

// --- Stock indicator (style mobile) ---

function StockIndicator({ stock, minStock, status }: { stock: number; minStock: number; status?: StockStatus }) {
  const color =
    status === 'out'
      ? 'text-red-400 bg-red-500/10 border-red-500/30'
      : status === 'low'
        ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
        : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'

  const icon =
    status === 'out'
      ? '🔴'
      : status === 'low'
        ? '⚠️'
        : '✅'

  return (
    <div className={`flex flex-col items-center justify-center px-3 py-2 rounded-xl border ${color} min-w-[60px]`}>
      <span className="text-xs mb-0.5">{icon}</span>
      <span className="text-lg font-bold tabular-nums leading-none">{stock}</span>
      <span className="text-[10px] text-text-muted mt-0.5">pcs</span>
    </div>
  )
}

// --- Temps relatif ---
function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 1) return "À l'instant"
  if (diffMin < 60) return `il y a ${diffMin}min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `il y a ${diffH}h`
  const diffD = Math.floor(diffH / 24)
  if (diffD < 30) return `il y a ${diffD}j`
  const diffM = Math.floor(diffD / 30)
  return `il y a ${diffM} mois`
}

// --- Lookup d'icône pour les familles ---
function getFamilleIcon(category: string): string {
  const found = FAMILLES.find((f) => f.value === category)
  return found?.icon ?? '📦'
}

function getBrandIcon(brand: string | null): string {
  if (!brand) return ''
  const found = BRANDS.find((b) => b.value === brand)
  return found?.icon ?? '🏷️'
}

// --- Composant principal ---

export default function ArticlesPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const { isAdmin } = useAuth()
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Lire le siteId depuis l'URL si présent
  const urlSiteId = searchParams.get('siteId') || undefined

  // Auto-focus recherche si ?focus=search
  useEffect(() => {
    if (searchParams.get('focus') === 'search') {
      setTimeout(() => searchInputRef.current?.focus(), 100)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  // État des filtres et de la pagination
  const [filters, setFilters] = useState<ArticleFilters>({
    page: 1,
    limit: PAGE_SIZE,
    site: urlSiteId,
  })
  const [searchInput, setSearchInput] = useState('')

  // État des modales
  const [formOpen, setFormOpen] = useState(false)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [archiveTarget, setArchiveTarget] = useState<Article | null>(null)

  // Recherche avec debounce (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput || undefined, page: 1 }))
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  // Celebration animation state
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationName, setCelebrationName] = useState('')

  // Récupération des sites pour le filtre
  const { data: sitesData } = useQuery({
    queryKey: ['sites'],
    queryFn: () => sitesService.getAll(),
  })
  const sites = sitesData?.sites ?? []

  // Récupération des articles
  const { data, isLoading, isError } = useQuery({
    queryKey: ['articles', filters],
    queryFn: () => articlesService.getAll(filters),
    placeholderData: (prev) => prev,
  })

  const articles = data?.articles ?? []
  const totalPages = data?.totalPages ?? 1
  const total = data?.total ?? 0

  // --- Mutations ---

  // Création d'un article
  const createMutation = useMutation({
    mutationFn: (formData: ArticleFormData) => articlesService.create(formData),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['articles'] })
      handleCloseForm()
      // Trigger celebration animation
      setCelebrationName(variables.name)
      setShowCelebration(true)
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la création')
    },
  })

  // Modification d'un article
  const updateMutation = useMutation({
    mutationFn: ({ id, data: formData }: { id: string; data: Partial<ArticleFormData> }) =>
      articlesService.update(id, formData),
    onSuccess: () => {
      toast.success('Article modifié avec succès')
      queryClient.invalidateQueries({ queryKey: ['articles'] })
      handleCloseForm()
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification')
    },
  })

  // Archivage d'un article
  const archiveMutation = useMutation({
    mutationFn: (id: string) => articlesService.delete(id),
    onSuccess: () => {
      toast.success('Article archivé')
      queryClient.invalidateQueries({ queryKey: ['articles'] })
      setArchiveTarget(null)
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Erreur lors de l'archivage")
    },
  })

  // --- Handlers ---

  const handleCloseForm = useCallback(() => {
    setFormOpen(false)
    setEditingArticle(null)
  }, [])

  const handleOpenCreate = useCallback(() => {
    setEditingArticle(null)
    setFormOpen(true)
  }, [])

  const handleOpenEdit = useCallback((article: Article) => {
    setEditingArticle(article)
    setFormOpen(true)
  }, [])

  const handleFilterCategory = useCallback((value: string) => {
    setFilters((prev) => ({
      ...prev,
      category: value === '_all' ? undefined : value,
      page: 1,
    }))
  }, [])

  const handleFilterStatus = useCallback((value: string) => {
    setFilters((prev) => ({
      ...prev,
      status: value === '_all' ? undefined : (value as StockStatus),
      page: 1,
    }))
  }, [])

  const handleFilterSite = useCallback((value: string) => {
    setFilters((prev) => ({
      ...prev,
      site: value === '_all' ? undefined : value,
      page: 1,
    }))
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }, [])

  // --- Rendu ---

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <PageHeader
        title="Articles"
        description="Gestion de l'inventaire des articles informatiques"
        action={
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvel article
          </Button>
        }
      />

      {/* Barre de recherche et filtres */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="glass-card p-4 space-y-4"
      >
        {/* Recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input
            ref={searchInputRef}
            placeholder="Rechercher par nom, référence ou code-barres…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-text-muted" />
            <span className="text-sm text-text-secondary">Filtres :</span>
          </div>

          {/* Filtre catégorie */}
          <Select
            value={filters.category ?? '_all'}
            onValueChange={handleFilterCategory}
          >
            <SelectTrigger className="w-36 sm:w-44">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">Toutes catégories</SelectItem>
              {FAMILLES.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  <span className="flex items-center gap-2">{f.icon} {f.value}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filtre site */}
          <Select
            value={filters.site ?? '_all'}
            onValueChange={handleFilterSite}
          >
            <SelectTrigger className="w-36 sm:w-44">
              <SelectValue placeholder="Site" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">Tous les sites</SelectItem>
              {sites.filter(s => s.isActive).map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  <span className="flex items-center gap-2"><MapPin className="h-3 w-3" /> {s.name}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filtre statut */}
          <Select
            value={filters.status ?? '_all'}
            onValueChange={handleFilterStatus}
          >
            <SelectTrigger className="w-28 sm:w-36">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">Tous</SelectItem>
              <SelectItem value="ok">OK</SelectItem>
              <SelectItem value="low">Bas</SelectItem>
              <SelectItem value="out">Rupture</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Liste des articles en cartes */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {isLoading ? (
          <CardSkeleton />
        ) : isError ? (
          <div className="glass-card p-8 text-center">
            <p className="text-danger">Erreur lors du chargement des articles.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['articles'] })}
            >
              Réessayer
            </Button>
          </div>
        ) : articles.length === 0 ? (
          <div className="glass-card overflow-hidden">
            <EmptyState
              icon={Package}
              title="Aucun article trouvé"
              description={
                filters.search || filters.category || filters.site || filters.status
                  ? 'Essayez de modifier vos filtres de recherche.'
                  : "Commencez par ajouter votre premier article à l'inventaire."
              }
              action={
                !filters.search && !filters.category && !filters.site && !filters.status ? (
                  <Button onClick={handleOpenCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nouvel article
                  </Button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <>
            {/* Compteur résultats */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-text-muted">
                {total} article{total > 1 ? 's' : ''} trouvé{total > 1 ? 's' : ''}
              </p>
            </div>

            {/* Grille de cartes articles */}
            <div className="space-y-3">
              {articles.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.03 }}
                  className="group glass-card p-0 overflow-hidden cursor-pointer hover:ring-1 hover:ring-primary/30 transition-all duration-200"
                  onClick={() => navigate(`/articles/${article.id}`)}
                >
                  <div className="flex items-stretch">
                    {/* Image / Icône article — masqué sur mobile */}
                    <div className="hidden sm:flex flex-shrink-0 w-20 items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 border-r border-border">
                      {article.imageUrl ? (
                        <img
                          src={article.imageUrl.startsWith('http') ? article.imageUrl : `http://localhost:3001${article.imageUrl}`}
                          alt={article.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <Package className="h-8 w-8 text-primary/60" strokeWidth={1.5} />
                          <span className="text-lg">{getFamilleIcon(article.category)}</span>
                        </div>
                      )}
                    </div>

                    {/* Contenu principal */}
                    <div className="flex-1 min-w-0 p-3 sm:p-4">
                      {/* Ligne 1 : Nom + Actions */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-text-primary text-base leading-tight truncate">
                          {article.name}
                        </h3>
                        <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/articles/${article.id}`)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Voir
                              </DropdownMenuItem>
                              {isAdmin && (
                                <>
                                  <DropdownMenuItem onClick={() => handleOpenEdit(article)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Modifier
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-danger focus:text-danger"
                                    onClick={() => setArchiveTarget(article)}
                                  >
                                    <Archive className="mr-2 h-4 w-4" />
                                    Archiver
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Ligne 2 : Badges métadonnées */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-2">
                        {/* Référence (code-barres) */}
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          <Tag className="h-3 w-3" />
                          {article.reference}
                        </span>

                        {/* Famille */}
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20">
                          {getFamilleIcon(article.category)} {article.category}
                        </span>

                        {/* Marque */}
                        {article.brand && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-300 border border-orange-500/20">
                            {getBrandIcon(article.brand)} {article.brand}
                          </span>
                        )}

                        {/* Type */}
                        {article.articleType && (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20">
                            <Cpu className="h-3 w-3" />
                            {article.articleType}
                          </span>
                        )}
                      </div>

                      {/* Ligne 3 : Sites, emplacement + date */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Sites où l'article est stocké */}
                        {article.stocks && article.stocks.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                            <MapPin className="h-3 w-3" />
                            {article.stocks.map(s => s.site?.name).filter(Boolean).join(', ') || '—'}
                          </span>
                        )}

                        {/* Emplacement */}
                        {article.emplacement && (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-pink-500/10 text-pink-300 border border-pink-500/20">
                            📍 {article.emplacement}
                          </span>
                        )}

                        {article.sousType && (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-[var(--sidebar-hover)] text-text-muted border border-border">
                            ⚙️ {article.sousType}
                          </span>
                        )}
                        <span className="text-[11px] text-text-muted flex items-center gap-1 ml-auto">
                          <Clock className="h-3 w-3" />
                          Modifié {timeAgo(article.updatedAt)}
                        </span>
                        {/* Stock compact sur mobile */}
                        <span className="sm:hidden inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-[var(--sidebar-hover)] border border-border">
                          📦 {article.totalStock ?? 0}
                        </span>
                      </div>
                    </div>

                    {/* Indicateur stock à droite */}
                    <div className="hidden sm:flex items-center gap-2 pr-4 pl-2 flex-shrink-0">
                      <StockIndicator
                        stock={article.totalStock ?? 0}
                        minStock={article.minStock}
                        status={article.status}
                      />
                      <ChevronRight className="h-4 w-4 text-text-muted group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            <div className="glass-card mt-4 px-4">
              <DataTablePagination
                page={filters.page ?? 1}
                totalPages={totalPages}
                total={total}
                onPageChange={handlePageChange}
                pageSize={PAGE_SIZE}
              />
            </div>
          </>
        )}
      </motion.div>

      {/* Modale de création/modification */}
      <ArticleFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseForm()
        }}
        article={editingArticle}
        onSubmit={(formData) => {
          if (editingArticle) {
            updateMutation.mutate({ id: editingArticle.id, data: formData })
          } else {
            createMutation.mutate(formData)
          }
        }}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Celebration animation */}
      <ArticleSuccessCelebration
        show={showCelebration}
        articleName={celebrationName}
        onComplete={() => setShowCelebration(false)}
      />

      {/* Confirmation d'archivage */}
      <ConfirmDialog
        open={!!archiveTarget}
        onOpenChange={(open) => {
          if (!open) setArchiveTarget(null)
        }}
        title="Archiver l'article"
        description={`Êtes-vous sûr de vouloir archiver « ${archiveTarget?.name} » ? Cette action est réversible.`}
        onConfirm={() => {
          if (archiveTarget) archiveMutation.mutate(archiveTarget.id)
        }}
        variant="warning"
        confirmText="Archiver"
        loading={archiveMutation.isPending}
      />
    </div>
  )
}

// --- Modale formulaire article — Blueprint Forge ---

interface ArticleFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  article: Article | null
  onSubmit: (data: ArticleFormData) => void
  loading: boolean
}

function ArticleFormDialog({
  open,
  onOpenChange,
  article,
  onSubmit,
  loading,
}: ArticleFormDialogProps) {
  const isEditing = !!article
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [descLength, setDescLength] = useState(0)
  const [scannerOpen, setScannerOpen] = useState(false)

  // Récupération des sites pour le sélecteur
  const { data: sitesData } = useQuery({
    queryKey: ['sites'],
    queryFn: () => sitesService.getAll(),
    staleTime: 60_000,
  })
  const sites = sitesData?.sites ?? []

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ArticleFormData>({
    defaultValues: {
      reference: '',
      name: '',
      description: '',
      category: '',
      codeFamille: '',
      articleType: '',
      sousType: '',
      emplacement: '',
      brand: '',
      barcode: '',
      unit: 'unité',
      minStock: 5,
      siteId: '',
      initialStock: 0,
    },
  })

  const descValue = watch('description')
  const watchedRef = watch('reference')
  const watchedName = watch('name')
  const watchedCategory = watch('category')
  const watchedSiteId = watch('siteId')
  const watchedMinStock = watch('minStock')

  useEffect(() => {
    setDescLength(descValue?.length ?? 0)
  }, [descValue])

  // Calcul du pourcentage de progression
  const progress = (() => {
    const required = [
      !!watchedRef,
      !!watchedName,
      !!watchedCategory,
      ...(isEditing ? [] : [!!watchedSiteId]),
      watchedMinStock >= 0,
    ]
    const filled = required.filter(Boolean).length
    return Math.round((filled / required.length) * 100)
  })()

  // Réinitialiser le formulaire quand on ouvre la modale
  useEffect(() => {
    if (open) {
      if (article) {
        reset({
          reference: article.reference,
          name: article.name,
          description: article.description ?? '',
          category: article.category,
          codeFamille: article.codeFamille ?? '',
          articleType: article.articleType ?? '',
          sousType: article.sousType ?? '',
          emplacement: article.emplacement ?? '',
          brand: article.brand ?? '',
          barcode: article.barcode ?? '',
          unit: article.unit,
          minStock: article.minStock,
          siteId: '',
          initialStock: 0,
        })
        setImagePreview(article.imageUrl ?? null)
      } else {
        reset({
          reference: '',
          name: '',
          description: '',
          category: '',
          codeFamille: '',
          articleType: '',
          sousType: '',
          emplacement: '',
          brand: '',
          barcode: '',
          unit: 'unité',
          minStock: 5,
          siteId: '',
          initialStock: 0,
        })
        setImagePreview(null)
      }
      setImageFile(null)
    }
  }, [open, article, reset])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setValue('imageUrl', undefined)
  }

  const onFormSubmit = handleSubmit(async (data) => {
    let imageUrl = data.imageUrl
    // Upload image si un nouveau fichier a été sélectionné
    if (imageFile) {
      try {
        setUploading(true)
        const res = await articlesService.uploadImage(imageFile)
        imageUrl = res.imageUrl
      } catch {
        toast.error("Erreur lors de l'upload de l'image")
        return
      } finally {
        setUploading(false)
      }
    }
    onSubmit({ ...data, imageUrl })
  })

  // Option lists for selects
  const codeFamilleOptions = CODE_FAMILLES.map(c => ({ value: c.value, label: c.value, icon: c.icon }))
  const familleOptions = FAMILLES.map(f => ({ value: f.value, label: f.value, icon: f.icon }))
  const typeOptions = TYPES.map(t => ({ value: t.value, label: t.value, icon: t.icon }))
  const sousTypeOptions = SOUS_TYPES.map(st => ({ value: st.value, label: st.value, icon: st.icon }))
  const brandOptions = BRANDS.map(b => ({ value: b.value, label: b.value, icon: b.icon }))
  const emplacementOptions = EMPLACEMENTS.map(e => ({ value: e.value, label: e.value, icon: e.icon }))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto border-border bg-surface/98 backdrop-blur-2xl shadow-[0_0_80px_rgba(0,0,0,0.3)] p-0">
        {/* Blueprint grid background overlay */}
        <div
          className="absolute inset-0 rounded-lg pointer-events-none opacity-[0.02]"
          style={{
            backgroundImage: 'linear-gradient(rgba(59,130,246,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.6) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Orbe décoratif */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/[0.04] rounded-full blur-3xl pointer-events-none" />

        {/* ── Sticky Header ── */}
        <div className="sticky top-0 z-20 bg-surface/95 backdrop-blur-xl border-b border-border px-6 pt-6 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-[0_0_25px_rgba(59,130,246,0.25)]">
                <Package className="h-5 w-5 text-white" />
              </div>
              {/* Glow ring */}
              <div className="absolute inset-0 rounded-xl bg-blue-500/20 blur-md -z-10" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogHeader className="p-0 space-y-0">
                <DialogTitle className="text-lg font-bold text-text-primary" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {isEditing ? "Modifier l'article" : 'Nouvel article'}
                </DialogTitle>
                <p className="text-[11px] text-text-muted mt-0.5" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {isEditing ? 'EDIT_MODE // Modifier les champs' : 'CREATE_MODE // Remplir les champs requis'}
                </p>
              </DialogHeader>
            </div>
            {/* Close button */}
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="p-2 rounded-lg hover:bg-[var(--sidebar-hover)] text-text-muted hover:text-text-secondary transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Progress bar in header */}
          <div className="mt-4 h-[2px] bg-[var(--sidebar-hover)] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 25 }}
            />
          </div>
        </div>

        {/* ── Form Body ── */}
        <form onSubmit={onFormSubmit} className="relative px-6 pb-0 space-y-1">

          {/* ═══ INFORMATIONS PRINCIPALES ═══ */}
          <ArticleFormSectionHeader icon={Tag} label="Informations principales" accentColor="blue" />

          <div className="space-y-3">
            {/* Référence + Scanner */}
            <div className="space-y-1.5">
              <ArticleFormInput
                label="Référence (code-barres)"
                required
                placeholder="EAN13, Code128..."
                error={errors.reference?.message}
                prefixIcon={Tag}
                suffixSlot={
                  <button
                    type="button"
                    onClick={() => setScannerOpen(true)}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 transition-all active:scale-95"
                    title="Scanner un code-barres"
                  >
                    <ScanBarcode className="h-5 w-5 text-white" />
                  </button>
                }
                {...register('reference', { required: 'La référence est requise' })}
              />
            </div>

            {/* Scanner de code-barres */}
            {scannerOpen && (
              <BarcodeScanner
                onScan={(code) => {
                  setValue('reference', code, { shouldValidate: true })
                  setScannerOpen(false)
                  toast.success(`Code-barres détecté : ${code}`)
                }}
                onClose={() => setScannerOpen(false)}
              />
            )}

            {/* Nom */}
            <ArticleFormInput
              label="Nom"
              required
              placeholder="Désignation de l'article"
              error={errors.name?.message}
              {...register('name', { required: 'Le nom est requis' })}
            />

            {/* Code famille + Famille */}
            <div className="grid grid-cols-2 gap-3">
              <Controller
                name="codeFamille"
                control={control}
                render={({ field }) => (
                  <ArticleFormSelect
                    label="Code famille"
                    placeholder="Code famille"
                    options={codeFamilleOptions}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                name="category"
                control={control}
                rules={{ required: 'La famille est requise' }}
                render={({ field }) => (
                  <ArticleFormSelect
                    label="Famille"
                    required
                    placeholder="Sélectionner"
                    options={familleOptions}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.category?.message}
                  />
                )}
              />
            </div>
          </div>

          {/* ═══ CLASSIFICATION ═══ */}
          <ArticleFormSectionHeader icon={Cpu} label="Classification" accentColor="purple" />

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Controller
                name="articleType"
                control={control}
                render={({ field }) => (
                  <ArticleFormSelect
                    label="Type"
                    placeholder="Type"
                    options={typeOptions}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                name="sousType"
                control={control}
                render={({ field }) => (
                  <ArticleFormSelect
                    label="Sous-type"
                    placeholder="Sous-type"
                    options={sousTypeOptions}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Controller
                name="brand"
                control={control}
                render={({ field }) => (
                  <ArticleFormSelect
                    label="Marque"
                    placeholder="Marque"
                    options={brandOptions}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    emptyLabel="Aucune"
                  />
                )}
              />
              <Controller
                name="emplacement"
                control={control}
                render={({ field }) => (
                  <ArticleFormSelect
                    label="Emplacement"
                    placeholder="Emplacement"
                    options={emplacementOptions}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>

          {/* ═══ SITE ═══ */}
          {!isEditing && (
            <>
              <ArticleFormSectionHeader icon={MapPin} label="Site" accentColor="cyan" />
              <Controller
                name="siteId"
                control={control}
                rules={{ required: 'Le site est requis' }}
                render={({ field }) => (
                  <SiteSelector
                    sites={sites}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    error={errors.siteId?.message}
                  />
                )}
              />
            </>
          )}

          {/* ═══ STOCK ═══ */}
          <ArticleFormSectionHeader icon={Package} label="Stock" accentColor="amber" />

          <div className="grid grid-cols-2 gap-3">
            {!isEditing && (
              <Controller
                name="initialStock"
                control={control}
                rules={{ min: { value: 0, message: '≥ 0' } }}
                render={({ field }) => (
                  <StockInputCard
                    label="Stock initial"
                    icon={Package}
                    accentColor="blue"
                    value={field.value ?? 0}
                    onChange={field.onChange}
                    min={0}
                  />
                )}
              />
            )}
            <Controller
              name="minStock"
              control={control}
              rules={{ required: 'Requis', min: { value: 0, message: '≥ 0' } }}
              render={({ field }) => (
                <StockInputCard
                  label="Seuil d'alerte"
                  icon={AlertIcon}
                  accentColor="amber"
                  value={field.value ?? 5}
                  onChange={field.onChange}
                  min={0}
                  error={errors.minStock?.message}
                />
              )}
            />
          </div>
          <p className="text-[10px] text-text-muted flex items-center gap-1.5 px-1 pb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            <AlertIcon className="h-3 w-3 text-amber-500/40" />
            alert_threshold // Notification si stock &lt; seuil
          </p>

          {/* ═══ INFORMATIONS COMPLÉMENTAIRES ═══ */}
          <ArticleFormSectionHeader icon={Pencil} label="Description" accentColor="emerald" />

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Description <span className="text-text-muted">(optionnel)</span>
            </label>
            <div className="relative">
              <textarea
                id="description"
                placeholder="Détails supplémentaires..."
                maxLength={200}
                rows={3}
                className="w-full rounded-xl border border-border bg-surface-elevated px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/40 focus:shadow-[0_0_15px_rgba(59,130,246,0.06)] transition-all resize-none"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
                {...register('description')}
              />
              <span className="absolute bottom-2 right-3 text-[10px] text-text-muted font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {descLength}/200
              </span>
            </div>
          </div>

          {/* ═══ PHOTO ═══ */}
          <ArticleFormSectionHeader icon={Camera} label="Photo" accentColor="rose" />
          <PhotoUploadZone
            preview={imagePreview}
            onFileSelect={handleImageSelect}
            onRemove={removeImage}
          />

          {/* ── Sticky Footer ── */}
          <ArticleFormFooter
            isEditing={isEditing}
            loading={loading || uploading}
            onCancel={() => onOpenChange(false)}
            progress={progress}
          />
        </form>
      </DialogContent>
    </Dialog>
  )
}

// --- Squelette de chargement (carte) ---

function CardSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="glass-card p-0 overflow-hidden">
          <div className="flex items-stretch">
            <div className="flex-shrink-0 w-20 bg-primary/5 border-r border-border flex items-center justify-center">
              <Skeleton className="h-10 w-10 rounded-lg" />
            </div>
            <div className="flex-1 p-4 space-y-2">
              <Skeleton className="h-5 w-48" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20 rounded-md" />
                <Skeleton className="h-5 w-24 rounded-md" />
                <Skeleton className="h-5 w-16 rounded-md" />
              </div>
              <Skeleton className="h-3 w-32" />
            </div>
            <div className="flex items-center pr-4 pl-2">
              <Skeleton className="h-14 w-14 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
