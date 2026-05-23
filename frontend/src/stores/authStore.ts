// Store d'authentification — Zustand
// Gère l'état de l'utilisateur connecté et les tokens

import { create } from 'zustand'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean

  // Actions
  setAuth: (user: User, accessToken: string) => void
  setAccessToken: (token: string) => void
  logout: () => void
  setLoading: (loading: boolean) => void
}

const STORAGE_KEY = 'it-inventory-auth'

type PersistedAuthState = Pick<AuthState, 'user' | 'accessToken' | 'isAuthenticated'>

function loadPersistedAuthState(): PersistedAuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return {
        user: null,
        accessToken: null,
        isAuthenticated: false,
      }
    }

    const parsed = JSON.parse(raw) as PersistedAuthState
    return {
      user: parsed.user ?? null,
      accessToken: parsed.accessToken ?? null,
      isAuthenticated: Boolean(parsed.isAuthenticated && parsed.user),
    }
  } catch {
    return {
      user: null,
      accessToken: null,
      isAuthenticated: false,
    }
  }
}

function persistAuthState(state: PersistedAuthState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function clearPersistedAuthState(): void {
  localStorage.removeItem(STORAGE_KEY)
}

const persistedState = loadPersistedAuthState()

export const useAuthStore = create<AuthState>((set) => ({
  user: persistedState.user,
  accessToken: persistedState.accessToken,
  isAuthenticated: persistedState.isAuthenticated,
  isLoading: true,

  setAuth: (user, accessToken) =>
    set(() => {
      const nextState = {
        user,
        accessToken,
        isAuthenticated: true,
        isLoading: false,
      }
      persistAuthState({
        user: nextState.user,
        accessToken: nextState.accessToken,
        isAuthenticated: nextState.isAuthenticated,
      })
      return nextState
    }),

  setAccessToken: (token) =>
    set((state) => {
      const nextState = { accessToken: token }
      if (state.isAuthenticated && state.user) {
        persistAuthState({
          user: state.user,
          accessToken: token,
          isAuthenticated: true,
        })
      }
      return nextState
    }),

  logout: () =>
    set(() => {
      clearPersistedAuthState()
      return {
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      }
    }),

  setLoading: (loading) =>
    set({ isLoading: loading }),
}))
