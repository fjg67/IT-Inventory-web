// StatusBadge — badge statut animé pour la page paramètres

import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  label: string
  type: 'success' | 'info' | 'warning' | 'role'
  pulse?: boolean
}

const BADGE_STYLES = {
  success: {
    bg: 'bg-emerald-500/[0.08]',
    border: 'border-emerald-500/25',
    text: 'text-emerald-400',
    dot: 'bg-emerald-400',
  },
  info: {
    bg: 'bg-blue-500/[0.08]',
    border: 'border-blue-500/25',
    text: 'text-blue-400',
    dot: 'bg-blue-400',
  },
  warning: {
    bg: 'bg-amber-500/[0.08]',
    border: 'border-amber-500/25',
    text: 'text-amber-400',
    dot: 'bg-amber-400',
  },
  role: {
    bg: 'bg-indigo-500/[0.1]',
    border: 'border-indigo-500/30',
    text: 'text-indigo-300',
    dot: 'bg-indigo-400',
  },
}

export function StatusBadge({ label, type, pulse = false }: StatusBadgeProps) {
  const s = BADGE_STYLES[type]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1',
        s.bg,
        s.border,
        s.text
      )}
    >
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span
            className={cn(
              'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping',
              s.dot
            )}
          />
          <span className={cn('relative inline-flex h-1.5 w-1.5 rounded-full', s.dot)} />
        </span>
      )}
      <span
        className="text-[12px] font-medium"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        {label}
      </span>
    </span>
  )
}
