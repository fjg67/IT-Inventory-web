// Page Utilisateurs — gestion des techniciens et administrateurs (admin uniquement)

import { useState, useCallback, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Plus,
  Users,
  Pencil,
  KeyRound,
  Shield,
  ShieldCheck,
  UserX,
  UserCheck,
  Eye,
  EyeOff,
} from 'lucide-react'

import type { User, UserFormData, Role } from '@/types'
import { usersService } from '@/services/users.service'
import { useAuth } from '@/hooks/useAuth'

import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// --- Constantes ---

/** Génération d'un identifiant technicien : T + 6 chiffres aléatoires */
function generateTechnicianId(): string {
  const digits = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join('')
  return `T${digits}`
}

// --- Squelette de chargement ---

function TableSkeleton() {
  return (
    <div className="p-4 space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  )
}

// --- Badge du rôle ---

function RoleBadge({ role }: { role: Role }) {
  if (role === 'ADMIN') {
    return (
      <Badge variant="default">
        <ShieldCheck className="h-3 w-3" />
        Admin
      </Badge>
    )
  }
  return (
    <Badge variant="info">
      <Shield className="h-3 w-3" />
      Technicien
    </Badge>
  )
}

// Couleurs d'avatar déterministes par nom
const AVATAR_COLORS = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-violet-500 to-purple-600',
  'from-cyan-500 to-sky-600',
  'from-lime-500 to-green-600',
  'from-fuchsia-500 to-pink-600',
]

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function getAvatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length] ?? AVATAR_COLORS[0]!
}

// --- Composant principal ---

