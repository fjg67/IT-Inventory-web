// Contrôleur d'authentification — gestion de la connexion, déconnexion et rafraîchissement des tokens

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import { createAuditLog } from '../middleware/audit';
import logger from '../utils/logger';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt';
import { loginSchema } from '../utils/validation';

/**
 * Liste des profils actifs (endpoint public pour le sélecteur de profil)
 * Retourne uniquement id, technicianId, name et role — pas de mot de passe
 */
export const getProfiles = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        technicianId: true,
        name: true,
        role: true,
      },
      orderBy: { name: 'asc' },
    });

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des profils :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};

/**
 * Connexion d'un utilisateur
 * Valide les identifiants, génère les tokens et enregistre le cookie de rafraîchissement
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validation des données d'entrée
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: 'Données de connexion invalides',
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const { technicianId, password } = parsed.data;

    // Recherche de l'utilisateur par identifiant technicien
    const user = await prisma.user.findUnique({
      where: { technicianId },
    });

    if (!user) {
      logger.warn(`Tentative de connexion échouée : identifiant ${technicianId} introuvable`);
      res.status(401).json({
        success: false,
        message: 'Identifiant ou mot de passe incorrect',
      });
      return;
    }

    // Vérification que le compte est actif
    if (!user.isActive) {
      logger.warn(`Tentative de connexion sur un compte désactivé : ${technicianId}`);
      res.status(403).json({
        success: false,
        message: 'Ce compte est désactivé. Contactez un administrateur.',
      });
      return;
    }

    // Vérification du mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      logger.warn(`Mot de passe incorrect pour l'utilisateur ${technicianId}`);
      res.status(401).json({
        success: false,
        message: 'Identifiant ou mot de passe incorrect',
      });
      return;
    }

    // Génération des tokens
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    // Définition du cookie httpOnly pour le refresh token
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours en millisecondes
      path: '/',
    });

    // Mise à jour de la date de dernière connexion
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Enregistrement dans le journal d'audit
    await createAuditLog({
      action: 'LOGIN',
      entityType: 'User',
      entityId: user.id,
      userId: user.id,
    });

    logger.info(`Connexion réussie pour l'utilisateur ${technicianId}`);

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        technicianId: user.technicianId,
        name: user.name,
        role: user.role,
      },
      accessToken,
    });
  } catch (error) {
    logger.error('Erreur lors de la connexion :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};

/**
 * Déconnexion de l'utilisateur
 * Supprime le cookie de rafraîchissement
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // Suppression du cookie de rafraîchissement
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    logger.info(`Déconnexion de l'utilisateur ${req.user?.userId ?? 'inconnu'}`);

    res.status(200).json({
      success: true,
      message: 'Déconnexion réussie',
    });
  } catch (error) {
    logger.error('Erreur lors de la déconnexion :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};

/**
 * Rafraîchissement du token d'accès
 * Lit le refresh token depuis les cookies et génère un nouveau access token
 */
export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    // Lecture du refresh token depuis les cookies
    const refreshToken = req.cookies?.refreshToken as string | undefined;

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message: 'Refresh token manquant',
      });
      return;
    }

    // Vérification du refresh token
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      res.status(401).json({
        success: false,
        message: 'Refresh token invalide ou expiré',
      });
      return;
    }

    // Recherche de l'utilisateur associé
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Utilisateur introuvable ou désactivé',
      });
      return;
    }

    // Génération d'un nouveau token d'accès
    const accessToken = generateAccessToken(user.id, user.role);

    res.status(200).json({
      success: true,
      accessToken,
    });
  } catch (error) {
    logger.error('Erreur lors du rafraîchissement du token :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};

/**
 * Récupération des informations de l'utilisateur connecté
 * Retourne le profil complet sans le mot de passe
 */
export const me = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentification requise',
      });
      return;
    }

    // Récupération complète de l'utilisateur depuis la base de données
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        technicianId: true,
        name: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Utilisateur introuvable',
      });
      return;
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération du profil :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};
