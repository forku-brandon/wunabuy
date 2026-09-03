import React, { useState, useEffect } from 'react';
import { User, UserRole, UserStatus } from '@wunabuy/types';

export enum StaffDepartmentRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  FINANCE_OFFICER = 'FINANCE_OFFICER',
  COMPLIANCE_OFFICER = 'COMPLIANCE_OFFICER',
  OPS_MANAGER = 'OPS_MANAGER',
  SUPPORT_AGENT = 'SUPPORT_AGENT',
  MARKETING_LEAD = 'MARKETING_LEAD',
  HR_MANAGER = 'HR_MANAGER',
}

export interface StaffUser extends User {
  staff_department_role: string;
  department_name: string;
  employee_id: string;
  security_clearance_level: number; // 1 to 5
}

export type StaffPermission =
  | 'view_dashboard'
  | 'view_kyc'
  | 'approve_kyc'
  | 'view_disputes'
  | 'resolve_disputes'
  | 'view_financials'
  | 'approve_payouts'
  | 'view_logistics'
  | 'override_logistics'
  | 'manage_users'
  | 'manage_marketing'
  | 'manage_settings'
  | 'manage_profile_crud'
  | 'manage_staff_crud'
  | 'view_hr_ops'
  | 'manage_hr_payroll'
  | 'assign_staff_tasks'
  | 'view_audit_logs';

export interface StaffRoleDefinition {
  code: string;
  name: string;
  department: string;
  clearance_level: number;
  permissions: StaffPermission[];
  is_custom?: boolean;
}

export const ALL_STAFF_PERMISSIONS: { code: StaffPermission; label: string; description: string }[] = [
  { code: 'view_dashboard', label: 'View Executive Dashboard', description: 'Access platform overview KPIs and GMV charts' },
  { code: 'view_kyc', label: 'View KYC Queue', description: 'Inspect merchant storefront and driver CNI documents' },
  { code: 'approve_kyc', label: 'Approve/Reject KYC', description: 'Approve or reject merchant & driver compliance submissions' },
  { code: 'view_disputes', label: 'View Escrow Disputes', description: 'Inspect 3-way buyer/merchant dispute claims' },
  { code: 'resolve_disputes', label: 'Resolve Disputes', description: 'Execute escrow refund, release, or split settlements' },
  { code: 'view_financials', label: 'View Financial Ledger', description: 'Access MTN MoMo & Orange Money reconciliation statements' },
  { code: 'approve_payouts', label: 'Authorize Payouts', description: 'Approve high-value Mobile Money merchant payouts' },
  { code: 'view_logistics', label: 'View Logistics Telemetry', description: 'Monitor active driver GPS trips and dispatch status' },
  { code: 'override_logistics', label: 'Logistics Manual Override', description: 'Intervene and manually override delivery trip stages' },
  { code: 'manage_users', label: 'Manage Users & Directory', description: 'Suspend or reactivate platform user & driver accounts' },
  { code: 'manage_marketing', label: 'Manage Marketing & Banners', description: 'Publish and toggle mobile promo banners & tips' },
  { code: 'manage_settings', label: 'Manage System Settings', description: 'Configure platform security rules & MFA' },
  { code: 'manage_profile_crud', label: 'Manage Staff Profile CRUD (Admin Only)', description: 'Edit and manage individual staff account profile details' },
  { code: 'manage_staff_crud', label: 'Create, Edit & Revoke Staff Accounts', description: 'Provision new staff accounts, edit details, and revoke corporate access' },
  { code: 'view_hr_ops', label: 'View HR & Staff Ops', description: 'Access staff directory, contracts, leave requests, and payroll summary' },
  { code: 'manage_hr_payroll', label: 'Manage HR Payroll & Payslips', description: 'Authorize monthly staff salary disbursals and print official payslips' },
  { code: 'assign_staff_tasks', label: 'Assign & Dispatch Staff Tasks', description: 'Create and assign daily, weekly, or monthly recurring work directives to employees' },
  { code: 'view_audit_logs', label: 'View Security Audit Logs', description: 'Access immutable system administrative action ledger' },
];

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  staff_name: string;
  staff_role: string;
  action_code: string;
  action_description: string;
  ip_address: string;
  target_id?: string;
  security_level: 'INFO' | 'WARNING' | 'CRITICAL';
}

