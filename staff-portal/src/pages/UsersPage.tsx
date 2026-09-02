import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { UserRole, UserStatus } from '@wunabuy/types';
import { useStaffAuth } from '../stores/staffAuthStore';
import { Search, ShieldAlert, UserCheck, UserX, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ManagedUser {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  role: UserRole;
  status: UserStatus;
  joined_date: string;
}

const MOCK_USERS: ManagedUser[] = [
  { id: 'u1', full_name: 'Jean Dupont', phone: '+237 670 111 222', email: 'jean@gmail.com', role: UserRole.BUYER, status: UserStatus.ACTIVE, joined_date: 'Aug 10, 2026' },
  { id: 'u2', full_name: 'Emmanuel Nsangou (Douala Tech)', phone: '+237 670 123 456', email: 'info@doualatech.cm', role: UserRole.SELLER, status: UserStatus.ACTIVE, joined_date: 'Jul 15, 2026' },
  { id: 'u3', full_name: 'Samuel Mbida', phone: '+237 675 112 233', email: 'samuel@transporter.cm', role: UserRole.TRANSPORTER, status: UserStatus.ACTIVE, joined_date: 'Aug 01, 2026' },
  { id: 'u4', full_name: 'Pauline Mbarga', phone: '+237 670 000 099', email: 'pauline.admin@wunabuy.com', role: UserRole.STAFF, status: UserStatus.ACTIVE, joined_date: 'May 01, 2026' },
  { id: 'u5', full_name: 'Christian Atangana', phone: '+237 699 112 233', email: 'christian.finance@wunabuy.com', role: UserRole.STAFF, status: UserStatus.ACTIVE, joined_date: 'Jun 10, 2026' },
];

export const UsersPage: React.FC = () => {
  const { addAuditLog, hasPermission } = useStaffAuth();
  const [users, setUsers] = useState<ManagedUser[]>(MOCK_USERS);
  const [activeRoleFilter, setActiveRoleFilter] = useState<'ALL' | UserRole>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');

  const canManageUsers = hasPermission('manage_users');

  const filteredUsers = users.filter((u) => {
    if (activeRoleFilter !== 'ALL' && u.role !== activeRoleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return u.full_name.toLowerCase().includes(q) || u.phone.includes(q) || (u.email && u.email.toLowerCase().includes(q));
    }
    return true;
  });

  const handleToggleStatusInitiate = (user: ManagedUser) => {
    setSelectedUser(user);
    if (user.status === UserStatus.ACTIVE) {
      setSuspendModalOpen(true);
    } else {
      // Re-activate immediately
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: UserStatus.ACTIVE } : u))
      );
      addAuditLog({
        action_code: 'USER_ACCOUNT_REACTIVATE',
        action_description: `Re-activated account for ${user.full_name} (${user.role})`,
        target_id: user.id,
        security_level: 'INFO',
      });
      setSelectedUser(null);
    }
  };

  const handleConfirmSuspension = () => {
    if (!selectedUser || !suspendReason.trim()) return;

    setUsers((prev) =>
      prev.map((u) => (u.id === selectedUser.id ? { ...u, status: UserStatus.SUSPENDED } : u))
    );

    addAuditLog({
      action_code: 'USER_ACCOUNT_SUSPEND',
      action_description: `Suspended account for ${selectedUser.full_name} (${selectedUser.role}). Reason: ${suspendReason}`,
      target_id: selectedUser.id,
      security_level: 'WARNING',
    });

    setSuspendModalOpen(false);
    setSelectedUser(null);
    setSuspendReason('');
  };

  return (
    <PageContainer
      title="User & Fleet RBAC Security Directory"
      subtitle="Manage Accounts, Suspend High-Risk Accounts & Control Staff System Permissions"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveRoleFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeRoleFilter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Accounts ({users.length})
          </button>
          <button
            onClick={() => setActiveRoleFilter(UserRole.BUYER)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeRoleFilter === UserRole.BUYER ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Buyers
          </button>
          <button
            onClick={() => setActiveRoleFilter(UserRole.SELLER)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeRoleFilter === UserRole.SELLER ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Sellers
          </button>
          <button
            onClick={() => setActiveRoleFilter(UserRole.TRANSPORTER)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeRoleFilter === UserRole.TRANSPORTER ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Transporters
          </button>
          <button
            onClick={() => setActiveRoleFilter(UserRole.STAFF)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeRoleFilter === UserRole.STAFF ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Staff Personnel
          </button>
        </div>

        <div className="w-full md:w-72 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by full name, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-6">User / Employee</th>
              <th className="py-3.5 px-6">Phone Number</th>
              <th className="py-3.5 px-6">Email Address</th>
              <th className="py-3.5 px-6">Assigned Role</th>
              <th className="py-3.5 px-6">Account Status</th>
              <th className="py-3.5 px-6">Joined Date</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-4 px-6 font-bold text-slate-900">{user.full_name}</td>
                <td className="py-4 px-6 font-mono">{user.phone}</td>
                <td className="py-4 px-6 text-slate-500">{user.email || 'N/A'}</td>
                <td className="py-4 px-6">
                  <Badge variant={user.role === UserRole.STAFF ? 'info' : user.role === UserRole.SELLER ? 'teal' : 'amber'}>

                    {user.role}
                  </Badge>
                </td>
                <td className="py-4 px-6">
                  <Badge variant={user.status === UserStatus.ACTIVE ? 'success' : 'error'}>
                    {user.status}
                  </Badge>
                </td>
                <td className="py-4 px-6 text-slate-400">{user.joined_date}</td>
                <td className="py-4 px-6 text-right">
                  {canManageUsers && user.role !== UserRole.STAFF && (
                    <Button
                      size="sm"
                      variant={user.status === UserStatus.ACTIVE ? 'danger' : 'outline'}
                      onClick={() => handleToggleStatusInitiate(user)}
                    >
                      {user.status === UserStatus.ACTIVE ? 'Suspend Account' : 'Re-activate'}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Account Suspension Confirmation Modal */}
      <Modal isOpen={suspendModalOpen} onClose={() => setSuspendModalOpen(false)} title="Suspend User Account">
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-red-900">
              <p className="font-bold">Security Account Restriction</p>
              <p className="mt-0.5 text-[11px]">
                Suspending <strong className="font-extrabold">{selectedUser?.full_name}</strong> will revoke all active Sanctum tokens and block app access.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mandatory Suspension Reason &amp; Risk Notes *
            </label>
            <textarea
              rows={3}
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="Specify compliance reason (e.g. Fraud dispute alert, invalid CNI submission)..."
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <Button variant="outline" onClick={() => setSuspendModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" disabled={!suspendReason.trim()} onClick={handleConfirmSuspension}>
              Confirm Suspension &amp; Record Audit
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
};
