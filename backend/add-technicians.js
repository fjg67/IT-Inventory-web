const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function addTechnicians() {
  const password = await bcrypt.hash('!*A1Z2E3R4T5!', 10);

  const technicians = [
    { technicianId: 'T098387', name: 'Thibaud HEBRARD' },
    { technicianId: 'T099007', name: 'Florian JOVE GARCIA' },
    { technicianId: 'T097189', name: 'Olivier KLOTZ' },
    { technicianId: 'T097950', name: 'Robert LAMANDE' },
    { technicianId: 'T097262', name: 'Christian MATHIEU' },
  ];

  for (const tech of technicians) {
    const existing = await prisma.user.findUnique({
      where: { technicianId: tech.technicianId },
    });

    if (existing) {
      console.log(`  Déjà existant: ${tech.name} (${tech.technicianId})`);
    } else {
      await prisma.user.create({
        data: {
          technicianId: tech.technicianId,
          name: tech.name,
          password,
          role: 'TECHNICIAN',
          isActive: true,
        },
      });
      console.log(`  Créé: ${tech.name} (${tech.technicianId})`);
    }
  }

  const total = await prisma.user.count({ where: { isActive: true } });
  console.log(`\nTotal utilisateurs actifs: ${total}`);

  await prisma.$disconnect();
}

addTechnicians();
