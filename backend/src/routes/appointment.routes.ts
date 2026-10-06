import { Router, Request, Response } from 'express';
import { prisma } from '../config/db';
import { authenticate } from '../middleware/authenticate';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthedRequest } from '../types/express';

const router = Router();

// Require auth for all appointment routes
router.use(authenticate);

// GET /appointments - List logged-in user's appointments (or all for staff/admin)
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as AuthedRequest).user;

  let staffProviderId = user.providerId;
  if (user.role === 'STAFF' && !staffProviderId) {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { providerId: true },
    });
    staffProviderId = dbUser?.providerId ?? null;
  }

  const whereClause = user.role === 'ADMIN'
    ? {}
    : user.role === 'STAFF' && staffProviderId
      ? { providerId: staffProviderId }
      : { userId: user.id };

  const appointments = await prisma.appointment.findMany({
    where: whereClause,
    include: {
      provider: true,
      service: true,
      queueEntry: true,
    },
    orderBy: { startsAt: 'desc' },
  });

  res.status(200).json({ data: appointments });
}));

// POST /appointments - Book a new appointment
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as AuthedRequest).user;
  const { providerId, serviceId, startsAt, notes } = req.body;

  if (!providerId || !serviceId || !startsAt) {
    res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'providerId, serviceId, and startsAt are required' } });
    return;
  }

  const startDate = new Date(startsAt);
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Service not found' } });
    return;
  }

  // Calculate endsAt based on service duration
  const endDate = new Date(startDate.getTime() + (service.durationMin || 15) * 60 * 1000);

  // Check concurrency: no double-booking for the provider at this exact startsAt
  const existing = await prisma.appointment.findFirst({
    where: {
      providerId,
      startsAt: startDate,
      status: { not: 'CANCELLED' },
    },
  });

  if (existing) {
    res.status(409).json({ error: { code: 'SLOT_TAKEN', message: 'This slot is already booked. Please choose another time.' } });
    return;
  }

  const appointment = await prisma.appointment.create({
    data: {
      userId: user.id,
      providerId,
      serviceId,
      startsAt: startDate,
      endsAt: endDate,
      notes,
      status: 'BOOKED',
    },
    include: {
      provider: true,
      service: true,
    },
  });

  res.status(201).json({ data: appointment });
}));

// POST /appointments/:id/cancel - Cancel appointment
router.post('/:id/cancel', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as AuthedRequest).user;
  const { id } = req.params;

  const appt = await prisma.appointment.findUnique({
    where: { id },
    include: { queueEntry: true },
  });

  if (!appt) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Appointment not found' } });
    return;
  }

  if (user.role === 'CUSTOMER' && appt.userId !== user.id) {
    res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Cannot cancel another user’s appointment' } });
    return;
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: { status: 'CANCELLED' },
  });

  if (appt.queueEntry) {
    await prisma.queueEntry.update({
      where: { id: appt.queueEntry.id },
      data: { status: 'CANCELLED' },
    });
  }

  res.status(200).json({ data: updated });
}));

// POST /appointments/:id/check-in - Check-in and generate queue token
router.post('/:id/check-in', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as AuthedRequest).user;
  const { id } = req.params;

  const appt = await prisma.appointment.findUnique({
    where: { id },
    include: { queueEntry: true, provider: true },
  });

  if (!appt) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Appointment not found' } });
    return;
  }

  if (user.role === 'CUSTOMER' && appt.userId !== user.id) {
    res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Cannot check in for another customer' } });
    return;
  }

  if (appt.queueEntry) {
    res.status(200).json({ data: appt.queueEntry, message: 'Already checked in' });
    return;
  }

  // Generate today's queue date
  const now = new Date();
  const queueDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  // Atomic token increment
  const counter = await prisma.tokenCounter.upsert({
    where: {
      providerId_queueDate: {
        providerId: appt.providerId,
        queueDate,
      },
    },
    update: {
      lastNumber: { increment: 1 },
    },
    create: {
      providerId: appt.providerId,
      queueDate,
      lastNumber: 1,
    },
  });

  const tokenNumber = counter.lastNumber;
  const prefix = appt.provider.name.charAt(0).toUpperCase() || 'Q';
  const tokenLabel = `${prefix}-${tokenNumber.toString().padStart(3, '0')}`;

  const [queueEntry] = await prisma.$transaction([
    prisma.queueEntry.create({
      data: {
        appointmentId: appt.id,
        providerId: appt.providerId,
        queueDate,
        tokenNumber,
        tokenLabel,
        status: 'WAITING',
        checkedInAt: now,
      },
    }),
    prisma.appointment.update({
      where: { id: appt.id },
      data: { status: 'CHECKED_IN' },
    }),
  ]);

  res.status(201).json({ data: queueEntry });
}));

export { router as appointmentRouter };
