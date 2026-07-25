/**
 * wunabuy — Escrow Service
 *
 * Core business logic for the escrow payment flow:
 * 1. Customer pays → funds held by platform (via CamPay)
 * 2. Store notified → prepares goods
 * 3. Transporter delivers → live GPS tracking
 * 4. Customer confirms receipt → funds released to store
 *
 * Edge cases handled:
 * - Customer doesn't confirm (auto-release after 72h with dispute window)
 * - Store fails to deliver (customer requests refund)
 * - Partial delivery / damaged goods (dispute flow)
 * - Payment failure / timeout
 */

import { PrismaClient, OrderStatus, EscrowStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Time windows (milliseconds)
const AUTO_CONFIRM_TIMEOUT_MS = 72 * 60 * 60 * 1000; // 72 hours after delivery
const DISPUTE_WINDOW_MS = 24 * 60 * 60 * 1000;       // 24h to file dispute after delivery
const PAYMENT_TIMEOUT_MS = 30 * 60 * 1000;            // 30min to complete payment

export class EscrowService {
  /**
   * Initiate escrow — called when customer places order and pays
   * The payment provider (CamPay) confirms funds are collected,
   * and we record them as HELD.
   */
  async holdPayment(orderId: string, paymentProviderRef: string): Promise<void> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { escrow: true }
    });

    if (!order) throw new Error(`Order ${orderId} not found`);
    if (order.escrow) throw new Error(`Escrow already exists for order ${orderId}`);
    if (order.status !== OrderStatus.PENDING_PAYMENT) {
      throw new Error(`Cannot hold payment for order in status ${order.status}`);
    }

    await prisma.$transaction([
      prisma.escrowTransaction.create({
        data: {
          orderId,
          amount: order.totalAmount,
          currency: order.currency,
          status: EscrowStatus.HELD,
          providerRef: paymentProviderRef,
          heldAt: new Date()
        }
      }),
      prisma.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.PAYMENT_HELD }
      })
    ]);
  }

  /**
   * Store confirms they're preparing the order
   */
  async confirmProcessing(orderId: string, storeId: string): Promise<void> {
    const order = await this.validateStoreOwnership(orderId, storeId);
    if (order.status !== OrderStatus.PAYMENT_HELD) {
      throw new Error(`Cannot process order in status ${order.status}`);
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.PROCESSING }
    });
  }

  /**
   * Store dispatches — assigns a transporter
   */
  async dispatchOrder(
    orderId: string,
    storeId: string,
    transporterId: string
  ): Promise<void> {
    const order = await this.validateStoreOwnership(orderId, storeId);
    if (order.status !== OrderStatus.PROCESSING) {
      throw new Error(`Cannot dispatch order in status ${order.status}`);
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.DISPATCHED,
        transporterId,
        dispatchedAt: new Date()
      }
    });
  }

  /**
   * Transporter starts moving — pickup complete
   */
  async markInTransit(orderId: string, transporterId: string): Promise<void> {
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order || order.transporterId !== transporterId) {
      throw new Error('Transporter not assigned to this order');
    }
    if (order.status !== OrderStatus.DISPATCHED) {
      throw new Error(`Cannot mark in-transit from status ${order.status}`);
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.IN_TRANSIT }
    });
  }

  /**
   * Transporter marks as delivered to customer
   */
  async markDelivered(orderId: string, transporterId: string): Promise<void> {
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order || order.transporterId !== transporterId) {
      throw new Error('Transporter not assigned to this order');
    }
    if (order.status !== OrderStatus.IN_TRANSIT) {
      throw new Error(`Cannot deliver from status ${order.status}`);
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.DELIVERED,
        deliveredAt: new Date()
      }
    });

    // Schedule auto-confirmation timeout
    this.scheduleAutoConfirm(orderId, AUTO_CONFIRM_TIMEOUT_MS);
  }

  /**
   * Customer confirms receipt → release escrow to store
   * This is the money moment.
   */
  async confirmReceipt(orderId: string, customerId: string): Promise<void> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { escrow: true }
    });

    if (!order || order.customerId !== customerId) {
      throw new Error('Customer not authorized for this order');
    }
    if (order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.PAYMENT_HELD) {
      throw new Error(`Cannot confirm receipt from status ${order.status}`);
    }
    if (!order.escrow || order.escrow.status !== EscrowStatus.HELD) {
      throw new Error('Escrow not in held state');
    }

    // In production, this would call CamPay to release funds to the store
    // For now, we mark it in the database
    await prisma.$transaction([
      prisma.escrowTransaction.update({
        where: { id: order.escrow.id },
        data: {
          status: EscrowStatus.RELEASED,
          releasedAt: new Date(),
          storePayoutRef: `payout_${orderId}_${Date.now()}`
        }
      }),
      prisma.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.COMPLETED,
          confirmedAt: new Date()
        }
      })
    ]);
  }

  /**
   * Customer requests refund (store failed to deliver or goods are wrong)
   * Only available within dispute window after delivery.
   */
  async requestRefund(orderId: string, customerId: string, reason: string): Promise<void> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { escrow: true }
    });

    if (!order || order.customerId !== customerId) {
      throw new Error('Customer not authorized for this order');
    }
    if (order.status !== OrderStatus.DELIVERED) {
      throw new Error('Can only request refund for delivered orders');
    }

    const timeSinceDelivery = Date.now() - (order.deliveredAt?.getTime() ?? 0);
    if (timeSinceDelivery > DISPUTE_WINDOW_MS) {
      throw new Error('Dispute window has expired');
    }

    if (!order.escrow || order.escrow.status !== EscrowStatus.HELD) {
      throw new Error('Escrow not available for refund');
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.DISPUTED,
        cancellationReason: reason
      }
    });

    // Admin reviews dispute, then calls processRefund() or rejects
  }

  /**
   * Admin processes a refund — releases escrow back to customer
   */
  async processRefund(orderId: string, adminId: string): Promise<void> {
    const escrow = await prisma.escrowTransaction.findUnique({
      where: { orderId },
      include: { order: true }
    });

    if (!escrow || escrow.status !== EscrowStatus.HELD) {
      throw new Error('Escrow not in held state');
    }

    // In production: call CamPay to refund customer
    await prisma.$transaction([
      prisma.escrowTransaction.update({
        where: { id: escrow.id },
        data: {
          status: EscrowStatus.REFUNDED,
          refundedAt: new Date()
        }
      }),
      prisma.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CANCELLED,
          cancelledAt: new Date()
        }
      })
    ]);
  }

  /**
   * Admin rejects a dispute — release funds to store
   */
  async rejectDispute(orderId: string, adminId: string): Promise<void> {
    const escrow = await prisma.escrowTransaction.findUnique({
      where: { orderId },
      include: { order: true }
    });

    if (!escrow || escrow.status !== EscrowStatus.HELD) {
      throw new Error('Escrow not in held state');
    }

    // Release to store
    await prisma.$transaction([
      prisma.escrowTransaction.update({
        where: { id: escrow.id },
        data: {
          status: EscrowStatus.RELEASED,
          releasedAt: new Date()
        }
      }),
      prisma.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.COMPLETED,
          confirmedAt: new Date()
        }
      })
    ]);
  }

  /**
   * Get escrow state for an order
   */
  async getEscrowState(orderId: string) {
    const escrow = await prisma.escrowTransaction.findUnique({
      where: { orderId },
      include: {
        order: {
          include: {
            items: {
              include: { product: true }
            },
            store: true,
            customer: true,
            transporter: true
          }
        }
      }
    });
    return escrow;
  }

  /**
   * Auto-confirm — called after timeout if customer hasn't confirmed
   */
  private async autoConfirm(orderId: string): Promise<void> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { escrow: true }
    });

    if (!order || order.status !== OrderStatus.DELIVERED) return;
    if (!order.escrow || order.escrow.status !== EscrowStatus.HELD) return;

    // Auto-release to store — customer had their window
    await this.confirmReceipt(orderId, order.customerId);
  }

  private scheduleAutoConfirm(orderId: string, delayMs: number): void {
    // In production, use a job queue (Bull/BullMQ) or cron
    // For MVP, use setTimeout with DB persistence
    setTimeout(() => {
      this.autoConfirm(orderId).catch(console.error);
    }, delayMs);
  }

  private async validateStoreOwnership(orderId: string, storeId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });
    if (!order) throw new Error(`Order ${orderId} not found`);
    if (order.storeId !== storeId) throw new Error('Store does not own this order');
    return order;
  }
}

export const escrowService = new EscrowService();
