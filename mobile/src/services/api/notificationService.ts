import { api } from './apiClient';

export interface ApiNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'order_status' | 'escrow' | 'delivery' | 'marketing' | 'promo' | 'system' | 'alert' | string;
  is_read: boolean;
  data?: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationListResponse {
  notifications: ApiNotification[];
  unread_count: number;
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export const NotificationApiService = {
  /**
   * Get paginated notifications with optional filter.
   */
  async getNotifications(type?: string, page = 1): Promise<NotificationListResponse> {
    try {
      const params: Record<string, any> = { page };
      if (type && type !== 'all') {
        params.type = type;
      }
      const response = await api.client.get<{ success: boolean; data: NotificationListResponse }>('/notifications', { params });
      return response.data.data;
    } catch {
      return {
        notifications: [],
        unread_count: 0,
        pagination: { current_page: 1, last_page: 1, per_page: 20, total: 0 },
      };
    }
  },

  /**
   * Get unread notification count.
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response = await api.client.get<{ success: boolean; data: { unread_count: number } }>('/notifications/unread-count');
      return response.data.data?.unread_count ?? 0;
    } catch {
      return 0;
    }
  },

  /**
   * Mark a single notification as read.
   */
  async markAsRead(id: string): Promise<boolean> {
    try {
      const response = await api.client.post<{ success: boolean }>(`/notifications/${id}/read`);
      return response.data.success;
    } catch {
      return false;
    }
  },

  /**
   * Mark all notifications as read.
   */
  async markAllAsRead(): Promise<boolean> {
    try {
      const response = await api.client.post<{ success: boolean }>('/notifications/mark-all-read');
      return response.data.success;
    } catch {
      return false;
    }
  },

  /**
   * Delete a notification.
   */
  async deleteNotification(id: string): Promise<boolean> {
    try {
      const response = await api.client.delete<{ success: boolean }>(`/notifications/${id}`);
      return response.data.success;
    } catch {
      return false;
    }
  },

  /**
   * Clear all notifications for user.
   */
  async clearAll(): Promise<boolean> {
    try {
      const response = await api.client.delete<{ success: boolean }>('/notifications/clear-all');
      return response.data.success;
    } catch {
      return false;
    }
  },

  /**
   * Register device push token with backend.
   */
  async registerDeviceToken(token: string, platform = 'android', deviceName?: string): Promise<boolean> {
    try {
      const response = await api.client.post<{ success: boolean }>('/notifications/device-token', {
        token,
        platform,
        device_name: deviceName,
      });
      return response.data.success;
    } catch {
      return false;
    }
  },

  /**
   * Unregister device push token on logout.
   */
  async removeDeviceToken(token: string): Promise<boolean> {
    try {
      const response = await api.client.delete<{ success: boolean }>('/notifications/device-token', {
        data: { token },
      });
      return response.data.success;
    } catch {
      return false;
    }
  },
};
