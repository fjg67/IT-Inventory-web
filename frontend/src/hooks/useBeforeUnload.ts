// Hook de protection contre la fermeture — empêche de quitter sans se déconnecter
// Affiche une alerte native du navigateur si l'utilisateur tente de fermer/recharger la page

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'

export function useBeforeUnload() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  useEffect(() => {
    if (!isAuthenticated) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Le navigateur affichera un message natif du type :
      // "Les modifications que vous avez apportées ne seront peut-être pas enregistrées."
      e.preventDefault()
      // Requis par certains navigateurs (Chrome legacy)
      e.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isAuthenticated])
}
