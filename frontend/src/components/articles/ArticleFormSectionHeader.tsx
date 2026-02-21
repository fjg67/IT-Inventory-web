// Section header with icon, label, and decorative blueprint line

import type { LucideIcon } from 'lucide-react'

interface ArticleFormSectionHeaderProps {
  icon: LucideIcon
  label: string
  accentColor?: string // e.g. 'blue', 'amber', 'emerald'
}

const ACCENT_MAP: Record<string, { iconBg: string; iconText: string; lineFrom: string; labelText: string }> = {
  blue: {
    iconBg: 'bg-blue-500/10',
    iconText: 'text-blue-400',
    lineFrom: 'from-blue-500/25',
    labelText: 'text-blue-400/90',
  },
  amber: {
    iconBg: 'bg-amber-500/10',
    iconText: 'text-amber-400',
    lineFrom: 'from-amber-500/25',
    labelText: 'text-amber-400/90',
  },
  emerald: {
    iconBg: 'bg-emerald-500/10',
    iconText: 'text-emerald-400',
    lineFrom: 'from-emerald-500/25',
    labelText: 'text-emerald-400/90',
  },
  purple: {
    iconBg: 'bg-purple-500/10',
    iconText: 'text-purple-400',
    lineFrom: 'from-purple-500/25',
    labelText: 'text-purple-400/90',
  },
  cyan: {
    iconBg: 'bg-cyan-500/10',
    iconText: 'text-cyan-400',
    lineFrom: 'from-cyan-500/25',
    labelText: 'text-cyan-400/90',
  },
  rose: {
    iconBg: 'bg-rose-500/10',
    iconText: 'text-rose-400',
    lineFrom: 'from-rose-500/25',
    labelText: 'text-rose-400/90',
  },
}

export function ArticleFormSectionHeader({ icon: Icon, label, accentColor = 'blue' }: ArticleFormSectionHeaderProps) {
  const accent = ACCENT_MAP[accentColor] ?? ACCENT_MAP['blue']!

  return (
    <div className="flex items-center gap-2.5 pt-5 pb-2">
      <div className={`p-1.5 rounded-lg ${accent.iconBg}`}>
        <Icon className={`h-3.5 w-3.5 ${accent.iconText}`} />
      </div>
      <p className={`text-[11px] font-bold uppercase tracking-[0.15em] ${accent.labelText}`} style={{ fontFamily: 'Outfit, sans-serif' }}>
        {label}
      </p>
      <div className={`flex-1 h-px bg-gradient-to-r ${accent.lineFrom} to-transparent`} />
    </div>
  )
}
