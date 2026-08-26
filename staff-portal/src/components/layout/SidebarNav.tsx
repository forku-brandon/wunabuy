import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileCheck,
  ShieldAlert,
  Users,
  Wallet,
  Settings,
  Shield,
} from 'lucide-react';
import { clsx } from 'clsx';

export const SidebarNav: React.FC = () => {
  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Store KYC Queue', path: '/kyc', icon: FileCheck, badge: 3 },
    { label: 'Escrow Disputes', path: '/disputes', icon: ShieldAlert, badge: 1 },
    { label: 'User & Fleet Directory', path: '/users', icon: Users },
    { label: 'Financials & Payouts', path: '/financials', icon: Wallet },
    { label: 'Settings', path: '/settings', icon: Settings },
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
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">Staff Portal v1.0</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
          MAIN MANAGEMENT
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                clsx(
                  'flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-teal-600/10 text-teal-400 font-semibold border-l-2 border-teal-500'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                )
              }
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* System Operational Status */}
      <div className="p-4 m-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
        <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold">
          <Shield className="w-4 h-4" />
          <span>Reverb WebSocket Connected</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Douala Node • Port 443 WSS</p>
      </div>
    </aside>
  );
};

