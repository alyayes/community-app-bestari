const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.cms.update({
    where: { id: 'global' },
    data: {
      landingTitle: 'Menanam Bersama,\nTumbuh Bersama'
    }
  });
  console.log('CMS landingDesc updated successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
