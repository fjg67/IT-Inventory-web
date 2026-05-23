import type { ReactNode } from 'react'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
  accentColor?: string
}

export function SectionHeader({
  title,
  subtitle,
  action,
  accentColor = 'var(--green-primary)',
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="h-5 w-[3px] rounded-full" style={{ background: accentColor }} />
        <div>
          <h2 className="text-base font-bold text-[var(--text-primary)]">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-[var(--text-muted)]">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}
