// Hook d'authentification — gestion complète de l'auth avec TanStack Query

import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/stores/authStore'
import { authService } from '@/services/auth.service'
import type { LoginFormData } from '@/types'

// Flag global pour éviter les appels multiples de restoreSession
let sessionRestored = false

export function useAuth() {
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading, setAuth, logout: storeLogout, setLoading } = useAuthStore()

  // Tentative de restauration de session au chargement (une seule fois)
  useEffect(() => {
    const restoreSession = async () => {
      if (sessionRestored) {
        setLoading(false)
        return
      }
      sessionRestored = true
      try {
        const response = await authService.refresh()
        if (response.accessToken) {
          const meResponse = await authService.me()
          setAuth(meResponse.user, response.accessToken)
        } else {
          storeLogout()
        }
      } catch {
        // Silencieux : pas de toast, c'est normal s'il n'y a pas de session
        storeLogout()
      } finally {
        setLoading(false)
      }
    }

    if (!isAuthenticated) {
      restoreSession()
    } else {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Mutation de connexion
  const loginMutation = useMutation({
    mutationFn: (data: LoginFormData) => authService.login(data),
    onSuccess: (response) => {
      setAuth(response.user, response.accessToken)
      const initials = response.user.name.split(' ').map((w: string) => w[0]).join('').toUpperCase()
      toast.success(`Bienvenue, ${initials} !`)
      navigate('/')
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message = error.response?.data?.message || 'Erreur de connexion'
      toast.error(message)
    },
  })

  // Déconnexion
  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch {
      // Ignorer les erreurs de déconnexion
    } finally {
      storeLogout()
      navigate('/login')
      toast.success('Déconnexion réussie')
    }
  }, [storeLogout, navigate])

  return {
    user,
    isAuthenticated,
    isLoading,
    isAdmin: user?.role === 'ADMIN',
    login: loginMutation.mutate,
    loginLoading: loginMutation.isPending,
    logout,
  }
}
