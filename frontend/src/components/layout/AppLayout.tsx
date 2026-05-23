import type { ReactNode } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid-bg flex min-h-screen bg-bg-primary">
      <Sidebar />
      <main className="min-w-0 flex-1 overflow-auto">{children}</main>
    </div>
  )
}
