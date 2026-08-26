import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { ImageLightbox } from '../components/ui/ImageLightbox';
import { KYCStatus, ProductCategory } from '@wunabuy/types';
import { Search, Eye, CheckCircle2, XCircle, FileText, MapPin, Building2 } from 'lucide-react';

interface KYCSubmissionItem {
  id: string;
  store_name: string;
  owner_name: string;
  owner_phone: string;
  category: ProductCategory;
  address_text: string;
  city: string;
  status: KYCStatus;
  id_card_front: string;
  id_card_back: string;
  storefront_photo: string;
  business_reg_or_affidavit?: string;
  submitted_at: string;
}

const MOCK_KYC_SUBMISSIONS: KYCSubmissionItem[] = [
  {
    id: 'kyc_101',
    store_name: 'Douala Tech Hub',
    owner_name: 'Emmanuel Nsangou',
    owner_phone: '+237 670 123 456',
    category: ProductCategory.ELECTRONICS,
    address_text: 'Rue Joss, Akwa',
    city: 'Douala',
    status: KYCStatus.PENDING,
    id_card_front: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    id_card_back: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    storefront_photo: 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&w=800&q=80',
    submitted_at: '2026-08-26 10:15',
  },
  {
    id: 'kyc_102',
    store_name: 'Penja Organic Farm Shop',
    owner_name: 'Chantal Ngo',
    owner_phone: '+237 699 887 766',
    category: ProductCategory.FOOD_GROCERIES,
    address_text: 'Marché Central, Bonanjo',
    city: 'Douala',
    status: KYCStatus.UNDER_REVIEW,
    id_card_front: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    id_card_back: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    storefront_photo: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80',
    submitted_at: '2026-08-25 14:30',
  },
  {
    id: 'kyc_103',
    store_name: 'Heritage African Couture',
    owner_name: 'Josephine Tchakounte',
    owner_phone: '+237 675 443 322',
    category: ProductCategory.FASHION,
    address_text: 'Avenue King Akwa',
    city: 'Douala',
    status: KYCStatus.APPROVED,
    id_card_front: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    id_card_back: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    storefront_photo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
    submitted_at: '2026-08-24 09:00',
  },
];

