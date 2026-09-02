import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useStaffAuth, DEMO_STAFF_PERSONAS, StaffUser } from '../stores/staffAuthStore';
import {
  MessageSquare,
  Megaphone,
  Send,
  Plus,
  Hash,
  User,
  ShieldCheck,
  AlertTriangle,
  Pin,
  CheckCircle2,
  Paperclip,
  Smile,
  Search,
  Radio,
} from 'lucide-react';

interface ChatChannel {
  id: string;
  name: string;
  department: string;
  unread_count: number;
}

interface ChatMessageItem {
  id: string;
  sender_name: string;
  sender_role: string;
  sender_avatar: string;
  content: string;
  timestamp: string;
  is_staff_self?: boolean;
}

interface AnnouncementItem {
  id: string;
  title: string;
  severity: 'URGENT' | 'POLICY' | 'GENERAL';
  author_name: string;
  author_role: string;
  target_audience: string;
  content: string;
  published_at: string;
  is_pinned?: boolean;
}

const MOCK_CHANNELS: ChatChannel[] = [
  { id: 'ch_1', name: 'general-hq', department: 'Company-Wide', unread_count: 2 },
  { id: 'ch_2', name: 'finance-treasury', department: 'Finance & Payouts', unread_count: 0 },
  { id: 'ch_3', name: 'compliance-kyc', department: 'Legal & Merchant KYC', unread_count: 1 },
  { id: 'ch_4', name: 'logistics-fleet', department: 'Operations & Riders', unread_count: 4 },
  { id: 'ch_5', name: 'executive-board', department: 'Management L4/L5', unread_count: 0 },
];

const INITIAL_MESSAGES: Record<string, ChatMessageItem[]> = {
  'ch_1': [
    {
      id: 'm1',
      sender_name: 'Pauline Mbarga',
      sender_role: 'SUPER_ADMIN',
      sender_avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
      content: 'Good morning team! Please review the Q3 merchant growth incentives posted in the announcements tab.',
      timestamp: '09:15 AM',
    },
    {
      id: 'm2',
      sender_name: 'Christian Atangana',
      sender_role: 'FINANCE_OFFICER',
      sender_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      content: 'Noted Pauline! All MTN MoMo & Orange Money reconciliation statements for yesterday are 100% matched.',
      timestamp: '09:22 AM',
    },
  ],
  'ch_4': [
    {
      id: 'm3',
      sender_name: 'Jean-Luc Fotso',
      sender_role: 'OPS_MANAGER',
      sender_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      content: 'Rider Jean-Paul Nkoum has arrived at Akwa store hub for pickup #WB-TRIP-9842.',
      timestamp: '10:04 AM',
    },
  ],
};

const INITIAL_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'ann_101',
    title: '🚨 Scheduled MTN MoMo Gateway Maintenance (Tonight 02:00 - 04:00 WAT)',
    severity: 'URGENT',
    author_name: 'Pauline Mbarga',
    author_role: 'SUPER_ADMIN',
    target_audience: 'All Staff Personnel',
    content: 'MTN Mobile Money USSD gateway *126# will undergo scheduled database maintenance tonight. Payout requests initiated during this window will be queued for auto-processing at 04:15 WAT.',
    published_at: '2026-09-02 08:00',
    is_pinned: true,
  },
  {
    id: 'ann_102',
    title: '🎉 Q3 Merchant Growth Incentive Target Met (Douala Region)',
    severity: 'GENERAL',
    author_name: 'Marie-Noelle Bikoe',
    author_role: 'COMPLIANCE_OFFICER',
    target_audience: 'All Staff Personnel',
    content: 'Over 150 verified merchant stores in Douala (Akwa, Bonanjo, Makepe) have maintained a 4.9★ rating. Zero escrow fee promo is now active for eligible sellers.',
    published_at: '2026-09-01 14:30',
    is_pinned: false,
  },
  {
    id: 'ann_103',
    title: '📋 UPDATED POLICY: 48-Hour Escrow Hold Adjudication Guidelines',
    severity: 'POLICY',
    author_name: 'Pauline Mbarga',
    author_role: 'SUPER_ADMIN',
    target_audience: 'Support & Finance Departments',
    content: 'When adjudicating 3-way disputes for damaged items, support agents must verify CNI front/back photos and signed proof-of-delivery signatures prior to executing 100% buyer refunds.',
    published_at: '2026-08-28 11:00',
    is_pinned: true,
  },
];

