// Page de connexion — mot de passe d'abord, sélection du profil ensuite
// Flux fidèle à l'app mobile

import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Loader2, ChevronRight, ShieldCheck, ArrowLeft, Check, Sparkles, Unlock } from 'lucide-react'
import logoImg from '@/assets/logo.png'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { authService, type ProfileUser } from '@/services/auth.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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

type Step = 'password' | 'profiles'

export default function LoginPage() {
  const { login, loginLoading, isAuthenticated, isLoading } = useAuth()
  const [step, setStep] = useState<Step>('password')
  const [selectedUser, setSelectedUser] = useState<ProfileUser | null>(null)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [showUnlockAnim, setShowUnlockAnim] = useState(false)

  // Récupération des profils actifs (préchargé pour l'étape 2)
  const { data: profilesData, isLoading: profilesLoading } = useQuery({
    queryKey: ['auth', 'profiles'],
    queryFn: () => authService.getProfiles(),
    staleTime: 60_000,
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
      <div className="min-h-screen bg-[#080d1c] flex items-center justify-center">
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
    setPasswordError('')
    // Show unlock celebration then transition
    setShowUnlockAnim(true)
    setTimeout(() => {
      setShowUnlockAnim(false)
      setStep('profiles')
    }, 1600)
  }

  const handleBack = () => {
    setStep('password')
    setSelectedUser(null)
  }

  const handleSelectUser = (user: ProfileUser) => {
    setSelectedUser(user)
    login({ technicianId: user.technicianId, password })
  }

  const stepLabel = step === 'password'
    ? 'Entrez votre mot de passe'
    : 'Sélectionnez votre profil'

  return (
    <div className="min-h-screen bg-[#080d1c] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fond avec effets */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/[0.04] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500/[0.03] rounded-full blur-3xl" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.03)_0%,transparent_70%)]" />
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white/10"
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
          <h1 className="text-3xl font-bold text-white tracking-tight">
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
              <form onSubmit={handlePasswordNext} className="glass-card p-6 space-y-5">
                <div className="flex items-center gap-2 pb-4 border-b border-border">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <h2 className="text-base font-semibold text-white">
                    Connexion sécurisée
                  </h2>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-text-secondary">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        if (passwordError) setPasswordError('')
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="text-red-400 text-xs mt-1">{passwordError}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold rounded-xl"
                >
                  Continuer
                </Button>
              </form>
            </motion.div>
          ) : (
            // ── Étape 2 : Sélection du profil ──
            <motion.div
              key="profiles-step"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="space-y-3"
            >
              {/* Bouton retour */}
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors mb-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Modifier le mot de passe</span>
              </button>

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
              className="absolute inset-0 bg-[#080d1c]/50 backdrop-blur-sm"
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
                  <h2 className="text-lg font-bold text-white tracking-tight font-['Outfit',sans-serif]">
                    Accès autorisé
                  </h2>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <p className="text-xs text-white/50">Choisissez votre profil</p>
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
