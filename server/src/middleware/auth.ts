import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to check if user is authenticated
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized' });
}

/**
 * Extend Express Session type to include userId
 */
declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}
