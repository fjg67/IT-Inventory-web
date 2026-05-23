import type { PCStatus } from '@/types/pc.types'

export const STATUS_STYLES: Record<PCStatus, {
  label: string
  color: string
  subtleBg: string
  borderColor: string
  isPriority: boolean
}> = {
  a_chaud: {
    label: 'A chaud',
    color: '#22C55E',
    subtleBg: 'rgba(34,197,94,0.10)',
    borderColor: 'rgba(34,197,94,0.22)',
    isPriority: false,
  },
  a_reusiner: {
    label: 'A reusiner',
    color: '#F59E0B',
    subtleBg: 'rgba(245,158,11,0.10)',
    borderColor: 'rgba(245,158,11,0.22)',
    isPriority: true,
  },
  en_usinage: {
    label: 'En usinage',
    color: '#F59E0B',
    subtleBg: 'rgba(245,158,11,0.08)',
    borderColor: 'rgba(245,158,11,0.18)',
    isPriority: false,
  },
  disponible: {
    label: 'Disponible',
    color: '#3B82F6',
    subtleBg: 'rgba(59,130,246,0.10)',
    borderColor: 'rgba(59,130,246,0.22)',
    isPriority: false,
  },
  envoye: {
    label: 'Envoye',
    color: '#8B5CF6',
    subtleBg: 'rgba(139,92,246,0.10)',
    borderColor: 'rgba(139,92,246,0.22)',
    isPriority: false,
  },
}
