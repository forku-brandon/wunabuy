import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { notificationsApi, BroadcastNotificationPayload } from '../../services/notificationsApi';
import {
  Send,
  Users,
  ShoppingBag,
  Store,
  Truck,
  Flame,
  Radio,
  ShieldAlert,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface ComposeBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBroadcastSuccess?: () => void;
}

export const ComposeBroadcastModal: React.FC<ComposeBroadcastModalProps> = ({
  isOpen,
  onClose,
  onBroadcastSuccess,
}) => {
  const [audience, setAudience] = useState<'all' | 'buyers' | 'sellers' | 'transporters'>('all');
  const [type, setType] = useState<'marketing' | 'system' | 'alert' | 'promo'>('marketing');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [screenTarget, setScreenTarget] = useState<string>('default');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const audienceOptions = [
    { id: 'all', label: 'All Users', icon: Users, desc: 'Every registered mobile device' },
    { id: 'buyers', label: 'Buyers', icon: ShoppingBag, desc: 'Active shoppers & consumers' },
    { id: 'sellers', label: 'Sellers', icon: Store, desc: 'Merchants & store owners' },
    { id: 'transporters', label: 'Transporters', icon: Truck, desc: 'Douala dispatch riders & drivers' },
  ] as const;

  const typeOptions = [
    { id: 'marketing', label: 'Marketing', icon: Flame, color: 'text-amber-500' },
    { id: 'promo', label: 'Promotion', icon: Sparkles, color: 'text-emerald-500' },
    { id: 'system', label: 'System Notice', icon: Radio, color: 'text-teal-500' },
    { id: 'alert', label: 'Security Alert', icon: ShieldAlert, color: 'text-rose-500' },
  ] as const;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setStatusMessage({ type: 'error', text: 'Please fill in both a title and notification message.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const payload: BroadcastNotificationPayload = {
      audience,
      title: title.trim(),
      message: message.trim(),
      type,
      data: screenTarget !== 'default' ? { screen: screenTarget } : undefined,
    };

    try {
      const response = await notificationsApi.broadcastNotification(payload);
      if (response.success) {
        const count = response.data?.queued_count ?? 0;
        setStatusMessage({
          type: 'success',
          text: `🚀 Broadcast dispatched successfully to ${count} target mobile devices & inboxes!`,
        });
        setTimeout(() => {
          setTitle('');
          setMessage('');
          setStatusMessage(null);
          onBroadcastSuccess?.();
          onClose();
        }, 1500);
      } else {
        setStatusMessage({ type: 'error', text: response.error?.message || 'Failed to dispatch broadcast.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Network error while broadcasting notification.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Compose Mobile Broadcast Notification" maxWidth="2xl">
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

        {/* 1. Target Audience Segment */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            1. Target Audience Segment
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {audienceOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = audience === opt.id;
              return (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setAudience(opt.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/30 text-teal-900 dark:text-teal-200 ring-2 ring-teal-500/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Icon className={`w-4 h-4 mb-1.5 ${isSelected ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`} />
                  <p className="text-xs font-bold leading-tight">{opt.label}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5 truncate">{opt.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Notification Category */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            2. Notification Category
          </label>
          <div className="flex flex-wrap gap-2">
            {typeOptions.map((t) => {
              const Icon = t.icon;
              const isSelected = type === t.id;
              return (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setType(t.id)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center space-x-1.5 transition-all ${
                    isSelected
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 font-semibold shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${t.color}`} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Title & Message Inputs */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Notification Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Weekend Flash Sale 50% Off in Douala!"
              maxLength={80}
              required
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
            <div className="flex justify-end mt-1">
              <span className="text-[10px] text-slate-400">{title.length} / 80</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Notification Body <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter the full notification description that will be pushed to user devices and saved to their inboxes..."
              rows={3}
              maxLength={250}
              required
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
            <div className="flex justify-end mt-1">
              <span className="text-[10px] text-slate-400">{message.length} / 250</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              In-App Deep Link Action (Optional)
            </label>
            <select
              value={screenTarget}
              onChange={(e) => setScreenTarget(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            >
              <option value="default">Default (Open App Notifications Feed)</option>
              <option value="BuyerOrders">Buyer Orders & Escrow Milestone</option>
              <option value="BuyerWallet">Buyer Wallet & Balance</option>
              <option value="SellerOrders">Seller Orders Fulfillment</option>
              <option value="TransporterJobs">Transporter Dispatch Jobs</option>
            </select>
          </div>
        </div>

        {/* 4. Live Device Lockscreen Preview */}
        <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Live Device Push Preview</span>
          </div>

          <div className="p-3 bg-white/90 dark:bg-slate-900/90 rounded-xl shadow-xs border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xs">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-1.5">
                <div className="w-4 h-4 rounded-md bg-teal-600 flex items-center justify-center text-[10px] font-bold text-white">
                  W
                </div>
                <span className="text-[11px] font-semibold text-slate-900 dark:text-slate-100">Wunabuy</span>
                <span className="text-[10px] text-slate-400">• now</span>
              </div>
              <Badge variant="neutral" size="sm">
                {audience.toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
              {title || 'Your Notification Title'}
            </p>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 mt-0.5">
              {message || 'Your push notification preview message will be rendered here in real time as you compose.'}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isSubmitting || !title.trim() || !message.trim()}>
            <Send className="w-4 h-4 mr-1.5" />
            <span>{isSubmitting ? 'Broadcasting...' : 'Broadcast Notification'}</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};
