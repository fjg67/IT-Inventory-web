import { useEffect, useRef } from 'react'
import type { ManifestSortField } from '@/hooks/useManifestSort'
import { cn } from '@/lib/utils'

interface ManifestTableHeadProps {
  sortField: ManifestSortField
  sortDir: 'asc' | 'desc'
  onSort: (field: ManifestSortField) => void
  isAllSelected: boolean
  isPartialSelected: boolean
  onToggleAll: () => void
}

interface SortIndicatorProps {
  active: boolean
  dir: 'asc' | 'desc'
}

function SortIndicator({ active, dir }: SortIndicatorProps) {
  return (
    <span className={cn('inline-flex flex-col gap-px', active ? 'opacity-100' : 'opacity-30')}>
      <span
        className={cn(
          'h-0 w-0 border-l-[3px] border-r-[3px] border-b-[4px] border-l-transparent border-r-transparent',
          active && dir === 'asc' ? 'border-b-brand-light' : 'border-b-current'
        )}
      />
      <span
        className={cn(
          'h-0 w-0 border-l-[3px] border-r-[3px] border-t-[4px] border-l-transparent border-r-transparent',
          active && dir === 'desc' ? 'border-t-brand-light' : 'border-t-current'
        )}
      />
    </span>
  )
}

interface SortableHeadCellProps {
  label: string
  field: ManifestSortField
  width: string
  sortField: ManifestSortField
  sortDir: 'asc' | 'desc'
  onSort: (field: ManifestSortField) => void
}

function SortableHeadCell({ label, field, width, sortField, sortDir, onSort }: SortableHeadCellProps) {
  const active = sortField === field

  return (
    <th
      style={{ width }}
      onClick={() => onSort(field)}
      className={cn(
        'cursor-pointer select-none whitespace-nowrap border-b border-[var(--border-subtle)] bg-black/20 px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]',
        active && 'text-brand-light'
      )}
    >
      <span className="flex items-center gap-1.5">
        {label}
        <SortIndicator active={active} dir={sortDir} />
      </span>
    </th>
  )
}

export function ManifestTableHead({ sortField, sortDir, onSort, isAllSelected, isPartialSelected, onToggleAll }: ManifestTableHeadProps) {
  const checkboxRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = isPartialSelected
    }
  }, [isPartialSelected])

  return (
    <thead>
      <tr>
        <th style={{ width: '4%' }} className="border-b border-[var(--border-subtle)] bg-black/20 px-4 py-3">
          <input
            ref={checkboxRef}
            type="checkbox"
            checked={isAllSelected}
            onChange={onToggleAll}
            aria-label="Selectionner toutes les lignes"
            className="h-4 w-4 rounded border-white/20 bg-white/5"
          />
        </th>

        <SortableHeadCell label="Hostname" field="hostname" width="16%" sortField={sortField} sortDir={sortDir} onSort={onSort} />
        <SortableHeadCell label="Asset" field="asset" width="14%" sortField={sortField} sortDir={sortDir} onSort={onSort} />
        <SortableHeadCell label="Modele" field="model" width="22%" sortField={sortField} sortDir={sortDir} onSort={onSort} />
        <SortableHeadCell label="Categorie" field="category" width="14%" sortField={sortField} sortDir={sortDir} onSort={onSort} />
        <SortableHeadCell label="Site" field="site" width="11%" sortField={sortField} sortDir={sortDir} onSort={onSort} />
        <SortableHeadCell label="Statut" field="status" width="13%" sortField={sortField} sortDir={sortDir} onSort={onSort} />
        <SortableHeadCell label="Envoye vers" field="sentTo" width="12%" sortField={sortField} sortDir={sortDir} onSort={onSort} />

        <th style={{ width: '4%' }} className="border-b border-[var(--border-subtle)] bg-black/20 px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
          ...
        </th>
      </tr>
    </thead>
  )
}
