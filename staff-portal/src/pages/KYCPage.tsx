import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ImageLightbox } from '../components/ui/ImageLightbox';
import { KYCStatus, ProductCategory } from '@wunabuy/types';
import { useStaffAuth } from '../stores/staffAuthStore';
import { Search, Eye, CheckCircle2, XCircle, FileText, MapPin, Building2, ShieldCheck, UserCheck, Bike } from 'lucide-react';

interface MerchantKYCItem {
  id: string;
  type: 'merchant' | 'driver';
  store_or_driver_name: string;
  owner_name: string;
  owner_phone: string;
  category_or_modality: string;
  address_text: string;
  city: string;
  status: KYCStatus;
  id_card_front: string;
  id_card_back: string;
  primary_photo: string;
  secondary_doc?: string;
  submitted_at: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
}

const MOCK_KYC_SUBMISSIONS: MerchantKYCItem[] = [
  {
    id: 'kyc_101',
    type: 'merchant',
    store_or_driver_name: 'Douala Tech Hub',
    owner_name: 'Emmanuel Nsangou',
    owner_phone: '+237 670 123 456',
    category_or_modality: 'Electronics',
    address_text: 'Rue Joss, Akwa',
    city: 'Douala',
    status: KYCStatus.PENDING,
    id_card_front: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    id_card_back: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    primary_photo: 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&w=800&q=80',
    submitted_at: '2026-09-02 10:15',
    risk_level: 'LOW',
  },
  {
    id: 'kyc_201',
    type: 'driver',
    store_or_driver_name: 'Jean-Paul Nkoum (Bike 🏍️)',
    owner_name: 'Jean-Paul Nkoum',
    owner_phone: '+237 670 112 233',
    category_or_modality: 'Category A & B Permit',
    address_text: 'Quartier Bali',
    city: 'Douala',
    status: KYCStatus.PENDING,
    id_card_front: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    id_card_back: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    primary_photo: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80',
    submitted_at: '2026-09-02 09:30',
    risk_level: 'LOW',
  },
  {
    id: 'kyc_102',
    type: 'merchant',
    store_or_driver_name: 'Penja Organic Farm Shop',
    owner_name: 'Chantal Ngo',
    owner_phone: '+237 699 887 766',
    category_or_modality: 'Food & Groceries',
    address_text: 'Marché Central, Bonanjo',
    city: 'Douala',
    status: KYCStatus.UNDER_REVIEW,
    id_card_front: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    id_card_back: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    primary_photo: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80',
    submitted_at: '2026-08-25 14:30',
    risk_level: 'MEDIUM',
  },
  {
    id: 'kyc_103',
    type: 'merchant',
    store_or_driver_name: 'Heritage African Couture',
    owner_name: 'Josephine Tchakounte',
    owner_phone: '+237 675 443 322',
    category_or_modality: 'Fashion',
    address_text: 'Avenue King Akwa',
    city: 'Douala',
    status: KYCStatus.APPROVED,
    id_card_front: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    id_card_back: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    primary_photo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
    submitted_at: '2026-08-24 09:00',
    risk_level: 'LOW',
  },
];

