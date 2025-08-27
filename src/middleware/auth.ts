import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@/utils/auth';
import { createError } from '@/middleware/errorHandler';
import { AuthUser } from '@fisiohub/shared';

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    throw createError('Token de acesso requerido', 401);
  }

  const user = verifyToken(token);
  if (!user) {
    throw createError('Token inválido ou expirado', 401);
  }

  req.user = user;
  next();
};