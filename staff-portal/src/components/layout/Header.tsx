import React, { useState } from 'react';
import { Search, Bell, LogOut, ShieldCheck, UserCheck, ChevronDown, Calendar, MessageSquare, Gift, Settings, CheckCircle2, Send } from 'lucide-react';
import { useStaffAuth, DEMO_STAFF_PERSONAS } from '../../stores/staffAuthStore';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export const Header: React.FC = () => {
  const { user, logout, switchPersona, addAuditLog } = useStaffAuth();
  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);
  
  // Header Interactive Modals & Drawers State
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [rewardsOpen, setRewardsOpen] = useState(false);
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
        <span className="hover:text-slate-900 cursor-pointer" onClick={() => setChatOpen(true)}>Support Chat</span>
        <span className="flex items-center text-teal-600 font-extrabold cursor-pointer" onClick={() => setFilterPeriodOpen(true)}>
          <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
          Live Node ({selectedPeriod})
        </span>
        <span className="hover:text-slate-900 cursor-pointer" onClick={() => setRewardsOpen(true)}>Rewards Engine</span>
      </div>

      {/* Right: Actions Group */}
      <div className="flex items-center space-x-3">
        {/* Date Filter Pill Button */}
        <button
          onClick={() => setFilterPeriodOpen(true)}
          className="hidden sm:flex items-center space-x-2 px-4 py-2 rounded-full bg-teal-600 text-white text-xs font-bold shadow-sm hover:bg-teal-700 transition-colors"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>{selectedPeriod}</span>
        </button>

        {/* Action Icon 1: Bell Notifications (Badge) */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="w-10 h-10 rounded-full bg-slate-100/80 hover:bg-slate-200/80 flex items-center justify-center text-slate-600 relative transition-colors"
          >
            <Bell className="w-4 h-4" />
            {notificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-teal-600 text-white font-extrabold text-[10px] rounded-full flex items-center justify-center shadow-xs">
                {notificationsCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 py-3 z-50">
              <div className="px-5 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900 font-heading">Operational Alerts</span>
                {notificationsCount > 0 ? (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] font-extrabold px-2.5 py-0.5 bg-teal-100 text-teal-800 rounded-full hover:bg-teal-200 transition-colors"
                  >
                    Mark All Read
                  </button>
                ) : (
                  <span className="text-[10px] text-slate-400 font-bold">ALL READ</span>
                )}
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
        <button
          onClick={() => setChatOpen(true)}
          className="w-10 h-10 rounded-full bg-slate-100/80 hover:bg-slate-200/80 flex items-center justify-center text-slate-600 relative transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white font-extrabold text-[10px] rounded-full flex items-center justify-center shadow-xs">
            5
          </span>
        </button>

        {/* Action Icon 3: Rewards/Gifts (Badge: 2) */}
        <button
          onClick={() => setRewardsOpen(true)}
          className="w-10 h-10 rounded-full bg-slate-100/80 hover:bg-slate-200/80 flex items-center justify-center text-slate-600 relative transition-colors"
        >
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

      {/* DATE PERIOD FILTER MODAL */}
      <Modal isOpen={filterPeriodOpen} onClose={() => setFilterPeriodOpen(false)} title="Select Operational Telemetry Period">
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 font-medium">Select timeframe to aggregate platform GMV, escrow ledgers, and rider dispatches:</p>
          <div className="grid grid-cols-2 gap-3">
            {['Today (Live 24h)', 'This Week (2026)', 'This Month (August)', 'Quarter 3 (2026)'].map((p) => (
              <button
                key={p}
                onClick={() => {
                  setSelectedPeriod(p);
                  setFilterPeriodOpen(false);
                }}
                className={`p-3 rounded-2xl border text-left font-bold transition-all ${
                  selectedPeriod === p ? 'bg-teal-50 border-teal-500 text-teal-900 shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
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
          <div className="h-56 overflow-y-auto p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            {chatMessages.map((m, idx) => (
              <div key={idx} className="p-3 bg-white rounded-xl border border-slate-100 shadow-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-slate-900">{m.sender}</span>
                  <span className="text-[10px] text-slate-400 font-medium">{m.time}</span>
                </div>
                <p className="text-slate-600">{m.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendChatMessage} className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Type message to merchant or driver..."
              value={chatMessageInput}
              onChange={(e) => setChatMessageInput(e.target.value)}
              className="flex-1 p-2.5 bg-slate-100 border-none rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <Button type="submit" variant="primary" size="sm" disabled={!chatMessageInput.trim()}>
              <Send className="w-3.5 h-3.5 mr-1" />
              Reply
            </Button>
          </form>
        </div>
      </Modal>

      {/* MERCHANT REWARDS & INCENTIVES MODAL */}
      <Modal isOpen={rewardsOpen} onClose={() => setRewardsOpen(false)} title="Merchant & Transporter Reward Campaigns">
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-amber-200 text-amber-900 uppercase">ACTIVE CAMPAIGN</span>
            <h4 className="text-sm font-extrabold text-amber-950 mt-1">Zero Escrow Fee Promotion (Douala Merchants)</h4>
            <p className="text-amber-800 text-[11px] mt-0.5">Top 50 merchants with 4.9★ rating receive 0% commission on orders over 100k FCFA.</p>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <Button variant="outline" onClick={() => setRewardsOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </header>
  );
};
