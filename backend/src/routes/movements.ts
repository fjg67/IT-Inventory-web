// Routes des mouvements de stock — liste avec filtres

import { Router } from 'express';
import { getMovements } from '../controllers/stock.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Liste paginée de tous les mouvements
router.get('/', getMovements);

export default router;
