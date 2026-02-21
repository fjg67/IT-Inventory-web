// Service alertes — articles en dessous du stock minimum

import api from './api'
import type { AlertItem } from '@/types'

export const alertsService = {
  getAlerts: async (siteId?: string): Promise<{ success: boolean; alerts: AlertItem[] }> => {
    const params = siteId ? `?siteId=${siteId}` : ''
    const response = await api.get(`/alerts${params}`)
    return response.data
  },
}
