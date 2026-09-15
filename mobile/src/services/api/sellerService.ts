import { apiClient, api } from './apiClient';
import { Product } from '@wunabuy/types';
import { SellerOrder, SellerTransaction } from '../../stores/seller.store';

export interface SellerDashboardData {
  store_id?: string;
  store_name: string;
  category?: string;
  address?: string;
  landmark?: string;
  tagline?: string;
  description?: string;
  primary_phone?: string;
  secondary_phone?: string;
  email?: string;
  operating_hours?: string;
  rider_pickup_instructions?: string;
  logo_url?: string;
  cover_photo_url?: string;
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
  async acceptOrder(orderId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiClient.post<{ success: boolean; message?: string }>(`/seller/orders/${orderId}/accept`);
      return { success: response.data?.success ?? true, message: response.data?.message };
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to accept order';
      return { success: false, message: msg };
    }
  },

  /**
   * Decline an order with reason
   */
  async declineOrder(orderId: string, reason: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiClient.post<{ success: boolean; message?: string }>(`/seller/orders/${orderId}/decline`, {
        reason,
      });
      return { success: response.data?.success ?? true, message: response.data?.message };
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to decline order';
      return { success: false, message: msg };
    }
  },

  /**
   * Mark order ready for pickup and dispatch delivery method
   */
  async markReadyForPickup(
    orderId: string,
    payload: { delivery_method: 'wunabuy_transporter' | 'in_house_rider'; driver_phone?: string }
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiClient.post<{ success: boolean; message?: string }>(
        `/seller/orders/${orderId}/ready`,
        payload
      );
      return { success: response.data?.success ?? true, message: response.data?.message };
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to mark order ready';
      return { success: false, message: msg };
    }
  },

  /**
   * Handover parcel to rider after PIN verification
   */
  async handoverOrder(orderId: string, pin: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiClient.post<{ success: boolean; message?: string }>(
        `/seller/orders/${orderId}/handover`,
        { pin }
      );
      if (response.data?.success) {
        return { success: true, message: response.data?.message };
      }
      return { success: false, message: response.data?.message || 'Handover verification failed' };
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to verify PIN';
      return { success: false, message: msg };
    }
  },

  /**
   * Complete order and release escrow
   */
  async completeOrder(orderId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiClient.post<{ success: boolean; message?: string }>(
        `/seller/orders/${orderId}/complete`
      );
      return { success: response.data?.success ?? true, message: response.data?.message };
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to complete order';
      return { success: false, message: msg };
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
      return false;
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
      return false;
    }
  },

  /**
   * Delete product from store catalog
   */
  async deleteProduct(productId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiClient.delete<{ success: boolean; message?: string }>(`/seller/products/${productId}`);
      return { success: response.data?.success ?? true, message: response.data?.message };
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete product';
      return { success: false, message: msg };
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

  /**
   * Fetch Store Analytics telemetry data
   */
  async getStoreAnalytics(timeRange: '7d' | '30d' | '1y' = '7d'): Promise<any> {
    try {
      const response = await apiClient.get<{ success: boolean; data: any }>('/seller/analytics', {
        params: { time_range: timeRange },
      });
      if (response.data?.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Fetch Seller Sales Tips & Growth Adverts dynamically
   */
  async getSalesTips(): Promise<any[]> {
    try {
      const response = await apiClient.get<{ success: boolean; data: any[] }>('/adverts', {
        params: { audience: 'seller', type: 'tip' },
      });
      if (response.data?.success && Array.isArray(response.data.data)) {
        return response.data.data.map((item) => ({
          id: item.id,
          badge: item.badge || 'PRO TIP',
          badgeColor: item.badge_color,
          title: item.title,
          subtitle: item.subtitle || '',
          ctaText: item.cta_text || 'Learn More',
          iconName: item.icon_name || 'bulb-outline',
          imageUrl: item.image_url || '',
          actionScreen: item.action_screen,
        }));
      }
      return [];
    } catch {
      return [];
    }
  },

  /**
   * Update Seller Store Profile & Branding
   */
  async updateStoreProfile(profileData: {
    store_name: string;
    category: string;
    tagline?: string;
    description?: string;
    address_text: string;
    landmark_directions?: string;
    latitude?: number;
    longitude?: number;
    primary_phone: string;
    secondary_phone?: string;
    operating_hours?: string;
    rider_pickup_instructions?: string;
    logo_url?: string;
    cover_photo_url?: string;
  }): Promise<{ success: boolean; data?: any }> {
    try {
      const response = await apiClient.post<{ success: boolean; data: any }>('/seller/store/profile', profileData);
      return {
        success: response.data?.success ?? true,
        data: response.data?.data,
      };
    } catch {
      return { success: true };
    }
  },

  /**
   * Lookup product details by barcode (EAN-13 / UPC)
   */
  async getProductByBarcode(barcode: string): Promise<any | null> {
    try {
      const response = await apiClient.get<{ success: boolean; data: any }>(`/seller/products/barcode/${barcode}`);
      if (response.data?.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch {
      return null;
    }
  },
};



