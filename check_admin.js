const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function check() {
  let admin = await prisma.user.findFirst({ where: { role: 'ADMIN' }, include: { profile: true }});
  console.log("Admin user:", admin);
}
check();
