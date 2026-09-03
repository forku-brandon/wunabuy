import { apiRequest } from './apiClient';
import { AuditLogEntry } from '../stores/staffAuthStore';

export const auditLogsApi = {
  /**
   * Fetch immutable security audit logs ledger.
   * API Endpoint: GET /api/v1/staff/audit-logs
   */
  getAuditLogs: async () => {
    return apiRequest<AuditLogEntry[]>('/staff/audit-logs', {
      method: 'GET',
    });
  },

  /**
   * Record a new audit log entry.
   * API Endpoint: POST /api/v1/staff/audit-logs
   */
  createAuditEntry: async (
    entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'staff_name' | 'staff_role' | 'ip_address'>
  ) => {
    return apiRequest<AuditLogEntry>('/staff/audit-logs', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  },
};

