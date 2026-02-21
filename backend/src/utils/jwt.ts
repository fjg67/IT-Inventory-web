// Utilitaire JWT — génération et vérification des tokens d'authentification

import jwt from 'jsonwebtoken';

// Payload contenu dans les tokens
export interface TokenPayload {
  userId: string;
  role: string;
}

// Payload du refresh token (sans rôle)
interface RefreshTokenPayload {
  userId: string;
}

// Récupération des secrets depuis les variables d'environnement
const getAccessSecret = (): string => {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error('JWT_ACCESS_SECRET non défini dans les variables d\'environnement');
  }
  return secret;
};

const getRefreshSecret = (): string => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET non défini dans les variables d\'environnement');
  }
  return secret;
};

/**
 * Génère un access token (durée de vie : 15 minutes)
 */
export const generateAccessToken = (userId: string, role: string): string => {
  return jwt.sign({ userId, role }, getAccessSecret(), {
    expiresIn: '15m',
  });
};

/**
 * Génère un refresh token (durée de vie : 7 jours)
 */
export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, getRefreshSecret(), {
    expiresIn: '7d',
  });
};

/**
 * Vérifie et décode un access token
 * Retourne le payload si valide, null sinon
 */
export const verifyAccessToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, getAccessSecret()) as TokenPayload;
    return decoded;
  } catch {
    return null;
  }
};

/**
 * Vérifie et décode un refresh token
 * Retourne le payload si valide, null sinon
 */
export const verifyRefreshToken = (token: string): RefreshTokenPayload | null => {
  try {
    const decoded = jwt.verify(token, getRefreshSecret()) as RefreshTokenPayload;
    return decoded;
  } catch {
    return null;
  }
};
