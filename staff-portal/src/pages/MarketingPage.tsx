import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { StatCard } from '../components/ui/StatCard';
import { Modal } from '../components/ui/Modal';
import { DataTable, Column } from '../components/ui/DataTable';
import { useStaffAuth } from '../stores/staffAuthStore';
import { formatXAF } from '@wunabuy/utils';
import {
  Megaphone,
  Ticket,
  TrendingUp,
  Plus,
  Tag,
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

const MOCK_PROMO_CAMPAIGNS: PromoCampaignItem[] = [
  {
    id: 'promo_1',
    promo_code: 'WUNABUY2026',
    campaign_name: 'Q3 New User Welcome Discount',
    discount_type: 'FLAT_XAF',
    discount_value: '2 000 FCFA',
    min_order_amount: 10000,
    total_claims: 1420,
    max_claims: 5000,
    is_active: true,
    starts_at: '2026-08-01',
    expires_at: '2026-09-30',
  },
  {
    id: 'promo_2',
    promo_code: 'DOUALAFREE',
    campaign_name: 'Free Delivery Weekend (Akwa Hub)',
    discount_type: 'FREE_DELIVERY',
    discount_value: '100% Off Shipping',
    min_order_amount: 15000,
    total_claims: 850,
    max_claims: 1000,
    is_active: true,
    starts_at: '2026-08-25',
    expires_at: '2026-09-05',
  },
  {
    id: 'promo_3',
    promo_code: 'TECHDEALS15',
    campaign_name: 'Electronics Flash Clearance',
    discount_type: 'PERCENTAGE',
    discount_value: '15% Off',
    min_order_amount: 50000,
    total_claims: 320,
    max_claims: 500,
    is_active: false,
    starts_at: '2026-07-01',
    expires_at: '2026-07-31',
  },
];

export const MarketingPage: React.FC = () => {
  const { addAuditLog, hasPermission } = useStaffAuth();
  const [campaigns, setCampaigns] = useState<PromoCampaignItem[]>(MOCK_PROMO_CAMPAIGNS);
  
  // Create Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newDiscValue, setNewDiscValue] = useState('');
  const [newMinOrder, setNewMinOrder] = useState('10000');

  const canManageMarketing = hasPermission('manage_marketing');

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

    setCreateModalOpen(false);
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

  const columns: Column<PromoCampaignItem>[] = [
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
      title="Marketing Banners &amp; Promo Voucher Center"
      subtitle="Configure Platform Vouchers, Referral Coupons, Merchant Sponsored Ads &amp; Campaign Yield"
      action={
        canManageMarketing ? (
          <Button variant="primary" size="sm" onClick={() => setCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Create Promo Voucher
          </Button>
        ) : undefined
      }
    >
      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="ACTIVE PROMO CAMPAIGNS"
          value="2 Campaigns"
          change="Live Vouchers"
          changeType="positive"
          icon={<Megaphone className="w-5 h-5 text-teal-600 dark:text-teal-400" />}
          iconBg="bg-teal-50 dark:bg-teal-950/60"
          description="Active customer discount codes"
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

      {/* Advanced Reusable DataTable */}
      <DataTable
        data={campaigns}
        columns={columns}
        searchPlaceholder="Search promo code, campaign name..."
        pageSize={5}
        emptyMessage="No promo campaigns found."
      />

      {/* CREATE NEW PROMO MODAL */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
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
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
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
