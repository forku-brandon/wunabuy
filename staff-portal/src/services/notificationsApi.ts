import { apiRequest } from './apiClient';
import { ApiResponse } from '@wunabuy/types';

export interface BroadcastNotificationPayload {
  audience: 'all' | 'buyers' | 'sellers' | 'transporters';
  title: string;
  message: string;
  type: 'marketing' | 'system' | 'alert' | 'promo';
  data?: Record<string, any>;
}

export interface DirectNotificationPayload {
  user_id: string;
  title: string;
  message: string;
  type: 'marketing' | 'system' | 'alert' | 'order_status';
  data?: Record<string, any>;
}

export interface BroadcastResult {
  message: string;
  queued_count: number;
}

export const notificationsApi = {
  /**
   * Broadcast real-time push and inbox notifications to an audience segment.
   */
  async broadcastNotification(payload: BroadcastNotificationPayload): Promise<ApiResponse<BroadcastResult>> {
    return apiRequest<BroadcastResult>('/staff/notifications/broadcast', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Send direct targeted push and inbox notification to a specific user.
   */
  async sendDirectNotification(payload: DirectNotificationPayload): Promise<ApiResponse<any>> {
    return apiRequest<any>('/staff/notifications/send-direct', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
