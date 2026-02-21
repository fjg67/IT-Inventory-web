// Sidebar — barre latérale de navigation principale
// Affiche les liens de navigation, le logo et les informations utilisateur

import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Package,
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
import logoImg from '@/assets/logo.png'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useSidebarStore } from '@/stores/sidebarStore'
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
  const { isOpen, alertCount, toggle } = useSidebarStore()

  // Liste des liens de navigation
  const navItems: NavItem[] = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Articles', path: '/articles', icon: Package },
    { label: 'Mouvements', path: '/movements', icon: ArrowLeftRight },
    { label: 'Alertes', path: '/alerts', icon: AlertTriangle, badge: alertCount },
    { label: 'Sites', path: '/sites', icon: Building2, adminOnly: true },
    { label: 'Utilisateurs', path: '/users', icon: Users, adminOnly: true },
    { label: "Journal d'audit", path: '/audit', icon: FileText, adminOnly: true },
    { label: 'Paramètres', path: '/settings', icon: Settings, adminOnly: true },
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
    return location.pathname.startsWith(path)
  }

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        initial={false}
        animate={{ width: isOpen ? 260 : 72 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="fixed left-0 top-0 z-40 h-screen flex flex-col border-r border-border bg-surface/80 backdrop-blur-xl"
      >
        {/* En-tête avec logo */}
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-indigo-500/10 ring-1 ring-white/[0.08] shadow-lg shadow-primary/10 overflow-hidden">
              <img src={logoImg} alt="Logo" className="h-8 w-8 object-contain drop-shadow-md" />
            </div>
            {isOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="whitespace-nowrap text-lg font-bold text-text-primary"
              >
                IT-Inventory
              </motion.span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className="h-8 w-8 shrink-0"
          >
            {isOpen ? (
              <ChevronLeft className="h-4 w-4 text-text-secondary" />
            ) : (
              <ChevronRight className="h-4 w-4 text-text-secondary" />
            )}
          </Button>
        </div>

        <Separator />

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
                    'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-primary/15 text-primary shadow-sm'
                      : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
                  )}
                >
                  {/* Indicateur de lien actif */}
                  {active && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary"
                      transition={{ duration: 0.2 }}
                    />
                  )}

                  <Icon className={cn('h-5 w-5 shrink-0', active ? 'text-primary' : 'text-text-secondary group-hover:text-text-primary')} />

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
                    <Badge variant="danger" className="ml-auto text-[10px] px-1.5 py-0">
                      {item.badge}
                    </Badge>
                  )}

                  {/* Badge compact quand la sidebar est fermée */}
                  {!isOpen && item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-white">
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

        <Separator />

        {/* Section utilisateur en bas */}
        <div className="p-3">
          {isOpen ? (
            <div className="flex items-center gap-3 rounded-lg bg-white/5 p-3">
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback className="bg-primary/20 text-primary text-xs">
                  {user?.name ? getInitials(user.name) : '??'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-text-primary">
                  {user?.name ? getInitials(user.name) : '??'}
                </p>
                <p className="truncate text-xs text-text-secondary">
                  {user?.role === 'ADMIN' ? 'Administrateur' : 'Technicien'}
                </p>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={logout}
                    className="h-8 w-8 shrink-0 text-text-secondary hover:text-danger"
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
                  onClick={logout}
                  className="mx-auto flex h-10 w-10 text-text-secondary hover:text-danger"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Déconnexion</TooltipContent>
            </Tooltip>
          )}
        </div>
      </motion.aside>
    </TooltipProvider>
  )
}
