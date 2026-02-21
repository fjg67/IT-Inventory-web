// Graphiques du tableau de bord — mouvements, top articles, répartition catégories
// Design ultra-premium avec glassmorphism, gradients avancés, et animations fluides

import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { motion } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, BarChart3, PieChart as PieChartIcon, ArrowUpRight, ArrowDownRight, Flame, Zap } from 'lucide-react'
import type { MovementChartData, TopArticleData, CategoryData } from '@/types'

// Palette premium pour le donut chart
const CATEGORY_COLORS = [
  '#6366F1', '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#EC4899', '#8B5CF6', '#06B6D4',
]

// Émojis catégories
const CATEGORY_EMOJI: Record<string, string> = {
  'Câbles': '🔌',
  'Écrans': '🖥️',
  'Claviers/Souris': '⌨️',
  'Mémoire': '💾',
  'Stockage': '💿',
  'Réseau': '🌐',
  'Divers': '📦',
}

// Tooltip personnalisé premium
interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}

function ChartTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0a0f1e]/95 backdrop-blur-2xl border border-white/[0.08] rounded-2xl px-4 py-3 shadow-2xl shadow-black/40">
      <p className="text-white/40 text-[10px] uppercase tracking-wider font-semibold mb-2">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2.5 text-sm py-0.5">
          <div className="w-2 h-2 rounded-full ring-2 ring-offset-1 ring-offset-[#0a0f1e]"
            style={{ backgroundColor: entry.color }} />
          <span className="text-white/50 text-xs">{entry.name}</span>
          <span className="text-white font-bold ml-auto tabular-nums">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

