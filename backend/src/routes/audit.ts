// Routes du journal d'audit — lecture seule

import { Router } from 'express';
import { getAuditLogs } from '../controllers/audit.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

// Liste paginée du journal d'audit
router.get('/', getAuditLogs);

export default router;
