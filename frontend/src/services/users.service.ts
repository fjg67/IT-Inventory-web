// Service utilisateurs — CRUD admin + réinitialisation mot de passe

import api from './api'
import type { User, UserFormData } from '@/types'

export const usersService = {
  getAll: async (): Promise<{ success: boolean; users: User[] }> => {
    const response = await api.get('/users')
    return response.data
  },

  create: async (data: UserFormData): Promise<{ success: boolean; user: User }> => {
    const response = await api.post('/users', data)
    return response.data
  },

  update: async (id: string, data: Partial<UserFormData>): Promise<{ success: boolean; user: User }> => {
    const response = await api.put(`/users/${id}`, data)
    return response.data
  },

  resetPassword: async (id: string, newPassword: string): Promise<{ success: boolean }> => {
    const response = await api.patch(`/users/${id}/password`, { password: newPassword })
    return response.data
  },
}