export const KYCPage: React.FC = () => {
  const { addAuditLog, hasPermission } = useStaffAuth();
  const [submissions, setSubmissions] = useState<MerchantKYCItem[]>(MOCK_KYC_SUBMISSIONS);
  const [kycTypeFilter, setKycTypeFilter] = useState<'ALL' | 'merchant' | 'driver'>('ALL');
  const [activeTab, setActiveTab] = useState<'ALL' | KYCStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSub, setSelectedSub] = useState<MerchantKYCItem | null>(null);

  const [lightboxImage, setLightboxImage] = useState<{ uri: string; title: string } | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const canApprove = hasPermission('approve_kyc');

  const filteredList = submissions.filter((item) => {
    if (kycTypeFilter !== 'ALL' && item.type !== kycTypeFilter) return false;
    if (activeTab !== 'ALL' && item.status !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.store_or_driver_name.toLowerCase().includes(q) ||
        item.owner_name.toLowerCase().includes(q) ||
        item.address_text.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleApprove = (id: string) => {
    const target = submissions.find((s) => s.id === id);
    if (!target) return;

    setSubmissions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: KYCStatus.APPROVED } : item))
    );

    addAuditLog({
      action_code: target.type === 'merchant' ? 'KYC_MERCHANT_APPROVE' : 'KYC_DRIVER_APPROVE',
      action_description: `Approved ${target.type} KYC submission for ${target.store_or_driver_name}`,
      target_id: id,
      security_level: 'INFO',
    });

    if (selectedSub?.id === id) {
      setSelectedSub((prev) => (prev ? { ...prev, status: KYCStatus.APPROVED } : null));
    }
  };

  const handleRejectConfirm = () => {
    if (!selectedSub || !rejectionReason.trim()) return;

    setSubmissions((prev) =>
      prev.map((item) =>
        item.id === selectedSub.id ? { ...item, status: KYCStatus.REJECTED } : item
      )
    );

    addAuditLog({
      action_code: selectedSub.type === 'merchant' ? 'KYC_MERCHANT_REJECT' : 'KYC_DRIVER_REJECT',
      action_description: `Rejected ${selectedSub.type} KYC submission for ${selectedSub.store_or_driver_name}. Reason: ${rejectionReason}`,
      target_id: selectedSub.id,
      security_level: 'WARNING',
    });

    setSelectedSub((prev) => (prev ? { ...prev, status: KYCStatus.REJECTED } : null));
    setRejectModalOpen(false);
    setRejectionReason('');
  };

  return (
    <PageContainer
      title="Merchant & Transporter KYC Compliance Engine"
      subtitle="Verify National ID (CNI), Storefront Photos, Driver Licenses & Commercial Operating Permits"
    >
      {/* Type Filter & Status Filter Tabs */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setKycTypeFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              kycTypeFilter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Submissions
          </button>
          <button
            onClick={() => setKycTypeFilter('merchant')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center space-x-1.5 ${
              kycTypeFilter === 'merchant' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Store Merchants</span>
          </button>
          <button
            onClick={() => setKycTypeFilter('driver')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center space-x-1.5 ${
              kycTypeFilter === 'driver' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            <span>Transport Drivers</span>
          </button>
        </div>

        <div className="w-full md:w-72 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search store name, owner, quarter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Submissions List Column */}
        <div className="lg:col-span-2 space-y-4">
          {filteredList.map((item) => (
            <Card
              key={item.id}
              className={`transition-all cursor-pointer border ${
                selectedSub?.id === item.id ? 'border-teal-500 ring-2 ring-teal-500/20 bg-teal-50/20' : 'hover:border-slate-300'
              }`}
              onClick={() => setSelectedSub(item)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono text-slate-400">#{item.id}</span>
                    <Badge variant={item.type === 'merchant' ? 'teal' : 'amber'}>
                      {item.type === 'merchant' ? 'MERCHANT' : 'DRIVER'}
                    </Badge>
                    <Badge
                      variant={
                        item.status === KYCStatus.APPROVED
                          ? 'success'
                          : item.status === KYCStatus.REJECTED
                          ? 'error'
                          : 'warning'
                      }
                    >
                      {item.status}
                    </Badge>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 font-heading mt-1">
                    {item.store_or_driver_name}
                  </h3>

                  <div className="flex items-center space-x-4 text-xs text-slate-500 mt-1">
                    <span>Owner: <strong className="text-slate-700">{item.owner_name}</strong></span>
                    <span>Phone: <strong className="text-slate-700">{item.owner_phone}</strong></span>
                  </div>
                </div>

                <Button size="sm" variant="outline" onClick={() => setSelectedSub(item)}>
                  Inspect Documents
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Document Inspection Lightbox Panel */}
        <Card className="lg:col-span-1">
          {selectedSub ? (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <Badge variant={selectedSub.type === 'merchant' ? 'teal' : 'amber'} className="mb-2">
                  {selectedSub.type === 'merchant' ? 'MERCHANT STORE KYC' : 'DRIVER PERMIT KYC'}
                </Badge>
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  {selectedSub.store_or_driver_name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedSub.address_text}, {selectedSub.city}</p>
              </div>

              {/* Document Thumbnails */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Submitted Verification Documents
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    className="border border-slate-200 rounded-lg overflow-hidden cursor-pointer group relative"
                    onClick={() => setLightboxImage({ uri: selectedSub.id_card_front, title: 'National ID (CNI Front)' })}
                  >
                    <img src={selectedSub.id_card_front} alt="CNI Front" className="w-full h-24 object-cover group-hover:scale-105 transition-transform" />
                    <span className="absolute bottom-1 left-1 text-[9px] font-bold bg-slate-900/80 text-white px-1.5 py-0.5 rounded">
                      CNI FRONT
                    </span>
                  </div>

                  <div
                    className="border border-slate-200 rounded-lg overflow-hidden cursor-pointer group relative"
                    onClick={() => setLightboxImage({ uri: selectedSub.id_card_back, title: 'National ID (CNI Back)' })}
                  >
                    <img src={selectedSub.id_card_back} alt="CNI Back" className="w-full h-24 object-cover group-hover:scale-105 transition-transform" />
                    <span className="absolute bottom-1 left-1 text-[9px] font-bold bg-slate-900/80 text-white px-1.5 py-0.5 rounded">
                      CNI BACK
                    </span>
                  </div>

                  <div
                    className="col-span-2 border border-slate-200 rounded-lg overflow-hidden cursor-pointer group relative"
                    onClick={() => setLightboxImage({ uri: selectedSub.primary_photo, title: selectedSub.type === 'merchant' ? 'Storefront Photo' : 'Vehicle Photo' })}
                  >
                    <img src={selectedSub.primary_photo} alt="Primary Photo" className="w-full h-32 object-cover group-hover:scale-105 transition-transform" />
                    <span className="absolute bottom-1 left-1 text-[9px] font-bold bg-slate-900/80 text-white px-1.5 py-0.5 rounded">
                      {selectedSub.type === 'merchant' ? 'STOREFRONT PHOTO' : 'VEHICLE & PERMIT PHOTO'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {canApprove && selectedSub.status !== KYCStatus.APPROVED && (
                <div className="flex space-x-3 pt-4 border-t border-slate-200">
                  <Button variant="danger" className="flex-1" onClick={() => setRejectModalOpen(true)}>
                    <XCircle className="w-4 h-4 mr-1.5" />
                    Reject
                  </Button>
                  <Button variant="primary" className="flex-1" onClick={() => handleApprove(selectedSub.id)}>
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                    Approve KYC
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Select a submission from the list to inspect submitted CNI and storefront photos.
            </div>
          )}
        </Card>
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <ImageLightbox
          isOpen={Boolean(lightboxImage)}
          onClose={() => setLightboxImage(null)}
          imageUri={lightboxImage.uri}
          title={lightboxImage.title}
        />
      )}

      {/* Reject Modal */}
      <Modal isOpen={rejectModalOpen} onClose={() => setRejectModalOpen(false)} title="Reject KYC Submission">
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Please provide a specific rejection reason. This will be sent directly to the merchant/driver app.
          </p>

          <textarea
            rows={3}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="e.g. CNI photo is blurry or expired. Please upload clear front and back pictures."
            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <Button variant="outline" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" disabled={!rejectionReason.trim()} onClick={handleRejectConfirm}>
              Confirm Rejection &amp; Record Audit Log
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
};
