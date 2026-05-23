import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { parcPcService } from '@/services/parcPc.service'
import type { PCFormData, PCStatusFormData } from '@/types/pc.types'

const QUERY_KEY = ['parc-pc']

export function useParcPC() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => parcPcService.getAll(),
  })

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: QUERY_KEY })
  }

  const createMutation = useMutation({
    mutationFn: (data: PCFormData) => parcPcService.create(data),
    onSuccess: async () => {
      toast.success('PC ajoute au parc')
      await invalidate()
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Creation impossible')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PCFormData> }) => parcPcService.update(id, data),
    onSuccess: async () => {
      toast.success('PC mis a jour')
      await invalidate()
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Mise a jour impossible')
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: PCStatusFormData }) => parcPcService.updateStatus(id, data),
    onSuccess: async () => {
      toast.success('Statut mis a jour')
      await invalidate()
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Changement de statut impossible')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => parcPcService.remove(id),
    onSuccess: async () => {
      toast.success('PC supprime du parc')
      await invalidate()
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Suppression impossible')
    },
  })

  return {
    pcs: query.data?.pcs ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    refetch: query.refetch,
    createPC: createMutation.mutateAsync,
    updatePC: updateMutation.mutateAsync,
    updatePCStatus: statusMutation.mutateAsync,
    deletePC: deleteMutation.mutateAsync,
    isSaving:
      createMutation.isPending ||
      updateMutation.isPending ||
      statusMutation.isPending ||
      deleteMutation.isPending,
  }
}