import { apiRequest } from './apiClient';
import { UserRole, UserStatus } from '@wunabuy/types';

export interface DirectoryUserItem {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  role: UserRole;
  status: UserStatus;
  is_phone_verified: boolean;
  kyc_status?: string | null;
  city: string;
  registered_at: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  wallet_balance?: number;
  store_name?: string | null;
  vehicle_info?: string | null;
}

export const usersApi = {
  /**
   * Fetch live platform users directory with optional filters.
   * API Endpoint: GET /api/v1/staff/users
   */
  getUsers: async (params?: { role?: string; status?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.role) query.append('role', params.role);
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);

    const qs = query.toString();
    const endpoint = `/staff/users${qs ? `?${qs}` : ''}`;

    return apiRequest<DirectoryUserItem[]>(endpoint, {
      method: 'GET',
    });
  },

  /**
   * Update user account status (suspend or reactivate).
   * API Endpoint: PUT /api/v1/staff/users/{id}/status
   */
  updateUserStatus: async (id: string, status: 'active' | 'suspended', reason: string) => {
    return apiRequest<{ id: string; status: string; message: string }>(`/staff/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, reason }),
    });
  },
};
