// Contrôleur des utilisateurs — gestion des comptes techniciens et administrateurs

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import { createAuditLog } from '../middleware/audit';
import logger from '../utils/logger';
import { userSchema } from '../utils/validation';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

// Schéma de validation pour la réinitialisation du mot de passe
const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

/**
 * Récupération de tous les utilisateurs
 * Exclut le mot de passe et inclut le nombre de mouvements effectués
 */
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        technicianId: true,
        name: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            movements: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des utilisateurs :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};

/**
 * Création d'un nouvel utilisateur
 * Hache le mot de passe avec bcrypt avant insertion
 */
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentification requise' });
      return;
    }

    // Validation des données d'entrée
    const parsed = userSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: 'Données de l\'utilisateur invalides',
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const { technicianId, name, password, role } = parsed.data;

    // Hachage du mot de passe (10 rounds de salt)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création de l'utilisateur
    const user = await prisma.user.create({
      data: {
        technicianId,
        name,
        password: hashedPassword,
        role: role ?? 'TECHNICIAN',
      },
      select: {
        id: true,
        technicianId: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Journal d'audit
    await createAuditLog({
      action: 'CREATE_USER',
      entityType: 'User',
      entityId: user.id,
      userId: req.user.userId,
      newValue: {
        technicianId: user.technicianId,
        name: user.name,
        role: user.role,
      },
    });

    logger.info(`Utilisateur créé : ${user.technicianId} — ${user.name}`);

    res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    // Gestion de l'erreur d'unicité sur l'identifiant technicien
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      res.status(409).json({
        success: false,
        message: 'Un utilisateur avec cet identifiant technicien existe déjà',
      });
      return;
    }

    logger.error('Erreur lors de la création de l\'utilisateur :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};

/**
 * Mise à jour d'un utilisateur (nom, rôle, statut actif)
 * Ne modifie pas le mot de passe — utiliser resetPassword pour ça
 */
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentification requise' });
      return;
    }

    const { id } = req.params;
    const { name, role, isActive } = req.body as {
      name?: string;
      role?: 'ADMIN' | 'TECHNICIAN';
      isActive?: boolean;
    };

    // Récupération de l'utilisateur existant pour comparaison
    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        technicianId: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    if (!existingUser) {
      res.status(404).json({
        success: false,
        message: 'Utilisateur introuvable',
      });
      return;
    }

    // Construction des données de mise à jour
    const updateData: Prisma.UserUpdateInput = {};
    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Mise à jour de l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
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

    // Journal d'audit avec les anciennes et nouvelles valeurs
    await createAuditLog({
      action: 'UPDATE_USER',
      entityType: 'User',
      entityId: id,
      userId: req.user.userId,
      oldValue: {
        name: existingUser.name,
        role: existingUser.role,
        isActive: existingUser.isActive,
      },
      newValue: {
        name: updatedUser.name,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
      },
    });

    logger.info(`Utilisateur mis à jour : ${updatedUser.technicianId}`);

    res.status(200).json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    logger.error('Erreur lors de la mise à jour de l\'utilisateur :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};

/**
 * Réinitialisation du mot de passe d'un utilisateur
 * Hache le nouveau mot de passe avec bcrypt
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentification requise' });
      return;
    }

    const { id } = req.params;

    // Validation du nouveau mot de passe
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: 'Mot de passe invalide',
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    // Vérification de l'existence de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, technicianId: true },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Utilisateur introuvable',
      });
      return;
    }

    // Hachage du nouveau mot de passe (10 rounds de salt)
    const hashedPassword = await bcrypt.hash(parsed.data.password, 10);

    // Mise à jour du mot de passe
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    // Journal d'audit (sans stocker le mot de passe en clair ou haché)
    await createAuditLog({
      action: 'RESET_PASSWORD',
      entityType: 'User',
      entityId: id,
      userId: req.user.userId,
    });

    logger.info(`Mot de passe réinitialisé pour l'utilisateur ${user.technicianId}`);

    res.status(200).json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès',
    });
  } catch (error) {
    logger.error('Erreur lors de la réinitialisation du mot de passe :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};
