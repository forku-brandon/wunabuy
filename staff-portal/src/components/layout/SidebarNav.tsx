import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileCheck,
  ShieldAlert,
  Users,
  Wallet,
  Settings,
  Truck,
  Megaphone,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useStaffAuth, StaffPermission } from '../../stores/staffAuthStore';

interface NavItemConfig {
  label: string;
  path: string;
  icon: any;
  permission: StaffPermission;
  badge?: number;
}

export const SidebarNav: React.FC = () => {
  const { user, hasPermission } = useStaffAuth();

  const allNavItems: NavItemConfig[] = [
    { label: 'Executive Dashboard', path: '/', icon: LayoutDashboard, permission: 'view_dashboard' },
    { label: 'KYC & Verification', path: '/kyc', icon: FileCheck, permission: 'view_kyc', badge: 4 },
    { label: 'Escrow Disputes', path: '/disputes', icon: ShieldAlert, permission: 'view_disputes', badge: 2 },
    { label: 'Logistics & Dispatch', path: '/logistics', icon: Truck, permission: 'view_logistics', badge: 12 },
    { label: 'Financials & Payouts', path: '/financials', icon: Wallet, permission: 'view_financials' },
    { label: 'Users & Fleet Directory', path: '/users', icon: Users, permission: 'manage_users' },
    { label: 'Marketing & Promos', path: '/marketing', icon: Megaphone, permission: 'manage_marketing' },
    { label: 'Security & Audit Logs', path: '/settings', icon: Settings, permission: 'view_audit_logs' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 flex-shrink-0">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center space-x-3 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-white font-extrabold text-lg shadow-md font-heading">
          W
        </div>
        <div>
          <h1 className="text-base font-extrabold text-white tracking-tight font-heading">Wunabuy</h1>
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">Staff Portal v2.0</span>
        </div>
      </div>

      {/* Staff Department Pill */}
      {user && (
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800/60 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-300">{user.full_name}</p>
            <p className="text-[9px] font-bold text-teal-400 uppercase tracking-wide">{user.department_name}</p>
          </div>
          <div className="px-2 py-0.5 rounded text-[9px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
            L{user.security_clearance_level} CLEARANCE
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
          DEPARTMENTAL MODULES
        </div>

        {allNavItems.map((item) => {
          const Icon = item.icon;
          const isAllowed = hasPermission(item.permission);

          if (!isAllowed) {
            return (
              <div
                key={item.path}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium text-slate-600 cursor-not-allowed opacity-60"
                title={`Access Restricted (${user?.staff_department_role})`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 text-slate-600" />
                  <span>{item.label}</span>
                </div>
                <Lock className="w-3 h-3 text-slate-600" />
              </div>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                clsx(
                  'flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-teal-600/10 text-teal-400 font-semibold border-l-2 border-teal-500'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                )
              }
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-4.5 h-4.5" />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* System Operational Status */}
      <div className="p-3.5 m-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
        <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>RBAC & Reverb Secured</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1">Douala Node • TLS 1.3 Strict</p>
      </div>
    </aside>
  );
};
