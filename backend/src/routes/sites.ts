// Routes des sites de stockage — CRUD (admin uniquement pour création/modification)

import { Router } from 'express';
import { getSites, createSite, updateSite } from '../controllers/sites.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Liste de tous les sites
router.get('/', getSites);

// Création d'un site (admin)
router.post('/', requireAdmin, createSite);

// Modification d'un site (admin)
router.put('/:id', requireAdmin, updateSite);

export default router;
