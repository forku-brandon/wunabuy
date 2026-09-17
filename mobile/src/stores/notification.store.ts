import { create } from 'zustand';
import { ApiNotification, NotificationApiService } from '../services/api/notificationService';
import { NotificationManager } from '../services/notifications/notificationManager';

export type NotificationFilter = 'all' | 'orders' | 'marketing' | 'updates';

interface NotificationState {
  notifications: ApiNotification[];
  unreadCount: number;
  isLoading: boolean;
  activeFilter: NotificationFilter;
  setFilter: (filter: NotificationFilter) => void;
  fetchNotifications: (filter?: NotificationFilter, showAlert?: boolean) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  pollNewNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  incrementUnread: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  activeFilter: 'all',

  setFilter: (activeFilter: NotificationFilter) => {
    set({ activeFilter });
    get().fetchNotifications(activeFilter);
  },

  fetchNotifications: async (filter?: NotificationFilter, showAlert = false) => {
    const targetFilter = filter ?? get().activeFilter;
    set({ isLoading: true });
    try {
      const data = await NotificationApiService.getNotifications(targetFilter, 1);
      set({
        notifications: data.notifications,
        unreadCount: data.unread_count,
        isLoading: false,
      });

      if (showAlert && data.notifications.length > 0) {
        NotificationManager.syncAndAlertNewNotifications(data.notifications);
      }
    } catch {
      set({ isLoading: false });
    }
  },

  pollNewNotifications: async () => {
    try {
      const previousCount = get().unreadCount;
      const data = await NotificationApiService.getNotifications('all', 1);

      set({
        notifications: data.notifications,
        unreadCount: data.unread_count,
      });

      // If new unread notification arrived, trigger native Android sound and vibration!
      if (data.unread_count > previousCount && data.notifications.length > 0) {
        NotificationManager.syncAndAlertNewNotifications(data.notifications);
      }
    } catch {
      // background poll silently ignores transient connection hiccups
    }
  },

  fetchUnreadCount: async () => {
    try {
      const count = await NotificationApiService.getUnreadCount();
      set({ unreadCount: count });
    } catch {
      // keep current
    }
  },

  markAsRead: async (id: string) => {
    // Optimistic update
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
    await NotificationApiService.markAsRead(id);
  },

  markAllAsRead: async () => {
    // Optimistic update
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
      unreadCount: 0,
    }));
    await NotificationApiService.markAllAsRead();
  },

  deleteNotification: async (id: string) => {
    const target = get().notifications.find((n) => n.id === id);
    const wasUnread = target && !target.is_read;

    // Optimistic update
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
      unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
    }));
    await NotificationApiService.deleteNotification(id);
  },

  clearAll: async () => {
    set({ notifications: [], unreadCount: 0 });
    await NotificationApiService.clearAll();
  },

  incrementUnread: () => {
    set((state) => ({ unreadCount: state.unreadCount + 1 }));
  },
}));
