import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { UserRole, UserStatus } from '@wunabuy/types';
import { Search, ShieldAlert, UserCheck, UserX } from 'lucide-react';

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
  { id: 'u2', full_name: 'Emmanuel Nsangou', phone: '+237 670 123 456', email: 'info@doualatech.cm', role: UserRole.SELLER, status: UserStatus.ACTIVE, joined_date: 'Jul 15, 2026' },
  { id: 'u3', full_name: 'Samuel Mbida', phone: '+237 675 112 233', email: 'samuel@transporter.cm', role: UserRole.TRANSPORTER, status: UserStatus.ACTIVE, joined_date: 'Aug 01, 2026' },
  { id: 'u4', full_name: 'Pauline Mbarga', phone: '+237 670 000 099', email: 'admin@wunabuy.com', role: UserRole.STAFF, status: UserStatus.ACTIVE, joined_date: 'May 01, 2026' },
];

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<ManagedUser[]>(MOCK_USERS);
  const [activeRoleFilter, setActiveRoleFilter] = useState<'ALL' | UserRole>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter((u) => {
    if (activeRoleFilter !== 'ALL' && u.role !== activeRoleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return u.full_name.toLowerCase().includes(q) || u.phone.includes(q);
    }
    return true;
  });

  const handleToggleStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, status: u.status === UserStatus.ACTIVE ? UserStatus.SUSPENDED : UserStatus.ACTIVE }
          : u
      )
    );
  };

  return (
    <PageContainer
      title="User & Fleet Directory"
      subtitle="Manage registered Buyers, Merchant Sellers, Transporter Drivers, and Staff permissions."
    >
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            {(['ALL', UserRole.BUYER, UserRole.SELLER, UserRole.TRANSPORTER, UserRole.STAFF] as const).map(
              (role) => {
                const isSelected = activeRoleFilter === role;
                return (
                  <button
                    key={role}
                    onClick={() => setActiveRoleFilter(role)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                      isSelected
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {role}
                  </button>
                );
              }
            )}
          </div>

          <div className="w-full md:w-72">
            <Input
              placeholder="Search user name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-6">Full Name</th>
              <th className="py-3.5 px-6">Phone / Email</th>
              <th className="py-3.5 px-6">Primary Role</th>
              <th className="py-3.5 px-6">Account Status</th>
              <th className="py-3.5 px-6">Joined Date</th>
              <th className="py-3.5 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-4 px-6 font-bold text-slate-900">{u.full_name}</td>
                <td className="py-4 px-6 text-slate-600">
                  <span className="block font-medium">{u.phone}</span>
                  {u.email && <span className="text-[11px] text-slate-400">{u.email}</span>}
                </td>
                <td className="py-4 px-6">
                  <Badge variant={u.role === UserRole.STAFF ? 'amber' : 'teal'}>
                    {u.role}
                  </Badge>
                </td>
                <td className="py-4 px-6">
                  <Badge variant={u.status === UserStatus.ACTIVE ? 'success' : 'error'}>
                    {u.status}
                  </Badge>
                </td>
                <td className="py-4 px-6 text-slate-500">{u.joined_date}</td>
                <td className="py-4 px-6 text-right">
                  <Button
                    variant={u.status === UserStatus.ACTIVE ? 'ghost' : 'outline'}
                    size="sm"
                    onClick={() => handleToggleStatus(u.id)}
                  >
                    {u.status === UserStatus.ACTIVE ? 'Suspend' : 'Reactivate'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </PageContainer>
  );
};

