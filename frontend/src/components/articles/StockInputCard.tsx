// Card with centered number input and +/- buttons
// Blueprint Forge design — glow card for stock/threshold inputs

import { forwardRef } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Minus, Plus } from 'lucide-react'

interface StockInputCardProps {
  label: string
  icon: LucideIcon
  accentColor: 'blue' | 'amber'
  value: number
  onChange: (value: number) => void
  min?: number
  error?: string
}

const ACCENT = {
  blue: {
    cardBg: 'bg-blue-500/[0.04]',
    cardBorder: 'border-blue-500/15',
    cardRing: 'ring-blue-500/10',
    iconBg: 'bg-blue-500/15',
    iconText: 'text-blue-400',
    btnHover: 'hover:bg-blue-500/15 hover:text-blue-300',
    inputFocus: 'focus:border-blue-500/40',
  },
  amber: {
    cardBg: 'bg-amber-500/[0.04]',
    cardBorder: 'border-amber-500/15',
    cardRing: 'ring-amber-500/10',
    iconBg: 'bg-amber-500/15',
    iconText: 'text-amber-400',
    btnHover: 'hover:bg-amber-500/15 hover:text-amber-300',
    inputFocus: 'focus:border-amber-500/40',
  },
}

export const StockInputCard = forwardRef<HTMLInputElement, StockInputCardProps>(
  ({ label, icon: Icon, accentColor, value, onChange, min = 0, error }, ref) => {
    const a = ACCENT[accentColor]

    const increment = () => onChange(Math.max(min, value + 1))
    const decrement = () => onChange(Math.max(min, value - 1))

    return (
      <div className="space-y-1.5">
        <div className={`flex flex-col items-center p-4 rounded-xl ${a.cardBg} border ${a.cardBorder} ring-1 ${a.cardRing}`}>
          {/* Icon */}
          <div className={`p-2 rounded-lg ${a.iconBg} mb-2`}>
            <Icon className={`h-5 w-5 ${a.iconText}`} />
          </div>

          {/* Label */}
          <span className="text-[11px] text-slate-500 mb-3 font-medium" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {label}
          </span>

          {/* +/- controls + input */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={decrement}
              className={`w-9 h-9 rounded-lg border border-white/[0.06] bg-[#0E1826] flex items-center justify-center text-slate-500 ${a.btnHover} transition-all active:scale-90`}
            >
              <Minus className="h-4 w-4" />
            </button>

            <input
              ref={ref}
              type="number"
              min={min}
              value={value}
              onChange={(e) => onChange(Math.max(min, parseInt(e.target.value) || 0))}
              className={`
                w-16 h-12 text-center text-lg font-bold rounded-xl
                bg-[#0E1826] border border-white/[0.06] text-slate-200
                focus:outline-none focus:ring-2 focus:ring-blue-500/10 ${a.inputFocus}
                transition-all
              `}
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            />

            <button
              type="button"
              onClick={increment}
              className={`w-9 h-9 rounded-lg border border-white/[0.06] bg-[#0E1826] flex items-center justify-center text-slate-500 ${a.btnHover} transition-all active:scale-90`}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {error && (
          <p className="text-[11px] text-red-400 text-center">{error}</p>
        )}
      </div>
    )
  }
)

StockInputCard.displayName = 'StockInputCard'
