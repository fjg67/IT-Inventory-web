import { Building2, MapPin } from 'lucide-react'
import type { PCRecord } from '@/types/pc.types'

interface CategoryCellProps {
  pc: PCRecord
}

const CAT_STYLES = {
  portable_siege: {
    bg: 'rgba(34,197,94,0.10)',
    color: '#4ade80',
    border: 'rgba(34,197,94,0.22)',
    Icon: Building2,
    label: 'Portable siege',
  },
  portable_agence: {
    bg: 'rgba(139,92,246,0.10)',
    color: '#a78bfa',
    border: 'rgba(139,92,246,0.22)',
    Icon: MapPin,
    label: 'Portable agence',
  },
} as const

export function CategoryCell({ pc }: CategoryCellProps) {
  const style = CAT_STYLES[pc.category]

  return (
    <td className="px-4 py-[11px]">
      <span
        className="inline-flex items-center whitespace-nowrap rounded-full border px-[10px] py-[3px] text-[11px] font-semibold"
        style={{
          background: style.bg,
          color: style.color,
          borderColor: style.border,
        }}
      >
        <style.Icon className="mr-[5px] h-[10px] w-[10px]" />
        {style.label}
      </span>
    </td>
  )
}
