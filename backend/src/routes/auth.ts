// Routes d'authentification — login, logout, refresh, me

import { Router } from 'express';
import { login, logout, refresh, me, getProfiles } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Liste des profils actifs (public — pour le sélecteur de profil)
router.get('/profiles', getProfiles);

// Connexion
router.post('/login', login);

// Déconnexion (authentification requise)
router.post('/logout', authenticate, logout);

// Rafraîchissement du token
router.post('/refresh', refresh);

// Récupération des infos de l'utilisateur connecté
router.get('/me', authenticate, me);

export default router;
