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
import { MapPin, Monitor, Tag, UserRound, Calendar, Send, Info } from 'lucide-react'

interface PCDetailsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pc: PCRecord | null
}

export function PCDetailsDrawer({ open, onOpenChange, pc }: PCDetailsDrawerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="left-auto right-0 top-0 h-screen w-full max-w-xl translate-x-0 translate-y-0 overflow-y-auto rounded-none border-l border-border bg-[#F4F7F8] p-0 sm:max-w-xl">
        
        {/* Header - Crédit Agricole Teal (#007d8f) */}
        <div className="bg-[#007d8f] px-8 pb-8 pt-12 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Monitor className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-[11px] uppercase tracking-widest text-white/70">Fiche Equipement</h2>
              <DialogTitle className="mt-1 text-3xl font-light tracking-tight text-white">{pc?.hostname || 'Poste PC'}</DialogTitle>
            </div>
          </div>
          <DialogDescription className="mt-4 text-white/80">
            Détails logistiques et statut d'affectation du matériel.
          </DialogDescription>

          {pc && (
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white shadow-sm backdrop-blur-md border border-white/10">
                {PC_CATEGORY_LABELS[pc.category]}
              </span>
              <span className="inline-flex items-center rounded-full bg-[#00a388] px-3 py-1 text-xs font-medium text-white shadow-sm">
                {PC_STATUS_LABELS[pc.status]}
              </span>
            </div>
          )}
        </div>

        {pc && (
          <div className="space-y-6 p-8">
            {/* Informations principales */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
              <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                <h3 className="flex items-center text-sm font-semibold text-[#007d8f]">
                  <Info className="mr-2 h-4 w-4" /> Informations générales
                </h3>
              </div>
              <dl className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                <div className="px-6 py-5">
                  <dt className="flex items-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                    <Tag className="mr-2 h-3.5 w-3.5 text-slate-400" />
                    Asset
                  </dt>
                  <dd className="mt-2 text-sm font-semibold text-slate-900">{pc.asset}</dd>
                </div>
                <div className="px-6 py-5">
                  <dt className="flex items-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                    <Monitor className="mr-2 h-3.5 w-3.5 text-slate-400" />
                    Modèle
                  </dt>
                  <dd className="mt-2 text-sm font-semibold text-slate-900">{pc.model || 'Non spécifié'}</dd>
                </div>
              </dl>
            </div>

            {/* Localisation et Acheminement */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
              <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                <h3 className="flex items-center text-sm font-semibold text-[#007d8f]">
                  <MapPin className="mr-2 h-4 w-4" /> Localisation & Acheminement
                </h3>
              </div>
              <dl className="divide-y divide-slate-100">
                <div className="grid grid-cols-3 gap-4 px-6 py-4">
                  <dt className="text-sm font-medium text-slate-500">Site Actuel</dt>
                  <dd className="col-span-2 flex items-center text-sm font-medium text-slate-900">
                    {pc.site}
                  </dd>
                </div>
                {pc.status === 'envoye' && (
                  <>
                    <div className="grid grid-cols-3 gap-4 px-6 py-4 bg-[#f8fcfb]">
                      <dt className="flex items-center text-sm font-medium text-slate-500">
                        <Send className="mr-2 h-4 w-4 text-[#00a388]" />
                        Envoyé vers
                      </dt>
                      <dd className="col-span-2 text-sm font-semibold text-slate-900">
                        {pc.sentTo || 'Non renseigné'}
                      </dd>
                    </div>
                    <div className="grid grid-cols-3 gap-4 px-6 py-4 bg-[#f8fcfb]">
                      <dt className="flex items-center text-sm font-medium text-slate-500">
                        <UserRound className="mr-2 h-4 w-4 text-[#00a388]" />
                        Destinataire
                      </dt>
                      <dd className="col-span-2 text-sm font-medium text-slate-900">
                        {pc.sentRecipient || 'Non renseigné'}
                      </dd>
                    </div>
                  </>
                )}
                <div className="grid grid-cols-3 gap-4 px-6 py-4">
                  <dt className="flex items-center text-sm font-medium text-slate-500">
                    <Calendar className="mr-2 h-4 w-4" />
                    Dernière MAJ
                  </dt>
                  <dd className="col-span-2 text-sm text-slate-600">
                    {new Date(pc.updatedAt).toLocaleString('fr-FR', {
                      dateStyle: 'long',
                      timeStyle: 'short'
                    })}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Notes */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
              <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                <h3 className="text-sm font-semibold text-[#007d8f]">Notes et observations</h3>
              </div>
              <div className="px-6 py-5">
                {pc.notes ? (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                    {pc.notes}
                  </p>
                ) : (
                  <p className="text-sm italic text-slate-400">Aucune note renseignée pour ce matériel.</p>
                )}
              </div>
            </div>

          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}