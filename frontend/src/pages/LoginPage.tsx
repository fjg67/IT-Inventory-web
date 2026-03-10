// Page de connexion — mot de passe d'abord, sélection du profil ensuite
// Flux fidèle à l'app mobile

import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Loader2, ChevronRight, ShieldCheck, Check, Sparkles, Unlock, XCircle, ShieldAlert, AlertTriangle, Building2, MapPin, ArrowLeft, Plus, Trash2, Hash } from 'lucide-react'
import logoImg from '@/assets/logo.png'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { authService, type ProfileUser } from '@/services/auth.service'
import { useSiteStore } from '@/stores/siteStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Site } from '@/types'

// Couleurs d'icône de site par index
const SITE_COLORS = [
  { bg: 'from-blue-500 to-blue-600', glow: 'rgba(59,130,246,0.25)' },
  { bg: 'from-emerald-500 to-green-600', glow: 'rgba(16,185,129,0.25)' },
  { bg: 'from-violet-500 to-purple-600', glow: 'rgba(139,92,246,0.25)' },
  { bg: 'from-amber-500 to-orange-500', glow: 'rgba(245,158,11,0.25)' },
  { bg: 'from-rose-500 to-red-500', glow: 'rgba(244,63,94,0.25)' },
  { bg: 'from-teal-500 to-cyan-500', glow: 'rgba(20,184,166,0.25)' },
]

// Couleurs d'avatar par index
const AVATAR_COLORS = [
  'from-blue-500 to-blue-600',
  'from-indigo-500 to-purple-500',
  'from-emerald-500 to-green-600',
  'from-rose-500 to-red-500',
  'from-teal-500 to-cyan-500',
  'from-amber-500 to-orange-500',
  'from-violet-500 to-purple-600',
  'from-pink-500 to-rose-500',
]

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getRoleBadge(role: string) {
  if (role === 'ADMIN') return { label: 'Admin', color: 'bg-amber-500/15 text-amber-400' }
  return { label: 'Technicien', color: 'bg-blue-500/15 text-blue-400' }
}

type Step = 'password' | 'workspace' | 'agencies' | 'profiles'

