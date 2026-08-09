import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log("ALL USERS:", users.length);
  for (const u of users) {
    console.log("-", u.email, "|", u.role);
  }
}
main();
