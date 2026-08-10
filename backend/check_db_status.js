const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.$queryRawUnsafe('SELECT title, status FROM artikel')
  .then(console.log)
  .catch(console.error)
  .finally(() => process.exit(0));
