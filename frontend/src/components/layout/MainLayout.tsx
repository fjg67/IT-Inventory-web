// MainLayout — layout principal pour les pages authentifiées
// Inclut la sidebar, la barre supérieure et la zone de contenu

import { useCallback, useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useInactivityTimeout } from '@/hooks/useInactivityTimeout'
import { useBeforeUnload } from '@/hooks/useBeforeUnload'
import { useSidebarStore } from '@/stores/sidebarStore'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

export default function MainLayout() {
  const { isAuthenticated, isLoading, logout } = useAuth()
  const { isOpen, isMobileOpen, setMobileOpen } = useSidebarStore()
  const location = useLocation()

  // Déconnexion automatique après inactivité
  const handleInactivityTimeout = useCallback(() => {
    logout()
  }, [logout])

  useInactivityTimeout(handleInactivityTimeout)

  // Empêcher de quitter le navigateur sans se déconnecter
  useBeforeUnload()

  // Fermer le drawer mobile à chaque changement de route
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname, setMobileOpen])

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

      {/* Overlay mobile quand le drawer est ouvert */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Zone principale */}
      <div className="flex min-h-screen flex-col lg:hidden">
        {/* Barre supérieure */}
        <TopBar />

        {/* Contenu de la page */}
        <main className="flex-1 p-3 sm:p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      {/* Zone principale — desktop avec margin animée */}
      <motion.div
        initial={false}
        animate={{ marginLeft: isOpen ? 260 : 72 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="hidden lg:flex min-h-screen flex-col"
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
