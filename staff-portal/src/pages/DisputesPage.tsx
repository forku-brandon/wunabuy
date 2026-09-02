import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ImageLightbox } from '../components/ui/ImageLightbox';
import { DataTable, Column } from '../components/ui/DataTable';
import { DisputeReason } from '@wunabuy/types';
import { useStaffAuth } from '../stores/staffAuthStore';
import {
  ShieldAlert,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Scale,
  FileText,
  DollarSign,
  User,
  Store,
  Bike,
} from 'lucide-react';
import { formatXAF } from '@wunabuy/utils';

interface EscrowDisputeItem {
  id: string;
  order_code: string;
  buyer_name: string;
  buyer_phone: string;
  seller_store_name: string;
  seller_phone: string;
  transporter_driver_name: string;
  amount_escrow_held: number;
  dispute_reason: DisputeReason;
  buyer_claim_text: string;
  seller_defense_text: string;
  evidence_photos: string[];
  opened_at: string;
  status: 'OPEN_HOLD' | 'RESOLVED_BUYER_REFUND' | 'RESOLVED_SELLER_RELEASE' | 'SPLIT';
  risk_rating: 'LOW' | 'MEDIUM' | 'HIGH';
}

const MOCK_DISPUTES: EscrowDisputeItem[] = [
  {
    id: 'disp_101',
    order_code: 'WB-ORD-9842',
    buyer_name: 'Amadou Bello',
    buyer_phone: '+237 699 554 433',
    seller_store_name: 'Douala Tech Hub',
    seller_phone: '+237 670 123 456',
    transporter_driver_name: 'Jean-Paul Nkoum',
    amount_escrow_held: 185000,
    dispute_reason: DisputeReason.DAMAGED,
    buyer_claim_text: 'Screen of Samsung A54 arrived with hairline cracks.',
    seller_defense_text: 'Item was bubble-wrapped and pristine when handed to rider.',
    evidence_photos: [
      'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=800&q=80',
    ],
    opened_at: '2026-09-01 14:20',
    status: 'OPEN_HOLD',
    risk_rating: 'HIGH',
  },
  {
    id: 'disp_102',
    order_code: 'WB-ORD-9843',
    buyer_name: 'Chantal Ngo',
    buyer_phone: '+237 677 889 900',
    seller_store_name: 'Penja Organic Farm',
    seller_phone: '+237 699 887 766',
    transporter_driver_name: 'Samuel Ebobe',
    amount_escrow_held: 45000,
    dispute_reason: DisputeReason.WRONG_ITEM,
    buyer_claim_text: 'Received 5kg white pepper instead of 5kg black pepper.',
    seller_defense_text: 'Apologies, packaging label mix-up in central warehouse.',
    evidence_photos: [
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
    ],
    opened_at: '2026-09-02 08:30',
    status: 'OPEN_HOLD',
    risk_rating: 'LOW',
  },
];

