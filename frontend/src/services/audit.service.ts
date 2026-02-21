// Service journal d'audit — consultation des logs

import api from './api'
import type { AuditLog, AuditFilters } from '@/types'

export const auditService = {
  getLogs: async (filters: AuditFilters = {}) => {
    const params = new URLSearchParams()
    if (filters.userId) params.set('userId', filters.userId)
    if (filters.action) params.set('action', filters.action)
    if (filters.from) params.set('from', filters.from)
    if (filters.to) params.set('to', filters.to)
    if (filters.page) params.set('page', String(filters.page))
    if (filters.limit) params.set('limit', String(filters.limit))

    const response = await api.get(`/audit?${params.toString()}`)
    return response.data as {
      success: boolean
      logs: AuditLog[]
      total: number
      page: number
      totalPages: number
    }
  },
}