const INITIAL_ROLES_MATRIX: StaffRoleDefinition[] = [
  {
    code: StaffDepartmentRole.SUPER_ADMIN,
    name: 'Super Admin / Executive',
    department: 'Executive Management',
    clearance_level: 5,
    permissions: [
      'view_dashboard',
      'view_kyc',
      'approve_kyc',
      'view_disputes',
      'resolve_disputes',
      'view_financials',
      'approve_payouts',
      'view_logistics',
      'override_logistics',
      'manage_users',
      'manage_marketing',
      'manage_settings',
      'manage_profile_crud',
      'manage_staff_crud',
      'view_hr_ops',
      'manage_hr_payroll',
      'assign_staff_tasks',
      'view_audit_logs',
    ],
  },
  {
    code: StaffDepartmentRole.HR_MANAGER,
    name: 'HR & People Operations Lead',
    department: 'Human Resources & People Ops',
    clearance_level: 4,
    permissions: [
      'view_dashboard',
      'view_hr_ops',
      'manage_hr_payroll',
      'manage_staff_crud',
      'assign_staff_tasks',
      'manage_users',
      'view_audit_logs',
    ],
  },
  {
    code: StaffDepartmentRole.FINANCE_OFFICER,
    name: 'Finance & Treasury Officer',
    department: 'Finance & Treasury',
    clearance_level: 4,
    permissions: [
      'view_dashboard',
      'view_financials',
      'approve_payouts',
      'view_disputes',
      'resolve_disputes',
      'view_audit_logs',
    ],
  },
  {
    code: StaffDepartmentRole.COMPLIANCE_OFFICER,
    name: 'Compliance & Verification Specialist',
    department: 'Legal & Risk Verification',
    clearance_level: 4,
    permissions: [
      'view_dashboard',
      'view_kyc',
      'approve_kyc',
      'manage_users',
      'view_audit_logs',
    ],
  },
  {
    code: StaffDepartmentRole.OPS_MANAGER,
    name: 'Logistics Operations Manager',
    department: 'Logistics & Fleet Ops',
    clearance_level: 3,
    permissions: [
      'view_dashboard',
      'view_logistics',
      'override_logistics',
      'view_disputes',
      'assign_staff_tasks',
      'view_audit_logs',
    ],
  },
  {
    code: StaffDepartmentRole.MARKETING_LEAD,
    name: 'Marketing & Growth Lead',
    department: 'Marketing & Growth Ops',
    clearance_level: 2,
    permissions: [
      'view_dashboard',
      'manage_marketing',
      'view_audit_logs',
    ],
  },
  {
    code: StaffDepartmentRole.SUPPORT_AGENT,
    name: 'Customer Support Specialist',
    department: 'Customer Escrow Support',
    clearance_level: 2,
    permissions: [
      'view_dashboard',
      'view_disputes',
      'view_kyc',
      'view_audit_logs',
    ],
  },
];

