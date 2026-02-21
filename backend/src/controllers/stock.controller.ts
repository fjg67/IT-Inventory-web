// Contrôleur du stock — gestion des stocks et des mouvements de stock

import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { createAuditLog } from '../middleware/audit';
import logger from '../utils/logger';
import { movementSchema } from '../utils/validation';
import { Prisma } from '@prisma/client';

/**
 * Récupération de tous les stocks
 * Filtrage optionnel par site et/ou article
 */
export const getStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const siteId = (req.query.siteId as string) || undefined;
    const articleId = (req.query.articleId as string) || undefined;

    // Construction du filtre
    const where: Prisma.ArticleStockWhereInput = {};

    if (siteId) {
      where.siteId = siteId;
    }

    if (articleId) {
      where.articleId = articleId;
    }

    const stocks = await prisma.articleStock.findMany({
      where,
      include: {
        article: true,
        site: true,
      },
    });

    res.status(200).json({
      success: true,
      stocks,
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des stocks :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};

/**
 * Création d'un mouvement de stock
 * Gère les entrées, sorties, ajustements et transferts avec mise à jour atomique des quantités
 */
export const createMovement = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentification requise' });
      return;
    }

    // Validation des données d'entrée
    const parsed = movementSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: 'Données du mouvement invalides',
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const { type, articleId, quantity, siteId, fromSiteId, toSiteId, reason } = parsed.data;

    // Vérification de l'existence de l'article
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { id: true, reference: true, name: true, isArchived: true },
    });

    if (!article) {
      res.status(404).json({
        success: false,
        message: 'Article introuvable',
      });
      return;
    }

    if (article.isArchived) {
      res.status(400).json({
        success: false,
        message: 'Impossible de créer un mouvement pour un article archivé',
      });
      return;
    }

    // Traitement selon le type de mouvement — utilisation d'une transaction Prisma
    let movement;

    switch (type) {
      case 'ENTRY': {
        // Entrée de stock — incrémentation de la quantité (upsert si le stock n'existe pas)
        movement = await prisma.$transaction(async (tx) => {
          await tx.articleStock.upsert({
            where: {
              articleId_siteId: { articleId, siteId: siteId! },
            },
            update: {
              quantity: { increment: quantity },
            },
            create: {
              articleId,
              siteId: siteId!,
              quantity,
            },
          });

          return tx.stockMovement.create({
            data: {
              type: 'ENTRY',
              quantity,
              reason,
              articleId,
              toSiteId: siteId,
              userId: req.user!.userId,
            },
            include: {
              article: true,
              user: {
                select: { id: true, technicianId: true, name: true },
              },
            },
          });
        });
        break;
      }

      case 'EXIT': {
        // Sortie de stock — vérification du stock suffisant puis décrémentation
        const currentStock = await prisma.articleStock.findUnique({
          where: {
            articleId_siteId: { articleId, siteId: siteId! },
          },
        });

        if (!currentStock || currentStock.quantity < quantity) {
          const available = currentStock?.quantity ?? 0;
          res.status(400).json({
            success: false,
            message: `Stock insuffisant. Disponible : ${available}, demandé : ${quantity}`,
          });
          return;
        }

        movement = await prisma.$transaction(async (tx) => {
          await tx.articleStock.update({
            where: {
              articleId_siteId: { articleId, siteId: siteId! },
            },
            data: {
              quantity: { decrement: quantity },
            },
          });

          return tx.stockMovement.create({
            data: {
              type: 'EXIT',
              quantity,
              reason,
              articleId,
              fromSiteId: siteId,
              userId: req.user!.userId,
            },
            include: {
              article: true,
              user: {
                select: { id: true, technicianId: true, name: true },
              },
            },
          });
        });
        break;
      }

      case 'ADJUSTMENT': {
        // Ajustement — mise à jour directe de la quantité avec calcul de la différence
        const existingStock = await prisma.articleStock.findUnique({
          where: {
            articleId_siteId: { articleId, siteId: siteId! },
          },
        });

        const previousQuantity = existingStock?.quantity ?? 0;
        const difference = quantity - previousQuantity;

        movement = await prisma.$transaction(async (tx) => {
          await tx.articleStock.upsert({
            where: {
              articleId_siteId: { articleId, siteId: siteId! },
            },
            update: {
              quantity,
            },
            create: {
              articleId,
              siteId: siteId!,
              quantity,
            },
          });

          return tx.stockMovement.create({
            data: {
              type: 'ADJUSTMENT',
              quantity: difference,
              reason: reason ?? `Ajustement de ${previousQuantity} à ${quantity}`,
              articleId,
              toSiteId: siteId,
              userId: req.user!.userId,
            },
            include: {
              article: true,
              user: {
                select: { id: true, technicianId: true, name: true },
              },
            },
          });
        });
        break;
      }

      case 'TRANSFER': {
        // Transfert — vérification du stock source puis décrémentation/incrémentation
        const sourceStock = await prisma.articleStock.findUnique({
          where: {
            articleId_siteId: { articleId, siteId: fromSiteId! },
          },
        });

        if (!sourceStock || sourceStock.quantity < quantity) {
          const available = sourceStock?.quantity ?? 0;
          res.status(400).json({
            success: false,
            message: `Stock insuffisant sur le site d'origine. Disponible : ${available}, demandé : ${quantity}`,
          });
          return;
        }

        movement = await prisma.$transaction(async (tx) => {
          // Décrémentation du stock source
          await tx.articleStock.update({
            where: {
              articleId_siteId: { articleId, siteId: fromSiteId! },
            },
            data: {
              quantity: { decrement: quantity },
            },
          });

          // Incrémentation du stock destination (upsert si inexistant)
          await tx.articleStock.upsert({
            where: {
              articleId_siteId: { articleId, siteId: toSiteId! },
            },
            update: {
              quantity: { increment: quantity },
            },
            create: {
              articleId,
              siteId: toSiteId!,
              quantity,
            },
          });

          return tx.stockMovement.create({
            data: {
              type: 'TRANSFER',
              quantity,
              reason,
              articleId,
              fromSiteId,
              toSiteId,
              userId: req.user!.userId,
            },
            include: {
              article: true,
              user: {
                select: { id: true, technicianId: true, name: true },
              },
            },
          });
        });
        break;
      }
    }

    // Journal d'audit pour le mouvement créé
    await createAuditLog({
      action: `STOCK_${type}`,
      entityType: 'StockMovement',
      entityId: movement.id,
      userId: req.user.userId,
      newValue: {
        type,
        articleId,
        articleReference: article.reference,
        quantity,
        fromSiteId: fromSiteId ?? null,
        toSiteId: toSiteId ?? siteId ?? null,
        reason: reason ?? null,
      },
      articleId,
    });

    logger.info(
      `Mouvement ${type} créé : ${quantity} × ${article.reference} par ${req.user.userId}`
    );

    res.status(201).json({
      success: true,
      movement,
    });
  } catch (error) {
    logger.error('Erreur lors de la création du mouvement :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};

/**
 * Récupération paginée des mouvements de stock
 * Filtrage par type, utilisateur, site et plage de dates
 */
export const getMovements = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 25));
    const skip = (page - 1) * limit;

    const type = (req.query.type as string) || undefined;
    const userId = (req.query.userId as string) || undefined;
    const siteId = (req.query.siteId as string) || undefined;
    const from = (req.query.from as string) || undefined;
    const to = (req.query.to as string) || undefined;

    // Construction du filtre
    const where: Prisma.StockMovementWhereInput = {};

    if (type) {
      where.type = type as Prisma.EnumMovementTypeFilter['equals'];
    }

    if (userId) {
      where.userId = userId;
    }

    // Filtre par site — recherche dans fromSiteId ou toSiteId
    if (siteId) {
      where.OR = [
        { fromSiteId: siteId },
        { toSiteId: siteId },
      ];
    }

    // Filtre par plage de dates
    if (from || to) {
      where.createdAt = {};
      if (from) {
        where.createdAt.gte = new Date(from);
      }
      if (to) {
        where.createdAt.lte = new Date(to);
      }
    }

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        include: {
          article: {
            select: {
              id: true,
              reference: true,
              name: true,
              emplacement: true,
              category: true,
            },
          },
          fromSite: { select: { id: true, name: true } },
          toSite: { select: { id: true, name: true } },
          user: {
            select: {
              id: true,
              technicianId: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.stockMovement.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      movements,
      total,
      page,
      totalPages,
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des mouvements :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};
