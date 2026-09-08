const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const data = {
      loginImage: '',
      loginImages: []
    };
    const res = await prisma.cms.update({
      where: { id: 'global' },
      data
    });
    console.log('Success:', res.id);
  } catch(e) {
    console.error('Prisma Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}
test();