export const CommunicationsPage: React.FC = () => {
  const { user, addAuditLog } = useStaffAuth();
  const [activeTab, setActiveTab] = useState<'chat' | 'announcements'>('chat');
  const [activeChannelId, setActiveChannelId] = useState('ch_1');
  const [chatMessagesState, setChatMessagesState] = useState(INITIAL_MESSAGES);
  const [messageInput, setMessageInput] = useState('');
  
  // Announcements State
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(INITIAL_ANNOUNCEMENTS);
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annSeverity, setAnnSeverity] = useState<'URGENT' | 'POLICY' | 'GENERAL'>('GENERAL');
  const [annAudience, setAnnAudience] = useState('All Staff Personnel');
  const [annContent, setAnnContent] = useState('');

  const currentChannel = MOCK_CHANNELS.find((c) => c.id === activeChannelId) || MOCK_CHANNELS[0];
  const currentMessages = chatMessagesState[activeChannelId] || [];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !user) return;

    const newMsg: ChatMessageItem = {
      id: 'm_' + Date.now().toString().slice(-4),
      sender_name: user.full_name,
      sender_role: user.staff_department_role,
      sender_avatar: user.avatar_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
      content: messageInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      is_staff_self: true,
    };

    setChatMessagesState((prev) => ({
      ...prev,
      [activeChannelId]: [...(prev[activeChannelId] || []), newMsg],
    }));

    setMessageInput('');
  };

  const handlePublishAnnouncement = () => {
    if (!annTitle.trim() || !annContent.trim() || !user) return;

    const newAnn: AnnouncementItem = {
      id: 'ann_' + Date.now().toString().slice(-4),
      title: annTitle,
      severity: annSeverity,
      author_name: user.full_name,
      author_role: user.staff_department_role,
      target_audience: annAudience,
      content: annContent,
      published_at: new Date().toISOString().replace('T', ' ').slice(0, 16),
      is_pinned: annSeverity === 'URGENT',
    };

    setAnnouncements((prev) => [newAnn, ...prev]);

    addAuditLog({
      action_code: 'ANNOUNCEMENT_PUBLISH',
      action_description: `Published platform announcement "${annTitle}" for ${annAudience}`,
      target_id: newAnn.id,
      security_level: annSeverity === 'URGENT' ? 'CRITICAL' : 'INFO',
    });

    setAnnouncementModalOpen(false);
    setAnnTitle('');
    setAnnContent('');
    setAnnSeverity('GENERAL');
  };

  return (
    <PageContainer
      title="Internal Staff Chat &amp; System Announcements"
      subtitle="Real-time Departmental Communications, Direct Messages &amp; Official Executive Directives"
    >
      {/* Top Tab Bar Navigation */}
      <div className="flex items-center space-x-3 mb-6">
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold flex items-center space-x-2 transition-all shadow-xs ${
            activeTab === 'chat'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Internal Staff Chat</span>
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold flex items-center space-x-2 transition-all shadow-xs ${
            activeTab === 'announcements'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Official System Broadcasts ({announcements.length})</span>
        </button>
      </div>

      {/* TAB 1: INTERNAL STAFF CHAT CHANNELS & DIRECT MESSAGING */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
          {/* Channels & Staff Colleagues Sidebar */}
          <Card className="lg:col-span-1 p-4 flex flex-col justify-between overflow-hidden">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-extrabold text-slate-900 font-heading">Staff Channels</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                  ONLINE
                </span>
              </div>

              {/* Channels List */}
              <div className="space-y-1">
                {MOCK_CHANNELS.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => setActiveChannelId(channel.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                      activeChannelId === channel.id
                        ? 'bg-teal-50 text-teal-800 border-l-4 border-teal-600'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Hash className="w-3.5 h-3.5 text-slate-400" />
                      <span>{channel.name}</span>
                    </div>
                    {channel.unread_count > 0 && (
                      <span className="px-1.5 py-0.5 text-[9px] font-extrabold rounded-full bg-teal-600 text-white">
                        {channel.unread_count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Staff Personas Directory */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">
                  DIRECT COLLEAGUES ({DEMO_STAFF_PERSONAS.length})
                </span>
                <div className="space-y-2">
                  {DEMO_STAFF_PERSONAS.map((p) => (
                    <div key={p.id} className="flex items-center space-x-2 text-xs">
                      <img
                        src={p.avatar_url || ''}
                        alt={p.full_name}
                        className="w-6 h-6 rounded-full object-cover border border-slate-200"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-800 truncate">{p.full_name.split(' ')[0]}</p>
                        <p className="text-[9px] text-slate-400 truncate">{p.staff_department_role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Chat Feed & Message Composer */}
          <Card className="lg:col-span-3 p-6 flex flex-col justify-between h-full">
            {/* Channel Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Hash className="w-5 h-5 text-teal-600" />

                <div>
                  <h3 className="text-base font-extrabold text-slate-900 font-heading">
                    {currentChannel.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">{currentChannel.department}</p>
                </div>
              </div>
              <Badge variant="teal">REVERB ENCRYPTED</Badge>
            </div>

            {/* Message Feed Area */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2">
              {currentMessages.map((msg) => (
                <div key={msg.id} className="flex items-start space-x-3">
                  <img
                    src={msg.sender_avatar}
                    alt={msg.sender_name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200 mt-1"
                  />
                  <div className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl p-3.5">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-slate-900 text-xs">{msg.sender_name}</span>
                        <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded bg-slate-200 text-slate-700">
                          {msg.sender_role}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold">{msg.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Composer */}
            <form onSubmit={handleSendMessage} className="pt-4 border-t border-slate-100 flex items-center space-x-3">
              <input
                type="text"
                placeholder={`Message #${currentChannel.name}...`}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="flex-1 p-3 bg-slate-100/80 border-none rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <Button type="submit" variant="primary" disabled={!messageInput.trim()}>
                <Send className="w-4 h-4 mr-1.5" />
                Send
              </Button>
            </form>
          </Card>
        </div>
      )}

      {/* TAB 2: PLATFORM SYSTEM ANNOUNCEMENTS & DIRECTIVES */}
      {activeTab === 'announcements' && (
        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 font-heading flex items-center">
                  <Megaphone className="w-5 h-5 text-teal-600 mr-2" />
                  Official System Broadcasts &amp; Executive Directives
                </h3>
                <p className="text-xs text-slate-500 font-medium">Company-wide policy updates, maintenance alerts, and operational targets</p>
              </div>

              <Button variant="primary" size="sm" onClick={() => setAnnouncementModalOpen(true)}>
                <Plus className="w-4 h-4 mr-1.5" />
                Publish Announcement
              </Button>
            </div>

            {/* Announcements Card Feed */}
            <div className="space-y-4">
              {announcements.map((item) => (
                <div
                  key={item.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    item.is_pinned
                      ? 'bg-teal-50/40 border-teal-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        {item.is_pinned && (
                          <span className="flex items-center text-[10px] font-extrabold text-teal-800 uppercase bg-teal-100 px-2 py-0.5 rounded-full">
                            <Pin className="w-3 h-3 mr-1" /> PINNED DIRECTIVE
                          </span>
                        )}
                        <Badge
                          variant={
                            item.severity === 'URGENT'
                              ? 'error'
                              : item.severity === 'POLICY'
                              ? 'amber'
                              : 'teal'
                          }
                        >
                          {item.severity}
                        </Badge>
                      </div>

                      <h4 className="text-base font-extrabold text-slate-900 font-heading mt-1">
                        {item.title}
                      </h4>
                    </div>

                    <span className="text-[11px] font-mono text-slate-400">{item.published_at}</span>
                  </div>

                  <p className="text-xs text-slate-700 font-medium mt-3 leading-relaxed">
                    {item.content}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
                    <span>Published By: <strong className="text-slate-900">{item.author_name}</strong> ({item.author_role})</span>
                    <span>Audience: <strong className="text-teal-700">{item.target_audience}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* PUBLISH SYSTEM ANNOUNCEMENT MODAL */}
      <Modal
        isOpen={announcementModalOpen}
        onClose={() => setAnnouncementModalOpen(false)}
        title="Publish Official System Announcement"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Announcement Title *</label>
            <input
              type="text"
              placeholder="e.g. 🚨 Scheduled Gateway Maintenance"
              value={annTitle}
              onChange={(e) => setAnnTitle(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Severity Level</label>
              <select
                value={annSeverity}
                onChange={(e: any) => setAnnSeverity(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              >
                <option value="GENERAL">GENERAL — Informational</option>
                <option value="POLICY">POLICY — Compliance Directive</option>
                <option value="URGENT">URGENT — System Critical</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Target Audience</label>
              <select
                value={annAudience}
                onChange={(e) => setAnnAudience(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              >
                <option value="All Staff Personnel">All Staff Personnel</option>
                <option value="Finance & Treasury Only">Finance &amp; Treasury Only</option>
                <option value="Logistics & Ops Only">Logistics &amp; Ops Only</option>
                <option value="Compliance & KYC Only">Compliance &amp; KYC Only</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Announcement Content Directive *</label>
            <textarea
              rows={4}
              value={annContent}
              onChange={(e) => setAnnContent(e.target.value)}
              placeholder="Detail executive operational instructions..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <Button variant="outline" onClick={() => setAnnouncementModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" disabled={!annTitle.trim() || !annContent.trim()} onClick={handlePublishAnnouncement}>
              Broadcast Announcement &amp; Record Audit Log
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
};
