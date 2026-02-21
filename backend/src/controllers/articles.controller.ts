// Contrôleur des articles — CRUD et historique des articles du stock informatique

import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { createAuditLog } from '../middleware/audit';
import logger from '../utils/logger';
import { articleSchema } from '../utils/validation';
import { Prisma } from '@prisma/client';

/**
 * Récupération paginée des articles
 * Supporte la recherche, le filtrage par catégorie/site/statut et le tri
 */
export const getArticles = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 25));
    const skip = (page - 1) * limit;

    const search = (req.query.search as string) || undefined;
    const category = (req.query.category as string) || undefined;
    const site = (req.query.site as string) || undefined;
    const status = (req.query.status as string) || undefined;
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as string) === 'asc' ? 'asc' : 'desc';

    // Construction du filtre Prisma
    const where: Prisma.ArticleWhereInput = {
      isArchived: false,
    };

    // Recherche textuelle sur nom, référence et code-barres
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { reference: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filtre par catégorie
    if (category) {
      where.category = category;
    }

    // Filtre par site — ne retourne que les articles présents sur le site sélectionné
    if (site) {
      where.stocks = {
        some: { siteId: site },
      };
    }

    // Récupération des articles avec leurs stocks
    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          stocks: {
            include: { site: true },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.article.count({ where }),
    ]);

    // Calcul du stock total et ajout du statut pour chaque article
    const articlesWithTotal = articles.map((article) => {
      const totalStock = article.stocks.reduce((sum, s) => sum + s.quantity, 0);
      let stockStatus: string;

      if (totalStock === 0) {
        stockStatus = 'out';
      } else if (totalStock <= article.minStock) {
        stockStatus = 'low';
      } else {
        stockStatus = 'ok';
      }

      return {
        ...article,
        totalStock,
        stockStatus,
        status: stockStatus,
      };
    });

    // Filtrage par statut après calcul (impossible en base directement)
    const filteredArticles = status
      ? articlesWithTotal.filter((a) => a.stockStatus === status)
      : articlesWithTotal;

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      articles: filteredArticles,
      total: status ? filteredArticles.length : total,
      page,
      totalPages,
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des articles :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};

/**
 * Récupération d'un article par son identifiant
 * Inclut les stocks par site et les 20 derniers mouvements
 */
