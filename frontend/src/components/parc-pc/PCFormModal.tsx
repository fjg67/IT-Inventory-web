import { useEffect, useState } from 'react'
import { BadgePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { PC_CATEGORIES, PC_CATEGORY_LABELS, PC_STATUSES, PC_STATUS_LABELS } from '@/types/pc.types'
import type { PCFormData, PCCategory, PCRecord, PCStatus } from '@/types/pc.types'

const initialForm: PCFormData = {
  hostname: '',
  asset: '',
  model: '',
  category: 'portable_siege',
  status: 'disponible',
  site: '',
  sentTo: '',
  sentRecipient: '',
  notes: '',
}

const MODEL_OPTIONS_BY_CATEGORY: Record<PCCategory, Array<{ value: string; label: string }>> = {
  portable_siege: [
    { value: 'Dell Latitude 5440 tactile', label: 'Dell Latitude 5440 tactile' },
    { value: 'Dell Latitude 5440 non tactile', label: 'Dell Latitude 5440 non tactile' },
  ],
  portable_agence: [
    { value: 'Dell Latitude 5550', label: 'Dell Latitude 5550' },
    { value: 'HP Elitebook', label: 'HP Elitebook' },
  ],
}

interface PCFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingPC: PCRecord | null
  selectedSite?: string
  onSubmit: (data: PCFormData) => Promise<void>
  isSaving: boolean
}

const statusThemes: Record<PCStatus, { badge: string; glow: string; ring: string; button: string; image: string }> = {
  a_chaud: {
    badge: 'border-emerald-300/40 bg-emerald-300/12 text-emerald-100',
    glow: 'bg-emerald-300/12',
    ring: 'focus:border-emerald-300 focus:ring-emerald-300/30',
    button: 'bg-emerald-300 text-emerald-950 hover:bg-emerald-200 shadow-[0_16px_40px_rgba(110,231,183,0.25)]',
    image: '/status/a-chaud.svg',
  },
  a_reusiner: {
    badge: 'border-green-300/40 bg-green-300/12 text-green-100',
    glow: 'bg-green-300/12',
    ring: 'focus:border-green-300 focus:ring-green-300/30',
    button: 'bg-green-300 text-green-950 hover:bg-green-200 shadow-[0_16px_40px_rgba(134,239,172,0.25)]',
    image: '/status/a-reusiner.svg',
  },
  en_usinage: {
    badge: 'border-lime-300/40 bg-lime-300/12 text-lime-100',
    glow: 'bg-lime-300/12',
    ring: 'focus:border-lime-300 focus:ring-lime-300/30',
    button: 'bg-lime-300 text-lime-950 hover:bg-lime-200 shadow-[0_16px_40px_rgba(190,242,100,0.25)]',
    image: '/status/en-usinage.svg',
  },
  disponible: {
    badge: 'border-emerald-300/40 bg-emerald-300/12 text-emerald-100',
    glow: 'bg-emerald-300/12',
    ring: 'focus:border-emerald-300 focus:ring-emerald-300/30',
    button: 'bg-emerald-300 text-emerald-950 hover:bg-emerald-200 shadow-[0_16px_40px_rgba(110,231,183,0.25)]',
    image: '/status/disponible.svg',
  },
  envoye: {
    badge: 'border-teal-300/40 bg-teal-300/12 text-teal-100',
    glow: 'bg-teal-300/12',
    ring: 'focus:border-teal-300 focus:ring-teal-300/30',
    button: 'bg-teal-300 text-teal-950 hover:bg-teal-200 shadow-[0_16px_40px_rgba(94,234,212,0.25)]',
    image: '/status/envoye.svg',
  },
}

