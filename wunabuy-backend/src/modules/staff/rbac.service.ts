import { supabase } from '../../config/database';
import { AuthError } from '../../shared/errors/app-error';

// Permission definitions
export const PERMISSIONS = {
  // Accounting/Finance
  FINANCE_VIEW_DASHBOARD: 'finance.view_dashboard',
  FINANCE_APPROVE_PAYOUTS: 'finance.approve_payouts',
  FINANCE_RECONCILE: 'finance.reconcile',
  FINANCE_EXPORT_REPORTS: 'finance.export_reports',
  
  // IT/Engineering
  IT_VIEW_HEALTH: 'it.view_health',
  IT_MANAGE_CONFIG: 'it.manage_config',
  IT_MANAGE_STAFF: 'it.manage_staff',
  IT_VIEW_AUDIT_LOG: 'it.view_audit_log',
  
  // Customer Service
  CS_HANDLE_TICKETS: 'cs.handle_tickets',
  CS_PROCESS_REFUNDS: 'cs.process_refunds',
  CS_MODERATE_CHAT: 'cs.moderate_chat',
  
  // Operations
  OPS_REVIEW_KYC: 'ops.review_kyc',
  OPS_APPROVE_KYC: 'ops.approve_kyc',
  OPS_MANAGE_DELIVERIES: 'ops.manage_deliveries',
  OPS_SUSPEND_USERS: 'ops.suspend_users',
  
  // Compliance/Legal
  COMPLIANCE_APPROVE_KYC: 'compliance.approve_kyc',
  COMPLIANCE_INVESTIGATE_FRAUD: 'compliance.investigate_fraud',
  COMPLIANCE_EXPORT_AUDIT: 'compliance.export_audit',
  COMPLIANCE_MODERATE_VIDEOS: 'compliance.moderate_videos',
  
  // Marketing
  MARKETING_MANAGE_CAMPAIGNS: 'marketing.manage_campaigns',
  MARKETING_CURATE_FEATURED: 'marketing.curate_featured',
  MARKETING_VIEW_VIDEO_ANALYTICS: 'marketing.view_video_analytics',
  
  // Super Admin
  SUPERADMIN_ALL: 'superadmin.all',
} as const;

// Role level hierarchy for permission checks
const ROLE_LEVELS = ['officer', 'senior', 'lead', 'manager', 'admin'];

export function hasPermission(userPermissions: string[], requiredPermission: string): boolean {
  if (userPermissions.includes(PERMISSIONS.SUPERADMIN_ALL)) return true;
  return userPermissions.includes(requiredPermission);
}

export async function getStaffPermissions(staffId: string): Promise<string[]> {
  const { data: roles } = await supabase
    .from('staff_roles')
    .select('department, role_level')
    .eq('staff_id', staffId)
    .eq('is_active', true);

  if (!roles || roles.length === 0) return [];

  // Look up permissions for each role from permission definitions table
  const { data: permDefs } = await supabase
    .from('staff_permission_definitions')
    .select('permission_key, applies_to, min_role_level')
    .in('applies_to', roles.map(r => r.department));

  if (!permDefs) return [];

  const permissions: string[] = [];
  for (const role of roles) {
    const roleLevelIndex = ROLE_LEVELS.indexOf(role.role_level);
    for (const perm of permDefs) {
      if (perm.applies_to.includes(role.department)) {
        const minLevelIndex = ROLE_LEVELS.indexOf(perm.min_role_level);
        if (roleLevelIndex >= minLevelIndex) {
          permissions.push(perm.permission_key);
        }
      }
    }
  }

  // Check for super_admin
  if (roles.some(r => r.department === 'super_admin')) {
    permissions.push(PERMISSIONS.SUPERADMIN_ALL);
  }

  return [...new Set(permissions)];
}
