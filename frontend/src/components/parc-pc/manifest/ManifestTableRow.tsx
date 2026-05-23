import { useState } from 'react'
import { ActionsCell } from '@/components/parc-pc/cells/ActionsCell'
import { AssetCell } from '@/components/parc-pc/cells/AssetCell'
import { CategoryCell } from '@/components/parc-pc/cells/CategoryCell'
import { HostnameCell } from '@/components/parc-pc/cells/HostnameCell'
import { ModelCell } from '@/components/parc-pc/cells/ModelCell'
import { SentToCell } from '@/components/parc-pc/cells/SentToCell'
import { SiteCell } from '@/components/parc-pc/cells/SiteCell'
import { StatusCell } from '@/components/parc-pc/cells/StatusCell'
import type { PCRecord } from '@/types/pc.types'

interface ManifestTableRowProps {
  pc: PCRecord
  checked: boolean
  canWrite: boolean
  onToggleSelected: (id: string) => void
  onView: (pc: PCRecord) => void
  onEdit: (pc: PCRecord) => void
  onStatus: (pc: PCRecord) => void
  onDelete: (pc: PCRecord) => void
}

export function ManifestTableRow({
  pc,
  checked,
  canWrite,
  onToggleSelected,
  onView,
  onEdit,
  onStatus,
  onDelete,
}: ManifestTableRowProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onView(pc)}
      className="cursor-pointer border-b border-[rgba(34,197,94,0.04)] transition-colors hover:bg-[var(--bg-hover)]"
      data-state={checked ? 'selected' : undefined}
    >
      <td className="px-4 py-[11px]" onClick={(event) => event.stopPropagation()}>
        <input
          type="checkbox"
          checked={checked}
          onChange={() => onToggleSelected(pc.id)}
          aria-label={`Selectionner ${pc.hostname}`}
          className="h-4 w-4 rounded border-white/20 bg-white/5"
        />
      </td>

      <HostnameCell pc={pc} />
      <AssetCell pc={pc} />
      <ModelCell pc={pc} />
      <CategoryCell pc={pc} />
      <SiteCell pc={pc} />
      <StatusCell pc={pc} />
      <SentToCell pc={pc} />
      <ActionsCell pc={pc} hovered={hovered} canWrite={canWrite} onView={onView} onEdit={onEdit} onStatus={onStatus} onDelete={onDelete} />
    </tr>
  )
}