export function PCFormModal({ open, onOpenChange, editingPC, selectedSite, onSubmit, isSaving }: PCFormModalProps) {
  const [form, setForm] = useState<PCFormData>(initialForm)
  const isSentStatus = form.status === 'envoye'
  const activeTheme = statusThemes[form.status || 'disponible']
  const availableModelOptions = MODEL_OPTIONS_BY_CATEGORY[form.category]
  const hasCustomModel = form.model.trim().length > 0 && !availableModelOptions.some((option) => option.value === form.model)
  const defaultSite = selectedSite && selectedSite !== 'all' ? selectedSite : ''

  useEffect(() => {
    if (!editingPC) {
      setForm({ ...initialForm, site: defaultSite })
      return
    }

    setForm({
      hostname: editingPC.hostname,
      asset: editingPC.asset,
      model: editingPC.model,
      category: editingPC.category,
      status: editingPC.status,
      site: editingPC.site,
      sentTo: editingPC.sentTo || '',
      sentRecipient: editingPC.sentRecipient || '',
      notes: editingPC.notes || '',
    })
  }, [defaultSite, editingPC, open])

  useEffect(() => {
    if (!editingPC && open && defaultSite) {
      setForm((current) => ({ ...current, site: defaultSite }))
    }
  }, [defaultSite, editingPC, open])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await onSubmit({
      ...form,
      sentTo: isSentStatus ? form.sentTo : '',
      sentRecipient: isSentStatus ? form.sentRecipient : '',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden border-[var(--border-subtle)] bg-[linear-gradient(180deg,rgba(10,15,13,0.96),rgba(13,21,17,0.98))] text-white sm:max-w-2xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-light/70 to-transparent" />
        <div className={cn('pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full blur-3xl', activeTheme.glow)} />

        <DialogHeader className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <div className={cn('mb-3 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-[11px] uppercase tracking-[0.28em]', activeTheme.badge)}>
            <BadgePlus className="h-3.5 w-3.5" />
            Fiche machine
          </div>
          <DialogTitle className="text-2xl tracking-tight text-white">{editingPC ? 'Modifier le PC' : 'Ajouter un PC'}</DialogTitle>
          <DialogDescription>
            Renseigne le poste pour l'ajouter au parc PC centralise.
          </DialogDescription>
          <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <img src={activeTheme.image} alt={`Illustration ${PC_STATUS_LABELS[form.status || 'disponible']}`} className="h-32 w-full object-cover" />
          </div>
        </DialogHeader>

        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="pc-hostname" className="text-xs uppercase tracking-[0.24em] text-slate-400">Hostname</Label>
            <Input id="pc-hostname" value={form.hostname} onChange={(event) => setForm((current) => ({ ...current, hostname: event.target.value }))} className="h-12 rounded-2xl border-white/10 bg-white/5 text-white" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pc-asset" className="text-xs uppercase tracking-[0.24em] text-slate-400">Asset</Label>
            <Input id="pc-asset" value={form.asset} onChange={(event) => setForm((current) => ({ ...current, asset: event.target.value }))} className="h-12 rounded-2xl border-white/10 bg-white/5 text-white" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pc-model" className="text-xs uppercase tracking-[0.24em] text-slate-400">Modele</Label>
            <Select value={form.model} onValueChange={(value) => setForm((current) => ({ ...current, model: value }))}>
              <SelectTrigger id="pc-model" className="h-12 rounded-2xl border-white/10 bg-white/5 text-white"><SelectValue placeholder="Choisir le modele" /></SelectTrigger>
              <SelectContent>
                {availableModelOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                {hasCustomModel && <SelectItem value={form.model}>{form.model}</SelectItem>}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-[0.24em] text-slate-400">Categorie</Label>
            <Select value={form.category} onValueChange={(value) => {
              const nextCategory = value as PCCategory
              const nextModels = MODEL_OPTIONS_BY_CATEGORY[nextCategory]
              setForm((current) => ({
                ...current,
                category: nextCategory,
                model: nextModels.some((option) => option.value === current.model) ? current.model : '',
              }))
            }}>
              <SelectTrigger className="h-12 rounded-2xl border-white/10 bg-white/5 text-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PC_CATEGORIES.map((item) => <SelectItem key={item} value={item}>{PC_CATEGORY_LABELS[item]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-[0.24em] text-slate-400">Statut</Label>
            <Select value={form.status} onValueChange={(value) => setForm((current) => ({ ...current, status: value as PCStatus }))}>
              <SelectTrigger className={cn('h-12 rounded-2xl border-white/10 bg-white/5 text-white', activeTheme.ring)}><SelectValue /></SelectTrigger>
              <SelectContent>
                {PC_STATUSES.map((item) => <SelectItem key={item} value={item}>{PC_STATUS_LABELS[item]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pc-site" className="text-xs uppercase tracking-[0.24em] text-slate-400">Site</Label>
            <Input id="pc-site" value={form.site} onChange={(event) => setForm((current) => ({ ...current, site: event.target.value }))} className="h-12 rounded-2xl border-white/10 bg-white/5 text-white" required />
          </div>
          {isSentStatus && (
            <>
              <div className="space-y-2">
                <Label htmlFor="pc-sent-to" className="text-xs uppercase tracking-[0.24em] text-slate-400">Envoye vers</Label>
                <Input id="pc-sent-to" value={form.sentTo} onChange={(event) => setForm((current) => ({ ...current, sentTo: event.target.value }))} className="h-12 rounded-2xl border-white/10 bg-white/5 text-white" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pc-sent-recipient" className="text-xs uppercase tracking-[0.24em] text-slate-400">Destinataire</Label>
                <Input id="pc-sent-recipient" value={form.sentRecipient} onChange={(event) => setForm((current) => ({ ...current, sentRecipient: event.target.value }))} className="h-12 rounded-2xl border-white/10 bg-white/5 text-white" />
              </div>
            </>
          )}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="pc-notes" className="text-xs uppercase tracking-[0.24em] text-slate-400">Notes</Label>
            <textarea id="pc-notes" value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} className={cn('min-h-[130px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:ring-2', activeTheme.ring)} />
          </div>
          <DialogFooter className="md:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-11 rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10">Annuler</Button>
            <Button type="submit" loading={isSaving} className={cn('h-11 rounded-2xl', activeTheme.button)}>
              {editingPC ? 'Enregistrer les modifications' : 'Creer le PC'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}