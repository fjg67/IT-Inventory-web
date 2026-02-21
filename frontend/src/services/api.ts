// Client HTTP Axios — configuration centralisée
// Intercepteurs pour l'authentification JWT et le rafraîchissement automatique

import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Cookies httpOnly pour le refresh token
  headers: {
    'Content-Type': 'application/json',
  },
})

// Intercepteur de requête — ajoute le token d'accès
api.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState()
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Intercepteur de réponse — rafraîchissement automatique du token
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null): void => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else if (token) {
      resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Si 401 et pas déjà un retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Ne pas essayer de rafraîchir si c'est déjà la route refresh
      if (originalRequest.url === '/auth/refresh') {
        // Silencieux : pas de logout ni toast, c'est normal au premier chargement
        return Promise.reject(error)
      }

      if (isRefreshing) {
        // Ajouter à la file d'attente
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const response = await api.post('/auth/refresh')
        const { accessToken } = response.data
        useAuthStore.getState().setAccessToken(accessToken)
        processQueue(null, accessToken)
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        useAuthStore.getState().logout()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
