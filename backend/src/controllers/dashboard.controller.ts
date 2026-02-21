// Contrôleur du tableau de bord — statistiques et graphiques pour la vue d'ensemble

import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import logger from '../utils/logger';

/**
 * Statistiques générales du tableau de bord
 * Retourne les compteurs principaux et le delta mensuel
 */
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const siteId = req.query.siteId as string | undefined;
    const now = new Date();

    // Début de la journée en cours (minuit)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Il y a 30 jours pour le calcul du delta mensuel
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Filtre mouvement par site (fromSiteId ou toSiteId)
    const movementSiteFilter = siteId
      ? { OR: [{ fromSiteId: siteId }, { toSiteId: siteId }] }
      : {};

    // Filtre stock par site
    const stockSiteFilter = siteId ? { siteId } : {};

    // 7 derniers jours pour les sparklines
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Requêtes parallèles pour optimiser les performances
    const [
      allArticlesWithStocks,
      todayMovements,
      totalArticlesLastMonth,
      last7DaysMovements,
      articlesCreatedLast7Days,
    ] = await Promise.all([
      // Tous les articles avec leurs stocks (filtrés par site si demandé)
      prisma.article.findMany({
        where: { isArchived: false },
        include: {
          stocks: {
            where: stockSiteFilter,
            select: { quantity: true },
          },
        },
      }),

      // Nombre de mouvements créés aujourd'hui (filtrés par site)
      prisma.stockMovement.count({
        where: {
          createdAt: { gte: todayStart },
          ...movementSiteFilter,
        },
      }),

      // Nombre d'articles non archivés il y a 30 jours (approximation via date de création)
      prisma.article.count({
        where: {
          isArchived: false,
          createdAt: { lte: thirtyDaysAgo },
        },
      }),

      // Mouvements des 7 derniers jours avec leur type et date (pour sparklines)
      prisma.stockMovement.findMany({
        where: {
          createdAt: { gte: sevenDaysAgo },
          ...movementSiteFilter,
        },
        select: { type: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),

      // Articles créés les 7 derniers jours (pour sparkline total articles)
      prisma.article.findMany({
        where: {
          isArchived: false,
          createdAt: { gte: sevenDaysAgo },
        },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    // Quand on filtre par site, seuls compter les articles qui ont du stock > 0 sur ce site
    const articlesOnSite = siteId
      ? allArticlesWithStocks.filter(a => a.stocks.some(s => s.quantity > 0))
      : allArticlesWithStocks;

    const totalArticles = articlesOnSite.length;

    // Calcul du nombre d'articles en rupture totale et stock bas
    // Pour la vue par site : on regarde le stock du site
    // Pour la vue globale : on regarde le stock total tous sites confondus
    let outOfStock = 0;
    let lowStock = 0;

    if (siteId) {
      // Vue par site : alertes basées sur le stock de ce site uniquement
      for (const article of allArticlesWithStocks) {
        const siteStock = article.stocks.reduce((sum, s) => sum + s.quantity, 0);
        if (article.stocks.length > 0 && siteStock === 0) {
          outOfStock++;
        } else if (article.minStock > 0 && siteStock > 0 && siteStock <= article.minStock) {
          lowStock++;
        }
      }
    } else {
      // Vue globale : alertes basées sur le stock total tous sites
      for (const article of allArticlesWithStocks) {
        const totalStock = article.stocks.reduce((sum, s) => sum + s.quantity, 0);
        if (totalStock === 0) {
          outOfStock++;
        } else if (article.minStock > 0 && totalStock <= article.minStock) {
          lowStock++;
        }
      }
    }

    res.status(200).json({
      success: true,
      stats: {
        totalArticles,
        outOfStock,
        lowStock,
        todayMovements,
        totalArticlesLastMonth,
        sparklines: buildSparklines(now, last7DaysMovements, articlesCreatedLast7Days, totalArticles),
      },
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des statistiques :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};

/**
 * Données du graphique des mouvements
 * Retourne les entrées et sorties groupées par jour sur les 30 derniers jours
 */
export const getMovementChart = async (req: Request, res: Response): Promise<void> => {
  try {
    const siteId = req.query.siteId as string | undefined;
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Filtre par site
    const siteFilter = siteId
      ? { OR: [{ fromSiteId: siteId }, { toSiteId: siteId }] }
      : {};

    // Récupération de tous les mouvements des 30 derniers jours
    const movements = await prisma.stockMovement.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        ...siteFilter,
      },
      select: {
        type: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Initialisation d'une map pour chaque jour des 30 derniers jours
    const chartData: Map<string, { entries: number; exits: number }> = new Map();

    for (let i = 0; i < 30; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (29 - i));
      const dateKey = date.toISOString().split('T')[0];
      chartData.set(dateKey, { entries: 0, exits: 0 });
    }

    // Agrégation des mouvements par jour et par type
    for (const movement of movements) {
      const dateKey = movement.createdAt.toISOString().split('T')[0];
      const dayData = chartData.get(dateKey);

      if (dayData) {
        if (movement.type === 'ENTRY') {
          dayData.entries++;
        } else if (movement.type === 'EXIT') {
          dayData.exits++;
        }
      }
    }

    // Conversion en tableau pour le frontend
    const chart = Array.from(chartData.entries()).map(([date, data]) => ({
      date,
      entries: data.entries,
      exits: data.exits,
    }));

    res.status(200).json({
      success: true,
      chart,
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des données du graphique :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};

/**
 * Top 10 des articles les plus mouvementés
 * Basé sur le nombre de mouvements des 30 derniers jours
 */
export const getTopArticles = async (req: Request, res: Response): Promise<void> => {
  try {
    const siteId = req.query.siteId as string | undefined;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Filtre par site
    const siteFilter = siteId
      ? { OR: [{ fromSiteId: siteId }, { toSiteId: siteId }] }
      : {};

    // Groupement des mouvements par article sur les 30 derniers jours
    const movementCounts = await prisma.stockMovement.groupBy({
      by: ['articleId'],
      where: {
        createdAt: { gte: thirtyDaysAgo },
        ...siteFilter,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    });

    // Récupération des noms des articles correspondants
    const articleIds = movementCounts.map((mc) => mc.articleId);
    const articles = await prisma.article.findMany({
      where: { id: { in: articleIds } },
      select: { id: true, name: true, reference: true },
    });

    const articleMap = new Map(articles.map((a) => [a.id, a]));

    // Construction du résultat avec le nom et le compteur
    const topArticles = movementCounts.map((mc) => {
      const article = articleMap.get(mc.articleId);
      return {
        name: article ? `${article.reference} — ${article.name}` : mc.articleId,
        count: mc._count.id,
      };
    });

    res.status(200).json({
      success: true,
      topArticles,
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération du top articles :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};

/**
 * Distribution des articles par catégorie
 * Retourne le nombre d'articles non archivés par catégorie
 */
export const getCategoryDistribution = async (req: Request, res: Response): Promise<void> => {
  try {
    const siteId = req.query.siteId as string | undefined;

    // Si un site est sélectionné, ne compter que les articles qui ont du stock sur ce site
    const articleFilter = siteId
      ? { isArchived: false, stocks: { some: { siteId, quantity: { gt: 0 } } } }
      : { isArchived: false };

    // Groupement des articles par catégorie
    const distribution = await prisma.article.groupBy({
      by: ['category'],
      where: articleFilter,
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    });

    // Formatage du résultat
    const categories = distribution.map((d) => ({
      category: d.category,
      count: d._count.id,
    }));

    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération de la distribution par catégorie :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};

/**
 * Helper : construit les données sparkline (7 jours) pour chaque KPI
 */
function buildSparklines(
  now: Date,
  movements: Array<{ type: string; createdAt: Date }>,
  articlesCreated: Array<{ createdAt: Date }>,
  currentTotalArticles: number,
): {
  totalArticles: number[];
  outOfStock: number[];
  lowStock: number[];
  movements: number[];
} {
  // Initialise les 7 jours
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }

  // Sparkline mouvements par jour
  const movPerDay: Record<string, number> = {};
  for (const day of days) movPerDay[day] = 0;
  for (const m of movements) {
    const key = m.createdAt.toISOString().split('T')[0];
    if (movPerDay[key] !== undefined) movPerDay[key]++;
  }
  const movementsSpark = days.map((d) => movPerDay[d]);

  // Sparkline total articles (cumulatif : combien d'articles existaient ce jour-là)
  // On part du total actuel et on soustrait les articles créés après chaque jour
  const articlesSpark = days.map((day) => {
    const createdAfter = articlesCreated.filter(
      (a) => a.createdAt.toISOString().split('T')[0] > day
    ).length;
    return currentTotalArticles - createdAfter;
  });

  // Sparkline sorties de stock (proxy pour rupture)
  const exitPerDay: Record<string, number> = {};
  for (const day of days) exitPerDay[day] = 0;
  for (const m of movements) {
    if (m.type === 'EXIT') {
      const key = m.createdAt.toISOString().split('T')[0];
      if (exitPerDay[key] !== undefined) exitPerDay[key]++;
    }
  }
  const outOfStockSpark = days.map((d) => exitPerDay[d]);

  // Sparkline entrées de stock (proxy inverse pour stock bas — plus d'entrées = correction)
  const entryPerDay: Record<string, number> = {};
  for (const day of days) entryPerDay[day] = 0;
  for (const m of movements) {
    if (m.type === 'ENTRY') {
      const key = m.createdAt.toISOString().split('T')[0];
      if (entryPerDay[key] !== undefined) entryPerDay[key]++;
    }
  }
  const lowStockSpark = days.map((d) => entryPerDay[d]);

  return {
    totalArticles: articlesSpark,
    outOfStock: outOfStockSpark,
    lowStock: lowStockSpark,
    movements: movementsSpark,
  };
}