export const DEMO_STAFF_PERSONAS: StaffUser[] = [
  {
    id: 'staff_901',
    phone: '+237670123456',
    email: 'pauline.admin@wunabuy.com',
    full_name: 'Pauline Mbarga',
    role: UserRole.STAFF,
    staff_department_role: StaffDepartmentRole.SUPER_ADMIN,
    department_name: 'Executive Management',
    employee_id: 'WNB-EMP-001',
    security_clearance_level: 5,
    status: UserStatus.ACTIVE,
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    is_phone_verified: true,
    default_address: null,
    available_roles: [UserRole.STAFF],
    created_at: '2026-01-15T08:00:00Z',
    updated_at: '2026-09-02T10:00:00Z',
  },
  {
    id: 'staff_902',
    phone: '+237699112233',
    email: 'christian.finance@wunabuy.com',
    full_name: 'Christian Atangana',
    role: UserRole.STAFF,
    staff_department_role: StaffDepartmentRole.FINANCE_OFFICER,
    department_name: 'Finance & Treasury',
    employee_id: 'WNB-EMP-014',
    security_clearance_level: 4,
    status: UserStatus.ACTIVE,
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    is_phone_verified: true,
    default_address: null,
    available_roles: [UserRole.STAFF],
    created_at: '2026-02-01T09:30:00Z',
    updated_at: '2026-09-02T11:00:00Z',
  },
  {
    id: 'staff_907',
    phone: '+237677998877',
    email: 'chantal.hr@wunabuy.com',
    full_name: 'Chantal Nguesso',
    role: UserRole.STAFF,
    staff_department_role: StaffDepartmentRole.HR_MANAGER,
    department_name: 'Human Resources & People Ops',
    employee_id: 'WNB-EMP-007',
    security_clearance_level: 4,
    status: UserStatus.ACTIVE,
    avatar_url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=300&q=80',
    is_phone_verified: true,
    default_address: null,
    available_roles: [UserRole.STAFF],
    created_at: '2026-01-15T08:00:00Z',
    updated_at: '2026-09-03T09:00:00Z',
  },
  {
    id: 'staff_903',
    phone: '+237675889900',
    email: 'marie.compliance@wunabuy.com',
    full_name: 'Marie-Noelle Bikoe',
    role: UserRole.STAFF,
    staff_department_role: StaffDepartmentRole.COMPLIANCE_OFFICER,
    department_name: 'Legal & Risk Verification',
    employee_id: 'WNB-EMP-022',
    security_clearance_level: 4,
    status: UserStatus.ACTIVE,
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    is_phone_verified: true,
    default_address: null,
    available_roles: [UserRole.STAFF],
    created_at: '2026-03-10T11:15:00Z',
    updated_at: '2026-09-02T09:45:00Z',
  },
  {
    id: 'staff_904',
    phone: '+237690445566',
    email: 'jeanluc.ops@wunabuy.com',
    full_name: 'Jean-Luc Fotso',
    role: UserRole.STAFF,
    staff_department_role: StaffDepartmentRole.OPS_MANAGER,
    department_name: 'Logistics & Fleet Ops',
    employee_id: 'WNB-EMP-038',
    security_clearance_level: 3,
    status: UserStatus.ACTIVE,
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    is_phone_verified: true,
    default_address: null,
    available_roles: [UserRole.STAFF],
    created_at: '2026-04-05T14:20:00Z',
    updated_at: '2026-09-02T12:00:00Z',
  },
  {
    id: 'staff_905',
    phone: '+237677332211',
    email: 'therese.support@wunabuy.com',
    full_name: 'Therese Abena',
    role: UserRole.STAFF,
    staff_department_role: StaffDepartmentRole.SUPPORT_AGENT,
    department_name: 'Customer Escrow Support',
    employee_id: 'WNB-EMP-051',
    security_clearance_level: 2,
    status: UserStatus.ACTIVE,
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    is_phone_verified: true,
    default_address: null,
    available_roles: [UserRole.STAFF],
    created_at: '2026-05-12T10:00:00Z',
    updated_at: '2026-09-02T10:30:00Z',
  },
];

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud_9001',
    timestamp: '2026-09-02 12:45:10',
    staff_name: 'Pauline Mbarga',
    staff_role: 'SUPER_ADMIN',
    action_code: 'PAYOUT_HIGH_VALUE_APPROVE',
    action_description: 'Approved 850,000 FCFA Mobile Money escrow disbursal for Douala Tech Hub.',
    ip_address: '197.234.221.14 (Douala HQ)',
    target_id: 'tr_momo_8829',
    security_level: 'CRITICAL',
  },
];

// PERSISTENT STAFF DIRECTORY STATE
const savedDirectory = localStorage.getItem('wunabuy_staff_directory');
let currentStaffList: StaffUser[] = savedDirectory ? JSON.parse(savedDirectory) : DEMO_STAFF_PERSONAS;

let currentUser: StaffUser | null = currentStaffList[0];
let currentToken: string | null = '1|mock_sanctum_staff_token_WNB-EMP-001';
let currentAuditLogs: AuditLogEntry[] = INITIAL_AUDIT_LOGS;
let rolesMatrix: StaffRoleDefinition[] = INITIAL_ROLES_MATRIX;

const listeners = new Set<() => void>();

function notify() {
  localStorage.setItem('wunabuy_staff_directory', JSON.stringify(currentStaffList));
  listeners.forEach((l) => l());
}

