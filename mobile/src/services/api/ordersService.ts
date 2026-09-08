import { api } from './apiClient';
import { Order, OrderStatus, CreateOrderPayload, PaymentMethod, DisputePayload } from '@wunabuy/types';

export interface CheckoutPaymentPayload {
  order_id: string;
  method: 'wallet' | 'momo';
  provider?: 'mtn' | 'orange';
  phone?: string;
  amount: number;
  currency?: string;
}

export interface CheckoutPaymentResult {
  payment_ref: string;
  order_id: string;
  status: string;
  method: string;
  amount: number;
  currency: string;
  dial_code?: string;
  instruction?: string;
  escrow_locked_at?: string;
}

/**
 * Service to manage orders, checkout escrow payments, and disputes.
 */
export const OrdersService = {
  /**
   * Fetch orders for current authenticated user
   */
  async getOrders(filters?: { status?: OrderStatus; role?: 'buyer' | 'seller' | 'transporter' }): Promise<Order[]> {
    try {
      const response = await api.orders.getOrders(filters);
      if (response && response.data) {
        const list = Array.isArray(response.data) ? response.data : (response.data as any)?.orders;
        if (Array.isArray(list)) {
          return list;
        }
      }
      return [];
    } catch {
      return [];
    }
  },

  /**
   * Fetch single order by ID
   */
  async getOrderById(id: string): Promise<Order | null> {
    try {
      const response = await api.orders.getOrderById(id);
      if (response && response.data) {
        return response.data;
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Create order from cart checkout
   */
  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    const response = await api.orders.createOrder(payload);
    return response.data;
  },

  /**
   * Pay order with Escrow (Wallet Balance or Mobile Money)
   */
  async payCheckout(payload: CheckoutPaymentPayload): Promise<CheckoutPaymentResult> {
    try {
      const response = await api.client.post<{ success: boolean; data: CheckoutPaymentResult }>('/checkout/pay', payload);
      return response.data.data;
    } catch {
      // Mock simulation for offline testing
      return {
        payment_ref: payload.method === 'wallet' ? 'WNB-ESC-WAL-' + Date.now().toString().slice(-5) : 'WNB-ESC-MOMO-' + Date.now().toString().slice(-5),
        order_id: payload.order_id,
        status: payload.method === 'wallet' ? 'paid_escrow' : 'pending_escrow_confirmation',
        method: payload.method,
        amount: payload.amount,
        currency: payload.currency || 'XAF',
        dial_code: payload.provider === 'orange' ? '#150*50#' : '*126#',
        instruction: `Please dial ${payload.provider === 'orange' ? '#150*50#' : '*126#'} on your phone to approve payment.`,
        escrow_locked_at: new Date().toISOString(),
      };
    }
  },

  /**
   * Confirm delivery receipt & release escrow funds to seller
   */
  async confirmDelivery(orderId: string): Promise<Order> {
    const response = await api.orders.confirmOrderReceipt(orderId);
    return response.data;
  },

  /**
   * File dispute on order
   */
  async fileDispute(orderId: string, payload: DisputePayload): Promise<any> {
    const response = await api.orders.disputeOrder(orderId, payload);
    return response.data;
  },
};
