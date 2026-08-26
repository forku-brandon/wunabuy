import { AxiosInstance } from 'axios';
import type {
  ApiResponse,
  AuthResponse,
  OTPResponse,
  RegisterPayload,
  LoginPayload,
  OTPPayload,
  User,
  Address,
} from '@wunabuy/types';

/**
 * Authentication & User Profile API Module
 */
export function createAuthApi(client: AxiosInstance) {
  return {
    /**
     * Register a new Buyer or Seller. Triggers SMS OTP.
     */
    register: async (payload: RegisterPayload): Promise<ApiResponse<OTPResponse>> => {
      const res = await client.post<ApiResponse<OTPResponse>>('/auth/register', payload);
      return res.data;
    },

    /**
     * Verify 6-digit SMS OTP and receive Sanctum tokens.
     */
    verifyOtp: async (payload: OTPPayload): Promise<ApiResponse<AuthResponse>> => {
      const res = await client.post<ApiResponse<AuthResponse>>('/auth/verify-otp', payload);
      return res.data;
    },

    /**
     * Initiate phone login (triggers OTP).
     */
    login: async (payload: LoginPayload): Promise<ApiResponse<OTPResponse>> => {
      const res = await client.post<ApiResponse<OTPResponse>>('/auth/login', payload);
      return res.data;
    },

    /**
     * Reset password via OTP.
     */
    resetPassword: async (payload: { phone: string; otp: string; new_password: string }): Promise<ApiResponse<{ message: string }>> => {
      const res = await client.post<ApiResponse<{ message: string }>>('/auth/reset-password', payload);
      return res.data;
    },

    /**
     * Fetch current logged-in user profile.
     */
    getMe: async (): Promise<ApiResponse<User>> => {
      const res = await client.get<ApiResponse<User>>('/users/me');
      return res.data;
    },

    /**
     * Update user profile (name, email, avatar, push tokens).
     */
    updateMe: async (payload: Partial<User> & { fcm_token?: string; apns_token?: string }): Promise<ApiResponse<User>> => {
      const res = await client.put<ApiResponse<User>>('/users/me', payload);
      return res.data;
    },

    /**
     * List user's saved delivery addresses.
     */
    getAddresses: async (): Promise<ApiResponse<Address[]>> => {
      const res = await client.get<ApiResponse<Address[]>>('/users/addresses');
      return res.data;
    },

    /**
     * Add a new delivery address.
     */
    addAddress: async (payload: Omit<Address, 'id'>): Promise<ApiResponse<Address>> => {
      const res = await client.post<ApiResponse<Address>>('/users/addresses', payload);
      return res.data;
    },
  };
}
