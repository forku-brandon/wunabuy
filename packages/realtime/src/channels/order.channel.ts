import Echo from 'laravel-echo';
import type { OrderStatus } from '@wunabuy/types';

export interface OrderStatusUpdatedPayload {
  order_id: string;
  order_code: string;
  status: OrderStatus;
  timestamp: string;
}

export interface PaymentConfirmedPayload {
  order_id: string;
  payment_ref: string;
  status: 'paid_escrow';
}

/**
 * Subscribe to private order lifecycle status changes.
 */
export function subscribeToOrderUpdates(
  echo: Echo,
  orderId: string,
  onStatusUpdated: (payload: OrderStatusUpdatedPayload) => void,
  onPaymentConfirmed?: (payload: PaymentConfirmedPayload) => void
) {
  const channel = echo.private(`order.${orderId}`);

  channel.listen('.order.status_updated', (payload: OrderStatusUpdatedPayload) => {
    onStatusUpdated(payload);
  });

  if (onPaymentConfirmed) {
    channel.listen('.payment.confirmed', (payload: PaymentConfirmedPayload) => {
      onPaymentConfirmed(payload);
    });
  }

  return () => {
    echo.leave(`order.${orderId}`);
  };
}
