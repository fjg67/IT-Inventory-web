// LogoutConfirmDialog — modale de confirmation de déconnexion
// Affiche un message clair avant de se déconnecter de la session

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, ShieldAlert, X, Loader2 } from 'lucide-react'

interface LogoutConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  userName?: string
}

export function LogoutConfirmDialog({ open, onClose, onConfirm, userName }: LogoutConfirmDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Overlay */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            className="relative w-full max-w-sm rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            {/* Gradient accent bar */}
            <div className="h-1 w-full bg-gradient-to-r from-red-500 via-orange-500 to-red-500" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-[var(--sidebar-hover)] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Content */}
            <div className="px-6 pt-6 pb-2 text-center">
              {/* Icon */}
              <motion.div
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 ring-1 ring-red-500/20"
                initial={{ rotate: -10, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
              >
                <ShieldAlert className="h-8 w-8 text-red-500" />
              </motion.div>

              {/* Title */}
              <h3 className="text-lg font-bold text-text-primary tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Déconnexion de la session
              </h3>

              {/* Description */}
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                {userName
                  ? <>Voulez-vous vraiment déconnecter <span className="font-semibold text-text-primary">{userName}</span> ?</>
                  : 'Voulez-vous vraiment vous déconnecter ?'
                }
              </p>
              <p className="mt-1 text-xs text-text-muted">
                Votre session active sera terminée et vous serez redirigé vers la page de connexion.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 px-6 pb-6 pt-4">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 h-11 rounded-xl border border-border text-sm font-medium text-text-secondary
                  hover:bg-[var(--sidebar-hover)] hover:text-text-primary
                  transition-all duration-200 active:scale-[0.97]"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 h-11 rounded-xl bg-red-500 text-sm font-semibold text-white
                  hover:bg-red-600 shadow-lg shadow-red-500/25
                  disabled:opacity-70 disabled:cursor-not-allowed
                  transition-all duration-200 active:scale-[0.97]
                  flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Déconnexion...
                  </>
                ) : (
                  <>
                    <LogOut className="h-4 w-4" />
                    Se déconnecter
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
