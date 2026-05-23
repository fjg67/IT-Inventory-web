import type { ReactNode } from 'react'

interface PageHeaderProps {
  icon: ReactNode
  title: string
  subtitle?: string
  pills?: Array<{ label: string; color?: string }>
  actions?: ReactNode
}

export function ObsidianPageHeader({ icon, title, subtitle, pills, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px]"
          style={{ background: 'var(--green-subtle)', border: '1px solid var(--green-border)' }}
        >
          <span className="text-xl text-brand-light">{icon}</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-[var(--text-muted)]">{subtitle}</p>}
          {pills && (
            <div className="mt-1.5 flex items-center gap-2">
              {pills.map((pill, index) => (
                <span
                  key={`${pill.label}-${index}`}
                  className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                  style={{
                    color: pill.color ?? 'var(--green-light)',
                    background: pill.color ? `${pill.color}18` : 'var(--green-subtle)',
                    border: `1px solid ${pill.color ? `${pill.color}30` : 'var(--green-border)'}`,
                  }}
                >
                  {pill.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
