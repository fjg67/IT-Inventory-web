import { ManifestTable } from '@/components/parc-pc/manifest/ManifestTable'
import type { PCRecord } from '@/types/pc.types'

interface PCDataTableProps {
  pcs: PCRecord[]
  canWrite: boolean
  onView: (pc: PCRecord) => void
  onEdit: (pc: PCRecord) => void
  onStatus: (pc: PCRecord) => void
  onDelete: (pc: PCRecord) => void
  onExportRows: (rows: PCRecord[]) => void
  onBulkSend: (rows: PCRecord[]) => Promise<void>
  onBulkDelete: (rows: PCRecord[]) => Promise<void>
}

export function PCDataTable({
  pcs,
  canWrite,
  onView,
  onEdit,
  onStatus,
  onDelete,
  onExportRows,
  onBulkSend,
  onBulkDelete,
}: PCDataTableProps) {
  return (
    <ManifestTable
      pcs={pcs}
      canWrite={canWrite}
      onView={onView}
      onEdit={onEdit}
      onStatus={onStatus}
      onDelete={onDelete}
      onExportRows={onExportRows}
      onBulkSend={onBulkSend}
      onBulkDelete={onBulkDelete}
    />
  )
}
