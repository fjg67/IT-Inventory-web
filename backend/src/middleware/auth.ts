// Middleware d'authentification et d'autorisation
// Vérifie les tokens JWT et contrôle les rôles utilisateur

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import logger from '../utils/logger';

// Extension du type Request Express pour inclure l'utilisateur authentifié
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Middleware d'authentification
 * Vérifie la présence et la validité du token JWT dans l'en-tête Authorization
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Token d\'authentification manquant',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Token d\'authentification invalide',
    });
    return;
  }

  const payload = verifyAccessToken(token);

  if (!payload) {
    logger.warn('Tentative d\'accès avec un token invalide ou expiré');
    res.status(401).json({
      success: false,
      message: 'Token invalide ou expiré',
    });
    return;
  }

  // Attache les informations utilisateur à la requête
  req.user = payload;
  next();
};

/**
 * Middleware de contrôle d'accès administrateur
 * Doit être utilisé après le middleware authenticate
 */
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentification requise',
    });
    return;
  }

  if (req.user.role !== 'ADMIN') {
    logger.warn(
      `Accès administrateur refusé pour l'utilisateur ${req.user.userId}`
    );
    res.status(403).json({
      success: false,
      message: 'Accès réservé aux administrateurs',
    });
    return;
  }

  next();
};
