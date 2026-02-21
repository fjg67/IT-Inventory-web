// Page Journal d'audit — consultation en lecture seule des logs d'actions (admin uniquement)

import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'
import {
  ScrollText,
  Filter,
  Download,
  Clock,
  User,
  Activity,
  Loader2,
} from 'lucide-react'

import type { AuditLog, AuditFilters, User as UserType } from '@/types'
import { auditService } from '@/services/audit.service'
import { usersService } from '@/services/users.service'
import { exportService } from '@/services/export.service'
import { useAuth } from '@/hooks/useAuth'

import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { DataTablePagination } from '@/components/shared/DataTablePagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// --- Constantes ---

const PAGE_SIZE = 25

/** Types d'actions pour le filtre */
const ACTION_TYPES = [
  { value: 'CREATE', label: 'Création' },
  { value: 'UPDATE', label: 'Modification' },
  { value: 'DELETE', label: 'Suppression' },
  { value: 'LOGIN', label: 'Connexion' },
  { value: 'LOGOUT', label: 'Déconnexion' },
  { value: 'MOVEMENT', label: 'Mouvement' },
]

/** Couleur des badges d'action */
function getActionBadgeVariant(action: string): 'success' | 'warning' | 'danger' | 'info' | 'default' {
  switch (action) {
    case 'CREATE':
      return 'success'
    case 'UPDATE':
      return 'warning'
    case 'DELETE':
      return 'danger'
    case 'LOGIN':
    case 'LOGOUT':
      return 'info'
    default:
      return 'default'
  }
}

/** Traduction des actions */
function getActionLabel(action: string): string {
  const found = ACTION_TYPES.find((a) => a.value === action)
  return found?.label ?? action
}

// --- Squelette de chargement ---

