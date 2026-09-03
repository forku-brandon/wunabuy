import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { StatCard } from '../components/ui/StatCard';
import { Modal } from '../components/ui/Modal';
import { DataTable, Column } from '../components/ui/DataTable';
import {
  useStaffAuth,
  AuditLogEntry,
  StaffRoleDefinition,
  StaffPermission,
} from '../stores/staffAuthStore';
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
  { key: 'view_audit_logs', label: 'View Security Audit Logs' },
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

    if (editingRole) {
      updateRolePermissions(editingRole.code, rolePermissionsInput);

      addAuditLog({
        action_code: 'RBAC_ROLE_UPDATE',
        action_description: `Updated system staff role "${roleNameInput}" (${rolePermissionsInput.length} permissions)`,
        target_id: editingRole.code,
        security_level: 'CRITICAL',
      });
    } else {
      const newRoleObj: StaffRoleDefinition = {
        code: roleNameInput.toUpperCase().replace(/\s+/g, '_'),
        name: roleNameInput,
        department: roleDeptInput,
        clearance_level: parseInt(roleClearanceInput) || 3,
        is_custom: true,
        permissions: rolePermissionsInput,
      };

      createRole(newRoleObj);
    }

    setRoleModalOpen(false);
  };

  const handleDeleteRole = (role: StaffRoleDefinition) => {
    if (!role.is_custom) {
      alert('Default system roles cannot be deleted.');
      return;
    }

    if (confirm(`Are you sure you want to delete custom role "${role.name}"?`)) {
      deleteRole(role.code);
    }
  };

  const auditColumns: Column<AuditLogEntry>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      render: (item) => <span className="font-mono text-slate-900 dark:text-slate-100 font-semibold">{item.timestamp}</span>,
    },
    {
      key: 'staff_name',
      header: 'Staff Actor',
      render: (item) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-slate-100 block">{item.staff_name}</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Role: {item.staff_role}</span>
        </div>
      ),
    },
    {
      key: 'action_code',
      header: 'Action Code',
      render: (item) => (
        <span className="font-mono font-extrabold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-lg border border-teal-200 dark:border-teal-800">
          {item.action_code}
        </span>
      ),
    },
    {
      key: 'action_description',
      header: 'Audit Trail Description',
      render: (item) => <span className="text-slate-800 dark:text-slate-200 font-medium">{item.action_description}</span>,
    },
    {
      key: 'security_level',
      header: 'Severity',
      render: (item) => (
        <Badge
          variant={
            item.security_level === 'CRITICAL'
              ? 'error'
              : item.security_level === 'WARNING'
              ? 'warning'
              : 'teal'
          }
        >
          {item.security_level}
        </Badge>
      ),
    },
  ];

  return (
    <PageContainer
      title="Security, System Audit Logs &amp; RBAC Governance"
      subtitle="Immutable Operational Audit Ledger, Dynamic Staff Roles &amp; Security Clearance Matrix"
    >
      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="TOTAL RECORDED AUDIT LOGS"
          value={`${safeAuditLogs.length} Records`}
          change="Immutable Ledger"
          changeType="positive"
          icon={<ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400" />}
          iconBg="bg-teal-50 dark:bg-teal-950/60"
          description="Crypto-hash verified log chain"
        />

        <StatCard
          title="ACTIVE SYSTEM ROLES"
          value={`${safeRoles.length} Roles`}
          change="Level 1 - 5"
          changeType="neutral"
          icon={<Key className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          iconBg="bg-blue-50 dark:bg-blue-950/60"
          description="RBAC permission configurations"
        />

        <StatCard
          title="SUPER ADMIN CLEARANCE"
          value={`Level ${user?.security_clearance_level || 5}`}
          change="L5 Super User"
          changeType="positive"
          icon={<Lock className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
          iconBg="bg-purple-50 dark:bg-purple-950/60"
          description="Full system governance active"
        />

        <StatCard
          title="SECURITY COMPLIANCE"
          value="100% Passed"
          change="TLS 1.3 Strict"
          changeType="positive"
          icon={<ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          iconBg="bg-emerald-50 dark:bg-emerald-950/60"
          description="Zero security breaches logged"
        />
      </div>

      {/* Top Tab Bar Navigation */}
      <div className="flex items-center space-x-3 mb-6">
        <button
          onClick={() => setActiveTab('audit_logs')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold flex items-center space-x-2 transition-all shadow-xs ${
            activeTab === 'audit_logs'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-white dark:bg-[#151C28] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Security Audit Log Ledger ({safeAuditLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('rbac_roles')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold flex items-center space-x-2 transition-all shadow-xs ${
            activeTab === 'rbac_roles'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-white dark:bg-[#151C28] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Staff Roles &amp; Permissions Matrix ({safeRoles.length})</span>
        </button>
      </div>

      {/* TAB 1: IMMUTABLE AUDIT LOG LEDGER */}
      {activeTab === 'audit_logs' && (
        <DataTable
          data={safeAuditLogs}
          columns={auditColumns}
          searchPlaceholder="Search audit code, staff actor, description..."
          pageSize={5}
          emptyMessage="No audit logs recorded."
        />
      )}

      {/* TAB 2: SUPER ADMIN ROLES & PERMISSIONS MATRIX CRUD */}
      {activeTab === 'rbac_roles' && (
        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-heading flex items-center">
                  <Key className="w-5 h-5 text-teal-600 dark:text-teal-400 mr-2" />
                  Staff Department Roles &amp; Clearance Matrix
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Configure clearance levels (L1 - L5) and fine-grained system permission flags</p>
              </div>

              {isSuperAdmin ? (
                <Button variant="primary" size="sm" onClick={handleOpenCreateRole}>
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Custom Role
                </Button>
              ) : (
                <Badge variant="amber">LEVEL 5 READ-ONLY</Badge>
              )}
            </div>

            {/* Roles Grid List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {safeRoles.map((r) => (
                <div key={r.code} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-extrabold px-2.5 py-0.5 rounded bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300">
                        CLEARANCE LEVEL {r.clearance_level}
                      </span>
                      {r.is_custom && (
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">CUSTOM ROLE</span>
                      )}
                    </div>

                    <h4 className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-heading mt-2">
                      {r.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{r.department}</p>

                    <div className="mt-4 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                        GRANTED PERMISSIONS ({r.permissions ? r.permissions.length : 0})
                      </span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {r.permissions && r.permissions.map((p) => (
                          <span key={p} className="text-[10px] font-semibold px-2 py-0.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-slate-700 dark:text-slate-300">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {isSuperAdmin && (
                    <div className="mt-5 pt-3 border-t border-slate-200/80 dark:border-slate-700 flex items-center justify-end space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleOpenEditRole(r)}>
                        Edit Permissions
                      </Button>
                      {r.is_custom && (
                        <Button size="sm" variant="secondary" onClick={() => handleDeleteRole(r)}>
                          Delete
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* CREATE / EDIT ROLE MODAL */}
      <Modal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        title={editingRole ? `Edit Role Matrix — ${editingRole.name}` : 'Create Custom Staff Role'}
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Role Title *</label>
              <input
                type="text"
                placeholder="e.g. Regional Risk Analyst"
                value={roleNameInput}
                onChange={(e) => setRoleNameInput(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Department Name *</label>
              <input
                type="text"
                placeholder="e.g. Risk & Compliance"
                value={roleDeptInput}
                onChange={(e) => setRoleDeptInput(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Security Clearance Level (1 - 5)</label>
            <select
              value={roleClearanceInput}
              onChange={(e) => setRoleClearanceInput(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100"
            >
              <option value="1">Level 1 — Basic Viewer</option>
              <option value="2">Level 2 — Customer Service Support</option>
              <option value="3">Level 3 — Department Specialist / Operations</option>
              <option value="4">Level 4 — Senior Department Officer</option>
              <option value="5">Level 5 — Super Administrator</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">Granted System Permission Flags</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
              {ALL_SYSTEM_PERMISSIONS.map((perm) => {
                const checked = rolePermissionsInput.includes(perm.key);
                return (
                  <label key={perm.key} className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleTogglePermissionCheckbox(perm.key)}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span>{perm.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setRoleModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" disabled={!roleNameInput.trim()} onClick={handleSaveRole}>
              Save Role Matrix &amp; Record Audit
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
};
