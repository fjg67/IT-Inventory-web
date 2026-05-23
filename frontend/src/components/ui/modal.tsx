import type { ReactNode } from 'react'

interface ModalProps {
  title: string
  subtitle?: string
  accentColor?: string
  onClose: () => void
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_CLASSES: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
}

export function Modal({ title, subtitle, accentColor, onClose, children, size = 'md' }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
      <div className={`w-full overflow-hidden rounded-2xl border border-[var(--border-card)] bg-bg-card shadow-card ${SIZE_CLASSES[size]}`}>
        <div
          className="relative border-b border-[var(--border-subtle)] px-6 py-5"
          style={accentColor ? { background: `linear-gradient(to bottom, ${accentColor}12, transparent)` } : undefined}
        >
          {accentColor && (
            <div
              className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-full"
              style={{ background: `radial-gradient(circle, ${accentColor}10, transparent)`, transform: 'translate(30%, -30%)' }}
            />
          )}
          <div className="relative flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">{title}</h2>
              {subtitle && <p className="mt-1 text-sm text-[var(--text-muted)]">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-bg-elevated text-[var(--text-muted)] transition-colors hover:bg-bg-hover hover:text-[var(--text-primary)]"
              type="button"
            >
              X
            </button>
          </div>
        </div>

        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
