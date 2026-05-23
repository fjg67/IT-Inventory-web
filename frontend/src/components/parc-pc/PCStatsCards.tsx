import { Flame, Hammer, PackageCheck, Send, Wrench } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { PC_STATUS_LABELS } from '@/types/pc.types'
import type { PCStatus } from '@/types/pc.types'

const CARD_CONFIG: Array<{ status: PCStatus; icon: React.ElementType; accent: string; glow: string; rail: string }> = [
  { status: 'a_chaud', icon: Flame, accent: 'text-orange-200', glow: 'from-orange-500/25 via-orange-400/10 to-transparent', rail: 'from-orange-400 to-amber-300' },
  { status: 'a_reusiner', icon: Hammer, accent: 'text-rose-200', glow: 'from-rose-500/25 via-fuchsia-400/10 to-transparent', rail: 'from-rose-400 to-pink-300' },
  { status: 'en_usinage', icon: Wrench, accent: 'text-amber-100', glow: 'from-amber-500/25 via-yellow-400/10 to-transparent', rail: 'from-amber-300 to-yellow-200' },
  { status: 'disponible', icon: PackageCheck, accent: 'text-emerald-100', glow: 'from-emerald-500/25 via-teal-400/10 to-transparent', rail: 'from-emerald-300 to-teal-200' },
  { status: 'envoye', icon: Send, accent: 'text-sky-100', glow: 'from-sky-500/25 via-cyan-400/10 to-transparent', rail: 'from-sky-300 to-cyan-200' },
]

interface PCStatsCardsProps {
  total: number
  byStatus: Record<string, number>
  scopeLabel?: string
}

export function PCStatsCards({ total, byStatus, scopeLabel = 'dans la vue actuelle' }: PCStatsCardsProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-5 md:grid-cols-2">
      {CARD_CONFIG.map(({ status, icon: Icon, accent, glow, rail }) => {
        const value = byStatus[status] ?? 0
        const ratio = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0

        return (
          <Card key={status} className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(8,15,32,0.98))] shadow-[0_22px_80px_rgba(0,0,0,0.32)] backdrop-blur-2xl">
            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${glow} opacity-80 transition-opacity duration-300 group-hover:opacity-100`} />
            <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <CardContent className="relative p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.35em] text-slate-400">{PC_STATUS_LABELS[status]}</p>
                  <p className="mt-3 text-4xl font-semibold tracking-tight text-white">{value}</p>
                  <p className="mt-2 max-w-[18ch] text-xs leading-5 text-slate-500">{total} postes {scopeLabel}</p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-[22px] border border-white/10 bg-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <Icon className={`h-6 w-6 ${accent}`} />
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-slate-500">
                  <span>Occupation</span>
                  <span>{ratio}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/5">
                  <div className={`h-full rounded-full bg-gradient-to-r ${rail}`} style={{ width: `${ratio}%` }} />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}