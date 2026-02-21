// Service d'authentification — appels API login, logout, refresh, me

import api from './api'
import type { LoginFormData, LoginResponse, User } from '@/types'

export interface ProfileUser {
  id: string
  technicianId: string
  name: string
  role: 'ADMIN' | 'TECHNICIAN'
}

export const authService = {
  // Liste des profils actifs (sélecteur de profil)
  getProfiles: async (): Promise<{ success: boolean; users: ProfileUser[] }> => {
    const response = await api.get('/auth/profiles')
    return response.data
  },

  // Connexion
  login: async (data: LoginFormData): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', data)
    return response.data
  },

  // Déconnexion
  logout: async (): Promise<void> => {
    await api.post('/auth/logout')
  },

  // Rafraîchissement du token
  refresh: async (): Promise<{ accessToken: string }> => {
    const response = await api.post('/auth/refresh')
    return response.data
  },

  // Récupération de l'utilisateur connecté
  me: async (): Promise<{ success: boolean; user: User }> => {
    const response = await api.get('/auth/me')
    return response.data
  },
}
