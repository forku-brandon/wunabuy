import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { errorHandler } from './shared/middleware/error.middleware';
import { requestLogger } from './shared/middleware/request-logger.middleware';
import { rateLimiter } from './shared/middleware/rate-limit.middleware';
import { env } from './config/env';

// Route imports
import authRoutes from './modules/auth/auth.routes';
import productRoutes from './modules/commerce/product/product.routes';
import orderRoutes from './modules/commerce/order/order.routes';
import cartRoutes from './modules/commerce/cart/cart.routes';
import paymentRoutes from './modules/payment/payment.routes';
import deliveryRoutes from './modules/delivery/delivery.routes';
import chatRoutes from './modules/chat/chat.routes';
import kycRoutes from './modules/kyc/kyc.routes';
import searchRoutes from './modules/search/search.routes';
import videoRoutes from './modules/video/video.routes';
import staffRoutes from './modules/staff/staff.routes';
import notificationRoutes from './modules/notification/notification.routes';

export function createApp() {
  const app = express();

  // ─── Security middleware ───
  app.use(helmet());
  app.use(cors({
    origin: env.CORS_ORIGINS.split(','),
    credentials: true,
  }));

  // ─── Body parsing ───
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ─── Logging ───
  app.use(requestLogger);

  // ─── Rate limiting ───
  app.use('/api', rateLimiter.general);
  app.use('/api/v1/auth', rateLimiter.auth);
  app.use('/api/v1/chat', rateLimiter.chat);

  // ─── Health checks ───
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      services: { database: 'up', redis: 'up' },
      uptime_seconds: process.uptime(),
      version: '1.0.0',
    });
  });

  app.get('/health/ready', (_req: Request, res: Response) => {
    res.json({ status: 'ready' });
  });

  // ─── API Routes ───
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/products', productRoutes);
  app.use('/api/v1/orders', orderRoutes);
  app.use('/api/v1/cart', cartRoutes);
  app.use('/api/v1/payments', paymentRoutes);
  app.use('/api/v1/delivery', deliveryRoutes);
  app.use('/api/v1/chat', chatRoutes);
  app.use('/api/v1/kyc', kycRoutes);
  app.use('/api/v1/search', searchRoutes);
  app.use('/api/v1/videos', videoRoutes);
  app.use('/api/v1/staff', staffRoutes);
  app.use('/api/v1/notifications', notificationRoutes);

  // ─── Error handling (must be last) ───
  app.use(errorHandler);

  return app;
}
