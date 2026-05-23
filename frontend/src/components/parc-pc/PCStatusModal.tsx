import { useEffect, useState } from 'react'
import { CircleDot, NotebookPen, Send, UserRound } from 'lucide-react'
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
import { PC_STATUSES, PC_STATUS_LABELS } from '@/types/pc.types'
import type { PCRecord, PCStatus, PCStatusFormData } from '@/types/pc.types'

const initialForm: PCStatusFormData = {
  status: 'disponible',
  sentTo: '',
  sentRecipient: '',
  notes: '',
}

interface PCStatusModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pc: PCRecord | null
  onSubmit: (data: PCStatusFormData) => Promise<void>
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

export function PCStatusModal({ open, onOpenChange, pc, onSubmit, isSaving }: PCStatusModalProps) {
  const [form, setForm] = useState<PCStatusFormData>(initialForm)
  const isSentStatus = form.status === 'envoye'
  const activeTheme = statusThemes[form.status]

  useEffect(() => {
    if (!pc) {
      setForm(initialForm)
      return
    }

    setForm({
      status: pc.status,
      sentTo: pc.sentTo || '',
      sentRecipient: pc.sentRecipient || '',
      notes: pc.notes || '',
    })
  }, [open, pc])

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
            <CircleDot className="h-3.5 w-3.5" />
            Statut machine
          </div>
          <DialogTitle className="text-2xl tracking-tight text-white">Changer le statut</DialogTitle>
          <DialogDescription>
            Mets a jour l'etat logistique de {pc?.hostname || 'ce poste'}.
          </DialogDescription>
          <div className="mt-4 inline-flex w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
            Etat actuel: {PC_STATUS_LABELS[form.status]}
          </div>
          <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <img src={activeTheme.image} alt={`Illustration ${PC_STATUS_LABELS[form.status]}`} className="h-32 w-full object-cover" />
          </div>
        </DialogHeader>

        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-[0.24em] text-slate-400">Statut</Label>
            <Select value={form.status} onValueChange={(value) => setForm((current) => ({ ...current, status: value as PCStatus }))}>
              <SelectTrigger className={cn('h-12 rounded-2xl border-white/10 bg-white/5 text-white', activeTheme.ring)}><SelectValue /></SelectTrigger>
              <SelectContent>
                {PC_STATUSES.map((item) => <SelectItem key={item} value={item}>{PC_STATUS_LABELS[item]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {isSentStatus && (
            <>
              <div className="space-y-2">
                <Label htmlFor="pc-status-site" className="text-xs uppercase tracking-[0.24em] text-slate-400">Envoye vers</Label>
                <div className="relative">
                  <Send className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-light/70" />
                  <Input id="pc-status-site" value={form.sentTo} onChange={(event) => setForm((current) => ({ ...current, sentTo: event.target.value }))} className="h-12 rounded-2xl border-white/10 bg-white/5 pl-10 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pc-status-recipient" className="text-xs uppercase tracking-[0.24em] text-slate-400">Destinataire</Label>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-light/70" />
                  <Input id="pc-status-recipient" value={form.sentRecipient} onChange={(event) => setForm((current) => ({ ...current, sentRecipient: event.target.value }))} className="h-12 rounded-2xl border-white/10 bg-white/5 pl-10 text-white" />
                </div>
              </div>
            </>
          )}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="pc-status-notes" className="text-xs uppercase tracking-[0.24em] text-slate-400">Notes</Label>
            <div className="relative">
              <NotebookPen className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-brand-light/70" />
              <textarea id="pc-status-notes" value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} className={cn('min-h-[140px] w-full rounded-2xl border border-white/10 bg-white/5 px-10 py-3 text-sm text-white outline-none transition focus:ring-2', activeTheme.ring)} />
            </div>
          </div>
          <DialogFooter className="md:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-11 rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10">Annuler</Button>
            <Button type="submit" loading={isSaving} className={cn('h-11 rounded-2xl', activeTheme.button)}>Mettre a jour</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}