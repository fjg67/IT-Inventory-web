// Service d'export — téléchargement de fichiers Excel

import api from './api'
import type { MovementFilters } from '@/types'

export const exportService = {
  // Export Excel des articles
  exportArticles: async (): Promise<void> => {
    const response = await api.get('/export/articles', { responseType: 'blob' })
    downloadBlob(response.data, 'articles-it-inventory.xlsx')
  },

  // Export Excel des mouvements (avec filtres)
  exportMovements: async (filters: MovementFilters = {}): Promise<void> => {
    const params = new URLSearchParams()
    if (filters.type) params.set('type', filters.type)
    if (filters.userId) params.set('userId', filters.userId)
    if (filters.siteId) params.set('siteId', filters.siteId)
    if (filters.from) params.set('from', filters.from)
    if (filters.to) params.set('to', filters.to)

    const response = await api.get(`/export/movements?${params.toString()}`, { responseType: 'blob' })
    downloadBlob(response.data, 'mouvements-it-inventory.xlsx')
  },
}

// Utilitaire pour déclencher le téléchargement d'un blob
function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
