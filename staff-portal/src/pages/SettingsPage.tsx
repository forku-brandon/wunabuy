import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { DataTable, Column } from '../components/ui/DataTable';
import { useStaffAuth, SecurityAuditLog, StaffRoleMatrix } from '../stores/staffAuthStore';
import {
  ShieldAlert,
  ShieldCheck,
  Key,
  Users,
  Download,
  Plus,
  Edit2,
  Trash2,
  Lock,
  Search,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    user,
    auditLogs,
    rolesMatrix,
    createRole,
    updateRolePermissions,
    deleteRole,
    addAuditLog,
    hasPermission,
  } = useStaffAuth();

  // Create Role Modal State
  const [createRoleModalOpen, setCreateRoleModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDept, setNewRoleDept] = useState('');
  const [newRoleClearance, setNewRoleClearance] = useState<number>(3);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(['view_dashboard']);

  // Edit Role Modal State
  const [editRoleTarget, setEditRoleTarget] = useState<StaffRoleMatrix | null>(null);
  const [editPermissions, setEditPermissions] = useState<string[]>([]);

  const isSuperAdmin = user?.staff_department_role === 'SUPER_ADMIN';
  const canViewAuditLogs = hasPermission('view_audit_logs');

  const ALL_PERMISSIONS = [
    { key: 'view_dashboard', label: 'View Dashboard & Stat Telemetry' },
    { key: 'view_kyc', label: 'View KYC Submissions Queue' },
    { key: 'approve_kyc', label: 'Approve & Verify Merchant KYC Documents' },
    { key: 'view_disputes', label: 'View Escrow Disputes' },
    { key: 'adjudicate_disputes', label: 'Adjudicate 3-Way Escrow Disputes (Refund/Release)' },
    { key: 'view_logistics', label: 'View Logistics & Transporter Telemetry' },
    { key: 'override_logistics', label: 'Override Delivery Dispatch Status' },
    { key: 'view_financials', label: 'View Financial Balances & Ledger' },
    { key: 'approve_payouts', label: 'Authorize Mobile Money Payout Disbursals' },
    { key: 'manage_users', label: 'Manage Users (Suspend / Re-activate)' },
    { key: 'manage_marketing', label: 'Manage Marketing Banners & Promo Campaigns' },
    { key: 'view_audit_logs', label: 'View Security Audit Logs' },
    { key: 'manage_staff_roles', label: 'Manage Staff Roles & RBAC Matrix (Super Admin Only)' },
  ];

  const handleCreateRoleSubmit = () => {
    if (!newRoleName.trim() || !newRoleDept.trim()) return;

    createRole({
      role_code: newRoleName.toUpperCase().replace(/\s+/g, '_'),
      role_display_name: newRoleName,
      department_name: newRoleDept,
      security_clearance_level: newRoleClearance,
      permissions: selectedPermissions as any,
      is_custom_role: true,
    });

    setCreateRoleModalOpen(false);
    setNewRoleName('');
    setNewRoleDept('');
    setSelectedPermissions(['view_dashboard']);
  };

  const handleSaveEditPermissions = () => {
    if (!editRoleTarget) return;

    updateRolePermissions(editRoleTarget.role_code, editPermissions as any);
    setEditRoleTarget(null);
  };

  const handleExportAuditLogs = () => {
    addAuditLog({
      action_code: 'AUDIT_LOGS_EXPORT',
      action_description: 'Exported security audit log ledger CSV',
      security_level: 'INFO',
    });
    alert('Security Audit Log CSV exported successfully.');
  };

  const auditColumns: Column<SecurityAuditLog>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      render: (item) => <span className="font-mono text-slate-900 font-bold">{item.timestamp}</span>,
    },
    {
      key: 'employee_id',
      header: 'Staff Operator',
      render: (item) => (
        <div>
          <span className="font-bold text-slate-900 block">{item.employee_id}</span>
          <span className="text-[11px] text-slate-500 font-medium">{item.staff_name}</span>
        </div>
      ),
    },
    {
      key: 'action_code',
      header: 'Action Code',
      render: (item) => <span className="font-mono font-bold text-slate-800">{item.action_code}</span>,
    },
    {
      key: 'action_description',
      header: 'Action Description',
      render: (item) => <span className="text-slate-700 font-medium">{item.action_description}</span>,
    },
    {
      key: 'security_level',
      header: 'Security Level',
      align: 'right',
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
      title="Security Governance, RBAC Matrix &amp; Audit Logs"
      subtitle="Role-Based Access Control (RBAC), Clearance Enforcement &amp; Immutable System Audit Trail"
    >
      {/* SUPER ADMIN: STAFF ROLES & PERMISSIONS MATRIX CRUD */}
      {isSuperAdmin && (
        <Card className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-extrabold text-slate-900 font-heading">
                  Staff Role &amp; Permission Matrix Governance
                </h3>
              </div>
              <p className="text-xs text-slate-500 font-medium">Create, edit, and assign fine-grained clearance roles across departments</p>
            </div>

            <Button variant="primary" size="sm" onClick={() => setCreateRoleModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              Create Custom Role
            </Button>
          </div>

          {/* Roles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rolesMatrix.map((role) => (
              <div
                key={role.role_code}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      LEVEL {role.security_clearance_level}
                    </span>
                    <Badge variant={role.is_custom_role ? 'teal' : 'neutral'}>
                      {role.is_custom_role ? 'CUSTOM ROLE' : 'SYSTEM ROLE'}
                    </Badge>
                  </div>

                  <h4 className="text-sm font-extrabold text-slate-900 font-heading">
                    {role.role_display_name}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">{role.department_name}</p>

                  <div className="mt-3 font-semibold text-[11px] text-slate-600 space-y-1">
                    <p>Permissions: <strong className="text-slate-900">{role.permissions.length} Granted</strong></p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditRoleTarget(role);
                      setEditPermissions(role.permissions);
                    }}
                  >
                    <Edit2 className="w-3.5 h-3.5 mr-1 text-slate-500" />
                    Edit Matrix
                  </Button>

                  {role.is_custom_role && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => deleteRole(role.role_code)}
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1 text-red-500" />
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* IMMUTABLE SYSTEM SECURITY AUDIT LOG LEDGER TABLE */}
      {canViewAuditLogs && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-extrabold text-slate-900 font-heading flex items-center">
              <Key className="w-5 h-5 text-teal-600 mr-2" />
              Immutable Security Audit Log Ledger
            </h3>

            <Button variant="outline" size="sm" onClick={handleExportAuditLogs}>
              <Download className="w-4 h-4 mr-1.5" />
              Export Audit CSV
            </Button>
          </div>

          <DataTable
            data={auditLogs}
            columns={auditColumns}
            searchPlaceholder="Search audit action, staff name, employee ID..."
            pageSize={5}
            emptyMessage="No security audit log entries recorded."
          />
        </div>
      )}

      {/* CREATE CUSTOM ROLE MODAL */}
      <Modal
        isOpen={createRoleModalOpen}
        onClose={() => setCreateRoleModalOpen(false)}
        title="Create Custom Staff Role &amp; Permission Assignment"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Role Title / Display Name *</label>
            <input
              type="text"
              placeholder="e.g. Senior Fraud Investigator"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Department Name *</label>
              <input
                type="text"
                placeholder="e.g. Risk & Governance"
                value={newRoleDept}
                onChange={(e) => setNewRoleDept(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Security Clearance Level</label>
              <select
                value={newRoleClearance}
                onChange={(e) => setNewRoleClearance(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              >
                <option value={1}>Level 1 — Read Only Support</option>
                <option value={2}>Level 2 — Field Operations</option>
                <option value={3}>Level 3 — Department Lead</option>
                <option value={4}>Level 4 — Executive Operations</option>
                <option value={5}>Level 5 — Super Administrator</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-2">Assign System Permissions (RBAC)</label>
            <div className="space-y-2 max-h-48 overflow-y-auto p-3 bg-slate-50 border border-slate-200 rounded-xl">
              {ALL_PERMISSIONS.map((perm) => (
                <label key={perm.key} className="flex items-center space-x-2 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(perm.key)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPermissions((prev) => [...prev, perm.key]);
                      } else {
                        setSelectedPermissions((prev) => prev.filter((k) => k !== perm.key));
                      }
                    }}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>{perm.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <Button variant="outline" onClick={() => setCreateRoleModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" disabled={!newRoleName.trim() || !newRoleDept.trim()} onClick={handleCreateRoleSubmit}>
              Create Role &amp; Save Permission Matrix
            </Button>
          </div>
        </div>
      </Modal>

      {/* EDIT ROLE MATRIX MODAL */}
      {editRoleTarget && (
        <Modal
          isOpen={Boolean(editRoleTarget)}
          onClose={() => setEditRoleTarget(null)}
          title={`Edit Permission Matrix — ${editRoleTarget.role_display_name}`}
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 font-medium">Modify RBAC permissions for department: <strong>{editRoleTarget.department_name}</strong></p>

            <div className="space-y-2 max-h-56 overflow-y-auto p-3 bg-slate-50 border border-slate-200 rounded-xl">
              {ALL_PERMISSIONS.map((perm) => (
                <label key={perm.key} className="flex items-center space-x-2 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editPermissions.includes(perm.key)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setEditPermissions((prev) => [...prev, perm.key]);
                      } else {
                        setEditPermissions((prev) => prev.filter((k) => k !== perm.key));
                      }
                    }}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>{perm.label}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
              <Button variant="outline" onClick={() => setEditRoleTarget(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveEditPermissions}>
                Save Updated Matrix &amp; Record Audit Log
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </PageContainer>
  );
};
