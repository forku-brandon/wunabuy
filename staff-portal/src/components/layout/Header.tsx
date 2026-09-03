import React, { useState } from 'react';
import {
  Search,
  Bell,
  LogOut,
  UserCheck,
  ChevronDown,
  Calendar,
  MessageSquare,
  Menu,
  Send,
  Sun,
  Moon,
} from 'lucide-react';
import { useStaffAuth, DEMO_STAFF_PERSONAS } from '../../stores/staffAuthStore';
import { useTheme } from '../../context/ThemeContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export interface HeaderProps {
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar }) => {
  const { user, logout, switchPersona, addAuditLog } = useStaffAuth();
  const { theme, toggleTheme } = useTheme();
  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);

  // Header Interactive Modals & Drawers State
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [filterPeriodOpen, setFilterPeriodOpen] = useState(false);

  const [selectedPeriod, setSelectedPeriod] = useState('This Week (2026)');
  const [notificationsCount, setNotificationsCount] = useState(12);
  const [chatMessageInput, setChatMessageInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'Douala Tech Hub (Merchant)', text: 'Hello staff support, my payout of 850k FCFA is pending.', time: '10 mins ago' },
    { sender: 'Jean-Paul Nkoum (Rider)', text: 'Arrived at Akwa store for pickup #WB-TRIP-9842.', time: '25 mins ago' },
  ]);

  const handleMarkAllRead = () => {
    setNotificationsCount(0);
    addAuditLog({
      action_code: 'NOTIFICATIONS_MARK_READ',
      action_description: 'Marked all system notifications as read',
      security_level: 'INFO',
    });
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessageInput.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      { sender: `Staff (${user?.full_name})`, text: chatMessageInput, time: 'Just now' },
    ]);
    setChatMessageInput('');
  };

  return (
    <header className="h-16 bg-white dark:bg-[#151C28] border-b border-slate-100 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between flex-shrink-0 relative z-30 shadow-xs transition-colors">
      {/* Left: Mobile Menu Toggle + Clean Compact Search Bar */}
      <div className="flex items-center space-x-3">
        {/* Mobile Hamburger Toggle Button */}
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            title="Open Mobile Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Clean Compact Search Bar */}
        <div className="w-44 sm:w-64 lg:w-80 relative">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search orders, KYC..."
            className="w-full pl-9 pr-3 py-1.5 sm:py-2 text-xs bg-slate-100/80 dark:bg-slate-800/80 border-none rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium transition-all"
          />
        </div>
      </div>

      {/* Right: Streamlined Action Buttons */}
      <div className="flex items-center space-x-2.5">
        {/* Theme Switcher Toggle Button (Sun / Moon) */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-full bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 flex items-center justify-center text-slate-700 dark:text-slate-200 transition-colors"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4 text-slate-700" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400" />
          )}
        </button>

        {/* Date Filter Pill Button */}
        <button
          onClick={() => setFilterPeriodOpen(true)}
          className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-bold hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-colors shadow-xs"
        >
          <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span>{selectedPeriod}</span>
        </button>

        {/* Action Icon 1: Support Chat */}
        <button
          onClick={() => setChatOpen(true)}
          className="w-9 h-9 rounded-full bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 flex items-center justify-center text-slate-600 dark:text-slate-300 relative transition-colors"
          title="Staff Support Chat"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-600 text-white font-extrabold text-[9px] rounded-full flex items-center justify-center shadow-xs">
            5
          </span>
        </button>

        {/* Action Icon 2: Bell Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="w-9 h-9 rounded-full bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 flex items-center justify-center text-slate-600 dark:text-slate-300 relative transition-colors"
            title="Notifications & Operational Alerts"
          >
            <Bell className="w-4 h-4" />
            {notificationsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-teal-600 text-white font-extrabold text-[9px] rounded-full flex items-center justify-center shadow-xs">
                {notificationsCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-[#151C28] rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 py-3 z-50">
              <div className="px-5 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100 font-heading">Operational Alerts</span>
                {notificationsCount > 0 ? (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] font-extrabold px-2.5 py-0.5 bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 rounded-full hover:bg-teal-200 transition-colors"
                  >
                    Mark All Read
                  </button>
                ) : (
                  <span className="text-[10px] text-slate-400 font-bold">ALL READ</span>
                )}
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-64 overflow-y-auto">
                <div className="p-4 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <p className="font-bold text-slate-800 dark:text-slate-200">🚨 High-Value Payout Approval</p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">Seller requested 850,000 FCFA payout to MTN MoMo.</p>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">10 mins ago</span>
                </div>
                <div className="p-4 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <p className="font-bold text-slate-800 dark:text-slate-200">📄 Store KYC Document Submitted</p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">Douala Tech Hub uploaded CNI &amp; Storefront photos.</p>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">25 mins ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />

        {/* DEMO RBAC PERSONA SWITCHER DROPDOWN */}
        <div className="relative">
          <button
            onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-[11px] sm:text-xs font-bold transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span className="hidden md:inline">Role: <strong className="font-extrabold">{user?.staff_department_role}</strong></span>
            <span className="md:hidden font-extrabold">{user?.staff_department_role.split('_')[0]}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isPersonaMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#151C28] rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 py-3 z-50">
              <div className="px-5 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
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
                  className={`w-full text-left px-5 py-3 flex items-start space-x-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                    user?.id === persona.id ? 'bg-teal-50/70 dark:bg-teal-950/40 border-l-4 border-teal-500' : ''
                  }`}
                >
                  <img
                    src={persona.avatar_url || ''}
                    alt={persona.full_name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 mt-0.5"
                  />
                  <div>
                    <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100">{persona.full_name}</p>
                    <p className="text-[10px] font-bold text-teal-600 dark:text-teal-400">{persona.department_name}</p>
                    <span className="inline-block mt-0.5 text-[9px] font-mono font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md">
                      {persona.staff_department_role} (L{persona.security_clearance_level})
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Logout Icon Button */}
        <button
          onClick={logout}
          title="Sign out of Staff Portal"
          className="w-9 h-9 rounded-full bg-slate-100/80 dark:bg-slate-800/80 hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-600 dark:hover:text-red-400 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* DATE PERIOD FILTER MODAL */}
      <Modal isOpen={filterPeriodOpen} onClose={() => setFilterPeriodOpen(false)} title="Select Operational Telemetry Period">
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 dark:text-slate-400 font-medium">Select timeframe to aggregate platform GMV, escrow ledgers, and rider dispatches:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {['Today (Live 24h)', 'This Week (2026)', 'This Month (August)', 'Quarter 3 (2026)'].map((p) => (
              <button
                key={p}
                onClick={() => {
                  setSelectedPeriod(p);
                  setFilterPeriodOpen(false);
                }}
                className={`p-3 rounded-2xl border text-left font-bold transition-all ${
                  selectedPeriod === p
                    ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-900 dark:text-teal-200 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* STAFF INTERNAL SUPPORT CHAT MODAL */}
      <Modal isOpen={chatOpen} onClose={() => setChatOpen(false)} title="Staff Internal Support & Merchant Dispatch Chat">
        <div className="space-y-4 text-xs">
          <div className="h-56 overflow-y-auto p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            {chatMessages.map((m, idx) => (
              <div key={idx} className="p-3 bg-white dark:bg-[#151C28] rounded-xl border border-slate-100 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-slate-900 dark:text-slate-100">{m.sender}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{m.time}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300">{m.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendChatMessage} className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Type message to merchant or driver..."
              value={chatMessageInput}
              onChange={(e) => setChatMessageInput(e.target.value)}
              className="flex-1 p-2.5 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-slate-100"
            />
            <Button type="submit" variant="primary" size="sm" disabled={!chatMessageInput.trim()}>
              <Send className="w-3.5 h-3.5 mr-1" />
              Reply
            </Button>
          </form>
        </div>
      </Modal>
    </header>
  );
};
