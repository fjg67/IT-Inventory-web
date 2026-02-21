// Routes des alertes de stock

import { Router } from 'express';
import { getAlerts } from '../controllers/alerts.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Articles avec stock ≤ seuil minimum
router.get('/', getAlerts);

export default router;
