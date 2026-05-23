import { Eye, MoreHorizontal, Pencil, Send, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { PCRecord } from '@/types/pc.types'

interface ActionsCellProps {
  pc: PCRecord
  hovered: boolean
  canWrite: boolean
  onView: (pc: PCRecord) => void
  onEdit: (pc: PCRecord) => void
  onStatus: (pc: PCRecord) => void
  onDelete: (pc: PCRecord) => void
}

export function ActionsCell({ pc, hovered, canWrite, onView, onEdit, onStatus, onDelete }: ActionsCellProps) {
  return (
    <td className="px-3 py-[11px]" onClick={(event) => event.stopPropagation()}>
      <div className={cn('flex justify-center transition-opacity duration-150', hovered ? 'opacity-100' : 'pointer-events-none opacity-0')}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-white">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="border-white/10 bg-slate-950/95 text-white">
            <DropdownMenuItem onClick={() => onView(pc)}>
              <Eye className="mr-2 h-4 w-4" />
              Voir le detail
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(pc)} disabled={!canWrite}>
              <Pencil className="mr-2 h-4 w-4" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatus(pc)} disabled={!canWrite}>
              <Send className="mr-2 h-4 w-4" />
              Changer le statut
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(pc)} disabled={!canWrite} className="text-rose-300 focus:text-rose-200">
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </td>
  )
}