export default function LoginPage() {
  const { login, loginLoading, isAuthenticated, isLoading } = useAuth()
  const [step, setStep] = useState<Step>('password')
  const [selectedUser, setSelectedUser] = useState<ProfileUser | null>(null)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [showUnlockAnim, setShowUnlockAnim] = useState(false)
  const [showErrorAnim, setShowErrorAnim] = useState(false)
  const [shakeKey, setShakeKey] = useState(0)
  const [selectedParentSite, setSelectedParentSite] = useState<Site | null>(null)
  const setSelectedSite = useSiteStore((s) => s.setSelectedSite)
  const queryClient = useQueryClient()

  // Agency form state
  const [agencyName, setAgencyName] = useState('')
  const [agencyEds, setAgencyEds] = useState('')
  const [agencyError, setAgencyError] = useState('')

  // Récupération des profils actifs (préchargé pour l'étape 3)
  const { data: profilesData, isLoading: profilesLoading } = useQuery({
    queryKey: ['auth', 'profiles'],
    queryFn: () => authService.getProfiles(),
    staleTime: 60_000,
  })

  // Récupération des sites (public — pour l'étape 2)
  const { data: sitesData, isLoading: sitesLoading } = useQuery({
    queryKey: ['auth', 'sites'],
    queryFn: () => authService.getSitesPublic(),
    staleTime: 60_000,
  })

  // Mutations agences
  const createAgencyMutation = useMutation({
    mutationFn: (data: { name: string; edsNumber: string; parentSiteId: string }) =>
      authService.createAgency(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'sites'] })
      setAgencyName('')
      setAgencyEds('')
      setAgencyError('')
    },
    onError: (err: any) => {
      setAgencyError(err?.response?.data?.error ?? 'Erreur lors de la création')
    },
  })

  const deleteAgencyMutation = useMutation({
    mutationFn: (id: string) => authService.deleteAgency(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'sites'] })
    },
  })

  // Auto-focus sur le champ mot de passe à l'étape 1
  useEffect(() => {
    if (step === 'password') {
      setTimeout(() => {
        document.getElementById('password')?.focus()
      }, 350)
    }
  }, [step])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const profiles = profilesData?.users ?? []

  const handlePasswordNext = (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      setPasswordError('Minimum 6 caractères')
      return
    }
    if (password !== '!*A1Z2E3R4T5!') {
      setPasswordError('Mot de passe incorrect')
      setShowErrorAnim(true)
      setShakeKey(prev => prev + 1)
      setTimeout(() => setShowErrorAnim(false), 2200)
      return
    }
    setPasswordError('')
    // Show unlock celebration then transition
    setShowUnlockAnim(true)
    setTimeout(() => {
      setShowUnlockAnim(false)
      setStep('workspace')
    }, 1600)
  }

  const allSites = (sitesData?.sites ?? []).filter((s) => s.isActive)
  // Sites de niveau supérieur (pas de parent)
  const topLevelSites = allSites.filter((s) => !s.parentSiteId)
  // Sous-sites du parent sélectionné
  const childSites = selectedParentSite
    ? allSites.filter((s) => s.parentSiteId === selectedParentSite.id)
    : []
  const displayedSites = selectedParentSite ? childSites : topLevelSites

  const handleSelectSite = (site: Site) => {
    // Si c'est "Agences", aller vers l'étape agences (même sans enfants)
    if (site.name.toLowerCase().includes('agence') && !site.parentSiteId) {
      setSelectedParentSite(site)
      setStep('agencies')
      return
    }
    // Si le site a des enfants, drill down
    const hasChildren = allSites.some((s) => s.parentSiteId === site.id)
    if (hasChildren) {
      setSelectedParentSite(site)
      return
    }
    setSelectedSite(site)
    setStep('profiles')
  }

  const handleBackToParents = () => {
    setSelectedParentSite(null)
  }

  const handleSelectUser = (user: ProfileUser) => {
    setSelectedUser(user)
    login({ technicianId: user.technicianId, password })
  }

  const handleCreateAgency = () => {
    if (!agencyName.trim()) {
      setAgencyError('Le nom est requis')
      return
    }
    if (!/^\d{3}$/.test(agencyEds)) {
      setAgencyError('Le numéro EDS doit contenir exactement 3 chiffres')
      return
    }
    if (!selectedParentSite) return
    createAgencyMutation.mutate({
      name: agencyName.trim(),
      edsNumber: agencyEds,
      parentSiteId: selectedParentSite.id,
    })
  }

  const handleAgencySelect = (agency: Site) => {
    setSelectedSite(agency)
    setStep('profiles')
  }

  const stepLabels: Record<Step, string> = {
    password: 'Entrez votre mot de passe',
    workspace: selectedParentSite ? selectedParentSite.name : 'Sélectionnez votre espace de travail',
    agencies: 'Gestion des agences',
    profiles: 'Sélectionnez votre profil',
  }
  const stepLabel = stepLabels[step]

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
          <p className="text-text-secondary mt-1 text-sm">
            Gestion de stock IT
          </p>
        </motion.div>

        {/* Séparateur avec label dynamique */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <AnimatePresence mode="wait">
            <motion.p
              key={step}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="text-text-secondary text-sm"
            >
              {stepLabel}
            </motion.p>
          </AnimatePresence>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        {/* Contenu animé */}
        <AnimatePresence mode="wait">
          {step === 'password' ? (
            // ── Étape 1 : Mot de passe ──
            <motion.div
              key="password-step"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <motion.form
                onSubmit={handlePasswordNext}
                className={`glass-card p-6 space-y-5 relative overflow-hidden transition-shadow duration-500 ${
                  showErrorAnim ? 'shadow-[0_0_40px_rgba(239,68,68,0.2)] border-red-500/40' : ''
                }`}
                key={shakeKey}
                animate={showErrorAnim ? {
                  x: [0, -12, 10, -8, 6, -4, 2, 0],
                } : {}}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              >
                {/* Red flash overlay on error */}
                <AnimatePresence>
                  {showErrorAnim && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-b from-red-500/10 to-transparent z-0 pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 1, 0.5, 0.8, 0] }}
                      transition={{ duration: 1.5 }}
                    />
                  )}
                </AnimatePresence>

                <div className="flex items-center gap-2 pb-4 border-b border-border relative z-10">
                  <AnimatePresence mode="wait">
                    {showErrorAnim ? (
                      <motion.div
                        key="error-icon"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                      >
                        <ShieldAlert className="h-5 w-5 text-red-400" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="normal-icon"
                        initial={{ scale: 0, rotate: 180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: -180 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                      >
                        <ShieldCheck className="h-5 w-5 text-primary" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <h2 className={`text-base font-semibold transition-colors duration-300 ${
                    showErrorAnim ? 'text-red-400' : 'text-text-primary'
                  }`}>
                    {showErrorAnim ? 'Accès refusé' : 'Connexion sécurisée'}
                  </h2>
                </div>

                <div className="space-y-2 relative z-10">
                  <label htmlFor="password" className="text-sm font-medium text-text-secondary">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <motion.div
                      animate={showErrorAnim ? {
                        boxShadow: [
                          '0 0 0px rgba(239,68,68,0)',
                          '0 0 20px rgba(239,68,68,0.4)',
                          '0 0 8px rgba(239,68,68,0.2)',
                          '0 0 15px rgba(239,68,68,0.3)',
                          '0 0 0px rgba(239,68,68,0)',
                        ],
                      } : {}}
                      transition={{ duration: 1.5 }}
                      className="rounded-lg"
                    >
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        value={password}
                        className={showErrorAnim ? 'border-red-500/60 focus:border-red-500/60 focus:ring-red-500/20' : ''}
                        onChange={(e) => {
                          setPassword(e.target.value)
                          if (passwordError) setPasswordError('')
                        }}
                      />
                    </motion.div>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Animated error message */}
                  <AnimatePresence>
                    {passwordError && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -8, height: 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="flex items-center gap-2 mt-2 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20"
                      >
                        <motion.div
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 12, delay: 0.1 }}
                        >
                          <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                        </motion.div>
                        <motion.p
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.15, duration: 0.25 }}
                          className="text-red-400 text-xs font-medium"
                        >
                          {passwordError}
                        </motion.p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Button
                  type="submit"
                  className={`w-full h-12 text-base font-semibold rounded-xl relative z-10 transition-all duration-300 ${
                    showErrorAnim ? 'bg-red-500 hover:bg-red-600' : ''
                  }`}
                >
                  {showErrorAnim ? 'Réessayer' : 'Continuer'}
                </Button>
              </motion.form>
            </motion.div>
          ) : step === 'workspace' ? (
            // ── Étape 2 : Sélection de l'espace de travail ──
            <motion.div
              key={`workspace-step-${selectedParentSite?.id ?? 'root'}`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="space-y-3"
            >
              {/* Bouton retour si on est dans un sous-niveau */}
              {selectedParentSite && (
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={handleBackToParents}
                  className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors mb-1 cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Retour</span>
                </motion.button>
              )}
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
              ) : displayedSites.length === 0 ? (
                <div className="glass-card p-8 text-center">
                  <Building2 className="h-10 w-10 text-text-muted mx-auto mb-3" />
                  <p className="text-text-secondary">Aucun site disponible</p>
                </div>
              ) : (
                displayedSites.map((site, index) => {
                  const color = SITE_COLORS[index % SITE_COLORS.length]!
                  return (
                    <motion.button
                      key={site.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
                      onClick={() => handleSelectSite(site)}
                      className="w-full glass-card p-5 flex items-center gap-4 cursor-pointer group hover:border-primary/30 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] transition-all duration-300"
                    >
                      <div
                        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color.bg} flex items-center justify-center shadow-lg flex-shrink-0`}
                        style={{ boxShadow: `0 4px 20px ${color.glow}` }}
                      >
                        <Building2 className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <h3 className="text-base font-semibold text-text-primary truncate">{site.name}</h3>
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
                      <div className="w-9 h-9 rounded-xl bg-surface-elevated/60 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </motion.button>
                  )
                })
              )}
            </motion.div>
          ) : step === 'agencies' ? (
            // ── Étape Agences : liste + création ──
            <motion.div
              key="agencies-step"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="space-y-4"
            >
              {/* Bouton retour */}
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => {
                  setSelectedParentSite(null)
                  setStep('workspace')
                  setAgencyError('')
                }}
                className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors mb-1 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Retour</span>
              </motion.button>

              {/* Liste des agences existantes */}
              {childSites.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Agences existantes</p>
                  {childSites.map((agency, index) => (
                    <motion.div
                      key={agency.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.06 }}
                      className="glass-card p-4 flex items-center gap-3 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0">
                        <Building2 className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text-primary truncate">{agency.name}</p>
                        {agency.edsNumber && (
                          <p className="text-xs text-text-muted flex items-center gap-1">
                            <Hash className="h-3 w-3" />
                            EDS {agency.edsNumber}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteAgencyMutation.mutate(agency.id)}
                        disabled={deleteAgencyMutation.isPending}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Formulaire de création */}
              <div className="glass-card p-4 space-y-3">
                <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Nouvelle agence</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Nom de l'agence"
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="EDS (3 chiffres)"
                    value={agencyEds}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, '').slice(0, 3)
                      setAgencyEds(v)
                    }}
                    className="w-32"
                    maxLength={3}
                  />
                </div>
                {agencyError && (
                  <p className="text-xs text-red-400">{agencyError}</p>
                )}
                <Button
                  onClick={handleCreateAgency}
                  disabled={createAgencyMutation.isPending}
                  className="w-full"
                  size="sm"
                >
                  {createAgencyMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Ajouter l'agence
                </Button>
              </div>

              {/* Sélection d'une agence pour continuer */}
              {childSites.length > 0 && (
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Sélectionner une agence</p>
                  {childSites.map((agency, index) => {
                    const color = SITE_COLORS[(index + 2) % SITE_COLORS.length]!
                    return (
                      <motion.button
                        key={agency.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 + index * 0.06 }}
                        onClick={() => handleAgencySelect(agency)}
                        className="w-full glass-card p-4 flex items-center gap-3 cursor-pointer group hover:border-primary/30 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] transition-all duration-300"
                      >
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color.bg} flex items-center justify-center shadow-lg flex-shrink-0`}
                          style={{ boxShadow: `0 4px 15px ${color.glow}` }}
                        >
                          <Building2 className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-sm font-semibold text-text-primary truncate">{agency.name}</p>
                          {agency.edsNumber && (
                            <p className="text-xs text-text-muted">EDS {agency.edsNumber}</p>
                          )}
                        </div>
                        <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </motion.button>
                    )
                  })}
                </div>
              )}
            </motion.div>
          ) : (
            // ── Étape 3 : Sélection du profil ──
            <motion.div
              key="profiles-step"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="space-y-3"
            >
              {profilesLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="glass-card p-4 flex items-center gap-4 animate-pulse">
                    <div className="w-12 h-12 rounded-xl bg-surface-elevated" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 bg-surface-elevated rounded" />
                      <div className="h-3 w-20 bg-surface-elevated rounded" />
                    </div>
                  </div>
                ))
              ) : profiles.length === 0 ? (
                <div className="glass-card p-8 text-center">
                  <p className="text-text-secondary">Aucun profil disponible</p>
                </div>
              ) : (
                profiles.map((user, index) => {
                  const badge = getRoleBadge(user.role)
                  const isSelected = selectedUser?.id === user.id
                  return (
                    <motion.button
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.08 }}
                      onClick={() => handleSelectUser(user)}
                      disabled={loginLoading}
                      className="w-full glass-card p-4 flex items-center gap-4 cursor-pointer group hover:border-primary/30 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] transition-all duration-300 disabled:opacity-50"
                    >
                      {/* Avatar */}
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${AVATAR_COLORS[index % AVATAR_COLORS.length]} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                        {getInitials(user.name)}
                      </div>

                      {/* Rôle */}
                      <div className="flex-1 text-left">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>

                      {/* Indicateur */}
                      {isSelected && loginLoading ? (
                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      )}
                    </motion.button>
                  )
                })
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-text-muted text-xs mt-8"
        >
          Version 1.0.0
        </motion.p>
      </motion.div>

      {/* ── Error denied overlay ── */}
      <AnimatePresence>
        {showErrorAnim && (
          <motion.div
            className="fixed inset-0 z-[9998] flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Red vignette pulse */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse at center, transparent 40%, rgba(239,68,68,0.12) 100%)',
              }}
              animate={{ opacity: [0, 1, 0.6, 0.8, 0] }}
              transition={{ duration: 2 }}
            />

            {/* Glitch lines */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`glitch-${i}`}
                className="absolute left-0 right-0 h-px bg-red-500/30"
                style={{ top: `${15 + i * 14}%` }}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{
                  scaleX: [0, 1, 0],
                  opacity: [0, 0.6, 0],
                  x: ['-100%', '0%', '100%'],
                }}
                transition={{
                  duration: 0.4,
                  delay: 0.1 + i * 0.06,
                  ease: 'easeOut',
                }}
              />
            ))}

            {/* Red spark particles */}
            {Array.from({ length: 16 }).map((_, i) => {
              const angle = (i / 16) * Math.PI * 2;
              const dist = 50 + Math.random() * 80;
              const colors = ['bg-red-400', 'bg-red-500', 'bg-orange-400', 'bg-rose-400', 'bg-red-300'];
              return (
                <motion.div
                  key={`err-particle-${i}`}
                  className={`absolute w-1 h-1 rounded-full ${colors[i % colors.length]}`}
                  style={{ left: '50%', top: '50%' }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                  animate={{
                    x: Math.cos(angle) * dist,
                    y: Math.sin(angle) * dist,
                    opacity: [1, 0.8, 0],
                    scale: [0, 1.5, 0],
                  }}
                  transition={{
                    duration: 0.8 + Math.random() * 0.3,
                    delay: 0.15 + Math.random() * 0.1,
                    ease: [0.22, 1.0, 0.36, 1.0],
                  }}
                />
              );
            })}

            {/* Center denied badge */}
            <motion.div
              className="relative flex flex-col items-center"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.15, 1], opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Pulsing ring */}
              <motion.div
                className="absolute inset-[-20px] rounded-full border-2 border-red-500/30"
                animate={{
                  scale: [1, 1.6, 2],
                  opacity: [0.5, 0.2, 0],
                }}
                transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
              />
              <motion.div
                className="absolute inset-[-10px] rounded-full border border-red-500/20"
                animate={{
                  scale: [1, 1.4, 1.8],
                  opacity: [0.4, 0.15, 0],
                }}
                transition={{ duration: 0.9, delay: 0.3, ease: 'easeOut' }}
              />

              {/* Icon circle */}
              <div className="relative">
                <div className="absolute inset-[-12px] rounded-full bg-red-500/20 blur-2xl" />
                <motion.div
                  className="relative w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-rose-600 shadow-[0_0_40px_rgba(239,68,68,0.35)] flex items-center justify-center"
                  animate={{
                    boxShadow: [
                      '0 0 40px rgba(239,68,68,0.35)',
                      '0 0 60px rgba(239,68,68,0.5)',
                      '0 0 40px rgba(239,68,68,0.35)',
                    ],
                  }}
                  transition={{ duration: 1.5, repeat: 1 }}
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 15 }}
                  >
                    <AlertTriangle className="w-7 h-7 text-white" strokeWidth={2.5} />
                  </motion.div>
                </motion.div>
              </div>

              {/* Text */}
              <motion.p
                className="mt-4 text-sm font-bold text-red-400 tracking-wide"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.3 }}
              >
                Accès refusé
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Unlock celebration overlay ── */}
      <AnimatePresence>
        {showUnlockAnim && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop pulse */}
            <motion.div
              className="absolute inset-0 bg-background/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <div className="relative flex flex-col items-center">
              {/* Expanding rings */}
              {[100, 160, 230].map((size, i) => (
                <motion.div
                  key={size}
                  className="absolute left-1/2 top-1/2 rounded-full"
                  style={{
                    width: size,
                    height: size,
                    marginLeft: -size / 2,
                    marginTop: -size / 2,
                    border: '2px solid rgba(59,130,246,0.4)',
                    boxShadow: '0 0 25px rgba(59,130,246,0.2)',
                  }}
                  initial={{ scale: 0, opacity: 0.8 }}
                  animate={{ scale: [0, 1.5, 2], opacity: [0.8, 0.3, 0] }}
                  transition={{ duration: 1.2, delay: 0.1 + i * 0.12, ease: 'easeOut' }}
                />
              ))}

              {/* Confetti particles */}
              {Array.from({ length: 24 }).map((_, i) => {
                const angle = (i / 24) * Math.PI * 2
                const dist = 90 + Math.random() * 130
                const colors = ['bg-blue-400', 'bg-indigo-400', 'bg-cyan-400', 'bg-emerald-400', 'bg-amber-400', 'bg-violet-400']
                return (
                  <motion.div
                    key={i}
                    className={`absolute w-1.5 h-1.5 rounded-full ${colors[i % colors.length]}`}
                    style={{ left: '50%', top: '50%' }}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                    animate={{
                      x: Math.cos(angle) * dist,
                      y: [0, Math.sin(angle) * dist - 30, Math.sin(angle) * dist + 60],
                      opacity: [1, 1, 0],
                      scale: [0, 1.3, 0.4],
                    }}
                    transition={{
                      duration: 1.2 + Math.random() * 0.4,
                      delay: 0.2 + Math.random() * 0.15,
                      ease: [0.22, 1.0, 0.36, 1.0],
                    }}
                  />
                )
              })}

              {/* Main icon circle */}
              <motion.div
                className="relative"
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 250, damping: 18, delay: 0.05 }}
              >
                <div className="absolute inset-[-16px] rounded-full bg-blue-500/20 blur-2xl" />
                <motion.div
                  className="absolute inset-[-8px] rounded-full opacity-50"
                  style={{ background: 'conic-gradient(from 0deg, transparent, rgba(59,130,246,0.5), transparent)' }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_0_50px_rgba(59,130,246,0.35)] flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 18 }}
                  >
                    <Unlock className="w-9 h-9 text-white" strokeWidth={2.5} />
                  </motion.div>
                </div>
              </motion.div>

              {/* Text */}
              <motion.div
                className="mt-6 flex flex-col items-center gap-1.5"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.4 }}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <h2 className="text-lg font-bold text-text-primary tracking-tight font-['Outfit',sans-serif]">
                    Accès autorisé
                  </h2>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <p className="text-xs text-text-secondary">Choisissez votre espace</p>
              </motion.div>

              {/* Bottom bar */}
              <motion.div
                className="mt-4 h-0.5 rounded-full overflow-hidden w-36"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <motion.div
                  className="h-full w-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-400 to-cyan-400"
                  animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                  style={{ backgroundSize: '200% 100%' }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
