import { PC_STATUS_LABELS } from '@/types/pc.types'
import type { PCRecord, PCStatus } from '@/types/pc.types'

interface StatusCellProps {
  pc: PCRecord
}

const STATUS_STYLES: Record<PCStatus, { color: string; bg: string; border: string; label: string }> = {
  a_chaud: {
    color: '#4ade80',
    bg: 'rgba(34,197,94,0.10)',
    border: 'rgba(34,197,94,0.25)',
    label: 'A chaud',
  },
  a_reusiner: {
    color: '#fbbf24',
    bg: 'rgba(245,158,11,0.10)',
    border: 'rgba(245,158,11,0.25)',
    label: 'A reusiner',
  },
  en_usinage: {
    color: '#fbbf24',
    bg: 'rgba(245,158,11,0.10)',
    border: 'rgba(245,158,11,0.22)',
    label: 'En usinage',
  },
  disponible: {
    color: '#60a5fa',
    bg: 'rgba(59,130,246,0.10)',
    border: 'rgba(59,130,246,0.25)',
    label: 'Disponible',
  },
  envoye: {
    color: '#a78bfa',
    bg: 'rgba(139,92,246,0.10)',
    border: 'rgba(139,92,246,0.25)',
    label: 'Envoye',
  },
}

export function StatusCell({ pc }: StatusCellProps) {
  const style = STATUS_STYLES[pc.status]

  return (
    <td className="px-4 py-[11px]">
      <span
        className="inline-flex items-center whitespace-nowrap rounded-full border px-[10px] py-[3px] text-[11px] font-bold"
        style={{ background: style.bg, color: style.color, borderColor: style.border }}
        title={PC_STATUS_LABELS[pc.status]}
      >
        <span className="mr-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full" style={{ background: style.color }} />
        {style.label}
      </span>
    </td>
  )
}
