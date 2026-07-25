export const USER_ROLES = ['buyer', 'seller', 'transporter'] as const;
export const KYC_STATUSES = ['pending', 'under_review', 'approved', 'rejected'] as const;
export const ORDER_STATUSES = [
  'pending_payment', 'paid_escrow', 'preparing', 'ready_for_pickup',
  'in_transit', 'delivered', 'received', 'completed',
  'cancelled', 'disputed', 'refunded'
] as const;
export const STAFF_DEPARTMENTS = [
  'accounting', 'it_engineering', 'customer_service',
  'operations', 'compliance_legal', 'marketing', 'super_admin'
] as const;
export const NOTIFICATION_TYPES = {
  ORDER_NEW: 'order.new',
  ORDER_PAID: 'order.paid',
  ORDER_IN_TRANSIT: 'order.in_transit',
  ORDER_DELIVERED: 'order.delivered',
  ORDER_ESCROW_RELEASED: 'order.escrow_released',
  KYC_APPROVED: 'kyc.approved',
  KYC_REJECTED: 'kyc.rejected',
  CHAT_NEW_MESSAGE: 'chat.new_message',
  PAYOUT_APPROVED: 'payout.approved',
} as const;

export const PAGINATION_DEFAULT_LIMIT = 20;
export const PAGINATION_MAX_LIMIT = 100;
