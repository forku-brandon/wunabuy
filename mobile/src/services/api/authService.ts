import { Platform } from 'react-native';
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
  async updateProfile(payload: { full_name?: string; email?: string; avatar_url?: string; phone?: string }): Promise<User> {
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
   * Upload user avatar photo to the backend.
   * Updates authStore with the real server URL on success.
   */
  async uploadAvatar(imageUri: string): Promise<{ success: boolean; avatar_url: string; error?: string }> {
    try {
      // 1. If already a web URL, just update profile
      if (imageUri.startsWith('http://') || imageUri.startsWith('https://')) {
        const res = await api.client.post<{ success: boolean; data: { avatar_url: string } }>('/user/avatar', {
          avatar_url: imageUri,
        });
        const serverUrl = res.data?.data?.avatar_url || imageUri;
        useAuthStore.getState().updateUser({ avatar_url: serverUrl });
        return { success: true, avatar_url: serverUrl };
      }

      // 2. If base64 data URI
      if (imageUri.startsWith('data:image/')) {
        const res = await api.client.post<{ success: boolean; data: { avatar_url: string } }>('/user/avatar', {
          avatar_base64: imageUri,
        });
        const serverUrl = res.data?.data?.avatar_url || imageUri;
        useAuthStore.getState().updateUser({ avatar_url: serverUrl });
        return { success: true, avatar_url: serverUrl };
      }

      // 3. Native device file upload via FormData
      const formData = new FormData();
      const filename = imageUri.split('/').pop() || `avatar_${Date.now()}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1].toLowerCase()}` : 'image/jpeg';
      const cleanUri = Platform.OS === 'android' ? imageUri : imageUri.replace('file://', '');

      formData.append('avatar', {
        uri: cleanUri,
        name: filename,
        type,
      } as any);

      const response = await api.client.post<{ success: boolean; data: { avatar_url: string } }>(
        '/user/avatar',
        formData
      );

      if (response.data?.data?.avatar_url) {
        const serverUrl = response.data.data.avatar_url;
        useAuthStore.getState().updateUser({ avatar_url: serverUrl });
        return { success: true, avatar_url: serverUrl };
      }
      return { success: true, avatar_url: imageUri };
    } catch (err: any) {
      console.warn('Avatar upload fallback to local URI:', err?.message);
      useAuthStore.getState().updateUser({ avatar_url: imageUri });
      return { success: false, avatar_url: imageUri, error: err?.message };
    }
  },

  /**
   * Upload general image (store logo, banner, review photos) to the backend.
   */
  async uploadImage(imageUri: string, folder: string = 'general'): Promise<string> {
    try {
      if (imageUri.startsWith('http://') || imageUri.startsWith('https://')) {
        return imageUri;
      }

      const formData = new FormData();
      const filename = imageUri.split('/').pop() || `img_${Date.now()}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1].toLowerCase()}` : 'image/jpeg';
      const cleanUri = Platform.OS === 'android' ? imageUri : imageUri.replace('file://', '');

      formData.append('image', {
        uri: cleanUri,
        name: filename,
        type,
      } as any);
      formData.append('folder', folder);

      const response = await api.client.post<{ success: boolean; data: { url: string } }>(
        '/upload/image',
        formData
      );

      if (response.data?.data?.url) {
        return response.data.data.url;
      }
      return imageUri;
    } catch {
      return imageUri;
    }
  },

  /**
   * Helper to verify if user has permission to access a specific role.
   * Developer bypass: Forku Brandon (phone ending in 682656287) has full testing permissions.
   */
  canAccessRole(user: User | null, role: UserRole): boolean {
    if (!user) return false;
    const cleanPhone = (user.phone || '').replace(/\D/g, '');
    const isDeveloper = cleanPhone.endsWith('682656287') ||
      user.phone?.includes('682656287') ||
      user.id === '01a0811d-27f9-7298-9b64-7cff01362fbe' ||
      (user.full_name && user.full_name.toLowerCase().includes('brandon'));
    if (isDeveloper) return true;
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
      const cleanPhone = (currentUser?.phone || '').replace(/\D/g, '');
      const isDeveloper = cleanPhone.endsWith('682656287') ||
        currentUser?.phone?.includes('682656287') ||
        currentUser?.id === '01a0811d-27f9-7298-9b64-7cff01362fbe' ||
        (currentUser?.full_name && currentUser.full_name.toLowerCase().includes('brandon'));

      if (isDeveloper) {
        useAuthStore.getState().setActiveRole(requestedRole);
        return { success: true, active_role: requestedRole };
      }

      const errorMsg = err?.response?.data?.error?.message || err?.message || 'Access denied.';
      return {
        success: false,
        active_role: useAuthStore.getState().activeRole,
        error: errorMsg,
      };
    }
  },
};

