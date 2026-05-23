import { Layers3, Plus, RotateCcw, Search, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PC_CATEGORIES, PC_CATEGORY_LABELS, PC_STATUSES, PC_STATUS_LABELS } from '@/types/pc.types'
import type { PCCategory, PCStatus } from '@/types/pc.types'

interface PCToolbarProps {
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

export function PCToolbar({
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
}: PCToolbarProps) {
  return (
    <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(7,13,28,0.96))] p-5 shadow-[0_26px_90px_rgba(2,6,23,0.45)] backdrop-blur-2xl">
      <div className="pointer-events-none absolute right-0 top-0 h-28 w-28 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="pointer-events-none absolute left-10 top-0 h-px w-32 bg-gradient-to-r from-transparent via-white/30 to-transparent" />

      <div className="relative flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.35em] text-cyan-200/75">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Poste de commandement
            </div>
            <p className="mt-2 text-sm text-slate-400">Affiner le parc par contexte, statut logistique et categorie machine.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
            <Layers3 className="h-4 w-4 text-cyan-200" />
            Vue dynamique du parc
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onCategoriesTabChange('all')}
          className={`rounded-full border px-4 py-2.5 text-sm font-medium transition-all duration-200 ${categoriesTab === 'all' ? 'border-white/40 bg-white text-slate-950 shadow-[0_10px_30px_rgba(255,255,255,0.12)]' : 'border-white/10 bg-white/5 text-slate-300 hover:-translate-y-[1px] hover:border-cyan-300/30 hover:bg-cyan-300/10 hover:text-white'}`}
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
            className={`rounded-full border px-4 py-2.5 text-sm font-medium transition-all duration-200 ${categoriesTab === item ? 'border-cyan-200/70 bg-cyan-300 text-slate-950 shadow-[0_18px_40px_rgba(34,211,238,0.18)]' : 'border-white/10 bg-white/5 text-slate-300 hover:-translate-y-[1px] hover:border-cyan-300/30 hover:bg-cyan-300/10 hover:text-white'}`}
          >
            {PC_CATEGORY_LABELS[item]}
          </button>
        ))}
      </div>

        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,0.9fr))_auto_auto]">
          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Recherche rapide</span>
            <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Rechercher hostname, asset, modele, site..."
            className="h-12 rounded-2xl border-white/10 bg-white/5 pl-10 text-white placeholder:text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
          />
        </div>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Statut</span>
            <Select value={status} onValueChange={(value) => onStatusChange(value as PCStatus | 'all')}>
          <SelectTrigger className="h-12 rounded-2xl border-white/10 bg-white/5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {PC_STATUSES.map((item) => (
              <SelectItem key={item} value={item}>{PC_STATUS_LABELS[item]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Site</span>
            <Select value={site} onValueChange={onSiteChange}>
          <SelectTrigger className="h-12 rounded-2xl border-white/10 bg-white/5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <SelectValue placeholder="Site" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les sites</SelectItem>
            {sites.map((item) => (
              <SelectItem key={item} value={item}>{item}</SelectItem>
            ))}
          </SelectContent>
        </Select>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Categorie</span>
            <Select value={category} onValueChange={(value) => onCategoryChange(value as PCCategory | 'all')}>
          <SelectTrigger className="h-12 rounded-2xl border-white/10 bg-white/5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <SelectValue placeholder="Categorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les categories</SelectItem>
            {PC_CATEGORIES.map((item) => (
              <SelectItem key={item} value={item}>{PC_CATEGORY_LABELS[item]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
          </div>

          <Button variant="outline" onClick={onReset} className="mt-[22px] h-12 rounded-2xl border-white/10 bg-white/5 text-white transition-all duration-200 hover:-translate-y-[1px] hover:border-cyan-300/30 hover:bg-white/10">
          <RotateCcw className="h-4 w-4" />
          Reinitialiser
        </Button>

          <Button onClick={onCreate} disabled={!canWrite} loading={isRefreshing} className="mt-[22px] h-12 rounded-2xl bg-cyan-300 text-slate-950 shadow-[0_18px_44px_rgba(34,211,238,0.2)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-cyan-200 hover:shadow-[0_24px_54px_rgba(34,211,238,0.25)]">
          <Plus className="h-4 w-4" />
          Nouveau PC
        </Button>
        </div>
      </div>
    </div>
  )
}