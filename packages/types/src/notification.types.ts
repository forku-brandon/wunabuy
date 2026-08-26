/**
 * Categories of push notifications sent by the system.
 */
export enum NotificationType {
  ORDER_UPDATE = 'ORDER_UPDATE',
  CHAT_MESSAGE = 'CHAT_MESSAGE',
  KYC_DECISION = 'KYC_DECISION',
  DELIVERY_JOB = 'DELIVERY_JOB',
  PAYMENT_CONFIRMED = 'PAYMENT_CONFIRMED',
  PAYOUT_COMPLETED = 'PAYOUT_COMPLETED',
  PROMO = 'PROMO',
}

/**
 * Represents a single in-app notification.
 */
export interface Notification {
  /** Unique UUID of the notification */
  id: string;
  /** Categorized type of the notification */
  type: NotificationType;
  /** Short title of the notification message */
  title: string;
  /** Full textual body of the notification */
  body: string;
  /** Contextual data associated with the notification payload */
  data: {
    /** ID of the entity this notification is about */
    target_id?: string;
    /** Application route to redirect the user towards */
    deep_link?: string;
    [key: string]: unknown;
  };
  /** Indicates whether the user has seen the notification */
  is_read: boolean;
  /** ISO 8601 timestamp of when the notification was generated */
  created_at: string;
}

/**
 * Structure of the payload pushed via APNS/FCM to devices.
 */
export interface PushPayload {
  /** User-facing notification content */
  notification: {
    /** Push notification title */
    title: string;
    /** Push notification body text */
    body: string;
  };
  /** Invisible background data payload */
  data: {
    /** Type of the push notification */
    type: NotificationType;
    /** Associated resource UUID */
    target_id?: string;
    /** Routing intent for opening the notification */
    deep_link?: string;
    [key: string]: unknown;
  };
}
