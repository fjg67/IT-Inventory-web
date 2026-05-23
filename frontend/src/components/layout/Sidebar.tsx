// Sidebar — barre latérale de navigation principale
// Affiche les liens de navigation, le logo et les informations utilisateur

import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Package,
  Monitor,
  ArrowLeftRight,
  AlertTriangle,
  Building2,
  Users,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useSidebarStore } from '@/stores/sidebarStore'
import { LogoutConfirmDialog } from '@/components/shared/LogoutConfirmDialog'
import { WorkspaceIndicator } from '@/components/layout/WorkspaceIndicator'
import { LogoIcon } from '@/components/ui/LogoIcon'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// Définition des liens de navigation
interface NavItem {
  label: string
  path: string
  icon: React.ElementType
  adminOnly?: boolean
  badge?: number
}

export function Sidebar() {
  const location = useLocation()
  const { user, isAdmin, logout } = useAuth()
  const { isOpen, isMobileOpen, alertCount, toggle, setMobileOpen } = useSidebarStore()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  // Liste des liens de navigation
  const navItems: NavItem[] = [
    { label: 'Accueil', path: '/', icon: LayoutDashboard },
    { label: 'Articles', path: '/articles', icon: Package },
    { label: 'Parc PC', path: '/parc-pc', icon: Monitor },
    { label: 'Mouvements', path: '/movements', icon: ArrowLeftRight },
    { label: 'Alertes', path: '/alerts', icon: AlertTriangle, badge: alertCount },
    { label: 'Sites', path: '/sites', icon: Building2, adminOnly: true },
    { label: 'Utilisateurs', path: '/users', icon: Users, adminOnly: true },
    { label: "Journal d'audit", path: '/audit', icon: FileText, adminOnly: true },
    { label: 'Paramètres', path: '/parametres', icon: Settings, adminOnly: true },
  ]

  // Filtrer les liens selon le rôle
  const filteredNavItems = navItems.filter(
    (item) => !item.adminOnly || isAdmin
  )

  // Extraire les initiales de l'utilisateur
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Vérifier si un lien est actif
  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    if (path === '/parametres') return location.pathname.startsWith('/parametres') || location.pathname.startsWith('/settings')
    return location.pathname.startsWith(path)
  }

  return (
    <TooltipProvider delayDuration={0}>
      {/* Desktop sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isOpen ? 220 : 72 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-[var(--border-subtle)] bg-bg-primary lg:flex"
      >
        {/* En-tÃªte avec logo */}
        <div className="flex h-16 items-center justify-between border-b border-[var(--border-subtle)] px-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-[var(--border-accent)] bg-[linear-gradient(155deg,#1B8A3E,#0D5C26)]">
              <LogoIcon size={36} variant="sidebar" className="drop-shadow-md" />
            </div>
            {isOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="whitespace-nowrap text-base font-bold text-[var(--text-primary)]"
              >
                IT-Inventory
              </motion.span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className="h-8 w-8 shrink-0 text-[var(--text-muted)] hover:bg-bg-elevated hover:text-[var(--text-primary)]"
          >
            {isOpen ? (
                <ChevronLeft className="h-4 w-4" />
            ) : (
                <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Indicateur de workspace */}
        <div className="px-3 pt-3 pb-1">
          <WorkspaceIndicator isOpen={isOpen} />
        </div>

        {/* Liens de navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="flex flex-col gap-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)

              const linkContent = (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-150',
                    active
                      ? 'border-[var(--green-border)] bg-[var(--green-subtle)] text-brand-light'
                      : 'border-transparent text-[var(--text-muted)] hover:bg-bg-elevated hover:text-[var(--text-primary)]'
                  )}
                >
                  {/* Indicateur de lien actif */}
                  {active && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-1 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-brand-light"
                      transition={{ duration: 0.2 }}
                    />
                  )}

                  <Icon className={cn('h-5 w-5 shrink-0', active ? 'text-brand-light' : 'text-[var(--text-muted)] group-hover:text-[var(--text-primary)]')} />

                  {isOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="truncate"
                    >
                      {item.label}
                    </motion.span>
                  )}

                  {/* Badge pour les alertes */}
                  {isOpen && item.badge !== undefined && item.badge > 0 && (
                    <Badge variant="danger" className="ml-auto border-[var(--danger-border)] text-[10px] px-1.5 py-0">
                      {item.badge}
                    </Badge>
                  )}

                  {/* Badge compact quand la sidebar est fermée */}
                  {!isOpen && item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--danger)] text-[9px] font-bold text-white">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </NavLink>
              )

              // Afficher un tooltip quand la sidebar est fermée
              if (!isOpen) {
                return (
                  <Tooltip key={item.path}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {item.label}
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="ml-2 text-danger">({item.badge})</span>
                      )}
                    </TooltipContent>
                  </Tooltip>
                )
              }

              return linkContent
            })}
          </nav>
        </ScrollArea>

        <Separator className="bg-[var(--border-subtle)]" />

        {/* Section utilisateur en bas */}
        <div className="p-3">
          {isOpen ? (
            <div className="flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-bg-elevated/80 p-3">
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback className="bg-[var(--green-subtle)] text-brand-light text-xs">
                  {user?.name ? getInitials(user.name) : '??'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                  {user?.name ? getInitials(user.name) : '??'}
                </p>
                <p className="truncate text-xs text-[var(--text-muted)]">
                  {user?.role === 'ADMIN' ? 'Superviseur' : 'Technicien'}
                </p>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowLogoutDialog(true)}
                    className="h-8 w-8 shrink-0 text-[var(--text-muted)] hover:text-[var(--danger)]"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Déconnexion</TooltipContent>
              </Tooltip>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowLogoutDialog(true)}
                  className="mx-auto flex h-10 w-10 text-[var(--text-muted)] hover:text-[var(--danger)]"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Déconnexion</TooltipContent>
            </Tooltip>
          )}
        </div>
      </motion.aside>

      {/* Mobile sidebar (drawer) */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: isMobileOpen ? 0 : -280 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="fixed left-0 top-0 z-50 flex h-screen w-[220px] flex-col border-r border-[var(--border-subtle)] bg-bg-primary lg:hidden"
      >
        {/* En-tÃªte avec logo */}
        <div className="flex h-16 items-center justify-between border-b border-[var(--border-subtle)] px-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-[var(--border-accent)] bg-[linear-gradient(155deg,#1B8A3E,#0D5C26)]">
              <LogoIcon size={36} variant="sidebar" className="drop-shadow-md" />
            </div>
            <span className="whitespace-nowrap text-base font-bold text-[var(--text-primary)]">
              IT-Inventory
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
            className="h-8 w-8 shrink-0 text-[var(--text-muted)] hover:bg-bg-elevated hover:text-[var(--text-primary)]"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Indicateur de workspace mobile */}
        <div className="px-3 pt-3 pb-1">
          <WorkspaceIndicator isOpen={true} />
        </div>

        {/* Liens de navigation mobile */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="flex flex-col gap-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-150',
                    active
                      ? 'border-[var(--green-border)] bg-[var(--green-subtle)] text-brand-light'
                      : 'border-transparent text-[var(--text-muted)] hover:bg-bg-elevated hover:text-[var(--text-primary)]'
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId="sidebar-mobile-active"
                      className="absolute left-1 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-brand-light"
                      transition={{ duration: 0.2 }}
                    />
                  )}
                  <Icon className={cn('h-5 w-5 shrink-0', active ? 'text-brand-light' : 'text-[var(--text-muted)] group-hover:text-[var(--text-primary)]')} />
                  <span className="truncate">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <Badge variant="danger" className="ml-auto border-[var(--danger-border)] text-[10px] px-1.5 py-0">
                      {item.badge}
                    </Badge>
                  )}
                </NavLink>
              )
            })}
          </nav>
        </ScrollArea>

        <Separator className="bg-[var(--border-subtle)]" />

        {/* Section utilisateur mobile */}
        <div className="p-3">
          <div className="flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-bg-elevated/80 p-3">
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarFallback className="bg-[var(--green-subtle)] text-brand-light text-xs">
                {user?.name ? getInitials(user.name) : '??'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                {user?.name ? getInitials(user.name) : '??'}
              </p>
              <p className="truncate text-xs text-[var(--text-muted)]">
                {user?.role === 'ADMIN' ? 'Superviseur' : 'Technicien'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowLogoutDialog(true)}
              className="h-8 w-8 shrink-0 text-[var(--text-muted)] hover:text-[var(--danger)]"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.aside>

      {/* Modale de confirmation de déconnexion */}
      <LogoutConfirmDialog
        open={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={logout}
        userName={user?.name}
      />
    </TooltipProvider>
  )
}
