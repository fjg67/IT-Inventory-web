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

interface PCPulseWidgetProps {
  status: PCStatus
  occupancyPercent: number
}

export function PCPulseWidget({ status, occupancyPercent }: PCPulseWidgetProps) {
  const style = STATUS_STYLES[status]
  const Icon = STATUS_ICONS[status]

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)]">
      <div className="relative flex h-[72px] items-center justify-center overflow-hidden" style={{ background: style.subtleBg }}>
        <div className="flex h-[36px] w-[52px] items-center justify-center rounded-[7px]" style={{ border: `1.5px solid ${style.color}60`, color: style.color }}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="absolute bottom-2 left-4 right-4 h-1 overflow-hidden rounded-full bg-white/5">
          <div className="h-full rounded-full" style={{ width: `${occupancyPercent}%`, background: style.color }} />
        </div>
      </div>

      <div className="px-3.5 py-2.5">
        <div className="mb-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">Pulse statut</div>
        <div className="text-[13px] font-medium text-[var(--text-primary)]">{style.label} domine la vue active.</div>
      </div>
    </div>
  )
}
