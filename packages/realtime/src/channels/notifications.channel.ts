import Echo from 'laravel-echo';
import type { Notification } from '@wunabuy/types';

/**
 * Subscribe to user-specific real-time notifications and alerts.
 */
export function subscribeToUserNotifications(
  echo: Echo,
  userId: string,
  onNotificationReceived: (notification: Notification) => void
) {
  const channel = echo.private(`user.${userId}`);

  channel.listen('.notification.received', (payload: Notification) => {
    onNotificationReceived(payload);
  });

  return () => {
    echo.leave(`user.${userId}`);
  };
}

