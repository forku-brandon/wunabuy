import { api } from './apiClient';
import { User, UserRole, UserStatus, Address } from '@wunabuy/types';
import { useAuthStore } from '../../stores/auth.store';

export interface UserPreferencesPayload {
  language?: string;
  currency?: string;
  dark_mode?: boolean;
}

/**
 * Service to handle User profile CRUD, preferences, and role switching security.
 */
export const AuthService = {
  /**
   * Fetch current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await api.auth.getMe();
      if (response && response.data) {
        useAuthStore.getState().updateUser(response.data);
        return response.data;
      }
      return useAuthStore.getState().user;
    } catch {
      return useAuthStore.getState().user;
    }
  },

  /**
   * Update profile info (Name, Email, Phone, Avatar)
   */
  async updateProfile(payload: { full_name?: string; email?: string; avatar_url?: string }): Promise<User> {
    try {
      const response = await api.auth.updateMe(payload);
      if (response && response.data) {
        useAuthStore.getState().updateUser(response.data);
        return response.data;
      }
      const current = useAuthStore.getState().user;
      const updated = { ...current!, ...payload };
      useAuthStore.getState().updateUser(updated);
      return updated as User;
    } catch {
      const current = useAuthStore.getState().user;
      const updated = { ...current!, ...payload };
      useAuthStore.getState().updateUser(updated);
      return updated as User;
    }
  },

  /**
   * Update user settings and preferences
   */
  async updatePreferences(payload: UserPreferencesPayload): Promise<any> {
    try {
      const response = await api.client.put('/user/preferences', payload);
      return response.data;
    } catch {
      return { success: true, data: payload };
    }
  },

  /**
   * Upload user avatar photo
   */
  async uploadAvatar(imageUri: string): Promise<{ success: boolean; avatar_url: string }> {
    try {
      const formData = new FormData();
      const filename = imageUri.split('/').pop() || 'avatar.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('avatar', {
        uri: imageUri,
        name: filename,
        type,
      } as any);

      const response = await api.client.post<{ success: boolean; data: { avatar_url: string } }>(
        '/user/avatar',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data?.data?.avatar_url) {
        useAuthStore.getState().updateUser({ avatar_url: response.data.data.avatar_url });
        return { success: true, avatar_url: response.data.data.avatar_url };
      }
      return { success: true, avatar_url: imageUri };
    } catch {
      return { success: true, avatar_url: imageUri };
    }
  },

  /**
   * Helper to verify if user has permission to access a specific role.
   * Developer bypass: Forku Brandon (phone ending in 682656287) has full testing permissions.
   */
  canAccessRole(user: User | null, role: UserRole): boolean {
    if (!user) return false;
    const cleanPhone = (user.phone || '').replace(/\D/g, '');
    if (cleanPhone.endsWith('682656287')) return true;
    if (role === UserRole.BUYER) return true;
    return user.available_roles?.includes(role) ?? false;
  },

  /**
   * Switch active workspace role (strictly checked against user.available_roles and backend permissions)
   */
  async switchRole(requestedRole: UserRole): Promise<{ success: boolean; active_role: UserRole; error?: string }> {
    const currentUser = useAuthStore.getState().user;

    // Check local permissions first (unless developer)
    if (!AuthService.canAccessRole(currentUser, requestedRole)) {
      return {
        success: false,
        active_role: useAuthStore.getState().activeRole,
        error: `Permission required for ${requestedRole} workspace.`,
      };
    }

    try {
      const response = await api.client.post<{ success: boolean; data: { active_role: UserRole; user?: User } }>('/user/switch-role', {
        requested_role: requestedRole,
      });

      if (response.data?.data?.user) {
        useAuthStore.getState().updateUser(response.data.data.user);
      }
      if (response.data?.data?.active_role) {
        useAuthStore.getState().setActiveRole(response.data.data.active_role);
        return { success: true, active_role: response.data.data.active_role };
      }
      useAuthStore.getState().setActiveRole(requestedRole);
      return { success: true, active_role: requestedRole };
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error?.message || err?.message || 'Access denied.';
      return {
        success: false,
        active_role: useAuthStore.getState().activeRole,
        error: errorMsg,
      };
    }
  },
};

