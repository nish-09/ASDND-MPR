import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive QueueLess database seed...');

  // 1. Clean existing records for absolute idempotency
  await prisma.outboxEvent.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.idempotencyKey.deleteMany();
  await prisma.queueEntry.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.service.deleteMany();
  await prisma.providerAvailability.deleteMany();
  await prisma.tokenCounter.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.provider.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // 2. Platform Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@queueless.com',
      name: 'System Admin',
      phone: '+1-555-0100',
      passwordHash,
      role: 'ADMIN',
    },
  });
  console.log('✓ Admin created:', admin.email);

  // 3. Four Full-Featured Service Providers
  // Timings: 11:00 AM (660 min) to 5:00 PM (1020 min) across Monday–Saturday (weekdays 1–6)
  const defaultAvailabilities = [1, 2, 3, 4, 5, 6].map((weekday) => ({
    weekday,
    startMin: 11 * 60, // 11:00 AM
    endMin: 17 * 60,   // 05:00 PM
  }));

  // Provider 1: Healthcare Clinic
  const pClinic = await prisma.provider.create({
    data: {
      name: 'Dr. Smith Healthcare Clinic',
      category: 'Healthcare',
      timezone: 'Asia/Kolkata',
      isActive: true,
      services: {
        create: [
          { name: 'General Consultation', durationMin: 15, isActive: true },
          { name: 'Pediatric Health Checkup', durationMin: 30, isActive: true },
          { name: 'Cardiology Specialist Review', durationMin: 45, isActive: true },
          { name: 'Rapid Prescription Renewal', durationMin: 10, isActive: true },
        ],
      },
      availabilities: { create: defaultAvailabilities },
    },
    include: { services: true },
  });

  // Provider 2: City Apex Bank
  const pBank = await prisma.provider.create({
    data: {
      name: 'City Apex Bank — Central Branch',
      category: 'Banking & Finance',
      timezone: 'Asia/Kolkata',
      isActive: true,
      services: {
        create: [
          { name: 'Premier Account Opening', durationMin: 30, isActive: true },
          { name: 'Home & Auto Loan Advisory', durationMin: 45, isActive: true },
          { name: 'Wealth & Investment Advisory', durationMin: 60, isActive: true },
          { name: 'Foreign Exchange & Wire Desk', durationMin: 20, isActive: true },
        ],
      },
      availabilities: { create: defaultAvailabilities },
    },
    include: { services: true },
  });

  // Provider 3: DMV Bureau
  const pDmv = await prisma.provider.create({
    data: {
      name: 'Metropolitan DMV & Registry',
      category: 'Government Services',
      timezone: 'Asia/Kolkata',
      isActive: true,
      services: {
        create: [
          { name: 'Driver License Renewal', durationMin: 15, isActive: true },
          { name: 'Biometric Real-ID Verification', durationMin: 25, isActive: true },
          { name: 'Vehicle Title & Registration', durationMin: 20, isActive: true },
        ],
      },
      availabilities: { create: defaultAvailabilities },
    },
    include: { services: true },
  });

  // Provider 4: Tech Genius Bar
  const pTech = await prisma.provider.create({
    data: {
      name: 'Nova Tech Genius Bar & Repairs',
      category: 'Tech Support',
      timezone: 'Asia/Kolkata',
      isActive: true,
      services: {
        create: [
          { name: 'Hardware Diagnostic & Screen Repair', durationMin: 30, isActive: true },
          { name: 'Data Recovery & OS Restore', durationMin: 45, isActive: true },
          { name: 'Device Setup & Trade-in Evaluation', durationMin: 20, isActive: true },
        ],
      },
      availabilities: { create: defaultAvailabilities },
    },
    include: { services: true },
  });

  console.log('✓ 4 Providers created with 11:00 AM – 5:00 PM availability schedules');

  // 4. Staff and Provider Managers
  const staffClinic = await prisma.user.create({
    data: {
      email: 'staff1@smithclinic.com',
      name: 'Nurse Sarah Jenkins',
      phone: '+1-555-0201',
      passwordHash,
      role: 'STAFF',
      providerId: pClinic.id,
    },
  });

  const staffBank = await prisma.user.create({
    data: {
      email: 'staff1@citybank.com',
      name: 'David Miller (Bank Senior Teller)',
      phone: '+1-555-0202',
      passwordHash,
      role: 'STAFF',
      providerId: pBank.id,
    },
  });

  const staffDmv = await prisma.user.create({
    data: {
      email: 'staff1@metrodmv.gov',
      name: 'Officer Jessica Vance (Counter 3)',
      phone: '+1-555-0203',
      passwordHash,
      role: 'STAFF',
      providerId: pDmv.id,
    },
  });

  const staffTech = await prisma.user.create({
    data: {
      email: 'staff1@novatech.com',
      name: 'Alex Reed (Lead Hardware Specialist)',
      phone: '+1-555-0204',
      passwordHash,
      role: 'STAFF',
      providerId: pTech.id,
    },
  });

  // Provider Manager Role
  await prisma.user.create({
    data: {
      email: 'manager@citybank.com',
      name: 'Karen Adams (Branch Director)',
      phone: '+1-555-0205',
      passwordHash,
      role: 'PROVIDER',
      providerId: pBank.id,
    },
  });

  console.log('✓ Staff and Provider accounts created');

  // 5. Multiple Registered Customers
  const customerList = [
    { email: 'customer1@example.com', name: 'John Doe (Main Tester)', phone: '+1-555-0301' },
    { email: 'customer2@example.com', name: 'Emma Watson', phone: '+1-555-0302' },
    { email: 'customer3@example.com', name: 'Michael Chang', phone: '+1-555-0303' },
    { email: 'customer4@example.com', name: 'Sophia Patel', phone: '+1-555-0304' },
    { email: 'customer5@example.com', name: 'Lucas Vance', phone: '+1-555-0305' },
    { email: 'customer6@example.com', name: 'Elena Rostova', phone: '+1-555-0306' },
    { email: 'customer7@example.com', name: 'Liam O’Connor', phone: '+1-555-0307' },
    { email: 'customer8@example.com', name: 'Zoe Anderson', phone: '+1-555-0308' },
  ];

  const customers: any[] = [];
  for (const c of customerList) {
    const cust = await prisma.user.create({
      data: {
        email: c.email,
        name: c.name,
        phone: c.phone,
        passwordHash,
        role: 'CUSTOMER',
      },
    });
    customers.push(cust);
  }
  console.log(`✓ ${customers.length} Customer accounts created`);

  // 6. Dates calculation
  const now = new Date();
  const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowUtc = new Date(Date.UTC(tomorrow.getUTCFullYear(), tomorrow.getUTCMonth(), tomorrow.getUTCDate()));

  const dayAfter = new Date(now);
  dayAfter.setDate(dayAfter.getDate() + 2);
  const dayAfterUtc = new Date(Date.UTC(dayAfter.getUTCFullYear(), dayAfter.getUTCMonth(), dayAfter.getUTCDate()));

  // Helper to format ISO date time string
  const setHour = (baseDate: Date, hour: number, minute: number) => {
    const d = new Date(baseDate);
    d.setUTCHours(hour, minute, 0, 0);
    return d;
  };

  // 7. Seed Appointments for Tomorrow (11:00 AM to 5:00 PM)
  console.log('📅 Seeding appointments for tomorrow (11:00 AM – 5:00 PM)...');

  // Customer 1 has an upcoming appointment tomorrow at 11:30 AM with Dr. Smith Clinic
  await prisma.appointment.create({
    data: {
      userId: customers[0].id,
      providerId: pClinic.id,
      serviceId: pClinic.services[0].id, // General Consultation (15m)
      startsAt: setHour(tomorrowUtc, 11, 30),
      endsAt: setHour(tomorrowUtc, 11, 45),
      status: 'BOOKED',
      notes: 'Routine seasonal checkup and blood pressure review',
    },
  });

  // Customer 1 has an afternoon appointment tomorrow at 02:30 PM with City Apex Bank
  await prisma.appointment.create({
    data: {
      userId: customers[0].id,
      providerId: pBank.id,
      serviceId: pBank.services[0].id, // Premier Account Opening (30m)
      startsAt: setHour(tomorrowUtc, 14, 30),
      endsAt: setHour(tomorrowUtc, 15, 0),
      status: 'BOOKED',
      notes: 'Corporate checking account verification',
    },
  });

  // Customer 2 at 11:00 AM with Dr. Smith Clinic
  await prisma.appointment.create({
    data: {
      userId: customers[1].id,
      providerId: pClinic.id,
      serviceId: pClinic.services[1].id, // Pediatric Checkup
      startsAt: setHour(tomorrowUtc, 11, 0),
      endsAt: setHour(tomorrowUtc, 11, 30),
      status: 'BOOKED',
      notes: 'Toddler wellness visit',
    },
  });

  // Customer 3 at 12:00 PM with City Apex Bank
  await prisma.appointment.create({
    data: {
      userId: customers[2].id,
      providerId: pBank.id,
      serviceId: pBank.services[1].id, // Loan Advisory
      startsAt: setHour(tomorrowUtc, 12, 0),
      endsAt: setHour(tomorrowUtc, 12, 45),
      status: 'BOOKED',
      notes: 'Commercial property mortgage pre-approval',
    },
  });

  // Customer 4 at 01:15 PM with Metropolitan DMV
  await prisma.appointment.create({
    data: {
      userId: customers[3].id,
      providerId: pDmv.id,
      serviceId: pDmv.services[0].id, // License Renewal
      startsAt: setHour(tomorrowUtc, 13, 15),
      endsAt: setHour(tomorrowUtc, 13, 30),
      status: 'BOOKED',
      notes: 'Driver license expiration renewal',
    },
  });

  // Customer 5 at 03:00 PM with Nova Tech
  await prisma.appointment.create({
    data: {
      userId: customers[4].id,
      providerId: pTech.id,
      serviceId: pTech.services[0].id, // Screen Repair
      startsAt: setHour(tomorrowUtc, 15, 0),
      endsAt: setHour(tomorrowUtc, 15, 30),
      status: 'BOOKED',
      notes: 'Cracked OLED screen diagnostics',
    },
  });

  // Customer 6 at 04:15 PM with City Apex Bank
  await prisma.appointment.create({
    data: {
      userId: customers[5].id,
      providerId: pBank.id,
      serviceId: pBank.services[3].id, // Wire desk
      startsAt: setHour(tomorrowUtc, 16, 15),
      endsAt: setHour(tomorrowUtc, 16, 35),
      status: 'BOOKED',
      notes: 'International wire transfer verification',
    },
  });

  // Customer 7 on Day After Tomorrow at 11:15 AM
  await prisma.appointment.create({
    data: {
      userId: customers[6].id,
      providerId: pDmv.id,
      serviceId: pDmv.services[1].id, // Real-ID
      startsAt: setHour(dayAfterUtc, 11, 15),
      endsAt: setHour(dayAfterUtc, 11, 40),
      status: 'BOOKED',
      notes: 'Biometric passport and Real-ID submission',
    },
  });

  console.log('✓ Upcoming 11:00 AM – 5:00 PM bookings created');

  // 8. Seed Live Active Queue For Today (Ready for Immediate Demo & Testing!)
  console.log('⚡ Seeding live active queue for today so you can test right now...');

  // Token Counter for City Apex Bank today
  await prisma.tokenCounter.create({
    data: {
      providerId: pBank.id,
      queueDate: todayUtc,
      lastNumber: 3,
    },
  });

  // Customer 2: Token C-001 (Currently IN_SERVICE)
  const apptServing = await prisma.appointment.create({
    data: {
      userId: customers[1].id,
      providerId: pBank.id,
      serviceId: pBank.services[0].id,
      startsAt: setHour(todayUtc, 11, 0),
      endsAt: setHour(todayUtc, 11, 30),
      status: 'IN_SERVICE',
      notes: 'Account verification documents present',
    },
  });

  await prisma.queueEntry.create({
    data: {
      appointmentId: apptServing.id,
      providerId: pBank.id,
      queueDate: todayUtc,
      tokenNumber: 1,
      tokenLabel: 'C-001',
      status: 'IN_SERVICE',
      checkedInAt: new Date(Date.now() - 25 * 60 * 1000), // 25 mins ago
      calledAt: new Date(Date.now() - 10 * 60 * 1000),    // 10 mins ago
      serviceStartedAt: new Date(Date.now() - 5 * 60 * 1000),
    },
  });

  // Customer 3: Token C-002 (Currently CALLED)
  const apptCalled = await prisma.appointment.create({
    data: {
      userId: customers[2].id,
      providerId: pBank.id,
      serviceId: pBank.services[1].id,
      startsAt: setHour(todayUtc, 11, 30),
      endsAt: setHour(todayUtc, 12, 15),
      status: 'CHECKED_IN',
      notes: 'Loan consultation documents',
    },
  });

  await prisma.queueEntry.create({
    data: {
      appointmentId: apptCalled.id,
      providerId: pBank.id,
      queueDate: todayUtc,
      tokenNumber: 2,
      tokenLabel: 'C-002',
      status: 'CALLED',
      checkedInAt: new Date(Date.now() - 15 * 60 * 1000),
      calledAt: new Date(Date.now() - 1 * 60 * 1000),
    },
  });

  // Customer 1 (THE MAIN TEST USER): Token C-003 (WAITING in queue — position #1 next in line!)
  // This allows the user to log in as Customer 1 and instantly see the live token in UI!
  const apptWaiting = await prisma.appointment.create({
    data: {
      userId: customers[0].id,
      providerId: pBank.id,
      serviceId: pBank.services[0].id,
      startsAt: setHour(todayUtc, 12, 0),
      endsAt: setHour(todayUtc, 12, 30),
      status: 'CHECKED_IN',
      notes: 'VIP checking account enrollment',
    },
  });

  await prisma.queueEntry.create({
    data: {
      appointmentId: apptWaiting.id,
      providerId: pBank.id,
      queueDate: todayUtc,
      tokenNumber: 3,
      tokenLabel: 'C-003',
      status: 'WAITING',
      checkedInAt: new Date(Date.now() - 5 * 60 * 1000),
    },
  });

  // Also give Customer 1 a second booking for today with Dr. Smith Clinic with status 'BOOKED'
  // (so the user can click the "Check In →" button in real time to test token generation!)
  await prisma.appointment.create({
    data: {
      userId: customers[0].id,
      providerId: pClinic.id,
      serviceId: pClinic.services[0].id,
      startsAt: setHour(todayUtc, 14, 0),
      endsAt: setHour(todayUtc, 14, 15),
      status: 'BOOKED',
      notes: 'Test appointment: Click Check-In to issue live clinic token',
    },
  });

  console.log('✓ Live active queue seeded:');
  console.log('   - Token C-001: Emma Watson (IN_SERVICE)');
  console.log('   - Token C-002: Michael Chang (CALLED)');
  console.log('   - Token C-003: John Doe / customer1@example.com (WAITING — Next in line!)');
  console.log('   - Dr. Smith Clinic: John Doe (BOOKED — Ready to test Check-In button!)');
  console.log('\n🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
