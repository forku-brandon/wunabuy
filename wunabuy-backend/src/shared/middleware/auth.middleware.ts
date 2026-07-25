import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { AuthError } from '../errors/app-error';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    isStaff: boolean;
    permissions?: string[];
    roles?: any[];
  };
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AuthError('TOKEN_INVALID', 'Authorization header required', 401));
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as any;
    req.user = {
      id: decoded.sub,
      role: decoded.role || 'buyer',
      isStaff: decoded.is_staff || false,
      permissions: decoded.permissions,
      roles: decoded.roles,
    };
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return next(new AuthError('TOKEN_EXPIRED', 'Access token expired', 401));
    }
    return next(new AuthError('TOKEN_INVALID', 'Invalid token', 401));
  }
}

export function requireRole(role: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthError('TOKEN_INVALID', 'Authentication required', 401));
    }
    if (req.user.role !== role && !req.user.isStaff) {
      return next(new AuthError('FORBIDDEN', `Role required: ${role}`, 403));
    }
    next();
  };
}
