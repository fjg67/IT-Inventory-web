// Callout box info/warning — pour les points importants dans les chapitres
// Design : border-left accent, glassmorphism, icône flottante

import { Info, AlertTriangle } from 'lucide-react'

interface TermsCalloutProps {
  type: 'info' | 'warning'
  children: React.ReactNode
}

const STYLES = {
  info: {
    bg: 'bg-blue-500/[0.06]',
    border: 'border-blue-500/15',
    borderLeft: 'border-l-blue-500',
    icon: Info,
    iconColor: 'text-blue-400',
  },
  warning: {
    bg: 'bg-amber-500/[0.06]',
    border: 'border-amber-500/15',
    borderLeft: 'border-l-amber-500',
    icon: AlertTriangle,
    iconColor: 'text-amber-400',
  },
}

export function TermsCallout({ type, children }: TermsCalloutProps) {
  const s = STYLES[type]
  const Icon = s.icon

  return (
    <div
      className={`
        relative my-5 rounded-r-xl border ${s.border} border-l-[3px] ${s.borderLeft}
        ${s.bg} px-4 py-3.5
      `}
    >
      <div className="flex items-start gap-3">
        <Icon className={`h-4 w-4 ${s.iconColor} mt-0.5 shrink-0`} />
        <p className="text-[14px] font-['Lora'] text-text-secondary leading-relaxed">
          {children}
        </p>
      </div>
    </div>
  )
}
