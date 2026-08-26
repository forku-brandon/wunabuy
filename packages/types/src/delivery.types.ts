import { Address } from './auth.types';
import { StoreSummary } from './commerce.types';

/**
 * Details of a delivery job assigned to a transporter.
 */
export interface DeliveryJob {
  /** Unique UUID for the delivery job */
  id: string;
  /** UUID of the associated order */
  order_id: string;
  /** Human-readable order code */
  order_code: string;
  /** Store where items are picked up */
  store: StoreSummary;
  /** Address for pickup */
  pickup_address: Address;
  /** Address for final delivery */
  delivery_address: Address;
  /** Summary of items to be delivered */
  items_summary: string;
  /** Fee paid to the transporter */
  delivery_fee: number;
  /** Currency of the delivery fee */
  currency: 'XAF';
  /** Total estimated delivery distance in km */
  distance_km: number;
  /** Current status of the delivery job */
  status: string;
  /** ISO 8601 date string for job creation */
  created_at: string;
}

/**
 * Real-time location broadcast for a driver.
 */
export interface DriverLocation {
  /** UUID of the associated order */
  order_id: string;
  /** UUID of the assigned transporter */
  transporter_id: string;
  /** Current latitude */
  latitude: number;
  /** Current longitude */
  longitude: number;
  /** Compass heading in degrees */
  heading: number;
  /** Current speed in m/s */
  speed: number;
  /** Timestamp of the location update */
  timestamp: string;
}

/**
 * Event for updating the status of a delivery.
 */
export interface DeliveryStatusUpdate {
  /** UUID of the delivery job */
  delivery_id: string;
  /** New status of the delivery */
  status: 'en_route' | 'picked_up' | 'in_transit' | 'delivered';
  /** Timestamp of the update */
  timestamp: string;
}

/**
 * Captured proof of successful delivery.
 */
export interface ProofOfDelivery {
  /** UUID of the delivery job */
  delivery_id: string;
  /** URL to the captured photo evidence */
  photo_url: string;
  /** Base64 encoded signature data from the recipient */
  signature_data: string;
  /** Timestamp when proof was captured */
  captured_at: string;
  /** Latitude where proof was captured */
  latitude: number;
  /** Longitude where proof was captured */
  longitude: number;
}
