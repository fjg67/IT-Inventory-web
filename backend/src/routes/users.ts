// Routes de gestion des utilisateurs — CRUD (admin uniquement)

import { Router } from 'express';
import { getUsers, createUser, updateUser, resetPassword } from '../controllers/users.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

// Liste de tous les utilisateurs
router.get('/', getUsers);

// Création d'un utilisateur
router.post('/', createUser);

// Modification d'un utilisateur
router.put('/:id', updateUser);

// Réinitialisation du mot de passe
router.patch('/:id/password', resetPassword);

export default router;
