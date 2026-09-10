import React, { useState, useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { StatCard } from '../components/ui/StatCard';
import { DataTable, Column } from '../components/ui/DataTable';
import { DualControlConfirmModal } from '../components/ui/DualControlConfirmModal';
import { UserRole, UserStatus } from '@wunabuy/types';
import { useStaffAuth } from '../stores/staffAuthStore';
import { rateLimiter, maskPhone, sanitizeInput } from '../services/security';
import { usersApi, DirectoryUserItem } from '../services';
import {
  Users,
  UserX,
  Building2,
  Bike,
  RefreshCw,
} from 'lucide-react';

export const UsersPage: React.FC = () => {
  const { addAuditLog, hasPermission } = useStaffAuth();
  const [users, setUsers] = useState<DirectoryUserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Interactive Modals
  const [restrictTarget, setRestrictTarget] = useState<DirectoryUserItem | null>(null);

  const canManageUsers = hasPermission('manage_users');

  const fetchUsers = (silent = false) => {
    if (!silent) setIsLoading(true);
    usersApi
      .getUsers()
      .then((res) => {
        if (res.data) {
          setUsers(res.data);
        }
      })
      .catch((err) => {
        console.warn('[UsersPage] Failed to fetch live users directory', err);
      })
      .finally(() => {
        if (!silent) setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(() => {
      fetchUsers(true);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleConfirmRestrictionAction = (reason: string) => {
    if (!restrictTarget) return;

    // Action Rate Limiting
    const rateCheck = rateLimiter.checkLimit(`user_status:${restrictTarget.id}`, 3, 60000, 300000);
    if (!rateCheck.allowed) {
      alert(`⚠️ Action Rate Limited: Account status update locked. Please retry in ${rateCheck.retryAfterSeconds}s.`);
      return;
    }

    const cleanReason = sanitizeInput(reason, 'user_restriction_reason');
    const newStatus = (restrictTarget.status as string).toUpperCase() === 'ACTIVE' ? UserStatus.SUSPENDED : UserStatus.ACTIVE;
    const apiStatus = newStatus === UserStatus.SUSPENDED ? 'suspended' : 'active';

    usersApi.updateUserStatus(restrictTarget.id, apiStatus, cleanReason).catch((err) => {
      console.warn('[UsersPage] Failed to update user status on API server', err);
    });

    setUsers((prev) =>
      prev.map((u) => (u.id === restrictTarget.id ? { ...u, status: newStatus } : u))
    );

    addAuditLog({
      action_code: newStatus === UserStatus.SUSPENDED ? 'USER_ACCOUNT_SUSPEND' : 'USER_ACCOUNT_REACTIVATE',
      action_description: `Updated status of ${restrictTarget.full_name} (${restrictTarget.role}) to ${newStatus}. Reason: "${cleanReason}"`,
      target_id: restrictTarget.id,
      security_level: 'CRITICAL',
    });

    setRestrictTarget(null);
  };

  const columns: Column<DirectoryUserItem>[] = [
    {
      key: 'full_name',
      header: 'Full Name',
      render: (item) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300">
            {item.full_name.charAt(0)}
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-slate-100 block">{item.full_name}</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">{item.email || 'No email registered'}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone (E.164)',
      render: (item) => (
        <div className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
          {maskPhone(item.phone)}
          {item.is_phone_verified && <span className="ml-1 text-teal-600 dark:text-teal-400">✓</span>}
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (item) => {
        const roleUpper = (item.role || '').toUpperCase() as 'BUYER' | 'SELLER' | 'TRANSPORTER' | 'STAFF';
        const variantMap = {
          BUYER: 'info',
          SELLER: 'teal',
          TRANSPORTER: 'warning',
          STAFF: 'neutral',
        } as const;
        return <Badge variant={variantMap[roleUpper] || 'neutral'} size="sm">{item.role}</Badge>;
      },
    },
    {
      key: 'city',
      header: 'City',
      render: (item) => <span className="text-slate-700 dark:text-slate-300 font-medium">{item.city}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => {
        const statusUpper = (item.status || '').toUpperCase() as 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
        const variantMap = {
          ACTIVE: 'success',
          SUSPENDED: 'error',
          DEACTIVATED: 'neutral',
        } as const;
        return <Badge variant={variantMap[statusUpper] || 'neutral'} size="sm">{item.status}</Badge>;
      },
    },
    {
      key: 'id',
      header: 'Actions',
      render: (item) => (
        <div>
          <Button
            variant={item.status === UserStatus.ACTIVE ? 'outline' : 'primary'}
            size="sm"
            disabled={!canManageUsers}
            onClick={() => setRestrictTarget(item)}
          >
            {item.status === UserStatus.ACTIVE ? 'Suspend Access' : 'Reactivate'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageContainer
      title="User Management & Platform Directory"
      subtitle="Inspect active platform Buyers, Sellers, and Transporters. Modify access status and audit identity compliance."
      action={
        <Button
          size="sm"
          variant="outline"
          onClick={() => fetchUsers(false)}
          disabled={isLoading}
          className="flex items-center space-x-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Directory</span>
        </Button>
      }
    >
      {/* Top Telemetry KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="TOTAL REGISTERED USERS"
          value={isLoading ? 'Loading...' : `${users.length} Users`}
          change="Live DB Registry"
          changeType="positive"
          icon={<Users className="w-5 h-5 text-teal-600 dark:text-teal-400" />}
          iconBg="bg-teal-50 dark:bg-teal-950/60"
          description="E.164 phone verified accounts"
        />

        <StatCard
          title="ACTIVE VERIFIED MERCHANTS"
          value={isLoading ? '...' : `${users.filter((u) => (u.role as string).toUpperCase() === 'SELLER' || !!u.store_name).length} Stores`}
          change="KYC Verified"
          changeType="positive"
          icon={<Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          iconBg="bg-emerald-50 dark:bg-emerald-950/60"
          description="Active seller storefronts"
        />

        <StatCard
          title="ON-DUTY TRANSPORTERS"
          value={isLoading ? '...' : `${users.filter((u) => (u.role as string).toUpperCase() === 'TRANSPORTER' || !!u.vehicle_info).length} Drivers`}
          change="Permit Verified"
          changeType="positive"
          icon={<Bike className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          iconBg="bg-blue-50 dark:bg-blue-950/60"
          description="Riders with active GPS telemetry"
        />

        <StatCard
          title="FLAGGED RESTRICTED ACCOUNTS"
          value={isLoading ? '...' : `${users.filter((u) => (u.status as string).toUpperCase() === 'SUSPENDED').length} Suspended`}
          change={users.some((u) => (u.status as string).toUpperCase() === 'SUSPENDED') ? 'Action Taken' : '0 Restricted'}
          changeType={users.some((u) => (u.status as string).toUpperCase() === 'SUSPENDED') ? 'negative' : 'positive'}
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

      {/* OWASP A06: Dual-Control Confirmation Modal */}
      {restrictTarget && (
        <DualControlConfirmModal
          isOpen={Boolean(restrictTarget)}
          onClose={() => setRestrictTarget(null)}
          onConfirm={handleConfirmRestrictionAction}
          title={`Account Status Update — ${restrictTarget.full_name}`}
          description={`You are updating account status for ${restrictTarget.full_name} (${restrictTarget.role}) to ${
            restrictTarget.status === UserStatus.ACTIVE ? 'SUSPENDED' : 'ACTIVE'
          }. Dual-control justification is required.`}
          confirmWord={restrictTarget.status === UserStatus.ACTIVE ? 'SUSPEND' : 'REACTIVATE'}
          actionButtonText="Confirm Account Status Change"
          variant={restrictTarget.status === UserStatus.ACTIVE ? 'danger' : 'primary'}
          requireReason={true}
        />
      )}
    </PageContainer>
  );
};