export function useStaffAuth() {
  const [, tick] = useState(0);

  useEffect(() => {
    const listener = () => tick((t) => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const requestOTP = async (identifier: string): Promise<{ success: boolean; message: string }> => {
    const cleanId = identifier.trim().toLowerCase();
    const matched = currentStaffList.find(
      (p) => (p.email && p.email.toLowerCase() === cleanId) || p.phone.includes(cleanId)
    );

    if (matched || cleanId.includes('@wunabuy.com') || cleanId.length >= 6) {
      return {
        success: true,
        message: `OTP Code sent via SMS/Email to ${identifier}. (Demo Code: 654321)`,
      };
    }

    return {
      success: false,
      message: 'Staff identity not registered. Please use corporate @wunabuy.com email or employee phone.',
    };
  };

  const verifyOTP = async (identifier: string, code: string): Promise<boolean> => {
    const cleanId = identifier.trim().toLowerCase();
    let matched = currentStaffList.find(
      (p) => (p.email && p.email.toLowerCase() === cleanId) || p.phone.includes(cleanId)
    );

    if (!matched) {
      matched = currentStaffList[0]; // Fallback to Super Admin for new corporate logins
    }

    if (code === '654321' || code.length === 6) {
      currentUser = matched;
      currentToken = '1|mock_sanctum_otp_token_' + matched.employee_id;

      const newLog: AuditLogEntry = {
        id: 'aud_' + Date.now().toString().slice(-5),
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        staff_name: matched.full_name,
        staff_role: matched.staff_department_role,
        action_code: 'STAFF_OTP_AUTH_SUCCESS',
        action_description: `Staff authorized via 2-Factor OTP verification for employee ID ${matched.employee_id}`,
        ip_address: '197.234.221.14 (Douala HQ)',
        security_level: 'INFO',
      };
      currentAuditLogs = [newLog, ...currentAuditLogs];

      notify();
      return true;
    }
    return false;
  };

  const loginWithPassword = async (identifier: string, pass: string): Promise<boolean> => {
    const cleanId = identifier.trim().toLowerCase();
    let matched = currentStaffList.find(
      (p) => (p.email && p.email.toLowerCase() === cleanId) || p.phone.includes(cleanId)
    );

    if (!matched) {
      matched = currentStaffList[0];
    }

    if (pass.length >= 4) {
      currentUser = matched;
      currentToken = '1|mock_sanctum_pass_token_' + matched.employee_id;

      const newLog: AuditLogEntry = {
        id: 'aud_' + Date.now().toString().slice(-5),
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        staff_name: matched.full_name,
        staff_role: matched.staff_department_role,
        action_code: 'STAFF_PASS_AUTH_SUCCESS',
        action_description: `Staff authorized via corporate password authentication for employee ID ${matched.employee_id}`,
        ip_address: '197.234.221.14 (Douala HQ)',
        security_level: 'INFO',
      };
      currentAuditLogs = [newLog, ...currentAuditLogs];

      notify();
      return true;
    }
    return false;
  };

  const login = async (email: string, pass: string): Promise<boolean> => {
    return loginWithPassword(email, pass);
  };

  const logout = () => {
    currentUser = null;
    currentToken = null;
    notify();
  };

  const switchPersona = (staffId: string) => {
    const target = currentStaffList.find((p) => p.id === staffId);
    if (target) {
      const savedAvatar = localStorage.getItem(`wunabuy_staff_avatar_${target.id}`);
      currentUser = savedAvatar ? { ...target, avatar_url: savedAvatar } : target;
      currentToken = '1|mock_sanctum_staff_token_' + target.employee_id;
      const newLog: AuditLogEntry = {
        id: 'aud_' + Date.now().toString().slice(-5),
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        staff_name: target.full_name,
        staff_role: target.staff_department_role,
        action_code: 'STAFF_PERSONA_SWITCH',
        action_description: `Switched active staff session to ${target.full_name} (${target.department_name}).`,
        ip_address: '197.234.221.14 (Douala HQ)',
        security_level: 'INFO',
      };
      currentAuditLogs = [newLog, ...currentAuditLogs];
      notify();
    }
  };

  const updateUserAvatar = (avatarUrl: string | null) => {
    if (!currentUser) return;
    currentUser = { ...currentUser, avatar_url: avatarUrl };
    if (avatarUrl) {
      localStorage.setItem(`wunabuy_staff_avatar_${currentUser.id}`, avatarUrl);
    } else {
      localStorage.removeItem(`wunabuy_staff_avatar_${currentUser.id}`);
    }
    notify();
  };

  const hasPermission = (permission: StaffPermission): boolean => {
    if (!currentUser) return false;
    if (currentUser.security_clearance_level === 5 || currentUser.staff_department_role === 'SUPER_ADMIN') {
      return true;
    }
    const roleDef = rolesMatrix.find((r) => r.code === currentUser?.staff_department_role);
    if (!roleDef) return false;
    return roleDef.permissions.includes(permission);
  };

  const addAuditLog = (
    entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'staff_name' | 'staff_role' | 'ip_address'>
  ) => {
    if (!currentUser) return;
    const newLog: AuditLogEntry = {
      id: 'aud_' + Date.now().toString().slice(-5),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      staff_name: currentUser.full_name,
      staff_role: currentUser.staff_department_role,
      action_code: entry.action_code,
      action_description: entry.action_description,
      ip_address: '197.234.221.14 (Douala HQ)',
      target_id: entry.target_id,
      security_level: entry.security_level,
    };
    currentAuditLogs = [newLog, ...currentAuditLogs];
    notify();
  };

  // STAFF ACCOUNT CRUD MANAGEMENT ENGINE
  const createStaffAccount = (data: {
    full_name: string;
    email: string;
    phone: string;
    department_name: string;
    staff_department_role: string;
    security_clearance_level: number;
  }) => {
    const newStaff: StaffUser = {
      id: 'staff_' + Date.now().toString().slice(-4),
      full_name: data.full_name,
      email: data.email,
      phone: data.phone.startsWith('+237') ? data.phone : `+237${data.phone.replace(/\s+/g, '')}`,
      role: UserRole.STAFF,
      staff_department_role: data.staff_department_role,
      department_name: data.department_name,
      employee_id: 'WNB-EMP-' + Math.floor(100 + Math.random() * 900),
      security_clearance_level: data.security_clearance_level,
      status: UserStatus.ACTIVE,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      is_phone_verified: true,
      default_address: null,
      available_roles: [UserRole.STAFF],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    currentStaffList = [newStaff, ...currentStaffList];

    addAuditLog({
      action_code: 'STAFF_ACCOUNT_CREATE',
      action_description: `Created new staff account for ${newStaff.full_name} (${newStaff.email}) in ${newStaff.department_name}`,
      target_id: newStaff.id,
      security_level: 'CRITICAL',
    });

    notify();
    return newStaff;
  };

  const updateStaffAccount = (id: string, updates: Partial<StaffUser>) => {
    currentStaffList = currentStaffList.map((s) =>
      s.id === id ? { ...s, ...updates, updated_at: new Date().toISOString() } : s
    );

    if (currentUser?.id === id) {
      currentUser = { ...currentUser, ...updates };
    }

    addAuditLog({
      action_code: 'STAFF_ACCOUNT_UPDATE',
      action_description: `Updated staff profile & security permissions for employee ID ${id}`,
      target_id: id,
      security_level: 'CRITICAL',
    });

    notify();
  };

  const deleteStaffAccount = (id: string) => {
    const target = currentStaffList.find((s) => s.id === id);
    currentStaffList = currentStaffList.filter((s) => s.id !== id);

    addAuditLog({
      action_code: 'STAFF_ACCOUNT_DELETE',
      action_description: `Revoked corporate access & deleted staff account for ${target?.full_name || id}`,
      target_id: id,
      security_level: 'CRITICAL',
    });

    notify();
  };

  // DYNAMIC ROLES & PERMISSIONS CRUD ENGINE
  const createRole = (newRole: StaffRoleDefinition) => {
    rolesMatrix = [...rolesMatrix, { ...newRole, is_custom: true }];
    addAuditLog({
      action_code: 'ROLE_CREATE_CUSTOM',
      action_description: `Super Admin created custom staff role "${newRole.name}" (${newRole.code}) with ${newRole.permissions.length} permissions.`,
      target_id: newRole.code,
      security_level: 'CRITICAL',
    });
    notify();
  };

  const updateRolePermissions = (roleCode: string, newPermissions: StaffPermission[]) => {
    rolesMatrix = rolesMatrix.map((r) =>
      r.code === roleCode ? { ...r, permissions: newPermissions } : r
    );
    addAuditLog({
      action_code: 'ROLE_UPDATE_PERMISSIONS',
      action_description: `Updated permissions matrix for role "${roleCode}". Total active permissions: ${newPermissions.length}.`,
      target_id: roleCode,
      security_level: 'CRITICAL',
    });
    notify();
  };

  const deleteRole = (roleCode: string) => {
    rolesMatrix = rolesMatrix.filter((r) => r.code !== roleCode);
    addAuditLog({
      action_code: 'ROLE_DELETE_CUSTOM',
      action_description: `Super Admin deleted custom staff role "${roleCode}".`,
      target_id: roleCode,
      security_level: 'CRITICAL',
    });
    notify();
  };

  return {
    user: currentUser,
    accessToken: currentToken,
    isAuthenticated: Boolean(currentUser && currentToken),
    auditLogs: currentAuditLogs,
    rolesMatrix,
    staffMembers: currentStaffList,
    requestOTP,
    verifyOTP,
    loginWithPassword,
    login,
    logout,
    switchPersona,
    updateUserAvatar,
    hasPermission,
    addAuditLog,
    createStaffAccount,
    updateStaffAccount,
    deleteStaffAccount,
    createRole,
    updateRolePermissions,
    deleteRole,
  };
}
