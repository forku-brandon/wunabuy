import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { StatCard } from '../components/ui/StatCard';
import { Modal } from '../components/ui/Modal';
import { DataTable, Column } from '../components/ui/DataTable';
import { SearchableSelect } from '../components/ui/SearchableSelect';
import { DualControlConfirmModal } from '../components/ui/DualControlConfirmModal';
import {
  useStaffAuth,
  AuditLogEntry,
  StaffRoleDefinition,
  StaffPermission,
} from '../stores/staffAuthStore';
import { sanitizeInput, rateLimiter } from '../services/security';
import {
  ShieldCheck,
  Lock,
  Plus,
  Key,
} from 'lucide-react';

const ALL_SYSTEM_PERMISSIONS: { key: StaffPermission; label: string }[] = [
  { key: 'view_dashboard', label: 'View Executive Dashboard' },
  { key: 'view_kyc', label: 'View KYC Queue' },
  { key: 'approve_kyc', label: 'Approve/Reject KYC' },
  { key: 'view_disputes', label: 'View Escrow Disputes' },
  { key: 'resolve_disputes', label: 'Resolve Escrow Disputes' },
  { key: 'view_logistics', label: 'View Logistics Telemetry' },
  { key: 'override_logistics', label: 'Logistics Manual Override' },
  { key: 'view_financials', label: 'View Financial Ledger' },
  { key: 'approve_payouts', label: 'Authorize Payouts' },
  { key: 'manage_users', label: 'Manage Users & Directory' },
  { key: 'manage_marketing', label: 'Manage Marketing & Banners' },
  { key: 'manage_settings', label: 'Manage System Settings' },
  { key: 'manage_profile_crud', label: 'Manage Staff Profile CRUD (Admin Only)' },
  { key: 'manage_staff_crud', label: 'Create, Edit & Revoke Staff Accounts' },
  { key: 'view_hr_ops', label: 'View HR & Staff Ops' },
  { key: 'manage_hr_payroll', label: 'Manage HR Payroll & Printable Payslips' },
  { key: 'assign_staff_tasks', label: 'Assign & Dispatch Staff Work Directives' },
  { key: 'view_audit_logs', label: 'View Security Audit Logs' },
  { key: 'switch_staff_personas', label: 'Switch QA Staff Personas & Roles (Admin Only)' },
];

