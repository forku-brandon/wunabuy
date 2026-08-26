import { Address } from './auth.types';

/**
 * Comprehensive list of states an order can be in.
 */
export enum OrderStatus {
  PENDING_PAYMENT = 'pending_payment',
  PAID_ESCROW = 'paid_escrow',
  PREPARING = 'preparing',
  READY_FOR_PICKUP = 'ready_for_pickup',
  EN_ROUTE = 'en_route',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  RECEIVED = 'received',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  DISPUTED = 'disputed',
  RESOLVED = 'resolved',
}

/**
 * Accepted payment methods for an order.
 */
export enum PaymentMethod {
  MOMO = 'momo',
  CARD = 'card',
  WALLET = 'wallet',
}

/**
 * Supported payment providers/gateways.
 */
export enum PaymentProvider {
  FLUTTERWAVE = 'flutterwave',
  PAYSTACK = 'paystack',
}

/**
 * Valid reasons for opening an order dispute.
 */
export enum DisputeReason {
  WRONG_ITEM = 'wrong_item',
  DAMAGED = 'damaged',
  NOT_AS_DESCRIBED = 'not_as_described',
  NON_DELIVERY = 'non_delivery',
}

/**
 * Represents an item within an order.
 */
export interface OrderItem {
  /** UUID of the product */
  product_id: string;
  /** Name of the product */
  name: string;
  /** Unit price at time of order */
  price: number;
  /** Quantity ordered */
  quantity: number;
  /** Image URL of the product */
  image_url: string;
}

/**
 * Represents an order in the system.
 */
export interface Order {
  /** Unique UUID for the order */
  id: string;
  /** Human-readable order reference code */
  order_code: string;
  /** UUID of the purchasing customer */
  customer_id: string;
  /** UUID of the fulfilling store */
  store_id: string;
  /** UUID of the transporter handling delivery, if assigned */
  transporter_id: string | null;
  /** Current status of the order */
  status: OrderStatus;
  /** Items included in the order */
  items: OrderItem[];
  /** Subtotal cost of items */
  subtotal: number;
  /** Cost of delivery */
  delivery_fee: number;
  /** Platform commission fee */
  commission: number;
  /** Total cost to the buyer */
  total: number;
  /** Transaction currency */
  currency: 'XAF';
  /** Delivery destination address */
  delivery_address: Address;
  /** Chosen method of payment */
  payment_method: PaymentMethod | null;
  /** External payment provider reference */
  payment_ref: string | null;
  /** Expiration timestamp for payment/pending state */
  expires_at: string | null;
  /** Timestamp when the order was disputed */
  disputed_at: string | null;
  /** Timestamp when the order was delivered */
  delivered_at: string | null;
  /** Timestamp when the order was fully completed */
  completed_at: string | null;
  /** ISO 8601 date string for order creation */
  created_at: string;
  /** ISO 8601 date string for order update */
  updated_at: string;
}

/**
 * Payload to create a new order.
 */
export interface CreateOrderPayload {
  /** Items to include in the order */
  items: { product_id: string; quantity: number }[];
  /** UUID of the selected delivery address */
  delivery_address_id: string;
  /** Selected method of payment */
  payment_method: PaymentMethod;
}

/**
 * Payload to initiate a payment charge.
 */
export interface PaymentChargePayload {
  /** UUID of the order to pay for */
  order_id: string;
  /** Method of payment */
  method: PaymentMethod;
  /** Phone number for Mobile Money (MOMO) payments */
  phone: string | null;
  /** Chosen payment gateway provider */
  provider: PaymentProvider;
}

/**
 * Response structure after attempting a payment charge.
 */
export interface PaymentChargeResponse {
  /** Internal system payment reference */
  payment_ref: string;
  /** Payment gateway reference ID */
  gateway_reference: string;
  /** Redirect URL for 3D Secure or web flows, if applicable */
  redirect_url: string | null;
  /** Status of the payment transaction */
  status: string;
  /** Human-readable instructions for completing the payment */
  instruction: string | null;
}

/**
 * Payload for filing an order dispute.
 */
export interface DisputePayload {
  /** Reason for the dispute */
  reason: DisputeReason;
  /** User-provided description of the issue */
  description: string;
  /** Array of URLs pointing to evidence photos */
  evidence_photos: string[];
}
