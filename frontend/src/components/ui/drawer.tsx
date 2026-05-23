import type { ReactNode } from 'react'

interface DrawerProps {
  title: string
  onClose: () => void
  children: ReactNode
  open: boolean
}

export function Drawer({ title, onClose, children, open }: DrawerProps) {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-300 ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
      />
      <div
        className={`fixed right-0 top-0 z-50 flex h-full w-[480px] max-w-[90vw] flex-col border-l border-[var(--border-subtle)] bg-bg-card transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-6 py-4">
          <h2 className="text-base font-bold text-[var(--text-primary)]">{title}</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-bg-elevated text-[var(--text-muted)] transition-colors hover:bg-bg-hover"
            type="button"
          >
            X
          </button>
        </div>
        <div className="flex-1 space-y-5 overflow-y-auto p-6">{children}</div>
      </div>
    </>
  )
}
