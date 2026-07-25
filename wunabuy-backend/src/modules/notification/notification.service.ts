import { supabase } from '../../config/database';
import { logger } from '../../config/logger';
import axios from 'axios';
import { env } from '../../config/env';

export const notificationService = {
  async sendSms(phone: string, message: string): Promise<void> {
    try {
      const response = await axios.post('https://api.africastalking.com/version1/messaging',
        new URLSearchParams({
          username: 'wunabuy',
          to: phone,
          message,
          from: env.AFRICAS_TALKING_SENDER_ID || 'WUNABUY',
        }),
        {
          headers: {
            apiKey: env.AFRICAS_TALKING_API_KEY || '',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 10000,
        }
      );
      logger.info({ phone }, 'SMS sent');
    } catch (err) {
      logger.error({ err, phone }, 'SMS send failed');
      // TODO: Twilio fallback
    }
  },

  async sendPushNotification(userId: string, title: string, body: string, data?: any): Promise<void> {
    const { data: user } = await supabase
      .from('users')
      .select('fcm_token')
      .eq('id', userId)
      .single();

    if (!user?.fcm_token) return;

    // TODO: Implement FCM push via firebase-admin
    logger.info({ userId, title }, 'Push notification queued');
  },

  async sendInApp(userId: string, type: string, title: string, body: string, data?: any): Promise<void> {
    await supabase.from('notifications').insert({
      user_id: userId,
      type,
      title,
      body,
      data,
      channel: 'in_app',
    });
  },

  async send(userId: string, params: {
    type: string;
    title: string;
    body: string;
    channel?: 'push' | 'sms' | 'in_app' | 'all';
    data?: any;
  }): Promise<void> {
    const channel = params.channel || 'push';
    
    if (channel === 'all' || channel === 'push') {
      await this.sendPushNotification(userId, params.title, params.body, params.data);
    }
    if (channel === 'all' || channel === 'in_app') {
      await this.sendInApp(userId, params.type, params.title, params.body, params.data);
    }
    if (channel === 'sms') {
      // Get phone and send SMS
      const { data: user } = await supabase.from('users').select('phone').eq('id', userId).single();
      if (user?.phone) await this.sendSms(user.phone, params.body);
    }
  },
};
