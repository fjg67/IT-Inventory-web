// Point d'entrée React — Configuration du routage et layout

import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import MainLayout from '@/components/layout/MainLayout'

// Chargement paresseux des pages
const WelcomePage = lazy(() => import('@/pages/WelcomePage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const ArticlesPage = lazy(() => import('@/pages/ArticlesPage'))
const ArticleDetailPage = lazy(() => import('@/pages/ArticleDetailPage'))
const StockMovementsPage = lazy(() => import('@/pages/StockMovementsPage'))
const AlertsPage = lazy(() => import('@/pages/AlertsPage'))
const SitesPage = lazy(() => import('@/pages/SitesPage'))
const UsersPage = lazy(() => import('@/pages/UsersPage'))
const AuditLogPage = lazy(() => import('@/pages/AuditLogPage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))
const HelpSupportPage = lazy(() => import('@/pages/HelpSupportPage'))
const TermsPage = lazy(() => import('@/pages/TermsPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

function App() {
  return (
    <ThemeProvider>
    <Suspense fallback={<LoadingSpinner fullPage />}>
      <Routes>
        {/* Page de bienvenue / onboarding */}
        <Route path="/welcome" element={<WelcomePage />} />

        {/* Page de connexion (publique) */}
        <Route path="/login" element={<LoginPage />} />

        {/* Pages protégées avec le layout principal */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/articles" element={<ArticlesPage />} />
          <Route path="/articles/:id" element={<ArticleDetailPage />} />
          <Route path="/movements" element={<StockMovementsPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/sites" element={<SitesPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/audit" element={<AuditLogPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/help" element={<HelpSupportPage />} />
          <Route path="/terms" element={<TermsPage />} />
        </Route>

        {/* Page 404 */}
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
    </ThemeProvider>
  )
}

export default App
