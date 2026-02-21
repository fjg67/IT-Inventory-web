// MainLayout — layout principal pour les pages authentifiées
// Inclut la sidebar, la barre supérieure et la zone de contenu

import { useCallback } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useInactivityTimeout } from '@/hooks/useInactivityTimeout'
import { useSidebarStore } from '@/stores/sidebarStore'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

export default function MainLayout() {
  const { isAuthenticated, isLoading, logout } = useAuth()
  const { isOpen } = useSidebarStore()

  // Déconnexion automatique après inactivité
  const handleInactivityTimeout = useCallback(() => {
    logout()
  }, [logout])

  useInactivityTimeout(handleInactivityTimeout)

  // Afficher le spinner pendant la vérification de l'authentification
  if (isLoading) {
    return <LoadingSpinner fullPage size="lg" />
  }

  // Rediriger vers la page de connexion si non authentifié
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Zone principale */}
      <motion.div
        initial={false}
        animate={{ marginLeft: isOpen ? 260 : 72 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="flex min-h-screen flex-col"
      >
        {/* Barre supérieure */}
        <TopBar />

        {/* Contenu de la page */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </motion.div>
    </div>
  )
}
