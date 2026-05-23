// Routes d'export — Excel/CSV pour articles et mouvements

import { Router } from 'express';
import { exportArticleCsv, exportArticles, exportMovements } from '../controllers/export.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Export Excel des articles
router.get('/articles', exportArticles);
router.get('/articles/:id/csv', exportArticleCsv);

// Export Excel des mouvements (avec filtres)
router.get('/movements', exportMovements);

export default router;
