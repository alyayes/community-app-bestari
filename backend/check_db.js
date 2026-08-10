const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.$queryRawUnsafe('DESCRIBE artikel')
  .then(console.log)
  .catch(console.error)
  .finally(() => process.exit(0));
