import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { StatCard } from '../components/ui/StatCard';
import { Modal } from '../components/ui/Modal';
import { DataTable, Column } from '../components/ui/DataTable';
import { UserRole, UserStatus } from '@wunabuy/types';
import { useStaffAuth } from '../stores/staffAuthStore';
import {
  Users,
  UserX,
  Building2,
  Bike,
} from 'lucide-react';

interface DirectoryUserItem {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  role: UserRole;
  status: UserStatus;
  is_phone_verified: boolean;
  kyc_status?: string;
  city: string;
  registered_at: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
}

const MOCK_USERS_DIRECTORY: DirectoryUserItem[] = [
  {
    id: 'usr_101',
    full_name: 'Emmanuel Nsangou',
    phone: '+237 670 123 456',
    email: 'emmanuel.nsangou@doualatech.cm',
    role: UserRole.SELLER,
    status: UserStatus.ACTIVE,
    is_phone_verified: true,
    kyc_status: 'APPROVED',
    city: 'Douala',
    registered_at: '2026-01-15',
    risk_level: 'LOW',
  },
  {
    id: 'usr_102',
    full_name: 'Jean-Paul Nkoum',
    phone: '+237 670 112 233',
    email: 'jeanpaul.nkoum@wunabuy.cm',
    role: UserRole.TRANSPORTER,
    status: UserStatus.ACTIVE,
    is_phone_verified: true,
    kyc_status: 'APPROVED',
    city: 'Douala',
    registered_at: '2026-02-10',
    risk_level: 'LOW',
  },
  {
    id: 'usr_103',
    full_name: 'Amadou Bello',
    phone: '+237 699 554 433',
    email: 'amadou.bello@gmail.com',
    role: UserRole.BUYER,
    status: UserStatus.ACTIVE,
    is_phone_verified: true,
    city: 'Yaoundé',
    registered_at: '2026-03-04',
    risk_level: 'LOW',
  },
  {
    id: 'usr_104',
    full_name: 'Josephine Tchakounte',
    phone: '+237 675 443 322',
    email: 'josephine@couture.cm',
    role: UserRole.SELLER,
    status: UserStatus.SUSPENDED,
    is_phone_verified: true,
    kyc_status: 'UNDER_REVIEW',
    city: 'Douala',
    registered_at: '2026-04-12',
    risk_level: 'HIGH',
  },
];

