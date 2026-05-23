import { ScanBarcode } from 'lucide-react'
import type { PCRecord } from '@/types/pc.types'

interface AssetCellProps {
  pc: PCRecord
}

export function AssetCell({ pc }: AssetCellProps) {
  return (
    <td className="px-4 py-[11px]">
      <span className="inline-flex items-center gap-[5px] rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2 py-[3px] font-mono text-[11px] font-semibold tracking-[0.02em] text-[var(--text-muted)]">
        <ScanBarcode className="h-3 w-3 text-brand-light/60" />
        {pc.asset}
      </span>
    </td>
  )
}
