import { useEffect, useMemo, useState } from 'react'
import type { PCCategory, PCRecord, PCStatus } from '@/types/pc.types'

export function usePCFilters(pcs: PCRecord[], initialSite = 'all') {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<PCStatus | 'all'>('all')
  const [site, setSite] = useState(initialSite)
  const [category, setCategory] = useState<PCCategory | 'all'>('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  useEffect(() => {
    setSite((current) => current === 'all' ? initialSite : current)
  }, [initialSite])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()

    return pcs.filter((pc) => {
      const matchesSearch = !term || [pc.hostname, pc.asset, pc.model, pc.site, pc.sentTo, pc.sentRecipient]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))

      const matchesStatus = status === 'all' || pc.status === status
      const matchesSite = site === 'all' || pc.site === site
      const matchesCategory = category === 'all' || pc.category === category

      return matchesSearch && matchesStatus && matchesSite && matchesCategory
    })
  }, [category, pcs, search, site, status])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const paginated = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, pageSize, safePage])

  const toggleSelected = (id: string) => {
    setSelectedIds((current) => current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id])
  }

  const toggleAllVisible = () => {
    const visibleIds = paginated.map((pc) => pc.id)
    const allSelected = visibleIds.every((id) => selectedIds.includes(id))

    setSelectedIds((current) => {
      if (allSelected) {
        return current.filter((id) => !visibleIds.includes(id))
      }

      return Array.from(new Set([...current, ...visibleIds]))
    })
  }

  const clearSelection = () => setSelectedIds([])

  return {
    search,
    setSearch,
    status,
    setStatus,
    site,
    setSite,
    category,
    setCategory,
    page: safePage,
    setPage,
    pageSize,
    setPageSize,
    selectedIds,
    setSelectedIds,
    clearSelection,
    toggleSelected,
    toggleAllVisible,
    filtered,
    paginated,
    totalPages,
  }
}