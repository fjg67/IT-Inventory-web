import type { ElementType } from 'react'
import { Flame, Hammer, Laptop, PackageCheck, Send } from 'lucide-react'
import { STATUS_STYLES } from '@/constants/pcStatuses'
import type { PCStatus } from '@/types/pc.types'

const STATUS_ICONS: Record<PCStatus, ElementType> = {
  a_chaud: Flame,
  a_reusiner: Hammer,
  en_usinage: Laptop,
  disponible: PackageCheck,
  envoye: Send,
}

interface PCStatCardProps {
  status: PCStatus
  count: number
  total: number
  siteName: string
  active: boolean
  onClick: (status: PCStatus) => void
}

export function PCStatCard({ status, count, total, siteName, active, onClick }: PCStatCardProps) {
  const style = STATUS_STYLES[status]
  const Icon = STATUS_ICONS[status]
  const ratio = total > 0 ? Math.round((count / total) * 100) : 0

  return (
    <button
      type="button"
      onClick={() => onClick(status)}
      className={`relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] border-t-2 bg-[var(--bg-card)] p-5 text-left transition-all duration-150 hover:-translate-y-[1px] hover:bg-[var(--bg-elevated)] ${active ? 'ring-1 ring-white/10 bg-[var(--bg-elevated)]' : ''}`}
      style={{ borderTopColor: style.color }}
    >
      <div
        className="pointer-events-none absolute right-0 top-0 h-20 w-20 translate-x-[25%] -translate-y-[25%] rounded-full opacity-40"
        style={{ background: `radial-gradient(circle, ${style.color}18 0%, transparent 70%)` }}
      />

      <div className="relative mb-3 flex items-start justify-between">
        <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">{style.label}</span>
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[9px]" style={{ background: style.subtleBg, border: `1px solid ${style.borderColor}`, color: style.color }}>
          <Icon className="h-[15px] w-[15px]" />
        </div>
      </div>

      <div className="relative mb-1.5 text-[32px] font-extrabold leading-none tabular-nums" style={{ color: style.isPriority ? style.color : 'var(--text-primary)' }}>
        {count}
      </div>

      <div className="relative mb-4 text-[11px] text-[var(--text-dim)]">{total} postes sur {siteName}</div>

      <div className="relative">
        <div className="mb-[5px] flex items-center justify-between">
          <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[var(--text-dim)]">Occupation</span>
          <span className="text-[10px] font-bold" style={{ color: style.color }}>{ratio}%</span>
        </div>
        <div className="h-[3px] overflow-hidden rounded-full bg-white/5">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${ratio}%`, background: style.color }} />
        </div>
      </div>
    </button>
  )
}
