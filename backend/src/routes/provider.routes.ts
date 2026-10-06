import { Router, Request, Response } from 'express';
import { prisma } from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// GET /providers - List active providers with services & availabilities
router.get('/', asyncHandler(async (_req: Request, res: Response) => {
  const providers = await prisma.provider.findMany({
    where: { isActive: true },
    include: {
      services: {
        where: { isActive: true },
      },
      availabilities: true,
    },
    orderBy: { name: 'asc' },
  });

  res.status(200).json({ data: providers });
}));

// GET /providers/:id
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const provider = await prisma.provider.findUnique({
    where: { id },
    include: {
      services: { where: { isActive: true } },
      availabilities: true,
    },
  });

  if (!provider) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Provider not found' } });
    return;
  }

  res.status(200).json({ data: provider });
}));

export { router as providerRouter };
