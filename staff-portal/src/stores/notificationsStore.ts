import { useState, useEffect } from 'react';

export type NotificationPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO' | 'SUCCESS';
export type NotificationCategory = 'PAYOUT' | 'KYC' | 'DISPUTE' | 'LOGISTICS' | 'HR' | 'SYSTEM';

export interface SystemNotification {
  id: string;
  title: string;
  body: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  target_url: string;
  is_read: boolean;
  timestamp: string;
  source_node?: string;
  action_label?: string;
}

export const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'notif_001',
    title: '🚨 High-Value MTN MoMo Payout Pending Authorization',
    body: 'Seller Douala Tech Hub requested 850,000 FCFA Mobile Money disbursal. Financial controller sign-off required.',
    category: 'PAYOUT',
    priority: 'CRITICAL',
    target_url: '/financials',
    is_read: false,
    timestamp: '2026-09-03T12:05:00Z',
    source_node: 'Douala HQ Treasury',
    action_label: 'Authorize Payout',
  },
  {
    id: 'notif_002',
    title: '📄 Merchant Storefront KYC Verification Submitted',
    body: 'Marché Central Electrics uploaded new CNI front/back & Business Registration Certificate for compliance audit.',
    category: 'KYC',
    priority: 'HIGH',
    target_url: '/kyc',
    is_read: false,
    timestamp: '2026-09-03T11:45:00Z',
    source_node: 'Douala Node #01',
    action_label: 'Review KYC',
  },
  {
    id: 'notif_003',
    title: '⚠️ Escrow Dispute Claim Filed: #ORD-8849',
    body: 'Buyer reported non-delivery for iPhone 15 Pro Max order (1,250,000 FCFA). Buyer funds locked in escrow.',
    category: 'DISPUTE',
    priority: 'CRITICAL',
    target_url: '/disputes',
    is_read: false,
    timestamp: '2026-09-03T10:30:00Z',
    source_node: 'Escrow Adjudication',
    action_label: 'Adjudicate Dispute',
  },
  {
    id: 'notif_004',
    title: '🚚 Transporter Account Verification Alert: Trip #TR-9942',
    body: 'Transporter Jean-Paul Nkoum updated vehicle inspection certificates and route coverage credentials.',
    category: 'SYSTEM',
    priority: 'MEDIUM',
    target_url: '/users',
    is_read: false,
    timestamp: '2026-09-03T09:15:00Z',
    source_node: 'Transporter Fleet',
    action_label: 'View Transporters',
  },
  {
    id: 'notif_005',
    title: '📢 Executive Directive Published: Q3 Operational Targets',
    body: 'Executive management broadcasted the Q3 platform reliability and customer satisfaction operational objectives.',
    category: 'SYSTEM',
    priority: 'INFO',
    target_url: '/communications',
    is_read: true,
    timestamp: '2026-09-02T16:00:00Z',
    source_node: 'Executive Board',
    action_label: 'Read Directive',
  },
  {
    id: 'notif_006',
    title: '🔒 System Audit: Super Admin Role Clearance Matrix Updated',
    body: 'Executive management updated system clearance level 5 permission flags and persona switching guards.',
    category: 'SYSTEM',
    priority: 'SUCCESS',
    target_url: '/settings',
    is_read: true,
    timestamp: '2026-09-02T14:20:00Z',
    source_node: 'Security Operations',
    action_label: 'View Audit Logs',
  },
];

// Persistent state
let currentNotifications: SystemNotification[] = INITIAL_NOTIFICATIONS;
try {
  const savedNotifs = localStorage.getItem('wunabuy_staff_notifications');
  if (savedNotifs) {
    currentNotifications = JSON.parse(savedNotifs);
  }
} catch {
  currentNotifications = INITIAL_NOTIFICATIONS;
}

const listeners = new Set<() => void>();

function notifyListeners() {
  localStorage.setItem('wunabuy_staff_notifications', JSON.stringify(currentNotifications));
  listeners.forEach((l) => l());
}

export function useNotifications() {
  const [, tick] = useState(0);

  useEffect(() => {
    const listener = () => tick((t) => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const markAsRead = (id: string) => {
    currentNotifications = currentNotifications.map((n) => (n.id === id ? { ...n, is_read: true } : n));
    notifyListeners();
  };

  const markAllAsRead = () => {
    currentNotifications = currentNotifications.map((n) => ({ ...n, is_read: true }));
    notifyListeners();
  };

  const deleteNotification = (id: string) => {
    currentNotifications = currentNotifications.filter((n) => n.id !== id);
    notifyListeners();
  };

  const clearRead = () => {
    currentNotifications = currentNotifications.filter((n) => !n.is_read);
    notifyListeners();
  };

  const addNotification = (notif: Omit<SystemNotification, 'id' | 'timestamp' | 'is_read'>) => {
    const newNotif: SystemNotification = {
      ...notif,
      id: 'notif_' + Date.now().toString().slice(-6),
      is_read: false,
      timestamp: new Date().toISOString(),
    };
    currentNotifications = [newNotif, ...currentNotifications];
    notifyListeners();
  };

  const unreadCount = currentNotifications.filter((n) => !n.is_read).length;

  return {
    notifications: currentNotifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearRead,
    addNotification,
  };
}

