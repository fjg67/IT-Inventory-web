interface FilterChipProps {
  label: string
  count?: number
  active?: boolean
  color?: string
  onClick: () => void
}

export function FilterChip({ label, count, active, color = 'var(--green-primary)', onClick }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${
        active
          ? ''
          : 'border-[var(--border-subtle)] bg-bg-elevated text-[var(--text-muted)] hover:border-[var(--border-card)] hover:text-[var(--text-primary)]'
      }`}
      style={
        active
          ? {
              background: `${color}18`,
              color,
              border: `1px solid ${color}40`,
            }
          : undefined
      }
    >
      <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full" style={{ background: active ? color : 'var(--text-dim)' }} />
      {label}
      {count !== undefined && <span className="ml-1.5 opacity-70">{count}</span>}
    </button>
  )
}
