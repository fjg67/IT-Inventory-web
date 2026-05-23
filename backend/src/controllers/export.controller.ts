// Contrôleur d'export — génération de fichiers Excel pour les articles et mouvements

import { Request, Response } from 'express';
import ExcelJS from 'exceljs';
import prisma from '../utils/prisma';
import logger from '../utils/logger';
import { Prisma } from '@prisma/client';

const csvEscape = (value: unknown): string => {
  const text = value === null || value === undefined ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
};

const csvLine = (values: unknown[]): string => values.map(csvEscape).join(';');

const toFrDateTime = (date: Date): string => date.toLocaleString('fr-FR');

/**
 * Export Excel de la liste des articles
 * Colonnes : Référence, Nom, Catégorie, Marque, Modèle, Stock Total, Stock Min, Statut
 */
export const exportArticles = async (req: Request, res: Response): Promise<void> => {
  try {
    // Récupération de tous les articles non archivés avec leurs stocks
    const articles = await prisma.article.findMany({
      where: { isArchived: false },
      include: {
        stocks: true,
      },
      orderBy: { reference: 'asc' },
    });

    // Création du classeur Excel
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'IT-Inventory';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Articles');

    // Définition des colonnes
    worksheet.columns = [
      { header: 'Référence', key: 'reference', width: 18 },
      { header: 'Nom', key: 'name', width: 30 },
      { header: 'Catégorie', key: 'category', width: 20 },
      { header: 'Marque', key: 'brand', width: 18 },
      { header: 'Modèle', key: 'model', width: 18 },
      { header: 'Stock Total', key: 'totalStock', width: 14 },
      { header: 'Stock Min', key: 'minStock', width: 12 },
      { header: 'Statut', key: 'status', width: 14 },
    ];

    // Style de l'en-tête
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2563EB' },
    };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

    // Remplissage des données
    for (const article of articles) {
      const totalStock = article.stocks.reduce((sum, s) => sum + s.quantity, 0);

      let status: string;
      if (totalStock === 0) {
        status = 'Rupture';
      } else if (totalStock <= article.minStock) {
        status = 'Stock bas';
      } else {
        status = 'OK';
      }

      const row = worksheet.addRow({
        reference: article.reference,
        name: article.name,
        category: article.category,
        brand: article.brand ?? '',
        model: article.model ?? '',
        totalStock,
        minStock: article.minStock,
        status,
      });

      // Coloration conditionnelle de la cellule statut
      const statusCell = row.getCell('status');
      if (status === 'Rupture') {
        statusCell.font = { bold: true, color: { argb: 'FFDC2626' } };
      } else if (status === 'Stock bas') {
        statusCell.font = { bold: true, color: { argb: 'FFF59E0B' } };
      } else {
        statusCell.font = { color: { argb: 'FF16A34A' } };
      }
    }

    // Définition des en-têtes de réponse HTTP pour le téléchargement
    const filename = `articles_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Écriture du fichier dans la réponse
    await workbook.xlsx.write(res);
    res.end();

    logger.info(`Export Excel des articles généré (${articles.length} articles)`);
  } catch (error) {
    logger.error('Erreur lors de l\'export des articles :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};

/**
 * Export CSV "fiche article" (résumé + stock actuel + historique complet des mouvements)
 */
export const exportArticleCsv = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        stocks: {
          include: {
            site: {
              select: { id: true, name: true },
            },
          },
          orderBy: {
            site: {
              name: 'asc',
            },
          },
        },
      },
    });

    if (!article || article.isArchived) {
      res.status(404).json({
        success: false,
        message: 'Article introuvable',
      });
      return;
    }

    const movements = await prisma.stockMovement.findMany({
      where: { articleId: article.id },
      include: {
        fromSite: { select: { id: true, name: true } },
        toSite: { select: { id: true, name: true } },
        user: { select: { technicianId: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalStock = article.stocks.reduce((sum, stock) => sum + stock.quantity, 0);
    const status =
      totalStock === 0 ? 'Rupture' : totalStock <= article.minStock ? 'Stock bas' : 'OK';
    const movementsAsc = [...movements].reverse();
    const movementStats = movements.reduce(
      (acc, movement) => {
        acc.total += 1;
        if (movement.type === 'ENTRY') acc.entries += 1;
        if (movement.type === 'EXIT') acc.exits += 1;
        if (movement.type === 'TRANSFER') acc.transfers += 1;
        if (movement.type === 'ADJUSTMENT') acc.adjustments += 1;
        return acc;
      },
      { total: 0, entries: 0, exits: 0, transfers: 0, adjustments: 0 }
    );

    const lines: string[] = [];

    // En-tête de document
    lines.push(csvLine(['==============================================================']));
    lines.push(csvLine(['IT-Inventory - FICHE ARTICLE - EXPORT CSV PREMIUM']));
    lines.push(csvLine(['==============================================================']));
    lines.push(csvLine(['Genere le', toFrDateTime(new Date())]));
    lines.push(csvLine(['']));

    // Section 1: Résumé
    lines.push(csvLine(['[1] RESUME ARTICLE']));
    lines.push(csvLine(['Champ', 'Valeur']));
    lines.push(csvLine(['Reference', article.reference]));
    lines.push(csvLine(['Nom', article.name]));
    lines.push(csvLine(['Categorie', article.category]));
    lines.push(csvLine(['Marque', article.brand ?? '']));
    lines.push(csvLine(['Modele', article.model ?? '']));
    lines.push(csvLine(['Unite', article.unit]));
    lines.push(csvLine(['Stock minimum', article.minStock]));
    lines.push(csvLine(['Stock actuel total', totalStock]));
    lines.push(csvLine(['Statut', status]));
    lines.push(csvLine(['']));

    // Section 1B: KPIs historiques
    lines.push(csvLine(['[1B] KPIs MOUVEMENTS']));
    lines.push(csvLine(['Indicateur', 'Valeur']));
    lines.push(csvLine(['Mouvements (total)', movementStats.total]));
    lines.push(csvLine(['Entrees', movementStats.entries]));
    lines.push(csvLine(['Sorties', movementStats.exits]));
    lines.push(csvLine(['Transferts', movementStats.transfers]));
    lines.push(csvLine(['Ajustements', movementStats.adjustments]));
    lines.push(csvLine(['']));

    // Section 2: Stocks par site
    lines.push(csvLine(['[2] STOCK ACTUEL PAR SITE']));
    lines.push(csvLine(['Site', 'Quantite', 'Part du stock total']));
    if (article.stocks.length === 0) {
      lines.push(csvLine(['Aucun stock enregistre', 0, '0%']));
    } else {
      for (const stock of article.stocks) {
        const ratio = totalStock > 0 ? `${Math.round((stock.quantity / totalStock) * 100)}%` : '0%';
        lines.push(csvLine([stock.site.name, stock.quantity, ratio]));
      }
    }
    lines.push(csvLine(['']));

    // Section 3: Historique complet
    lines.push(csvLine(['[3] HISTORIQUE COMPLET DES MOUVEMENTS']));
    lines.push(
      csvLine([
        '#',
        'Date',
        'Type',
        'Sens',
        'Variation',
        'Quantite',
        'Stock apres mouvement',
        'Site source',
        'Site destination',
        'Technicien',
        'Raison',
      ])
    );

    if (movements.length === 0) {
      lines.push(csvLine(['Aucun mouvement enregistre', '', '', '', '', '', '', '', '', '']));
    } else {
      const typeLabels: Record<string, string> = {
        ENTRY: 'Entree',
        EXIT: 'Sortie',
        ADJUSTMENT: 'Ajustement',
        TRANSFER: 'Transfert',
      };
      const sensLabels: Record<string, string> = {
        ENTRY: 'IN',
        EXIT: 'OUT',
        ADJUSTMENT: 'ADJ',
        TRANSFER: 'MOVE',
      };
      let runningStock = 0;

      for (let index = 0; index < movementsAsc.length; index += 1) {
        const movement = movementsAsc[index]!;
        const signedDelta =
          movement.type === 'ENTRY'
            ? movement.quantity
            : movement.type === 'EXIT'
              ? -movement.quantity
              : movement.type === 'ADJUSTMENT'
                ? movement.quantity
                : 0;
        runningStock += signedDelta;
        const variation =
          movement.type === 'ENTRY'
            ? `+${movement.quantity}`
            : movement.type === 'EXIT'
              ? `-${movement.quantity}`
              : movement.type === 'ADJUSTMENT'
                ? `${movement.quantity >= 0 ? '+' : ''}${movement.quantity}`
                : `-${movement.quantity} puis +${movement.quantity}`;

        lines.push(
          csvLine([
            index + 1,
            toFrDateTime(movement.createdAt),
            typeLabels[movement.type] ?? movement.type,
            sensLabels[movement.type] ?? movement.type,
            variation,
            movement.quantity,
            runningStock,
            movement.fromSite?.name ?? '',
            movement.toSite?.name ?? '',
            `${movement.user.name} (${movement.user.technicianId})`,
            movement.reason ?? '',
          ])
        );
      }
    }

    const safeReference = article.reference.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `article_${safeReference}_${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    // UTF-8 BOM pour un affichage correct dans Excel (accents)
    res.status(200).send(`\uFEFF${lines.join('\n')}`);

    logger.info(`Export CSV fiche article généré (${article.reference}, ${movements.length} mouvements)`);
  } catch (error) {
    logger.error('Erreur lors de l\'export CSV fiche article :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};

/**
 * Export Excel des mouvements de stock
 * Colonnes : Date, Technicien, Article, Type, Quantité, Site Source, Site Destination, Raison
 * Supporte les mêmes filtres que getMovements
 */
export const exportMovements = async (req: Request, res: Response): Promise<void> => {
  try {
    const type = (req.query.type as string) || undefined;
    const userId = (req.query.userId as string) || undefined;
    const siteId = (req.query.siteId as string) || undefined;
    const from = (req.query.from as string) || undefined;
    const to = (req.query.to as string) || undefined;

    // Construction du filtre (identique à getMovements)
    const where: Prisma.StockMovementWhereInput = {};

    if (type) {
      where.type = type as Prisma.EnumMovementTypeFilter['equals'];
    }

    if (userId) {
      where.userId = userId;
    }

    if (siteId) {
      where.OR = [
        { fromSiteId: siteId },
        { toSiteId: siteId },
      ];
    }

    if (from || to) {
      where.createdAt = {};
      if (from) {
        where.createdAt.gte = new Date(from);
      }
      if (to) {
        where.createdAt.lte = new Date(to);
      }
    }

    // Récupération des mouvements filtrés avec les données liées
    const movements = await prisma.stockMovement.findMany({
      where,
      include: {
        article: {
          select: { reference: true, name: true },
        },
        user: {
          select: { technicianId: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Récupération des noms de sites pour l'affichage
    const sites = await prisma.site.findMany({
      select: { id: true, name: true },
    });
    const siteMap = new Map(sites.map((s) => [s.id, s.name]));

    // Traduction des types de mouvement en français
    const typeLabels: Record<string, string> = {
      ENTRY: 'Entrée',
      EXIT: 'Sortie',
      ADJUSTMENT: 'Ajustement',
      TRANSFER: 'Transfert',
    };

    // Création du classeur Excel
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'IT-Inventory';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Mouvements');

    // Définition des colonnes
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 20 },
      { header: 'Technicien', key: 'technician', width: 25 },
      { header: 'Article', key: 'article', width: 30 },
      { header: 'Type', key: 'type', width: 14 },
      { header: 'Quantité', key: 'quantity', width: 12 },
      { header: 'Site Source', key: 'fromSite', width: 20 },
      { header: 'Site Destination', key: 'toSite', width: 20 },
      { header: 'Raison', key: 'reason', width: 30 },
    ];

    // Style de l'en-tête
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2563EB' },
    };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

    // Remplissage des données
    for (const movement of movements) {
      worksheet.addRow({
        date: movement.createdAt.toLocaleString('fr-FR'),
        technician: `${movement.user.name} (${movement.user.technicianId})`,
        article: `${movement.article.reference} — ${movement.article.name}`,
        type: typeLabels[movement.type] ?? movement.type,
        quantity: movement.quantity,
        fromSite: movement.fromSiteId ? (siteMap.get(movement.fromSiteId) ?? '') : '',
        toSite: movement.toSiteId ? (siteMap.get(movement.toSiteId) ?? '') : '',
        reason: movement.reason ?? '',
      });
    }

    // Définition des en-têtes de réponse HTTP pour le téléchargement
    const filename = `mouvements_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Écriture du fichier dans la réponse
    await workbook.xlsx.write(res);
    res.end();

    logger.info(`Export Excel des mouvements généré (${movements.length} mouvements)`);
  } catch (error) {
    logger.error('Erreur lors de l\'export des mouvements :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};
