export type PCStatus = 'a_chaud' | 'a_reusiner' | 'en_usinage' | 'disponible' | 'envoye'
export type PCCategory = 'portable_siege' | 'portable_agence'

export interface PCRecord {
  id: string
  hostname: string
  asset: string
  model: string
  category: PCCategory
  status: PCStatus
  site: string
  sentTo: string | null
  sentRecipient: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface PCFormData {
  hostname: string
  asset: string
  model: string
  category: PCCategory
  status?: PCStatus
  site: string
  sentTo?: string
  sentRecipient?: string
  notes?: string
}

export interface PCStatusFormData {
  status: PCStatus
  sentTo?: string
  sentRecipient?: string
  notes?: string
}

export interface ParcPCResponse {
  success: boolean
  pcs: PCRecord[]
}

export interface PCResponse {
  success: boolean
  pc: PCRecord
}

export const PC_STATUS_LABELS: Record<PCStatus, string> = {
  a_chaud: 'A chaud',
  a_reusiner: 'A reusiner',
  en_usinage: 'En usinage',
  disponible: 'Disponible',
  envoye: 'Envoye',
}

export const PC_CATEGORY_LABELS: Record<PCCategory, string> = {
  portable_siege: 'Portable siege',
  portable_agence: 'Portable agence',
}

export const PC_STATUSES: PCStatus[] = ['a_chaud', 'a_reusiner', 'en_usinage', 'disponible', 'envoye']
export const PC_CATEGORIES: PCCategory[] = ['portable_siege', 'portable_agence']