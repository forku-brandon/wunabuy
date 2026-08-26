import { User, UserRole, UserStatus } from '@wunabuy/types';

interface StaffAuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
}

const MOCK_STAFF_USER: User = {
  id: 'staff_901',
  phone: '+237670000099',
  email: 'admin@wunabuy.com',
  full_name: 'Pauline Mbarga (Admin)',
  role: UserRole.STAFF,
  status: UserStatus.ACTIVE,
  avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
  is_phone_verified: true,
  default_address: null,
  available_roles: [UserRole.STAFF],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Simple React state store hook for Staff Auth
import { useState, useEffect } from 'react';

export function useStaffAuth() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('@wunabuy_staff_user');
    return saved ? JSON.parse(saved) : MOCK_STAFF_USER; // Default logged in for development
  });

  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return localStorage.getItem('@wunabuy_staff_token') || '1|mock_sanctum_staff_token';
  });

  const isAuthenticated = Boolean(user && accessToken);

  const login = async (email: string, pass: string): Promise<boolean> => {
    if (email.includes('@wunabuy.com') && pass.length >= 6) {
      setUser(MOCK_STAFF_USER);
      setAccessToken('1|mock_sanctum_staff_token');
      localStorage.setItem('@wunabuy_staff_user', JSON.stringify(MOCK_STAFF_USER));
      localStorage.setItem('@wunabuy_staff_token', '1|mock_sanctum_staff_token');
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('@wunabuy_staff_user');
    localStorage.removeItem('@wunabuy_staff_token');
  };

  return {
    user,
    accessToken,
    isAuthenticated,
    login,
    logout,
  };
}
