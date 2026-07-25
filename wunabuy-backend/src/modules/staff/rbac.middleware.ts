import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/middleware/auth.middleware';
import { hasPermission, PERMISSIONS } from './rbac.service';
import { AuthError } from '../../shared/errors/app-error';

export function requirePermission(permission: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user?.isStaff) {
      return next(new AuthError('FORBIDDEN', 'Staff access required', 403));
    }

    if (!hasPermission(req.user.permissions || [], permission)) {
      return next(new AuthError('FORBIDDEN', `Permission required: ${permission}`, 403));
    }

    next();
  };
}
