import { apiRequest } from './apiClient';
import { StaffUser } from '../stores/staffAuthStore';

export const staffDirectoryApi = {
  /**
   * Fetch complete corporate staff roster.
   * API Endpoint: GET /api/v1/staff/members
   */
  getStaffMembers: async () => {
    return apiRequest<StaffUser[]>('/staff/members', {
      method: 'GET',
    });
  },

  /**
   * Provision a new corporate staff account.
   * API Endpoint: POST /api/v1/staff/members
   */
  createStaffAccount: async (payload: {
    full_name: string;
    email: string;
    phone: string;
    department_name: string;
    staff_department_role: string;
    security_clearance_level: number;
  }) => {
    return apiRequest<StaffUser>('/staff/members', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Update staff account details.
   * API Endpoint: PUT /api/v1/staff/members/{id}
   */
  updateStaffAccount: async (id: string, updates: Partial<StaffUser>) => {
    return apiRequest<StaffUser>(`/staff/members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Revoke corporate access & delete staff account.
   * API Endpoint: DELETE /api/v1/staff/members/{id}
   */
  deleteStaffAccount: async (id: string) => {
    return apiRequest<{ success: boolean }>(`/staff/members/${id}`, {
      method: 'DELETE',
    });
  },
};
