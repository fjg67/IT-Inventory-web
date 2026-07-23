type ArticleLike = {
  reference: string
  name: string
  description: string | null
  category: string
  articleType: string | null
  sousType?: string | null
  brand?: string | null
  emplacement?: string | null
  createdAt?: Date
  updatedAt?: Date
  stocks?: Array<{ quantity: number; site: { name: string } }>
}

type PCRecordLike = {
  hostname: string
  asset: string
  model: string
  category: string
  status: string
  site: string
  sentTo: string | null
  sentRecipient: string | null
  notes: string | null
  createdAt?: Date
  updatedAt?: Date
}

const normalize = (value: string | null | undefined): string =>
  (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

const getArticleNeedle = (article: ArticleLike): string =>
  [
    article.category,
    article.articleType,
    article.sousType,
    article.name,
    article.reference,
    article.description,
  ]
    .map((value) => normalize(value))
    .join(' ')

export const isPcArticle = (article: ArticleLike): boolean => {
  const haystack = getArticleNeedle(article)

  // Exclure les accessoires qui pourraient contenir des mots-clés de PC
  if (haystack.includes('alimentation') || haystack.includes('chargeur')) {
    return false
  }

  return (
    haystack.includes('pc portable') ||
    haystack.includes('portable siege') ||
    haystack.includes('portable agence') ||
    haystack.includes('mini uc') ||
    article.articleType?.toUpperCase() === 'PC'
  )
}

export const isTabletArticle = (article: ArticleLike): boolean => {
  const haystack = getArticleNeedle(article)
  return haystack.includes('tablette')
}

const parseStatus = (description: string | null | undefined): string => {
  const normalized = normalize(description)

  if (normalized.includes('a chaud')) {
    return 'a_chaud'
  }

  if (normalized.includes('en usinage')) {
    return 'en_usinage'
  }

  if (normalized.includes('a reusiner')) {
    return 'a_reusiner'
  }

  if (normalized.includes('envoye')) {
    return 'envoye'
  }

  return 'disponible'
}

const parseCategory = (article: ArticleLike): string => {
  const haystack = getArticleNeedle(article)
  return haystack.includes('siege') ? 'portable_siege' : 'portable_agence'
}

const getPrimarySite = (article: ArticleLike): string => {
  const stockedSite = article.stocks?.find((stock) => stock.quantity > 0)?.site.name
  return stockedSite || article.emplacement || 'Non renseigne'
}

const getModel = (article: ArticleLike): string => {
  const parts = [article.brand, article.sousType, article.category]
    .map((value) => (value ?? '').trim())
    .filter(Boolean)

  return parts.join(' - ')
}

const parseAsset = (article: ArticleLike): string => {
  const match = article.description?.match(/asset\s*:\s*([A-Z0-9-]+)/i)
  return match?.[1] ?? article.reference
}

export const toPCRecordFromArticle = (article: ArticleLike): PCRecordLike => ({
  hostname: article.name || article.reference,
  asset: parseAsset(article),
  model: getModel(article),
  category: parseCategory(article),
  status: parseStatus(article.description),
  site: getPrimarySite(article),
  sentTo: null,
  sentRecipient: null,
  notes: article.description || null,
  createdAt: article.createdAt,
  updatedAt: article.updatedAt,
})