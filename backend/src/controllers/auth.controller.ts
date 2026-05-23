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
import {
  DEMO_PROFILES,
  findDemoProfileById,
  findDemoProfileByTechnicianId,
  isPrismaConnectionError,
  toPublicDemoSites,
} from '../utils/offlineFallback';

type NormalizedRole = 'ADMIN' | 'TECHNICIAN';
type LegacyAuthUser = {
  id: string;
  technicianId: string;
  name: string;
  password: string;
  role: string;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const normalizeRole = (role: string): NormalizedRole => {
  const normalized = role.trim().toUpperCase();

  if (normalized === 'ADMIN' || normalized === 'SUPERVISEUR' || normalized === 'SUPERVISOR') {
    return 'ADMIN';
  }

  if (normalized === 'TECHNICIAN' || normalized === 'TECHNICIEN') {
    return 'TECHNICIAN';
  }

  return 'TECHNICIAN';
};

const isRoleEnumError = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("not found in enum 'Role'");
};

type RawUserRow = {
  id: string;
  technicianId: string;
  name: string;
  password: string;
  role: string;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

async function getRawUsersByWhere(whereClause: string, params: unknown[]): Promise<RawUserRow[]> {
  return prisma.$queryRawUnsafe<RawUserRow[]>(
    `SELECT id, "technicianId", name, password, role, "isActive", "lastLoginAt", "createdAt", "updatedAt" FROM "User" WHERE ${whereClause}`,
    ...params,
  );
}

/**
 * Liste des profils actifs (endpoint public pour le sélecteur de profil)
 * Retourne uniquement id, technicianId, name et role — pas de mot de passe
 * Inclut les techniciens et superviseurs (admins)
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
    const message = error instanceof Error ? error.message : String(error);

    // Fallback pour anciennes valeurs de rôle non conformes au schéma Prisma
    if (message.includes("not found in enum 'Role'") || isPrismaConnectionError(error)) {
      try {
        const legacyUsers = await getRawUsersByWhere('"isActive" = true ORDER BY name ASC', []);

        const users = legacyUsers.map((user) => ({
          id: user.id,
          technicianId: user.technicianId,
          name: user.name,
          role: normalizeRole(user.role),
        }));

        res.status(200).json({
          success: true,
          users,
        });
        return;
      } catch (fallbackError) {
        logger.error('Erreur fallback récupération des profils :', fallbackError);
      }
    }

    logger.error('Erreur lors de la récupération des profils :', error);

    if (isPrismaConnectionError(error)) {
      const users = DEMO_PROFILES.map((profile) => ({
        id: profile.id,
        technicianId: profile.technicianId,
        name: profile.name,
        role: profile.role,
      }));

      res.status(200).json({
        success: true,
        users,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};

/**
 * Liste des sites actifs (endpoint public pour le sélecteur d'espace de travail)
 * Retourne uniquement id, name, address, parentSiteId
 */
export const getSitesPublic = async (_req: Request, res: Response): Promise<void> => {
  try {
    const sites = await prisma.site.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        address: true,
        edsNumber: true,
        parentSiteId: true,
        isActive: true,
        createdAt: true,
        _count: { select: { children: true } },
      },
      orderBy: { name: 'asc' },
    });

    res.status(200).json({
      success: true,
      sites,
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des sites publics :', error);

    if (isPrismaConnectionError(error)) {
      res.status(200).json({
        success: true,
        sites: toPublicDemoSites(),
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};

/**
 * Création d'une agence (sous-site d'Agences) — public
 */
export const createAgency = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, edsNumber, parentSiteId } = req.body;

    if (!name || !edsNumber || !parentSiteId) {
      res.status(400).json({ success: false, message: 'Nom, numéro EDS et site parent requis' });
      return;
    }

    // Validate EDS is 3 digits
    if (!/^\d{3}$/.test(edsNumber)) {
      res.status(400).json({ success: false, message: 'Le numéro EDS doit contenir exactement 3 chiffres' });
      return;
    }

    // Check parent exists
    const parent = await prisma.site.findUnique({ where: { id: parentSiteId } });
    if (!parent) {
      res.status(404).json({ success: false, message: 'Site parent introuvable' });
      return;
    }

    // Check EDS uniqueness
    const existing = await prisma.site.findFirst({ where: { edsNumber } });
    if (existing) {
      res.status(409).json({ success: false, message: 'Ce numéro EDS est déjà utilisé' });
      return;
    }

    const agency = await prisma.site.create({
      data: {
        name,
        edsNumber,
        parentSiteId,
        address: `EDS ${edsNumber}`,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        address: true,
        edsNumber: true,
        parentSiteId: true,
        isActive: true,
        createdAt: true,
      },
    });

    res.status(201).json({ success: true, agency });
  } catch (error) {
    logger.error('Erreur lors de la création de l\'agence :', error);
    res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
  }
};

/**
 * Suppression d'une agence — public
 */
export const deleteAgency = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const site = await prisma.site.findUnique({ where: { id } });
    if (!site || !site.parentSiteId) {
      res.status(404).json({ success: false, message: 'Agence introuvable' });
      return;
    }

    await prisma.site.delete({ where: { id } });

    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Erreur lors de la suppression de l\'agence :', error);
    res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
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

    let user:
      | {
        id: string;
        technicianId: string;
        name: string;
        password: string;
        role: string;
        isActive: boolean;
      }
      | null = null;
    let usedLegacyFallback = false;
    let usedDemoFallback = false;

    // Recherche de l'utilisateur par identifiant technicien
    try {
      user = await prisma.user.findUnique({
        where: { technicianId },
      });
    } catch (error) {
      if (isPrismaConnectionError(error)) {
        try {
          const legacyUsers = await getRawUsersByWhere('"technicianId" = $1 LIMIT 1', [technicianId]);
          const legacyUser = legacyUsers[0];

          if (legacyUser) {
            usedLegacyFallback = true;
            user = legacyUser;
          }
        } catch {
          const demoUser = findDemoProfileByTechnicianId(technicianId);
          if (demoUser) {
            usedDemoFallback = true;
            user = {
              id: demoUser.id,
              technicianId: demoUser.technicianId,
              name: demoUser.name,
              password: demoUser.password,
              role: demoUser.role,
              isActive: demoUser.isActive,
            };
          }
        }

        if (!user) {
          logger.warn(`Tentative de connexion hors ligne : identifiant ${technicianId} introuvable`);
        }

        if (!user) {
          res.status(401).json({
            success: false,
            message: 'Identifiant ou mot de passe incorrect',
          });
          return;
        }

        // Continuer avec la donnée de secours.
      } else {
        if (!isRoleEnumError(error)) {
          throw error;
        }

        usedLegacyFallback = true;
        const legacyUsers = await prisma.$queryRaw<LegacyAuthUser[]>`
          SELECT id, "technicianId", name, password, role, "isActive", "lastLoginAt", "createdAt", "updatedAt"
          FROM "User"
          WHERE "technicianId" = ${technicianId}
          LIMIT 1
        `;
        user = legacyUsers[0] ?? null;
      }
    }

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
    const normalizedRole = normalizeRole(user.role);
    const accessToken = generateAccessToken(user.id, normalizedRole);
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
    if (usedLegacyFallback) {
      await prisma.$executeRaw`
        UPDATE "User"
        SET "lastLoginAt" = NOW(), "updatedAt" = NOW()
        WHERE id = ${user.id}
      `;
    } else if (!usedDemoFallback) {
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });
    } else {
        // Mode hors ligne : pas d'écriture en base.
    }

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
        role: normalizedRole,
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
    let user:
      | {
        id: string;
        role: string;
        isActive: boolean;
      }
      | null = null;

    try {
      user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });
    } catch (error) {
      if (isPrismaConnectionError(error)) {
        try {
          const legacyUsers = await getRawUsersByWhere('id = $1 LIMIT 1', [payload.userId]);
          const legacyUser = legacyUsers[0];
          if (legacyUser) {
            user = { id: legacyUser.id, role: legacyUser.role, isActive: legacyUser.isActive };
          }
        } catch {
          const demoUser = findDemoProfileById(payload.userId);
          if (demoUser) {
            user = {
              id: demoUser.id,
              role: demoUser.role,
              isActive: demoUser.isActive,
            };
          }
        }

        if (!user) {
          res.status(401).json({
            success: false,
            message: 'Utilisateur introuvable ou désactivé',
          });
          return;
        }

        // Continuer avec l'utilisateur de secours.
      } else {
        if (!isRoleEnumError(error)) {
          throw error;
        }

        const legacyUsers = await prisma.$queryRaw<LegacyAuthUser[]>`
          SELECT id, "technicianId", name, password, role, "isActive", "lastLoginAt", "createdAt", "updatedAt"
          FROM "User"
          WHERE id = ${payload.userId}
          LIMIT 1
        `;
        const legacy = legacyUsers[0];
        user = legacy ? { id: legacy.id, role: legacy.role, isActive: legacy.isActive } : null;
      }
    }

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Utilisateur introuvable ou désactivé',
      });
      return;
    }

    // Génération d'un nouveau token d'accès
    const accessToken = generateAccessToken(user.id, normalizeRole(user.role));

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
    let user:
      | {
        id: string;
        technicianId: string;
        name: string;
        role: string;
        isActive: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
      }
      | null = null;

    try {
      user = await prisma.user.findUnique({
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
    } catch (error) {
      if (isPrismaConnectionError(error)) {
        try {
          const legacyUsers = await getRawUsersByWhere('id = $1 LIMIT 1', [req.user.userId]);
          const legacyUser = legacyUsers[0];
          if (legacyUser) {
            user = {
              id: legacyUser.id,
              technicianId: legacyUser.technicianId,
              name: legacyUser.name,
              role: legacyUser.role,
              isActive: legacyUser.isActive,
              lastLoginAt: legacyUser.lastLoginAt,
              createdAt: legacyUser.createdAt,
              updatedAt: legacyUser.updatedAt,
            };
          }
        } catch {
          const demoUser = findDemoProfileById(req.user.userId);
          if (demoUser) {
            user = {
              id: demoUser.id,
              technicianId: demoUser.technicianId,
              name: demoUser.name,
              role: demoUser.role,
              isActive: demoUser.isActive,
              lastLoginAt: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
          }
        }

        if (!user) {
          res.status(404).json({
            success: false,
            message: 'Utilisateur introuvable',
          });
          return;
        }

        // Continuer avec l'utilisateur de secours.
      } else {
        if (!isRoleEnumError(error)) {
          throw error;
        }

        const legacyUsers = await prisma.$queryRaw<LegacyAuthUser[]>`
          SELECT id, "technicianId", name, password, role, "isActive", "lastLoginAt", "createdAt", "updatedAt"
          FROM "User"
          WHERE id = ${req.user.userId}
          LIMIT 1
        `;
        const legacy = legacyUsers[0];
        user = legacy
          ? {
            id: legacy.id,
            technicianId: legacy.technicianId,
            name: legacy.name,
            role: legacy.role,
            isActive: legacy.isActive,
            lastLoginAt: legacy.lastLoginAt,
            createdAt: legacy.createdAt,
            updatedAt: legacy.updatedAt,
          }
          : null;
      }
    }

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Utilisateur introuvable',
      });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        ...user,
        role: normalizeRole(user.role),
      },
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération du profil :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};
