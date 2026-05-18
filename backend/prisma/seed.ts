import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const adminPasswordHash = await bcrypt.hash('Admin_1234', 10)
  const employeePasswordHash = await bcrypt.hash('Employee_1234', 10)
  const studentPasswordHash = await bcrypt.hash('Student_1234', 10)

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@email.com' },
    update: {},
    create: {
      email: 'admin@email.com',
      passwordHash: adminPasswordHash,
      role: 'SYSTEM_ADMINISTRATOR',
      isActive: true,
    },
  })
  console.log('Admin user seeded')

  // Create employer user
  const employerUser = await prisma.user.upsert({
    where: { email: 'employee@email.com' },
    update: {},
    create: {
      email: 'employee@email.com',
      passwordHash: employeePasswordHash,
      role: 'EMPLOYER',
      isActive: true,
    },
  })

  // Create employer record
  await prisma.employer.upsert({
    where: { userId: employerUser.userId },
    update: {},
    create: {
      userId: employerUser.userId,
      companyName: 'Tech Company',
      industry: 'Technology',
      website: 'https://techcompany.com',
      contactName: 'John Doe',
      contactPhone: '1234567890',
      isVerified: true,
    },
  })
  console.log('Employer user and record seeded')

  // Create student user
  const studentUser = await prisma.user.upsert({
    where: { email: 'student@email.com' },
    update: {},
    create: {
      email: 'student@email.com',
      passwordHash: studentPasswordHash,
      role: 'STUDENT',
      isActive: true,
    },
  })

  // Create student record
  await prisma.student.upsert({
    where: { userId: studentUser.userId },
    update: {},
    create: {
      userId: studentUser.userId,
      studentCode: 'STU001',
      firstName: 'John',
      lastName: 'Student',
      gpa: 3.5,
      faculty: 'Engineering',
      department: 'computer science',
      academicYear: 2024,
    },
  })
  console.log('Student user and record seeded')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())