function TableSkeleton() {
  return (
    <div className="p-4 space-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  )
}

// --- Composant de valeur JSON formatée ---

function JsonPreview({ value, label }: { value: Record<string, unknown> | null; label: string }) {
  const [expanded, setExpanded] = useState(false)

  if (!value || Object.keys(value).length === 0) {
    return <span className="text-text-muted text-xs">—</span>
  }

  const preview = JSON.stringify(value, null, 0).slice(0, 60)
  const isTruncated = JSON.stringify(value).length > 60

  return (
    <>
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="text-left max-w-[200px] truncate font-mono text-xs text-text-secondary hover:text-primary transition-colors"
        title="Cliquer pour voir le détail"
      >
        {preview}
        {isTruncated && '…'}
      </button>

      {/* Modal de détail JSON */}
      <Dialog open={expanded} onOpenChange={setExpanded}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
          </DialogHeader>
          <pre className="bg-surface rounded-lg p-4 text-xs font-mono text-text-secondary overflow-auto max-h-96 whitespace-pre-wrap break-all">
            {JSON.stringify(value, null, 2)}
          </pre>
        </DialogContent>
      </Dialog>
    </>
  )
}

// --- Composant principal ---

export default function AuditLogPage() {
  const { isAdmin } = useAuth()

  // Filtres et pagination
  const [filters, setFilters] = useState<AuditFilters>({
    page: 1,
    limit: PAGE_SIZE,
  })
  const [exporting, setExporting] = useState(false)

  // Récupération des logs
  const { data, isLoading, isError } = useQuery({
    queryKey: ['audit', filters],
    queryFn: () => auditService.getLogs(filters),
    placeholderData: (prev) => prev,
  })

  // Récupération des utilisateurs pour le filtre
  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersService.getAll(),
  })

  const logs = data?.logs ?? []
  const totalPages = data?.totalPages ?? 1
  const total = data?.total ?? 0
  const users = usersData?.users ?? []

  // Handlers de filtres
  const handleFilterUser = useCallback((value: string) => {
    setFilters((prev) => ({
      ...prev,
      userId: value === '_all' ? undefined : value,
      page: 1,
    }))
  }, [])

  const handleFilterAction = useCallback((value: string) => {
    setFilters((prev) => ({
      ...prev,
      action: value === '_all' ? undefined : value,
      page: 1,
    }))
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }, [])

  // Export CSV (utilise l'export mouvements comme base)
  const handleExport = useCallback(async () => {
    setExporting(true)
    try {
      await exportService.exportMovements(filters)
      toast.success('Export téléchargé avec succès')
    } catch {
      toast.error("Erreur lors de l'export")
    } finally {
      setExporting(false)
    }
  }, [filters])

  // Formatage de la date
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy HH:mm:ss', { locale: fr })
    } catch {
      return dateStr
    }
  }

  // Protection admin
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-2">
          <ScrollText className="h-12 w-12 text-text-muted mx-auto" />
          <h2 className="text-lg font-semibold text-text-primary">Accès restreint</h2>
          <p className="text-sm text-text-secondary">
            Seuls les administrateurs peuvent accéder au journal d'audit.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <PageHeader
        title="Journal d'audit"
        description="Historique complet de toutes les actions effectuées"
        action={
          <Button variant="outline" onClick={handleExport} disabled={exporting}>
            {exporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Exporter CSV
          </Button>
        }
      />

      {/* Barre de filtres */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="glass-card p-4"
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-text-muted" />
            <span className="text-sm text-text-secondary">Filtres :</span>
          </div>

          {/* Filtre par technicien */}
          <Select value={filters.userId ?? '_all'} onValueChange={handleFilterUser}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Technicien" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">Tous les techniciens</SelectItem>
              {users.map((u: UserType) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filtre par type d'action */}
          <Select value={filters.action ?? '_all'} onValueChange={handleFilterAction}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">Toutes les actions</SelectItem>
              {ACTION_TYPES.map((action) => (
                <SelectItem key={action.value} value={action.value}>
                  {action.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date de début */}
          <div className="flex items-center gap-2">
            <Label className="text-xs text-text-muted whitespace-nowrap">Du</Label>
            <Input
              type="date"
              value={filters.from ?? ''}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  from: e.target.value || undefined,
                  page: 1,
                }))
              }
              className="w-40"
            />
          </div>

          {/* Date de fin */}
          <div className="flex items-center gap-2">
            <Label className="text-xs text-text-muted whitespace-nowrap">Au</Label>
            <Input
              type="date"
              value={filters.to ?? ''}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  to: e.target.value || undefined,
                  page: 1,
                }))
              }
              className="w-40"
            />
          </div>
        </div>
      </motion.div>

      {/* Tableau des logs */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="glass-card overflow-hidden"
      >
        {isLoading ? (
          <TableSkeleton />
        ) : isError ? (
          <div className="p-8 text-center">
            <p className="text-danger">Erreur lors du chargement des logs.</p>
          </div>
        ) : logs.length === 0 ? (
          <EmptyState
            icon={ScrollText}
            title="Aucun log trouvé"
            description={
              filters.userId || filters.action || filters.from || filters.to
                ? 'Essayez de modifier vos filtres.'
                : "Aucune action n'a été enregistrée pour le moment."
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[170px]">Date / Heure</TableHead>
                    <TableHead className="w-[140px]">Technicien</TableHead>
                    <TableHead className="w-[120px]">Action</TableHead>
                    <TableHead className="w-[120px]">Type entité</TableHead>
                    <TableHead>Anciennes valeurs</TableHead>
                    <TableHead>Nouvelles valeurs</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log, index) => (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                      className="border-b border-border transition-colors hover:bg-white/[0.03]"
                    >
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                          <Clock className="h-3 w-3 text-text-muted shrink-0" />
                          <span className="font-mono">{formatDate(log.createdAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm">
                          <User className="h-3 w-3 text-text-muted shrink-0" />
                          <span className="text-text-primary truncate">
                            {log.user?.name ?? '—'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getActionBadgeVariant(log.action)}>
                          {getActionLabel(log.action)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-text-secondary font-mono">
                          {log.entityType}
                        </span>
                      </TableCell>
                      <TableCell>
                        <JsonPreview value={log.oldValue} label="Anciennes valeurs" />
                      </TableCell>
                      <TableCell>
                        <JsonPreview value={log.newValue} label="Nouvelles valeurs" />
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <DataTablePagination
              page={filters.page ?? 1}
              totalPages={totalPages}
              total={total}
              onPageChange={handlePageChange}
              pageSize={PAGE_SIZE}
            />
          </>
        )}
      </motion.div>
    </div>
  )
}
