import { useMemo, useState } from 'react'
import type { PCRecord } from '@/types/pc.types'

export type ManifestSortField = 'hostname' | 'asset' | 'model' | 'category' | 'site' | 'status' | 'sentTo' | 'updatedAt'

export function useManifestSort(pcs: PCRecord[]) {
  const [sortField, setSortField] = useState<ManifestSortField>('hostname')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const toggleSort = (field: ManifestSortField) => {
    if (field === sortField) {
      setSortDir((current) => (current === 'asc' ? 'desc' : 'asc'))
      return
    }

    setSortField(field)
    setSortDir('asc')
  }

  const sorted = useMemo(() => {
    return [...pcs].sort((a, b) => {
      const av = String(a[sortField] ?? '').toLowerCase()
      const bv = String(b[sortField] ?? '').toLowerCase()
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    })
  }, [pcs, sortDir, sortField])

  return { sorted, sortField, sortDir, toggleSort }
}
