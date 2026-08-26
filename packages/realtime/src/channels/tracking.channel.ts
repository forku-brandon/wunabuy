import Echo from 'laravel-echo';
import type { DriverLocation } from '@wunabuy/types';

/**
 * Subscribe to live transporter GPS breadcrumb updates during active transit.
 */
export function subscribeToDeliveryTracking(
  echo: Echo<any>,
  orderId: string,
  onLocationUpdate: (update: DriverLocation) => void
) {
  const channel = echo.private(`tracking.${orderId}`);

  channel.listen('.gps_update', (payload: DriverLocation) => {
    onLocationUpdate(payload);
  });

  return () => {
    echo.leave(`tracking.${orderId}`);
  };
}
