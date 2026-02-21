// Routes du tableau de bord — statistiques et graphiques

import { Router } from 'express';
import {
  getDashboardStats,
  getMovementChart,
  getTopArticles,
  getCategoryDistribution,
} from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Statistiques générales (KPIs)
router.get('/stats', getDashboardStats);

// Données du graphique des mouvements (30 derniers jours)
router.get('/movements-chart', getMovementChart);

// Top 10 articles les plus mouvementés
router.get('/top-articles', getTopArticles);

// Répartition par catégorie
router.get('/categories', getCategoryDistribution);

export default router;
