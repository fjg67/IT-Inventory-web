interface ManifestTableFooterProps {
  startIndex: number
  endIndex: number
  total: number
  currentPage: number
  pageSize: number
  pages: number[]
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export function ManifestTableFooter({
  startIndex,
  endIndex,
  total,
  currentPage,
  pageSize,
  pages,
  onPageChange,
  onPageSizeChange,
}: ManifestTableFooterProps) {
  return (
    <div className="flex items-center justify-between border-t border-[var(--border-subtle)] px-4 py-3">
      <span className="text-[11px] text-[var(--text-muted)]">
        Affichage {startIndex}-{endIndex} sur {total} resultat{total > 1 ? 's' : ''}
      </span>

      <div className="flex items-center gap-1.5">
        <select
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          className="mr-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2 py-1 text-[11px] text-[var(--text-muted)] outline-none focus:border-[var(--border-card)]"
        >
          <option value={10}>10 / page</option>
          <option value={25}>25 / page</option>
          <option value={50}>50 / page</option>
        </select>

        {pages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`h-[26px] w-[26px] cursor-pointer rounded-[6px] border text-[11px] transition-colors ${page === currentPage
              ? 'border-[var(--green-border)] bg-[var(--green-subtle)] text-brand-light'
              : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:border-[var(--border-card)] hover:text-[var(--text-primary)]'
              }`}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  )
}
