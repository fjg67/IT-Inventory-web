// Service articles — CRUD + historique

import api from './api'
import type { Article, ArticleFormData, ArticleFilters, StockMovement } from '@/types'

export const articlesService = {
  // Liste paginée avec filtres
  getAll: async (filters: ArticleFilters = {}) => {
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.category) params.set('category', filters.category)
    if (filters.site) params.set('site', filters.site)
    if (filters.status) params.set('status', filters.status)
    if (filters.page) params.set('page', String(filters.page))
    if (filters.limit) params.set('limit', String(filters.limit))
    if (filters.sortBy) params.set('sortBy', filters.sortBy)
    if (filters.sortOrder) params.set('sortOrder', filters.sortOrder)

    const response = await api.get(`/articles?${params.toString()}`)
    return response.data as {
      success: boolean
      articles: Article[]
      total: number
      page: number
      totalPages: number
    }
  },

  // Détail d'un article
  getById: async (id: string): Promise<{ success: boolean; article: Article }> => {
    const response = await api.get(`/articles/${id}`)
    return response.data
  },

  // Création
  create: async (data: ArticleFormData): Promise<{ success: boolean; article: Article }> => {
    const response = await api.post('/articles', data)
    return response.data
  },

  // Modification
  update: async (id: string, data: Partial<ArticleFormData>): Promise<{ success: boolean; article: Article }> => {
    const response = await api.put(`/articles/${id}`, data)
    return response.data
  },

  // Suppression logique (archivage)
  delete: async (id: string): Promise<{ success: boolean }> => {
    const response = await api.delete(`/articles/${id}`)
    return response.data
  },

  // Historique des mouvements d'un article
  getHistory: async (id: string, params?: { page?: number; from?: string; to?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.from) searchParams.set('from', params.from)
    if (params?.to) searchParams.set('to', params.to)

    const response = await api.get(`/articles/${id}/history?${searchParams.toString()}`)
    return response.data as {
      success: boolean
      movements: StockMovement[]
      total: number
      page: number
      totalPages: number
    }
  },

  // Récupération des catégories uniques
  getCategories: async (): Promise<string[]> => {
    const response = await api.get('/articles?limit=1000')
    const articles = response.data.articles as Article[]
    const categories = [...new Set(articles.map((a: Article) => a.category))]
    return categories.sort()
  },
  // Upload d'image
  uploadImage: async (file: File): Promise<{ success: boolean; imageUrl: string }> => {
    const formData = new FormData()
    formData.append('image', file)
    const response = await api.post('/articles/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },}
