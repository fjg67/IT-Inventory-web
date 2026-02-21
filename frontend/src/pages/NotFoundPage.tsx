// Page 404 — page non trouvée avec illustration et lien de retour

import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, SearchX, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fond avec effets décoratifs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-danger/5 rounded-full blur-3xl" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.02)_0%,transparent_65%)]" />
      </div>

      <div className="relative z-10 text-center max-w-lg">
        {/* Illustration 404 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-8"
        >
          <div className="relative inline-flex items-center justify-center w-32 h-32 mb-6">
            {/* Cercle décoratif avec glow */}
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl animate-pulse" />
            <div className="relative w-32 h-32 bg-gradient-to-br from-surface to-surface-elevated rounded-full flex items-center justify-center border border-border shadow-xl">
              <SearchX className="h-16 w-16 text-text-muted" />
            </div>
          </div>

          {/* Code d'erreur */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-8xl font-black tracking-tighter gradient-text mb-4"
          >
            404
          </motion.h1>
        </motion.div>

        {/* Titre et description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-3 mb-10"
        >
          <h2 className="text-2xl font-bold text-text-primary">
            Page non trouvée
          </h2>
          <p className="text-text-secondary text-sm max-w-md mx-auto leading-relaxed">
            La page que vous recherchez n'existe pas ou a été déplacée.
            Vérifiez l'URL ou retournez au tableau de bord.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex items-center justify-center gap-3"
        >
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <Button asChild>
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Tableau de bord
            </Link>
          </Button>
        </motion.div>

        {/* Ligne décorative */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12 h-px bg-gradient-to-r from-transparent via-border to-transparent"
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-4 text-xs text-text-muted"
        >
          IT-Inventory — Système de gestion de stock informatique
        </motion.p>
      </div>
    </div>
  )
}
