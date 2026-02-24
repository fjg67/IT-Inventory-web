// Footer légal — signature, navigation, badges conformité
// Design : 3 colonnes, gradient divider, badges RGPD + MIT

import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Github } from 'lucide-react'

type TabType = 'terms' | 'privacy'

interface TermsFooterProps {
  onTabChange: (tab: TabType) => void
}

export function TermsFooter({ onTabChange }: TermsFooterProps) {
  const navigate = useNavigate()

  return (
    <footer className="mt-16 pt-8 relative">
      {/* Ligne décorative gradient */}
      <div className="absolute top-0 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
      {/* Ligne de base */}
      <div className="absolute top-0 left-0 right-0 h-px bg-[var(--sidebar-hover)]" />

      {/* Grid 3 colonnes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Col 1 — Signature */}
        <div>
          <p className="font-['Outfit'] text-lg font-extrabold text-text-primary">
            IT-Inventory
          </p>
          <p className="text-[12px] text-text-secondary mt-1">
            Application de gestion de stock IT
          </p>
          <p className="text-[12px] text-text-secondary mt-2">
            © 2026 Florian JOVE GARCIA
          </p>
          <p className="text-[11px] text-text-muted mt-1">
            Tous droits réservés — Licence MIT
          </p>
        </div>

        {/* Col 2 — Navigation rapide */}
        <div>
          <p className="text-[11px] font-['Outfit'] font-bold uppercase tracking-[0.1em] text-text-secondary mb-3">
            Pages légales
          </p>
          <div className="space-y-2">
            <button
              onClick={() => onTabChange('terms')}
              className="block text-[13px] font-['Outfit'] text-text-secondary hover:text-blue-400 transition-colors"
            >
              Conditions d'utilisation
            </button>
            <button
              onClick={() => onTabChange('privacy')}
              className="block text-[13px] font-['Outfit'] text-text-secondary hover:text-blue-400 transition-colors"
            >
              Politique de confidentialité
            </button>
            <button
              onClick={() => navigate('/help')}
              className="block text-[13px] font-['Outfit'] text-text-secondary hover:text-blue-400 transition-colors"
            >
              Aide & Support
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="block text-[13px] font-['Outfit'] text-text-secondary hover:text-blue-400 transition-colors"
            >
              Paramètres
            </button>
          </div>
        </div>

        {/* Col 3 — Badges conformité */}
        <div>
          <p className="text-[11px] font-['Outfit'] font-bold uppercase tracking-[0.1em] text-text-secondary mb-3">
            Conformité
          </p>
          <div className="space-y-2">
            {/* Badge RGPD */}
            <div className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span className="text-[13px] font-['Outfit'] font-semibold text-emerald-400">
                Conforme RGPD
              </span>
            </div>
            <br />
            {/* Badge Open Source */}
            <div className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-indigo-500/[0.08] border border-indigo-500/20">
              <Github className="h-4 w-4 text-violet-400" />
              <span className="text-[13px] font-['Outfit'] font-semibold text-violet-400">
                Licence MIT Open Source
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dernière ligne */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mt-6 pt-4 border-t border-border">
        <p className="text-[11px] font-['Lora'] italic text-text-muted">
          Ces documents sont applicables à partir du 15 janvier 2026
        </p>
        <span className="text-[11px] font-['JetBrains_Mono'] text-text-muted">
          Version 1.0.0
        </span>
      </div>
    </footer>
  )
}
