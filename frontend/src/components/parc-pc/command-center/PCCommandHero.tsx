import { Cpu, ShieldCheck, Target } from 'lucide-react'
import { STATUS_STYLES } from '@/constants/pcStatuses'
import { PCPulseWidget } from './PCPulseWidget'
import { PCMiniCard } from './PCMiniCard'
import type { PCStatus } from '@/types/pc.types'

interface PCCommandHeroProps {
  dominantStatus: PCStatus
  dominantCount: number
  total: number
  totalVisible: number
  totalManifest: number
}

export function PCCommandHero({ dominantStatus, dominantCount, total, totalVisible, totalManifest }: PCCommandHeroProps) {
  const style = STATUS_STYLES[dominantStatus]
  const occupancyPercent = total > 0 ? Math.round((dominantCount / total) * 100) : 0

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-[var(--border-subtle)] bg-[var(--bg-card)] px-6 py-10">
      <div
        className="pointer-events-none absolute right-0 top-0 h-56 w-80"
        style={{ background: 'radial-gradient(ellipse at 70% 30%, rgba(27,138,62,0.14) 0%, transparent 65%)' }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-40 w-48"
        style={{ background: 'radial-gradient(ellipse, rgba(34,197,94,0.07) 0%, transparent 65%)' }}
      />

      <div className="relative z-10 flex items-start justify-between gap-8">
        <div className="max-w-xl flex-1">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--border-accent)] bg-[var(--green-subtle)] px-3 py-1.5">
            <Cpu className="h-3.5 w-3.5 text-brand-light" />
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-light">Parc PC Command Center</span>
          </div>

          <h1 className="mb-3 text-[36px] font-extrabold leading-[1.18] tracking-[-0.03em] text-[var(--text-primary)]">
            Vue atelier du parc <span className="text-brand-light">plus nette</span>, plus dense, plus belle.
          </h1>

          <p className="mb-5 max-w-lg text-sm leading-relaxed text-[var(--text-muted)]">
            Supervise le cycle de vie des machines du site courant, visualise les tensions logistiques et bascule d'une perspective a l'autre sans perdre le contexte.
          </p>

          <div
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold"
            style={{ background: style.subtleBg, color: style.color, borderColor: style.borderColor }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: style.color }} />
            Statut dominant : {style.label}
          </div>
        </div>

        <div className="flex w-64 flex-shrink-0 flex-col gap-2.5">
          <PCPulseWidget status={dominantStatus} occupancyPercent={occupancyPercent} />
          <PCMiniCard
            label="Machines visibles"
            value={totalVisible}
            sub="dans le filtre courant"
            icon={<Target className="h-4 w-4" />}
          />
          <PCMiniCard
            label="Manifest dense"
            value={totalManifest}
            sub="Tri, pagination et actions contextuelles"
            icon={<ShieldCheck className="h-4 w-4" />}
          />
        </div>
      </div>
    </section>
  )
}
