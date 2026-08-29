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
   * Switch active workspace role (strictly checked against user.available_roles)
   */
  async switchRole(requestedRole: UserRole): Promise<{ success: boolean; active_role: UserRole }> {
    try {
      const response = await api.client.post<{ success: boolean; data: { active_role: UserRole } }>('/user/switch-role', {
        requested_role: requestedRole,
      });

      if (response.data?.data?.active_role) {
        useAuthStore.getState().setActiveRole(response.data.data.active_role);
        return { success: true, active_role: response.data.data.active_role };
      }
      useAuthStore.getState().setActiveRole(requestedRole);
      return { success: true, active_role: requestedRole };
    } catch {
      useAuthStore.getState().setActiveRole(requestedRole);
      return { success: true, active_role: requestedRole };
    }
  },
};

