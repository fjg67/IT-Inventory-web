import { Building2, Layers3, Plus, RefreshCcw, Search, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PC_CATEGORIES, PC_CATEGORY_LABELS, PC_STATUSES, PC_STATUS_LABELS } from '@/types/pc.types'
import type { PCCategory, PCStatus } from '@/types/pc.types'
import { SelectFilter } from './SelectFilter'

interface PCCommandBarProps {
  search: string
  onSearchChange: (value: string) => void
  status: PCStatus | 'all'
  onStatusChange: (value: PCStatus | 'all') => void
  site: string
  onSiteChange: (value: string) => void
  category: PCCategory | 'all'
  onCategoryChange: (value: PCCategory | 'all') => void
  categoriesTab: PCCategory | 'all'
  onCategoriesTabChange: (value: PCCategory | 'all') => void
  sites: string[]
  onReset: () => void
  onCreate: () => void
  canWrite: boolean
  isRefreshing: boolean
}

export function PCCommandBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  site,
  onSiteChange,
  category,
  onCategoryChange,
  categoriesTab,
  onCategoriesTabChange,
  sites,
  onReset,
  onCreate,
  canWrite,
  isRefreshing,
}: PCCommandBarProps) {
  return (
    <section className="rounded-[24px] border border-[var(--border-subtle)] bg-[var(--bg-card)] px-6 py-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <div className="h-[2px] w-4 rounded-full bg-brand-light" />
            <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">Poste de commandement</span>
          </div>
          <p className="text-[13px] text-[var(--text-muted)]">Affiner le parc par contexte, statut logistique et categorie machine.</p>
        </div>
        <Button type="button" variant="secondary" className="h-9 rounded-[10px] px-3 text-xs">
          <Layers3 className="h-3.5 w-3.5" />
          Vue dynamique du parc
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            onCategoriesTabChange('all')
            onCategoryChange('all')
          }}
          className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-all duration-150 ${categoriesTab === 'all' ? 'border-[var(--border-accent)] bg-[var(--green-subtle)] text-brand-light' : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:border-[var(--border-card)] hover:text-[var(--text-primary)]'}`}
        >
          Tous les PC
        </button>
        {PC_CATEGORIES.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              onCategoriesTabChange(item)
              onCategoryChange(item)
            }}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-all duration-150 ${categoriesTab === item ? 'border-[var(--border-accent)] bg-[var(--green-subtle)] text-brand-light' : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:border-[var(--border-card)] hover:text-[var(--text-primary)]'}`}
          >
            {PC_CATEGORY_LABELS[item]}
          </button>
        ))}
      </div>

      <div className="grid items-end gap-2.5 xl:grid-cols-[1fr_160px_160px_200px_auto_auto]">
        <div>
          <div className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--text-dim)]">Recherche rapide</div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Hostname, asset, modele, site..."
              className="w-full rounded-[10px] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] py-2 pl-9 pr-3 text-xs text-[var(--text-primary)] placeholder-[var(--text-dim)] transition-colors focus:border-[var(--border-card)] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <div className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--text-dim)]">Statut</div>
          <SelectFilter
            value={status}
            onChange={(value) => onStatusChange(value as PCStatus | 'all')}
            options={PC_STATUSES.map((item) => ({ value: item, label: PC_STATUS_LABELS[item] }))}
            icon={<Tag className="h-3.5 w-3.5" />}
            placeholder="Tous les statuts"
          />
        </div>

        <div>
          <div className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--text-dim)]">Site</div>
          <SelectFilter
            value={site}
            onChange={onSiteChange}
            options={sites.map((item) => ({ value: item, label: item }))}
            icon={<Building2 className="h-3.5 w-3.5" />}
            placeholder="Tous les sites"
          />
        </div>

        <div>
          <div className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--text-dim)]">Categorie</div>
          <SelectFilter
            value={category}
            onChange={(value) => onCategoryChange(value as PCCategory | 'all')}
            options={PC_CATEGORIES.map((item) => ({ value: item, label: PC_CATEGORY_LABELS[item] }))}
            icon={<Tag className="h-3.5 w-3.5" />}
            placeholder="Toutes les categories"
          />
        </div>

        <button
          type="button"
          onClick={onReset}
          className="mt-[22px] flex items-center gap-1.5 rounded-[10px] border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-xs font-medium text-[var(--text-muted)] transition-colors hover:border-[var(--border-card)] hover:text-[var(--text-primary)]"
        >
          <RefreshCcw className="h-3.5 w-3.5" />
          Reinitialiser
        </button>

        <button
          type="button"
          onClick={onCreate}
          disabled={!canWrite || isRefreshing}
          className="mt-[22px] flex items-center gap-1.5 rounded-[10px] bg-[var(--green-primary)] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#187737] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus className="h-3.5 w-3.5" />
          Nouveau PC
        </button>
      </div>
    </section>
  )
}
