import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserRole } from '@wunabuy/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  activeRole: UserRole;
  isAuthenticated: boolean;

  // Actions
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setActiveRole: (role: UserRole) => void;
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
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) => {
        set({
          user,
          accessToken,
          refreshToken,
          activeRole: user.role ?? UserRole.BUYER,
          isAuthenticated: true,
        });
      },

      setActiveRole: (role) => {
        const { user } = get();
        // Check if user has permission for this role
        const availableRoles = user?.available_roles ?? [user?.role ?? UserRole.BUYER];
        if (availableRoles.includes(role)) {
          set({ activeRole: role });
        }
      },

      updateUser: (userPartial) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...userPartial } });
        }
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          activeRole: UserRole.BUYER,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: '@wunabuy_auth_store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
