const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const threads = await prisma.thread.findMany();
  for (const t of threads) {
    if (t.createdAt > new Date('2026-08-03T00:00:00Z')) {
      const newDate = new Date(t.createdAt);
      newDate.setMonth(newDate.getMonth() - 3); // Move to July/August
      await prisma.thread.update({
        where: { id: t.id },
        data: { createdAt: newDate }
      });
    }
  }

  const comments = await prisma.threadComment.findMany();
  for (const c of comments) {
    if (c.createdAt > new Date('2026-08-03T00:00:00Z')) {
      const newDate = new Date(c.createdAt);
      newDate.setMonth(newDate.getMonth() - 3); 
      await prisma.threadComment.update({
        where: { id: c.id },
        data: { createdAt: newDate }
      });
    }
  }
  console.log("Updated future dates.");
}

main().finally(() => prisma.$disconnect());
