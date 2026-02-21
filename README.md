# 🖥️ IT-Inventory — Application Web

> Plateforme de gestion de stock informatique — Back-office / Tableau de bord admin

## 📋 Présentation

IT-Inventory est une application web complète de gestion de stock IT destinée aux techniciens informatiques autorisés. Elle offre une interface de tableau de bord avec gestion des articles, mouvements de stock, alertes, sites de stockage, utilisateurs et journal d'audit.

## 🛠️ Stack technique

### Frontend
- React 18 + TypeScript (strict mode)
- Vite (build tool)
- shadcn/ui + Tailwind CSS (design system dark premium)
- Zustand (state management)
- TanStack Query v5 (data fetching)
- React Router v6 (routing)
- React Hook Form + Zod (formulaires)
- Recharts (graphiques)
- Framer Motion (animations)

### Backend
- Node.js 20 LTS + Express.js + TypeScript
- Prisma ORM + PostgreSQL
- JWT (access token 15min + refresh token 7j)
- Zod (validation)
- ExcelJS (exports)
- Winston (logs)

## 🚀 Installation

### Prérequis

- Node.js 20+ et npm
- PostgreSQL 14+
- Git

### 1. Cloner le projet

```bash
git clone <url-du-repo>
cd it-inventory-web
```

### 2. Configuration du backend

```bash
cd backend
npm install
```

Créer un fichier `.env` à partir de l'exemple :

```bash
cp .env.example .env
```

Modifier le fichier `.env` avec vos paramètres (base de données, secrets JWT, etc.) :

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/it_inventory?schema=public"
JWT_SECRET="votre-secret-jwt"
JWT_REFRESH_SECRET="votre-refresh-secret"
PORT=3001
CORS_ORIGINS="http://localhost:5173"
```

### 3. Initialisation de la base de données

```bash
# Générer le client Prisma
npx prisma generate

# Appliquer le schéma à la base de données
npx prisma db push

# Peupler avec les données de test
npm run db:seed
```

### 4. Configuration du frontend

```bash
cd ../frontend
npm install
```

### 5. Lancement en développement

**Terminal 1 — Backend :**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend :**
```bash
cd frontend
npm run dev
```

L'application sera accessible sur :
- **Frontend** : http://localhost:5173
- **API** : http://localhost:3001

## 🔑 Identifiants de test

| Rôle | Identifiant | Mot de passe |
|------|-------------|-------------|
| Admin | `T000001` | `Admin!123` |
| Technicien | `T097097` | `Tech!456` |

## 📁 Structure du projet

```
it-inventory-web/
├── frontend/                  # Application React
│   ├── src/
│   │   ├── components/        # Composants React
│   │   │   ├── ui/            # Composants shadcn/ui
│   │   │   ├── layout/        # Sidebar, TopBar, MainLayout
│   │   │   ├── dashboard/     # StatsCard, Charts, AlertList
│   │   │   └── shared/        # ConfirmDialog, EmptyState, etc.
│   │   ├── pages/             # Pages de l'application
│   │   ├── hooks/             # Hooks personnalisés
│   │   ├── stores/            # Stores Zustand
│   │   ├── services/          # Appels API (Axios)
│   │   ├── types/             # Types TypeScript
│   │   └── lib/               # Utilitaires
│   └── index.html
│
└── backend/                   # API Express
    ├── src/
    │   ├── controllers/       # Logique métier
    │   ├── routes/            # Définition des routes
    │   ├── middleware/        # Auth, audit
    │   └── utils/             # JWT, logger, Prisma, validation
    └── prisma/
        ├── schema.prisma      # Schéma de la base de données
        └── seed.ts            # Données de test
```

## 📊 Fonctionnalités

### Tableau de bord
- KPIs en temps réel (articles, ruptures, stock bas, mouvements du jour)
- Graphiques : mouvements 30j, top 10 articles, répartition catégories
- Alertes et derniers mouvements

### Articles
- Liste paginée avec recherche et filtres (catégorie, statut, site)
- CRUD complet (création, modification, archivage)
- Détail avec stock par site et historique des mouvements

### Mouvements de stock
- Entrées, sorties, ajustements, transferts inter-sites
- Filtres par type, période, technicien, site
- Export Excel

### Alertes
- Articles sous le seuil minimum, triés par criticité
- Réapprovisionnement rapide

### Administration (Admin seulement)
- Gestion des sites de stockage
- Gestion des utilisateurs / techniciens
- Journal d'audit complet
- Paramètres de l'application
- Exports complets

## 🔒 Sécurité

- Authentification JWT (access + refresh tokens)
- Middleware d'autorisation par rôle (Admin / Technicien)
- Rate limiting par IP
- Helmet.js pour les en-têtes HTTP
- CORS configuré
- Validation Zod sur toutes les entrées
- Journal d'audit automatique

## 🏗️ Déploiement

### Frontend
```bash
cd frontend
npm run build
# Déployer le dossier dist/ sur Vercel/Netlify
```

### Backend
```bash
cd backend
npm run build
# Déployer sur Render/Railway avec les variables d'environnement
```

### Base de données
PostgreSQL hébergée sur Supabase ou auto-hébergée.

## 📝 Scripts disponibles

### Backend
| Script | Description |
|--------|-------------|
| `npm run dev` | Démarrage en mode développement (hot-reload) |
| `npm run build` | Compilation TypeScript |
| `npm start` | Démarrage en production |
| `npm run db:generate` | Génération du client Prisma |
| `npm run db:push` | Synchronisation du schéma |
| `npm run db:migrate` | Migrations Prisma |
| `npm run db:seed` | Peuplement des données de test |
| `npm run db:studio` | Interface Prisma Studio |

### Frontend
| Script | Description |
|--------|-------------|
| `npm run dev` | Démarrage en mode développement |
| `npm run build` | Build de production |
| `npm run preview` | Prévisualisation du build |

---

**IT-Inventory** — Développé avec ❤️ pour les équipes IT
