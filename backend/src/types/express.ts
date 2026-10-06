/**
 * types/express.ts
 *
 * Augments the Express Request type so req.user is typed after the
 * authenticate middleware runs. Import AuthedRequest instead of Request
 * in any middleware or controller that requires an authenticated user.
 */

import { Request } from 'express';

import { Role } from '@prisma/client';

/** Shape attached to req.user by middleware/authenticate.ts after JWT verification. */
export interface RequestUser {
  id: string;
  email: string;
  role: Role;
  providerId?: string | null;
}

/** Typed request with a guaranteed req.user. Use in authenticated routes. */
export interface AuthedRequest extends Request {
  user: RequestUser;
}

