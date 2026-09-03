import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  CalendarDays,
  ShieldCheck,
  Settings,
  User,
  Globe,
} from 'lucide-react';
import { useStaffAuth, DEMO_STAFF_PERSONAS } from '../../stores/staffAuthStore';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export interface HeaderProps {
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar }) => {
  const { user, logout, switchPersona, addAuditLog } = useStaffAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

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
    <header className="h-16 bg-white dark:bg-[#121824] px-4 sm:px-6 flex items-center justify-between flex-shrink-0 relative z-30 shadow-2xs transition-colors">
      {/* Left: Mobile Menu Toggle + Clean Compact Search Bar */}
      <div className="flex items-center space-x-3">
        {/* Mobile Hamburger Toggle Button */}
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Open Mobile Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Clean Compact Search Bar */}
        <div className="w-44 sm:w-64 lg:w-80 relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search orders, KYC..."
            className="w-full pl-8 pr-3 py-1.5 sm:py-2 text-xs bg-slate-100/80 dark:bg-slate-800/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium transition-all"
          />
        </div>
      </div>

      {/* Right: Streamlined Action Buttons */}
      <div className="flex items-center space-x-2.5">
        {/* Language Switcher Pill Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs font-extrabold transition-colors"
            title="Switch Platform System Language (English / Français)"
          >
            <Globe className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span className="uppercase tracking-wider">{language === 'en' ? 'EN 🇬🇧' : 'FR 🇫🇷'}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isLangMenuOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-[#121824] rounded-xl shadow-xl py-2 z-50 animate-fade-in border border-slate-100 dark:border-slate-800">
              <div className="px-3 py-1 text-[10px] font-mono font-extrabold uppercase text-slate-400 tracking-wider">
                SELECT LANGUAGE / LANGUE
              </div>
              <button
                onClick={() => {
                  setLanguage('en');
                  setIsLangMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 font-bold ${
                  language === 'en' ? 'text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 font-extrabold' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>🇬🇧 English (EN)</span>
                {language === 'en' && <UserCheck className="w-3.5 h-3.5 text-teal-600" />}
              </button>
              <button
                onClick={() => {
                  setLanguage('fr');
                  setIsLangMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 font-bold ${
                  language === 'fr' ? 'text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 font-extrabold' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>🇫🇷 Français (FR)</span>
                {language === 'fr' && <UserCheck className="w-3.5 h-3.5 text-teal-600" />}
              </button>
            </div>
          )}
        </div>

        {/* Theme Switcher Toggle Button (Sun / Moon) */}
        <button
          onClick={toggleTheme}
          className="w-8 h-8 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 flex items-center justify-center text-slate-700 dark:text-slate-200 transition-colors"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4 text-slate-700" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400" />
          )}
        </button>

        {/* Calendar & Operational Tasks Header Button */}
        <button
          onClick={() => navigate('/calendar')}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-2xs"
          title="Open Operational Calendar & Task Manager"
        >
          <CalendarDays className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Calendar &amp; Tasks</span>
        </button>

        {/* Date Filter Pill Button */}
        <button
          onClick={() => setFilterPeriodOpen(true)}
          className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 text-xs font-bold hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-colors shadow-2xs"
        >
          <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span>{selectedPeriod}</span>
        </button>

        {/* Action Icon 1: Support Chat */}
        <button
          onClick={() => setChatOpen(true)}
          className="w-8 h-8 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 flex items-center justify-center text-slate-600 dark:text-slate-300 relative transition-colors"
          title="Staff Support Chat"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-600 text-white font-extrabold text-[9px] rounded-full flex items-center justify-center shadow-2xs">
            5
          </span>
        </button>

        {/* Action Icon 2: Operational Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="w-8 h-8 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 flex items-center justify-center text-slate-600 dark:text-slate-300 relative transition-colors"
            title="System Notifications"
          >
            <Bell className="w-4 h-4" />
            {notificationsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-amber-500 text-slate-950 font-extrabold text-[9px] rounded-full flex items-center justify-center shadow-2xs">
                {notificationsCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-[#121824] rounded-xl shadow-2xl py-3 z-50 animate-fade-in">
              <div className="px-4 py-2 flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100 font-heading">Operational Alerts</span>
                {notificationsCount > 0 ? (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] font-extrabold px-2 py-0.5 bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 rounded hover:bg-teal-200 transition-colors"
                  >
                    Mark All Read
                  </button>
                ) : (
                  <span className="text-[10px] text-slate-400 font-bold">ALL READ</span>
                )}
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-64 overflow-y-auto">
                <div className="p-3.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <p className="font-bold text-slate-800 dark:text-slate-200">🚨 High-Value Payout Approval</p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">Seller requested 850,000 FCFA payout to MTN MoMo.</p>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">10 mins ago</span>
                </div>
                <div className="p-3.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <p className="font-bold text-slate-800 dark:text-slate-200">📄 Store KYC Document Submitted</p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">Douala Tech Hub uploaded CNI &amp; Storefront photos.</p>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">25 mins ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />

        {/* User Persona Switcher & Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
            className="flex items-center space-x-2 pl-2 pr-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <img
              src={user?.avatar_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80'}
              alt={user?.full_name}
              className="w-7 h-7 rounded-full object-cover border border-teal-500"
            />
            <span className="hidden md:block text-xs font-extrabold text-slate-900 dark:text-slate-100 max-w-[120px] truncate">
              {user?.full_name?.split(' ')[0]}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          </button>

          {/* Persona Switcher Dropdown */}
          {isPersonaMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#121824] rounded-xl shadow-xl py-2 z-50 animate-fade-in">
              <div className="px-4 py-2">
                <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100">{user?.full_name}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate">{user?.email}</p>
                <span className="inline-block mt-1 text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300">
                  {user?.staff_department_role} (Level {user?.security_clearance_level})
                </span>
              </div>

              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 space-y-1">
                <button
                  onClick={() => {
                    setIsPersonaMenuOpen(false);
                    navigate('/settings');
                  }}
                  className="w-full py-1.5 px-2 bg-purple-50 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200 rounded-lg text-xs font-bold flex items-center space-x-2 hover:bg-purple-100 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                  <span>Security &amp; Audit Logs</span>
                </button>

                <button
                  onClick={() => {
                    setIsPersonaMenuOpen(false);
                    navigate('/profile');
                  }}
                  className="w-full py-1.5 px-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold flex items-center space-x-2 hover:bg-slate-100 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-teal-600" />
                  <span>My Staff Profile</span>
                </button>
              </div>

              <div className="px-4 py-1.5 text-[10px] font-mono font-extrabold uppercase text-slate-400 tracking-wider">
                SWITCH QA STAFF PERSONA
              </div>

              <div className="max-h-48 overflow-y-auto">
                {DEMO_STAFF_PERSONAS.map((persona) => (
                  <button
                    key={persona.id}
                    onClick={() => {
                      switchPersona(persona.id);
                      setIsPersonaMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 ${
                      user?.id === persona.id ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-extrabold' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-bold">{persona.full_name}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{persona.department_name}</div>
                    </div>
                    {user?.id === persona.id && <UserCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />}
                  </button>
                ))}
              </div>

              <div className="pt-1 mt-1">
                <button
                  onClick={() => {
                    setIsPersonaMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center space-x-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out Session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FILTER PERIOD MODAL */}
      <Modal
        isOpen={filterPeriodOpen}
        onClose={() => setFilterPeriodOpen(false)}
        title="Filter Dashboard Time Range"
      >
        <div className="space-y-3 text-xs">
          {['Today (Live)', 'This Week (2026)', 'This Month (August 2026)', 'Quarter 3 (2026)', 'All Time'].map((period) => (
            <button
              key={period}
              onClick={() => {
                setSelectedPeriod(period);
                setFilterPeriodOpen(false);
              }}
              className={`w-full text-left p-3 rounded-lg font-bold flex items-center justify-between ${
                selectedPeriod === period
                  ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300'
                  : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span>{period}</span>
              {selectedPeriod === period && <UserCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />}
            </button>
          ))}
        </div>
      </Modal>

      {/* SUPPORT CHAT MODAL */}
      <Modal
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        title="Internal Staff Operational Chat"
      >
        <div className="space-y-4">
          <div className="h-64 overflow-y-auto space-y-2 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg text-xs">
            {chatMessages.map((msg, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-white dark:bg-[#121824] shadow-2xs">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  <span>{msg.sender}</span>
                  <span className="font-mono">{msg.time}</span>
                </div>
                <p className="text-slate-800 dark:text-slate-200 font-medium">{msg.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendChatMessage} className="flex space-x-2">
            <input
              type="text"
              value={chatMessageInput}
              onChange={(e) => setChatMessageInput(e.target.value)}
              placeholder="Type internal staff message..."
              className="flex-1 p-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-xs font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
            <Button type="submit" variant="primary" size="sm">
              <Send className="w-3.5 h-3.5 mr-1" />
              Send
            </Button>
          </form>
        </div>
      </Modal>
    </header>
  );
};
