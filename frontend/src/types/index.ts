// Types principaux de l'application IT-Inventory

// === Enums ===

export type Role = 'ADMIN' | 'TECHNICIAN'
export type MovementType = 'ENTRY' | 'EXIT' | 'ADJUSTMENT' | 'TRANSFER'
export type StockStatus = 'ok' | 'low' | 'out'

// === Modèles ===

export interface User {
  id: string
  technicianId: string
  name: string
  role: Role
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
  updatedAt?: string
  _count?: {
    movements: number
  }
}

export interface Site {
  id: string
  name: string
  address: string | null
  isActive: boolean
  createdAt: string
  updatedAt?: string
  _count?: {
    stocks: number
  }
  lastActivity?: string | null
}

export interface Article {
  id: string
  reference: string
  name: string
  description: string | null
  category: string
  codeFamille: string | null
  articleType: string | null
  sousType: string | null
  emplacement: string | null
  brand: string | null
  barcode: string | null
  imageUrl: string | null
  unit: string
  minStock: number
  isArchived: boolean
  createdAt: string
  updatedAt: string
  stocks?: ArticleStock[]
  totalStock?: number
  status?: StockStatus
}

export interface ArticleStock {
  id: string
  articleId: string
  siteId: string
  quantity: number
  article?: Article
  site?: Site
}

export interface StockMovement {
  id: string
  type: MovementType
  quantity: number
  reason: string | null
  articleId: string
  fromSiteId: string | null
  toSiteId: string | null
  userId: string
  createdAt: string
  article?: Article
  user?: User
  fromSite?: Site
  toSite?: Site
}

export interface AuditLog {
  id: string
  action: string
  entityType: string
  entityId: string
  oldValue: Record<string, unknown> | null
  newValue: Record<string, unknown> | null
  userId: string
  articleId: string | null
  createdAt: string
  user?: User
}

// === Réponses API ===

export interface ApiResponse<T> {
  success: boolean
  message?: string
  errors?: Record<string, string[]>
  data?: T
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  total: number
  page: number
  totalPages: number
}

export interface LoginResponse {
  success: boolean
  user: User
  accessToken: string
}

export interface DashboardStats {
  totalArticles: number
  outOfStock: number
  lowStock: number
  todayMovements: number
  totalArticlesLastMonth: number
  sparklines?: {
    totalArticles: number[]
    outOfStock: number[]
    lowStock: number[]
    movements: number[]
  }
}

export interface MovementChartData {
  date: string
  entries: number
  exits: number
}

export interface TopArticleData {
  name: string
  reference: string
  count: number
}

export interface CategoryData {
  category: string
  count: number
}

export interface AlertItem {
  id: string
  articleId: string
  siteId: string
  quantity: number
  article: Article
  site: Site
  deficit: number
}

// === Formulaires ===

export interface LoginFormData {
  technicianId: string
  password: string
}

export interface ArticleFormData {
  reference: string
  name: string
  description?: string
  category: string
  codeFamille?: string
  articleType?: string
  sousType?: string
  emplacement?: string
  brand?: string
  barcode?: string
  imageUrl?: string
  unit: string
  minStock: number
  siteId?: string
  initialStock?: number
}

export interface MovementFormData {
  type: MovementType
  articleId: string
  quantity: number
  siteId?: string
  fromSiteId?: string
  toSiteId?: string
  reason?: string
}

export interface UserFormData {
  technicianId: string
  name: string
  password: string
  role: Role
}

export interface SiteFormData {
  name: string
  address?: string
}

// === Filtres ===

export interface ArticleFilters {
  search?: string
  category?: string
  site?: string
  status?: StockStatus
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface MovementFilters {
  type?: MovementType
  userId?: string
  siteId?: string
  from?: string
  to?: string
  page?: number
  limit?: number
}

export interface AuditFilters {
  userId?: string
  action?: string
  from?: string
  to?: string
  page?: number
  limit?: number
}
