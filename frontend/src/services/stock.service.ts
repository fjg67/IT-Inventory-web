// Service stock & mouvements — gestion des stocks et création de mouvements

import api from './api'
import type { ArticleStock, StockMovement, MovementFormData, MovementFilters } from '@/types'

export const stockService = {
  // Consultation du stock
  getStock: async (params?: { siteId?: string; articleId?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.siteId) searchParams.set('siteId', params.siteId)
    if (params?.articleId) searchParams.set('articleId', params.articleId)

    const response = await api.get(`/stock?${searchParams.toString()}`)
    return response.data as { success: boolean; stocks: ArticleStock[] }
  },

  // Création d'un mouvement
  createMovement: async (data: MovementFormData): Promise<{ success: boolean; movement: StockMovement }> => {
    const response = await api.post('/stock/movements', data)
    return response.data
  },

  // Liste paginée des mouvements
  getMovements: async (filters: MovementFilters = {}) => {
    const params = new URLSearchParams()
    if (filters.type) params.set('type', filters.type)
    if (filters.userId) params.set('userId', filters.userId)
    if (filters.siteId) params.set('siteId', filters.siteId)
    if (filters.from) params.set('from', filters.from)
    if (filters.to) params.set('to', filters.to)
    if (filters.page) params.set('page', String(filters.page))
    if (filters.limit) params.set('limit', String(filters.limit))

    const response = await api.get(`/movements?${params.toString()}`)
    return response.data as {
      success: boolean
      movements: StockMovement[]
      total: number
      page: number
      totalPages: number
    }
  },
}
