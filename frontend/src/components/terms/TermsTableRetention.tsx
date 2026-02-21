// Tableau de rétention des données — composant premium
// Design : header sombre, lignes hover, durée en mono, badges colorés

import { RETENTION_DATA } from '@/data/privacyData'

export function TermsTableRetention() {
  return (
    <div className="my-5 rounded-[14px] bg-[#0F1D2E] border border-white/[0.07] overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-3 gap-4 px-5 py-3 bg-white/[0.04]">
        <span className="text-[11px] font-['Outfit'] font-bold uppercase tracking-wider text-slate-500">
          Type de données
        </span>
        <span className="text-[11px] font-['Outfit'] font-bold uppercase tracking-wider text-slate-500">
          Durée
        </span>
        <span className="text-[11px] font-['Outfit'] font-bold uppercase tracking-wider text-slate-500">
          Justification
        </span>
      </div>

      {/* Rows */}
      {RETENTION_DATA.map((row, i) => (
        <div
          key={row.type}
          className={`
            grid grid-cols-3 gap-4 px-5 py-3.5 items-center
            hover:bg-white/[0.03] transition-colors
            ${i < RETENTION_DATA.length - 1 ? 'border-b border-white/[0.05]' : ''}
          `}
        >
          <span className="text-[13px] font-['Outfit'] text-slate-300 font-medium">
            {row.type}
          </span>
          <span className="text-[13px] font-['JetBrains_Mono'] font-semibold text-blue-400">
            {row.duration}
          </span>
          <span
            className={`
              inline-flex w-fit text-[10px] font-medium px-2.5 py-1 rounded-full
              ${row.justColor}
            `}
          >
            {row.justification}
          </span>
        </div>
      ))}
    </div>
  )
}