export const UsersPage: React.FC = () => {
  const { addAuditLog, hasPermission } = useStaffAuth();
  const [users, setUsers] = useState<DirectoryUserItem[]>(MOCK_USERS_DIRECTORY);
  
  // Interactive Modals
  const [restrictTarget, setRestrictTarget] = useState<DirectoryUserItem | null>(null);
  const [restrictionReason, setRestrictionReason] = useState('');

  const canManageUsers = hasPermission('manage_users');

  const handleToggleRestriction = () => {
    if (!restrictTarget || !restrictionReason.trim()) return;

    const newStatus = restrictTarget.status === UserStatus.ACTIVE ? UserStatus.SUSPENDED : UserStatus.ACTIVE;

    addAuditLog({
      action_code: newStatus === UserStatus.SUSPENDED ? 'USER_ACCOUNT_SUSPEND' : 'USER_ACCOUNT_ACTIVATE',
      action_description: `${newStatus === UserStatus.SUSPENDED ? 'Suspended' : 'Re-activated'} user account ${restrictTarget.full_name} (${restrictTarget.phone}). Reason: ${restrictionReason}`,
      target_id: restrictTarget.id,
      security_level: 'WARNING',
    });

    setUsers((prev) =>
      prev.map((u) => (u.id === restrictTarget.id ? { ...u, status: newStatus } : u))
    );

    setRestrictTarget(null);
    setRestrictionReason('');
  };

  const columns: Column<DirectoryUserItem>[] = [
    {
      key: 'full_name',
      header: 'Full Name / Phone',
      render: (item) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-slate-100 block">{item.full_name}</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{item.phone}</span>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email / City',
      render: (item) => (
        <div>
          <span className="font-bold text-slate-800 dark:text-slate-200 block">{item.email || 'No email attached'}</span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">City: {item.city}</span>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Account Role',
      render: (item) => <Badge variant="teal">{item.role}</Badge>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <Badge variant={item.status === UserStatus.ACTIVE ? 'success' : 'error'}>
          {item.status}
        </Badge>
      ),
    },
    {
      key: 'registered_at',
      header: 'Registered Date',
      render: (item) => <span className="font-mono text-slate-900 dark:text-slate-100 font-semibold">{item.registered_at}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (item) => (
        <div className="flex items-center justify-end space-x-2">
          {canManageUsers && (
            <Button
              size="sm"
              variant={item.status === UserStatus.ACTIVE ? 'secondary' : 'primary'}
              onClick={() => setRestrictTarget(item)}
            >
              {item.status === UserStatus.ACTIVE ? 'Suspend' : 'Re-activate'}
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <PageContainer
      title="Platform Users &amp; Global Directory Engine"
      subtitle="Manage Multi-Sided Marketplace Accounts: Buyers, Store Merchants, Transporter Drivers &amp; System Personnel"
    >
      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="TOTAL REGISTERED USERS"
          value="14,250 Accounts"
          change="Douala & Yaoundé"
          changeType="positive"
          icon={<Users className="w-5 h-5 text-teal-600 dark:text-teal-400" />}
          iconBg="bg-teal-50 dark:bg-teal-950/60"
          description="E.164 phone verified accounts"
        />

        <StatCard
          title="ACTIVE VERIFIED MERCHANTS"
          value="1,840 Stores"
          change="KYC Approved"
          changeType="positive"
          icon={<Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          iconBg="bg-emerald-50 dark:bg-emerald-950/60"
          description="Active seller storefronts"
        />

        <StatCard
          title="ON-DUTY TRANSPORTERS"
          value="420 Drivers"
          change="Permit Verified"
          changeType="positive"
          icon={<Bike className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          iconBg="bg-blue-50 dark:bg-blue-950/60"
          description="Riders with active GPS telemetry"
        />

        <StatCard
          title="FLAGGED RESTRICTED ACCOUNTS"
          value="4 Suspended"
          change="Under Investigation"
          changeType="negative"
          icon={<UserX className="w-5 h-5 text-red-600 dark:text-red-400" />}
          iconBg="bg-red-50 dark:bg-red-950/60"
          description="Access suspended by staff"
        />
      </div>

      {/* Advanced Reusable DataTable */}
      <DataTable
        data={users}
        columns={columns}
        searchPlaceholder="Search by name, phone, email, or city..."
        pageSize={5}
        emptyMessage="No matching user accounts found."
      />

      {/* ACCOUNT RESTRICTION CONFIRMATION MODAL */}
      {restrictTarget && (
        <Modal
          isOpen={Boolean(restrictTarget)}
          onClose={() => setRestrictTarget(null)}
          title={`Account Restriction — ${restrictTarget.full_name}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">TARGET USER ACCOUNT</span>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">{restrictTarget.full_name}</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Phone: {restrictTarget.phone} • Role: {restrictTarget.role}</p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Mandatory Staff Operational Reason *
              </label>
              <textarea
                rows={3}
                value={restrictionReason}
                onChange={(e) => setRestrictionReason(e.target.value)}
                placeholder="Specify reason (e.g. Fraud report, document mismatch, suspicious activity)..."
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" onClick={() => setRestrictTarget(null)}>
                Cancel
              </Button>
              <Button variant="primary" disabled={!restrictionReason.trim()} onClick={handleToggleRestriction}>
                Confirm Status Update &amp; Log Audit
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </PageContainer>
  );
};
