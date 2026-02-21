// Données structurées pour la page Aide & Support
// Catégories, articles populaires, FAQ et tags de recherche

import {
  Package,
  ArrowLeftRight,
  MapPin,
  Bell,
  Download,
  Shield,
} from 'lucide-react'

// ─── Types ───

export interface HelpCategory {
  id: string
  title: string
  description: string
  icon: typeof Package
  color: string
  colorBg: string
  colorBorder: string
  colorGlow: string
  count: number
}

export interface PopularArticle {
  id: string
  title: string
  categoryId: string
  categoryLabel: string
  readTime: number
}

export type FAQLevel = 'beginner' | 'advanced'

export interface FAQGroup {
  id: string
  label: string
}

export interface FAQItem {
  id: string
  groupId: string
  level: FAQLevel
  question: string
  answer: string
  bullets?: string[]
}

// ─── Tags populaires ───

export const POPULAR_TAGS = [
  'Scanner code-barres',
  'Mouvement de stock',
  'Exporter CSV',
  'Mode hors ligne',
  'Alertes',
  'Transfert',
]

// ─── Catégories ───

export const HELP_CATEGORIES: HelpCategory[] = [
  {
    id: 'articles',
    title: 'Gestion des articles',
    description: 'Créer, modifier, scanner vos équipements',
    icon: Package,
    color: 'text-blue-400',
    colorBg: 'bg-blue-500/10',
    colorBorder: 'border-blue-500/25',
    colorGlow: 'rgba(59,130,246,0.15)',
    count: 12,
  },
  {
    id: 'movements',
    title: 'Mouvements de stock',
    description: 'Entrées, sorties et transferts',
    icon: ArrowLeftRight,
    color: 'text-emerald-400',
    colorBg: 'bg-emerald-500/10',
    colorBorder: 'border-emerald-500/25',
    colorGlow: 'rgba(16,185,129,0.15)',
    count: 8,
  },
  {
    id: 'sites',
    title: 'Sites & emplacements',
    description: 'Gérer vos sites de stockage',
    icon: MapPin,
    color: 'text-amber-400',
    colorBg: 'bg-amber-500/10',
    colorBorder: 'border-amber-500/25',
    colorGlow: 'rgba(245,158,11,0.15)',
    count: 5,
  },
  {
    id: 'alerts',
    title: 'Alertes & notifications',
    description: 'Configurer les seuils et alertes',
    icon: Bell,
    color: 'text-red-400',
    colorBg: 'bg-red-500/10',
    colorBorder: 'border-red-500/25',
    colorGlow: 'rgba(239,68,68,0.15)',
    count: 6,
  },
  {
    id: 'export',
    title: 'Import / Export',
    description: 'Exporter CSV, importer des données',
    icon: Download,
    color: 'text-cyan-400',
    colorBg: 'bg-cyan-500/10',
    colorBorder: 'border-cyan-500/25',
    colorGlow: 'rgba(6,182,212,0.15)',
    count: 4,
  },
  {
    id: 'accounts',
    title: 'Comptes & sécurité',
    description: 'Permissions, rôles, connexion',
    icon: Shield,
    color: 'text-violet-400',
    colorBg: 'bg-violet-500/10',
    colorBorder: 'border-violet-500/25',
    colorGlow: 'rgba(139,92,246,0.15)',
    count: 7,
  },
]

// ─── Articles populaires ───

export const POPULAR_ARTICLES: PopularArticle[] = [
  {
    id: 'pa-1',
    title: 'Comment scanner un code-barres avec la caméra',
    categoryId: 'articles',
    categoryLabel: 'Gestion articles',
    readTime: 3,
  },
  {
    id: 'pa-2',
    title: 'Enregistrer une sortie de stock',
    categoryId: 'movements',
    categoryLabel: 'Mouvements',
    readTime: 2,
  },
  {
    id: 'pa-3',
    title: 'Configurer les alertes de stock bas',
    categoryId: 'alerts',
    categoryLabel: 'Alertes',
    readTime: 4,
  },
  {
    id: 'pa-4',
    title: "Exporter l'inventaire en CSV",
    categoryId: 'export',
    categoryLabel: 'Import/Export',
    readTime: 2,
  },
  {
    id: 'pa-5',
    title: 'Ajouter un nouveau technicien',
    categoryId: 'accounts',
    categoryLabel: 'Comptes',
    readTime: 5,
  },
]

