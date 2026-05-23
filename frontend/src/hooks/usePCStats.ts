import { useMemo } from 'react'
import { PC_STATUSES } from '@/types/pc.types'
import type { PCRecord } from '@/types/pc.types'

export function usePCStats(pcs: PCRecord[]) {
  return useMemo(() => {
    const byStatus = PC_STATUSES.reduce<Record<string, number>>((acc, status) => {
      acc[status] = pcs.filter((pc) => pc.status === status).length
      return acc
    }, {})

    return {
      total: pcs.length,
      byStatus,
    }
  }, [pcs])
}