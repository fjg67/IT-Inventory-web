// TopBar — barre supérieure avec recherche, notifications et menu utilisateur

import { useLocation, useNavigate } from 'react-router-dom'
import {
  Menu,
  Search,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useSidebarStore } from '@/stores/sidebarStore'
import { ThemeButton } from '@/components/theme/ThemeButton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Correspondance entre les routes et les titres de page
const routeTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/articles': 'Articles',
  '/movements': 'Mouvements',
  '/alerts': 'Alertes',
  '/sites': 'Sites',
  '/users': 'Utilisateurs',
  '/audit': "Journal d'audit",
  '/settings': 'Paramètres',
}

export function TopBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { toggle, alertCount, setMobileOpen } = useSidebarStore()

  // Déterminer le titre de la page actuelle
  const getPageTitle = () => {
    // Vérifier les correspondances exactes
    if (routeTitles[location.pathname]) {
      return routeTitles[location.pathname]
    }
    // Vérifier les correspondances partielles (sous-pages)
    const matchingRoute = Object.keys(routeTitles).find(
      (route) => route !== '/' && location.pathname.startsWith(route)
    )
    return matchingRoute ? routeTitles[matchingRoute] : 'Page'
  }

  // Construire le fil d'Ariane
  const getBreadcrumbs = () => {
    const segments = location.pathname.split('/').filter(Boolean)
    if (segments.length === 0) return []
    return segments.map((segment) => {
      const title = routeTitles[`/${segment}`]
      return title || segment.charAt(0).toUpperCase() + segment.slice(1)
    })
  }

  // Extraire les initiales de l'utilisateur
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center gap-2 sm:gap-4 border-b border-border bg-surface/60 backdrop-blur-xl px-3 sm:px-6 transition-colors duration-300">
      {/* Gauche : bouton toggle + fil d'Ariane */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        {/* Bouton menu mobile */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(true)}
          className="h-9 w-9 text-text-secondary hover:text-text-primary lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
        {/* Bouton toggle desktop */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          className="h-9 w-9 text-text-secondary hover:text-text-primary hidden lg:flex"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Fil d'Ariane — masqué sur mobile */}
        <nav className="hidden sm:flex items-center gap-1.5 text-sm min-w-0">
          <span className="text-text-muted">Accueil</span>
          {breadcrumbs.map((crumb, index) => (
            <span key={index} className="flex items-center gap-1.5">
              <ChevronRight className="h-3.5 w-3.5 text-text-muted" />
              <span
                className={cn(
                  index === breadcrumbs.length - 1
                    ? 'font-medium text-text-primary'
                    : 'text-text-muted'
                )}
              >
                {crumb}
              </span>
            </span>
          ))}
          {breadcrumbs.length === 0 && (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-text-muted" />
              <span className="font-medium text-text-primary">
                {getPageTitle()}
              </span>
            </>
          )}
        </nav>

        {/* Titre de page sur mobile */}
        <span className="sm:hidden font-medium text-text-primary text-sm truncate">
          {getPageTitle()}
        </span>
      </div>

      {/* Droite : actions */}
      <div className="ml-auto flex items-center gap-2">
        {/* Bouton de recherche */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-text-secondary hover:text-text-primary"
          onClick={() => navigate('/articles?focus=search')}
        >
          <Search className="h-4 w-4" />
        </Button>

        {/* Toggle thème clair/sombre */}
        <ThemeButton />

        {/* Bouton notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 text-text-secondary hover:text-text-primary"
          onClick={() => navigate('/alerts')}
        >
          <Bell className="h-4 w-4" />
          {alertCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-danger" />
            </span>
          )}
        </Button>

        {/* Menu utilisateur */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 px-2 hover:bg-[var(--sidebar-hover)]"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/20 text-primary text-xs">
                  {user?.name ? getInitials(user.name) : '??'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium text-text-primary">
                  {user?.name ? getInitials(user.name) : '??'}
                </p>
                <p className="text-xs text-text-secondary">
                  {user?.role === 'ADMIN' ? 'Administrateur' : 'Technicien'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigate('/settings')}
              className="cursor-pointer"
            >
              <Settings className="mr-2 h-4 w-4" />
              Paramètres
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="cursor-pointer text-danger focus:text-danger"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
