import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserRole } from '@wunabuy/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  activeRole: UserRole;
  permissions: string[];
  isAuthenticated: boolean;

  // Actions
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setActiveRole: (role: UserRole) => void;
  hasPermission: (permission: string) => boolean;
  updateUser: (userPartial: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      activeRole: UserRole.BUYER,
      permissions: [],
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) => {
        const approvedRoles = user.available_roles && user.available_roles.length > 0
          ? user.available_roles
          : [UserRole.BUYER];

        const permissions = user.permissions || [];

        set({
          user: { ...user, available_roles: approvedRoles, permissions },
          accessToken,
          refreshToken,
          activeRole: user.role || UserRole.BUYER,
          permissions,
          isAuthenticated: true,
        });
      },

      setActiveRole: (role) => {
        set({ activeRole: role });
      },

      hasPermission: (permission: string) => {
        const { permissions, user } = get();
        const activePerms = user?.permissions || permissions || [];
        return activePerms.includes('*') || activePerms.includes(permission);
      },

      updateUser: (userPartial) => {
        const { user } = get();
        if (user) {
          const updatedUser = { ...user, ...userPartial };
          set({
            user: updatedUser,
            permissions: updatedUser.permissions || get().permissions,
            activeRole: updatedUser.role || get().activeRole,
          });
        }
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          activeRole: UserRole.BUYER,
          permissions: [],
          isAuthenticated: false,
        });
      },
    }),
    {
      name: '@wunabuy_auth_store',
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
      migrate: (persistedState: any, version: number) => {
        // Reset any stale persisted roles to default Buyer
        if (version < 2 || !persistedState) {
          return {
            ...persistedState,
            activeRole: UserRole.BUYER,
            user: persistedState?.user
              ? {
                  ...persistedState.user,
                  role: UserRole.BUYER,
                  available_roles: [UserRole.BUYER],
                }
              : null,
          };
        }
        return persistedState as AuthState;
      },
    }
  )
);
