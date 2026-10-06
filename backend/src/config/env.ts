import 'dotenv/config';
import { z } from 'zod';

const EnvSchema = z.object({
  PORT: z.string().default('3000').transform((v) => parseInt(v, 10)),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().url(),
  TEST_DATABASE_URL: z.string().url().optional(),
  REDIS_URL: z.string().url(),
  CORS_ORIGIN: z.string().default('http://localhost:8080'),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  BCRYPT_ROUNDS: z.string().default('12').transform((v) => parseInt(v, 10)),
});

const _parsed = EnvSchema.safeParse(process.env);
if (!_parsed.success) {
  console.error('❌ Invalid env vars:\n', _parsed.error.format());
  process.exit(1);
}
export const env = _parsed.data;
