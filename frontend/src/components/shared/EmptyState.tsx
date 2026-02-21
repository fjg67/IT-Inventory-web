// EmptyState — état vide affiché quand il n'y a pas de données
// Centré avec une icône, un titre et une action optionnelle

import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 text-center',
        className
      )}
    >
      {/* Icône avec fond décoratif */}
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
        <Icon className="h-8 w-8 text-text-muted" />
      </div>

      {/* Titre */}
      <h3 className="mb-1 text-lg font-semibold text-text-primary">{title}</h3>

      {/* Description */}
      {description && (
        <p className="mb-6 max-w-sm text-sm text-text-secondary">
          {description}
        </p>
      )}

      {/* Action optionnelle */}
      {action && <div>{action}</div>}
    </div>
  )
}
