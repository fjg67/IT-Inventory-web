// ThemePreview — Miniature visuelle des deux thèmes côte à côte
// Affiche un aperçu Dark / Light avec badge "Actif" sur le thème courant

import { useTheme } from '../../contexts/ThemeContext'

export function ThemePreview() {
  const { resolvedTheme } = useTheme()

  return (
    <div className="grid grid-cols-2 gap-3 mt-3">
      {(['dark', 'light'] as const).map((t) => {
        const isActive = resolvedTheme === t
        return (
          <div
            key={t}
            className={`
              relative rounded-xl overflow-hidden border-2 transition-all duration-200
              ${isActive
                ? 'border-primary shadow-[0_0_0_1px_rgba(59,130,246,0.3)]'
                : 'border-border opacity-60'
              }
            `}
          >
            {/* Miniature UI simulée */}
            <div
              className="p-3 space-y-2"
              style={{ background: t === 'dark' ? '#0A0F1E' : '#F8FAFC' }}
            >
              {/* Fausse sidebar + contenu */}
              <div className="flex gap-2">
                <div
                  className="w-8 rounded flex-shrink-0"
                  style={{
                    background: t === 'dark' ? '#0F1629' : '#FFFFFF',
                    height: 48,
                  }}
                />
                <div className="flex-1 space-y-1.5">
                  <div
                    className="h-2 rounded-full w-3/4"
                    style={{ background: t === 'dark' ? '#1E2D4A' : '#E2E8F0' }}
                  />
                  <div
                    className="h-2 rounded-full w-1/2"
                    style={{ background: t === 'dark' ? '#141E35' : '#F1F5F9' }}
                  />
                  <div
                    className="h-6 rounded-lg"
                    style={{
                      background: t === 'dark' ? '#141E35' : '#FFFFFF',
                      border: `1px solid ${t === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'}`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Label + badge actif */}
            <div
              className="px-3 py-2 flex items-center justify-between border-t"
              style={{
                background: t === 'dark' ? '#0F1629' : '#FFFFFF',
                borderColor: t === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)',
              }}
            >
              <span
                className="text-xs font-semibold"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  color: t === 'dark' ? '#94A3B8' : '#475569',
                }}
              >
                {t === 'dark' ? '🌙 Sombre' : '☀️ Clair'}
              </span>
              {isActive && (
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    background: 'rgba(59,130,246,0.15)',
                    color: '#60A5FA',
                  }}
                >
                  Actif
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
