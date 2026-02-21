// Contrôleur du journal d'audit — consultation de l'historique des actions

import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import logger from '../utils/logger';
import { Prisma } from '@prisma/client';

/**
 * Récupération paginée des journaux d'audit
 * Filtrage par utilisateur, type d'action et plage de dates
 */
export const getAuditLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 25));
    const skip = (page - 1) * limit;

    const userId = (req.query.userId as string) || undefined;
    const action = (req.query.action as string) || undefined;
    const from = (req.query.from as string) || undefined;
    const to = (req.query.to as string) || undefined;

    // Construction du filtre
    const where: Prisma.AuditLogWhereInput = {};

    if (userId) {
      where.userId = userId;
    }

    if (action) {
      where.action = { contains: action, mode: 'insensitive' };
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

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              technicianId: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      logs,
      total,
      page,
      totalPages,
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des journaux d\'audit :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};
