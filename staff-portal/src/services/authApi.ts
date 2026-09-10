import { apiRequest } from './apiClient';
import { StaffUser } from '../stores/staffAuthStore';

export interface AuthOTPResponse {
  message: string;
  expires_in_seconds: number;
}

export interface AuthVerifyResponse {
  token: string;
  user: StaffUser;
}

export const authApi = {
  /**
   * Request a 2-Factor OTP Security Code for staff email/phone.
   * API Endpoint: POST /api/v1/staff/auth/request-otp
   */
  requestOTP: async (identifier: string) => {
    return apiRequest<AuthOTPResponse>('/staff/auth/request-otp', {
      method: 'POST',
      body: JSON.stringify({ identifier }),
    });
  },

  /**
   * Verify 6-digit OTP code.
   * API Endpoint: POST /api/v1/staff/auth/verify-otp
   */
  verifyOTP: async (identifier: string, code: string) => {
    return apiRequest<AuthVerifyResponse>('/staff/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ identifier, code }),
    });
  },

  /**
   * Authenticate via Corporate Password.
   * API Endpoint: POST /api/v1/staff/auth/login
   */
  loginWithPassword: async (identifier: string, password: string) => {
    return apiRequest<AuthVerifyResponse>('/staff/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
  },

  /**
   * Fetch active staff session profile.
   * API Endpoint: GET /api/v1/staff/auth/me
   */
  getProfile: async () => {
    return apiRequest<StaffUser>('/staff/auth/me', {
      method: 'GET',
    });
  },

  /**
   * Upload staff corporate avatar.
   * API Endpoint: POST /api/v1/staff/profile/avatar
   */
  uploadAvatar: async (fileOrBase64: File | string) => {
    if (typeof fileOrBase64 === 'string') {
      return apiRequest<{ avatar_url: string }>('/staff/profile/avatar', {
        method: 'POST',
        body: JSON.stringify({ avatar_base64: fileOrBase64 }),
      });
    }

    const formData = new FormData();
    formData.append('avatar', fileOrBase64);

    const token = localStorage.getItem('wunabuy_staff_token') || '';
    const res = await fetch('/api/v1/staff/profile/avatar', {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    const json = await res.json();
    return json?.data || { avatar_url: '' };
  },
};

