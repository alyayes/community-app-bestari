import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const agendas = await prisma.agenda.findMany();
  console.log("ALL AGENDAS:", agendas.length);
  for (const a of agendas) {
    console.log("-", a.id, "|", a.title, "|", a.date);
  }
}
main();
