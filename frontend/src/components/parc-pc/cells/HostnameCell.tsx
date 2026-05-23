import type { PCRecord } from '@/types/pc.types'

interface HostnameCellProps {
  pc: PCRecord
}

export function HostnameCell({ pc }: HostnameCellProps) {
  return (
    <td className="px-4 py-[11px]">
      <div className="font-mono text-[12.5px] font-bold tracking-[0.02em] text-[var(--text-primary)]">
        {pc.hostname}
      </div>
      <div className="mt-0.5 text-[10px] uppercase tracking-[0.1em] text-[var(--text-dim)]">
        Machine
      </div>
    </td>
  )
}