export default function UsersPage() {
  const queryClient = useQueryClient()
  const { isAdmin, user: currentUser } = useAuth()

  // État des modales
  const [createOpen, setCreateOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  // Récupération des utilisateurs
  const { data: usersData, isLoading, isError } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersService.getAll(),
  })

  const users = usersData?.users ?? []

  // --- Mutations ---

  // Création d'un utilisateur
  const createMutation = useMutation({
    mutationFn: (data: UserFormData) => usersService.create(data),
    onSuccess: () => {
      toast.success('Utilisateur créé avec succès')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setCreateOpen(false)
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la création')
    },
  })

  // Modification d'un utilisateur
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UserFormData> }) =>
      usersService.update(id, data),
    onSuccess: () => {
      toast.success('Utilisateur modifié avec succès')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setEditingUser(null)
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification')
    },
  })

  // Réinitialisation du mot de passe
  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      usersService.resetPassword(id, password),
    onSuccess: () => {
      toast.success('Mot de passe réinitialisé')
      setResetPasswordUser(null)
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la réinitialisation')
    },
  })

  // Activation / désactivation
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      usersService.update(id, { isActive } as Partial<UserFormData> & { isActive: boolean }),
    onSuccess: (_data, variables) => {
      toast.success(variables.isActive ? 'Utilisateur activé' : 'Utilisateur désactivé')
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Erreur lors du changement de statut')
    },
  })

  // Formatage de la date
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Jamais'
    try {
      return format(new Date(dateStr), 'dd MMM yyyy HH:mm', { locale: fr })
    } catch {
      return dateStr
    }
  }

  // Protection admin
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-2">
          <Users className="h-12 w-12 text-text-muted mx-auto" />
          <h2 className="text-lg font-semibold text-text-primary">Accès restreint</h2>
          <p className="text-sm text-text-secondary">
            Seuls les administrateurs peuvent gérer les utilisateurs.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <PageHeader
        title="Utilisateurs"
        description="Gestion des techniciens et administrateurs"
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau technicien
          </Button>
        }
      />

      {/* Tableau des utilisateurs */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="glass-card overflow-hidden"
      >
        {isLoading ? (
          <TableSkeleton />
        ) : isError ? (
          <div className="p-8 text-center">
            <p className="text-danger">Erreur lors du chargement des utilisateurs.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['users'] })}
            >
              Réessayer
            </Button>
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Aucun utilisateur"
            description="Créez votre premier technicien pour commencer."
            action={
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nouveau technicien
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead className="w-[110px]">Statut</TableHead>
                <TableHead className="w-[180px] hidden sm:table-cell">Dernière connexion</TableHead>
                <TableHead className="w-[200px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  className={`border-b border-border transition-colors hover:bg-white/[0.03] ${
                    !user.isActive ? 'opacity-50' : ''
                  }`}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${getAvatarColor(user.name)} text-white text-xs font-bold shadow-sm`}>
                        {getInitials(user.name)}
                      </div>
                      <RoleBadge role={user.role} />
                      {user.id === currentUser?.id && (
                        <span className="text-xs text-primary">(vous)</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? 'success' : 'danger'}>
                      {user.isActive ? 'Actif' : 'Inactif'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-text-secondary hidden sm:table-cell">
                    {formatDate(user.lastLoginAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Modifier */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingUser(user)}
                        title="Modifier"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      {/* Réinitialiser mot de passe */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setResetPasswordUser(user)}
                        title="Réinitialiser le mot de passe"
                      >
                        <KeyRound className="h-4 w-4" />
                      </Button>

                      {/* Activer / Désactiver */}
                      {user.id !== currentUser?.id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            toggleActiveMutation.mutate({
                              id: user.id,
                              isActive: !user.isActive,
                            })
                          }
                          disabled={toggleActiveMutation.isPending}
                          title={user.isActive ? 'Désactiver' : 'Activer'}
                        >
                          {user.isActive ? (
                            <UserX className="h-4 w-4 text-danger" />
                          ) : (
                            <UserCheck className="h-4 w-4 text-success" />
                          )}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
          </div>
        )}
      </motion.div>

      {/* Modal création utilisateur */}
      <CreateUserDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={(data) => createMutation.mutate(data)}
        loading={createMutation.isPending}
      />

      {/* Modal modification utilisateur */}
      {editingUser && (
        <EditUserDialog
          open={!!editingUser}
          onOpenChange={(open) => !open && setEditingUser(null)}
          user={editingUser}
          onSubmit={(data) =>
            updateMutation.mutate({ id: editingUser.id, data })
          }
          loading={updateMutation.isPending}
        />
      )}

      {/* Modal réinitialisation mot de passe */}
      {resetPasswordUser && (
        <ResetPasswordDialog
          open={!!resetPasswordUser}
          onOpenChange={(open) => !open && setResetPasswordUser(null)}
          user={resetPasswordUser}
          onSubmit={(password) =>
            resetPasswordMutation.mutate({ id: resetPasswordUser.id, password })
          }
          loading={resetPasswordMutation.isPending}
        />
      )}
    </div>
  )
}

// --- Modal de création d'un utilisateur ---

interface CreateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: UserFormData) => void
  loading: boolean
}

