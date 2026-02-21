/// <reference types="node" />
// Script de peuplement de la base de données — données de test réalistes
// Usage : npx tsx prisma/seed.ts

import { PrismaClient, MovementType, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Début du peuplement de la base de données...\n');

  // --- Nettoyage complet ---
  await prisma.auditLog.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.articleStock.deleteMany();
  await prisma.article.deleteMany();
  await prisma.site.deleteMany();
  await prisma.user.deleteMany();
  console.log('🗑️  Base nettoyée');

  // --- 1. Création des sites ---
  const sites = await Promise.all([
    prisma.site.create({
      data: { name: 'Stock 5ème', address: '5ème étage, Bâtiment A' },
    }),
    prisma.site.create({
      data: { name: 'Stock 8ème', address: '8ème étage, Bâtiment A' },
    }),
    prisma.site.create({
      data: { name: 'Stock Epinal', address: 'Dépôt Epinal, 12 rue de la Gare' },
    }),
  ]);
  console.log(`📍 ${sites.length} sites créés`);

  // --- 2. Création des utilisateurs ---
  const hashedAdmin = await bcrypt.hash('!*A1Z2E3R4T5!', 10);
  const hashedTech = await bcrypt.hash('Tech!456', 10);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        technicianId: 'administrateur',
        name: 'Administrateur',
        password: hashedAdmin,
        role: Role.ADMIN,
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        technicianId: 'T097097',
        name: 'Sophie Durand',
        password: hashedTech,
        role: Role.TECHNICIAN,
        isActive: true,
      },
    }),
  ]);
  console.log(`👤 ${users.length} utilisateurs créés`);

  // --- 3. Création des articles (30 articles, 6 catégories) ---
  const articlesData = [
    // Câbles (5 articles)
    { reference: 'CBL-ETH-001', name: 'Câble Ethernet Cat6 1m', category: 'Câbles', brand: 'Belden', model: 'Cat6-1M', unit: 'pièce', minStock: 20 },
    { reference: 'CBL-ETH-002', name: 'Câble Ethernet Cat6 3m', category: 'Câbles', brand: 'Belden', model: 'Cat6-3M', unit: 'pièce', minStock: 15 },
    { reference: 'CBL-ETH-003', name: 'Câble Ethernet Cat6 5m', category: 'Câbles', brand: 'Belden', model: 'Cat6-5M', unit: 'pièce', minStock: 10 },
    { reference: 'CBL-HMI-001', name: 'Câble HDMI 2.1 2m', category: 'Câbles', brand: 'StarTech', model: 'HDMI21-2M', unit: 'pièce', minStock: 8 },
    { reference: 'CBL-USB-001', name: 'Câble USB-C vers USB-A 1m', category: 'Câbles', brand: 'Anker', model: 'A8163', unit: 'pièce', minStock: 15 },

    // Écrans (5 articles)
    { reference: 'ECR-DEL-001', name: 'Écran Dell 24" FHD', category: 'Écrans', brand: 'Dell', model: 'P2422H', unit: 'pièce', minStock: 3 },
    { reference: 'ECR-DEL-002', name: 'Écran Dell 27" QHD', category: 'Écrans', brand: 'Dell', model: 'P2723QE', unit: 'pièce', minStock: 2 },
    { reference: 'ECR-LEN-001', name: 'Écran Lenovo 23.8" FHD', category: 'Écrans', brand: 'Lenovo', model: 'T24i-30', unit: 'pièce', minStock: 3 },
    { reference: 'ECR-PHI-001', name: 'Écran Philips 34" Ultrawide', category: 'Écrans', brand: 'Philips', model: '346B1C', unit: 'pièce', minStock: 1 },
    { reference: 'ECR-SUP-001', name: 'Support écran double bras', category: 'Écrans', brand: 'Ergotron', model: 'LX Dual', unit: 'pièce', minStock: 2 },

    // Claviers/Souris (5 articles)
    { reference: 'PER-CLV-001', name: 'Clavier Logitech K850', category: 'Claviers/Souris', brand: 'Logitech', model: 'K850', unit: 'pièce', minStock: 5 },
    { reference: 'PER-CLV-002', name: 'Clavier Microsoft Ergonomic', category: 'Claviers/Souris', brand: 'Microsoft', model: 'LXM-00004', unit: 'pièce', minStock: 3 },
    { reference: 'PER-SOU-001', name: 'Souris Logitech MX Master 3S', category: 'Claviers/Souris', brand: 'Logitech', model: 'MX Master 3S', unit: 'pièce', minStock: 5 },
    { reference: 'PER-SOU-002', name: 'Souris Microsoft Arc', category: 'Claviers/Souris', brand: 'Microsoft', model: 'ELG-00002', unit: 'pièce', minStock: 3 },
    { reference: 'PER-PAD-001', name: 'Tapis de souris XXL', category: 'Claviers/Souris', brand: 'SteelSeries', model: 'QcK Edge XL', unit: 'pièce', minStock: 10 },

    // RAM/SSD (5 articles)
    { reference: 'MEM-DDR-001', name: 'RAM DDR4 8Go 3200MHz', category: 'RAM/SSD', brand: 'Kingston', model: 'KVR32N22S8/8', unit: 'barrette', minStock: 5 },
    { reference: 'MEM-DDR-002', name: 'RAM DDR4 16Go 3200MHz', category: 'RAM/SSD', brand: 'Kingston', model: 'KVR32N22D8/16', unit: 'barrette', minStock: 3 },
    { reference: 'MEM-DDR-003', name: 'RAM DDR5 16Go 5600MHz', category: 'RAM/SSD', brand: 'Crucial', model: 'CT16G56C46U5', unit: 'barrette', minStock: 3 },
    { reference: 'SSD-SAT-001', name: 'SSD SATA 500Go', category: 'RAM/SSD', brand: 'Samsung', model: '870 EVO 500Go', unit: 'pièce', minStock: 4 },
    { reference: 'SSD-NVM-001', name: 'SSD NVMe 1To', category: 'RAM/SSD', brand: 'Samsung', model: '980 PRO 1To', unit: 'pièce', minStock: 3 },

    // Réseau (5 articles)
    { reference: 'RES-SWI-001', name: 'Switch 8 ports Gigabit', category: 'Réseau', brand: 'Netgear', model: 'GS308', unit: 'pièce', minStock: 2 },
    { reference: 'RES-SWI-002', name: 'Switch 24 ports PoE+', category: 'Réseau', brand: 'Cisco', model: 'CBS250-24PP', unit: 'pièce', minStock: 1 },
    { reference: 'RES-WAP-001', name: 'Point d\'accès WiFi 6', category: 'Réseau', brand: 'Ubiquiti', model: 'U6-Pro', unit: 'pièce', minStock: 2 },
    { reference: 'RES-PAN-001', name: 'Panneau de brassage 24 ports', category: 'Réseau', brand: 'Legrand', model: 'LCS3 24P', unit: 'pièce', minStock: 1 },
    { reference: 'RES-RJ4-001', name: 'Connecteur RJ45 Cat6 (lot 100)', category: 'Réseau', brand: 'Legrand', model: 'Cat6-RJ45', unit: 'lot', minStock: 5 },

    // Divers (5 articles)
    { reference: 'DIV-CAS-001', name: 'Casque audio USB-C', category: 'Divers', brand: 'Jabra', model: 'Evolve2 40', unit: 'pièce', minStock: 3 },
    { reference: 'DIV-WEB-001', name: 'Webcam Full HD', category: 'Divers', brand: 'Logitech', model: 'C920s', unit: 'pièce', minStock: 3 },
    { reference: 'DIV-DOC-001', name: 'Station d\'accueil USB-C', category: 'Divers', brand: 'Dell', model: 'WD19S', unit: 'pièce', minStock: 2 },
    { reference: 'DIV-ALI-001', name: 'Chargeur USB-C 65W', category: 'Divers', brand: 'Dell', model: 'HA65NM190', unit: 'pièce', minStock: 5 },
    { reference: 'DIV-SAC-001', name: 'Sacoche PC portable 15"', category: 'Divers', brand: 'Targus', model: 'TBT236EU', unit: 'pièce', minStock: 4 },
  ];

  const articles = await Promise.all(
    articlesData.map((data) =>
      prisma.article.create({ data })
    )
  );
  console.log(`📦 ${articles.length} articles créés`);

  // --- 4. Création des stocks avec des quantités variées ---
  // Certains en alerte pour tester les notifications
  const stockEntries: Array<{ articleId: string; siteId: string; quantity: number }> = [];

  articles.forEach((article, index) => {
    const minStock = articlesData[index].minStock;

    // Stock sur le site principal (5ème)
    const qty5 = index % 5 === 0 ? 0 : index % 3 === 0 ? Math.floor(minStock * 0.5) : minStock + Math.floor(Math.random() * 20);
    stockEntries.push({ articleId: article.id, siteId: sites[0].id, quantity: qty5 });

    // Stock sur le 8ème (pas tous les articles)
    if (index % 2 === 0) {
      const qty8 = index % 7 === 0 ? 0 : Math.floor(Math.random() * (minStock + 5));
      stockEntries.push({ articleId: article.id, siteId: sites[1].id, quantity: qty8 });
    }

    // Stock Epinal (quelques articles seulement)
    if (index % 4 === 0) {
      const qtyEpinal = index % 8 === 0 ? 1 : Math.floor(Math.random() * minStock);
      stockEntries.push({ articleId: article.id, siteId: sites[2].id, quantity: qtyEpinal });
    }
  });

  await Promise.all(
    stockEntries.map((entry) =>
      prisma.articleStock.create({ data: entry })
    )
  );
  console.log(`📊 ${stockEntries.length} entrées de stock créées`);

  // --- 5. Création de mouvements répartis sur les 30 derniers jours ---
  const movementTypes: MovementType[] = [
    MovementType.ENTRY,
    MovementType.EXIT,
    MovementType.ADJUSTMENT,
    MovementType.TRANSFER,
  ];

  const reasons: Record<MovementType, string[]> = {
    [MovementType.ENTRY]: [
      'Réception commande fournisseur',
      'Réapprovisionnement urgent',
      'Retour de matériel',
      'Livraison planifiée',
    ],
    [MovementType.EXIT]: [
      'Déploiement poste utilisateur',
      'Remplacement défectueux',
      'Installation salle de réunion',
      'Demande service technique',
    ],
    [MovementType.ADJUSTMENT]: [
      'Inventaire physique',
      'Correction d\'erreur de saisie',
      'Matériel endommagé — mise au rebut',
    ],
    [MovementType.TRANSFER]: [
      'Transfert inter-sites',
      'Consolidation de stock',
      'Besoin urgent site distant',
    ],
  };

  const movements: Array<{
    type: MovementType;
    quantity: number;
    reason: string;
    articleId: string;
    fromSiteId: string | null;
    toSiteId: string | null;
    userId: string;
    createdAt: Date;
  }> = [];

  for (let i = 0; i < 50; i++) {
    const type = movementTypes[Math.floor(Math.random() * movementTypes.length)];
    const article = articles[Math.floor(Math.random() * articles.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    const reasonList = reasons[type];
    const reason = reasonList[Math.floor(Math.random() * reasonList.length)];
    const quantity = Math.floor(Math.random() * 10) + 1;

    // Date aléatoire dans les 30 derniers jours
    const daysAgo = Math.floor(Math.random() * 30);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);
    createdAt.setHours(Math.floor(Math.random() * 10) + 8); // Entre 8h et 18h
    createdAt.setMinutes(Math.floor(Math.random() * 60));

    let fromSiteId: string | null = null;
    let toSiteId: string | null = null;

    if (type === MovementType.TRANSFER) {
      const fromIndex = Math.floor(Math.random() * sites.length);
      let toIndex = Math.floor(Math.random() * sites.length);
      while (toIndex === fromIndex) {
        toIndex = Math.floor(Math.random() * sites.length);
      }
      fromSiteId = sites[fromIndex].id;
      toSiteId = sites[toIndex].id;
    } else if (type === MovementType.ENTRY) {
      toSiteId = sites[Math.floor(Math.random() * sites.length)].id;
    } else if (type === MovementType.EXIT) {
      fromSiteId = sites[Math.floor(Math.random() * sites.length)].id;
    } else {
      // ADJUSTMENT — sur un site au hasard
      toSiteId = sites[Math.floor(Math.random() * sites.length)].id;
    }

    movements.push({
      type,
      quantity,
      reason,
      articleId: article.id,
      fromSiteId,
      toSiteId,
      userId: user.id,
      createdAt,
    });
  }

  await Promise.all(
    movements.map((m) =>
      prisma.stockMovement.create({ data: m })
    )
  );
  console.log(`🔄 ${movements.length} mouvements de stock créés`);

  // --- 6. Quelques entrées d'audit ---
  const auditEntries = [
    {
      action: 'CREATE_USER',
      entityType: 'User',
      entityId: users[0].id,
      userId: users[0].id,
      newValue: { technicianId: 'T000001', name: 'Jean-Pierre Martin', role: 'ADMIN' },
    },
    {
      action: 'CREATE_USER',
      entityType: 'User',
      entityId: users[1].id,
      userId: users[0].id,
      newValue: { technicianId: 'T097097', name: 'Sophie Durand', role: 'TECHNICIAN' },
    },
    {
      action: 'CREATE_SITE',
      entityType: 'Site',
      entityId: sites[0].id,
      userId: users[0].id,
      newValue: { name: 'Stock 5ème' },
    },
  ];

  await Promise.all(
    auditEntries.map((entry) =>
      prisma.auditLog.create({ data: entry })
    )
  );
  console.log(`📝 ${auditEntries.length} entrées d'audit créées`);

  console.log('\n✅ Peuplement terminé avec succès !');
  console.log('\n📋 Identifiants de test :');
  console.log('   Admin     : administrateur / !*A1Z2E3R4T5!');
  console.log('   Technicien: T097097 / Tech!456');
}

main()
  .catch((error) => {
    console.error('❌ Erreur lors du peuplement :', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
