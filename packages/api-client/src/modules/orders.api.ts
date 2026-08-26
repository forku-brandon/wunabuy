import { AxiosInstance } from 'axios';
import type {
  ApiResponse,
  PaginatedResponse,
  Order,
  OrderStatus,
  CreateOrderPayload,
  DisputePayload,
} from '@wunabuy/types';

/**
 * Orders & Escrow Lifecycle API Module
 */
export function createOrdersApi(client: AxiosInstance) {
  return {
    /**
     * Create a new order (Buyer checkout). Accepts Idempotency-Key header.
     */
    createOrder: async (payload: CreateOrderPayload, idempotencyKey?: string): Promise<ApiResponse<Order>> => {
      const res = await client.post<ApiResponse<Order>>('/orders', payload, {
        headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
      });
      return res.data;
    },

    /**
     * List user orders with status filtering and role context.
     */
    getOrders: async (filters?: { status?: OrderStatus; role?: 'buyer' | 'seller' | 'transporter'; cursor?: string; limit?: number }): Promise<PaginatedResponse<Order>> => {
      const res = await client.get<PaginatedResponse<Order>>('/orders', { params: filters });
      return res.data;
    },

    /**
     * Fetch a single order by ID with timeline & tracking metadata.
     */
    getOrderById: async (id: string): Promise<ApiResponse<Order>> => {
      const res = await client.get<ApiResponse<Order>>(`/orders/${id}`);
      return res.data;
    },

    /**
     * Update order fulfillment status (Seller/Transporter).
     */
    updateOrderStatus: async (id: string, status: OrderStatus): Promise<ApiResponse<Order>> => {
      const res = await client.put<ApiResponse<Order>>(`/orders/${id}/status`, { status });
      return res.data;
    },

    /**
     * Confirm delivery receipt (Buyer). Releases escrow funds.
     */
    confirmOrderReceipt: async (id: string): Promise<ApiResponse<Order>> => {
      const res = await client.post<ApiResponse<Order>>(`/orders/${id}/confirm`);
      return res.data;
    },

    /**
     * Cancel order (allowed before 'preparing' state).
     */
    cancelOrder: async (id: string, reason?: string): Promise<ApiResponse<Order>> => {
      const res = await client.post<ApiResponse<Order>>(`/orders/${id}/cancel`, { reason });
      return res.data;
    },

    /**
     * Open a dispute on an order (within 48h of delivery). Freezes escrow.
     */
    disputeOrder: async (id: string, payload: DisputePayload): Promise<ApiResponse<Order>> => {
      const res = await client.post<ApiResponse<Order>>(`/orders/${id}/dispute`, payload);
      return res.data;
    },
  };
}
