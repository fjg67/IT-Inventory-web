import type { ReactNode } from 'react'
import { useCountUp } from '@/hooks/useCountUp'

interface StatCardProps {
  value: number
  label: string
  accentColor: string
  icon: ReactNode
  trend?: string
  onClick?: () => void
  active?: boolean
}

export function StatCard({ value, label, accentColor, icon, trend, onClick, active }: StatCardProps) {
  const displayValue = useCountUp(value, 600)

  return (
    <button
      onClick={onClick}
      className={`rounded-card border border-[var(--border-subtle)] bg-bg-card p-4 text-left transition-all duration-200 hover:border-[var(--border-card)] hover:bg-bg-elevated ${
        active ? 'bg-bg-elevated ring-1 ring-[var(--border-accent)]' : ''
      }`}
      style={{ borderLeft: `3px solid ${accentColor}` }}
      type="button"
    >
      <div className="mb-3 flex items-center gap-2">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px]"
          style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}30` }}
        >
          <span style={{ color: accentColor }} className="text-base">
            {icon}
          </span>
        </div>
        <span className="truncate text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">{label}</span>
      </div>
      <div className="tabular-nums text-3xl font-bold leading-none text-[var(--text-primary)]">{displayValue}</div>
      {trend && <div className="mt-2 text-xs text-[var(--text-muted)]">{trend}</div>}
    </button>
  )
}
