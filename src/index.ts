/**
 * wunabuy — E-commerce Platform Backend
 *
 * African mobile marketplace with escrow payments & live delivery tracking.
 * Three user roles: Customer, Store Owner, Transporter.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

import { authService } from './auth/auth.service';
import { authenticate, requireRole } from './auth/middleware';
import { escrowService } from './escrow/escrow.service';
import { trackingService } from './delivery/tracking.service';

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});
const prisma = new PrismaClient();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// ─── Health ─────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'wunabuy', version: '0.1.0' });
});

// ─── Auth Routes ─────────────────────────────────────────────────────────────
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password, fullName, phone, role } = req.body;
    const result = await authService.register(email, password, fullName, phone, role);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
});

app.get('/auth/me', authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    include: { store: true, kyc: true, transporter: true }
  });
  res.json(user);
});

// ─── Store Routes ────────────────────────────────────────────────────────────

// Register a store (requires KYC first)
app.post('/stores', authenticate, requireRole('STORE_OWNER'), async (req, res) => {
  try {
    const { name, slug, description, location, phone } = req.body;
    const store = await prisma.store.create({
      data: { ownerId: req.user!.userId, name, slug, description, location, phone }
    });
    res.status(201).json(store);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// List products for a store
app.get('/stores/:storeId/products', async (req, res) => {
  const products = await prisma.product.findMany({
    where: { storeId: req.params.storeId, isActive: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json(products);
});

// Add product
app.post('/stores/:storeId/products', authenticate, async (req, res) => {
  try {
    const store = await prisma.store.findUnique({ where: { id: req.params.storeId } });
    if (!store || store.ownerId !== req.user!.userId) {
      return res.status(403).json({ error: 'Not your store' });
    }
    const product = await prisma.product.create({
      data: { ...req.body, storeId: req.params.storeId }
    });
    res.status(201).json(product);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ─── KYC Routes ──────────────────────────────────────────────────────────────

app.post('/kyc', authenticate, requireRole('STORE_OWNER'), async (req, res) => {
  try {
    const existing = await prisma.kYC.findUnique({ where: { userId: req.user!.userId } });
    if (existing) return res.status(400).json({ error: 'KYC already submitted' });

    const kyc = await prisma.kYC.create({
      data: { userId: req.user!.userId, ...req.body }
    });
    res.status(201).json(kyc);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Admin reviews KYC
app.patch('/kyc/:id/review', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const kyc = await prisma.kYC.update({
      where: { id: req.params.id },
      data: {
        status,
        reviewedBy: req.user!.userId,
        reviewedAt: new Date(),
        rejectionReason
      }
    });
    res.json(kyc);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ─── Order & Escrow Routes ───────────────────────────────────────────────────

// Create order
app.post('/orders', authenticate, async (req, res) => {
  try {
    const { storeId, items, deliveryAddress, deliveryLat, deliveryLng, customerNote } = req.body;

    // Validate items and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product || !product.isActive) throw new Error(`Product ${item.productId} not found`);
      if (product.quantity < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);

      const totalPrice = Number(product.price) * item.quantity;
      totalAmount += totalPrice;

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice
      });
    }

    const order = await prisma.order.create({
      data: {
        customerId: req.user!.userId,
        storeId,
        totalAmount,
        deliveryAddress,
        deliveryLat,
        deliveryLng,
        customerNote,
        items: { create: orderItems }
      },
      include: { items: true }
    });

    res.status(201).json(order);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Confirm payment (called by CamPay webhook or client after payment)
app.post('/orders/:orderId/pay', authenticate, async (req, res) => {
  try {
    const { paymentProviderRef } = req.body;
    await escrowService.holdPayment(req.params.orderId, paymentProviderRef);
    res.json({ status: 'payment_held' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Store confirms processing
app.post('/orders/:orderId/process', authenticate, async (req, res) => {
  try {
    const store = await prisma.store.findUnique({ where: { ownerId: req.user!.userId } });
    if (!store) return res.status(403).json({ error: 'Not a store owner' });
    await escrowService.confirmProcessing(req.params.orderId, store.id);
    res.json({ status: 'processing' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Dispatch order (assign transporter)
app.post('/orders/:orderId/dispatch', authenticate, async (req, res) => {
  try {
    const store = await prisma.store.findUnique({ where: { ownerId: req.user!.userId } });
    if (!store) return res.status(403).json({ error: 'Not a store owner' });
    const { transporterId } = req.body;
    await escrowService.dispatchOrder(req.params.orderId, store.id, transporterId);
    res.json({ status: 'dispatched' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Mark in transit
app.post('/orders/:orderId/transit', authenticate, async (req, res) => {
  try {
    await escrowService.markInTransit(req.params.orderId, req.user!.userId);
    res.json({ status: 'in_transit' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Mark delivered
app.post('/orders/:orderId/deliver', authenticate, async (req, res) => {
  try {
    await escrowService.markDelivered(req.params.orderId, req.user!.userId);
    res.json({ status: 'delivered' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Customer confirms receipt
app.post('/orders/:orderId/confirm', authenticate, async (req, res) => {
  try {
    await escrowService.confirmReceipt(req.params.orderId, req.user!.userId);
    res.json({ status: 'completed' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Customer requests refund
app.post('/orders/:orderId/refund-request', authenticate, async (req, res) => {
  try {
    const { reason } = req.body;
    await escrowService.requestRefund(req.params.orderId, req.user!.userId, reason);
    res.json({ status: 'disputed' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Admin: process refund
app.post('/orders/:orderId/refund', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    await escrowService.processRefund(req.params.orderId, req.user!.userId);
    res.json({ status: 'refunded' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Admin: reject dispute
app.post('/orders/:orderId/reject-dispute', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    await escrowService.rejectDispute(req.params.orderId, req.user!.userId);
    res.json({ status: 'completed' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Get my orders
app.get('/orders', authenticate, async (req, res) => {
  const where: any = {};

  if (req.user!.role === 'CUSTOMER') where.customerId = req.user!.userId;
  else if (req.user!.role === 'STORE_OWNER') {
    const store = await prisma.store.findUnique({ where: { ownerId: req.user!.userId } });
    if (store) where.storeId = store.id;
  } else if (req.user!.role === 'TRANSPORTER') {
    where.transporterId = req.user!.userId;
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      items: { include: { product: true } },
      store: true,
      escrow: true,
      tracking: { orderBy: { timestamp: 'desc' }, take: 1 }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json(orders);
});

// ─── Tracking Routes ─────────────────────────────────────────────────────────

// Transporter reports location
app.post('/tracking/location', authenticate, requireRole('TRANSPORTER'), async (req, res) => {
  try {
    const { lat, lng, speed } = req.body;
    const result = await trackingService.recordLocation(req.user!.userId, lat, lng, speed);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Get tracking for an order
app.get('/orders/:orderId/tracking', authenticate, async (req, res) => {
  try {
    const history = await trackingService.getTrackingHistory(req.params.orderId);
    const latest = await trackingService.getLatestLocation(req.params.orderId);
    res.json({ history, latest });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Find nearby transporters
app.get('/transporters/nearby', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radius = parseFloat(req.query.radius as string) || 5;
    const nearby = await trackingService.getNearbyTransporters(lat, lng, radius);
    res.json(nearby);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ─── WebSocket ───────────────────────────────────────────────────────────────

io.on('connection', (socket) => {
  console.log(`WS client connected: ${socket.id}`);

  // Join a room for order tracking
  socket.on('track:subscribe', (orderId: string) => {
    socket.join(`order:${orderId}`);
    console.log(`${socket.id} subscribed to order ${orderId}`);
  });

  socket.on('track:unsubscribe', (orderId: string) => {
    socket.leave(`order:${orderId}`);
  });

  // Transporter sends live location via WebSocket
  socket.on('track:update', async (data: { orderId: string; lat: number; lng: number; speed?: number }) => {
    const { orderId, lat, lng, speed } = data;
    // Broadcast to all subscribers of this order
    io.to(`order:${orderId}`).emit('track:location', { orderId, lat, lng, speed, timestamp: new Date() });
  });

  socket.on('disconnect', () => {
    console.log(`WS client disconnected: ${socket.id}`);
  });
});

// ─── Start ───────────────────────────────────────────────────────────────────

const PORT = parseInt(process.env.PORT || '3000', 10);

httpServer.listen(PORT, () => {
  console.log(`🏪 wunabuy server running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
});
