// SettingRow — ligne item réutilisable pour la page paramètres

import type { LucideIcon } from 'lucide-react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SettingRowProps {
  icon: LucideIcon
  iconBg: string
  iconColor: string
  label: string
  sublabel?: string
  value?: React.ReactNode
  onClick?: () => void
  showChevron?: boolean
  isLast?: boolean
}

export function SettingRow({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  sublabel,
  value,
  onClick,
  showChevron = false,
  isLast = false,
}: SettingRowProps) {
  const Wrapper = onClick ? 'button' : 'div'

  return (
    <>
      <Wrapper
        onClick={onClick}
        className={cn(
          'flex items-center justify-between w-full px-5 py-[14px]',
          'transition-colors duration-150',
          onClick && 'hover:bg-white/[0.03] cursor-pointer group'
        )}
        {...(onClick ? { type: 'button' as const, 'aria-label': label } : {})}
      >
        {/* Côté gauche */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
              iconBg
            )}
          >
            <Icon className={cn('h-[17px] w-[17px]', iconColor)} />
          </div>
          <div className="min-w-0">
            <p
              className="text-[14px] font-medium text-[#EEF2FF] truncate"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              {label}
            </p>
            {sublabel && (
              <p className="text-[12px] text-slate-500 truncate mt-0.5">
                {sublabel}
              </p>
            )}
          </div>
        </div>

        {/* Côté droit */}
        <div className="flex items-center gap-2 shrink-0 ml-3">
          {value}
          {showChevron && (
            <ChevronRight
              className={cn(
                'h-4 w-4 text-slate-600 transition-transform duration-200',
                onClick && 'group-hover:translate-x-0.5 group-hover:text-slate-500'
              )}
            />
          )}
        </div>
      </Wrapper>

      {/* Séparateur */}
      {!isLast && <div className="h-px bg-white/[0.04] mx-5" />}
    </>
  )
}
