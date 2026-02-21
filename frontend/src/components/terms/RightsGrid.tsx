// Grille des droits RGPD — 6 mini cards en grid 3×2
// Design : icône + label + description, hover coloré

import { RGPD_RIGHTS } from '@/data/privacyData'

export function RightsGrid() {
  return (
    <div className="my-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
      {RGPD_RIGHTS.map((right) => {
        const Icon = right.icon
        return (
          <div
            key={right.label}
            className={`
              group flex items-start gap-3 p-3.5 rounded-xl
              bg-white/[0.03] border border-white/[0.06]
              hover:${right.colorBg} hover:${right.colorBorder}
              transition-all duration-200
            `}
          >
            <div
              className={`
                w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                ${right.colorBg} border ${right.colorBorder}
              `}
            >
              <Icon className={`h-4 w-4 ${right.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-['Outfit'] font-semibold text-slate-200">
                {right.label}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">{right.description}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
