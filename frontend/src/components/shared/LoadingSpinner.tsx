// LoadingSpinner — indicateur de chargement animé
// Peut être affiché en pleine page ou en ligne

import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  fullPage?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'h-5 w-5 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-3',
} as const

export function LoadingSpinner({ fullPage = false, size = 'md' }: LoadingSpinnerProps) {
  const spinner = (
    <div
      className={cn(
        'animate-spin rounded-full border-primary/30 border-t-primary',
        sizeClasses[size]
      )}
    />
  )

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          {spinner}
          <p className="text-sm text-text-secondary animate-pulse">
            Chargement...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-8">
      {spinner}
    </div>
  )
}
