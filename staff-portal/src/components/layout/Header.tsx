import React from 'react';
import { Search, Bell, LogOut, ShieldCheck } from 'lucide-react';
import { useStaffAuth } from '../../stores/staffAuthStore';

export const Header: React.FC = () => {
  const { user, logout } = useStaffAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between flex-shrink-0">
      {/* Global Search Bar */}
      <div className="w-96 relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search orders, store KYC, users, or dispute IDs..."
          className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-colors"
        />
      </div>

      {/* User & Notifications Action Group */}
      <div className="flex items-center space-x-4">
        {/* Notification Icon */}
        <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg relative transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div className="h-6 w-px bg-slate-200" />

        {/* Staff User Avatar Card */}
        <div className="flex items-center space-x-3">
          <img
            src={user?.avatar_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'}
            alt={user?.full_name || 'Staff User'}
            className="w-9 h-9 rounded-full object-cover border border-slate-200"
          />
          <div className="text-left">
            <div className="flex items-center space-x-1">
              <span className="text-xs font-bold text-slate-900">{user?.full_name}</span>
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            </div>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
              Platform Admin
            </span>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          title="Sign out of Staff Portal"
          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-2"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
