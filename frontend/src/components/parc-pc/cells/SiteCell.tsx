import type { PCRecord } from '@/types/pc.types'

interface SiteCellProps {
  pc: PCRecord
}

const SITE_COLORS: Record<string, { abbr: string; color: string; bg: string; border: string }> = {
  stock_5: { abbr: 'S5', color: '#22C55E', bg: 'rgba(34,197,94,0.10)', border: 'rgba(34,197,94,0.22)' },
  stock_8: { abbr: 'S8', color: '#F59E0B', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.22)' },
  epinal: { abbr: 'EP', color: '#3B82F6', bg: 'rgba(59,130,246,0.10)', border: 'rgba(59,130,246,0.22)' },
  tcs: { abbr: 'TC', color: '#EF4444', bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.22)' },
}

function normalizeSiteKey(site: string) {
  return site.toLowerCase().replace(/\s+/g, '_')
}

function fallbackAbbr(site: string) {
  return site
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function toSiteLabel(site: string) {
  return site
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function SiteCell({ pc }: SiteCellProps) {
  const key = normalizeSiteKey(pc.site)
  const site = SITE_COLORS[key] ?? {
    abbr: fallbackAbbr(pc.site),
    color: '#22C55E',
    bg: 'rgba(34,197,94,0.10)',
    border: 'rgba(34,197,94,0.22)',
  }

  return (
    <td className="px-4 py-[11px]">
      <div className="flex items-center gap-[7px]">
        <div
          className="flex h-[24px] w-[24px] flex-shrink-0 items-center justify-center rounded-[7px] border text-[9px] font-black tracking-tighter"
          style={{ background: site.bg, color: site.color, borderColor: site.border }}
        >
          {site.abbr}
        </div>
        <span className="text-[12px] font-medium text-[var(--text-primary)]">{toSiteLabel(pc.site)}</span>
      </div>
    </td>
  )
}
