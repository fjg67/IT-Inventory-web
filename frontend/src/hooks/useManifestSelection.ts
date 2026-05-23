import { useMemo, useState } from 'react'

type WithId = { id: string }

export function useManifestSelection<T extends WithId>(pcs: T[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const toggleOne = (id: string) => {
    setSelectedIds((previous) => {
      const next = new Set(previous)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleAll = () => {
    if (selectedIds.size === pcs.length && pcs.length > 0) {
      setSelectedIds(new Set())
      return
    }

    setSelectedIds(new Set(pcs.map((pc) => pc.id)))
  }

  const clearSelection = () => setSelectedIds(new Set())

  const isAllSelected = selectedIds.size === pcs.length && pcs.length > 0
  const isPartialSelected = selectedIds.size > 0 && selectedIds.size < pcs.length

  const selectedIdsArray = useMemo(() => Array.from(selectedIds), [selectedIds])

  return {
    selectedIds,
    selectedIdsArray,
    toggleOne,
    toggleAll,
    clearSelection,
    isAllSelected,
    isPartialSelected,
  }
}
