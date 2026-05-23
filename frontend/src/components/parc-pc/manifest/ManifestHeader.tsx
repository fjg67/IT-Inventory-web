import { Download } from 'lucide-react'

interface ManifestHeaderProps {
  totalRows: number
  onExportCsv: () => void
}

export function ManifestHeader({ totalRows, onExportCsv }: ManifestHeaderProps) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div>
        <div className="mb-1.5 flex items-center gap-2">
          <div className="h-[2px] w-4 rounded-full bg-brand-light" />
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-light">
            Manifest
          </span>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-[var(--text-muted)]">
          Visualisation detaillee des machines visibles dans le filtre courant.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] px-3 py-1.5">
          <span className="text-xl font-bold tabular-nums text-brand-light">{totalRows}</span>
          <span className="text-xs text-[var(--text-muted)]">ligne(s) dans cette page</span>
        </div>
        <button
          type="button"
          onClick={onExportCsv}
          className="flex items-center gap-1.5 rounded-xl border border-[var(--border-card)] bg-[var(--bg-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)]"
        >
          <Download className="h-3.5 w-3.5" />
          Exporter CSV
        </button>
      </div>
    </div>
  )
}