export const getArticleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        stocks: {
          include: { site: true },
        },
        movements: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                technicianId: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!article) {
      res.status(404).json({
        success: false,
        message: 'Article introuvable',
      });
      return;
    }

    // Calcul du stock total
    const totalStock = article.stocks.reduce((sum, s) => sum + s.quantity, 0);

    res.status(200).json({
      success: true,
      article: {
        ...article,
        totalStock,
      },
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération de l\'article :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};

/**
 * Création d'un nouvel article
 * Crée automatiquement des entrées ArticleStock pour tous les sites existants
 */
export const createArticle = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentification requise' });
      return;
    }

    // Validation des données d'entrée
    const parsed = articleSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: 'Données de l\'article invalides',
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    // Récupération de tous les sites actifs pour créer les stocks initiaux
    const sites = await prisma.site.findMany({
      where: { isActive: true },
      select: { id: true },
    });

    const { siteId, initialStock, ...articleData } = parsed.data;

    // Cr\u00e9ation de l'article avec les stocks initiaux
    const article = await prisma.article.create({
      data: {
        ...articleData,
        stocks: {
          create: sites.map((s) => ({
            siteId: s.id,
            quantity: (siteId && s.id === siteId && initialStock) ? initialStock : 0,
          })),
        },
      },
      include: {
        stocks: {
          include: { site: true },
        },
      },
    });

    // Enregistrement dans le journal d'audit
    await createAuditLog({
      action: 'CREATE_ARTICLE',
      entityType: 'Article',
      entityId: article.id,
      userId: req.user.userId,
      newValue: {
        reference: article.reference,
        name: article.name,
        category: article.category,
        brand: article.brand,
        model: article.model,
      },
      articleId: article.id,
    });

    logger.info(`Article créé : ${article.reference} — ${article.name}`);

    res.status(201).json({
      success: true,
      article,
    });
  } catch (error) {
    // Gestion des erreurs d'unicité (référence ou code-barres déjà existant)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const target = (error.meta?.target as string[]) || [];
      const field = target.includes('reference') ? 'référence' : 'code-barres';
      res.status(409).json({
        success: false,
        message: `Un article avec cette ${field} existe déjà`,
      });
      return;
    }

    logger.error('Erreur lors de la création de l\'article :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};

/**
 * Mise à jour d'un article existant
 * Enregistre les anciennes et nouvelles valeurs dans le journal d'audit
 */
export const updateArticle = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentification requise' });
      return;
    }

    const { id } = req.params;

    // Validation des données d'entrée
    const parsed = articleSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: 'Données de l\'article invalides',
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    // Récupération de l'article existant pour comparaison
    const existingArticle = await prisma.article.findUnique({
      where: { id },
    });

    if (!existingArticle) {
      res.status(404).json({
        success: false,
        message: 'Article introuvable',
      });
      return;
    }

    // Mise à jour de l'article
    const updatedArticle = await prisma.article.update({
      where: { id },
      data: parsed.data,
      include: {
        stocks: {
          include: { site: true },
        },
      },
    });

    // Enregistrement de l'audit avec les anciennes et nouvelles valeurs
    await createAuditLog({
      action: 'UPDATE_ARTICLE',
      entityType: 'Article',
      entityId: id,
      userId: req.user.userId,
      oldValue: {
        reference: existingArticle.reference,
        name: existingArticle.name,
        category: existingArticle.category,
        brand: existingArticle.brand,
        model: existingArticle.model,
        minStock: existingArticle.minStock,
      },
      newValue: {
        reference: updatedArticle.reference,
        name: updatedArticle.name,
        category: updatedArticle.category,
        brand: updatedArticle.brand,
        model: updatedArticle.model,
        minStock: updatedArticle.minStock,
      },
      articleId: id,
    });

    logger.info(`Article mis à jour : ${updatedArticle.reference}`);

    res.status(200).json({
      success: true,
      article: updatedArticle,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const target = (error.meta?.target as string[]) || [];
      const field = target.includes('reference') ? 'référence' : 'code-barres';
      res.status(409).json({
        success: false,
        message: `Un article avec cette ${field} existe déjà`,
      });
      return;
    }

    logger.error('Erreur lors de la mise à jour de l\'article :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};

/**
 * Suppression logique d'un article (archivage)
 * L'article n'est pas supprimé physiquement mais marqué comme archivé
 */
export const deleteArticle = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentification requise' });
      return;
    }

    const { id } = req.params;

    // Vérification de l'existence de l'article
    const article = await prisma.article.findUnique({
      where: { id },
    });

    if (!article) {
      res.status(404).json({
        success: false,
        message: 'Article introuvable',
      });
      return;
    }

    // Archivage de l'article (suppression logique)
    await prisma.article.update({
      where: { id },
      data: { isArchived: true },
    });

    // Journal d'audit
    await createAuditLog({
      action: 'DELETE_ARTICLE',
      entityType: 'Article',
      entityId: id,
      userId: req.user.userId,
      oldValue: {
        reference: article.reference,
        name: article.name,
        isArchived: false,
      },
      newValue: {
        isArchived: true,
      },
      articleId: id,
    });

    logger.info(`Article archivé : ${article.reference} — ${article.name}`);

    res.status(200).json({
      success: true,
      message: 'Article archivé avec succès',
    });
  } catch (error) {
    logger.error('Erreur lors de l\'archivage de l\'article :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};

/**
 * Historique des mouvements d'un article spécifique
 * Paginé avec filtrage optionnel par plage de dates
 */
export const getArticleHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 25));
    const skip = (page - 1) * limit;

    const from = (req.query.from as string) || undefined;
    const to = (req.query.to as string) || undefined;

    // Vérification de l'existence de l'article
    const article = await prisma.article.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!article) {
      res.status(404).json({
        success: false,
        message: 'Article introuvable',
      });
      return;
    }

    // Construction du filtre avec plage de dates optionnelle
    const where: Prisma.StockMovementWhereInput = {
      articleId: id,
    };

    if (from || to) {
      where.createdAt = {};
      if (from) {
        where.createdAt.gte = new Date(from);
      }
      if (to) {
        where.createdAt.lte = new Date(to);
      }
    }

    // Récupération des mouvements paginés
    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        include: {
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
    logger.error('Erreur lors de la récupération de l\'historique :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};
