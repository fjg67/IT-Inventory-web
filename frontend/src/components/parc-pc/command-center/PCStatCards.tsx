import { PC_STATUSES } from '@/types/pc.types'
import type { PCStatus } from '@/types/pc.types'
import { PCStatCard } from './PCStatCard'

interface PCStatCardsProps {
  total: number
  byStatus: Record<string, number>
  siteName: string
  activeStatus: PCStatus | 'all'
  onStatusFilter: (status: PCStatus | 'all') => void
}

export function PCStatCards({ total, byStatus, siteName, activeStatus, onStatusFilter }: PCStatCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {PC_STATUSES.map((status) => (
        <PCStatCard
          key={status}
          status={status}
          count={byStatus[status] ?? 0}
          total={total}
          siteName={siteName}
          active={activeStatus === status}
          onClick={(nextStatus) => onStatusFilter(activeStatus === nextStatus ? 'all' : nextStatus)}
        />
      ))}
    </div>
  )
}
