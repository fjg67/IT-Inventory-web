import type { ReactNode } from 'react'

interface PCMiniCardProps {
  label: string
  value: number
  sub: string
  icon: ReactNode
}

export function PCMiniCard({ label, value, sub, icon }: PCMiniCardProps) {
  return (
    <div className="rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] p-3.5">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">{label}</p>
          <p className="mt-2 text-[22px] font-extrabold leading-none tabular-nums text-[var(--text-primary)]">{value}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[var(--border-card)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
          {icon}
        </div>
      </div>
      <p className="mt-2 text-[11px] text-[var(--text-dim)]">{sub}</p>
    </div>
  )
}
