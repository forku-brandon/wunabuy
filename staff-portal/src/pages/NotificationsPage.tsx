import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  useNotifications,
  SystemNotification,
  NotificationPriority,
  NotificationCategory,
} from '../stores/notificationsStore';
import {
  Bell,
  BellRing,
  CheckCheck,
  Trash2,
  Filter,
  Search,
  ExternalLink,
  ShieldAlert,
  Wallet,
  FileCheck,
  Truck,
  Briefcase,
  SlidersHorizontal,
  Clock,
  Radio,
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearRead } = useNotifications();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'CRITICAL' | 'PAYOUT' | 'KYC_DISPUTE' | 'LOGISTICS' | 'HR'>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      // Tab filter
      if (activeTab === 'unread' && notif.is_read) return false;
      if (activeTab === 'CRITICAL' && notif.priority !== 'CRITICAL') return false;
      if (activeTab === 'PAYOUT' && notif.category !== 'PAYOUT') return false;
      if (activeTab === 'KYC_DISPUTE' && notif.category !== 'KYC' && notif.category !== 'DISPUTE') return false;
      if (activeTab === 'LOGISTICS' && notif.category !== 'LOGISTICS') return false;
      if (activeTab === 'HR' && notif.category !== 'HR') return false;

      // Priority dropdown filter
      if (selectedPriority !== 'ALL' && notif.priority !== selectedPriority) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = notif.title.toLowerCase().includes(query);
        const matchesBody = notif.body.toLowerCase().includes(query);
        const matchesCategory = notif.category.toLowerCase().includes(query);
        const matchesNode = notif.source_node?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesBody && !matchesCategory && !matchesNode) return false;
      }

      return true;
    });
  }, [notifications, activeTab, selectedPriority, searchQuery]);

  const criticalCount = useMemo(() => notifications.filter((n) => n.priority === 'CRITICAL').length, [notifications]);
  const payoutCount = useMemo(() => notifications.filter((n) => n.category === 'PAYOUT').length, [notifications]);
  const kycDisputeCount = useMemo(
    () => notifications.filter((n) => n.category === 'KYC' || n.category === 'DISPUTE').length,
    [notifications]
  );

  const getPriorityBadgeVariant = (priority: NotificationPriority) => {
    switch (priority) {
      case 'CRITICAL':
        return 'error';
      case 'HIGH':
        return 'warning';
      case 'MEDIUM':
        return 'info';
      case 'SUCCESS':
        return 'success';
      default:
        return 'neutral';
    }
  };

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'PAYOUT':
        return Wallet;
      case 'KYC':
        return FileCheck;
      case 'DISPUTE':
        return ShieldAlert;
      case 'LOGISTICS':
        return Truck;
      case 'HR':
        return Briefcase;
      default:
        return Bell;
    }
  };

  const formatRelativeTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  return (
    <PageContainer
      title="System Notifications & Operational Alerts Center"
      subtitle="Real-time centralized ledger of system alerts, escrow payout authorizations, KYC submissions, and dispute escalations."
      action={
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <Button variant="primary" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="w-3.5 h-3.5 mr-1.5" />
              <span>Mark All Read</span>
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={clearRead}>
            <Trash2 className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            <span>Clear Read</span>
          </Button>
        </div>
      }
    >
      {/* 1. TOP TELEMETRY KPI METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 flex items-center space-x-4 border-l-4 border-l-teal-500">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-600 dark:text-teal-400">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total System Notifications</p>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-mono mt-0.5">{notifications.length}</h3>
          </div>
        </Card>

        <Card className="p-4 flex items-center space-x-4 border-l-4 border-l-amber-500">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <BellRing className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Unread Operational Alerts</p>
            <h3 className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono mt-0.5">{unreadCount}</h3>
          </div>
        </Card>

        <Card className="p-4 flex items-center space-x-4 border-l-4 border-l-red-500">
          <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/60 flex items-center justify-center text-red-600 dark:text-red-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Critical Priority Alerts</p>
            <h3 className="text-2xl font-extrabold text-red-600 dark:text-red-400 font-mono mt-0.5">{criticalCount}</h3>
          </div>
        </Card>

        <Card className="p-4 flex items-center space-x-4 border-l-4 border-l-teal-500">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-600 dark:text-teal-400">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Payout &amp; Escrow Requests</p>
            <h3 className="text-2xl font-extrabold text-teal-600 dark:text-teal-400 font-mono mt-0.5">{payoutCount + kycDisputeCount}</h3>
          </div>
        </Card>
      </div>

      {/* 2. TAB NAVIGATION & FILTERS BAR */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none text-xs font-bold">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              All Notifications ({notifications.length})
            </button>

            <button
              onClick={() => setActiveTab('unread')}
              className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                activeTab === 'unread'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <span>Unread</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('CRITICAL')}
              className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'CRITICAL'
                  ? 'bg-red-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Critical Alerts ({criticalCount})
            </button>

            <button
              onClick={() => setActiveTab('PAYOUT')}
              className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'PAYOUT'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Payouts ({payoutCount})
            </button>

            <button
              onClick={() => setActiveTab('KYC_DISPUTE')}
              className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'KYC_DISPUTE'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              KYC &amp; Disputes ({kycDisputeCount})
            </button>

            <button
              onClick={() => setActiveTab('LOGISTICS')}
              className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'LOGISTICS'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Logistics
            </button>

            <button
              onClick={() => setActiveTab('HR')}
              className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'HR'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              HR Ops
            </button>
          </div>

          {/* Controls: Search Input & Priority Filter */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search alerts, references..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
              />
            </div>

            <div className="relative flex-shrink-0">
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold text-slate-700 dark:text-slate-200 appearance-none cursor-pointer"
              >
                <option value="ALL">All Priorities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="INFO">Info</option>
                <option value="SUCCESS">Success</option>
              </select>
              <SlidersHorizontal className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </Card>

      {/* 3. NOTIFICATIONS LIST CONTAINER */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card className="p-12 text-center">
            <Bell className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 font-heading">No Notifications Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto font-medium">
              There are no system notifications matching your selected tab, priority filter, or search query.
            </p>
          </Card>
        ) : (
          filteredNotifications.map((notif) => {
            const IconComp = getCategoryIcon(notif.category);
            return (
              <Card
                key={notif.id}
                className={`p-4 transition-all hover:border-slate-300 dark:hover:border-slate-700 ${
                  !notif.is_read
                    ? 'bg-white dark:bg-[#121824] border-l-4 border-l-teal-500 shadow-xs'
                    : 'bg-slate-50/60 dark:bg-[#0d121c]/60 opacity-85'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start space-x-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        notif.priority === 'CRITICAL'
                          ? 'bg-red-50 dark:bg-red-950/60 text-red-600'
                          : notif.priority === 'HIGH'
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600'
                          : 'bg-teal-50 dark:bg-teal-950/60 text-teal-600'
                      }`}
                    >
                      <IconComp className="w-5 h-5" />
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <Badge variant={getPriorityBadgeVariant(notif.priority)} size="sm">
                          {notif.priority}
                        </Badge>

                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                          {notif.category}
                        </span>

                        {!notif.is_read && (
                          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" title="Unread Alert" />
                        )}

                        <span className="text-[11px] text-slate-400 font-mono flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatRelativeTime(notif.timestamp)}
                        </span>
                      </div>

                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 font-heading tracking-tight">
                        {notif.title}
                      </h4>

                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                        {notif.body}
                      </p>

                      {notif.source_node && (
                        <span className="text-[10px] text-slate-400 font-mono block">
                          Node: <strong className="text-slate-600 dark:text-slate-300">{notif.source_node}</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        markAsRead(notif.id);
                        navigate(notif.target_url);
                      }}
                      className="text-xs font-bold"
                    >
                      <span>{notif.action_label || 'View Details'}</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                    </Button>

                    <button
                      onClick={() => deleteNotification(notif.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Delete Notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </PageContainer>
  );
};

