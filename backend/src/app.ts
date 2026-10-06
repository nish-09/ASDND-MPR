import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import rateLimit from 'express-rate-limit';
import { env } from '@/config/env';
import { logger } from '@/lib/logger';
import { metrics } from '@/lib/metrics';
import { prisma } from '@/config/db';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json());
  app.use(pinoHttp({ logger, autoLogging: env.NODE_ENV !== 'test' }));

  // Global rate limiter
  const globalLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    message: { error: { code: 'TOO_MANY_REQUESTS', message: 'Too many requests' } },
  });
  app.use('/api', globalLimiter);

  // Health check
  app.get('/health', async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.status(200).json({ status: 'ok', db: 'connected', redis: 'not_checked' });
    } catch (err) {
      res.status(503).json({ status: 'degraded', db: 'unreachable' });
    }
  });

  // Metrics
  app.get('/metrics', async (_req, res) => {
    res.set('Content-Type', metrics.register.contentType);
    res.send(await metrics.register.metrics());
  });

  // API v1 router
  const apiV1 = express.Router();

  // Mount API v1
  app.use('/api/v1', apiV1);

  // 404
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
  });

  // Error handler
  app.use((err: any, _req: Request, res: Response, _next: any) => {
    logger.error(err);
    res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Something went wrong' } });
  });

  return app;
}
