// Premium styled input with label, error display, and optional prefix icon
// Blueprint Forge design — focus glow, glassmorphism surface

import { forwardRef } from 'react'
import type { LucideIcon } from 'lucide-react'
import { AlertTriangle } from 'lucide-react'

interface ArticleFormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  required?: boolean
  error?: string
  prefixIcon?: LucideIcon
  suffixSlot?: React.ReactNode
  hint?: string
}

export const ArticleFormInput = forwardRef<HTMLInputElement, ArticleFormInputProps>(
  ({ label, required, error, prefixIcon: PrefixIcon, suffixSlot, hint, className = '', ...rest }, ref) => {
    return (
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-text-secondary" style={{ fontFamily: 'Outfit, sans-serif' }}>
          {label}
          {required && <span className="text-red-400 ml-0.5">*</span>}
        </label>

        <div className="relative flex items-center gap-2">
          {PrefixIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <PrefixIcon className="h-4 w-4 text-text-muted" />
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full h-11 rounded-xl text-sm text-text-primary placeholder:text-text-muted
              border border-border bg-surface-elevated
              focus:outline-none focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10
              focus:shadow-[0_0_15px_rgba(59,130,246,0.08)]
              transition-all duration-200
              ${PrefixIcon ? 'pl-10' : 'pl-3.5'} pr-3.5
              ${error ? 'border-red-500/40 ring-1 ring-red-500/10' : ''}
              ${className}
            `}
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
            {...rest}
          />
          {suffixSlot}
        </div>

        {hint && !error && (
          <p className="text-[10px] text-text-muted pl-1" style={{ fontFamily: 'Outfit, sans-serif' }}>{hint}</p>
        )}
        {error && (
          <p className="text-[11px] text-red-400 flex items-center gap-1 pl-0.5">
            <AlertTriangle className="h-3 w-3 flex-shrink-0" /> {error}
          </p>
        )}
      </div>
    )
  }
)

ArticleFormInput.displayName = 'ArticleFormInput'
