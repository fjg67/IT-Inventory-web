import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useParcPC } from '@/hooks/useParcPC'
import { usePCFilters } from '@/hooks/usePCFilters'
import { usePCStats } from '@/hooks/usePCStats'
import { useSiteStore } from '@/stores/siteStore'
import { PCCommandBar } from '@/components/parc-pc/command-center/PCCommandBar'
import { PCCommandHero } from '@/components/parc-pc/command-center/PCCommandHero'
import { PCStatCards } from '@/components/parc-pc/command-center/PCStatCards'
import { STATUS_STYLES } from '@/constants/pcStatuses'
import { PCDataTable } from '@/components/parc-pc/PCDataTable'
import { PCDetailsDrawer } from '@/components/parc-pc/PCDetailsDrawer'
import { PCFormModal } from '@/components/parc-pc/PCFormModal'
import { PCStatusModal } from '@/components/parc-pc/PCStatusModal'
import { PC_STATUSES } from '@/types/pc.types'
import type { PCFormData, PCRecord, PCStatusFormData } from '@/types/pc.types'

function ParcPCSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-[28px] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,rgba(17,26,20,0.92),rgba(10,15,13,0.98))] p-5">
            <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
            <div className="mt-4 h-9 w-16 animate-pulse rounded bg-white/10" />
            <div className="mt-5 h-2 w-full animate-pulse rounded-full bg-white/10" />
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-[30px] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,rgba(17,26,20,0.92),rgba(10,15,13,0.98))] p-6">
        <div className="h-4 w-44 animate-pulse rounded bg-white/10" />
        <div className="mt-5 space-y-3">
          {Array.from({ length: 7 }).map((_, row) => (
            <div key={row} className="grid grid-cols-[2fr_2fr_3fr_2fr_2fr_2fr_2fr_auto] gap-3">
              {Array.from({ length: 8 }).map((__, col) => (
                <div key={col} className="h-10 animate-pulse rounded-xl bg-white/10" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ParcPCPage() {
  const { canWriteInventory } = useAuth()
  const { pcs, isLoading, isFetching, createPC, updatePC, updatePCStatus, deletePC, isSaving } = useParcPC()
  const selectedWorkspace = useSiteStore((state) => state.selectedSite)
  const initialSite = selectedWorkspace?.name ?? 'all'
  const filters = usePCFilters(pcs, initialSite)
  const stats = usePCStats(filters.filtered)
  const [editingPC, setEditingPC] = useState<PCRecord | null>(null)
  const [statusPC, setStatusPC] = useState<PCRecord | null>(null)
  const [detailsPC, setDetailsPC] = useState<PCRecord | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isStatusOpen, setIsStatusOpen] = useState(false)

  const sites = useMemo(() => Array.from(new Set(pcs.map((pc) => pc.site))).sort((a, b) => a.localeCompare(b)), [pcs])
  const scopeLabel = filters.site !== 'all'
    ? `sur ${filters.site}`
    : 'dans la vue actuelle'
  const activeCategoryLabel = filters.category === 'all' ? 'Toutes categories' : filters.category === 'portable_siege' ? 'Portable siege' : 'Portable agence'
  const activeStatusLabel = filters.status === 'all' ? 'Tous statuts' : STATUS_STYLES[filters.status].label
  const dominantStatus = useMemo(() => {
    if (stats.total === 0) {
      return 'envoye'
    }

    return PC_STATUSES.reduce((best, status) => {
      const bestValue = stats.byStatus[best] ?? 0
      const currentValue = stats.byStatus[status] ?? 0
      return currentValue > bestValue ? status : best
    }, PC_STATUSES[0])
  }, [stats.byStatus, stats.total])
  const dominantCount = stats.byStatus[dominantStatus] ?? 0

  useEffect(() => {
    if (selectedWorkspace?.name && sites.includes(selectedWorkspace.name) && filters.site === 'all') {
      filters.setSite(selectedWorkspace.name)
    }

    if (selectedWorkspace?.name && !sites.includes(selectedWorkspace.name) && filters.site === selectedWorkspace.name) {
      filters.setSite('all')
    }
  }, [filters, selectedWorkspace, sites])

  const resetFilters = () => {
    filters.setSearch('')
    filters.setStatus('all')
    filters.setSite(sites.includes(initialSite) ? initialSite : 'all')
    filters.setCategory('all')
    filters.setPage(1)
  }

  const handleCreate = () => {
    setEditingPC(null)
    setIsFormOpen(true)
  }

  const handleEdit = (pc: PCRecord) => {
    setEditingPC(pc)
    setIsFormOpen(true)
  }

  const handleFormSubmit = async (data: PCFormData) => {
    if (editingPC) {
      await updatePC({ id: editingPC.id, data })
    } else {
      await createPC(data)
    }

    setIsFormOpen(false)
    setEditingPC(null)
  }

  const handleStatusSubmit = async (data: PCStatusFormData) => {
    if (!statusPC) {
      return
    }

    await updatePCStatus({ id: statusPC.id, data })
    setIsStatusOpen(false)
    setStatusPC(null)
  }

  const handleDelete = async (pc: PCRecord) => {
    if (!window.confirm(`Supprimer ${pc.hostname} du parc PC ?`)) {
      return
    }

    await deletePC(pc.id)
  }

  const exportRows = (rows: PCRecord[]) => {
    const header = ['hostname', 'asset', 'model', 'category', 'site', 'status', 'sentTo', 'sentRecipient', 'notes']
    const lines = rows.map((pc) => [pc.hostname, pc.asset, pc.model, pc.category, pc.site, pc.status, pc.sentTo || '', pc.sentRecipient || '', (pc.notes || '').replace(/\n/g, ' ')])
    const csv = [header.join(';'), ...lines.map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';'))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `parc-pc-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  const handleBulkSend = async (rows: PCRecord[]) => {
    if (!canWriteInventory || rows.length === 0) {
      return
    }

    const destination = window.prompt('Envoyer vers quel site ou agence ?')
    if (!destination) {
      return
    }

    await Promise.all(rows.map((pc) => updatePCStatus({
      id: pc.id,
      data: {
        status: 'envoye',
        sentTo: destination,
        sentRecipient: pc.sentRecipient || '',
        notes: pc.notes || '',
      },
    })))
  }

  const handleBulkDelete = async (rows: PCRecord[]) => {
    if (!canWriteInventory || rows.length === 0) {
      return
    }

    if (!window.confirm(`Supprimer ${rows.length} PC selectionne(s) ?`)) {
      return
    }

    await Promise.all(rows.map((pc) => deletePC(pc.id)))
  }

  return (
    <div className="relative min-h-full overflow-hidden bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute left-[-12%] top-[-8%] h-[26rem] w-[26rem] rounded-full bg-emerald-400/12 blur-[110px]" />
        <div className="absolute right-[-8%] top-[8%] h-[22rem] w-[22rem] rounded-full bg-green-500/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:90px_90px] [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]" />
      </div>

      <div className="relative mx-auto flex max-w-[1500px] flex-col gap-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <PCCommandHero
            dominantStatus={dominantStatus}
            dominantCount={dominantCount}
            total={stats.total}
            totalVisible={filters.filtered.length}
            totalManifest={filters.filtered.length}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05, ease: 'easeOut' }}
        >
          <PCStatCards
            total={stats.total}
            byStatus={stats.byStatus}
            siteName={filters.site === 'all' ? 'tous les sites' : filters.site}
            activeStatus={filters.status}
            onStatusFilter={(value) => {
              filters.setStatus(value)
              filters.setPage(1)
            }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: 'easeOut' }}
        >
          <PCCommandBar
            search={filters.search}
            onSearchChange={(value) => {
              filters.setSearch(value)
              filters.setPage(1)
            }}
            status={filters.status}
            onStatusChange={(value) => {
              filters.setStatus(value)
              filters.setPage(1)
            }}
            site={filters.site}
            onSiteChange={(value) => {
              filters.setSite(value)
              filters.setPage(1)
            }}
            category={filters.category}
            onCategoryChange={(value) => {
              filters.setCategory(value)
              filters.setPage(1)
            }}
            categoriesTab={filters.category}
            onCategoriesTabChange={(value) => {
              filters.setCategory(value)
              filters.setPage(1)
            }}
            sites={sites}
            onReset={resetFilters}
            onCreate={handleCreate}
            canWrite={canWriteInventory}
            isRefreshing={isFetching}
          />
        </motion.div>

        {isLoading ? (
          <ParcPCSkeleton />
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-[var(--border-accent)] bg-[var(--green-subtle)] px-3 py-1.5 text-[var(--text-secondary)]">{filters.filtered.length} PC trouves</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">{scopeLabel}</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">{activeCategoryLabel}</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">{activeStatusLabel}</span>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Manifest Obsidian</span>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15, ease: 'easeOut' }}
            >
              <PCDataTable
              pcs={filters.filtered}
              canWrite={canWriteInventory}
              onView={setDetailsPC}
              onEdit={handleEdit}
              onStatus={(pc) => {
                setStatusPC(pc)
                setIsStatusOpen(true)
              }}
              onDelete={handleDelete}
              onExportRows={exportRows}
              onBulkSend={handleBulkSend}
              onBulkDelete={handleBulkDelete}
              />
            </motion.div>
          </>
        )}
      </div>

      <PCFormModal
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open)
          if (!open) {
            setEditingPC(null)
          }
        }}
        editingPC={editingPC}
        selectedSite={filters.site !== 'all' ? filters.site : selectedWorkspace?.name}
        onSubmit={handleFormSubmit}
        isSaving={isSaving}
      />

      <PCStatusModal
        open={isStatusOpen}
        onOpenChange={(open) => {
          setIsStatusOpen(open)
          if (!open) {
            setStatusPC(null)
          }
        }}
        pc={statusPC}
        onSubmit={handleStatusSubmit}
        isSaving={isSaving}
      />

      <PCDetailsDrawer
        open={!!detailsPC}
        onOpenChange={(open) => {
          if (!open) {
            setDetailsPC(null)
          }
        }}
        pc={detailsPC}
      />
    </div>
  )
}