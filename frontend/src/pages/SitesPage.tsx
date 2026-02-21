// Page Sites — gestion CRUD des sites de stockage (admin uniquement)

import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  Plus,
  MapPin,
  Package,
  Building2,
  ToggleLeft,
  ToggleRight,
  Pencil,
} from 'lucide-react'

import type { Site, SiteFormData } from '@/types'
import { sitesService } from '@/services/sites.service'
import { useAuth } from '@/hooks/useAuth'

import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

// --- Composant principal ---

export default function SitesPage() {
  const queryClient = useQueryClient()
  const { isAdmin } = useAuth()

  // État des modales
  const [formOpen, setFormOpen] = useState(false)
  const [editingSite, setEditingSite] = useState<Site | null>(null)

  // Récupération des sites
  const { data: sitesData, isLoading, isError } = useQuery({
    queryKey: ['sites'],
    queryFn: () => sitesService.getAll(),
  })

  const sites = sitesData?.sites ?? []

  // Formulaire
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SiteFormData>()

  // --- Mutations ---

  // Création d'un site
  const createMutation = useMutation({
    mutationFn: (data: SiteFormData) => sitesService.create(data),
    onSuccess: () => {
      toast.success('Site créé avec succès')
      queryClient.invalidateQueries({ queryKey: ['sites'] })
      handleCloseForm()
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la création')
    },
  })

  // Modification d'un site
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SiteFormData> }) =>
      sitesService.update(id, data),
    onSuccess: () => {
      toast.success('Site modifié avec succès')
      queryClient.invalidateQueries({ queryKey: ['sites'] })
      handleCloseForm()
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification')
    },
  })

  // Activation / désactivation d'un site
  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      sitesService.update(id, { isActive } as Partial<SiteFormData> & { isActive: boolean }),
    onSuccess: (_data, variables) => {
      toast.success(variables.isActive ? 'Site activé' : 'Site désactivé')
      queryClient.invalidateQueries({ queryKey: ['sites'] })
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification')
    },
  })

  // --- Handlers ---

  const handleCloseForm = useCallback(() => {
    setFormOpen(false)
    setEditingSite(null)
    reset({ name: '', address: '' })
  }, [reset])

  const handleOpenCreate = useCallback(() => {
    setEditingSite(null)
    reset({ name: '', address: '' })
    setFormOpen(true)
  }, [reset])

  const handleOpenEdit = useCallback(
    (site: Site) => {
      setEditingSite(site)
      reset({ name: site.name, address: site.address ?? '' })
      setFormOpen(true)
    },
    [reset]
  )

  const handleToggle = useCallback(
    (site: Site) => {
      toggleMutation.mutate({ id: site.id, isActive: !site.isActive })
    },
    [toggleMutation]
  )

  const onSubmit = (data: SiteFormData) => {
    if (editingSite) {
      updateMutation.mutate({ id: editingSite.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  // Protection admin
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-2">
          <Building2 className="h-12 w-12 text-text-muted mx-auto" />
          <h2 className="text-lg font-semibold text-text-primary">Accès restreint</h2>
          <p className="text-sm text-text-secondary">
            Seuls les administrateurs peuvent gérer les sites.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <PageHeader
        title="Sites de stockage"
        description="Gérez les emplacements physiques de votre inventaire"
        action={
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau site
          </Button>
        }
      />

      {/* Grille de sites */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="glass-card p-8 text-center">
          <p className="text-danger">Erreur lors du chargement des sites.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['sites'] })}
          >
            Réessayer
          </Button>
        </div>
      ) : sites.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
        >
          <EmptyState
            icon={Building2}
            title="Aucun site configuré"
            description="Créez votre premier site de stockage pour commencer."
            action={
              <Button onClick={handleOpenCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Nouveau site
              </Button>
            }
          />
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {sites.map((site, index) => (
              <motion.div
                key={site.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`glass-card-hover p-5 space-y-4 ${
                  !site.isActive ? 'opacity-60' : ''
                }`}
              >
                {/* En-tête du site */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-text-primary truncate">{site.name}</h3>
                      {site.address && (
                        <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{site.address}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant={site.isActive ? 'success' : 'danger'}>
                    {site.isActive ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>

                {/* Statistiques du site */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-text-secondary">
                    <Package className="h-4 w-4 text-text-muted" />
                    <span className="tabular-nums">{site._count?.stocks ?? 0}</span>
                    <span>article{(site._count?.stocks ?? 0) > 1 ? 's' : ''}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEdit(site)}
                    className="flex-1"
                  >
                    <Pencil className="mr-2 h-3.5 w-3.5" />
                    Modifier
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggle(site)}
                    disabled={toggleMutation.isPending}
                    className="flex-1"
                  >
                    {site.isActive ? (
                      <>
                        <ToggleRight className="mr-2 h-3.5 w-3.5 text-success" />
                        Désactiver
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="mr-2 h-3.5 w-3.5 text-text-muted" />
                        Activer
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal de création / modification */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingSite ? 'Modifier le site' : 'Nouveau site de stockage'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Nom du site */}
            <div className="space-y-2">
              <Label htmlFor="site-name">Nom du site *</Label>
              <Input
                id="site-name"
                placeholder="ex : Entrepôt principal"
                {...register('name', {
                  required: 'Le nom est requis',
                  minLength: { value: 2, message: 'Minimum 2 caractères' },
                })}
              />
              {errors.name && (
                <p className="text-xs text-danger">{errors.name.message}</p>
              )}
            </div>

            {/* Adresse */}
            <div className="space-y-2">
              <Label htmlFor="site-address">Adresse</Label>
              <Input
                id="site-address"
                placeholder="ex : 12 rue de l'Industrie, 75001 Paris"
                {...register('address')}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseForm} disabled={isSaving}>
                Annuler
              </Button>
              <Button type="submit" loading={isSaving}>
                {editingSite ? 'Enregistrer' : 'Créer le site'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
