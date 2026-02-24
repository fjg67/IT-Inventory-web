// Quick Actions — 3 cartes d'action rapide (Contact, Vidéos, Changelog)
// Design : glassmorphism cards avec gradient hover et icônes

import { motion } from 'framer-motion'
import { Mail, PlayCircle, Newspaper, ExternalLink } from 'lucide-react'

const ACTIONS = [
  {
    id: 'contact',
    icon: Mail,
    title: 'Contacter le support',
    description: 'Envoyez-nous un message pour toute question.',
    color: 'text-blue-400',
    colorBg: 'bg-blue-500/[0.08]',
    hoverGlow: 'group-hover:shadow-[0_0_24px_rgba(59,130,246,0.12)]',
    link: 'mailto:support@it-inventory.fr',
  },
  {
    id: 'videos',
    icon: PlayCircle,
    title: 'Tutoriels vidéo',
    description: 'Apprenez visuellement avec nos guides.',
    color: 'text-emerald-400',
    colorBg: 'bg-emerald-500/[0.08]',
    hoverGlow: 'group-hover:shadow-[0_0_24px_rgba(16,185,129,0.12)]',
    link: '#',
  },
  {
    id: 'changelog',
    icon: Newspaper,
    title: 'Notes de version',
    description: 'Découvrez les dernières nouveautés.',
    color: 'text-amber-400',
    colorBg: 'bg-amber-500/[0.08]',
    hoverGlow: 'group-hover:shadow-[0_0_24px_rgba(245,158,11,0.12)]',
    link: '#',
  },
]

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const cardVariant = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
}

export function QuickActions() {
  return (
    <motion.section
      variants={stagger}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-3 gap-3"
    >
      {ACTIONS.map((a) => (
        <motion.a
          key={a.id}
          variants={cardVariant}
          href={a.link}
          target={a.link.startsWith('mailto:') ? undefined : '_blank'}
          rel="noopener noreferrer"
          className={`
            group relative flex flex-col gap-3 p-4 rounded-2xl
            bg-[var(--sidebar-hover)] backdrop-blur-xl
            border border-border
            hover:border-border hover:bg-[var(--sidebar-hover)]
            transition-all duration-300 cursor-pointer
            ${a.hoverGlow}
          `}
        >
          {/* Icône */}
          <div
            className={`
              w-9 h-9 rounded-xl flex items-center justify-center
              ${a.colorBg} border border-border
            `}
          >
            <a.icon className={`h-4 w-4 ${a.color}`} />
          </div>

          {/* Texte */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-semibold text-text-primary font-['Outfit']">
                {a.title}
              </h3>
              <ExternalLink className="h-3 w-3 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-[12px] text-text-secondary leading-relaxed">
              {a.description}
            </p>
          </div>
        </motion.a>
      ))}
    </motion.section>
  )
}
