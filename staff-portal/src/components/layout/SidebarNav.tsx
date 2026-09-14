import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileCheck,
  ShieldAlert,
  Users,
  Wallet,
  Settings,
  Megaphone,
  ShieldCheck,
  ChevronRight,
  User,
  MessageSquare,
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

interface NavSection {
  title: string;
  items: NavItemConfig[];
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

  const navSections: NavSection[] = [
    {
      title: 'OPERATIONS',
      items: [
        { label: t('nav.dashboard', 'Executive Overview'), path: '/', icon: LayoutDashboard, permission: 'view_dashboard' },
        { label: t('nav.kyc', 'Store KYC Queue'), path: '/kyc', icon: FileCheck, permission: 'view_kyc' },
        { label: t('nav.disputes', 'Escrow Disputes'), path: '/disputes', icon: ShieldAlert, permission: 'view_disputes' },
        { label: 'Users & Directory', path: '/users', icon: Users, permission: 'manage_users' },
        { label: t('nav.financials', 'Financials & Ledger'), path: '/financials', icon: Wallet, permission: 'view_financials' },
        { label: 'Marketing & Promos', path: '/marketing', icon: Megaphone, permission: 'manage_marketing' },
      ],
    },
    {
      title: 'COMMUNICATIONS',
      items: [
        { label: 'Internal Staff Chat', path: '/communications', icon: MessageSquare, permission: 'view_dashboard' },
        { label: 'Notifications Center', path: '/notifications', icon: Bell, permission: 'view_dashboard', badge: unreadCount },
      ],
    },
    {
      title: 'MANAGEMENT',
      items: [
        { label: t('nav.settings', 'Security & Audit Logs'), path: '/settings', icon: Settings, permission: 'view_audit_logs' },
        { label: t('nav.profile', 'My Staff Profile'), path: '/profile', icon: User, permission: 'view_dashboard' },
      ],
    },
  ];

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between overflow-hidden bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-200 transition-colors border-r border-slate-200/70 dark:border-slate-800/80">
      {/* 1. Fixed Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between flex-shrink-0 border-b border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center space-x-2.5">
          <img
            src="/wunabuy-icon.png"
            alt="Wunabuy Mobile Icon Logo"
            className="w-8 h-8 rounded-lg object-contain shadow-xs border border-teal-500/20 bg-white p-0.5"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div>
            <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight font-heading leading-tight">Wunabuy</h1>
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 block">
              Staff Portal • v2.6
            </span>
          </div>
        </div>

        {/* Mobile Close Button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 2. Scrollable Container: User Profile Card & Grouped Navigation Items */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3.5 py-3 space-y-5">
        {/* Compact Clickable Top User Avatar Profile Card */}
        {user && (
          <div
            onClick={() => {
              navigate('/profile');
              if (onCloseMobile) onCloseMobile();
            }}
            className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-800/60 flex items-center space-x-2.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group"
          >
            <img
              src={user.avatar_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'}
              alt={user.full_name}
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80';
              }}
              className="w-8 h-8 rounded-full object-cover border border-teal-500/40"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                {user.full_name}
              </h4>
              <div className="flex items-center space-x-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  Level {user.security_clearance_level} Clearance
                </span>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        )}

        {/* Grouped Navigation Sections */}
        {navSections.map((section) => {
          const authorizedItems = section.items.filter((item) => hasPermission(item.permission));
          if (authorizedItems.length === 0) return null;

          return (
            <div key={section.title} className="space-y-1">
              <div className="px-2.5 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-sans">
                {section.title}
              </div>

              {authorizedItems.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      clsx(
                        'flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all',
                        isActive
                          ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-semibold shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                      )
                    }
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className="w-4 h-4 opacity-80" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="px-1.5 py-0.2 text-[10px] font-semibold rounded-md bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* 3. Understated Footer Status */}
      <div className="p-2.5 m-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-2 text-[11px] font-medium text-slate-600 dark:text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span>Douala Node • Secure</span>
        </div>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
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
