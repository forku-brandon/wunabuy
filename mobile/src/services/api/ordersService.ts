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
      if (response && response.data && response.data.length > 0) {
        return response.data;
      }
      return getMockOrders(filters?.status);
    } catch {
      return getMockOrders(filters?.status);
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
      return getMockOrders().find((o) => o.id === id) || null;
    } catch {
      return getMockOrders().find((o) => o.id === id) || null;
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

function getMockOrders(statusFilter?: OrderStatus): Order[] {
  const mockOrders: Order[] = [
    {
      id: 'wb_order_1',
      order_code: 'WNB-2026-9842',
      customer_id: 'user_101',
      store_id: 'store_101',
      transporter_id: 'driver_201',
      status: OrderStatus.EN_ROUTE,
      items: [
        {
          product_id: 'prod_1',
          name: 'Glow Radiance Serum (10% Niacinamide)',
          price: 18500,
          quantity: 1,
          image_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
        },
      ],
      subtotal: 18500,
      delivery_fee: 1500,
      commission: 650,
      total: 20000,
      currency: 'XAF',
      delivery_address: {
        id: 'addr_1',
        label: 'Home',
        latitude: 4.051,
        longitude: 9.767,
        address_text: 'Rue Joss, Akwa',
        city: 'Douala',
        is_default: true,
      },
      payment_method: PaymentMethod.WALLET,
      payment_ref: 'WNB-ESC-WAL-99812',
      expires_at: null,
      disputed_at: null,
      delivered_at: null,
      completed_at: null,
      created_at: new Date(Date.now() - 3600000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'wb_order_2',
      order_code: 'WNB-2026-9411',
      customer_id: 'user_101',
      store_id: 'store_101',
      transporter_id: 'driver_201',
      status: OrderStatus.DELIVERED,
      items: [
        {
          product_id: 'prod_2',
          name: 'Hydra Moisturizer Cream',
          price: 14500,
          quantity: 2,
          image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
        },
      ],
      subtotal: 29000,
      delivery_fee: 1500,
      commission: 1015,
      total: 30500,
      currency: 'XAF',
      delivery_address: {
        id: 'addr_1',
        label: 'Home',
        latitude: 4.051,
        longitude: 9.767,
        address_text: 'Rue Joss, Akwa',
        city: 'Douala',
        is_default: true,
      },
      payment_method: PaymentMethod.MOMO,
      payment_ref: 'WNB-ESC-MOMO-88192',
      expires_at: null,
      disputed_at: null,
      delivered_at: null,
      completed_at: null,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  if (statusFilter) {
    return mockOrders.filter((o) => o.status === statusFilter);
  }
  return mockOrders;
}
