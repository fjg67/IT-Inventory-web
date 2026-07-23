import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.article.deleteMany({
    where: {
      name: 'JOVE GARCIA Florian',
    },
  });
  console.log(`Deleted ${result.count} articles.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
