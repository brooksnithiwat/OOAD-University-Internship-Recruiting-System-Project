import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('admin1234', 10)

  await prisma.user.upsert({
    where: { email: 'admin@system.com' },
    update: {},
    create: {
      email: 'admin@system.com',
      passwordHash,
      role: 'SYSTEM_ADMINISTRATOR',
      isActive: true,
    },
  })

  console.log('Admin seeded')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())