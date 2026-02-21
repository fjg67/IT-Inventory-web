// Contrôleur d'export — génération de fichiers Excel pour les articles et mouvements

import { Request, Response } from 'express';
import ExcelJS from 'exceljs';
import prisma from '../utils/prisma';
import logger from '../utils/logger';
import { Prisma } from '@prisma/client';

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
