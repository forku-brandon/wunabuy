import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { notificationsApi, DirectNotificationPayload } from '../../services/notificationsApi';
import { usersApi, DirectoryUserItem } from '../../services/usersApi';
import {
  Send,
  User,
  Search,
  ShoppingBag,
  Store,
  Truck,
  Flame,
  Radio,
  ShieldAlert,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Package,
  Layers,
  Sparkles,
  X,
} from 'lucide-react';

export interface SelectedUserSummary {
  id: string;
  name: string;
  phone?: string;
  role?: string;
  email?: string | null;
}

interface ComposeDirectModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedUser?: SelectedUserSummary | null;
  onDirectSuccess?: () => void;
}

export const ComposeDirectModal: React.FC<ComposeDirectModalProps> = ({
  isOpen,
  onClose,
  preselectedUser,
  onDirectSuccess,
}) => {
  const [targetUser, setTargetUser] = useState<SelectedUserSummary | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DirectoryUserItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const [role, setRole] = useState<'buyer' | 'seller' | 'transporter'>('buyer');
  const [type, setType] = useState<'system' | 'alert' | 'kyc' | 'order_status' | 'marketing'>('system');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [screenTarget, setScreenTarget] = useState<string>('default');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync preselected user when opened
  useEffect(() => {
    if (preselectedUser) {
      setTargetUser(preselectedUser);
      if (preselectedUser.role) {
        const normalizedRole = preselectedUser.role.toLowerCase();
        if (['buyer', 'seller', 'transporter'].includes(normalizedRole)) {
          setRole(normalizedRole as any);
        }
      }
    } else {
      setTargetUser(null);
    }
    setStatusMessage(null);
  }, [preselectedUser, isOpen]);

  // Live user search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      setShowUserDropdown(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsSearching(true);
      usersApi
        .getUsers({ search: searchQuery.trim() })
        .then((res) => {
          if (res.data) {
            setSearchResults(res.data.slice(0, 6));
            setShowUserDropdown(true);
          }
        })
        .catch(() => {
          setSearchResults([]);
        })
        .finally(() => {
          setIsSearching(false);
        });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const selectUser = (u: DirectoryUserItem) => {
    setTargetUser({
      id: u.id,
      name: u.full_name,
      phone: u.phone,
      role: u.role,
      email: u.email,
    });
    const normalizedRole = u.role.toLowerCase();
    if (['buyer', 'seller', 'transporter'].includes(normalizedRole)) {
      setRole(normalizedRole as any);
    }
    setSearchQuery('');
    setShowUserDropdown(false);
  };

  const clearSelectedUser = () => {
    setTargetUser(null);
    setSearchQuery('');
  };

  // Quick Preset Templates
  const applyTemplate = (tpl: {
    title: string;
    message: string;
    type: 'system' | 'alert' | 'kyc' | 'order_status' | 'marketing';
    screen: string;
    role?: 'buyer' | 'seller' | 'transporter';
  }) => {
    setTitle(tpl.title);
    setMessage(tpl.message);
    setType(tpl.type);
    setScreenTarget(tpl.screen);
    if (tpl.role) setRole(tpl.role);
  };

  const templates = [
    {
      label: 'KYC Approved',
      icon: CheckCircle2,
      color: 'border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-300',
      data: {
        title: 'KYC Verification Approved! ✅',
        message: 'Congratulations! Your identity credentials have been verified by Wunabuy Compliance. Your account is fully unlocked.',
        type: 'kyc' as const,
        screen: 'SellerDashboard',
        role: 'seller' as const,
      },
    },
    {
      label: 'KYC Need Docs',
      icon: AlertCircle,
      color: 'border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-300',
      data: {
        title: 'KYC Document Attention Required ⚠️',
        message: 'Compliance notice: Your uploaded identity document is unclear or expired. Please upload a clear photo of your CNI/Passport.',
        type: 'kyc' as const,
        screen: 'StoreKYC',
        role: 'seller' as const,
      },
    },
    {
      label: 'Dispute Ruling',
      icon: ShieldAlert,
      color: 'border-rose-200 text-rose-700 dark:border-rose-800 dark:text-rose-300',
      data: {
        title: 'Dispute Ruling Decision ⚖️',
        message: 'Wunabuy Control Centre has adjudicated the order dispute. Funds have been settled per evidence inspection.',
        type: 'order_status' as const,
        screen: 'BuyerOrders',
        role: 'buyer' as const,
      },
    },
    {
      label: 'Security Notice',
      icon: Radio,
      color: 'border-teal-200 text-teal-700 dark:border-teal-800 dark:text-teal-300',
      data: {
        title: 'Account Verification Notice 🔔',
        message: 'Please review and confirm your primary payout number in your wallet profile for upcoming scheduled settlements.',
        type: 'alert' as const,
        screen: 'BuyerWallet',
        role: 'buyer' as const,
      },
    },
  ];

  const typeOptions = [
    { id: 'system', label: 'System Notice', icon: Radio, color: 'text-teal-500' },
    { id: 'kyc', label: 'KYC / Compliance', icon: FileCheck, color: 'text-blue-500' },
    { id: 'alert', label: 'Security Alert', icon: ShieldAlert, color: 'text-rose-500' },
    { id: 'order_status', label: 'Order / Escrow', icon: Package, color: 'text-amber-500' },
    { id: 'marketing', label: 'Promotions', icon: Sparkles, color: 'text-emerald-500' },
  ] as const;

  const roleOptions = [
    { id: 'buyer', label: 'Buyer', icon: ShoppingBag, color: 'border-teal-500 text-teal-600 dark:text-teal-400' },
    { id: 'seller', label: 'Seller', icon: Store, color: 'border-emerald-500 text-emerald-600 dark:text-emerald-400' },
    { id: 'transporter', label: 'Transporter', icon: Truck, color: 'border-amber-500 text-amber-600 dark:text-amber-400' },
  ] as const;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUser) {
      setStatusMessage({ type: 'error', text: 'Please search and select an individual recipient.' });
      return;
    }
    if (!title.trim() || !message.trim()) {
      setStatusMessage({ type: 'error', text: 'Please fill in both a title and notification message.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const payload: DirectNotificationPayload = {
      user_id: targetUser.id,
      phone: targetUser.phone,
      title: title.trim(),
      message: message.trim(),
      type,
      role,
      deep_link: screenTarget !== 'default' ? screenTarget : undefined,
      data: screenTarget !== 'default' ? { screen: screenTarget, role } : { role },
    };

    try {
      const response = await notificationsApi.sendDirectNotification(payload);
      if (response.success) {
        setStatusMessage({
          type: 'success',
          text: `🚀 Direct push & in-app notification delivered to ${targetUser.name}!`,
        });
        setTimeout(() => {
          setTitle('');
          setMessage('');
          setStatusMessage(null);
          onDirectSuccess?.();
          onClose();
        }, 1500);
      } else {
        setStatusMessage({ type: 'error', text: response.error?.message || 'Failed to dispatch notification.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Network error while dispatching notification.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Send Direct Notification to User" maxWidth="2xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Status Alert */}
        {statusMessage && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center space-x-2.5 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            )}
            <span className="font-medium">{statusMessage.text}</span>
          </div>
        )}

        {/* 1. RECIPIENT SELECTOR */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Recipient User
          </label>

          {targetUser ? (
            <div className="flex items-center justify-between p-3 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/20">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-sm">
                  {targetUser.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{targetUser.name}</span>
                    <Badge variant="neutral" className="text-[10px] uppercase font-bold py-0.5">
                      {targetUser.role || role}
                    </Badge>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {targetUser.phone || targetUser.email || targetUser.id}
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearSelectedUser}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="relative">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search user by name, phone (+237...), email, or UUID..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
              </div>

              {/* Autocomplete Dropdown */}
              {showUserDropdown && searchResults.length > 0 && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden max-h-56 overflow-y-auto">
                  {searchResults.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => selectUser(u)}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/50 last:border-b-0 transition-colors"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300">
                          {u.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{u.full_name}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{u.phone}</p>
                        </div>
                      </div>
                      <Badge variant="neutral" className="text-[10px] uppercase">
                        {u.role}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 2. QUICK TEMPLATE PRESETS */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Quick Operational Presets
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {templates.map((tpl) => {
              const Icon = tpl.icon;
              return (
                <button
                  key={tpl.label}
                  type="button"
                  onClick={() => applyTemplate(tpl.data)}
                  className={`px-3 py-2 rounded-xl border text-left flex items-center space-x-2 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 ${tpl.color}`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-xs font-semibold truncate">{tpl.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. TARGET WORKSPACE ROLE */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Recipient Target Workspace
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {roleOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = role === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setRole(opt.id)}
                  className={`p-2.5 rounded-xl border text-center flex flex-col items-center justify-center space-y-1 transition-all ${
                    isSelected
                      ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/30 ring-1 ring-teal-500 text-teal-700 dark:text-teal-300'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-bold">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. NOTIFICATION SEVERITY / TYPE */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Notification Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {typeOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = type === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setType(opt.id)}
                  className={`px-3 py-2 rounded-xl border flex items-center space-x-2 text-xs font-semibold transition-all ${
                    isSelected
                      ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/30 text-teal-800 dark:text-teal-200'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${opt.color}`} />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. TITLE & MESSAGE CONTENT */}
        <div className="space-y-3.5">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Title Header
              </label>
              <span className="text-[11px] text-slate-400">{title.length}/255</span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. KYC Verification Approved! ✅"
              maxLength={255}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Notification Message
              </label>
              <span className="text-[11px] text-slate-400">{message.length}/1000</span>
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Enter operational directive, approval notice, or reason for action..."
              maxLength={1000}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
            />
          </div>
        </div>

        {/* 6. TARGET SCREEN / DEEP LINK */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Action Deep Link Target (Optional)
          </label>
          <select
            value={screenTarget}
            onChange={(e) => setScreenTarget(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
          >
            <option value="default">Default Notifications List</option>
            <option value="StoreKYC">Store KYC Documents Submission</option>
            <option value="TransporterKYC">Transporter Vehicle & License KYC</option>
            <option value="SellerDashboard">Seller Merchant Dashboard</option>
            <option value="BuyerOrders">Buyer Orders Screen</option>
            <option value="SellerOrders">Seller Orders Screen</option>
            <option value="TransporterJobs">Transporter Dispatch Board</option>
            <option value="BuyerWallet">Buyer Escrow Wallet</option>
            <option value="SellerWallet">Seller Store Wallet</option>
          </select>
        </div>

        {/* 7. LIVE SMARTPHONE LOCKSCREEN PREVIEW */}
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Smartphone className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Smartphone Heads-Up Notification Preview
            </span>
          </div>

          <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-xl space-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1 border-b border-slate-800/80">
              <div className="flex items-center space-x-1.5">
                <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                <span className="font-bold tracking-wider text-slate-300">WUNABUY CONTROL CENTRE</span>
                <span className="text-[10px] text-teal-400 uppercase font-semibold">[{role}]</span>
              </div>
              <span>Just now</span>
            </div>

            <div className="pt-1">
              <h4 className="text-xs font-bold text-slate-100">
                {title.trim() || 'Direct Staff Directive'}
              </h4>
              <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
                {message.trim() || 'Targeted push and in-app message preview.'}
              </p>
            </div>

            {screenTarget !== 'default' && (
              <div className="pt-1 flex items-center space-x-1.5 text-[10px] text-teal-400">
                <Layers className="w-3 h-3" />
                <span>Deep links to: <code className="font-mono bg-slate-800 px-1 py-0.5 rounded">{screenTarget}</code></span>
              </div>
            )}
          </div>
        </div>

        {/* 8. SUBMISSION ACTIONS */}
        <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={isSubmitting || !targetUser}>
            <Send className="w-3.5 h-3.5 mr-1.5" />
            <span>{isSubmitting ? 'Dispatching...' : 'Send Direct Notification'}</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};
