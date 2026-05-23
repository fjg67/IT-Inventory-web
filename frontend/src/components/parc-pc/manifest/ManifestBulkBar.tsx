import { Button } from '@/components/ui/button'

interface ManifestBulkBarProps {
  selectedCount: number
  onBulkStatus: () => void
  onExportSelection: () => void
  onBulkDelete: () => void
  clearSelection: () => void
  canWrite: boolean
}

export function ManifestBulkBar({
  selectedCount,
  onBulkStatus,
  onExportSelection,
  onBulkDelete,
  clearSelection,
  canWrite,
}: ManifestBulkBarProps) {
  if (selectedCount === 0) {
    return null
  }

  return (
    <div className="mb-2 flex items-center justify-between rounded-xl border border-[var(--green-border)] bg-[var(--green-subtle)] px-4 py-3">
      <span className="text-sm font-semibold text-brand-light">
        {selectedCount} machine{selectedCount > 1 ? 's' : ''} selectionnee{selectedCount > 1 ? 's' : ''}
      </span>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="secondary" onClick={onBulkStatus} disabled={!canWrite}>Changer le statut</Button>
        <Button size="sm" variant="secondary" onClick={onExportSelection}>Exporter la selection</Button>
        <Button size="sm" variant="danger" onClick={onBulkDelete} disabled={!canWrite}>Retirer du parc</Button>
        <button type="button" onClick={clearSelection} className="ml-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]">
          Deselectionner
        </button>
      </div>
    </div>
  )
}
