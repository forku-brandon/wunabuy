export type OrderStatusValue = 'pending_payment' | 'paid_escrow' | 'preparing' | 'ready_for_pickup' | 'en_route' | 'in_transit' | 'delivered' | 'received' | 'completed' | 'cancelled' | 'refunded' | 'disputed' | 'resolved';

const STATUS_COLORS: Record<OrderStatusValue, string> = {
  pending_payment: '#F59E0B',
  paid_escrow: '#3B82F6',
  preparing: '#8B5CF6',
  ready_for_pickup: '#10B981',
  en_route: '#06B6D4',
  in_transit: '#0EA5E9',
  delivered: '#22C55E',
  received: '#22C55E',
  completed: '#16A34A',
  cancelled: '#EF4444',
  refunded: '#64748B',
  disputed: '#DC2626',
  resolved: '#10B981',
} as const;

const STATUS_LABELS: Record<OrderStatusValue, string> = {
  pending_payment: 'Pending Payment',
  paid_escrow: 'Paid (Escrow)',
  preparing: 'Preparing',
  ready_for_pickup: 'Ready for Pickup',
  en_route: 'En Route',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  received: 'Received',
  completed: 'Completed',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
  disputed: 'Disputed',
  resolved: 'Resolved',
} as const;

/**
 * Map an order status to its semantic display color hex code.
 * Uses the Wunabuy design system semantic palette.
 */
export function getStatusColor(status: OrderStatusValue): string {
  if (!status || typeof status !== 'string') return '#9CA3AF'; // Default gray
  return STATUS_COLORS[status] || '#9CA3AF';
}

/**
 * Map an order status to a human-readable label.
 * @example
 * getStatusLabel('paid_escrow') // 'Paid (Escrow)'
 * getStatusLabel('in_transit') // 'In Transit'
 * getStatusLabel('ready_for_pickup') // 'Ready for Pickup'
 */
export function getStatusLabel(status: OrderStatusValue): string {
  if (!status || typeof status !== 'string') return 'Unknown Status';
  return STATUS_LABELS[status] || 'Unknown Status';
}

/**
 * Check if an order status allows cancellation by the buyer.
 */
export function isCancellableByBuyer(status: OrderStatusValue): boolean {
  return status === 'pending_payment';
}

/**
 * Check if an order is in an active/in-progress state.
 */
export function isActiveOrder(status: OrderStatusValue): boolean {
  if (!status || typeof status !== 'string') return false;
  return ![
    'completed',
    'cancelled',
    'refunded',
    'resolved'
  ].includes(status as any); // cast safely just in case
}
