// Contrôleur des alertes — détection des articles en rupture ou sous le seuil minimum

import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import logger from '../utils/logger';

/**
 * Récupération des alertes de stock
 * Retourne les stocks dont la quantité est inférieure ou égale au seuil minimum de l'article
 * Triés par criticité : rupture totale d'abord, puis écart croissant avec le seuil
 */
export const getAlerts = async (req: Request, res: Response): Promise<void> => {
  try {
    const siteId = (req.query.siteId as string) || undefined;

    // Recherche des stocks pour les articles ayant un seuil minimum défini
    const alertStocks = await prisma.articleStock.findMany({
      where: {
        article: {
          isArchived: false,
          minStock: { gt: 0 },
        },
        ...(siteId ? { siteId } : {}),
      },
      include: {
        article: true,
        site: true,
      },
    });

    // Filtrage côté application : garder uniquement les stocks ≤ minStock de l'article
    const filteredAlerts = alertStocks
      .filter((stock) => stock.quantity <= stock.article.minStock)
      .map((stock) => ({
        ...stock,
        gap: stock.article.minStock - stock.quantity, // Écart avec le seuil minimum
        criticality: stock.quantity === 0 ? 'critical' : 'warning',
      }))
      .sort((a, b) => {
        // Tri par criticité : rupture totale (quantity=0) en premier
        if (a.quantity === 0 && b.quantity !== 0) return -1;
        if (a.quantity !== 0 && b.quantity === 0) return 1;
        // Puis tri par écart décroissant avec le seuil minimum (plus grand écart = plus critique)
        return b.gap - a.gap;
      });

    res.status(200).json({
      success: true,
      alerts: filteredAlerts,
      total: filteredAlerts.length,
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des alertes :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};
