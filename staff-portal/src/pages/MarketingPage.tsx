import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { StatCard } from '../components/ui/StatCard';
import { Modal } from '../components/ui/Modal';
import { useStaffAuth } from '../stores/staffAuthStore';
import { Megaphone, Sparkles, Image as ImageIcon, Eye, Tag, Plus, Check } from 'lucide-react';

interface PromoBannerItem {
  id: string;
  title: string;
  subtitle: string;
  badge_text: string;
  target_category: string;
  is_active: boolean;
  impressions_count: number;
}

const MOCK_PROMO_BANNERS: PromoBannerItem[] = [
  {
    id: 'promo_1',
    title: 'Up to 30% Off Tech Items',
    subtitle: 'On selected beauty & verified electronics in Douala',
    badge_text: '30% OFF',
    target_category: 'Electronics',
    is_active: true,
    impressions_count: 14200,
  },
  {
    id: 'promo_2',
    title: 'Free Escrow Protection Week',
    subtitle: 'Zero fee buyer protection on all fashion orders',
    badge_text: 'FREE ESCROW',
    target_category: 'Fashion',
    is_active: true,
    impressions_count: 9800,
  },
];

export const MarketingPage: React.FC = () => {
  const { addAuditLog } = useStaffAuth();
  const [banners, setBanners] = useState<PromoBannerItem[]>(MOCK_PROMO_BANNERS);
  const [modalOpen, setModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newBadge, setNewBadge] = useState('');

  const toggleBannerStatus = (id: string) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, is_active: !b.is_active } : b))
    );
    addAuditLog({
      action_code: 'MARKETING_PROMO_TOGGLE',
      action_description: `Toggled promo banner active status for banner #${id}`,
      target_id: id,
      security_level: 'INFO',
    });
  };

  const handleCreateBanner = () => {
    if (!newTitle.trim()) return;

    const newBanner: PromoBannerItem = {
      id: 'promo_' + Date.now().toString().slice(-4),
      title: newTitle,
      subtitle: newSubtitle || 'Special Cameroon Merchant Deal',
      badge_text: newBadge || 'PROMO',
      target_category: 'General',
      is_active: true,
      impressions_count: 0,
    };

    setBanners((prev) => [newBanner, ...prev]);
    addAuditLog({
      action_code: 'MARKETING_PROMO_CREATE',
      action_description: `Created new platform marketing promo banner: ${newTitle}`,
      target_id: newBanner.id,
      security_level: 'INFO',
    });

    setModalOpen(false);
    setNewTitle('');
    setNewSubtitle('');
    setNewBadge('');
  };

  return (
    <PageContainer
      title="Marketing & Merchant Growth Center"
      subtitle="Manage App-Wide Promo Banners, Merchant Growth Tips & Departmental Consumer Demand Analytics"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="ACTIVE PROMO BANNERS"
          value={`${banners.filter((b) => b.is_active).length} Banners`}
          change="Buyer & Cart Apps"
          changeType="positive"
          icon={<Megaphone className="w-5 h-5 text-teal-600" />}
          description="Live campaigns running in mobile app"
        />

        <StatCard
          title="CAMPAIGN IMPRESSIONS"
          value="24,000 Views"
          change="+14.2% YoY"
          changeType="positive"
          icon={<Eye className="w-5 h-5 text-blue-600" />}
          description="Total promotional impressions this week"
        />

        <StatCard
          title="MERCHANT GROWTH TIPS"
          value="4 Active Slides"
          change="Seller Dashboard"
          changeType="neutral"
          icon={<Sparkles className="w-5 h-5 text-amber-500" />}
          description="Auto-slide growth tips carousel"
        />
      </div>

      <Card className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-heading">
              App Promotional Banners
            </h3>
            <p className="text-xs text-slate-500">Configure promotional carousels displayed on mobile Home &amp; Cart screens</p>
          </div>

          <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Create Campaign Banner
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map((b) => (
            <div key={b.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 relative">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-teal-100 text-teal-800 uppercase">
                    {b.badge_text}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-2">{b.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{b.subtitle}</p>
                </div>

                <Button
                  size="sm"
                  variant={b.is_active ? 'primary' : 'outline'}

                  onClick={() => toggleBannerStatus(b.id)}
                >
                  {b.is_active ? 'ACTIVE' : 'PAUSED'}
                </Button>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <span>Category: <strong className="text-slate-700">{b.target_category}</strong></span>
                <span>Impressions: <strong className="text-slate-700">{b.impressions_count.toLocaleString()} views</strong></span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create New Platform Promo Banner">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Banner Title *</label>
            <input
              type="text"
              placeholder="e.g. Up to 30% Off Electronics"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Subtitle / Offer Description</label>
            <input
              type="text"
              placeholder="e.g. On selected beauty & verified items in Douala"
              value={newSubtitle}
              onChange={(e) => setNewSubtitle(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Badge Callout Text</label>
            <input
              type="text"
              placeholder="e.g. 30% OFF or SPECIAL DEAL"
              value={newBadge}
              onChange={(e) => setNewBadge(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" disabled={!newTitle.trim()} onClick={handleCreateBanner}>
              Publish Banner to Mobile App
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
};
