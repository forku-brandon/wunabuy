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

  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'CRITICAL' | 'PAYOUT' | 'KYC_DISPUTE'>('all');
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
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <PageContainer
      title="System Notifications & Operational Alerts"
      subtitle="Centralized operational stream of security alerts, escrow payout authorizations, and compliance verifications"
      action={
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <Button variant="primary" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="w-3.5 h-3.5 mr-1" />
              <span>Mark All Read</span>
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={clearRead}>
            <Trash2 className="w-3.5 h-3.5 mr-1 text-slate-400" />
            <span>Clear Read</span>
          </Button>
        </div>
      }
    >
      {/* 1. TOP TELEMETRY KPI METRICS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        <Card className="p-3.5 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
            <Bell className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">Total Alerts</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{notifications.length}</h3>
          </div>
        </Card>

        <Card className="p-3.5 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <BellRing className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">Unread Alerts</p>
            <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400 tracking-tight">{unreadCount}</h3>
          </div>
        </Card>

        <Card className="p-3.5 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">Critical Priority</p>
            <h3 className="text-xl font-bold text-rose-600 dark:text-rose-400 tracking-tight">{criticalCount}</h3>
          </div>
        </Card>

        <Card className="p-3.5 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
            <Wallet className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">Payouts & KYC</p>
            <h3 className="text-xl font-bold text-teal-600 dark:text-teal-400 tracking-tight">{payoutCount + kycDisputeCount}</h3>
          </div>
        </Card>
      </div>

      {/* 2. TAB NAVIGATION & FILTERS BAR */}
      <Card className="p-3 mb-5">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg overflow-x-auto text-xs font-medium">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              All ({notifications.length})
            </button>

            <button
              onClick={() => setActiveTab('unread')}
              className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                activeTab === 'unread'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>Unread</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 text-[10px] font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('CRITICAL')}
              className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
                activeTab === 'CRITICAL'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Critical ({criticalCount})
            </button>

            <button
              onClick={() => setActiveTab('PAYOUT')}
              className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
                activeTab === 'PAYOUT'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Payouts ({payoutCount})
            </button>

            <button
              onClick={() => setActiveTab('KYC_DISPUTE')}
              className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
                activeTab === 'KYC_DISPUTE'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              KYC &amp; Disputes ({kycDisputeCount})
            </button>
          </div>

          {/* Controls: Search Input & Priority Filter */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search alerts..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
              />
            </div>

            <div className="relative shrink-0">
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="pl-7 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 font-medium text-slate-700 dark:text-slate-200 appearance-none cursor-pointer"
              >
                <option value="ALL">All Priorities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="INFO">Info</option>
                <option value="SUCCESS">Success</option>
              </select>
              <SlidersHorizontal className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </Card>

      {/* 3. NOTIFICATIONS LIST CONTAINER */}
      <div className="space-y-2.5">
        {filteredNotifications.length === 0 ? (
          <Card className="p-10 text-center">
            <Bell className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Notifications Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              There are no system notifications matching your selected tab, priority filter, or search query.
            </p>
          </Card>
        ) : (
          filteredNotifications.map((notif) => {
            const IconComp = getCategoryIcon(notif.category);
            return (
              <Card
                key={notif.id}
                className={`p-3.5 transition-all hover:border-slate-300 dark:hover:border-slate-700 ${
                  !notif.is_read
                    ? 'bg-white dark:bg-slate-900 border-l-2 border-l-teal-500 shadow-xs'
                    : 'bg-slate-50/50 dark:bg-slate-900/40 opacity-80'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        notif.priority === 'CRITICAL'
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                          : notif.priority === 'HIGH'
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                          : 'bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400'
                      }`}
                    >
                      <IconComp className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <Badge variant={getPriorityBadgeVariant(notif.priority)} size="sm">
                          {notif.priority}
                        </Badge>

                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                          {notif.category}
                        </span>

                        {!notif.is_read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" title="Unread Alert" />
                        )}

                        <span className="text-[10px] text-slate-400 font-mono flex items-center">
                          <Clock className="w-2.5 h-2.5 mr-1" />
                          {formatRelativeTime(notif.timestamp)}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                        {notif.title}
                      </h4>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {notif.body}
                      </p>

                      {notif.source_node && (
                        <span className="text-[10px] text-slate-400 font-mono block">
                          Node: <span className="text-slate-600 dark:text-slate-300">{notif.source_node}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center space-x-1.5 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        markAsRead(notif.id);
                        navigate(notif.target_url);
                      }}
                      className="text-xs"
                    >
                      <span>{notif.action_label || 'View'}</span>
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>

                    <button
                      onClick={() => deleteNotification(notif.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Delete Notification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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

