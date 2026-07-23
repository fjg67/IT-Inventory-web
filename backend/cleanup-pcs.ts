import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.pC.deleteMany({
    where: {
      OR: [
        { model: { contains: 'alimentation', mode: 'insensitive' } },
        { model: { contains: 'chargeur', mode: 'insensitive' } }
      ]
    },
  });
  console.log(`Deleted ${result.count} fake PCs (chargers/power supplies).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
