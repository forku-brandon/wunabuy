import { Request, Response, NextFunction } from 'express';
import { logger } from '../../config/logger';
import { AppError, ValidationError, AuthError, NotFoundError, ConflictError } from '../errors/app-error';

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  const requestId = (req as any).id || 'unknown';

  if (err instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: err.message, details: err.details, request_id: requestId }
    });
  }

  if (err instanceof AuthError) {
    return res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message, request_id: requestId }
    });
  }

  if (err instanceof NotFoundError) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: err.message, request_id: requestId }
    });
  }

  if (err instanceof ConflictError) {
    return res.status(409).json({
      success: false,
      error: { code: err.code || 'CONFLICT', message: err.message, request_id: requestId }
    });
  }

  logger.error({ err, requestId, path: req.path, method: req.method }, 'Unhandled error');

  return res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred', request_id: requestId }
  });
}
