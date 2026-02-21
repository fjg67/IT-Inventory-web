// Sticky footer with progress indicator and action buttons
// Blueprint Forge design — glassmorphism bar with gradient progress

import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

interface ArticleFormFooterProps {
  isEditing: boolean
  loading: boolean
  onCancel: () => void
  /** Percentage 0-100 of required fields filled */
  progress: number
}

export function ArticleFormFooter({ isEditing, loading, onCancel, progress }: ArticleFormFooterProps) {
  return (
    <div className="sticky bottom-0 -mx-6 -mb-6 mt-6">
      {/* Progress bar */}
      <div className="h-[2px] bg-white/[0.03] relative overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-cyan-400"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        />
      </div>

      {/* Button bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#09101E]/90 backdrop-blur-xl border-t border-white/[0.04]">
        {/* Progress label */}
        <span className="text-[11px] text-slate-600 font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          {progress < 100 ? `${Math.round(progress)}% complété` : '✓ Prêt'}
        </span>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="
              h-10 px-5 rounded-xl text-sm font-medium
              border border-white/[0.06] bg-transparent text-slate-400
              hover:bg-white/[0.04] hover:text-slate-300
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-all active:scale-95
            "
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Annuler
          </button>

          <button
            type="submit"
            disabled={loading}
            className="
              relative h-10 px-6 rounded-xl text-sm font-semibold
              bg-gradient-to-r from-blue-500 to-blue-600 text-white
              hover:from-blue-600 hover:to-blue-700
              shadow-[0_0_20px_rgba(59,130,246,0.2)]
              hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]
              disabled:opacity-60 disabled:cursor-not-allowed
              transition-all active:scale-95
              overflow-hidden
            "
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {isEditing ? 'Enregistrement…' : 'Création…'}
              </span>
            ) : (
              isEditing ? 'Enregistrer' : "Créer l'article"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
