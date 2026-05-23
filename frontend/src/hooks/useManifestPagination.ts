import { useEffect, useMemo, useState } from 'react'

export function useManifestPagination<T>(rows: T[], initialPageSize = 10) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)

  const total = rows.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages))
  }, [totalPages])

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const setPageSizeAndReset = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return rows.slice(start, start + pageSize)
  }, [currentPage, pageSize, rows])

  const startIndex = total === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endIndex = total === 0 ? 0 : Math.min(currentPage * pageSize, total)
  const pages = useMemo(() => Array.from({ length: totalPages }, (_, index) => index + 1), [totalPages])

  return {
    currentPage,
    pageSize,
    total,
    totalPages,
    paginated,
    startIndex,
    endIndex,
    pages,
    setPage: goToPage,
    setPageSize: setPageSizeAndReset,
  }
}
