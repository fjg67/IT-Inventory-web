// Page Tableau de bord — vue d'ensemble premium avec KPIs, graphiques et listes

import { useQuery } from '@tanstack/react-query'
import { Package, AlertTriangle, TrendingDown, Activity, MapPin, LayoutDashboard, Building2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { dashboardService } from '@/services/dashboard.service'
import { alertsService } from '@/services/alerts.service'
import { stockService } from '@/services/stock.service'
import { sitesService } from '@/services/sites.service'
import { useSidebarStore } from '@/stores/sidebarStore'
import { useSiteStore } from '@/stores/siteStore'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { MovementChart, TopArticlesChart, CategoryChart } from '@/components/dashboard/Charts'
import { AlertList } from '@/components/dashboard/AlertList'
import { RecentMovements } from '@/components/dashboard/RecentMovements'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { setAlertCount } = useSidebarStore()
  const selectedWorkspace = useSiteStore((s) => s.selectedSite)
  const setFilterSiteName = useSiteStore((s) => s.setFilterSiteName)

  // Si le workspace sélectionné est un sous-site, pré-sélectionner ce site dans les pills
  const initialSiteId = selectedWorkspace?.parentSiteId ? selectedWorkspace.id : ''
  const [selectedSiteId, setSelectedSiteId] = useState<string>(initialSiteId)

  // Récupération des sites
  const { data: sitesData } = useQuery({
    queryKey: ['sites'],
    queryFn: () => sitesService.getAll(),
  })

  // Filtrer les sites selon le workspace sélectionné
  const allSites = sitesData?.sites ?? []
  const sites = selectedWorkspace
    ? selectedWorkspace.parentSiteId
      ? allSites.filter((s) => s.parentSiteId === selectedWorkspace.parentSiteId)
      : allSites.filter((s) => s.parentSiteId === selectedWorkspace.id || s.id === selectedWorkspace.id)
    : allSites.filter((s) => !s.parentSiteId)

  // Auto-sélectionner le premier site si aucun n'est choisi
  useEffect(() => {
    if (!selectedSiteId && sites.length > 0) {
      const first = sites[0]
      if (first) {
        setSelectedSiteId(first.id)
        setFilterSiteName(first.name)
      }
    }
  }, [sites, selectedSiteId, setFilterSiteName])

  const siteId = selectedSiteId || undefined

  // Récupération des statistiques
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard', 'stats', siteId],
    queryFn: () => dashboardService.getStats(siteId),
  })

  // Données graphiques
  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ['dashboard', 'movements-chart', siteId],
    queryFn: () => dashboardService.getMovementChart(siteId),
  })

  const { data: topArticlesData, isLoading: topLoading } = useQuery({
    queryKey: ['dashboard', 'top-articles', siteId],
    queryFn: () => dashboardService.getTopArticles(siteId),
  })

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['dashboard', 'categories', siteId],
    queryFn: () => dashboardService.getCategoryDistribution(siteId),
  })

  // Alertes (filtrées par site)
  const { data: alertsData, isLoading: alertsLoading } = useQuery({
    queryKey: ['alerts', siteId],
    queryFn: () => alertsService.getAlerts(siteId),
  })

  // Derniers mouvements (filtrés par site)
  const { data: movementsData, isLoading: movementsLoading } = useQuery({
    queryKey: ['movements', 'recent', siteId],
    queryFn: () => stockService.getMovements({ limit: 10, page: 1, siteId }),
  })

  // Mise à jour du badge alertes dans la sidebar
  useEffect(() => {
    if (alertsData?.alerts) {
      setAlertCount(alertsData.alerts.length)
    }
  }, [alertsData, setAlertCount])

  const stats = statsData?.stats
  const deltaArticles = stats && stats.totalArticlesLastMonth > 0
    ? Math.round(((stats.totalArticles - stats.totalArticlesLastMonth) / stats.totalArticlesLastMonth) * 100)
    : 0

  // Heure actuelle formatée
  const now = new Date()
  const greeting = now.getHours() < 12 ? 'Bonjour' : now.getHours() < 18 ? 'Bon après-midi' : 'Bonsoir'
  const dateStr = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="space-y-6">
      {/* Premium header with gradient */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary tracking-tight">
                {greeting} 👋
              </h1>
              <p className="text-sm text-text-muted capitalize">{dateStr}</p>
            </div>
          </div>
        </div>

        {/* Site selector pills — premium design */}
        <div className="relative flex items-center gap-1 p-1.5 rounded-2xl bg-surface/60 backdrop-blur-xl border border-border/50 shadow-lg shadow-black/5 overflow-x-auto scrollbar-hide">
          {/* Fond glassmorphism subtil */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/[0.03] via-transparent to-violet-500/[0.03]" />

          {sites.map((site) => (
            <motion.button
              key={site.id}
              onClick={() => { setSelectedSiteId(site.id); setFilterSiteName(site.name) }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`relative z-10 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 flex items-center gap-2 whitespace-nowrap shrink-0 ${
                selectedSiteId === site.id
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-[0_2px_12px_rgba(59,130,246,0.4)]'
                  : 'text-text-muted hover:text-text-primary hover:bg-white/5'
              }`}
            >
              <div className={`flex h-5 w-5 items-center justify-center rounded-md transition-all duration-300 ${
                selectedSiteId === site.id
                  ? 'bg-white/20'
                  : 'bg-border/30'
              }`}>
                <Building2 className="h-3 w-3" />
              </div>
              {site.name}
              {selectedSiteId === site.id && (
                <motion.div
                  layoutId="site-active-dot"
                  className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.6)]"
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <StatsCard
          title="Total articles"
          value={stats?.totalArticles ?? 0}
          delta={deltaArticles}
          icon={Package}
          color="blue"
          loading={statsLoading}
          index={0}
          onClick={() => navigate(siteId ? `/articles?siteId=${siteId}` : '/articles')}
          sparklineData={stats?.sparklines?.totalArticles}
        />
        <StatsCard
          title="En rupture"
          value={stats?.outOfStock ?? 0}
          icon={TrendingDown}
          color="danger"
          loading={statsLoading}
          index={1}
          onClick={() => navigate(siteId ? `/alerts?siteId=${siteId}` : '/alerts')}
          sparklineData={stats?.sparklines?.outOfStock}
        />
        <StatsCard
          title="Stock bas"
          value={stats?.lowStock ?? 0}
          icon={AlertTriangle}
          color="warning"
          loading={statsLoading}
          index={2}
          onClick={() => navigate(siteId ? `/alerts?siteId=${siteId}` : '/alerts')}
          sparklineData={stats?.sparklines?.lowStock}
        />
        <StatsCard
          title="Mouvements du jour"
          value={stats?.todayMovements ?? 0}
          icon={Activity}
          color="green"
          loading={statsLoading}
          index={3}
          onClick={() => navigate(siteId ? `/movements?siteId=${siteId}` : '/movements')}
          sparklineData={stats?.sparklines?.movements}
        />
      </div>

      {/* Graphique principal */}
      <MovementChart
        data={chartData?.data ?? []}
        loading={chartLoading}
      />

      {/* Graphiques secondaires */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopArticlesChart
          data={topArticlesData?.data ?? []}
          loading={topLoading}
        />
        <CategoryChart
          data={categoriesData?.data ?? []}
          loading={categoriesLoading}
        />
      </div>

      {/* Listes rapides */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AlertList
          alerts={alertsData?.alerts ?? []}
          loading={alertsLoading}
        />
        <RecentMovements
          movements={movementsData?.movements ?? []}
          loading={movementsLoading}
        />
      </div>
    </div>
  )
}
