// Données structurées — Politique de confidentialité
// 7 chapitres avec contenu, tableau de rétention, grille RGPD

import {
  Database,
  Target,
  Clock,
  Share2,
  Lock,
  Scale,
  Mail,
} from 'lucide-react'

import type { TermsChapterData } from './termsData'

// ─── Type rétention ───

export interface RetentionRow {
  type: string
  duration: string
  justification: string
  justColor: string
}

// ─── Type droit RGPD ───

export interface RightItem {
  icon: typeof Scale
  label: string
  description: string
  color: string
  colorBg: string
  colorBorder: string
}

// ─── Données de rétention ───

export const RETENTION_DATA: RetentionRow[] = [
  {
    type: 'Logs de connexion',
    duration: '6 mois',
    justification: 'Sécurité',
    justColor: 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20',
  },
  {
    type: 'Actions utilisateur',
    duration: '2 ans',
    justification: 'Audit',
    justColor: 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20',
  },
  {
    type: 'Données de stock',
    duration: '5 ans',
    justification: 'Légal',
    justColor: 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20',
  },
  {
    type: 'Compte utilisateur',
    duration: 'Durée contrat',
    justification: 'Fonctionnel',
    justColor: 'bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20',
  },
]

// ─── Droits RGPD ───

import { Eye, Edit, Trash2, Download, XCircle, Pause } from 'lucide-react'

export const RGPD_RIGHTS: RightItem[] = [
  {
    icon: Eye,
    label: 'Accès',
    description: 'Consulter vos données',
    color: 'text-blue-400',
    colorBg: 'bg-blue-500/[0.06]',
    colorBorder: 'border-blue-500/20',
  },
  {
    icon: Edit,
    label: 'Rectification',
    description: 'Corriger vos données',
    color: 'text-indigo-400',
    colorBg: 'bg-indigo-500/[0.06]',
    colorBorder: 'border-indigo-500/20',
  },
  {
    icon: Trash2,
    label: 'Effacement',
    description: 'Supprimer vos données',
    color: 'text-red-400',
    colorBg: 'bg-red-500/[0.06]',
    colorBorder: 'border-red-500/20',
  },
  {
    icon: Download,
    label: 'Portabilité',
    description: 'Exporter vos données',
    color: 'text-emerald-400',
    colorBg: 'bg-emerald-500/[0.06]',
    colorBorder: 'border-emerald-500/20',
  },
  {
    icon: XCircle,
    label: 'Opposition',
    description: 'Refuser un traitement',
    color: 'text-amber-400',
    colorBg: 'bg-amber-500/[0.06]',
    colorBorder: 'border-amber-500/20',
  },
  {
    icon: Pause,
    label: 'Limitation',
    description: 'Restreindre un traitement',
    color: 'text-violet-400',
    colorBg: 'bg-violet-500/[0.06]',
    colorBorder: 'border-violet-500/20',
  },
]

// ─── Chapitres Politique de confidentialité ───

export const PRIVACY_CHAPTERS: TermsChapterData[] = [
  {
    id: 'chapter-1',
    number: '01',
    articleLabel: 'Article 1',
    title: 'Données collectées',
    icon: Database,
    color: 'text-blue-400',
    colorBg: 'bg-blue-500/[0.08]',
    colorBorder: 'border-blue-500/20',
    paragraphs: [
      "Dans le cadre de l'utilisation d'IT-Inventory, les données suivantes sont collectées :",
    ],
    bullets: [
      'Identifiants technicien (ID unique + nom)',
      'Logs de connexion (date, heure, adresse IP)',
      "Actions effectuées dans l'application (audit trail)",
      "Données de stock saisies par l'utilisateur",
    ],
    callout: {
      type: 'info',
      text: "Aucune donnée personnelle sensible (santé, finances) n'est collectée par IT-Inventory.",
    },
  },
  {
    id: 'chapter-2',
    number: '02',
    articleLabel: 'Article 2',
    title: 'Finalités du traitement',
    icon: Target,
    color: 'text-indigo-400',
    colorBg: 'bg-indigo-500/[0.08]',
    colorBorder: 'border-indigo-500/20',
    paragraphs: [
      'Les données sont traitées exclusivement pour :',
    ],
    bullets: [
      "Authentification et contrôle d'accès",
      'Traçabilité des mouvements de stock',
      "Journal d'audit et conformité interne",
      "Amélioration de l'application",
    ],
  },
  {
    id: 'chapter-3',
    number: '03',
    articleLabel: 'Article 3',
    title: 'Durée de conservation',
    icon: Clock,
    color: 'text-amber-400',
    colorBg: 'bg-amber-500/[0.08]',
    colorBorder: 'border-amber-500/20',
    paragraphs: [
      "Les données sont conservées pour des durées proportionnées à leur finalité, conformément au principe de minimisation du RGPD :",
    ],
    // Le tableau de rétention est rendu via un composant spécial dans TermsPage
  },
  {
    id: 'chapter-4',
    number: '04',
    articleLabel: 'Article 4',
    title: 'Partage des données',
    icon: Share2,
    color: 'text-violet-400',
    colorBg: 'bg-violet-500/[0.08]',
    colorBorder: 'border-violet-500/20',
    paragraphs: [
      "Les données ne sont jamais vendues ni partagées avec des tiers à des fins commerciales. Seul l'hébergeur technique (infrastructure serveur) a accès aux données chiffrées.",
    ],
  },
  {
    id: 'chapter-5',
    number: '05',
    articleLabel: 'Article 5',
    title: 'Sécurité',
    icon: Lock,
    color: 'text-emerald-400',
    colorBg: 'bg-emerald-500/[0.08]',
    colorBorder: 'border-emerald-500/20',
    paragraphs: [
      "IT-Inventory met en œuvre les mesures de sécurité suivantes :",
    ],
    bullets: [
      'Chiffrement des mots de passe (bcrypt, coût 12)',
      'HTTPS obligatoire sur toutes les communications',
      'Tokens JWT avec expiration courte (15 minutes)',
      'Journalisation des tentatives de connexion échouées',
    ],
  },
  {
    id: 'chapter-6',
    number: '06',
    articleLabel: 'Article 6',
    title: 'Vos droits (RGPD)',
    icon: Scale,
    color: 'text-cyan-400',
    colorBg: 'bg-cyan-500/[0.08]',
    colorBorder: 'border-cyan-500/20',
    paragraphs: [
      'Conformément au RGPD (Règlement UE 2016/679), vous disposez des droits suivants :',
    ],
    // La grille RGPD est rendue via un composant spécial dans TermsPage
  },
  {
    id: 'chapter-7',
    number: '07',
    articleLabel: 'Article 7',
    title: 'Contact DPO',
    icon: Mail,
    color: 'text-blue-400',
    colorBg: 'bg-blue-500/[0.08]',
    colorBorder: 'border-blue-500/20',
    paragraphs: [
      'Pour exercer vos droits ou pour toute question relative à la protection de vos données, contactez :',
      'Florian JOVE GARCIA — Délégué à la protection des données',
      'IT-Inventory v1.0.0',
    ],
  },
]

// ─── Sidebar labels ───

export const PRIVACY_SIDEBAR_ITEMS = PRIVACY_CHAPTERS.map((c) => ({
  id: c.id,
  number: c.number,
  label: c.title,
}))
