import { ManifestBulkBar } from '@/components/parc-pc/manifest/ManifestBulkBar'
import { ManifestHeader } from '@/components/parc-pc/manifest/ManifestHeader'
import { ManifestTableFooter } from '@/components/parc-pc/manifest/ManifestTableFooter'
import { ManifestTableHead } from '@/components/parc-pc/manifest/ManifestTableHead'
import { ManifestTableRow } from '@/components/parc-pc/manifest/ManifestTableRow'
import { useManifestPagination } from '@/hooks/useManifestPagination'
import { useManifestSelection } from '@/hooks/useManifestSelection'
import { useManifestSort } from '@/hooks/useManifestSort'
import type { PCRecord } from '@/types/pc.types'

interface ManifestTableProps {
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

export function ManifestTable({
  pcs,
  canWrite,
  onView,
  onEdit,
  onStatus,
  onDelete,
  onExportRows,
  onBulkSend,
  onBulkDelete,
}: ManifestTableProps) {
  const { sorted, sortField, sortDir, toggleSort } = useManifestSort(pcs)
  const {
    currentPage,
    pageSize,
    total,
    paginated,
    startIndex,
    endIndex,
    pages,
    setPage,
    setPageSize,
  } = useManifestPagination(sorted)

  const {
    selectedIds,
    toggleOne,
    toggleAll,
    clearSelection,
    isAllSelected,
    isPartialSelected,
  } = useManifestSelection(sorted)

  const selectedRows = sorted.filter((pc) => selectedIds.has(pc.id))

  const handleBulkSend = async () => {
    await onBulkSend(selectedRows)
    clearSelection()
  }

  const handleBulkDelete = async () => {
    await onBulkDelete(selectedRows)
    clearSelection()
  }

  return (
    <div>
      <ManifestHeader totalRows={paginated.length} onExportCsv={() => onExportRows(paginated)} />

      <ManifestBulkBar
        selectedCount={selectedRows.length}
        onBulkStatus={handleBulkSend}
        onExportSelection={() => onExportRows(selectedRows)}
        onBulkDelete={handleBulkDelete}
        clearSelection={clearSelection}
        canWrite={canWrite}
      />

      <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
        <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
          <ManifestTableHead
            sortField={sortField}
            sortDir={sortDir}
            onSort={toggleSort}
            isAllSelected={isAllSelected}
            isPartialSelected={isPartialSelected}
            onToggleAll={toggleAll}
          />
          <tbody>
            {paginated.map((pc) => (
              <ManifestTableRow
                key={pc.id}
                pc={pc}
                checked={selectedIds.has(pc.id)}
                canWrite={canWrite}
                onToggleSelected={toggleOne}
                onView={onView}
                onEdit={onEdit}
                onStatus={onStatus}
                onDelete={onDelete}
              />
            ))}

            {paginated.length === 0 && (
              <tr className="border-b border-[rgba(34,197,94,0.04)]">
                <td colSpan={9} className="px-4 py-16 text-center">
                  <div className="mx-auto max-w-md space-y-3">
                    <p className="text-lg font-medium text-[var(--text-primary)]">Aucun poste dans cette perspective</p>
                    <p className="text-sm leading-6 text-[var(--text-muted)]">Essaie un autre site, un autre statut ou reinitialise la vue pour retrouver les machines du parc.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <ManifestTableFooter
          startIndex={startIndex}
          endIndex={endIndex}
          total={total}
          currentPage={currentPage}
          pageSize={pageSize}
          pages={pages}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>
    </div>
  )
}
