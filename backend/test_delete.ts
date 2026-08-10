import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.agenda.delete({ where: { id: '9bfcbf50-8473-4338-8ad8-a36147fae61e' } });
    console.log('Deleted successfully');
  } catch (e) {
    console.error('DELETE FAILED:', e);
  }
}
main().finally(() => prisma.$disconnect());
