// LogoutButton — bouton déconnexion premium avec confirmation visuelle

import { useState } from 'react'
import { motion } from 'framer-motion'
import { LogOut, Loader2 } from 'lucide-react'
import { LogoutConfirmDialog } from '@/components/shared/LogoutConfirmDialog'

interface LogoutButtonProps {
  onLogout: () => void | Promise<void>
  userName?: string
}

export function LogoutButton({ onLogout, userName }: LogoutButtonProps) {
  const [loading, setLoading] = useState(false)
  const [showDialog, setShowDialog] = useState(false)

  const handleClick = () => {
    setShowDialog(true)
  }

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onLogout()
    } finally {
      setLoading(false)
      setShowDialog(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="mt-6 mb-2"
    >
      {/* Ligne danger décorative */}
      <div
        className="h-px mb-6"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.2), transparent)',
        }}
      />

      {/* Bouton */}
      <button
        onClick={handleClick}
        disabled={loading}
        aria-label="Se déconnecter de l'application"
        className="w-full h-[52px] rounded-xl flex items-center justify-center gap-3
          bg-red-500/[0.08] border border-red-500/20
          hover:bg-red-500/[0.15] hover:border-red-500/40
          hover:shadow-[0_4px_20px_rgba(239,68,68,0.2)]
          active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed
          transition-all duration-200 ease-out group"
      >
        {loading ? (
          <Loader2 className="h-[18px] w-[18px] text-red-400 animate-spin" />
        ) : (
          <LogOut className="h-[18px] w-[18px] text-red-400 transition-transform duration-200 group-hover:-translate-x-0.5" />
        )}
        <span
          className="text-[15px] font-semibold text-red-400"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          {loading ? 'Déconnexion...' : 'Se déconnecter'}
        </span>
      </button>

      {/* Label danger zone */}
      <p className="text-center text-[11px] text-text-muted italic mt-3">
        Cette action mettra fin à votre session active
      </p>

      {/* Modale de confirmation */}
      <LogoutConfirmDialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        onConfirm={handleConfirm}
        userName={userName}
      />
    </motion.div>
  )
}
