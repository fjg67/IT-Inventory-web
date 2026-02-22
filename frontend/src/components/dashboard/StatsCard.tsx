// Carte de statistique KPI avec sparkline réel — tableau de bord
// Design premium avec gradient, glow, mini-graphique SVG et animation de compteur

import { type LucideIcon } from 'lucide-react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { useEffect, useRef, useMemo } from 'react'

interface StatsCardProps {
  title: string
  value: number | string
  delta?: number
  icon: LucideIcon
  color: 'blue' | 'green' | 'warning' | 'danger'
  loading?: boolean
  index?: number
  onClick?: () => void
  sparklineData?: number[]
}

const colorMap = {
  blue: {
    gradient: 'from-blue-500/20 via-blue-600/10 to-transparent',
    iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
    iconGlow: 'shadow-[0_0_20px_rgba(59,130,246,0.4)]',
    ring: 'ring-blue-500/20',
    accent: 'text-blue-400',
    bar: 'from-blue-500 to-blue-400',
    sparkStroke: '#3B82F6',
    sparkFill: 'rgba(59,130,246,0.15)',
  },
  green: {
    gradient: 'from-emerald-500/20 via-emerald-600/10 to-transparent',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    iconGlow: 'shadow-[0_0_20px_rgba(16,185,129,0.4)]',
    ring: 'ring-emerald-500/20',
    accent: 'text-emerald-400',
    bar: 'from-emerald-500 to-emerald-400',
    sparkStroke: '#10B981',
    sparkFill: 'rgba(16,185,129,0.15)',
  },
  warning: {
    gradient: 'from-amber-500/20 via-amber-600/10 to-transparent',
    iconBg: 'bg-gradient-to-br from-amber-500 to-amber-600',
    iconGlow: 'shadow-[0_0_20px_rgba(245,158,11,0.4)]',
    ring: 'ring-amber-500/20',
    accent: 'text-amber-400',
    bar: 'from-amber-500 to-amber-400',
    sparkStroke: '#F59E0B',
    sparkFill: 'rgba(245,158,11,0.15)',
  },
  danger: {
    gradient: 'from-red-500/20 via-red-600/10 to-transparent',
    iconBg: 'bg-gradient-to-br from-red-500 to-red-600',
    iconGlow: 'shadow-[0_0_20px_rgba(239,68,68,0.4)]',
    ring: 'ring-red-500/20',
    accent: 'text-red-400',
    bar: 'from-red-500 to-red-400',
    sparkStroke: '#EF4444',
    sparkFill: 'rgba(239,68,68,0.15)',
  },
}

/* ────────── Animated Counter ────────── */

function AnimatedCounter({ value }: { value: number }) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => Math.round(v).toLocaleString('fr-FR'))
  const nodeRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 1.2,
      ease: 'easeOut',
    })
    return controls.stop
  }, [count, value])

  useEffect(() => {
    const unsubscribe = rounded.on('change', (v) => {
      if (nodeRef.current) {
        nodeRef.current.textContent = v
      }
    })
    return unsubscribe
  }, [rounded])

  return <span ref={nodeRef}>0</span>
}

/* ────────── Mini Sparkline SVG ────────── */

function Sparkline({
  data,
  strokeColor,
  fillColor,
  index = 0,
}: {
  data: number[]
  strokeColor: string
  fillColor: string
  index?: number
}) {
  const { linePath, areaPath } = useMemo(() => {
    if (!data || data.length < 2) return { linePath: '', areaPath: '' }

    const width = 120
    const height = 36
    const padding = 2

    const max = Math.max(...data, 1) // au moins 1 pour éviter division par 0
    const min = Math.min(...data, 0)
    const range = max - min || 1

    const points = data.map((val, i) => ({
      x: padding + (i / (data.length - 1)) * (width - padding * 2),
      y: height - padding - ((val - min) / range) * (height - padding * 2),
    }))

    const p0 = points[0]!
    // Smooth curve using cubic bezier
    let line = `M ${p0.x},${p0.y}`
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]!
      const curr = points[i]!
      const cpx1 = prev.x + (curr.x - prev.x) * 0.4
      const cpx2 = prev.x + (curr.x - prev.x) * 0.6
      line += ` C ${cpx1},${prev.y} ${cpx2},${curr.y} ${curr.x},${curr.y}`
    }

    // Area fill: close to bottom
    const pLast = points[points.length - 1]!
    const area = `${line} L ${pLast.x},${height} L ${p0.x},${height} Z`

    return { linePath: line, areaPath: area }
  }, [data])

  if (!data || data.length < 2) return null

  const gradientId = `spark-grad-${index}`

  return (
    <motion.svg
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
      viewBox="0 0 120 36"
      className="w-full h-full"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillColor} stopOpacity="1" />
          <stop offset="100%" stopColor={fillColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Area fill */}
      <motion.path
        d={areaPath}
        fill={`url(#${gradientId})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.7 + index * 0.1 }}
      />
      {/* Line stroke */}
      <motion.path
        d={linePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay: 0.5 + index * 0.1, ease: 'easeOut' }}
      />
    </motion.svg>
  )
}

/* ────────── Main Component ────────── */

export function StatsCard({
  title,
  value,
  delta,
  icon: Icon,
  color,
  loading,
  index = 0,
  onClick,
  sparklineData,
}: StatsCardProps) {
  const colors = colorMap[color]

  if (loading) {
    return (
      <div className="glass-card p-6 relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-11 w-11 rounded-xl" />
        </div>
        <Skeleton className="h-9 w-24 mb-2" />
        <Skeleton className="h-8 w-full mt-3 rounded" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={cn(
        'glass-card p-3 sm:p-6 relative overflow-hidden group',
        onClick ? 'cursor-pointer' : 'cursor-default',
        'ring-1', colors.ring,
        'hover:ring-2 transition-shadow duration-300'
      )}
    >
      {/* Gradient background accent */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-br opacity-60 group-hover:opacity-100 transition-opacity duration-500',
        colors.gradient
      )} />

      {/* Decorative dots pattern */}
      <div className="absolute top-0 right-0 w-24 h-24 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '8px 8px',
        }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2 sm:mb-4">
          <span className="text-text-secondary text-[10px] sm:text-sm font-medium tracking-wide uppercase">
            {title}
          </span>
          <div className={cn(
            'p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl text-white',
            colors.iconBg, colors.iconGlow,
            'group-hover:scale-110 transition-transform duration-300'
          )}>
            <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>

        <div className="flex items-end gap-2 sm:gap-3">
          <span className="text-xl sm:text-3xl font-bold text-text-primary tracking-tight">
            {typeof value === 'number' ? <AnimatedCounter value={value} /> : value}
          </span>

          {delta !== undefined && delta !== 0 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className={cn(
                'flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full mb-1',
                delta > 0
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'bg-red-500/15 text-red-400'
              )}
            >
              {delta > 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{delta > 0 ? '+' : ''}{delta}%</span>
            </motion.div>
          )}
        </div>

        {/* Sparkline chart — real data */}
        {sparklineData && sparklineData.length >= 2 ? (
          <div className="mt-3 h-9 w-full">
            <Sparkline
              data={sparklineData}
              strokeColor={colors.sparkStroke}
              fillColor={colors.sparkFill}
              index={index}
            />
          </div>
        ) : (
          /* Fallback: Animated accent bar */
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.3 + index * 0.1, ease: 'easeOut' }}
            className={cn(
              'h-0.5 mt-4 rounded-full bg-gradient-to-r origin-left',
              colors.bar
            )}
          />
        )}
      </div>
    </motion.div>
  )
}
