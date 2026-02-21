// Routes du stock — consultation des niveaux de stock

import { Router } from 'express';
import { getStock, createMovement } from '../controllers/stock.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Consultation du stock (filtrage par site/article)
router.get('/', getStock);

// Création d'un mouvement de stock
router.post('/movements', createMovement);

export default router;
