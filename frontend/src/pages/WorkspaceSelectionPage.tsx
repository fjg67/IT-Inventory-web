// Page de sélection de l'espace de travail — après connexion
// Reproduit le design de l'app mobile

import { useNavigate, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Building2, ChevronRight, ShieldCheck, Loader2, MapPin } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import logoImg from '@/assets/logo.png'
import { useAuth } from '@/hooks/useAuth'
import { sitesService } from '@/services/sites.service'
import { useSiteStore } from '@/stores/siteStore'
import type { Site } from '@/types'

// Couleurs d'icône par index
const SITE_COLORS = [
  { bg: 'from-blue-500 to-blue-600', glow: 'rgba(59,130,246,0.25)' },
  { bg: 'from-emerald-500 to-green-600', glow: 'rgba(16,185,129,0.25)' },
  { bg: 'from-violet-500 to-purple-600', glow: 'rgba(139,92,246,0.25)' },
  { bg: 'from-amber-500 to-orange-500', glow: 'rgba(245,158,11,0.25)' },
  { bg: 'from-rose-500 to-red-500', glow: 'rgba(244,63,94,0.25)' },
  { bg: 'from-teal-500 to-cyan-500', glow: 'rgba(20,184,166,0.25)' },
]

export default function WorkspaceSelectionPage() {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const setSelectedSite = useSiteStore((s) => s.setSelectedSite)

  const { data: sitesData, isLoading: sitesLoading } = useQuery({
    queryKey: ['sites'],
    queryFn: () => sitesService.getAll(),
    enabled: isAuthenticated,
    staleTime: 60_000,
  })

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const sites = (sitesData?.sites ?? []).filter((s) => s.isActive)

  const handleSelectSite = (site: Site) => {
    setSelectedSite(site)
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fond avec effets */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/[0.04] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500/[0.03] rounded-full blur-3xl" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.03)_0%,transparent_70%)]" />
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-surface-elevated"
            style={{ left: `${10 + i * 8}%`, top: `${15 + (i % 5) * 18}%` }}
            animate={{ y: [0, -20, 0], opacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo et titre */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-8"
        >
          <div className="relative inline-flex items-center justify-center w-20 h-20 mb-5">
            <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl animate-pulse-glow" />
            <div className="relative w-20 h-20 bg-gradient-to-br from-primary to-indigo-500 rounded-2xl flex items-center justify-center shadow-glow overflow-hidden">
              <img src={logoImg} alt="Logo" className="h-12 w-12 object-contain" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">
            IT-Inventory
          </h1>
          <p className="text-text-secondary mt-1 text-sm uppercase tracking-widest">
            Gestion de stock IT
          </p>
        </motion.div>

        {/* Séparateur avec label */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <div className="flex items-center gap-2 text-text-secondary text-sm">
            <Building2 className="h-4 w-4" />
            <span>Sélectionnez votre espace de travail</span>
            <Building2 className="h-4 w-4" />
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        {/* Liste des sites */}
        <div className="space-y-3">
          {sitesLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass-card p-5 flex items-center gap-4 animate-pulse">
                <div className="w-14 h-14 rounded-2xl bg-surface-elevated" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-36 bg-surface-elevated rounded" />
                  <div className="h-3 w-24 bg-surface-elevated rounded" />
                </div>
              </div>
            ))
          ) : sites.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <Building2 className="h-10 w-10 text-text-muted mx-auto mb-3" />
              <p className="text-text-secondary">Aucun site disponible</p>
            </div>
          ) : (
            sites.map((site, index) => {
              const color = SITE_COLORS[index % SITE_COLORS.length]!
              return (
                <motion.button
                  key={site.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                  onClick={() => handleSelectSite(site)}
                  className="w-full glass-card p-5 flex items-center gap-4 cursor-pointer group hover:border-primary/30 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] transition-all duration-300"
                >
                  {/* Icône du site */}
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color.bg} flex items-center justify-center shadow-lg flex-shrink-0`}
                    style={{ boxShadow: `0 4px 20px ${color.glow}` }}
                  >
                    <Building2 className="h-7 w-7 text-white" />
                  </div>

                  {/* Infos du site */}
                  <div className="flex-1 text-left min-w-0">
                    <h3 className="text-base font-semibold text-text-primary truncate">
                      {site.name}
                    </h3>
                    {site.address ? (
                      <p className="text-sm text-text-secondary mt-0.5 flex items-center gap-1 truncate">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        {site.address}
                      </p>
                    ) : (
                      <p className="text-sm text-text-muted mt-0.5">
                        {site._count?.stocks
                          ? `${site._count.stocks} article${site._count.stocks > 1 ? 's' : ''} en stock`
                          : 'Site de stockage'}
                      </p>
                    )}
                  </div>

                  {/* Flèche */}
                  <div className="w-9 h-9 rounded-xl bg-surface-elevated/60 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                </motion.button>
              )
            })
          )}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-10 space-y-1"
        >
          <p className="text-text-muted text-xs flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            Données protégées et chiffrées
          </p>
          <p className="text-text-muted/60 text-xs">
            Version 1.5.0
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
