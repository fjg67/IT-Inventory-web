import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PC_CATEGORY_LABELS, PC_STATUS_LABELS } from '@/types/pc.types'
import type { PCRecord } from '@/types/pc.types'

interface PCDetailsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pc: PCRecord | null
}

export function PCDetailsDrawer({ open, onOpenChange, pc }: PCDetailsDrawerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="left-auto right-0 top-0 h-screen max-w-xl translate-x-0 translate-y-0 rounded-none border-l border-border bg-surface text-text-primary sm:max-w-xl">
        <DialogHeader className="border-b border-border pb-4">
          <DialogTitle className="text-2xl">{pc?.hostname || 'Fiche PC'}</DialogTitle>
          <DialogDescription>
            Vue detaillee du poste, de son statut et de son acheminement.
          </DialogDescription>
        </DialogHeader>

        {pc && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="info">{PC_CATEGORY_LABELS[pc.category]}</Badge>
              <Badge variant="success">{PC_STATUS_LABELS[pc.status]}</Badge>
            </div>

            <dl className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">Asset</dt>
                <dd className="mt-1 text-base text-white">{pc.asset}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">Modele</dt>
                <dd className="mt-1 text-base text-white">{pc.model}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">Site</dt>
                <dd className="mt-1 text-base text-white">{pc.site}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">Destinataire</dt>
                <dd className="mt-1 text-base text-white">{pc.sentRecipient || 'Non renseigne'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">Envoye vers</dt>
                <dd className="mt-1 text-base text-white">{pc.sentTo || 'Non renseigne'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">Derniere maj</dt>
                <dd className="mt-1 text-base text-white">{new Date(pc.updatedAt).toLocaleString('fr-FR')}</dd>
              </div>
            </dl>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Notes</p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-200">{pc.notes || 'Aucune note renseignee.'}</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}