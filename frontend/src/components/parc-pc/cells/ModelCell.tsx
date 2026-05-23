import { Laptop } from 'lucide-react'
import { PC_CATEGORY_LABELS } from '@/types/pc.types'
import type { PCRecord } from '@/types/pc.types'

interface ModelCellProps {
  pc: PCRecord
}

function getModelParts(pc: PCRecord) {
  const normalized = pc.model.trim()
  if (!normalized) {
    return {
      modelBrand: 'N/A',
      modelLine: `${PC_CATEGORY_LABELS[pc.category]} - PC portable`,
    }
  }

  const [first, ...rest] = normalized.split(/\s+/)
  return {
    modelBrand: first.toUpperCase(),
    modelLine: rest.length > 0 ? rest.join(' ') : `${PC_CATEGORY_LABELS[pc.category]} - PC portable`,
  }
}

export function ModelCell({ pc }: ModelCellProps) {
  const { modelBrand, modelLine } = getModelParts(pc)

  return (
    <td className="px-4 py-[11px]">
      <div className="flex items-center gap-2">
        <div className="flex h-[28px] w-[28px] flex-shrink-0 items-center justify-center rounded-[7px] border border-[rgba(34,197,94,0.18)] bg-[rgba(34,197,94,0.10)]">
          <Laptop className="h-[14px] w-[14px] text-brand-light" />
        </div>
        <div>
          <div className="text-[12px] font-semibold leading-tight text-[var(--text-primary)]">
            {modelBrand}
          </div>
          <div className="mt-[1px] text-[10px] text-[var(--text-muted)]">
            {modelLine}
          </div>
        </div>
      </div>
    </td>
  )
}
