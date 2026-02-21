// Service tableau de bord — statistiques et données graphiques

import api from './api'
import type { DashboardStats, MovementChartData, TopArticleData, CategoryData } from '@/types'

export const dashboardService = {
  // Statistiques générales (KPIs)
  getStats: async (siteId?: string): Promise<{ success: boolean; stats: DashboardStats }> => {
    const params = siteId ? { siteId } : {}
    const response = await api.get('/dashboard/stats', { params })
    return response.data
  },

  // Graphique des mouvements (30 derniers jours)
  getMovementChart: async (siteId?: string): Promise<{ success: boolean; data: MovementChartData[] }> => {
    const params = siteId ? { siteId } : {}
    const response = await api.get('/dashboard/movements-chart', { params })
    return { success: response.data.success, data: response.data.chart ?? [] }
  },

  // Top 10 articles les plus mouvementés
  getTopArticles: async (siteId?: string): Promise<{ success: boolean; data: TopArticleData[] }> => {
    const params = siteId ? { siteId } : {}
    const response = await api.get('/dashboard/top-articles', { params })
    return { success: response.data.success, data: response.data.topArticles ?? [] }
  },

  // Répartition par catégorie
  getCategoryDistribution: async (siteId?: string): Promise<{ success: boolean; data: CategoryData[] }> => {
    const params = siteId ? { siteId } : {}
    const response = await api.get('/dashboard/categories', { params })
    return { success: response.data.success, data: response.data.categories ?? [] }
  },
}
