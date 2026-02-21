// Hook de détection d'inactivité — déconnexion automatique après 30 minutes

import { useEffect, useRef, useCallback } from 'react'
import { useAuthStore } from '@/stores/authStore'

const INACTIVITY_TIMEOUT = 30 * 60 * 1000 // 30 minutes

export function useInactivityTimeout(onTimeout: () => void) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { isAuthenticated } = useAuthStore()

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    if (isAuthenticated) {
      timeoutRef.current = setTimeout(onTimeout, INACTIVITY_TIMEOUT)
    }
  }, [isAuthenticated, onTimeout])

  useEffect(() => {
    if (!isAuthenticated) return

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    events.forEach((event) => document.addEventListener(event, resetTimer))
    resetTimer()

    return () => {
      events.forEach((event) => document.removeEventListener(event, resetTimer))
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [isAuthenticated, resetTimer])
}
