import { apiRequest } from './apiClient';
import { StaffRoleDefinition, StaffPermission } from '../stores/staffAuthStore';

export const rbacApi = {
  /**
   * Fetch system staff roles and permissions matrix.
   * API Endpoint: GET /api/v1/staff/roles
   */
  getRolesMatrix: async () => {
    return apiRequest<StaffRoleDefinition[]>('/staff/roles', {
      method: 'GET',
    });
  },

  /**
   * Update permissions matrix for a role code.
   * API Endpoint: PUT /api/v1/staff/roles/{code}/permissions
   */
  updateRolePermissions: async (code: string, permissions: StaffPermission[]) => {
    return apiRequest<StaffRoleDefinition>(`/staff/roles/${code}/permissions`, {
      method: 'PUT',
      body: JSON.stringify({ permissions }),
    });
  },

  /**
   * Create a new custom staff role definition.
   * API Endpoint: POST /api/v1/staff/roles
   */
  createRole: async (role: StaffRoleDefinition) => {
    return apiRequest<StaffRoleDefinition>('/staff/roles', {
      method: 'POST',
      body: JSON.stringify(role),
    });
  },

  /**
   * Delete custom staff role definition.
   * API Endpoint: DELETE /api/v1/staff/roles/{code}
   */
  deleteRole: async (code: string) => {
    return apiRequest<{ success: boolean }>(`/staff/roles/${code}`, {
      method: 'DELETE',
    });
  },
};
