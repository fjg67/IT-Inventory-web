// LoadingSpinner — indicateur de chargement animé
// Peut être affiché en pleine page ou en ligne

import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  fullPage?: boolean
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

const sizeClasses = {
  sm: 'h-5 w-5 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-4',
} as const

export function LoadingSpinner({ fullPage = false, size = 'md', label = 'Chargement de votre session...' }: LoadingSpinnerProps) {
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
      <div className="fixed inset-0 z-50 overflow-hidden bg-background">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[8%] left-[10%] h-72 w-72 rounded-full bg-blue-500/12 blur-3xl animate-pulse" />
          <div className="absolute bottom-[8%] right-[10%] h-80 w-80 rounded-full bg-indigo-500/12 blur-3xl animate-pulse [animation-delay:300ms]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.08)_0%,transparent_62%)]" />
        </div>

        <div className="relative h-full w-full flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md p-8 sm:p-10 text-center">
            <div className="relative mx-auto h-24 w-24">
              <div className="absolute inset-0 rounded-full border border-primary/30 animate-spin [animation-duration:5s]" />
              <div className="absolute inset-[6px] rounded-full border border-primary/20 animate-spin [animation-duration:3.8s] [animation-direction:reverse]" />
              <div className="absolute inset-[12px] rounded-full bg-gradient-to-br from-primary to-indigo-500 shadow-[0_0_40px_rgba(59,130,246,0.35)] flex items-center justify-center">
                <span className="text-white font-bold tracking-wider text-sm">IT</span>
              </div>
            </div>

            <h2 className="mt-6 text-xl sm:text-2xl font-semibold text-text-primary tracking-tight">
              IT-Inventory
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              {label}
            </p>

            <div className="mt-6 h-1.5 w-full rounded-full bg-surface-elevated overflow-hidden">
              <div className="h-full w-2/5 rounded-full bg-gradient-to-r from-primary via-indigo-400 to-cyan-400 animate-[pulse_1.4s_ease-in-out_infinite]" />
            </div>

            <div className="mt-5 flex items-center justify-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary animate-bounce" />
              <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:120ms]" />
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:240ms]" />
            </div>
          </div>
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