export const KYCPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<KYCSubmissionItem[]>(MOCK_KYC_SUBMISSIONS);
  const [activeTab, setActiveTab] = useState<'ALL' | KYCStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSub, setSelectedSub] = useState<KYCSubmissionItem | null>(null);

  // Modals & Lightbox state
  const [lightboxImage, setLightboxImage] = useState<{ uri: string; title: string } | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const filteredList = submissions.filter((item) => {
    if (activeTab !== 'ALL' && item.status !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.store_name.toLowerCase().includes(q) ||
        item.owner_name.toLowerCase().includes(q) ||
        item.address_text.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleApprove = (id: string) => {
    setSubmissions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: KYCStatus.APPROVED } : item))
    );
    setSelectedSub(null);
  };

  const handleConfirmReject = () => {
    if (!selectedSub || !rejectionReason.trim()) return;
    setSubmissions((prev) =>
      prev.map((item) => (item.id === selectedSub.id ? { ...item, status: KYCStatus.REJECTED } : item))
    );
    setRejectModalOpen(false);
    setSelectedSub(null);
    setRejectionReason('');
  };

  return (
    <PageContainer
      title="Store KYC Verification Center"
      subtitle="Review government IDs and storefront documents to grant selling permissions."
    >
      {/* Filter Tabs & Search Header */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-2 border-b md:border-b-0 border-slate-200 pb-2 md:pb-0">
            {(['ALL', KYCStatus.PENDING, KYCStatus.UNDER_REVIEW, KYCStatus.APPROVED, KYCStatus.REJECTED] as const).map(
              (tab) => {
                const isSelected = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                      isSelected
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {tab.replace('_', ' ')}
                  </button>
                );
              }
            )}
          </div>

          <div className="w-full md:w-72">
            <Input
              placeholder="Search store or owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
        </div>
      </Card>

      {/* KYC Submissions Data Table */}
      <Card className="p-0 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-6">Store Details</th>
              <th className="py-3.5 px-6">Owner Info</th>
              <th className="py-3.5 px-6">Category</th>
              <th className="py-3.5 px-6">Location</th>
              <th className="py-3.5 px-6">Status</th>
              <th className="py-3.5 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {filteredList.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-4 px-6 font-bold text-slate-900">
                  {item.store_name}
                  <span className="block text-[10px] text-slate-400 font-normal">
                    Submitted: {item.submitted_at}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span className="font-semibold text-slate-800 block">{item.owner_name}</span>
                  <span className="text-slate-500 text-[11px]">{item.owner_phone}</span>
                </td>
                <td className="py-4 px-6 text-slate-600">{item.category}</td>
                <td className="py-4 px-6 text-slate-600">
                  {item.address_text}, {item.city}
                </td>
                <td className="py-4 px-6">
                  <Badge
                    variant={
                      item.status === KYCStatus.APPROVED
                        ? 'success'
                        : item.status === KYCStatus.REJECTED
                        ? 'error'
                        : 'warning'
                    }
                  >
                    {item.status.replace('_', ' ')}
                  </Badge>
                </td>
                <td className="py-4 px-6 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Eye className="w-3.5 h-3.5" />}
                    onClick={() => setSelectedSub(item)}
                  >
                    Inspect KYC
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* KYC Inspection Drawer / Modal */}
      {selectedSub && (
        <Modal
          isOpen={Boolean(selectedSub)}
          onClose={() => setSelectedSub(null)}
          title={`KYC Application Inspection — ${selectedSub.store_name}`}
          maxWidth="4xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Store Information */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Merchant Details
                </h4>
                <p className="text-sm font-bold text-slate-900">{selectedSub.store_name}</p>
                <p className="text-xs text-slate-600">Owner: {selectedSub.owner_name} ({selectedSub.owner_phone})</p>
                <p className="text-xs text-slate-600">Category: {selectedSub.category}</p>
                <p className="text-xs text-slate-600 flex items-center mt-1">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {selectedSub.address_text}, {selectedSub.city}
                </p>
              </div>

              {/* Decision Action Group */}
              <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 space-y-3">
                <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wider">
                  Staff Adjudication Decision
                </h4>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1"
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                    onClick={() => handleApprove(selectedSub.id)}
                  >
                    Approve Store KYC
                  </Button>

                  <Button
                    variant="danger"
                    size="sm"
                    className="flex-1"
                    leftIcon={<XCircle className="w-4 h-4" />}
                    onClick={() => setRejectModalOpen(true)}
                  >
                    Reject Application
                  </Button>
                </div>
              </div>
            </div>

            {/* Document Image Thumbnails */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Uploaded Verification Documents
              </h4>

              <div className="grid grid-cols-2 gap-3">
                {/* ID Front */}
                <div
                  onClick={() => setLightboxImage({ uri: selectedSub.id_card_front, title: 'National ID Card (Front)' })}
                  className="cursor-pointer group relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100 h-32"
                >
                  <img src={selectedSub.id_card_front} alt="ID Front" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <span className="absolute bottom-1 left-1 bg-slate-900/80 text-white text-[9px] px-1.5 py-0.5 rounded">
                    ID Card (Front)
                  </span>
                </div>

                {/* ID Back */}
                <div
                  onClick={() => setLightboxImage({ uri: selectedSub.id_card_back, title: 'National ID Card (Back)' })}
                  className="cursor-pointer group relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100 h-32"
                >
                  <img src={selectedSub.id_card_back} alt="ID Back" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <span className="absolute bottom-1 left-1 bg-slate-900/80 text-white text-[9px] px-1.5 py-0.5 rounded">
                    ID Card (Back)
                  </span>
                </div>

                {/* Storefront Photo */}
                <div
                  onClick={() => setLightboxImage({ uri: selectedSub.storefront_photo, title: 'Physical Storefront Photo' })}
                  className="cursor-pointer group relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100 h-32 col-span-2"
                >
                  <img src={selectedSub.storefront_photo} alt="Storefront" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <span className="absolute bottom-1 left-1 bg-slate-900/80 text-white text-[9px] px-1.5 py-0.5 rounded">
                    Physical Storefront Photo
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Store KYC Application"
      >
        <p className="text-xs text-slate-600 mb-4">
          Please provide a specific reason for rejection. This text will be sent to the merchant to instruct document resubmission.
        </p>

        <Input
          label="Mandatory Rejection Reason *"
          placeholder="e.g. Uploaded National ID Card front photo is blurry. Please upload a clear scan."
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          className="mb-4"
        />

        <div className="flex justify-end space-x-3">
          <Button variant="ghost" size="sm" onClick={() => setRejectModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={handleConfirmReject} disabled={!rejectionReason.trim()}>
            Confirm Rejection
          </Button>
        </div>
      </Modal>

      {/* Image Lightbox */}
      {lightboxImage && (
        <ImageLightbox
          isOpen={Boolean(lightboxImage)}
          onClose={() => setLightboxImage(null)}
          imageUri={lightboxImage.uri}
          title={lightboxImage.title}
        />
      )}
    </PageContainer>
  );
};

