// Service sites — CRUD des sites de stockage

import api from './api'
import type { Site, SiteFormData } from '@/types'

export const sitesService = {
  getAll: async (): Promise<{ success: boolean; sites: Site[] }> => {
    const response = await api.get('/sites')
    return response.data
  },

  create: async (data: SiteFormData): Promise<{ success: boolean; site: Site }> => {
    const response = await api.post('/sites', data)
    return response.data
  },

  update: async (id: string, data: Partial<SiteFormData>): Promise<{ success: boolean; site: Site }> => {
    const response = await api.put(`/sites/${id}`, data)
    return response.data
  },
}