export const DisputesPage: React.FC = () => {
  const { user, addAuditLog, hasPermission } = useStaffAuth();
  const [disputes, setDisputes] = useState<EscrowDisputeItem[]>(MOCK_DISPUTES);
  
  // Interactive Modals
  const [selectedDispute, setSelectedDispute] = useState<EscrowDisputeItem | null>(null);
  const [adjudicateModalOpen, setAdjudicateModalOpen] = useState(false);
  const [adjudicateAction, setAdjudicateAction] = useState<'BUYER_REFUND' | 'SELLER_RELEASE' | 'SPLIT'>('BUYER_REFUND');
  const [adjudicateRationale, setAdjudicateRationale] = useState('');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const canAdjudicate = hasPermission('adjudicate_disputes');

  const handleExecuteAdjudication = () => {
    if (!selectedDispute || !adjudicateRationale.trim()) return;

    const newStatus =
      adjudicateAction === 'BUYER_REFUND'
        ? 'RESOLVED_BUYER_REFUND'
        : adjudicateAction === 'SELLER_RELEASE'
        ? 'RESOLVED_SELLER_RELEASE'
        : 'SPLIT';

    addAuditLog({
      action_code: 'DISPUTE_ADJUDICATE_EXECUTE',
      action_description: `Adjudicated dispute ${selectedDispute.order_code} with decision: ${newStatus}. Rationale: ${adjudicateRationale}`,
      target_id: selectedDispute.id,
      security_level: 'CRITICAL',
    });

    setDisputes((prev) =>
      prev.map((d) => (d.id === selectedDispute.id ? { ...d, status: newStatus as any } : d))
    );

    setSelectedDispute((prev) => (prev ? { ...prev, status: newStatus as any } : null));
    setAdjudicateModalOpen(false);
    setAdjudicateRationale('');
  };

  const columns: Column<EscrowDisputeItem>[] = [
    {
      key: 'order_code',
      header: 'Order Ref',
      render: (item) => <span className="font-mono font-bold text-slate-900">{item.order_code}</span>,
    },
    {
      key: 'buyer_name',
      header: 'Buyer / Seller',
      render: (item) => (
        <div>
          <span className="font-bold text-slate-900 block">{item.buyer_name}</span>
          <span className="text-[11px] text-slate-500 font-medium">vs {item.seller_store_name}</span>
        </div>
      ),
    },
    {
      key: 'amount_escrow_held',
      header: 'Escrow Frozen Hold',
      render: (item) => <span className="font-bold text-slate-900">{formatXAF(item.amount_escrow_held)}</span>,
    },
    {
      key: 'dispute_reason',
      header: 'Claim Reason',
      render: (item) => <Badge variant="amber">{item.dispute_reason}</Badge>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <Badge variant={item.status === 'OPEN_HOLD' ? 'warning' : 'success'}>
          {item.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (item) => (
        <div className="flex items-center justify-end space-x-2">
          <Button size="sm" variant="outline" onClick={() => setSelectedDispute(item)}>
            Inspect Case
          </Button>

          {canAdjudicate && item.status === 'OPEN_HOLD' && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                setSelectedDispute(item);
                setAdjudicateModalOpen(true);
              }}
            >
              Adjudicate
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <PageContainer
      title="3-Way Escrow Disputes &amp; Adjudication Bench"
      subtitle="Investigate Customer Complaints, Store Defenses &amp; Rider Handover Telemetry Prior to Ledger Release"
    >
      {/* Advanced Reusable DataTable */}
      <DataTable
        data={disputes}
        columns={columns}
        searchPlaceholder="Search dispute code, buyer name, or store..."
        pageSize={5}
        emptyMessage="No active escrow dispute cases."
      />

      {/* CASE INSPECTION MODAL */}
      {selectedDispute && (
        <Modal
          isOpen={Boolean(selectedDispute) && !adjudicateModalOpen}
          onClose={() => setSelectedDispute(null)}
          title={`Dispute Adjudication Case — ${selectedDispute.order_code}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">FROZEN ESCROW HOLD</span>
                <h4 className="text-lg font-extrabold text-slate-900 mt-0.5">{formatXAF(selectedDispute.amount_escrow_held)}</h4>
              </div>
              <Badge variant={selectedDispute.status === 'OPEN_HOLD' ? 'warning' : 'success'}>
                {selectedDispute.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase">BUYER CLAIM STATEMENT</span>
                <p className="font-bold text-slate-900 mt-1">{selectedDispute.buyer_name}</p>
                <p className="text-[11px] text-slate-600 mt-0.5 font-medium">{selectedDispute.buyer_claim_text}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase">SELLER DEFENSE STATEMENT</span>
                <p className="font-bold text-slate-900 mt-1">{selectedDispute.seller_store_name}</p>
                <p className="text-[11px] text-slate-600 mt-0.5 font-medium">{selectedDispute.seller_defense_text}</p>
              </div>
            </div>

            {selectedDispute.evidence_photos.length > 0 && (
              <div>
                <span className="font-bold text-slate-700 block mb-2">Evidence Photo Uploads</span>
                <div className="flex items-center space-x-3">
                  {selectedDispute.evidence_photos.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt="Evidence"
                      onClick={() => setLightboxImage(url)}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <Button variant="outline" onClick={() => setSelectedDispute(null)}>
                Close
              </Button>

              {canAdjudicate && selectedDispute.status === 'OPEN_HOLD' && (
                <Button variant="primary" onClick={() => setAdjudicateModalOpen(true)}>
                  Execute Final Adjudication
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ADJUDICATION DECISION MODAL */}
      {selectedDispute && adjudicateModalOpen && (
        <Modal
          isOpen={adjudicateModalOpen}
          onClose={() => setAdjudicateModalOpen(false)}
          title={`Adjudicate Escrow Hold — ${selectedDispute.order_code}`}
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-2">Adjudication Ruling *</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setAdjudicateAction('BUYER_REFUND')}
                  className={`p-3 rounded-xl border text-center font-bold transition-all ${
                    adjudicateAction === 'BUYER_REFUND' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  100% Buyer Refund
                </button>
                <button
                  onClick={() => setAdjudicateAction('SELLER_RELEASE')}
                  className={`p-3 rounded-xl border text-center font-bold transition-all ${
                    adjudicateAction === 'SELLER_RELEASE' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  100% Seller Release
                </button>
                <button
                  onClick={() => setAdjudicateAction('SPLIT')}
                  className={`p-3 rounded-xl border text-center font-bold transition-all ${
                    adjudicateAction === 'SPLIT' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  50/50 Split
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Mandatory Legal Adjudication Rationale *
              </label>
              <textarea
                rows={3}
                value={adjudicateRationale}
                onChange={(e) => setAdjudicateRationale(e.target.value)}
                placeholder="Specify evidence reviewed and legal rationale for audit record..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
              <Button variant="outline" onClick={() => setAdjudicateModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" disabled={!adjudicateRationale.trim()} onClick={handleExecuteAdjudication}>
                Execute Ruling &amp; Log Audit
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <ImageLightbox imageUrl={lightboxImage} onClose={() => setLightboxImage(null)} />
      )}
    </PageContainer>
  );
};
