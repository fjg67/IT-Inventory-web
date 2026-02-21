// Point d'entrée principal du serveur Express
// Configuration et démarrage de l'API IT-Inventory

import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import logger from './utils/logger';

// Création de l'application Express
const app = express();

// --- Middlewares de sécurité ---

// Protection des en-têtes HTTP
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false,
}));

// Configuration CORS depuis la variable d'environnement
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:8081'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Autoriser les requêtes sans origin (app mobile, Postman, etc.)
      if (!origin || corsOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origine non autorisée par CORS: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Limitation du débit des requêtes (protection contre les abus)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // Maximum 5000 requêtes par fenêtre (dev)
  message: {
    success: false,
    message: 'Trop de requêtes, veuillez réessayer plus tard',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// --- Middlewares de parsing ---

// Parsing JSON avec une limite de 10 Mo
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// --- Création du répertoire d'uploads ---

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  logger.info(`Répertoire d'uploads créé : ${uploadDir}`);
}

// Servir les fichiers statiques du dossier uploads
app.use('/uploads', express.static(uploadDir));

// --- Route de santé ---

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'API IT-Inventory opérationnelle',
    timestamp: new Date().toISOString(),
  });
});

// --- Montage des routes API ---

const mountRoutes = async (): Promise<void> => {
  try {
    const authRoutes = await import('./routes/auth');
    const articleRoutes = await import('./routes/articles');
    const stockRoutes = await import('./routes/stock');
    const movementRoutes = await import('./routes/movements');
    const alertRoutes = await import('./routes/alerts');
    const siteRoutes = await import('./routes/sites');
    const userRoutes = await import('./routes/users');
    const auditRoutes = await import('./routes/audit');
    const exportRoutes = await import('./routes/export');
    const dashboardRoutes = await import('./routes/dashboard');

    app.use('/api/auth', authRoutes.default);
    app.use('/api/articles', articleRoutes.default);
    app.use('/api/stock', stockRoutes.default);
    app.use('/api/movements', movementRoutes.default);
    app.use('/api/alerts', alertRoutes.default);
    app.use('/api/sites', siteRoutes.default);
    app.use('/api/users', userRoutes.default);
    app.use('/api/audit', auditRoutes.default);
    app.use('/api/export', exportRoutes.default);
    app.use('/api/dashboard', dashboardRoutes.default);

    logger.info('Toutes les routes API ont été montées avec succès');
  } catch (error) {
    logger.error('Erreur lors du montage des routes:', error);
  }
};

// --- Servir le frontend en production ---

const serveFrontend = (): void => {
  if (process.env.NODE_ENV === 'production') {
    const frontendPath = path.join(__dirname, '..', '..', 'frontend', 'dist');
    
    if (fs.existsSync(frontendPath)) {
      app.use(express.static(frontendPath));
      
      // Toutes les routes non-API renvoient index.html (SPA routing)
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.join(frontendPath, 'index.html'));
      });
      
      logger.info(`Frontend servi depuis : ${frontendPath}`);
    } else {
      logger.warn(`Dossier frontend introuvable : ${frontendPath}`);
    }
  }
};

// --- Route 404 pour les chemins non trouvés ---

const setup404 = (): void => {
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: 'Route non trouvée',
    });
  });
};

// --- Gestionnaire d'erreurs global ---

const setupErrorHandler = (): void => {
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    logger.error(`Erreur non gérée: ${err.message}`, { stack: err.stack });

    res.status(500).json({
      success: false,
      message:
        process.env.NODE_ENV === 'production'
          ? 'Erreur interne du serveur'
          : err.message,
    });
  });
};

// --- Démarrage du serveur ---

const PORT = parseInt(process.env.PORT || '3001', 10);

const startServer = async (): Promise<void> => {
  await mountRoutes();
  serveFrontend();
  setup404();
  setupErrorHandler();

  app.listen(PORT, () => {
    logger.info(`Serveur IT-Inventory démarré sur le port ${PORT}`);
    logger.info(`Environnement : ${process.env.NODE_ENV || 'development'}`);
    logger.info(`CORS autorisé pour : ${corsOrigins.join(', ')}`);
  });
};

startServer().catch((error) => {
  logger.error('Impossible de démarrer le serveur:', error);
  process.exit(1);
});

export default app;
