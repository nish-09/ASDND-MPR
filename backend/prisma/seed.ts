import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding QueueLess database...');

  // Clean existing data for idempotency
  await prisma.outboxEvent.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.queueEntry.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.service.deleteMany();
  await prisma.providerAvailability.deleteMany();
  await prisma.tokenCounter.deleteMany();
  await prisma.user.deleteMany();
  await prisma.provider.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 12);

  // 1. ADMIN
  await prisma.user.create({
    data: {
      email: 'admin@queueless.com',
      name: 'System Admin',
      passwordHash,
      role: 'ADMIN',
    },
  });

  // 2. Providers
  const p1 = await prisma.provider.create({
    data: {
      name: 'Dr. Smith Clinic',
      category: 'Healthcare',
      timezone: 'Asia/Kolkata',
      services: {
        create: [
          { name: 'General Consultation', durationMin: 15 },
          { name: 'Follow-up', durationMin: 10 },
        ],
      },
      availabilities: {
        create: [1, 2, 3, 4, 5].map((weekday) => ({
          weekday,
          startMin: 9 * 60, // 09:00
          endMin: 17 * 60,  // 17:00
        })),
      },
    },
    include: { services: true },
  });

  const p2 = await prisma.provider.create({
    data: {
      name: 'City Bank Branch',
      category: 'Banking',
      timezone: 'Asia/Kolkata',
      services: {
        create: [
          { name: 'Account Opening', durationMin: 30 },
          { name: 'Loan Enquiry', durationMin: 45 },
        ],
      },
      availabilities: {
        create: [1, 2, 3, 4, 5].map((weekday) => ({
          weekday,
          startMin: 10 * 60, // 10:00
          endMin: 16 * 60,   // 16:00
        })),
      },
    },
    include: { services: true },
  });

  // 3. STAFF per provider
  await prisma.user.create({
    data: {
      email: 'staff1@smithclinic.com',
      name: 'Clinic Receptionist',
      passwordHash,
      role: 'STAFF',
      providerId: p1.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'staff1@citybank.com',
      name: 'Bank Teller',
      passwordHash,
      role: 'STAFF',
      providerId: p2.id,
    },
  });

  // 4. 5 Customers
  for (let i = 1; i <= 5; i++) {
    await prisma.user.create({
      data: {
        email: `customer${i}@example.com`,
        name: `Customer ${i}`,
        passwordHash,
        role: 'CUSTOMER',
      },
    });
  }

  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
