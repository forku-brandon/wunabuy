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
  ChevronRight,
  X,
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

export interface SidebarNavProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  mobileOpen = false,
  onCloseMobile,
}) => {
  const { user, hasPermission } = useStaffAuth();

  const allNavItems: NavItemConfig[] = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard, permission: 'view_dashboard' },
    { label: 'Internal Chat & Broadcasts', path: '/communications', icon: Megaphone, permission: 'view_dashboard', badge: 3 },
    { label: 'Store KYC Queue', path: '/kyc', icon: FileCheck, permission: 'view_kyc', badge: 4 },
    { label: 'Escrow Disputes', path: '/disputes', icon: ShieldAlert, permission: 'view_disputes', badge: 2 },
    { label: 'Logistics & Fleet Ops', path: '/logistics', icon: Truck, permission: 'view_logistics', badge: 12 },
    { label: 'Financials & Payouts', path: '/financials', icon: Wallet, permission: 'view_financials' },
    { label: 'Users & Directory', path: '/users', icon: Users, permission: 'manage_users' },
    { label: 'Marketing & Promos', path: '/marketing', icon: Megaphone, permission: 'manage_marketing' },
    { label: 'Security & Audit Logs', path: '/settings', icon: Settings, permission: 'view_audit_logs' },
  ];


  // STRICT SECURITY FILTER: Completely hide unauthorized navigation items
  const authorizedNavItems = allNavItems.filter((item) => hasPermission(item.permission));

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between">
      <div>
        {/* Brand Header */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-slate-100/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 flex items-center justify-center text-white font-extrabold text-xl shadow-md font-heading border-2 border-teal-400">
              W
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900 tracking-tight font-heading">Wunabuy</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 block -mt-0.5">
                Staff Portal v2.0
              </span>
            </div>
          </div>

          {/* Mobile Close Button */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Top User Avatar Profile Card */}
        {user && (
          <div className="p-4 mx-4 my-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center space-x-3">
            <img
              src={user.avatar_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'}
              alt={user.full_name}
              className="w-10 h-10 rounded-full object-cover border-2 border-teal-500 shadow-sm"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-extrabold text-slate-900 truncate">Hello, {user.full_name.split(' ')[0]}</h4>
              <p className="text-[10px] font-semibold text-slate-400 truncate">{user.email}</p>
              <span className="inline-block mt-0.5 text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-teal-100 text-teal-800">
                L{user.security_clearance_level} CLEARANCE
              </span>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="px-4 py-2 space-y-1.5">
          <div className="px-3 mb-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            MAIN MANAGEMENT ({authorizedNavItems.length})
          </div>

          {authorizedNavItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all',
                    isActive
                      ? 'bg-teal-50 text-teal-700 font-extrabold border-l-4 border-teal-600 shadow-sm'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  )
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4.5 h-4.5" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined ? (
                  <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    {item.badge}
                  </span>
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer System Operational Status */}
      <div className="p-3.5 m-4 rounded-2xl bg-teal-50/60 border border-teal-100">
        <div className="flex items-center space-x-2 text-teal-700 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>WSS Node Secured</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1 font-medium">Douala Node • TLS 1.3 Strict</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar (visible on lg: screen size > 1024px) */}
      <aside className="hidden lg:flex w-64 bg-white text-slate-700 flex-col border-r border-slate-100 shadow-sm flex-shrink-0 z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-out Overlay Drawer (visible on screens < 1024px) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Dark Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Slide-out Drawer Panel */}
          <aside className="fixed inset-y-0 left-0 w-72 bg-white text-slate-700 flex flex-col shadow-2xl z-50">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
