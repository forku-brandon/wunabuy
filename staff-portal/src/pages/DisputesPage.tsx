import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ImageLightbox } from '../components/ui/ImageLightbox';
import { DisputeReason } from '@wunabuy/types';
import { formatXAF } from '@wunabuy/utils';
import { useStaffAuth } from '../stores/staffAuthStore';
import { ShieldAlert, Eye, CheckCircle2, RefreshCw, Scale, AlertTriangle, ArrowLeftRight } from 'lucide-react';

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
  resolution_type?: 'FULL_REFUND_BUYER' | 'RELEASE_TO_SELLER' | '50_50_SPLIT';
  resolution_notes?: string;
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
    disputed_at: '2026-09-02 11:20',
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
    resolution_type: 'FULL_REFUND_BUYER',
    resolution_notes: 'Verified wrong color delivered. 100% Escrow refunded to buyer wallet.',
  },
];

export const DisputesPage: React.FC = () => {
  const { addAuditLog, hasPermission } = useStaffAuth();
  const [disputes, setDisputes] = useState<DisputeItem[]>(MOCK_DISPUTES);
  const [selectedDispute, setSelectedDispute] = useState<DisputeItem | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [resolutionModalOpen, setResolutionModalOpen] = useState(false);
  const [targetAction, setTargetAction] = useState<'FULL_REFUND_BUYER' | 'RELEASE_TO_SELLER' | '50_50_SPLIT'>('FULL_REFUND_BUYER');
  const [justificationNotes, setJustificationNotes] = useState('');

  const canResolve = hasPermission('resolve_disputes');

  const handleOpenResolutionModal = (action: 'FULL_REFUND_BUYER' | 'RELEASE_TO_SELLER' | '50_50_SPLIT') => {
    setTargetAction(action);
    setResolutionModalOpen(true);
  };

  const handleConfirmResolution = () => {
    if (!selectedDispute || !justificationNotes.trim()) return;

    setDisputes((prev) =>
      prev.map((d) =>
        d.id === selectedDispute.id
          ? {
              ...d,
              status: 'resolved',
              resolution_type: targetAction,
              resolution_notes: justificationNotes,
            }
          : d
      )
    );

    addAuditLog({
      action_code: 'ESCROW_DISPUTE_RESOLVE',
      action_description: `Staff resolved Escrow Dispute #${selectedDispute.order_code} via ${targetAction}. Reason: ${justificationNotes}`,
      target_id: selectedDispute.id,
      security_level: 'CRITICAL',
    });

    setSelectedDispute(null);
    setResolutionModalOpen(false);
    setJustificationNotes('');
  };

  return (
    <PageContainer
      title="3-Way Escrow Dispute Resolution Center"
      subtitle="Adjudicate Buyer vs Merchant vs Transporter Conflicts with Financial Escrow Overrides & Security Audit Trails"
    >
      {/* Disputes Data Table */}
      <Card className="p-0 overflow-hidden mb-8">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-6">Order Code</th>
              <th className="py-3.5 px-6">Buyer Name</th>
              <th className="py-3.5 px-6">Merchant Store</th>
              <th className="py-3.5 px-6">Escrow Amount</th>
              <th className="py-3.5 px-6">Dispute Reason</th>
              <th className="py-3.5 px-6">Status</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {disputes.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-4 px-6 font-mono font-bold text-teal-700">{item.order_code}</td>
                <td className="py-4 px-6">
                  <span className="font-bold text-slate-900 block">{item.buyer_name}</span>
                  <span className="text-[11px] text-slate-400">{item.buyer_phone}</span>
                </td>
                <td className="py-4 px-6">{item.seller_store}</td>
                <td className="py-4 px-6 font-bold text-slate-900">{formatXAF(item.escrow_amount)}</td>
                <td className="py-4 px-6">
                  <Badge variant="amber">{item.reason}</Badge>
                </td>
                <td className="py-4 px-6">
                  <Badge variant={item.status === 'resolved' ? 'success' : 'error'}>
                    {item.status.toUpperCase()}
                  </Badge>
                </td>
                <td className="py-4 px-6 text-right">
                  <Button size="sm" variant="outline" onClick={() => setSelectedDispute(item)}>
                    <Eye className="w-3.5 h-3.5 mr-1" />
                    Inspect Case
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Case Details Drawer Modal */}
      {selectedDispute && (
        <Modal
          isOpen={Boolean(selectedDispute)}
          onClose={() => setSelectedDispute(null)}
          title={`Dispute Inspection — Order #${selectedDispute.order_code}`}
        >
          <div className="space-y-6 text-xs">
            {/* Frozen Escrow Header */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">FROZEN ESCROW FUNDS</span>
                <p className="text-xl font-extrabold text-amber-900 font-heading">
                  {formatXAF(selectedDispute.escrow_amount)}
                </p>
              </div>
              <Badge variant="amber">48H Auto-Hold Frozen</Badge>
            </div>

            {/* 3-Party Summary Grid */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">BUYER CLAIMANT</span>
                <p className="font-bold text-slate-900">{selectedDispute.buyer_name}</p>
                <p className="text-[10px] text-slate-500">{selectedDispute.buyer_phone}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">MERCHANT STORE</span>
                <p className="font-bold text-slate-900">{selectedDispute.seller_store}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">TRANSPORTER DRIVER</span>
                <p className="font-bold text-slate-900">{selectedDispute.transporter_name}</p>
              </div>
            </div>

            {/* Buyer Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Buyer Stated Reason ({selectedDispute.reason})
              </label>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 italic">
                "{selectedDispute.description}"
              </div>
            </div>

            {/* Evidence Photos */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Submitted Evidence Photos</label>
              <div className="flex space-x-3">
                {selectedDispute.evidence_photos.map((photo, i) => (
                  <img
                    key={i}
                    src={photo}
                    alt="Evidence"
                    className="w-24 h-24 object-cover rounded-lg border border-slate-200 cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => setLightboxImage(photo)}
                  />
                ))}
              </div>
            </div>

            {/* Resolution Controls */}
            {canResolve && selectedDispute.status !== 'resolved' && (
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Adjudication Escrow Settlement Actions
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <Button variant="danger" size="sm" onClick={() => handleOpenResolutionModal('FULL_REFUND_BUYER')}>
                    Refund 100% to Buyer
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => handleOpenResolutionModal('RELEASE_TO_SELLER')}>
                    Release 100% to Seller
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => handleOpenResolutionModal('50_50_SPLIT')}>
                    50 / 50 Split Settlement
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Confirmation & Justification Modal */}
      <Modal isOpen={resolutionModalOpen} onClose={() => setResolutionModalOpen(false)} title="Confirm Financial Settlement">
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800">
              <p className="font-bold">Irreversible Escrow Transfer</p>
              <p className="mt-0.5">
                Executing <strong className="font-extrabold">{targetAction}</strong> will immediately transfer {formatXAF(selectedDispute?.escrow_amount || 0)} from Escrow Hold. This action is logged under staff audit.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mandatory Adjudication Reason &amp; Financial Notes *
            </label>
            <textarea
              rows={3}
              value={justificationNotes}
              onChange={(e) => setJustificationNotes(e.target.value)}
              placeholder="State clear legal/operational rationale (e.g. Photo proof confirmed broken glass, merchant agreed to full refund)..."
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <Button variant="outline" onClick={() => setResolutionModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" disabled={!justificationNotes.trim()} onClick={handleConfirmResolution}>
              Execute Settlement &amp; Record Audit Log
            </Button>
          </div>
        </div>
      </Modal>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <ImageLightbox
          isOpen={Boolean(lightboxImage)}
          onClose={() => setLightboxImage(null)}
          imageUri={lightboxImage}
          title="Dispute Evidence Photo Inspection"
        />
      )}
    </PageContainer>
  );
};
