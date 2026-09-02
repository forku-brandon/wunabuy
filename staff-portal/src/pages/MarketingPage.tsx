import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { StatCard } from '../components/ui/StatCard';
import { Modal } from '../components/ui/Modal';
import { DataTable, Column } from '../components/ui/DataTable';
import { useStaffAuth } from '../stores/staffAuthStore';
import {
  Megaphone,
  Plus,
  Eye,
  MousePointerClick,
  TrendingUp,
  Tag,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

interface PromoCampaignItem {
  id: string;
  campaign_code: string;
  title: string;
  target_role: 'BUYER' | 'SELLER' | 'TRANSPORTER';
  discount_percentage: number;
  max_claims: number;
  claimed_count: number;
  status: 'ACTIVE' | 'PAUSED' | 'EXPIRED';
  valid_until: string;
}

const MOCK_CAMPAIGNS: PromoCampaignItem[] = [
  {
    id: 'cmp_101',
    campaign_code: 'DOUALA-TECH-2026',
    title: 'Douala Tech Week 10% Discount Promo',
    target_role: 'BUYER',
    discount_percentage: 10,
    max_claims: 500,
    claimed_count: 342,
    status: 'ACTIVE',
    valid_until: '2026-09-30',
  },
  {
    id: 'cmp_102',
    campaign_code: 'ZERO-ESCROW-FEE',
    title: 'Zero Escrow Fee Promotion for Top Sellers',
    target_role: 'SELLER',
    discount_percentage: 100,
    max_claims: 100,
    claimed_count: 88,
    status: 'ACTIVE',
    valid_until: '2026-10-15',
  },
  {
    id: 'cmp_103',
    campaign_code: 'RIDER-BONUS-5K',
    title: 'Rider 5,000 FCFA Bonus for 20 Deliveries/Week',
    target_role: 'TRANSPORTER',
    discount_percentage: 15,
    max_claims: 200,
    claimed_count: 200,
    status: 'EXPIRED',
    valid_until: '2026-08-31',
  },
];

export const MarketingPage: React.FC = () => {
  const { user, addAuditLog, hasPermission } = useStaffAuth();
  const [campaigns, setCampaigns] = useState<PromoCampaignItem[]>(MOCK_CAMPAIGNS);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [targetRole, setTargetRole] = useState<'BUYER' | 'SELLER' | 'TRANSPORTER'>('BUYER');
  const [discount, setDiscount] = useState('10');

  const canManageMarketing = hasPermission('manage_marketing');

  const handleCreateCampaign = () => {
    if (!title.trim() || !code.trim()) return;

    const newCampaign: PromoCampaignItem = {
      id: 'cmp_' + Date.now().toString().slice(-4),
      campaign_code: code.toUpperCase(),
      title,
      target_role: targetRole,
      discount_percentage: Number(discount),
      max_claims: 500,
      claimed_count: 0,
      status: 'ACTIVE',
      valid_until: '2026-12-31',
    };

    setCampaigns((prev) => [newCampaign, ...prev]);

    addAuditLog({
      action_code: 'MARKETING_CAMPAIGN_CREATE',
      action_description: `Created promo campaign ${newCampaign.campaign_code} (${newCampaign.title})`,
      target_id: newCampaign.id,
      security_level: 'INFO',
    });

    setCreateModalOpen(false);
    setTitle('');
    setCode('');
  };

  const columns: Column<PromoCampaignItem>[] = [
    {
      key: 'campaign_code',
      header: 'Promo Code',
      render: (item) => <span className="font-mono font-bold text-slate-900">{item.campaign_code}</span>,
    },
    {
      key: 'title',
      header: 'Campaign Title',
      render: (item) => (
        <div>
          <span className="font-bold text-slate-900 block">{item.title}</span>
          <span className="text-[11px] text-slate-500 font-medium">Target: {item.target_role}</span>
        </div>
      ),
    },
    {
      key: 'discount_percentage',
      header: 'Discount / Incentive',
      render: (item) => <span className="font-bold text-slate-900">{item.discount_percentage}% Fee Discount</span>,
    },
    {
      key: 'claimed_count',
      header: 'Claims Progress',
      render: (item) => (
        <span className="font-semibold text-slate-700">
          {item.claimed_count} / {item.max_claims} Claims
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <Badge variant={item.status === 'ACTIVE' ? 'success' : 'neutral'}>
          {item.status}
        </Badge>
      ),
    },
    {
      key: 'valid_until',
      header: 'Expiry Date',
      render: (item) => <span className="font-mono text-slate-900 font-semibold">{item.valid_until}</span>,
    },
  ];

  return (
    <PageContainer
      title="Marketing &amp; Promotional Campaigns Engine"
      subtitle="Broadcast Banner Promotions, Merchant Commission Discounts &amp; Transporter Delivery Incentives"
      action={
        canManageMarketing && (
          <Button variant="primary" size="sm" onClick={() => setCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Create Campaign Banner
          </Button>
        )
      }
    >
      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="ACTIVE PROMO CAMPAIGNS"
          value="2 Campaigns"
          change="Live Banners"
          changeType="positive"
          icon={<Megaphone className="w-5 h-5 text-teal-600" />}
          iconBg="bg-teal-50"
          description="Broadcasting across mobile apps"
        />

        <StatCard
          title="TOTAL PROMO CLAIMS"
          value="630 Claims"
          change="+24% this week"
          changeType="positive"
          icon={<Tag className="w-5 h-5 text-amber-600" />}
          iconBg="bg-amber-50"
          description="Vouchers redeemed by buyers/sellers"
        />

        <StatCard
          title="BANNER IMPRESSIONS"
          value="142,500 Views"
          change="Douala & Yaoundé"
          changeType="positive"
          icon={<Eye className="w-5 h-5 text-blue-600" />}
          iconBg="bg-blue-50"
          description="App homepage hero banner views"
        />

        <StatCard
          title="CONVERSION CTR"
          value="8.4%"
          change="High Engagement"
          changeType="positive"
          icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
          iconBg="bg-emerald-50"
          description="Click-through rate to store pages"
        />
      </div>

      {/* Advanced Reusable DataTable */}
      <DataTable
        data={campaigns}
        columns={columns}
        searchPlaceholder="Search promo code or campaign title..."
        pageSize={5}
        emptyMessage="No promo campaigns found."
      />

      {/* CREATE CAMPAIGN MODAL */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Promotional Banner Campaign"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Campaign Title *</label>
            <input
              type="text"
              placeholder="e.g. Douala Tech Week 10% Discount"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Promo Code *</label>
              <input
                type="text"
                placeholder="e.g. TECH2026"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold uppercase"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Target Role</label>
              <select
                value={targetRole}
                onChange={(e: any) => setTargetRole(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              >
                <option value="BUYER">BUYER — Mobile App Shoppers</option>
                <option value="SELLER">SELLER — Store Merchants</option>
                <option value="TRANSPORTER">TRANSPORTER — Delivery Drivers</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" disabled={!title.trim() || !code.trim()} onClick={handleCreateCampaign}>
              Create Campaign &amp; Log Audit
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
};
