import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../config/logger';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  (req as any).id = uuidv4();
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info({
      requestId: (req as any).id,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: duration,
    }, 'request completed');
  });

  next();
}
