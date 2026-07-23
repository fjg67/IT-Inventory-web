import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.pC.deleteMany({
    where: {
      OR: [
        { hostname: { contains: 'alimentation', mode: 'insensitive' } },
        { hostname: { contains: 'chargeur', mode: 'insensitive' } }
      ]
    },
  });
  console.log(`Deleted ${result.count} fake PCs (chargers/power supplies) by hostname.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
