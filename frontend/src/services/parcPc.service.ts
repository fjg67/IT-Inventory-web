import api from './api'
import type { PCFormData, PCResponse, ParcPCResponse, PCStatusFormData } from '@/types/pc.types'

export const parcPcService = {
  getAll: async (): Promise<ParcPCResponse> => {
    const response = await api.get('/parc-pc')
    return response.data
  },

  getById: async (id: string): Promise<PCResponse> => {
    const response = await api.get(`/parc-pc/${id}`)
    return response.data
  },

  create: async (data: PCFormData): Promise<PCResponse> => {
    const response = await api.post('/parc-pc', data)
    return response.data
  },

  update: async (id: string, data: Partial<PCFormData>): Promise<PCResponse> => {
    const response = await api.patch(`/parc-pc/${id}`, data)
    return response.data
  },

  updateStatus: async (id: string, data: PCStatusFormData): Promise<PCResponse> => {
    const response = await api.patch(`/parc-pc/${id}/status`, data)
    return response.data
  },

  remove: async (id: string): Promise<{ success: boolean }> => {
    const response = await api.delete(`/parc-pc/${id}`)
    return response.data
  },
}