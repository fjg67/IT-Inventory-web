import { Download, Send, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PCBulkActionsBarProps {
  selectedCount: number
  canWrite: boolean
  onClear: () => void
  onExport: () => void
  onBulkSend: () => void
  onBulkDelete: () => void
}

export function PCBulkActionsBar({ selectedCount, canWrite, onClear, onExport, onBulkSend, onBulkDelete }: PCBulkActionsBarProps) {
  if (selectedCount === 0) {
    return null
  }

  return (
    <div className="sticky top-16 z-10 flex flex-wrap items-center gap-3 rounded-[24px] border border-cyan-300/20 bg-[linear-gradient(135deg,rgba(12,20,40,0.92),rgba(13,40,52,0.82))] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-2xl">
      <div>
        <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/70">Selection active</p>
        <span className="mt-1 block text-sm font-medium text-cyan-50">{selectedCount} PC selectionne(s)</span>
      </div>
      <Button variant="outline" size="sm" onClick={onExport} className="border-white/10 bg-white/5 text-white hover:bg-white/10">
        <Download className="h-4 w-4" />
        Exporter
      </Button>
      <Button variant="outline" size="sm" onClick={onBulkSend} disabled={!canWrite} className="border-white/10 bg-white/5 text-white hover:bg-white/10">
        <Send className="h-4 w-4" />
        Marquer envoyes
      </Button>
      <Button variant="destructive" size="sm" onClick={onBulkDelete} disabled={!canWrite}>
        <Trash2 className="h-4 w-4" />
        Supprimer
      </Button>
      <Button variant="ghost" size="sm" onClick={onClear} className="ml-auto text-slate-300 hover:bg-white/5 hover:text-white">
        <X className="h-4 w-4" />
        Annuler
      </Button>
    </div>
  )
}