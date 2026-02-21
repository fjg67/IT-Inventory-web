// Premium custom select wrapper for article form
// Blueprint Forge design — consistent with ArticleFormInput styling

import type { ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface SelectOption {
  value: string
  label: string
  icon?: string
}

interface ArticleFormSelectProps {
  label: string
  required?: boolean
  error?: string
  placeholder?: string
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  emptyLabel?: string
  children?: ReactNode
}

export function ArticleFormSelect({
  label,
  required,
  error,
  placeholder,
  options,
  value,
  onChange,
  emptyLabel = '—',
}: ArticleFormSelectProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-slate-400" style={{ fontFamily: 'Outfit, sans-serif' }}>
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>

      <Select value={value || '_none'} onValueChange={(v) => onChange(v === '_none' ? '' : v)}>
        <SelectTrigger
          className={`
            h-11 rounded-xl text-sm bg-[#0E1826] border-white/[0.06]
            focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10
            focus:shadow-[0_0_15px_rgba(59,130,246,0.08)]
            transition-all duration-200
            ${error ? 'border-red-500/40 ring-1 ring-red-500/10' : ''}
          `}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-[#111F30] border-white/10 backdrop-blur-xl">
          {!required && (
            <SelectItem value="_none">{emptyLabel}</SelectItem>
          )}
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              <span className="flex items-center gap-2">
                {opt.icon && <span>{opt.icon}</span>}
                <span>{opt.label}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {error && (
        <p className="text-[11px] text-red-400 flex items-center gap-1 pl-0.5">
          <AlertTriangle className="h-3 w-3 flex-shrink-0" /> {error}
        </p>
      )}
    </div>
  )
}
