import React, { useState } from 'react';
import { Search, Bell, LogOut, ShieldCheck, UserCheck, ChevronDown, Calendar, MessageSquare, Gift, Settings } from 'lucide-react';
import { useStaffAuth, DEMO_STAFF_PERSONAS } from '../../stores/staffAuthStore';

export const Header: React.FC = () => {
  const { user, logout, switchPersona } = useStaffAuth();
  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className="h-20 bg-white border-b border-slate-100 px-8 flex items-center justify-between flex-shrink-0 relative z-30 shadow-xs">
      {/* Left: Rounded Pill Search Bar */}
      <div className="w-96 relative">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Find something here (orders, store KYC, users)..."
          className="w-full pl-11 pr-4 py-2.5 text-xs bg-slate-100/80 border-none rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-medium"
        />
      </div>

      {/* Center: Top Bar Quick Navigation Links */}
      <div className="hidden xl:flex items-center space-x-6 text-xs font-bold text-slate-500">
        <span className="hover:text-slate-900 cursor-pointer">Socials</span>
        <span className="flex items-center text-teal-600 font-extrabold cursor-pointer">
          <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
          Live Node
        </span>
        <span className="hover:text-slate-900 cursor-pointer">Reports</span>
        <span className="hover:text-slate-900 cursor-pointer">Escrow Ledger</span>
      </div>

      {/* Right: Actions Group (Icons with Number Badges, Date Filter Pill, Persona Switcher) */}
      <div className="flex items-center space-x-3">
        {/* Date Filter Pill Button (Inspired by Reference Design "Filter Periode") */}
        <button className="hidden sm:flex items-center space-x-2 px-4 py-2 rounded-full bg-teal-600 text-white text-xs font-bold shadow-sm hover:bg-teal-700 transition-colors">
          <Calendar className="w-3.5 h-3.5" />
          <span>Filter Period</span>
        </button>

        {/* Action Icon 1: Bell Notifications (Badge: 12) */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="w-10 h-10 rounded-full bg-slate-100/80 hover:bg-slate-200/80 flex items-center justify-center text-slate-600 relative transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-teal-600 text-white font-extrabold text-[10px] rounded-full flex items-center justify-center shadow-xs">
              12
            </span>
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 py-3 z-50">
              <div className="px-5 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900 font-heading">Operational Alerts</span>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 bg-red-100 text-red-700 rounded-full">
                  3 NEW
                </span>
              </div>
              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                <div className="p-4 text-xs hover:bg-slate-50">
                  <p className="font-bold text-slate-800">🚨 High-Value Payout Approval</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">Seller requested 850,000 FCFA payout to MTN MoMo.</p>
                  <span className="text-[10px] text-slate-400">10 mins ago</span>
                </div>
                <div className="p-4 text-xs hover:bg-slate-50">
                  <p className="font-bold text-slate-800">📄 Store KYC Document Submitted</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">Douala Tech Hub uploaded CNI &amp; Storefront photos.</p>
                  <span className="text-[10px] text-slate-400">25 mins ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Icon 2: Chat Messages (Badge: 5) */}
        <button className="w-10 h-10 rounded-full bg-slate-100/80 hover:bg-slate-200/80 flex items-center justify-center text-slate-600 relative transition-colors">
          <MessageSquare className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white font-extrabold text-[10px] rounded-full flex items-center justify-center shadow-xs">
            5
          </span>
        </button>

        {/* Action Icon 3: Rewards/Gifts (Badge: 2) */}
        <button className="w-10 h-10 rounded-full bg-slate-100/80 hover:bg-slate-200/80 flex items-center justify-center text-slate-600 relative transition-colors">
          <Gift className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white font-extrabold text-[10px] rounded-full flex items-center justify-center shadow-xs">
            2
          </span>
        </button>

        <div className="h-6 w-px bg-slate-200 mx-1" />

        {/* DEMO RBAC PERSONA SWITCHER DROPDOWN */}
        <div className="relative">
          <button
            onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-full bg-teal-50 border border-teal-200 text-teal-900 text-xs font-bold hover:bg-teal-100 transition-colors"
          >
            <UserCheck className="w-4 h-4 text-teal-600" />
            <span>Role: <strong className="font-extrabold">{user?.staff_department_role}</strong></span>
            <ChevronDown className="w-3.5 h-3.5 text-teal-600" />
          </button>

          {isPersonaMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-3xl shadow-2xl border border-slate-100 py-3 z-50">
              <div className="px-5 py-2 border-b border-slate-100">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
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
                  className={`w-full text-left px-5 py-3 flex items-start space-x-3 hover:bg-slate-50 transition-colors ${
                    user?.id === persona.id ? 'bg-teal-50/70 border-l-4 border-teal-500' : ''
                  }`}
                >
                  <img
                    src={persona.avatar_url || ''}
                    alt={persona.full_name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200 mt-0.5"
                  />
                  <div>
                    <p className="text-xs font-extrabold text-slate-900">{persona.full_name}</p>
                    <p className="text-[10px] font-bold text-teal-600">{persona.department_name}</p>
                    <span className="inline-block mt-0.5 text-[9px] font-mono font-bold px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                      {persona.staff_department_role} (L{persona.security_clearance_level})
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          title="Sign out of Staff Portal"
          className="w-10 h-10 rounded-full bg-slate-100/80 hover:bg-red-50 hover:text-red-600 flex items-center justify-center text-slate-500 transition-colors ml-1"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
