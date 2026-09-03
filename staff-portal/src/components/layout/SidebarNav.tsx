import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
  User,
  Briefcase,
  Calendar as CalendarIcon,
  X,
  Bell,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useStaffAuth, StaffPermission } from '../../stores/staffAuthStore';
import { useNotifications } from '../../stores/notificationsStore';
import { useLanguage } from '../../context/LanguageContext';

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
  const { unreadCount } = useNotifications();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const allNavItems: NavItemConfig[] = [
    { label: t('nav.dashboard', 'Executive Overview'), path: '/', icon: LayoutDashboard, permission: 'view_dashboard' },
    { label: 'Notifications Center', path: '/notifications', icon: Bell, permission: 'view_dashboard', badge: unreadCount },
    { label: t('nav.profile', 'My Staff Profile'), path: '/profile', icon: User, permission: 'view_dashboard' },
    { label: 'Internal Chat & Broadcasts', path: '/communications', icon: Megaphone, permission: 'view_dashboard', badge: 3 },
    { label: t('nav.hr_ops', 'HR & Staff Operations'), path: '/hr', icon: Briefcase, permission: 'view_hr_ops' },
    { label: t('nav.kyc', 'Store KYC Queue'), path: '/kyc', icon: FileCheck, permission: 'view_kyc', badge: 4 },
    { label: t('nav.disputes', 'Escrow Disputes'), path: '/disputes', icon: ShieldAlert, permission: 'view_disputes', badge: 2 },
    { label: t('nav.logistics', 'Logistics & Fleet Ops'), path: '/logistics', icon: Truck, permission: 'view_logistics', badge: 12 },
    { label: t('nav.financials', 'Financials & Ledger'), path: '/financials', icon: Wallet, permission: 'view_financials' },
    { label: 'Users & Directory', path: '/users', icon: Users, permission: 'manage_users' },
    { label: 'Marketing & Promos', path: '/marketing', icon: Megaphone, permission: 'manage_marketing' },
    { label: t('nav.settings', 'Security & Audit Logs'), path: '/settings', icon: Settings, permission: 'view_audit_logs' },
  ];

  // STRICT SECURITY FILTER: Completely hide unauthorized navigation items
  const authorizedNavItems = allNavItems.filter((item) => hasPermission(item.permission));

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between overflow-hidden bg-white dark:bg-[#121824] text-slate-700 dark:text-slate-200 transition-colors">
      {/* 1. Fixed Brand Header */}
      <div className="h-20 px-6 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <img
            src="/wunabuy-icon.png"
            alt="Wunabuy Mobile Icon Logo"
            className="w-10 h-10 rounded-xl object-contain shadow-2xs border border-teal-500/20 bg-white p-0.5"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div>
            <h1 className="text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-tight font-heading">Wunabuy</h1>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 block -mt-0.5 font-mono">
              Staff Portal v2.6
            </span>
          </div>
        </div>

        {/* Mobile Close Button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-2 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 2. Scrollable Container: User Profile Card & Navigation Items */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-2 space-y-4">
        {/* Clickable Top User Avatar Profile Card */}
        {user && (
          <div
            onClick={() => {
              navigate('/profile');
              if (onCloseMobile) onCloseMobile();
            }}
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center space-x-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-2xs group"
          >
            <img
              src={user.avatar_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'}
              alt={user.full_name}
              className="w-9 h-9 rounded-full object-cover border-2 border-teal-500 shadow-2xs"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                Hello, {user.full_name.split(' ')[0]}
              </h4>
              <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 truncate">{user.email}</p>
              <span className="inline-block mt-0.5 text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300">
                L{user.security_clearance_level} CLEARANCE
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:translate-x-0.5 transition-transform" />
          </div>
        )}

        {/* Navigation Links */}
        <nav className="space-y-1">
          <div className="px-3 mb-2 text-[10px] font-mono font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
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
                    'flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all',
                    isActive
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-extrabold shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                  )
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined ? (
                  <span className="px-2 py-0.5 text-[10px] font-mono font-extrabold rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                    {item.badge}
                  </span>
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* 3. Fixed Footer System Operational Status */}
      <div className="p-3 m-4 rounded-xl bg-teal-50/60 dark:bg-teal-950/40 flex-shrink-0">
        <div className="flex items-center space-x-2 text-teal-700 dark:text-teal-300 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>WSS Node Secured</span>
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-mono font-medium">Douala Node • TLS 1.3 Strict</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex w-64 h-screen bg-white dark:bg-[#121824] text-slate-700 dark:text-slate-200 flex-col shadow-2xs flex-shrink-0 z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-out Overlay Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Dark Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Slide-out Drawer Panel */}
          <aside className="fixed inset-y-0 left-0 w-72 h-screen bg-white dark:bg-[#121824] text-slate-700 dark:text-slate-200 flex flex-col shadow-2xl z-50">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
