import { Router, Request, Response } from 'express';
import { prisma } from '../config/db';
import { authenticate } from '../middleware/authenticate';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthedRequest } from '../types/express';
import { QueueStatus } from '@prisma/client';

const router = Router();

router.use(authenticate);

// GET /queue/me - Get current user's active queue token and ETA
router.get('/me', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as AuthedRequest).user;

  const entry = await prisma.queueEntry.findFirst({
    where: {
      appointment: { userId: user.id },
      status: { in: ['WAITING', 'CALLED', 'IN_SERVICE'] },
    },
    include: {
      provider: true,
      appointment: { include: { service: true } },
    },
    orderBy: { checkedInAt: 'desc' },
  });

  if (!entry) {
    res.status(200).json({ data: null, message: 'No active queue entry' });
    return;
  }

  // Count waiting ahead
  const waitingAhead = await prisma.queueEntry.count({
    where: {
      providerId: entry.providerId,
      queueDate: entry.queueDate,
      status: 'WAITING',
      checkedInAt: { lt: entry.checkedInAt },
    },
  });

  const position = entry.status === 'WAITING' ? waitingAhead + 1 : 0;
  const avgDuration = entry.appointment.service.durationMin || 15;
  const etaMinutes = entry.status === 'WAITING' ? position * avgDuration : 0;

  res.status(200).json({
    data: {
      ...entry,
      position,
      waitingAhead,
      etaMinutes,
    },
  });
}));

// GET /queue/provider/:id - Get queue entries for a provider
router.get('/provider/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const now = new Date();
  const queueDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  const entries = await prisma.queueEntry.findMany({
    where: {
      providerId: id,
      queueDate,
    },
    include: {
      appointment: {
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          service: true,
        },
      },
    },
    orderBy: [
      { priority: 'desc' },
      { tokenNumber: 'asc' },
    ],
  });

  res.status(200).json({ data: entries });
}));

// POST /queue/provider/:id/call-next - Call next waiting person
router.post('/provider/:id/call-next', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const now = new Date();
  const queueDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  // Find next waiting entry
  const nextEntry = await prisma.queueEntry.findFirst({
    where: {
      providerId: id,
      queueDate,
      status: 'WAITING',
    },
    orderBy: [
      { priority: 'desc' },
      { tokenNumber: 'asc' },
    ],
    include: {
      appointment: {
        include: {
          user: { select: { id: true, name: true, email: true } },
          service: true,
        },
      },
    },
  });

  if (!nextEntry) {
    res.status(404).json({ error: { code: 'QUEUE_EMPTY', message: 'No attendees currently waiting in queue' } });
    return;
  }

  const updated = await prisma.queueEntry.update({
    where: { id: nextEntry.id },
    data: {
      status: 'CALLED',
      calledAt: now,
    },
    include: {
      appointment: {
        include: {
          user: { select: { id: true, name: true, email: true } },
          service: true,
        },
      },
    },
  });

  res.status(200).json({ data: updated });
}));

// POST /queue/entries/:id/:action - Update state: start, complete, skip, requeue, no-show, cancel
router.post('/entries/:id/:action', asyncHandler(async (req: Request, res: Response) => {
  const { id, action } = req.params;
  const now = new Date();

  const statusMap: Record<string, QueueStatus> = {
    start: 'IN_SERVICE',
    complete: 'COMPLETED',
    skip: 'SKIPPED',
    requeue: 'WAITING',
    'no-show': 'NO_SHOW',
    cancel: 'CANCELLED',
  };

  const nextStatus = statusMap[action];
  if (!nextStatus) {
    res.status(400).json({ error: { code: 'INVALID_ACTION', message: `Unknown action ${action}` } });
    return;
  }

  const updateData: any = { status: nextStatus };
  if (action === 'start') updateData.serviceStartedAt = now;
  if (action === 'complete') updateData.completedAt = now;
  if (action === 'skip') updateData.skipCount = { increment: 1 };
  if (action === 'requeue') updateData.requeuedAt = now;

  const updated = await prisma.queueEntry.update({
    where: { id },
    data: updateData,
  });

  if (action === 'complete') {
    await prisma.appointment.update({
      where: { id: updated.appointmentId },
      data: { status: 'COMPLETED' },
    });
  }

  res.status(200).json({ data: updated });
}));

export { router as queueRouter };
