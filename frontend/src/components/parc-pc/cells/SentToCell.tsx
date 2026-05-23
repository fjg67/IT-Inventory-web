import type { PCRecord } from '@/types/pc.types'

interface SentToCellProps {
  pc: PCRecord
}

export function SentToCell({ pc }: SentToCellProps) {
  return (
    <td className="px-4 py-[11px]">
      {pc.sentTo ? (
        <div>
          <div className="text-[12px] font-medium text-[var(--text-primary)]">EDS {pc.sentTo}</div>
          <div className="mt-[1px] text-[10px] text-[var(--text-muted)]">{pc.sentRecipient || '-'}</div>
        </div>
      ) : (
        <span className="select-none text-[12px] italic text-[var(--text-dim)]">—</span>
      )}
    </td>
  )
}
