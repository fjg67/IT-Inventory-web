// DataTablePagination — contrôles de pagination pour les tableaux
// Affiche le nombre de résultats, les boutons précédent/suivant et les numéros de page

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface DataTablePaginationProps {
  page: number
  totalPages: number
  total: number
  onPageChange: (page: number) => void
  pageSize?: number
}

export function DataTablePagination({
  page,
  totalPages,
  total,
  onPageChange,
  pageSize = 10,
}: DataTablePaginationProps) {
  // Calculer la plage d'éléments affichés
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1
  const endItem = Math.min(page * pageSize, total)

  // Générer les numéros de page à afficher
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = []
    const maxVisible = 5 // Nombre maximum de pages visibles

    if (totalPages <= maxVisible) {
      // Afficher toutes les pages si peu nombreuses
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Toujours afficher la première page
      pages.push(1)

      if (page > 3) {
        pages.push('ellipsis')
      }

      // Pages autour de la page courante
      const start = Math.max(2, page - 1)
      const end = Math.min(totalPages - 1, page + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (page < totalPages - 2) {
        pages.push('ellipsis')
      }

      // Toujours afficher la dernière page
      pages.push(totalPages)
    }

    return pages
  }

  if (totalPages <= 1 && total <= pageSize) {
    // Pas de pagination nécessaire, afficher juste le total
    return total > 0 ? (
      <div className="flex items-center justify-center py-3">
        <span className="text-sm text-text-secondary">
          {total} résultat{total > 1 ? 's' : ''}
        </span>
      </div>
    ) : null
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className="flex items-center justify-between gap-4 px-2 py-4">
      {/* Information sur les résultats affichés */}
      <p className="text-sm text-text-secondary">
        Affichage{' '}
        <span className="font-medium text-text-primary">
          {startItem}-{endItem}
        </span>{' '}
        sur{' '}
        <span className="font-medium text-text-primary">{total}</span>
      </p>

      {/* Contrôles de pagination */}
      <div className="flex items-center gap-1">
        {/* Première page */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(1)}
          disabled={page <= 1}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Page précédente */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Numéros de page */}
        {pageNumbers.map((pageNum, index) =>
          pageNum === 'ellipsis' ? (
            <span
              key={`ellipsis-${index}`}
              className="flex h-8 w-8 items-center justify-center text-sm text-text-muted"
            >
              …
            </span>
          ) : (
            <Button
              key={pageNum}
              variant="ghost"
              size="icon"
              className={cn(
                'h-8 w-8 text-sm',
                pageNum === page
                  ? 'bg-primary/15 text-primary hover:bg-primary/20'
                  : 'text-text-secondary hover:text-text-primary'
              )}
              onClick={() => onPageChange(pageNum)}
            >
              {pageNum}
            </Button>
          )
        )}

        {/* Page suivante */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Dernière page */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(totalPages)}
          disabled={page >= totalPages}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
