// PageHeader — en-tête réutilisable pour les pages
// Affiche un titre, une description optionnelle et une action

import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
  icon?: ReactNode
  pills?: Array<{ label: string; color?: string }>
}

export function PageHeader({ title, description, action, icon, pills }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="flex items-start gap-3">
        {icon && (
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px]"
            style={{ background: 'var(--green-subtle)', border: '1px solid var(--green-border)' }}
          >
            <span className="text-brand-light">{icon}</span>
          </div>
        )}
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)] sm:text-2xl">{title}</h1>
          {description && <p className="text-sm text-[var(--text-muted)]">{description}</p>}
          {pills && pills.length > 0 && (
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
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
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
