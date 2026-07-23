import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import logger from '../utils/logger';
import { createAuditLog } from '../middleware/audit';
import { pcSchema, pcStatusUpdateSchema } from '../utils/validation';
import { isPcArticle, toPCRecordFromArticle } from '../utils/pcClassification';

const DEFAULT_STATUS = 'disponible';

const bootstrapParcPCFromArticles = async (): Promise<void> => {
  const articles = await prisma.article.findMany({
    where: { isArchived: false },
    select: {
      reference: true,
      name: true,
      description: true,
      category: true,
      articleType: true,
      sousType: true,
      brand: true,
      emplacement: true,
      createdAt: true,
      updatedAt: true,
      stocks: {
        where: { quantity: { gt: 0 } },
        select: {
          quantity: true,
          site: { select: { name: true } },
        },
      },
    },
  });

  const pcs = articles.filter(isPcArticle).map(toPCRecordFromArticle);
  if (pcs.length === 0) {
    return;
  }

  await prisma.pC.createMany({
    data: pcs.map((pc) => ({
      hostname: pc.hostname,
      asset: pc.asset,
      model: pc.model,
      category: pc.category,
      status: pc.status || DEFAULT_STATUS,
      site: pc.site,
      sentTo: pc.sentTo,
      sentRecipient: pc.sentRecipient,
      notes: pc.notes,
      createdAt: pc.createdAt,
      updatedAt: pc.updatedAt,
    })),
    skipDuplicates: true,
  });
};

export const getParcPC = async (_req: Request, res: Response): Promise<void> => {
  try {
    await bootstrapParcPCFromArticles();

    const pcs = await prisma.pC.findMany({
      orderBy: [
        { updatedAt: 'desc' },
        { hostname: 'asc' },
      ],
    });

    res.status(200).json({ success: true, pcs });
  } catch (error) {
    logger.error('Erreur lors de la récupération du parc PC :', error);
    res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
  }
};

export const getPCById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const pc = await prisma.pC.findUnique({ where: { id } });

    if (!pc) {
      res.status(404).json({ success: false, message: 'PC introuvable' });
      return;
    }

    res.status(200).json({ success: true, pc });
  } catch (error) {
    logger.error('Erreur lors de la récupération du PC :', error);
    res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
  }
};

export const createPC = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentification requise' });
      return;
    }

    const parsed = pcSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: 'Données PC invalides',
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const pc = await prisma.pC.create({
      data: {
        ...parsed.data,
        status: parsed.data.status ?? DEFAULT_STATUS,
        sentTo: parsed.data.sentTo || null,
        sentRecipient: parsed.data.sentRecipient || null,
        notes: parsed.data.notes || null,
      },
    });

    await createAuditLog({
      action: 'CREATE_PC',
      entityType: 'PC',
      entityId: pc.id,
      userId: req.user.userId,
      newValue: pc,
    });

    res.status(201).json({ success: true, pc });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      res.status(409).json({ success: false, message: 'Hostname ou asset déjà utilisé' });
      return;
    }

    logger.error('Erreur lors de la création du PC :', error);
    res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
  }
};

export const updatePC = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentification requise' });
      return;
    }

    const { id } = req.params;
    const parsed = pcSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: 'Données PC invalides',
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const existingPC = await prisma.pC.findUnique({ where: { id } });
    if (!existingPC) {
      res.status(404).json({ success: false, message: 'PC introuvable' });
      return;
    }

    const pc = await prisma.pC.update({
      where: { id },
      data: {
        ...parsed.data,
        sentTo: parsed.data.sentTo === undefined ? undefined : parsed.data.sentTo || null,
        sentRecipient: parsed.data.sentRecipient === undefined ? undefined : parsed.data.sentRecipient || null,
        notes: parsed.data.notes === undefined ? undefined : parsed.data.notes || null,
      },
    });

    await createAuditLog({
      action: 'UPDATE_PC',
      entityType: 'PC',
      entityId: pc.id,
      userId: req.user.userId,
      oldValue: existingPC,
      newValue: pc,
    });

    res.status(200).json({ success: true, pc });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      res.status(409).json({ success: false, message: 'Hostname ou asset déjà utilisé' });
      return;
    }

    logger.error('Erreur lors de la mise à jour du PC :', error);
    res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
  }
};

export const updatePCStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentification requise' });
      return;
    }

    const { id } = req.params;
    const parsed = pcStatusUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: 'Statut PC invalide',
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const existingPC = await prisma.pC.findUnique({ where: { id } });
    if (!existingPC) {
      res.status(404).json({ success: false, message: 'PC introuvable' });
      return;
    }

    const pc = await prisma.pC.update({
      where: { id },
      data: {
        status: parsed.data.status,
        sentTo: parsed.data.sentTo === undefined ? undefined : parsed.data.sentTo || null,
        sentRecipient: parsed.data.sentRecipient === undefined ? undefined : parsed.data.sentRecipient || null,
        notes: parsed.data.notes === undefined ? undefined : parsed.data.notes || null,
      },
    });

    await createAuditLog({
      action: 'UPDATE_PC_STATUS',
      entityType: 'PC',
      entityId: pc.id,
      userId: req.user.userId,
      oldValue: { status: existingPC.status, sentTo: existingPC.sentTo, sentRecipient: existingPC.sentRecipient },
      newValue: { status: pc.status, sentTo: pc.sentTo, sentRecipient: pc.sentRecipient },
    });

    res.status(200).json({ success: true, pc });
  } catch (error) {
    logger.error('Erreur lors de la mise à jour du statut PC :', error);
    res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
  }
};

export const deletePC = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentification requise' });
      return;
    }

    const { id } = req.params;
    const existingPC = await prisma.pC.findUnique({ where: { id } });
    if (!existingPC) {
      res.status(404).json({ success: false, message: 'PC introuvable' });
      return;
    }

    await prisma.pC.delete({ where: { id } });

    await createAuditLog({
      action: 'DELETE_PC',
      entityType: 'PC',
      entityId: id,
      userId: req.user.userId,
      oldValue: existingPC,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Erreur lors de la suppression du PC :', error);
    res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
  }
};