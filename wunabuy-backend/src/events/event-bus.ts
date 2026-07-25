import { redis } from '../config/redis';
import { logger } from '../config/logger';

export type EventHandler = (payload: any) => Promise<void>;

class EventBus {
  private handlers: Map<string, EventHandler[]> = new Map();

  on(event: string, handler: EventHandler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(handler);
  }

  async emit(event: string, payload: any): Promise<void> {
    // Publish to Redis for cross-process communication
    await redis.publish(`events:${event}`, JSON.stringify(payload));
    
    // Handle locally
    const handlers = this.handlers.get(event) || [];
    for (const handler of handlers) {
      try {
        await handler(payload);
      } catch (err) {
        logger.error({ err, event }, 'Event handler error');
      }
    }
  }

  subscribe(event: string, handler: EventHandler) {
    this.on(event, handler);
  }
}

export const eventBus = new EventBus();

// Event names
export const Events = {
  ORDER_CREATED: 'order.created',
  ORDER_PAID: 'order.paid',
  ORDER_STATUS_CHANGED: 'order.status_changed',
  ORDER_CANCELLED: 'order.cancelled',
  ORDER_DELIVERED: 'order.delivered',
  ORDER_CONFIRMED: 'order.confirmed',
  ESCROW_RELEASED: 'escrow.released',
  KYC_SUBMITTED: 'kyc.submitted',
  KYC_APPROVED: 'kyc.approved',
  KYC_REJECTED: 'kyc.rejected',
  CHAT_MESSAGE_SENT: 'chat.message_sent',
  VIDEO_PUBLISHED: 'video.published',
  PAYOUT_REQUESTED: 'payout.requested',
  PAYOUT_APPROVED: 'payout.approved',
  DISPUTE_OPENED: 'dispute.opened',
  DISPUTE_RESOLVED: 'dispute.resolved',
} as const;
