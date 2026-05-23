import { Router } from 'express';
import { authenticate, requireTechnician } from '../middleware/auth';
import {
  createPC,
  deletePC,
  getParcPC,
  getPCById,
  updatePC,
  updatePCStatus,
} from '../controllers/parcpc.controller';

const router = Router();

router.use(authenticate);

router.get('/', getParcPC);
router.get('/:id', getPCById);
router.post('/', requireTechnician, createPC);
router.patch('/:id', requireTechnician, updatePC);
router.patch('/:id/status', requireTechnician, updatePCStatus);
router.delete('/:id', requireTechnician, deletePC);

export default router;