function CreateUserDialog({ open, onOpenChange, onSubmit, loading }: CreateUserDialogProps) {
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<UserFormData>({
    defaultValues: {
      technicianId: '',
      name: '',
      password: '',
      role: 'TECHNICIAN',
    },
  })

  // Générer un identifiant à l'ouverture du modal
  const handleOpen = useCallback(() => {
    if (open) {
      reset({
        technicianId: generateTechnicianId(),
        name: '',
        password: '',
        role: 'TECHNICIAN',
      })
      setShowPassword(false)
    }
  }, [open, reset])

  // Exécuter à chaque ouverture
  useState(() => {
    handleOpen()
  })

  // Régénérer l'identifiant
  const regenerateId = () => {
    setValue('technicianId', generateTechnicianId())
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouveau technicien</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Identifiant technicien */}
          <div className="space-y-2">
            <Label htmlFor="create-tech-id">Identifiant technicien *</Label>
            <div className="flex gap-2">
              <Input
                id="create-tech-id"
                className="font-mono"
                {...register('technicianId', {
                  required: "L'identifiant est requis",
                  pattern: {
                    value: /^T\d{6}$/,
                    message: 'Format : T suivi de 6 chiffres',
                  },
                })}
              />
              <Button type="button" variant="outline" size="sm" onClick={regenerateId}>
                Régénérer
              </Button>
            </div>
            {errors.technicianId && (
              <p className="text-xs text-danger">{errors.technicianId.message}</p>
            )}
          </div>

          {/* Nom */}
          <div className="space-y-2">
            <Label htmlFor="create-name">Nom complet *</Label>
            <Input
              id="create-name"
              placeholder="ex : Jean Dupont"
              {...register('name', {
                required: 'Le nom est requis',
                minLength: { value: 2, message: 'Minimum 2 caractères' },
              })}
            />
            {errors.name && (
              <p className="text-xs text-danger">{errors.name.message}</p>
            )}
          </div>

          {/* Mot de passe */}
          <div className="space-y-2">
            <Label htmlFor="create-password">Mot de passe *</Label>
            <div className="relative">
              <Input
                id="create-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Mot de passe sécurisé"
                {...register('password', {
                  required: 'Le mot de passe est requis',
                  minLength: { value: 6, message: 'Minimum 6 caractères' },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-danger">{errors.password.message}</p>
            )}
          </div>

          {/* Rôle */}
          <div className="space-y-2">
            <Label>Rôle *</Label>
            <Controller
              name="role"
              control={control}
              rules={{ required: 'Le rôle est requis' }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TECHNICIAN">Technicien</SelectItem>
                    <SelectItem value="ADMIN">Administrateur</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" loading={loading}>
              Créer l'utilisateur
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// --- Modal de modification d'un utilisateur ---

interface EditUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User
  onSubmit: (data: Partial<UserFormData>) => void
  loading: boolean
}

function EditUserDialog({ open, onOpenChange, user, onSubmit, loading }: EditUserDialogProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Partial<UserFormData>>({
    defaultValues: {
      name: user.name,
      role: user.role,
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier l'utilisateur</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Identifiant (lecture seule) */}
          <div className="space-y-2">
            <Label>Identifiant technicien</Label>
            <Input value={user.technicianId} disabled className="font-mono opacity-60" />
          </div>

          {/* Nom */}
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nom complet *</Label>
            <Input
              id="edit-name"
              {...register('name', {
                required: 'Le nom est requis',
                minLength: { value: 2, message: 'Minimum 2 caractères' },
              })}
            />
            {errors.name && (
              <p className="text-xs text-danger">{errors.name.message}</p>
            )}
          </div>

          {/* Rôle */}
          <div className="space-y-2">
            <Label>Rôle *</Label>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TECHNICIAN">Technicien</SelectItem>
                    <SelectItem value="ADMIN">Administrateur</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" loading={loading}>
              Enregistrer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// --- Modal de réinitialisation du mot de passe ---

interface ResetPasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User
  onSubmit: (password: string) => void
  loading: boolean
}

function ResetPasswordDialog({ open, onOpenChange, user, onSubmit, loading }: ResetPasswordDialogProps) {
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ password: string }>({
    defaultValues: { password: '' },
  })

  const onFormSubmit = (data: { password: string }) => {
    onSubmit(data.password)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-text-secondary">
          Nouveau mot de passe pour <strong className="text-text-primary">{user.name}</strong>{' '}
          <span className="font-mono text-xs text-text-muted">({user.technicianId})</span>
        </p>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-password">Nouveau mot de passe *</Label>
            <div className="relative">
              <Input
                id="reset-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Nouveau mot de passe sécurisé"
                {...register('password', {
                  required: 'Le mot de passe est requis',
                  minLength: { value: 6, message: 'Minimum 6 caractères' },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-danger">{errors.password.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" loading={loading}>
              <KeyRound className="mr-2 h-4 w-4" />
              Réinitialiser
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
