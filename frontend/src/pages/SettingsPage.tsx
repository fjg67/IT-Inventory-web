// Page Paramètres — "Dark Command Center" Premium
// Design system : Outfit (titres) + JetBrains Mono (valeurs techniques)
// Composants modulaires dans components/settings/

import { motion } from 'framer-motion'
import {
  Globe,
  Wifi,
  RefreshCw,
  Activity,
  Tag,
  Code2,
  Shield,
  Monitor,
  Copyright,
  LifeBuoy,
  FileText,
  ChevronRight,
} from 'lucide-react'

import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { AvatarHero } from '@/components/settings/AvatarHero'
import { SectionCard } from '@/components/settings/SectionCard'
import { SettingRow } from '@/components/settings/SettingRow'
import { StatusBadge } from '@/components/settings/StatusBadge'
import { LogoutButton } from '@/components/settings/LogoutButton'

// --- Animation variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
  },
}

// --- Composant principal ---
export default function SettingsPage() {
  const navigate = useNavigate()
  const { user, isAdmin, logout } = useAuth()

  const initials = (user?.name ?? 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="relative min-h-full overflow-hidden">
      {/* Orbe décoratif fond */}
      <div
        className="pointer-events-none absolute top-0 right-0 w-[400px] h-[400px] z-0 hidden sm:block"
        style={{
          background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)',
        }}
      />

      {/* Contenu principal */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* =================== HEADER =================== */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1
              className="text-[28px] font-bold text-text-primary"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Paramètres
            </h1>
            <p className="text-[13px] text-text-secondary mt-1">
              Configuration et informations
            </p>
          </div>

          {/* Badge système actif — point vert pulsant */}
          <div
            className="flex items-center gap-2 rounded-full border px-3 py-1.5"
            style={{
              background: 'rgba(16,185,129,0.08)',
              borderColor: 'rgba(16,185,129,0.25)',
            }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            <span
              className="text-[11px] font-medium text-emerald-400"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              Système actif
            </span>
          </div>
        </motion.div>

        {/* =================== CONTENU STAGGERÉ =================== */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {/* === HERO PROFIL === */}
          <motion.div variants={itemVariants}>
            <AvatarHero
              initials={initials}
              role={user?.role ?? 'TECHNICIAN'}
              isActive
            />
          </motion.div>

          {/* === SYNCHRONISATION === */}
          <motion.div variants={itemVariants}>
            <SectionCard label="Synchronisation" accentColor="bg-blue-500" delay={0.1}>
              {/* État */}
              <SettingRow
                icon={Globe}
                iconBg="bg-blue-500/[0.08]"
                iconColor="text-blue-400"
                label="État"
                value={<StatusBadge label="0 en attente" type="info" />}
              />

              {/* Connexion */}
              <SettingRow
                icon={Wifi}
                iconBg="bg-emerald-500/[0.08]"
                iconColor="text-emerald-400"
                label="Connexion"
                value={
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-[7px] w-[7px]">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-[7px] w-[7px] rounded-full bg-emerald-400" />
                    </span>
                    <span
                      className="text-[13px] font-semibold text-emerald-400"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      Connecté
                    </span>
                  </div>
                }
              />

              {/* Dernière sync */}
              <SettingRow
                icon={RefreshCw}
                iconBg="bg-indigo-500/[0.1]"
                iconColor="text-indigo-300"
                label="Dernière sync"
                isLast
                value={
                  <div className="flex items-center gap-1.5">
                    <Activity className="h-3 w-3 text-indigo-300" />
                    <span
                      className="text-[12px] text-text-secondary"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      Temps réel
                    </span>
                  </div>
                }
              />
            </SectionCard>
          </motion.div>

          {/* === À PROPOS === */}
          <motion.div variants={itemVariants}>
            <SectionCard label="À propos" accentColor="bg-violet-500" delay={0.2}>
              {/* Version */}
              <SettingRow
                icon={Tag}
                iconBg="bg-indigo-500/[0.1]"
                iconColor="text-indigo-300"
                label="Version"
                value={
                  <span
                    className="text-[14px] font-bold"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      background: 'linear-gradient(90deg, #818CF8, #A5B4FC)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    1.0.0
                  </span>
                }
              />

              {/* Créateur */}
              <SettingRow
                icon={Code2}
                iconBg="bg-violet-500/[0.1]"
                iconColor="text-violet-400"
                label="Florian JOVE GARCIA"
                sublabel="Créateur & Développeur"
              />

              {/* Licence */}
              <SettingRow
                icon={Shield}
                iconBg="bg-emerald-500/[0.08]"
                iconColor="text-emerald-400"
                label="Licence"
                value={
                  <span
                    className="text-[12px] text-text-secondary"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    MIT
                  </span>
                }
              />

              {/* Application */}
              <SettingRow
                icon={Monitor}
                iconBg="bg-indigo-500/[0.1]"
                iconColor="text-indigo-300"
                label="IT-Inventory"
                value={
                  <span className="text-[12px] text-text-secondary">
                    Gestion de stock IT
                  </span>
                }
              />

              {/* Copyright */}
              <div className="flex items-center gap-2 px-5 py-3">
                <Copyright className="h-3.5 w-3.5 text-text-muted shrink-0" />
                <p className="text-[11px] text-text-muted italic">
                  © 2026 Florian JOVE GARCIA — Tous droits réservés
                </p>
              </div>
            </SectionCard>
          </motion.div>

          {/* === LIENS === */}
          <motion.div variants={itemVariants}>
            <SectionCard delay={0.3}>
              {/* Aide et support */}
              <SettingRow
                icon={LifeBuoy}
                iconBg="bg-amber-500/[0.08]"
                iconColor="text-amber-400"
                label="Aide et support"
                sublabel="Documentation et FAQ"
                showChevron
                onClick={() => navigate('/help')}
              />

              {/* Conditions */}
              <SettingRow
                icon={FileText}
                iconBg="bg-surface-elevated"
                iconColor="text-text-secondary"
                label="Conditions d'utilisation"
                sublabel="Politique de confidentialité"
                showChevron
                onClick={() => navigate('/terms')}
                isLast
              />
            </SectionCard>
          </motion.div>

          {/* === DÉCONNEXION === */}
          <LogoutButton onLogout={logout} />

          {/* === FOOTER === */}
          <motion.div variants={itemVariants}>
            <p className="text-center text-[11px] text-text-muted pb-4">
              © 2026 IT-Inventory — Tous droits réservés
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
