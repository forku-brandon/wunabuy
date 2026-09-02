import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import {
  useStaffAuth,
  AuditLogEntry,
  StaffRoleDefinition,
  ALL_STAFF_PERMISSIONS,
  StaffPermission,
  StaffDepartmentRole,
} from '../stores/staffAuthStore';
import {
  ShieldCheck,
  Activity,
  Download,
  Plus,
  Edit3,
  Trash2,
  CheckSquare,
  Square,
  Lock,
  Sparkles,
  Users,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    user,
    auditLogs,
    rolesMatrix,
    hasPermission,
    addAuditLog,
    createRole,
    updateRolePermissions,
    deleteRole,
  } = useStaffAuth();

  const isSuperAdmin = user?.staff_department_role === StaffDepartmentRole.SUPER_ADMIN;

  // Create Role State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newDepartment, setNewDepartment] = useState('Compliance & Audit');
  const [newClearance, setNewClearance] = useState(3);
  const [selectedPermissions, setSelectedPermissions] = useState<StaffPermission[]>([
    'view_dashboard',
    'view_kyc',
  ]);

  // Edit Role State
  const [editRole, setEditRole] = useState<StaffRoleDefinition | null>(null);
  const [editPermissions, setEditPermissions] = useState<StaffPermission[]>([]);

  // Delete Role State
  const [deleteTarget, setDeleteTarget] = useState<StaffRoleDefinition | null>(null);

  const handleTogglePermissionForNew = (perm: StaffPermission) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleTogglePermissionForEdit = (perm: StaffPermission) => {
    setEditPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleCreateSubmit = () => {
    if (!newCode.trim() || !newName.trim()) return;

    const formattedCode = newCode.trim().toUpperCase().replace(/\s+/g, '_');
    createRole({
      code: formattedCode,
      name: newName,
      department: newDepartment,
      clearance_level: newClearance,
      permissions: selectedPermissions,
      is_custom: true,
    });

    setCreateModalOpen(false);
    setNewCode('');
    setNewName('');
    setSelectedPermissions(['view_dashboard', 'view_kyc']);
  };

  const handleOpenEdit = (role: StaffRoleDefinition) => {
    setEditRole(role);
    setEditPermissions([...role.permissions]);
  };

  const handleSaveEditPermissions = () => {
    if (!editRole) return;
    updateRolePermissions(editRole.code, editPermissions);
    setEditRole(null);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteRole(deleteTarget.code);
    setDeleteTarget(null);
  };

  const handleExportAuditLogs = () => {
    addAuditLog({
      action_code: 'AUDIT_LOGS_EXPORT',
      action_description: 'Exported system security audit log ledger CSV',
      security_level: 'INFO',
    });
    alert('🛡️ System Audit Logs exported to CSV successfully!');
  };

  return (
    <PageContainer
      title="System Security, RBAC Roles & Audit Log Center"
      subtitle="Dynamic Staff Role Governance, Permission Matrix & Immutable Audit Trail"
    >
      <div className="space-y-8">
        {/* Active Staff Session Card */}
        <Card>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div className="flex items-center space-x-3">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
              <div>
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  Active Staff Session &amp; Security Clearance
                </h3>
                <p className="text-xs text-slate-500">Employee credentials and active RBAC permissions</p>
              </div>
            </div>

            <Badge variant="teal" size="sm">
              LEVEL {user?.security_clearance_level} CLEARANCE
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">EMPLOYEE NAME</span>
              <p className="font-bold text-slate-900 mt-0.5">{user?.full_name}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">STAFF DEPARTMENT</span>
              <p className="font-bold text-teal-700 mt-0.5">{user?.department_name}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">RBAC ROLE CODE</span>
              <p className="font-mono font-bold text-slate-900 mt-0.5">{user?.staff_department_role}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">EMPLOYEE ID</span>
              <p className="font-mono font-bold text-slate-900 mt-0.5">{user?.employee_id}</p>
            </div>
          </div>
        </Card>

        {/* SUPER ADMIN: DYNAMIC ROLES & PERMISSIONS MANAGEMENT SECTION */}
        {isSuperAdmin && (
          <Card>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-heading flex items-center">
                  <Users className="w-5 h-5 text-teal-600 mr-2" />
                  Staff Department Roles &amp; Permissions Matrix
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Super Admin Governance: Create custom staff roles, edit permission matrices, and remove legacy roles
                </p>
              </div>

              <Button variant="primary" size="sm" onClick={() => setCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-1.5" />
                Create Custom Role
              </Button>
            </div>

            {/* Roles Matrix Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rolesMatrix.map((role) => (
                <div
                  key={role.code}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:border-teal-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[10px] font-extrabold text-slate-500 uppercase">
                        {role.code}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
                        CLEARANCE L{role.clearance_level}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 font-heading">{role.name}</h4>
                    <p className="text-xs text-slate-500">{role.department}</p>

                    <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">
                        Permissions: <strong className="text-teal-700 font-bold">{role.permissions.length} / {ALL_STAFF_PERMISSIONS.length}</strong>
                      </span>
                      {role.is_custom && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800">
                          CUSTOM ROLE
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleOpenEdit(role)}>
                      <Edit3 className="w-3.5 h-3.5 mr-1 text-slate-600" />
                      Edit Matrix
                    </Button>

                    {role.is_custom && (
                      <Button size="sm" variant="danger" onClick={() => setDeleteTarget(role)}>
                        <Trash2 className="w-3.5 h-3.5 text-red-600" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Immutable System Security Audit Logs */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-heading flex items-center">
                <Activity className="w-4 h-4 text-teal-600 mr-2" />
                Immutable System Security Audit Logs
              </h3>
              <p className="text-xs text-slate-500">Cryptographically ordered event log of all staff administrative actions</p>
            </div>

            <Button variant="outline" size="sm" onClick={handleExportAuditLogs}>
              <Download className="w-4 h-4 mr-1.5" />
              Export Audit CSV
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Role Code</th>
                  <th className="py-3 px-4">Action Code</th>
                  <th className="py-3 px-4">Action Description</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">Security Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {auditLogs.map((log: AuditLogEntry) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-500">{log.timestamp}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{log.staff_name}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                        {log.staff_role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-teal-700">{log.action_code}</td>
                    <td className="py-3.5 px-4">{log.action_description}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">{log.ip_address}</td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          log.security_level === 'CRITICAL'
                            ? 'error'
                            : log.security_level === 'WARNING'
                            ? 'warning'
                            : 'success'
                        }
                      >
                        {log.security_level}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* CREATE ROLE MODAL */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create Custom Staff Role">
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Role Unique Code *</label>
              <input
                type="text"
                placeholder="e.g. RISK_AUDITOR"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg uppercase font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Role Display Name *</label>
              <input
                type="text"
                placeholder="e.g. Senior Risk Auditor"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Staff Department</label>
              <input
                type="text"
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Clearance Level (1-5)</label>
              <select
                value={newClearance}
                onChange={(e) => setNewClearance(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-bold"
              >
                <option value={1}>Level 1 — Basic Support</option>
                <option value={2}>Level 2 — Operational Staff</option>
                <option value={3}>Level 3 — Manager / Specialist</option>
                <option value={4}>Level 4 — Senior Officer / Compliance</option>
                <option value={5}>Level 5 — Super Executive Admin</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-2 uppercase tracking-wider">
              Assigned Permissions Checklist ({selectedPermissions.length} selected)
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto p-3 bg-slate-50 border border-slate-200 rounded-xl">
              {ALL_STAFF_PERMISSIONS.map((perm) => {
                const isSelected = selectedPermissions.includes(perm.code);
                return (
                  <div
                    key={perm.code}
                    onClick={() => handleTogglePermissionForNew(perm.code)}
                    className="flex items-start space-x-3 p-2 rounded-lg hover:bg-white cursor-pointer transition-colors"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <p className={`font-bold ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>{perm.label}</p>
                      <p className="text-[10px] text-slate-400">{perm.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" disabled={!newCode.trim() || !newName.trim()} onClick={handleCreateSubmit}>
              Create Role &amp; Grant Access
            </Button>
          </div>
        </div>
      </Modal>

      {/* EDIT ROLE PERMISSIONS MODAL */}
      <Modal isOpen={Boolean(editRole)} onClose={() => setEditRole(null)} title={`Edit Permissions — ${editRole?.name}`}>
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg flex items-center justify-between">
            <div>
              <span className="font-mono font-bold text-teal-900">{editRole?.code}</span>
              <p className="text-[11px] text-teal-700">{editRole?.department}</p>
            </div>
            <Badge variant="teal">CLEARANCE L{editRole?.clearance_level}</Badge>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-2 uppercase tracking-wider">
              Assigned Permissions Checklist ({editPermissions.length} selected)
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto p-3 bg-slate-50 border border-slate-200 rounded-xl">
              {ALL_STAFF_PERMISSIONS.map((perm) => {
                const isSelected = editPermissions.includes(perm.code);
                return (
                  <div
                    key={perm.code}
                    onClick={() => handleTogglePermissionForEdit(perm.code)}
                    className="flex items-start space-x-3 p-2 rounded-lg hover:bg-white cursor-pointer transition-colors"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <p className={`font-bold ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>{perm.label}</p>
                      <p className="text-[10px] text-slate-400">{perm.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <Button variant="outline" onClick={() => setEditRole(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveEditPermissions}>
              Save Permissions &amp; Record Audit Log
            </Button>
          </div>
        </div>
      </Modal>

      {/* DELETE CUSTOM ROLE MODAL */}
      <Modal isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Delete Custom Staff Role">
        <div className="space-y-4 text-xs">
          <p className="text-slate-700">
            Are you sure you want to delete the custom role <strong className="font-bold text-slate-900">{deleteTarget?.name}</strong> ({deleteTarget?.code})?
          </p>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              Delete Role Permanently
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
};
