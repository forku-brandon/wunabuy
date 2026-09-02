import React, { useState } from 'react';
import { Search, Bell, LogOut, ShieldCheck, UserCheck, ChevronDown } from 'lucide-react';
import { useStaffAuth, DEMO_STAFF_PERSONAS } from '../../stores/staffAuthStore';

export const Header: React.FC = () => {
  const { user, logout, switchPersona } = useStaffAuth();
  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between flex-shrink-0 relative z-30">
      {/* Global Search Bar */}
      <div className="w-96 relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search orders, store KYC, users, or dispute IDs..."
          className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-colors"
        />
      </div>

      {/* Right Controls: Persona Switcher, Notifications, User Card */}
      <div className="flex items-center space-x-4">
        {/* DEMO RBAC PERSONA SWITCHER */}
        <div className="relative">
          <button
            onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold hover:bg-teal-100 transition-colors"
          >
            <UserCheck className="w-4 h-4 text-teal-600" />
            <span>Switch Role: <strong className="font-extrabold">{user?.staff_department_role}</strong></span>
            <ChevronDown className="w-3.5 h-3.5 text-teal-600" />
          </button>

          {isPersonaMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  TEST RBAC STAFF PERSONAS
                </p>
              </div>

              {DEMO_STAFF_PERSONAS.map((persona) => (
                <button
                  key={persona.id}
                  onClick={() => {
                    switchPersona(persona.id);
                    setIsPersonaMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 flex items-start space-x-3 hover:bg-slate-50 transition-colors ${
                    user?.id === persona.id ? 'bg-teal-50/70 border-l-4 border-teal-500' : ''
                  }`}
                >
                  <img
                    src={persona.avatar_url || ''}
                    alt={persona.full_name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200 mt-0.5"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">{persona.full_name}</p>
                    <p className="text-[10px] font-semibold text-teal-600">{persona.department_name}</p>
                    <span className="inline-block mt-0.5 text-[9px] font-mono font-semibold px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                      {persona.staff_department_role} (L{persona.security_clearance_level})
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200" />

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg relative transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Security & Operational Alerts</span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-600 rounded-full">
                  3 NEW
                </span>
              </div>
              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                <div className="p-3 text-xs hover:bg-slate-50">
                  <p className="font-semibold text-slate-800">🚨 High-Value Payout Approval</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">Seller requested 850,000 FCFA payout to MTN MoMo.</p>
                  <span className="text-[10px] text-slate-400">10 mins ago</span>
                </div>
                <div className="p-3 text-xs hover:bg-slate-50">
                  <p className="font-semibold text-slate-800">📄 Store KYC Document Submitted</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">Douala Tech Hub uploaded CNI & Storefront photos.</p>
                  <span className="text-[10px] text-slate-400">25 mins ago</span>
                </div>
                <div className="p-3 text-xs hover:bg-slate-50">
                  <p className="font-semibold text-slate-800">⚖️ Escrow Dispute Escalated</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">Buyer claims wrong item received for Order #WB-2026-9842.</p>
                  <span className="text-[10px] text-slate-400">1 hour ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200" />

        {/* Active Staff User Avatar Card */}
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
              {user?.department_name}
            </span>
          </div>
        </div>

        {/* Logout Button */}
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
