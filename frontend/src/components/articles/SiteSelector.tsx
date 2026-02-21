// Card-based radio site selector with glow effect
// Blueprint Forge design — selected card gets blue glow ring

import { MapPin } from 'lucide-react'
import { motion } from 'framer-motion'

interface Site {
  id: string
  name: string
}

interface SiteSelectorProps {
  sites: Site[]
  value: string
  onChange: (siteId: string) => void
  error?: string
}

export function SiteSelector({ sites, value, onChange, error }: SiteSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-slate-400" style={{ fontFamily: 'Outfit, sans-serif' }}>
        Affecter au site <span className="text-red-400">*</span>
      </label>

      <div className="grid grid-cols-1 gap-2.5">
        {sites.map((site) => {
          const isSelected = value === site.id
          return (
            <motion.label
              key={site.id}
              whileTap={{ scale: 0.98 }}
              className={`
                relative flex items-center gap-3 p-4 rounded-xl cursor-pointer
                transition-all duration-250 select-none
                ${isSelected
                  ? 'bg-blue-500/[0.08] border border-blue-500/30 ring-1 ring-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]'
                  : 'bg-[#0E1826] border border-white/[0.05] hover:border-white/[0.1] hover:bg-[#111F30]'
                }
              `}
            >
              <input
                type="radio"
                className="sr-only"
                checked={isSelected}
                onChange={() => onChange(site.id)}
              />

              {/* Radio dot */}
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                isSelected ? 'border-blue-400 bg-blue-500/20' : 'border-slate-600'
              }`}>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 rounded-full bg-blue-400"
                  />
                )}
              </div>

              {/* Icon */}
              <div className={`p-2 rounded-lg transition-colors ${
                isSelected ? 'bg-blue-500/15' : 'bg-white/5'
              }`}>
                <MapPin className={`h-4 w-4 transition-colors ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
              </div>

              {/* Label */}
              <span
                className={`text-sm font-semibold transition-colors ${
                  isSelected ? 'text-blue-300' : 'text-slate-300'
                }`}
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                {site.name}
              </span>

              {/* Selected indicator bar */}
              {isSelected && (
                <motion.div
                  layoutId="site-indicator"
                  className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-blue-400"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </motion.label>
          )
        })}
      </div>

      {error && (
        <p className="text-[11px] text-red-400 flex items-center gap-1 pl-0.5">
          <span className="text-red-400">⚠</span> {error}
        </p>
      )}
    </div>
  )
}