// Section header réutilisable avec glow premium
function ChartHeader({ icon: Icon, title, iconBg, glowColor }: { icon: typeof TrendingUp; title: string; iconBg: string; glowColor: string }) {
  return (
    <div className="flex items-center gap-3.5 mb-6">
      <div className="relative">
        <div className={`absolute inset-0 ${glowColor} blur-lg opacity-40 rounded-xl`} />
        <div className={`relative p-2.5 rounded-xl ${iconBg} ring-1 ring-white/[0.08]`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <h3 className="text-[15px] font-semibold text-white tracking-tight">{title}</h3>
    </div>
  )
}

// === Graphique de mouvements (AreaChart 30 jours) ===
interface MovementChartProps {
  data: MovementChartData[]
  loading?: boolean
}

export function MovementChart({ data, loading }: MovementChartProps) {
  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <Skeleton className="h-5 w-48" />
        </div>
        <Skeleton className="h-[320px] w-full rounded-xl" />
      </div>
    )
  }

  // Stats rapides
  const totalEntries = data.reduce((s, d) => s + d.entries, 0)
  const totalExits = data.reduce((s, d) => s + d.exits, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 ring-1 ring-white/[0.04]"
    >
      {/* Noise texture */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iLjAyIi8+PC9zdmc+')] opacity-50 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <ChartHeader
            icon={TrendingUp}
            title="Mouvements — 30 jours"
            iconBg="bg-blue-500/15 text-blue-400"
            glowColor="bg-blue-500"
          />
          {/* Mini stats */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/[0.08] ring-1 ring-emerald-500/20">
              <ArrowUpRight className="h-3 w-3 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400 tabular-nums">{totalEntries}</span>
              <span className="text-[10px] text-emerald-400/50">entrées</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/[0.08] ring-1 ring-red-500/20">
              <ArrowDownRight className="h-3 w-3 text-red-400" />
              <span className="text-xs font-bold text-red-400 tabular-nums">{totalExits}</span>
              <span className="text-[10px] text-red-400/50">sorties</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="gradientEntries" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.25} />
                <stop offset="50%" stopColor="#10B981" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradientExits" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EF4444" stopOpacity={0.2} />
                <stop offset="50%" stopColor="#EF4444" stopOpacity={0.06} />
                <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="transparent"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dy={8}
              tick={{ fill: 'rgba(255,255,255,0.25)' }}
            />
            <YAxis
              stroke="transparent"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dx={-8}
              tick={{ fill: 'rgba(255,255,255,0.25)' }}
            />
            <Tooltip content={<ChartTooltip />} />
            <Legend
              iconType="circle"
              iconSize={7}
              wrapperStyle={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, paddingTop: 16 }}
            />
            <Area
              type="monotone"
              dataKey="entries"
              name="Entrées"
              stroke="#10B981"
              strokeWidth={2}
              fill="url(#gradientEntries)"
              dot={false}
              activeDot={{ r: 5, fill: '#10B981', stroke: '#080d1c', strokeWidth: 3 }}
            />
            <Area
              type="monotone"
              dataKey="exits"
              name="Sorties"
              stroke="#EF4444"
              strokeWidth={2}
              fill="url(#gradientExits)"
              dot={false}
              activeDot={{ r: 5, fill: '#EF4444', stroke: '#080d1c', strokeWidth: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}

// === Top 10 articles — design premium avec barres custom ===
interface TopArticlesChartProps {
  data: TopArticleData[]
  loading?: boolean
}

export function TopArticlesChart({ data, loading }: TopArticlesChartProps) {
  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1)

  // Couleurs de gradient par rang
  const rankColors = [
    { bg: 'from-amber-500/20 to-amber-500/5', bar: 'from-amber-400 to-yellow-500', text: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-300 ring-amber-500/30', medal: '🥇' },
    { bg: 'from-slate-300/15 to-slate-400/5', bar: 'from-slate-300 to-slate-400', text: 'text-slate-300', badge: 'bg-slate-400/20 text-slate-300 ring-slate-400/30', medal: '🥈' },
    { bg: 'from-amber-700/15 to-amber-800/5', bar: 'from-amber-600 to-amber-700', text: 'text-amber-600', badge: 'bg-amber-700/20 text-amber-500 ring-amber-700/30', medal: '🥉' },
  ]

  const defaultColor = { bg: 'from-blue-500/10 to-blue-500/[0.02]', bar: 'from-blue-500/80 to-indigo-500/60', text: 'text-blue-400', badge: 'bg-blue-500/15 text-blue-400 ring-blue-500/20', medal: '' }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 ring-1 ring-white/[0.04]"
    >
      {/* Noise texture */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iLjAyIi8+PC9zdmc+')] opacity-50 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <ChartHeader
            icon={Flame}
            title="Top 10 — Les plus mouvementés"
            iconBg="bg-orange-500/15 text-orange-400"
            glowColor="bg-orange-500"
          />
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] ring-1 ring-white/[0.06]">
            <Zap className="h-3 w-3 text-amber-400" />
            <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Activité</span>
          </div>
        </div>

        <div className="space-y-2">
          {data.map((item, index) => {
            const color = index < 3 ? rankColors[index]! : defaultColor
            const pct = Math.round((item.count / maxCount) * 100)

            return (
              <motion.div
                key={item.reference}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
                className={`group relative overflow-hidden rounded-xl bg-gradient-to-r ${color.bg} border border-white/[0.04] hover:border-white/[0.08] transition-all duration-300`}
              >
                <div className="relative z-10 flex items-center gap-3 px-4 py-2.5">
                  {/* Rank */}
                  <div className="flex-shrink-0 w-7 text-center">
                    {color.medal ? (
                      <span className="text-base">{color.medal}</span>
                    ) : (
                      <span className="text-xs font-bold text-white/20 tabular-nums">
                        #{index + 1}
                      </span>
                    )}
                  </div>

                  {/* Article info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-white truncate">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-white/20">{item.reference}</span>
                  </div>

                  {/* Bar + Count */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="w-24 sm:w-32 md:w-40 h-2 rounded-full bg-white/[0.04] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.2 + index * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className={`h-full rounded-full bg-gradient-to-r ${color.bar}`}
                      />
                    </div>
                    <span className={`inline-flex items-center justify-center min-w-[32px] px-2 py-0.5 rounded-md text-xs font-bold tabular-nums ring-1 ${color.badge}`}>
                      {item.count}
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}

// === Répartition par catégorie (DonutChart premium) ===
interface CategoryChartProps {
  data: CategoryData[]
  loading?: boolean
}

export function CategoryChart({ data, loading }: CategoryChartProps) {
  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <Skeleton className="h-5 w-48" />
        </div>
        <Skeleton className="h-[320px] w-full rounded-xl" />
      </div>
    )
  }

  const total = data.reduce((sum, item) => sum + item.count, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 ring-1 ring-white/[0.04]"
    >
      {/* Noise texture */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iLjAyIi8+PC9zdmc+')] opacity-50 pointer-events-none" />

      <div className="relative z-10">
        <ChartHeader
          icon={PieChartIcon}
          title="Répartition par catégorie"
          iconBg="bg-emerald-500/15 text-emerald-400"
          glowColor="bg-emerald-500"
        />

        <div className="flex items-center gap-8">
          {/* Donut */}
          <div className="relative w-1/2">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  dataKey="count"
                  nameKey="category"
                  strokeWidth={2}
                  stroke="#080d1c"
                  animationDuration={1200}
                  animationEasing="ease-out"
                >
                  {data.map((_, index) => (
                    <Cell key={index} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center text with glow */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="absolute w-20 h-20 bg-indigo-500/10 rounded-full blur-xl" />
              <span className="relative text-3xl font-bold text-white tabular-nums">{total}</span>
              <span className="relative text-[10px] text-white/30 uppercase tracking-widest font-semibold mt-0.5">articles</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-2.5">
            {data.map((item, index) => {
              const pct = total > 0 ? Math.round((item.count / total) * 100) : 0
              const emoji = CATEGORY_EMOJI[item.category] ?? '📦'
              return (
                <motion.div
                  key={item.category}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.08 }}
                  className="group"
                >
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-2.5 h-2.5 rounded-[4px] ring-1 ring-white/10"
                        style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
                      />
                      <span className="text-xs">{emoji}</span>
                      <span className="text-white/60 text-xs font-medium">{item.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-xs tabular-nums">{item.count}</span>
                      <span className="text-white/20 text-[10px] w-8 text-right tabular-nums">{pct}%</span>
                    </div>
                  </div>
                  {/* Animated progress bar */}
                  <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.6 + index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
                    />
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
