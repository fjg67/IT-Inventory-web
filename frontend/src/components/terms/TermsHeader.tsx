// Header de la page Terms — breadcrumb, titre, badge, meta card, tabs
// Design : gradient title, badge légal, info card, tabs avec layoutId

import { motion } from 'framer-motion'
import { ArrowLeft, Scale, FileText, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

type TabType = 'terms' | 'privacy'

interface TermsHeaderProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

export function TermsHeader({ activeTab, onTabChange }: TermsHeaderProps) {
  const navigate = useNavigate()

  return (
    <header className="mb-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 mb-6">
        <button
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2 text-[13px] font-['Outfit'] text-text-secondary hover:text-text-primary transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Paramètres
        </button>
        <span className="text-text-muted mx-1">/</span>
        <span className="text-[13px] font-['Outfit'] text-text-secondary">
          Conditions d'utilisation
        </span>
      </nav>

      {/* Titre + meta */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        {/* Gauche */}
        <div>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 rounded-full bg-indigo-500/[0.1] border border-indigo-500/25">
            <Scale className="h-[13px] w-[13px] text-violet-400" />
            <span className="text-[11px] font-['Outfit'] font-semibold tracking-[0.1em] uppercase text-violet-400">
              Documents légaux
            </span>
          </div>

          {/* Titre */}
          <h1 className="font-['Outfit'] text-[32px] sm:text-[32px] font-extrabold leading-[1.15] text-text-primary">
            Conditions d'utilisation &
            <br />
            <span className="text-text-primary">Politique de confidentialité</span>
          </h1>
        </div>

        {/* Droite — meta card */}
        <div className="min-w-[200px] rounded-[14px] bg-surface border border-border p-4 space-y-0">
          {/* Dernière mise à jour */}
          <div className="flex items-center justify-between py-2">
            <span className="text-[11px] font-['Outfit'] text-text-secondary">
              Dernière mise à jour
            </span>
            <span className="text-[12px] font-['JetBrains_Mono'] font-semibold text-text-secondary">
              15 janvier 2026
            </span>
          </div>
          <div className="h-px bg-[var(--sidebar-hover)]" />
          {/* Version */}
          <div className="flex items-center justify-between py-2">
            <span className="text-[11px] font-['Outfit'] text-text-secondary">
              Version
            </span>
            <span className="text-[12px] font-['JetBrains_Mono'] font-semibold text-blue-400">
              1.0.0
            </span>
          </div>
          <div className="h-px bg-[var(--sidebar-hover)]" />
          {/* Langue */}
          <div className="flex items-center justify-between py-2">
            <span className="text-[11px] font-['Outfit'] text-text-secondary">
              Langue
            </span>
            <span className="text-[12px] font-['Outfit'] font-semibold text-text-secondary">
              Français 🇫🇷
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 inline-flex items-center gap-1 p-1 rounded-xl bg-[var(--sidebar-hover)] border border-border">
        <TabButton
          active={activeTab === 'terms'}
          icon={FileText}
          label="Conditions d'utilisation"
          onClick={() => onTabChange('terms')}
        />
        <TabButton
          active={activeTab === 'privacy'}
          icon={Shield}
          label="Politique de confidentialité"
          onClick={() => onTabChange('privacy')}
        />
      </div>
    </header>
  )
}

// ── Tab button interne ──

interface TabButtonProps {
  active: boolean
  icon: typeof FileText
  label: string
  onClick: () => void
}

function TabButton({ active, icon: Icon, label, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        relative flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-['Outfit'] font-medium
        transition-colors duration-150
        ${
          active
            ? 'text-text-primary'
            : 'text-text-secondary hover:text-text-primary hover:bg-[var(--sidebar-hover)]'
        }
      `}
    >
      {active && (
        <motion.div
          layoutId="terms-active-tab"
          className="absolute inset-0 rounded-lg bg-surface border border-border shadow-[0_1px_4px_rgba(0,0,0,0.3)]"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-2">
        <Icon className="h-[14px] w-[14px]" />
        {label}
      </span>
    </button>
  )
}
