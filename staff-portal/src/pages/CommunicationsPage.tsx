import React, { useState, useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useStaffAuth } from '../stores/staffAuthStore';
import {
  MessageSquare,
  Megaphone,
  Send,
  Plus,
  Hash,
  Pin,
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

const CORPORATE_CHANNELS: ChatChannel[] = [
  { id: 'ch_general', name: 'general-hq', department: 'Company-Wide', unread_count: 0 },
  { id: 'ch_finance', name: 'finance-treasury', department: 'Finance & Payouts', unread_count: 0 },
  { id: 'ch_compliance', name: 'compliance-kyc', department: 'Legal & Merchant KYC', unread_count: 0 },
  { id: 'ch_logistics', name: 'logistics-fleet', department: 'Operations & Riders', unread_count: 0 },
  { id: 'ch_executive', name: 'executive-board', department: 'Management L4/L5', unread_count: 0 },
];

export const CommunicationsPage: React.FC = () => {
  const { user, addAuditLog, staffMembers } = useStaffAuth();
  const [activeTab, setActiveTab] = useState<'chat' | 'announcements'>('chat');
  const [activeChannelId, setActiveChannelId] = useState('ch_general');
  const [chatMessagesState, setChatMessagesState] = useState<Record<string, ChatMessageItem[]>>(() => {
    const saved = localStorage.getItem('wunabuy_staff_chat_messages');
    return saved ? JSON.parse(saved) : {};
  });
  const [messageInput, setMessageInput] = useState('');
  
  // Announcements State
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(() => {
    const saved = localStorage.getItem('wunabuy_staff_announcements');
    return saved ? JSON.parse(saved) : [];
  });
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annSeverity, setAnnSeverity] = useState<'URGENT' | 'POLICY' | 'GENERAL'>('GENERAL');
  const [annAudience, setAnnAudience] = useState('All Staff Personnel');
  const [annContent, setAnnContent] = useState('');

  useEffect(() => {
    localStorage.setItem('wunabuy_staff_chat_messages', JSON.stringify(chatMessagesState));
  }, [chatMessagesState]);

  useEffect(() => {
    localStorage.setItem('wunabuy_staff_announcements', JSON.stringify(announcements));
  }, [announcements]);

  const currentChannel = CORPORATE_CHANNELS.find((c) => c.id === activeChannelId) || CORPORATE_CHANNELS[0];
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
              : 'bg-white dark:bg-[#151C28] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
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
              : 'bg-white dark:bg-[#151C28] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
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
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100 font-heading">Staff Channels</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300">
                  ONLINE
                </span>
              </div>

              {/* Channels List */}
              <div className="space-y-1">
                {CORPORATE_CHANNELS.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => setActiveChannelId(channel.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                      activeChannelId === channel.id
                        ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border-l-4 border-teal-600'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Hash className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
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
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
                  DIRECT COLLEAGUES ({staffMembers.length})
                </span>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {staffMembers.length === 0 ? (
                    <p className="text-[10px] text-slate-400 italic">No staff members in directory</p>
                  ) : (
                    staffMembers.map((p) => (
                      <div key={p.id} className="flex items-center space-x-2 text-xs">
                        <img
                          src={p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                          alt={p.full_name}
                          className="w-6 h-6 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{p.full_name.split(' ')[0]}</p>
                          <p className="text-[9px] text-slate-400 dark:text-slate-500 truncate">{p.staff_department_role}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Chat Feed & Message Composer */}
          <Card className="lg:col-span-3 p-6 flex flex-col justify-between h-full">
            {/* Channel Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Hash className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-heading">
                    {currentChannel.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{currentChannel.department}</p>
                </div>
              </div>
              <Badge variant="teal">REVERB ENCRYPTED</Badge>
            </div>

            {/* Message Feed Area */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2">
              {currentMessages.length === 0 ? (
                <div className="text-center py-16 text-slate-400 dark:text-slate-500">
                  <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-40 text-teal-600" />
                  <p className="text-xs font-bold">No messages in #{currentChannel.name} yet</p>
                  <p className="text-[10px] mt-1">Send a message below to start communicating with the team.</p>
                </div>
              ) : (
                currentMessages.map((msg) => (
                  <div key={msg.id} className="flex items-start space-x-3">
                    <img
                      src={msg.sender_avatar}
                      alt={msg.sender_name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 mt-1"
                    />
                    <div className="flex-1 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 rounded-2xl p-3.5">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-extrabold text-slate-900 dark:text-slate-100 text-xs">{msg.sender_name}</span>
                          <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {msg.sender_role}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">{msg.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input Composer */}
            <form onSubmit={handleSendMessage} className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center space-x-3">
              <input
                type="text"
                placeholder={`Message #${currentChannel.name}...`}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="flex-1 p-3 bg-slate-100/80 dark:bg-slate-800/80 border-none rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-slate-100"
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
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-heading flex items-center">
                  <Megaphone className="w-5 h-5 text-teal-600 dark:text-teal-400 mr-2" />
                  Official System Broadcasts &amp; Executive Directives
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Company-wide policy updates, maintenance alerts, and operational targets</p>
              </div>

              <Button variant="primary" size="sm" onClick={() => setAnnouncementModalOpen(true)}>
                <Plus className="w-4 h-4 mr-1.5" />
                Publish Announcement
              </Button>
            </div>

            {/* Announcements Card Feed */}
            <div className="space-y-4">
              {announcements.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                  <Megaphone className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No System Broadcasts Yet</p>
                  <p className="text-[10px] text-slate-400 mt-1">Official platform notices and policy updates will appear here when published.</p>
                </div>
              ) : (
                announcements.map((item) => (
                  <div
                    key={item.id}
                    className={`p-5 rounded-2xl border transition-all ${
                    item.is_pinned
                      ? 'bg-teal-50/40 dark:bg-teal-950/30 border-teal-200 dark:border-teal-900'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        {item.is_pinned && (
                          <span className="flex items-center text-[10px] font-extrabold text-teal-800 dark:text-teal-300 uppercase bg-teal-100 dark:bg-teal-900/60 px-2 py-0.5 rounded-full">
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

                      <h4 className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-heading mt-1">
                        {item.title}
                      </h4>
                    </div>

                    <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">{item.published_at}</span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-3 leading-relaxed">
                    {item.content}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Published By: <strong className="text-slate-900 dark:text-slate-200">{item.author_name}</strong> ({item.author_role})</span>
                    <span>Audience: <strong className="text-teal-700 dark:text-teal-400">{item.target_audience}</strong></span>
                  </div>
                </div>
              )))}
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
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Announcement Title *</label>
            <input
              type="text"
              placeholder="e.g. 🚨 Scheduled Gateway Maintenance"
              value={annTitle}
              onChange={(e) => setAnnTitle(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Severity Level</label>
              <select
                value={annSeverity}
                onChange={(e: any) => setAnnSeverity(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100"
              >
                <option value="GENERAL">GENERAL — Informational</option>
                <option value="POLICY">POLICY — Compliance Directive</option>
                <option value="URGENT">URGENT — System Critical</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Target Audience</label>
              <select
                value={annAudience}
                onChange={(e) => setAnnAudience(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100"
              >
                <option value="All Staff Personnel">All Staff Personnel</option>
                <option value="Finance & Treasury Only">Finance &amp; Treasury Only</option>
                <option value="Logistics & Ops Only">Logistics &amp; Ops Only</option>
                <option value="Compliance & KYC Only">Compliance &amp; KYC Only</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Announcement Content Directive *</label>
            <textarea
              rows={4}
              value={annContent}
              onChange={(e) => setAnnContent(e.target.value)}
              placeholder="Detail executive operational instructions..."
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
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
