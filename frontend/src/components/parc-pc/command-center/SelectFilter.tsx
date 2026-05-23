import { cloneElement, isValidElement } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

interface SelectFilterProps {
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  icon: ReactNode
  placeholder: string
}

export function SelectFilter({ value, onChange, options, icon, placeholder }: SelectFilterProps) {
  const renderedIcon = isValidElement(icon)
    ? cloneElement(icon as ReactElement<{ className?: string }>, { className: 'h-3.5 w-3.5' })
    : null

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-2.5 top-1/2 flex -translate-y-1/2 items-center text-[var(--text-muted)]">
        {renderedIcon}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full cursor-pointer appearance-none rounded-[10px] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] py-2 pl-8 pr-7 text-xs text-[var(--text-primary)] transition-colors focus:border-[var(--border-card)] focus:outline-none"
      >
        <option value="all">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-[var(--text-muted)]" />
    </div>
  )
}
