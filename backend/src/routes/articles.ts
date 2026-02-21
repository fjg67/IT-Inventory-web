// Routes des articles — CRUD complet + historique + upload

import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  getArticleHistory,
} from '../controllers/articles.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// Configuration multer pour l'upload d'images
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo max
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeOk = allowed.test(file.mimetype.split('/')[1]);
    cb(null, extOk && mimeOk);
  },
});

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Liste paginée des articles avec filtres
router.get('/', getArticles);

// Détail d'un article
router.get('/:id', getArticleById);

// Upload d'image pour un article
router.post('/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ success: false, message: 'Aucune image fournie' });
    return;
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  res.status(200).json({ success: true, imageUrl });
});

// Création d'un article (tous les utilisateurs authentifiés)
router.post('/', createArticle);

// Modification d'un article (admin uniquement)
router.put('/:id', requireAdmin, updateArticle);

// Suppression logique d'un article (admin uniquement)
router.delete('/:id', requireAdmin, deleteArticle);

// Historique des mouvements d'un article
router.get('/:id/history', getArticleHistory);

export default router;
