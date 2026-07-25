import rateLimit from 'express-rate-limit';
import { env } from '../../config/env';

export const rateLimiter = {
  general: rateLimit({
    windowMs: 60 * 1000,
    max: parseInt(env.RATE_LIMIT_GENERAL),
    message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests' } },
    standardHeaders: true,
    legacyHeaders: false,
  }),
  auth: rateLimit({
    windowMs: 60 * 1000,
    max: parseInt(env.RATE_LIMIT_OTP),
    message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many attempts' } },
  }),
  chat: rateLimit({
    windowMs: 60 * 1000,
    max: parseInt(env.RATE_LIMIT_CHAT),
    message: { success: false, error: { code: 'RATE_LIMITED', message: 'Sending too many messages' } },
  }),
};
