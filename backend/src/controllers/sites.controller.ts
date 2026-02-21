// Contrôleur des sites — gestion des sites de stockage

import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { createAuditLog } from '../middleware/audit';
import logger from '../utils/logger';
import { siteSchema } from '../utils/validation';
import { Prisma } from '@prisma/client';

/**
 * Récupération de tous les sites
 * Inclut le nombre d'articles stockés et la date du dernier mouvement
 */
export const getSites = async (req: Request, res: Response): Promise<void> => {
  try {
    const sites = await prisma.site.findMany({
      include: {
        stocks: {
          select: {
            id: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Enrichissement avec le nombre d'articles et la date du dernier mouvement
    const sitesWithDetails = await Promise.all(
      sites.map(async (site) => {
        // Nombre d'articles ayant du stock sur ce site (quantité > 0)
        const articleCount = await prisma.articleStock.count({
          where: {
            siteId: site.id,
            quantity: { gt: 0 },
          },
        });

        // Date du dernier mouvement impliquant ce site
        const lastMovement = await prisma.stockMovement.findFirst({
          where: {
            OR: [
              { fromSiteId: site.id },
              { toSiteId: site.id },
            ],
          },
          orderBy: { createdAt: 'desc' },
          select: { createdAt: true },
        });

        // Suppression du champ stocks brut du retour
        const { stocks, ...siteData } = site;

        return {
          ...siteData,
          articleCount,
          lastMovementAt: lastMovement?.createdAt ?? null,
        };
      })
    );

    res.status(200).json({
      success: true,
      sites: sitesWithDetails,
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des sites :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};

/**
 * Création d'un nouveau site de stockage
 */
export const createSite = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentification requise' });
      return;
    }

    // Validation des données d'entrée
    const parsed = siteSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: 'Données du site invalides',
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    // Création du site
    const site = await prisma.site.create({
      data: parsed.data,
    });

    // Journal d'audit
    await createAuditLog({
      action: 'CREATE_SITE',
      entityType: 'Site',
      entityId: site.id,
      userId: req.user.userId,
      newValue: {
        name: site.name,
        address: site.address,
      },
    });

    logger.info(`Site créé : ${site.name}`);

    res.status(201).json({
      success: true,
      site,
    });
  } catch (error) {
    // Gestion de l'erreur d'unicité sur le nom du site
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      res.status(409).json({
        success: false,
        message: 'Un site avec ce nom existe déjà',
      });
      return;
    }

    logger.error('Erreur lors de la création du site :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};

/**
 * Mise à jour d'un site existant
 * Enregistre les anciennes et nouvelles valeurs dans le journal d'audit
 */
export const updateSite = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentification requise' });
      return;
    }

    const { id } = req.params;

    // Validation des données d'entrée
    const parsed = siteSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: 'Données du site invalides',
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    // Récupération du site existant pour comparaison
    const existingSite = await prisma.site.findUnique({
      where: { id },
    });

    if (!existingSite) {
      res.status(404).json({
        success: false,
        message: 'Site introuvable',
      });
      return;
    }

    // Mise à jour du site
    const updatedSite = await prisma.site.update({
      where: { id },
      data: parsed.data,
    });

    // Journal d'audit avec les anciennes et nouvelles valeurs
    await createAuditLog({
      action: 'UPDATE_SITE',
      entityType: 'Site',
      entityId: id,
      userId: req.user.userId,
      oldValue: {
        name: existingSite.name,
        address: existingSite.address,
      },
      newValue: {
        name: updatedSite.name,
        address: updatedSite.address,
      },
    });

    logger.info(`Site mis à jour : ${updatedSite.name}`);

    res.status(200).json({
      success: true,
      site: updatedSite,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      res.status(409).json({
        success: false,
        message: 'Un site avec ce nom existe déjà',
      });
      return;
    }

    logger.error('Erreur lors de la mise à jour du site :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};
