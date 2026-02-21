// Données structurées — Conditions Générales d'Utilisation (CGU)
// 8 chapitres avec titre, icône, couleur, contenu, callouts

import {
  CheckCircle,
  Monitor,
  Users,
  Shield,
  Copyright,
  AlertOctagon,
  RefreshCw,
  MessageSquare,
} from 'lucide-react'

// ─── Types ───

export interface TermsCalloutData {
  type: 'info' | 'warning'
  text: string
}

export interface TermsChapterData {
  id: string
  number: string
  articleLabel: string
  title: string
  icon: typeof CheckCircle
  color: string
  colorBg: string
  colorBorder: string
  paragraphs: string[]
  bullets?: string[]
  callout?: TermsCalloutData
}

// ─── Chapitres CGU ───

export const TERMS_CHAPTERS: TermsChapterData[] = [
  {
    id: 'chapter-1',
    number: '01',
    articleLabel: 'Article 1',
    title: 'Acceptation des conditions',
    icon: CheckCircle,
    color: 'text-emerald-400',
    colorBg: 'bg-emerald-500/[0.08]',
    colorBorder: 'border-emerald-500/20',
    paragraphs: [
      "En utilisant IT-Inventory, vous acceptez les présentes Conditions d'utilisation. Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser l'application.",
      "Ces conditions s'appliquent à tous les utilisateurs (techniciens et administrateurs) ayant accès à l'application IT-Inventory au sein de votre organisation.",
    ],
    callout: {
      type: 'info',
      text: "L'accès à IT-Inventory est restreint aux techniciens IT expressément autorisés par un administrateur de votre organisation.",
    },
  },
  {
    id: 'chapter-2',
    number: '02',
    articleLabel: 'Article 2',
    title: 'Description du service',
    icon: Monitor,
    color: 'text-blue-400',
    colorBg: 'bg-blue-500/[0.08]',
    colorBorder: 'border-blue-500/20',
    paragraphs: [
      "IT-Inventory est une application de gestion de stock informatique permettant :",
      "L'application est fournie en version 1.0.0 et peut évoluer sans préavis.",
    ],
    bullets: [
      'La gestion centralisée des articles et équipements informatiques',
      'Le suivi des mouvements de stock (entrées, sorties, transferts)',
      'La gestion multi-sites avec synchronisation en temps réel',
      "L'export de données au format CSV et Excel",
      'La gestion des alertes de stock bas',
    ],
  },
  {
    id: 'chapter-3',
    number: '03',
    articleLabel: 'Article 3',
    title: 'Comptes utilisateurs',
    icon: Users,
    color: 'text-indigo-400',
    colorBg: 'bg-indigo-500/[0.08]',
    colorBorder: 'border-indigo-500/20',
    paragraphs: [
      "Chaque technicien dispose d'un identifiant unique (format T000000) et d'un mot de passe personnel. Vous êtes responsable de la confidentialité de vos identifiants de connexion.",
    ],
    bullets: [
      'Ne partagez jamais vos identifiants avec un tiers',
      'Signalez immédiatement toute utilisation non autorisée à votre administrateur',
      'Utilisez un mot de passe fort (minimum 8 caractères)',
    ],
    callout: {
      type: 'warning',
      text: "La compromission d'identifiants doit être signalée immédiatement à l'administrateur système pour désactivation du compte.",
    },
  },
  {
    id: 'chapter-4',
    number: '04',
    articleLabel: 'Article 4',
    title: 'Utilisation acceptable',
    icon: Shield,
    color: 'text-amber-400',
    colorBg: 'bg-amber-500/[0.08]',
    colorBorder: 'border-amber-500/20',
    paragraphs: [
      "IT-Inventory est réservé à un usage professionnel dans le cadre de la gestion de stock IT de votre organisation. Il est strictement interdit de :",
    ],
    bullets: [
      'Utiliser l\'application à des fins personnelles non autorisées',
      'Tenter de contourner les mécanismes de sécurité',
      "Accéder aux données d'autres utilisateurs sans autorisation",
      'Modifier, copier ou redistribuer le code source sans accord écrit',
    ],
  },
  {
    id: 'chapter-5',
    number: '05',
    articleLabel: 'Article 5',
    title: 'Propriété intellectuelle',
    icon: Copyright,
    color: 'text-violet-400',
    colorBg: 'bg-violet-500/[0.08]',
    colorBorder: 'border-violet-500/20',
    paragraphs: [
      'IT-Inventory est distribué sous licence MIT.',
      'Copyright © 2026 Florian JOVE GARCIA — Tous droits réservés.',
      "La licence MIT vous autorise à utiliser, copier, modifier et distribuer l'application, sous réserve de conserver la notice de copyright originale.",
    ],
    callout: {
      type: 'info',
      text: 'Code source disponible sur demande auprès du développeur.',
    },
  },
  {
    id: 'chapter-6',
    number: '06',
    articleLabel: 'Article 6',
    title: 'Limitation de responsabilité',
    icon: AlertOctagon,
    color: 'text-red-400',
    colorBg: 'bg-red-500/[0.08]',
    colorBorder: 'border-red-500/20',
    paragraphs: [
      "IT-Inventory est fourni « en l'état » sans garantie d'aucune sorte. Le développeur ne saurait être tenu responsable de :",
    ],
    bullets: [
      "Toute perte de données résultant d'une utilisation incorrecte",
      "Les interruptions de service liées à des problèmes d'infrastructure",
      "Les décisions métier prises sur la base des données de l'application",
    ],
    callout: {
      type: 'warning',
      text: 'Effectuez des sauvegardes régulières de vos données.',
    },
  },
  {
    id: 'chapter-7',
    number: '07',
    articleLabel: 'Article 7',
    title: 'Modifications des conditions',
    icon: RefreshCw,
    color: 'text-cyan-400',
    colorBg: 'bg-cyan-500/[0.08]',
    colorBorder: 'border-cyan-500/20',
    paragraphs: [
      'Nous nous réservons le droit de modifier ces conditions à tout moment. En cas de modification substantielle, les utilisateurs seront informés via une notification dans l\'application.',
      "La poursuite de l'utilisation d'IT-Inventory après modification des conditions vaut acceptation des nouvelles conditions.",
    ],
  },
  {
    id: 'chapter-8',
    number: '08',
    articleLabel: 'Article 8',
    title: 'Contact & Litiges',
    icon: MessageSquare,
    color: 'text-emerald-400',
    colorBg: 'bg-emerald-500/[0.08]',
    colorBorder: 'border-emerald-500/20',
    paragraphs: [
      'Pour toute question relative aux présentes conditions :',
      'Florian JOVE GARCIA — Créateur & Développeur IT-Inventory',
      "Tout litige relatif à l'utilisation d'IT-Inventory sera soumis à la juridiction compétente du tribunal de commerce de Paris.",
      'Droit applicable : Droit français.',
      'Langue du contrat : Français.',
    ],
  },
]

// ─── Sidebar labels (condensés) ───

export const TERMS_SIDEBAR_ITEMS = TERMS_CHAPTERS.map((c) => ({
  id: c.id,
  number: c.number,
  label: c.title,
}))