// ─── Groupes FAQ ───

export const FAQ_GROUPS: FAQGroup[] = [
  { id: 'getting-started', label: 'Prise en main' },
  { id: 'stock', label: 'Gestion du stock' },
  { id: 'admin', label: 'Comptes & Administration' },
]

// ─── Questions FAQ ───

export const FAQ_ITEMS: FAQItem[] = [
  // ── Prise en main ──
  {
    id: 'faq-1',
    groupId: 'getting-started',
    level: 'beginner',
    question: 'Comment créer mon premier article dans IT-Inventory ?',
    answer:
      "Accédez à la section Articles depuis le menu principal, puis cliquez sur le bouton + Nouvel article en haut à droite. Remplissez la référence (ou scannez le code-barres), saisissez le nom et sélectionnez la famille. Définissez le site de stockage et le stock initial, puis validez.",
  },
  {
    id: 'faq-2',
    groupId: 'getting-started',
    level: 'beginner',
    question: "L'application fonctionne-t-elle sans connexion internet ?",
    answer:
      "Oui, IT-Inventory dispose d'un mode hors ligne complet. Vos actions (mouvements, créations) sont sauvegardées localement et synchronisées automatiquement dès le retour de la connexion. Un indicateur en haut de l'écran signale le mode hors ligne.",
  },
  {
    id: 'faq-3',
    groupId: 'getting-started',
    level: 'beginner',
    question: 'Comment scanner un code-barres ?',
    answer:
      "Dans le formulaire de création ou de recherche d'article, appuyez sur l'icône Scanner (📷) à côté du champ référence. Pointez la caméra vers le code-barres — la lecture est automatique.",
    bullets: ['EAN13', 'EAN8', 'QR Code', 'Code128', 'Code39'],
  },
  {
    id: 'faq-4',
    groupId: 'getting-started',
    level: 'beginner',
    question: 'Où trouver le journal de mes actions ?',
    answer:
      "Le journal d'audit est accessible depuis le menu principal (réservé aux administrateurs). Il recense l'ensemble des actions réalisées : créations, modifications, mouvements de stock, connexions, etc.",
  },

  // ── Gestion du stock ──
  {
    id: 'faq-5',
    groupId: 'stock',
    level: 'beginner',
    question: "Quelle est la différence entre une sortie et un transfert ?",
    answer:
      "Une sortie diminue le stock d'un article sur un site (consommation définitive). Un transfert déplace un article d'un site vers un autre, le stock total de l'article reste identique mais sa répartition entre sites change.",
  },
  {
    id: 'faq-6',
    groupId: 'stock',
    level: 'advanced',
    question: "Comment configurer une alerte de stock bas ?",
    answer:
      "Dans la fiche article, définissez la valeur 'Seuil d'alerte'. Dès que le stock descend en dessous de ce seuil, l'article apparaît en rouge dans le tableau de bord et dans la section Alertes. Vous pouvez aussi définir un seuil global dans les Paramètres.",
  },
  {
    id: 'faq-7',
    groupId: 'stock',
    level: 'advanced',
    question: 'Peut-on annuler un mouvement de stock ?',
    answer:
      "Les mouvements ne peuvent pas être supprimés (traçabilité obligatoire). Pour corriger une erreur, créez un mouvement opposé (ex : si vous avez fait une sortie par erreur de 5 unités, créez une entrée de 5 unités avec le motif « Correction d'erreur »).",
  },
  {
    id: 'faq-8',
    groupId: 'stock',
    level: 'advanced',
    question: 'Comment effectuer un transfert entre deux sites ?',
    answer:
      "Depuis la page Mouvements, cliquez sur « Nouveau mouvement » et sélectionnez le type Transfert. Choisissez le site source, le site destination, l'article et la quantité. Le stock sera automatiquement décrémenté sur le site source et incrémenté sur le site destination.",
  },

  // ── Comptes & Administration ──
  {
    id: 'faq-9',
    groupId: 'admin',
    level: 'advanced',
    question: 'Quelles sont les différences entre Technicien et Admin ?',
    answer:
      "Les deux rôles ont des permissions différentes :",
    bullets: [
      'Technicien : créer/modifier des articles, enregistrer des mouvements, consulter les alertes, exporter les données',
      'Admin : créer des comptes utilisateurs, supprimer des articles, accéder au journal d\'audit complet, gérer les sites',
    ],
  },
  {
    id: 'faq-10',
    groupId: 'admin',
    level: 'advanced',
    question: "Comment réinitialiser le mot de passe d'un technicien ?",
    answer:
      "Seul un Admin peut réinitialiser les mots de passe. Accédez à Paramètres → Utilisateurs, trouvez le technicien concerné et cliquez sur « Réinitialiser le mot de passe ». Un mot de passe temporaire est généré et doit être changé dès la première connexion.",
  },
  {
    id: 'faq-11',
    groupId: 'admin',
    level: 'beginner',
    question: "Comment exporter l'inventaire complet ?",
    answer:
      "Depuis la page Articles, cliquez sur le bouton Exporter (icône ↓) en haut à droite. Le fichier CSV est téléchargé instantanément avec toutes les colonnes : référence, nom, catégorie, stock par site, seuil d'alerte, etc.",
  },
  {
    id: 'faq-12',
    groupId: 'admin',
    level: 'beginner',
    question: 'Les données sont-elles sauvegardées automatiquement ?',
    answer:
      "Oui, chaque action (création, modification, mouvement) est enregistrée instantanément côté serveur. Les données sont hébergées sur une base de données sécurisée avec sauvegardes automatiques quotidiennes.",
  },
]

