import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const peserta = await prisma.agendaPeserta.findMany({ where: { agendaId: '8c86b1c7-e569-43ad-9165-f46c0d97e211' } });
  console.log('PESERTA:', peserta);
}
main();
