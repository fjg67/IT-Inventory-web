// Support Footer — Section contact avec statut système et version
// Design : glassmorphism, gradient dividers, glow accents

import { motion } from 'framer-motion'
import { Mail, Github, Heart, Activity, CheckCircle } from 'lucide-react'

export function SupportFooter() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="space-y-3"
    >
      {/* Gradient divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="rounded-2xl bg-[var(--sidebar-hover)] backdrop-blur-xl border border-border overflow-hidden">
        {/* Top section */}
        <div className="p-5 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-semibold text-text-primary font-['Outfit']">
                Besoin d'aide supplémentaire ?
              </h3>
              <p className="text-[12px] text-text-secondary">
                Notre équipe est disponible du lundi au vendredi, 9h — 18h
              </p>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/[0.06] border border-emerald-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="text-[10px] font-medium text-emerald-400 uppercase tracking-wider">
                En ligne
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <a
              href="mailto:support@it-inventory.fr"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/[0.08] border border-blue-500/25 hover:bg-blue-500/[0.14] hover:border-blue-500/35 transition-all duration-300 group"
            >
              <Mail className="h-3.5 w-3.5 text-blue-400" />
              <span className="text-[12px] font-medium text-blue-300 group-hover:text-blue-200 transition-colors">
                support@it-inventory.fr
              </span>
            </a>
            <a
              href="#"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--sidebar-hover)] border border-border hover:bg-[var(--sidebar-hover)] hover:border-border transition-all duration-300 group"
            >
              <Github className="h-3.5 w-3.5 text-text-secondary" />
              <span className="text-[12px] font-medium text-text-secondary group-hover:text-text-primary transition-colors">
                GitHub
              </span>
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[var(--sidebar-hover)]" />

        {/* Bottom bar */}
        <div className="px-5 py-3 flex items-center justify-between">
          {/* System status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-3 w-3 text-emerald-500/70" />
              <span className="text-[10px] text-text-muted">Système opérationnel</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Activity className="h-3 w-3 text-text-muted" />
              <span className="text-[10px] text-text-muted font-['JetBrains_Mono']">
                v2.4.0
              </span>
            </div>
          </div>

          {/* Made with love */}
          <div className="flex items-center gap-1 text-[10px] text-text-muted">
            <span>Made with</span>
            <Heart className="h-2.5 w-2.5 text-red-500/60 fill-red-500/40" />
            <span>by Florian</span>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
