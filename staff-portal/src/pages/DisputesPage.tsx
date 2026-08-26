import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ImageLightbox } from '../components/ui/ImageLightbox';
import { DisputeReason, OrderStatus } from '@wunabuy/types';
import { formatXAF } from '@wunabuy/utils';
import { ShieldAlert, Eye, CheckCircle2, RefreshCw, Scale } from 'lucide-react';

interface DisputeItem {
  id: string;
  order_code: string;
  buyer_name: string;
  buyer_phone: string;
  seller_store: string;
  transporter_name: string;
  escrow_amount: number;
  reason: DisputeReason;
  description: string;
  evidence_photos: string[];
  status: 'disputed' | 'under_review' | 'resolved';
  disputed_at: string;
}

const MOCK_DISPUTES: DisputeItem[] = [
  {
    id: 'disp_1',
    order_code: 'WB-2026-9842',
    buyer_name: 'Jean Dupont',
    buyer_phone: '+237 670 111 222',
    seller_store: 'Douala Tech Hub (Akwa)',
    transporter_name: 'Samuel Mbida',
    escrow_amount: 188000,
    reason: DisputeReason.DAMAGED,
    description: 'The phone box seal was tampered with and the glass screen has a hairline fracture upon delivery.',
    evidence_photos: [
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80',
    ],
    status: 'disputed',
    disputed_at: '2026-08-26 11:20',
  },
  {
    id: 'disp_2',
    order_code: 'WB-2026-3390',
    buyer_name: 'Marie Claire',
    buyer_phone: '+237 699 333 444',
    seller_store: 'Heritage African Couture',
    transporter_name: 'Michel Foe',
    escrow_amount: 48000,
    reason: DisputeReason.WRONG_ITEM,
    description: 'Received blue color dress instead of gold embroidered Toghu outfit.',
    evidence_photos: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
    ],
    status: 'resolved',
    disputed_at: '2026-08-22 15:45',
  },
];

export const DisputesPage: React.FC = () => {
  const [disputes, setDisputes] = useState<DisputeItem[]>(MOCK_DISPUTES);
  const [selectedDispute, setSelectedDispute] = useState<DisputeItem | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const handleResolveRefundBuyer = () => {
    if (!selectedDispute) return;
    setDisputes((prev) =>
      prev.map((d) => (d.id === selectedDispute.id ? { ...d, status: 'resolved' } : d))
    );
    setToast(`Dispute #${selectedDispute.order_code} resolved: 100% Escrow Refunded to Buyer.`);
    setSelectedDispute(null);
  };

  const handleResolveReleaseSeller = () => {
    if (!selectedDispute) return;
    setDisputes((prev) =>
      prev.map((d) => (d.id === selectedDispute.id ? { ...d, status: 'resolved' } : d))
    );
    setToast(`Dispute #${selectedDispute.order_code} resolved: 100% Escrow Released to Seller.`);
    setSelectedDispute(null);
  };

  return (
    <PageContainer
      title="Escrow Dispute Resolution Center"
      subtitle="Adjudicate buyer/seller conflicts and manage frozen escrow fund settlements."
    >
      {/* Disputes Data Table */}
      <Card className="p-0 overflow-hidden mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-6">Order Code</th>
              <th className="py-3.5 px-6">Buyer Name</th>
              <th className="py-3.5 px-6">Merchant Store</th>
              <th className="py-3.5 px-6">Escrow Amount</th>
              <th className="py-3.5 px-6">Dispute Reason</th>
              <th className="py-3.5 px-6">Status</th>
              <th className="py-3.5 px-6 text-right">Adjudicate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {disputes.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-4 px-6 font-bold text-teal-700">{item.order_code}</td>
                <td className="py-4 px-6 font-medium text-slate-900">{item.buyer_name}</td>
                <td className="py-4 px-6 text-slate-600">{item.seller_store}</td>
                <td className="py-4 px-6 font-bold text-slate-900">{formatXAF(item.escrow_amount)}</td>
                <td className="py-4 px-6 text-slate-600">
                  <Badge variant="error" size="sm">
                    {item.reason.replace(/_/g, ' ')}
                  </Badge>
                </td>
                <td className="py-4 px-6">
                  <Badge variant={item.status === 'resolved' ? 'success' : 'warning'}>
                    {item.status.toUpperCase()}
                  </Badge>
                </td>
                <td className="py-4 px-6 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Eye className="w-3.5 h-3.5" />}
                    onClick={() => setSelectedDispute(item)}
                  >
                    Review Case
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Case Review Drawer / Modal */}
      {selectedDispute && (
        <Modal
          isOpen={Boolean(selectedDispute)}
          onClose={() => setSelectedDispute(null)}
          title={`Dispute Case Review — ${selectedDispute.order_code}`}
          maxWidth="4xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Case Details */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Order Financials
                  </span>
                  <span className="text-base font-extrabold text-teal-700">
                    {formatXAF(selectedDispute.escrow_amount)}
                  </span>
                </div>
                <p className="text-xs text-slate-700">Buyer: <span className="font-semibold">{selectedDispute.buyer_name}</span> ({selectedDispute.buyer_phone})</p>
                <p className="text-xs text-slate-700">Merchant Store: <span className="font-semibold">{selectedDispute.seller_store}</span></p>
                <p className="text-xs text-slate-700">Transporter: <span className="font-semibold">{selectedDispute.transporter_name}</span></p>
              </div>

              {/* Buyer Explanation Statement */}
              <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                <span className="text-xs font-bold text-red-800 uppercase tracking-wider block mb-1">
                  Buyer Statement ({selectedDispute.reason})
                </span>
                <p className="text-xs text-red-900 leading-relaxed font-medium">
                  "{selectedDispute.description}"
                </p>
              </div>

              {/* Adjudication Decision Buttons */}
              {selectedDispute.status !== 'resolved' && (
                <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 space-y-3">
                  <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center">
                    <Scale className="w-4 h-4 mr-1 text-teal-600" />
                    Adjudication Settlement Options
                  </h4>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={handleResolveRefundBuyer}
                      className="w-full justify-start"
                    >
                      1. Refund 100% Escrow ({formatXAF(selectedDispute.escrow_amount)}) to Buyer
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleResolveReleaseSeller}
                      className="w-full justify-start"
                    >
                      2. Overrule Dispute & Release 100% to Merchant Store
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Evidence Photos */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Buyer Submitted Evidence Photos ({selectedDispute.evidence_photos.length})
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {selectedDispute.evidence_photos.map((photo, i) => (
                  <div
                    key={i}
                    onClick={() => setLightboxImage(photo)}
                    className="cursor-pointer group relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100 h-40"
                  >
                    <img src={photo} alt="Evidence" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Lightbox */}
      {lightboxImage && (
        <ImageLightbox
          isOpen={Boolean(lightboxImage)}
          onClose={() => setLightboxImage(null)}
          imageUri={lightboxImage}
          title="Dispute Evidence Photo"
        />
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-2xl font-medium border border-slate-800">
          {toast}
        </div>
      )}
    </PageContainer>
  );
};

