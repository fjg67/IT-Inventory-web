import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode
  rightElement?: React.ReactNode
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, leftIcon, rightElement, error, ...props }, ref) => {
    return (
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-base text-[var(--text-muted)]">
            {leftIcon}
          </span>
        )}
        <input
          type={type}
          className={cn(
            "flex h-11 w-full rounded-xl border border-[var(--border-subtle)] bg-bg-elevated py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-dim)] transition-colors duration-150 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:border-[var(--border-focus)] focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]/40 disabled:cursor-not-allowed disabled:opacity-50",
            leftIcon ? 'pl-10' : 'pl-4',
            rightElement ? 'pr-12' : 'pr-4',
            error ? 'border-[var(--danger)] focus-visible:border-[var(--danger)] focus-visible:ring-[var(--danger)]/30' : '',
            className
          )}
          ref={ref}
          {...props}
        />
        {rightElement && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</span>
        )}
        {error && <p className="mt-1.5 text-xs text-[var(--danger)]">{error}</p>}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