// ─── Couleurs catégories pour badges ───

export const CATEGORY_BADGE_COLORS: Record<string, string> = {
  articles: 'bg-blue-500/12 text-blue-400 ring-1 ring-blue-500/20',
  movements: 'bg-emerald-500/12 text-emerald-400 ring-1 ring-emerald-500/20',
  sites: 'bg-amber-500/12 text-amber-400 ring-1 ring-amber-500/20',
  alerts: 'bg-red-500/12 text-red-400 ring-1 ring-red-500/20',
  export: 'bg-cyan-500/12 text-cyan-400 ring-1 ring-cyan-500/20',
  accounts: 'bg-violet-500/12 text-violet-400 ring-1 ring-violet-500/20',
}

// ─── Suggestions de recherche ───

export const SEARCH_SUGGESTIONS = [
  { text: 'Scanner un code-barres', categoryLabel: 'Articles', categoryId: 'articles' },
  { text: 'Créer un mouvement de stock', categoryLabel: 'Mouvements', categoryId: 'movements' },
  { text: 'Configurer les alertes', categoryLabel: 'Alertes', categoryId: 'alerts' },
  { text: 'Exporter en CSV', categoryLabel: 'Export', categoryId: 'export' },
  { text: 'Ajouter un technicien', categoryLabel: 'Comptes', categoryId: 'accounts' },
  { text: 'Gérer les sites', categoryLabel: 'Sites', categoryId: 'sites' },
  { text: 'Différence sortie et transfert', categoryLabel: 'Mouvements', categoryId: 'movements' },
  { text: 'Mode hors ligne', categoryLabel: 'Général', categoryId: 'articles' },
]
