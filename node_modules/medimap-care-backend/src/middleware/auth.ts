import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export type AuthInfo = { userId: number; role?: string | undefined; email?: string | undefined };
export interface AuthenticatedRequest extends Request { auth?: AuthInfo }

export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: number; role?: string };
    req.auth = { userId: decoded.id, role: decoded.role };
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}


