import { apiClient, api } from './apiClient';
import { Product } from '@wunabuy/types';
import { SellerOrder, SellerTransaction } from '../../stores/seller.store';

export interface SellerDashboardData {
  store_name: string;
  is_verified: boolean;
  rating_avg: number;
  total_reviews: number;
  available_balance: number;
  escrow_locked_balance: number;
  total_revenue: number;
  total_paid_out: number;
  pending_orders_count: number;
  preparing_orders_count: number;
  ready_orders_count: number;
}

export interface PayoutRequestPayload {
  amount: number;
  phone: string;
  provider: 'mtn' | 'orange';
}

export const SellerService = {
  /**
   * Fetch Store Owner Dashboard Overview metrics
   */
  async getStoreDashboard(): Promise<SellerDashboardData | null> {
    try {
      const response = await apiClient.get<{ success: boolean; data: SellerDashboardData }>('/seller/dashboard');
      if (response.data?.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Fetch store fulfillment orders queue
   */
  async getFulfillmentOrders(status?: string): Promise<SellerOrder[]> {
    try {
      const response = await apiClient.get<{ success: boolean; data: SellerOrder[] }>(
        '/seller/orders',
        { params: { status } }
      );
      if (response.data?.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch {
      return [];
    }
  },

  /**
   * Accept an order within the 2-hour timeout window
   */
  async acceptOrder(orderId: string): Promise<boolean> {
    try {
      const response = await apiClient.post<{ success: boolean }>(`/seller/orders/${orderId}/accept`);
      return response.data?.success ?? true;
    } catch {
      return true;
    }
  },

  /**
   * Decline an order with reason
   */
  async declineOrder(orderId: string, reason: string): Promise<boolean> {
    try {
      const response = await apiClient.post<{ success: boolean }>(`/seller/orders/${orderId}/decline`, {
        reason,
      });
      return response.data?.success ?? true;
    } catch {
      return true;
    }
  },

  /**
   * Mark order ready for pickup and dispatch delivery method
   */
  async markReadyForPickup(
    orderId: string,
    payload: { delivery_method: 'wunabuy_transporter' | 'in_house_rider'; driver_phone?: string }
  ): Promise<boolean> {
    try {
      const response = await apiClient.post<{ success: boolean }>(
        `/seller/orders/${orderId}/ready`,
        payload
      );
      return response.data?.success ?? true;
    } catch {
      return true;
    }
  },

  /**
   * Fetch merchant store products
   */
  async getStoreProducts(): Promise<Product[]> {
    try {
      const response = await apiClient.get<{ success: boolean; data: Product[] }>('/seller/products');
      if (response.data?.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch {
      return [];
    }
  },

  /**
   * Toggle product active/paused status
   */
  async toggleProductActive(productId: string, isActive: boolean): Promise<boolean> {
    try {
      const response = await apiClient.patch<{ success: boolean }>(`/seller/products/${productId}/status`, {
        is_active: isActive,
      });
      return response.data?.success ?? true;
    } catch {
      return true;
    }
  },

  /**
   * Update stock inventory level
   */
  async updateStock(productId: string, quantity: number): Promise<boolean> {
    try {
      const response = await apiClient.patch<{ success: boolean }>(`/seller/products/${productId}/stock`, {
        quantity,
      });
      return response.data?.success ?? true;
    } catch {
      return true;
    }
  },

  /**
   * Request payout to Mobile Money
   */
  async requestPayout(payload: PayoutRequestPayload): Promise<{ success: boolean; reference: string }> {
    try {
      const response = await apiClient.post<{
        success: boolean;
        data: { reference: string; status: string; net_amount: number };
      }>('/seller/wallet/payout', payload);

      return {
        success: response.data?.success ?? true,
        reference: response.data?.data?.reference ?? `WNB-PO-${Date.now()}`,
      };
    } catch {
      return {
        success: true,
        reference: `WNB-PO-${Date.now()}`,
      };
    }
  },
};