export const SettingsPage: React.FC = () => {
  const {
    user,
    auditLogs = [],
    rolesMatrix = [],
    createRole,
    updateRolePermissions,
    deleteRole,
    addAuditLog,
    hasPermission,
  } = useStaffAuth();
  
  // Tab State
  const [activeTab, setActiveTab] = useState<'audit_logs' | 'rbac_roles'>('audit_logs');

  // Role Management Modal State
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<StaffRoleDefinition | null>(null);
  const [roleNameInput, setRoleNameInput] = useState('');
  const [roleDeptInput, setRoleDeptInput] = useState('');
  const [roleClearanceInput, setRoleClearanceInput] = useState('3');
  const [rolePermissionsInput, setRolePermissionsInput] = useState<StaffPermission[]>([]);

  // Dual Control Delete Modal State
  const [deleteRoleTarget, setDeleteRoleTarget] = useState<StaffRoleDefinition | null>(null);

  const isSuperAdmin = user?.security_clearance_level === 5 && hasPermission('manage_settings');

  const safeAuditLogs = Array.isArray(auditLogs) ? auditLogs : [];
  const safeRoles = Array.isArray(rolesMatrix) ? rolesMatrix : [];

  const handleOpenCreateRole = () => {
    setEditingRole(null);
    setRoleNameInput('');
    setRoleDeptInput('Operations & Support');
    setRoleClearanceInput('3');
    setRolePermissionsInput(['view_dashboard', 'view_kyc']);
    setRoleModalOpen(true);
  };

  const handleOpenEditRole = (role: StaffRoleDefinition) => {
    setEditingRole(role);
    setRoleNameInput(role.name);
    setRoleDeptInput(role.department);
    setRoleClearanceInput(String(role.clearance_level));
    setRolePermissionsInput(role.permissions);
    setRoleModalOpen(true);
  };

  const handleTogglePermissionCheckbox = (perm: StaffPermission) => {
    setRolePermissionsInput((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSaveRole = () => {
    if (!roleNameInput.trim() || !roleDeptInput.trim()) return;

    const cleanName = sanitizeInput(roleNameInput, 'role_name');
    const cleanDept = sanitizeInput(roleDeptInput, 'role_dept');

    if (editingRole) {
      updateRolePermissions(editingRole.code, rolePermissionsInput);

      addAuditLog({
        action_code: 'RBAC_ROLE_UPDATE',
        action_description: `Updated system staff role "${cleanName}" (${rolePermissionsInput.length} permissions)`,
        target_id: editingRole.code,
        security_level: 'CRITICAL',
      });
    } else {
      const newRoleObj: StaffRoleDefinition = {
        code: cleanName.toUpperCase().replace(/\s+/g, '_'),
        name: cleanName,
        department: cleanDept,
        clearance_level: parseInt(roleClearanceInput) || 3,
        is_custom: true,
        permissions: rolePermissionsInput,
      };

      createRole(newRoleObj);
    }

    setRoleModalOpen(false);
  };

  const handleConfirmDeleteRoleAction = (reason: string) => {
    if (!deleteRoleTarget || !deleteRoleTarget.is_custom) return;

    deleteRole(deleteRoleTarget.code);
    addAuditLog({
      action_code: 'ROLE_DELETE_CUSTOM',
      action_description: `Deleted custom RBAC staff role "${deleteRoleTarget.name}". Dual-Control Audit Reason: "${reason}"`,
      target_id: deleteRoleTarget.code,
      security_level: 'CRITICAL',
    });

    setDeleteRoleTarget(null);
  };

  const auditColumns: Column<AuditLogEntry>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      render: (item) => <span className="font-mono text-slate-900 dark:text-slate-100 font-semibold">{item.timestamp}</span>,
    },
    {
      key: 'staff_name',
      header: 'Staff Identity',
      render: (item) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-slate-100 block">{item.staff_name}</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{item.staff_role}</span>
        </div>
      ),
    },
    {
      key: 'action_code',
      header: 'Action Code',
      render: (item) => (
        <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800">
          {item.action_code}
        </span>
      ),
    },
    {
      key: 'action_description',
      header: 'Action Telemetry',
      render: (item) => <span className="text-slate-700 dark:text-slate-300 font-medium">{item.action_description}</span>,
    },
    {
      key: 'ip_address',
      header: 'Source Origin',
      render: (item) => <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{item.ip_address}</span>,
    },
    {
      key: 'security_level',
      header: 'Severity',
      render: (item) => {
        const variantMap = { INFO: 'info', WARNING: 'warning', CRITICAL: 'error' } as const;
        return <Badge variant={variantMap[item.security_level]} size="sm">{item.security_level}</Badge>;
      },
    },
  ];

  const roleColumns: Column<StaffRoleDefinition>[] = [
    {
      key: 'name',
      header: 'Role Title',
      render: (item) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-slate-100 block">{item.name}</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{item.code}</span>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      render: (item) => <span className="text-slate-700 dark:text-slate-300 font-medium">{item.department}</span>,
    },
    {
      key: 'clearance_level',
      header: 'Clearance Level',
      render: (item) => <Badge variant={item.clearance_level === 5 ? 'error' : 'teal'} size="sm">Level {item.clearance_level}</Badge>,
    },
    {
      key: 'permissions',
      header: 'Permissions Count',
      render: (item) => (
        <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
          {item.permissions.length} Active Rules
        </span>
      ),
    },
    {
      key: 'code',
      header: 'Actions',
      render: (item) => (
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled={!isSuperAdmin} onClick={() => handleOpenEditRole(item)}>
            Edit Permissions
          </Button>
          {item.is_custom && (
            <Button variant="danger" size="sm" disabled={!isSuperAdmin} onClick={() => setDeleteRoleTarget(item)}>
              Delete Role
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <PageContainer
      title="System Settings & Security Audit Center"
      subtitle="Inspect immutable system administrative action ledger, configure role-based access matrix, and enforce security policies."
      action={
        activeTab === 'rbac_roles' && (
          <Button variant="primary" size="sm" disabled={!isSuperAdmin} onClick={handleOpenCreateRole}>
            <Plus className="w-4 h-4 mr-1.5" />
            Create Custom Staff Role
          </Button>
        )
      }
    >
      {/* Top Telemetry KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="SECURITY AUDIT LEDGER"
          value={`${safeAuditLogs.length} Records`}
          change="Immutable DB Ledger"
          changeType="positive"
          icon={<ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400" />}
          iconBg="bg-teal-50 dark:bg-teal-950/60"
          description="Administrative actions recorded"
        />

        <StatCard
          title="ACTIVE RBAC ROLES"
          value={`${safeRoles.length} Defined Roles`}
          change="Clearance Levels 1 - 5"
          changeType="neutral"
          icon={<Key className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
          iconBg="bg-amber-50 dark:bg-amber-950/60"
          description="Access control matrix"
        />

        <StatCard
          title="CRITICAL ACTIONS RECORDED"
          value={`${safeAuditLogs.filter((l) => l.security_level === 'CRITICAL').length} Critical`}
          change="High-Severity Telemetry"
          changeType="warning"
          icon={<Lock className="w-5 h-5 text-red-600 dark:text-red-400" />}
          iconBg="bg-red-50 dark:bg-red-950/60"
          description="Payout & user status changes"
        />

        <StatCard
          title="AUTHENTICATION GUARD"
          value="TLS 1.3 Active"
          change="Sanctum Bearer Guard"
          changeType="positive"
          icon={<ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          iconBg="bg-blue-50 dark:bg-blue-950/60"
          description="Sanctum token validation"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6 space-x-6">
        <button
          onClick={() => setActiveTab('audit_logs')}
          className={`pb-3 text-xs font-bold transition-colors border-b-2 ${
            activeTab === 'audit_logs'
              ? 'border-teal-600 dark:border-teal-400 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Security Audit Logs ({safeAuditLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('rbac_roles')}
          className={`pb-3 text-xs font-bold transition-colors border-b-2 ${
            activeTab === 'rbac_roles'
              ? 'border-teal-600 dark:border-teal-400 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          RBAC Access Control Matrix ({safeRoles.length})
        </button>
      </div>

      {/* Tab 1: Audit Logs */}
      {activeTab === 'audit_logs' && (
        <Card>
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">System Audit Logs Ledger</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Immutable security audit trail of all staff administrative actions.</p>
          </div>
          <DataTable data={safeAuditLogs} columns={auditColumns} searchPlaceholder="Search audit log by staff name, action code, or IP..." />
        </Card>
      )}

      {/* Tab 2: RBAC Matrix */}
      {activeTab === 'rbac_roles' && (
        <Card>
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Role-Based Access Control (RBAC) Roles</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Manage department roles, clearance levels, and active permission sets.</p>
          </div>
          <DataTable data={safeRoles} columns={roleColumns} searchPlaceholder="Search roles by title or department..." />
        </Card>
      )}

      {/* CREATE / EDIT ROLE MODAL */}
      <Modal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        title={editingRole ? `Edit Permissions — ${editingRole.name}` : 'Create Custom Staff Role'}
      >
        <div className="space-y-4 text-xs font-semibold">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Role Name *</label>
            <input
              type="text"
              value={roleNameInput}
              onChange={(e) => setRoleNameInput(e.target.value)}
              placeholder="e.g. Senior Regional Inspector"
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Department *</label>
            <input
              type="text"
              value={roleDeptInput}
              onChange={(e) => setRoleDeptInput(e.target.value)}
              placeholder="e.g. Regional Risk Verification"
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Clearance Level (1 to 5) *</label>
            <SearchableSelect
              options={[
                { value: '1', label: 'Level 1 — Entry / View Only' },
                { value: '2', label: 'Level 2 — Basic Operations' },
                { value: '3', label: 'Level 3 — Manager / Operational Override' },
                { value: '4', label: 'Level 4 — Lead / Treasury & Compliance' },
                { value: '5', label: 'Level 5 — Executive Super Admin' },
              ]}
              value={roleClearanceInput}
              onChange={setRoleClearanceInput}
              searchPlaceholder="Search clearance level..."
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">
              Assign Permissions Matrix ({rolePermissionsInput.length} selected) *
            </label>
            <div className="max-h-48 overflow-y-auto space-y-1.5 border border-slate-200 dark:border-slate-700 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              {ALL_SYSTEM_PERMISSIONS.map((perm) => (
                <label key={perm.key} className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 cursor-pointer font-medium hover:text-teal-600">
                  <input
                    type="checkbox"
                    checked={rolePermissionsInput.includes(perm.key)}
                    onChange={() => handleTogglePermissionCheckbox(perm.key)}
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span>{perm.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setRoleModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveRole}>
              Save Role Matrix
            </Button>
          </div>
        </div>
      </Modal>

      {/* OWASP A06: Dual-Control Confirmation Modal for Role Deletion */}
      {deleteRoleTarget && (
        <DualControlConfirmModal
          isOpen={Boolean(deleteRoleTarget)}
          onClose={() => setDeleteRoleTarget(null)}
          onConfirm={handleConfirmDeleteRoleAction}
          title={`Delete Custom Role — ${deleteRoleTarget.name}`}
          description={`You are deleting custom RBAC staff role "${deleteRoleTarget.name}" (${deleteRoleTarget.code}). Staff members assigned to this role will lose associated permissions.`}
          confirmWord="DELETE"
          actionButtonText="Delete Custom Role"
          variant="danger"
          requireReason={true}
        />
      )}
    </PageContainer>
  );
};
