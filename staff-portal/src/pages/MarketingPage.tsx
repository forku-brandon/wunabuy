import React, { useState, useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { StatCard } from '../components/ui/StatCard';
import { Modal } from '../components/ui/Modal';
import { DataTable, Column } from '../components/ui/DataTable';
import { useStaffAuth } from '../stores/staffAuthStore';
import { formatXAF } from '@wunabuy/utils';
import { advertsApi, AdvertItem } from '../services/advertsApi';
import {
  Megaphone,
  Ticket,
  TrendingUp,
  Plus,
  Tag,
  Layout,
  Layers,
  Trash2,
  RefreshCw,
} from 'lucide-react';

interface PromoCampaignItem {
  id: string;
  promo_code: string;
  campaign_name: string;
  discount_type: 'PERCENTAGE' | 'FLAT_XAF' | 'FREE_DELIVERY';
  discount_value: string;
  min_order_amount: number;
  total_claims: number;
  max_claims: number;
  is_active: boolean;
  starts_at: string;
  expires_at: string;
}

export const MarketingPage: React.FC = () => {
  const { addAuditLog, hasPermission } = useStaffAuth();
  const canManageMarketing = hasPermission('manage_marketing');

  // Main Section Tab
  const [activeTab, setActiveTab] = useState<'adverts' | 'vouchers'>('adverts');

  // ─── ADVERTS & PARTNERS STATE ───
  const [adverts, setAdverts] = useState<AdvertItem[]>([]);
  const [advertTypeFilter, setAdvertTypeFilter] = useState<'all' | 'banner' | 'tip' | 'partner' | 'special_offer'>('all');
  const [createAdvertModalOpen, setCreateAdvertModalOpen] = useState(false);
  const [advertLoading, setAdvertLoading] = useState(false);

  // New Advert Form State
  const [advTitle, setAdvTitle] = useState('');
  const [advType, setAdvType] = useState<'banner' | 'tip' | 'partner' | 'special_offer'>('banner');
  const [advAudience, setAdvAudience] = useState<'buyer' | 'seller' | 'all'>('buyer');
  const [advBadge, setAdvBadge] = useState('');
  const [advBadgeColor, setAdvBadgeColor] = useState('#0D9488');
  const [advSubtitle, setAdvSubtitle] = useState('');
  const [advCtaText, setAdvCtaText] = useState('Explore');
  const [advImageUrl, setAdvImageUrl] = useState('');
  const [advCategory, setAdvCategory] = useState('');
  const [advSortOrder, setAdvSortOrder] = useState('1');

  // ─── VOUCHERS STATE ───
  const [campaigns, setCampaigns] = useState<PromoCampaignItem[]>(() => {
    const saved = localStorage.getItem('wunabuy_promo_campaigns');
    return saved ? JSON.parse(saved) : [];
  });
  const [createVoucherModalOpen, setCreateVoucherModalOpen] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newDiscValue, setNewDiscValue] = useState('');
  const [newMinOrder, setNewMinOrder] = useState('10000');

  useEffect(() => {
    localStorage.setItem('wunabuy_promo_campaigns', JSON.stringify(campaigns));
  }, [campaigns]);

  // Fetch live adverts from backend
  const fetchAdverts = async (silent = false) => {
    if (!silent) setAdvertLoading(true);
    try {
      const data = await advertsApi.getAdverts();
      setAdverts(data);
    } catch {
      // Handled
    } finally {
      if (!silent) setAdvertLoading(false);
    }
  };

  useEffect(() => {
    fetchAdverts();
    const interval = setInterval(() => {
      fetchAdverts(true);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Filtered Adverts
  const filteredAdverts = adverts.filter((adv) => {
    if (advertTypeFilter === 'all') return true;
    return adv.type === advertTypeFilter;
  });

  // Handle Advert Creation
  const handleCreateAdvert = async () => {
    if (!advTitle.trim()) return;

    try {
      const created = await advertsApi.createAdvert({
        title: advTitle.trim(),
        type: advType,
        target_audience: advAudience,
        badge: advBadge.trim() || undefined,
        badge_color: advBadgeColor || undefined,
        subtitle: advSubtitle.trim() || undefined,
        cta_text: advCtaText.trim() || undefined,
        image_url: advImageUrl.trim() || undefined,
        category: advCategory.trim() || undefined,
        sort_order: parseInt(advSortOrder) || 0,
        is_active: true,
      });

      addAuditLog({
        action_code: 'ADVERT_CREATE',
        action_description: `Created new ${advType} advert: "${advTitle}" for ${advAudience}`,
        target_id: created.id,
        security_level: 'INFO',
      });

      setAdverts((prev) => [created, ...prev]);
      setCreateAdvertModalOpen(false);

      // Reset form
      setAdvTitle('');
      setAdvBadge('');
      setAdvSubtitle('');
      setAdvImageUrl('');
      setAdvCategory('');
    } catch {
      // Handled
    }
  };

  // Handle Toggle Advert Status
  const handleToggleAdvertStatus = async (item: AdvertItem) => {
    const nextState = !item.is_active;
    try {
      await advertsApi.updateAdvert(item.id, { is_active: nextState });

      addAuditLog({
        action_code: nextState ? 'ADVERT_ACTIVATE' : 'ADVERT_PAUSE',
        action_description: `${nextState ? 'Activated' : 'Paused'} advert: "${item.title}"`,
        target_id: item.id,
        security_level: 'INFO',
      });

      setAdverts((prev) =>
        prev.map((a) => (a.id === item.id ? { ...a, is_active: nextState } : a))
      );
    } catch {
      // Handled
    }
  };

  // Handle Delete Advert
  const handleDeleteAdvert = async (id: string, title: string) => {
    try {
      await advertsApi.deleteAdvert(id);

      addAuditLog({
        action_code: 'ADVERT_DELETE',
        action_description: `Deleted advert "${title}" (${id})`,
        target_id: id,
        security_level: 'WARNING',
      });

      setAdverts((prev) => prev.filter((a) => a.id !== id));
    } catch {
      // Handled
    }
  };

  // Handle Voucher Creation
  const handleCreatePromo = () => {
    if (!newCode.trim() || !newName.trim() || !newDiscValue.trim()) return;

    const newPromo: PromoCampaignItem = {
      id: 'promo_' + Date.now(),
      promo_code: newCode.toUpperCase(),
      campaign_name: newName,
      discount_type: 'FLAT_XAF',
      discount_value: newDiscValue,
      min_order_amount: parseInt(newMinOrder) || 10000,
      total_claims: 0,
      max_claims: 1000,
      is_active: true,
      starts_at: new Date().toISOString().slice(0, 10),
      expires_at: '2026-12-31',
    };

    addAuditLog({
      action_code: 'MARKETING_PROMO_CREATE',
      action_description: `Created new promo campaign ${newPromo.promo_code} (${newPromo.campaign_name})`,
      target_id: newPromo.id,
      security_level: 'INFO',
    });

    setCampaigns((prev) => [newPromo, ...prev]);
    setCreateVoucherModalOpen(false);
    setNewCode('');
    setNewName('');
    setNewDiscValue('');
  };

  const handleTogglePromoStatus = (id: string) => {
    setCampaigns((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextActive = !item.is_active;
          addAuditLog({
            action_code: nextActive ? 'MARKETING_PROMO_ACTIVATE' : 'MARKETING_PROMO_DEACTIVATE',
            action_description: `${nextActive ? 'Activated' : 'Deactivated'} promo campaign ${item.promo_code}`,
            target_id: item.id,
            security_level: 'INFO',
          });
          return { ...item, is_active: nextActive };
        }
        return item;
      })
    );
  };

  // ─── ADVERTS TABLE COLUMNS ───
  const advertColumns: Column<AdvertItem>[] = [
    {
      key: 'title',
      header: 'Advert / Title & Badge',
      render: (item) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-slate-100 block">{item.title}</span>
          {item.badge && (
            <span
              className="inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded"
              style={{ backgroundColor: (item.badge_color || '#0D9488') + '22', color: item.badge_color || '#0D9488' }}
            >
              {item.badge}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type / Audience',
      render: (item) => (
        <div>
          <span className="font-bold uppercase text-[11px] text-teal-800 dark:text-teal-300 block">
            {item.type}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">
            Audience: {item.target_audience}
          </span>
        </div>
      ),
    },
    {
      key: 'subtitle',
      header: 'Category / Subtitle',
      render: (item) => (
        <span className="text-slate-600 dark:text-slate-300 text-xs block max-w-xs truncate">
          {item.category || item.subtitle || '—'}
        </span>
      ),
    },
    {
      key: 'sort_order',
      header: 'Order',
      render: (item) => (
        <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
          #{item.sort_order}
        </span>
      ),
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (item) => (
        <Badge variant={item.is_active ? 'success' : 'neutral'}>
          {item.is_active ? 'ACTIVE' : 'PAUSED'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (item) => (
        <div className="flex items-center justify-end space-x-2">
          {canManageMarketing && (
            <>
              <Button
                size="sm"
                variant={item.is_active ? 'outline' : 'primary'}
                onClick={() => handleToggleAdvertStatus(item)}
              >
                {item.is_active ? 'Pause' : 'Activate'}
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleDeleteAdvert(item.id, item.title)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  // ─── VOUCHERS TABLE COLUMNS ───
  const voucherColumns: Column<PromoCampaignItem>[] = [
    {
      key: 'promo_code',
      header: 'Promo Voucher Code',
      render: (item) => (
        <span className="font-mono font-extrabold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-lg border border-teal-200 dark:border-teal-800">
          {item.promo_code}
        </span>
      ),
    },
    {
      key: 'campaign_name',
      header: 'Campaign Name / Type',
      render: (item) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-slate-100 block">{item.campaign_name}</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Type: {item.discount_type}</span>
        </div>
      ),
    },
    {
      key: 'discount_value',
      header: 'Discount Benefit',
      render: (item) => <span className="font-bold text-slate-900 dark:text-slate-100">{item.discount_value}</span>,
    },
    {
      key: 'min_order_amount',
      header: 'Min Spend',
      render: (item) => <span className="font-bold text-slate-800 dark:text-slate-200">{formatXAF(item.min_order_amount)}</span>,
    },
    {
      key: 'total_claims',
      header: 'Claims Progress',
      render: (item) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-slate-100 block">
            {item.total_claims} / {item.max_claims}
          </span>
          <div className="w-24 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
            <div
              className="bg-teal-600 h-full rounded-full"
              style={{ width: `${Math.min(100, (item.total_claims / item.max_claims) * 100)}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (item) => (
        <Badge variant={item.is_active ? 'success' : 'neutral'}>
          {item.is_active ? 'ACTIVE' : 'EXPIRED / PAUSED'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (item) => (
        <div className="flex items-center justify-end space-x-2">
          {canManageMarketing && (
            <Button
              size="sm"
              variant={item.is_active ? 'outline' : 'primary'}
              onClick={() => handleTogglePromoStatus(item.id)}
            >
              {item.is_active ? 'Pause' : 'Activate'}
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <PageContainer
      title="Marketing &amp; Promotional Campaigns"
      subtitle="Manage Marketplace Adverts, Seller Coaching Tips, Official Partners &amp; Platform Promo Vouchers"
      action={
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => fetchAdverts(false)}
            disabled={advertLoading}
            className="flex items-center space-x-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${advertLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Adverts</span>
          </Button>
          {canManageMarketing && (
            activeTab === 'adverts' ? (
              <Button variant="primary" size="sm" onClick={() => setCreateAdvertModalOpen(true)}>
                <Plus className="w-4 h-4 mr-1.5" />
                New Advert / Partner
              </Button>
            ) : (
              <Button variant="primary" size="sm" onClick={() => setCreateVoucherModalOpen(true)}>
                <Plus className="w-4 h-4 mr-1.5" />
                Create Promo Voucher
              </Button>
            )
          )}
        </div>
      }
    >
      {/* Navigation Tabs */}
      <div className="flex items-center space-x-3 mb-6 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('adverts')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'adverts'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Marketplace Adverts &amp; Partners ({adverts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('vouchers')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'vouchers'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>Promo Vouchers &amp; Discounts</span>
        </button>
      </div>

      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="ACTIVE ADVERTS &amp; PARTNERS"
          value={`${adverts.filter((a) => a.is_active).length} Live`}
          change="Synced to Mobile"
          changeType="positive"
          icon={<Megaphone className="w-5 h-5 text-teal-600 dark:text-teal-400" />}
          iconBg="bg-teal-50 dark:bg-teal-950/60"
          description="Banners, tips &amp; official partners"
        />

        <StatCard
          title="TOTAL CLAIMS REDEEMED"
          value="2,270 Claims"
          change="35.4% Conversion"
          changeType="positive"
          icon={<Ticket className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          iconBg="bg-emerald-50 dark:bg-emerald-950/60"
          description="Vouchers redeemed at checkout"
        />

        <StatCard
          title="CAMPAIGN ATTRIBUTED GMV"
          value={formatXAF(18400000)}
          change="Q3 Yield"
          changeType="positive"
          icon={<TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          iconBg="bg-blue-50 dark:bg-blue-950/60"
          description="Gross volume generated by promos"
        />

        <StatCard
          title="DISCOUNT SUBSIDY YIELD"
          value={formatXAF(3420000)}
          change="Platform Cost"
          changeType="neutral"
          icon={<Tag className="w-5 h-5 text-teal-600 dark:text-teal-400" />}
          iconBg="bg-teal-50 dark:bg-teal-950/60"
          description="Total promo subsidy invested"
        />
      </div>

      {/* TAB 1: ADVERTS & PARTNERS */}
      {activeTab === 'adverts' && (
        <div className="space-y-4">
          {/* Sub-Filters */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1">
            {[
              { id: 'all', label: 'All Campaigns' },
              { id: 'banner', label: 'Buyer Banners' },
              { id: 'tip', label: 'Seller Growth Tips' },
              { id: 'partner', label: 'Official Partners' },
              { id: 'special_offer', label: 'Special Offers' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setAdvertTypeFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  advertTypeFilter === f.id
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <DataTable
            data={filteredAdverts}
            columns={advertColumns}
            searchPlaceholder="Search advert title, badge, category..."
            pageSize={10}
            emptyMessage={advertLoading ? 'Loading adverts...' : 'No adverts found for this filter.'}
          />
        </div>
      )}

      {/* TAB 2: VOUCHERS */}
      {activeTab === 'vouchers' && (
        <DataTable
          data={campaigns}
          columns={voucherColumns}
          searchPlaceholder="Search promo code, campaign name..."
          pageSize={5}
          emptyMessage="No promo campaigns found."
        />
      )}

      {/* CREATE NEW ADVERT / PARTNER MODAL */}
      <Modal
        isOpen={createAdvertModalOpen}
        onClose={() => setCreateAdvertModalOpen(false)}
        title="Create Marketplace Advert, Tip or Partner"
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Campaign Type *</label>
              <select
                value={advType}
                onChange={(e) => setAdvType(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100"
              >
                <option value="banner">Buyer Hero Banner</option>
                <option value="tip">Seller Sales Tip &amp; Growth</option>
                <option value="partner">Official Platform Partner</option>
                <option value="special_offer">Special Offer</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Target Audience *</label>
              <select
                value={advAudience}
                onChange={(e) => setAdvAudience(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100"
              >
                <option value="buyer">Buyer Mobile App</option>
                <option value="seller">Seller Dashboard</option>
                <option value="all">All Audiences (Universal)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Title / Headline *</label>
            <input
              type="text"
              placeholder="e.g. Flash Clearance Weekend or MTN MoMo"
              value={advTitle}
              onChange={(e) => setAdvTitle(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Badge / Eyebrow Text</label>
              <input
                type="text"
                placeholder="e.g. ⚡ 30% OFF or 1-Tap Cashout"
                value={advBadge}
                onChange={(e) => setAdvBadge(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Badge Color Hex</label>
              <input
                type="text"
                placeholder="#0D9488"
                value={advBadgeColor}
                onChange={(e) => setAdvBadgeColor(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Subtitle / Description</label>
            <textarea
              rows={2}
              placeholder="Brief promotional copy shown on the card or banner..."
              value={advSubtitle}
              onChange={(e) => setAdvSubtitle(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Button CTA Text</label>
              <input
                type="text"
                placeholder="e.g. Shop Now or View Queue"
                value={advCtaText}
                onChange={(e) => setAdvCtaText(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Display Sort Order</label>
              <input
                type="number"
                placeholder="1"
                value={advSortOrder}
                onChange={(e) => setAdvSortOrder(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Image URL (Unsplash or CDN)</label>
            <input
              type="text"
              placeholder="https://images.unsplash.com/..."
              value={advImageUrl}
              onChange={(e) => setAdvImageUrl(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setCreateAdvertModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" disabled={!advTitle.trim()} onClick={handleCreateAdvert}>
              Publish Advert &amp; Sync to Mobile
            </Button>
          </div>
        </div>
      </Modal>

      {/* CREATE NEW PROMO MODAL */}
      <Modal
        isOpen={createVoucherModalOpen}
        onClose={() => setCreateVoucherModalOpen(false)}
        title="Create New Platform Promo Voucher"
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Voucher Code *</label>
              <input
                type="text"
                placeholder="e.g. WUNASALE20"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono uppercase font-bold text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Discount Amount (FCFA) *</label>
              <input
                type="text"
                placeholder="e.g. 2500 FCFA"
                value={newDiscValue}
                onChange={(e) => setNewDiscValue(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Campaign Title *</label>
            <input
              type="text"
              placeholder="e.g. Douala Tech Weekend Special"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Minimum Order Spend (XAF)</label>
            <input
              type="number"
              value={newMinOrder}
              onChange={(e) => setNewMinOrder(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setCreateVoucherModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" disabled={!newCode.trim() || !newName.trim() || !newDiscValue.trim()} onClick={handleCreatePromo}>
              Publish Voucher &amp; Log Audit
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
};
