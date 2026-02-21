// Middleware d'audit — traçabilité des actions utilisateur
// Enregistre les modifications dans le journal d'audit

import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client';
import logger from '../utils/logger';

// Types pour les paramètres du journal d'audit
interface AuditLogParams {
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  oldValue?: Prisma.InputJsonValue;
  newValue?: Prisma.InputJsonValue;
  articleId?: string;
}

/**
 * Crée une entrée dans le journal d'audit
 * Enregistre l'action effectuée, l'entité concernée et les valeurs avant/après modification
 */
export const createAuditLog = async ({
  action,
  entityType,
  entityId,
  userId,
  oldValue,
  newValue,
  articleId,
}: AuditLogParams): Promise<void> => {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        entityType,
        entityId,
        userId,
        oldValue: oldValue ?? undefined,
        newValue: newValue ?? undefined,
        articleId: articleId ?? null,
      },
    });

    logger.info(
      `Audit: ${action} sur ${entityType} (${entityId}) par l'utilisateur ${userId}`
    );
  } catch (error) {
    // On ne bloque pas l'opération principale en cas d'erreur d'audit
    logger.error('Erreur lors de la création du log d\'audit:', error);
  }
};
