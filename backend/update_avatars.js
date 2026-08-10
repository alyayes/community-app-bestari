const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const threads = await prisma.thread.findMany();
  for (const t of threads) {
    if (!t.authorAvatar || t.authorAvatar === '') {
      // Find user by name (assuming name is unique enough for this fix)
      const user = await prisma.user.findFirst({ where: { name: t.authorName } });
      if (user && user.avatar) {
        await prisma.thread.update({
          where: { id: t.id },
          data: { authorAvatar: user.avatar }
        });
        console.log(`Updated thread ${t.id} avatar for ${t.authorName}`);
      }
    }
  }

  const comments = await prisma.threadComment.findMany();
  for (const c of comments) {
    if (!c.authorAvatar || c.authorAvatar === '') {
      const user = await prisma.user.findFirst({ where: { name: c.authorName } });
      if (user && user.avatar) {
        await prisma.threadComment.update({
          where: { id: c.id },
          data: { authorAvatar: user.avatar }
        });
        console.log(`Updated comment ${c.id} avatar for ${c.authorName}`);
      }
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
