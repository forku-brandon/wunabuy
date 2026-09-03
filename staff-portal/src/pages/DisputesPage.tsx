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
  ShieldAlert,
  Gavel,
  CheckCircle2,
  AlertCircle,
  FileText,
  Lock,
} from 'lucide-react';

interface EscrowDisputeItem {
  id: string;
  order_code: string;
  buyer_name: string;
  seller_name: string;
  transporter_name: string;
  dispute_reason: string;
  dispute_description: string;
  escrow_amount: number;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED_REFUND' | 'RESOLVED_RELEASE';
  filed_at: string;
  evidence_photos: string[];
}

const MOCK_DISPUTES: EscrowDisputeItem[] = [
  {
    id: 'disp_101',
    order_code: 'WB-2026-9842',
    buyer_name: 'Amadou Bello',
    seller_name: 'Douala Tech Hub',
    transporter_name: 'Jean-Paul Nkoum',
    dispute_reason: 'DAMAGED_ITEM',
    dispute_description: 'Screen arrived with hairline crack on corner. Package box was undamaged upon delivery.',
    escrow_amount: 185000,
    status: 'OPEN',
    filed_at: '2026-09-02 14:15',
    evidence_photos: [
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=400&q=80',
    ],
  },
  {
    id: 'disp_102',
    order_code: 'WB-2026-9843',
    buyer_name: 'Chantal Ngo',
    seller_name: 'Heritage African Couture',
    transporter_name: 'Samuel Ebobe',
    dispute_reason: 'WRONG_ITEM',
    dispute_description: 'Received size L dress instead of size M specified in order invoice.',
    escrow_amount: 45000,
    status: 'UNDER_REVIEW',
    filed_at: '2026-09-01 11:30',
    evidence_photos: [
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=400&q=80',
    ],
  },
];

export const DisputesPage: React.FC = () => {
  const { addAuditLog, hasPermission } = useStaffAuth();
  const [disputes, setDisputes] = useState<EscrowDisputeItem[]>(MOCK_DISPUTES);
  
  // Interactive Modals
  const [adjudicateTarget, setAdjudicateTarget] = useState<EscrowDisputeItem | null>(null);
  const [rulingType, setRulingType] = useState<'BUYER_REFUND' | 'SELLER_RELEASE' | 'SPLIT_50_50'>('BUYER_REFUND');
  const [rulingRationale, setRulingRationale] = useState('');

  const canAdjudicate = hasPermission('resolve_disputes');

  const handleExecuteRuling = () => {
    if (!adjudicateTarget || !rulingRationale.trim()) return;

    const nextStatus = rulingType === 'BUYER_REFUND' ? 'RESOLVED_REFUND' : 'RESOLVED_RELEASE';

    addAuditLog({
      action_code: 'DISPUTE_ADJUDICATE',
      action_description: `Adjudicated dispute ${adjudicateTarget.order_code} with ruling ${rulingType}. Rationale: ${rulingRationale}`,
      target_id: adjudicateTarget.id,
      security_level: 'CRITICAL',
    });

    setDisputes((prev) =>
      prev.map((d) => (d.id === adjudicateTarget.id ? { ...d, status: nextStatus } : d))
    );

    setAdjudicateTarget(null);
    setRulingRationale('');
  };

  const columns: Column<EscrowDisputeItem>[] = [
    {
      key: 'order_code',
      header: 'Order Code',
      render: (item) => <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{item.order_code}</span>,
    },
    {
      key: 'buyer_name',
      header: 'Buyer vs Seller',
      render: (item) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-slate-100 block">Buyer: {item.buyer_name}</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Store: {item.seller_name}</span>
        </div>
      ),
    },
    {
      key: 'dispute_reason',
      header: 'Dispute Claim',
      render: (item) => (
        <div>
          <span className="font-bold text-red-600 dark:text-red-400 block">{item.dispute_reason}</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium line-clamp-1">{item.dispute_description}</span>
        </div>
      ),
    },
    {
      key: 'escrow_amount',
      header: 'Frozen Escrow Amount',
      render: (item) => <span className="font-bold text-slate-900 dark:text-slate-100">{formatXAF(item.escrow_amount)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <Badge
          variant={
            item.status === 'OPEN'
              ? 'error'
              : item.status === 'UNDER_REVIEW'
              ? 'warning'
              : 'success'
          }
        >
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
          {item.status !== 'RESOLVED_REFUND' && item.status !== 'RESOLVED_RELEASE' && canAdjudicate ? (
            <Button
              size="sm"
              variant="primary"
              onClick={() => setAdjudicateTarget(item)}
            >
              Adjudicate Ruling
            </Button>
          ) : (
            <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 font-semibold">
              Resolved Case
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <PageContainer
      title="3-Way Escrow Disputes Bench"
      subtitle="Investigate Customer Disputes, Verify Photo Evidence &amp; Execute Binding Escrow Rulings"
    >
      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="OPEN DISPUTE CASES"
          value="2 Cases"
          change="Action Required"
          changeType="negative"
          icon={<ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />}
          iconBg="bg-red-50 dark:bg-red-950/60"
          description="Awaiting staff adjudication"
        />

        <StatCard
          title="FROZEN DISPUTE ESCROW"
          value={formatXAF(230000)}
          change="Protected Pool"
          changeType="neutral"
          icon={<AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
          iconBg="bg-amber-50 dark:bg-amber-950/60"
          description="Funds locked pending ruling"
        />

        <StatCard
          title="RESOLVED THIS MONTH"
          value="18 Cases"
          change="Avg 4.2 Hours"
          changeType="positive"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          iconBg="bg-emerald-50 dark:bg-emerald-950/60"
          description="Adjudicated by legal team"
        />

        <StatCard
          title="BUYER REFUND RATE"
          value="12.5%"
          change="Fair Resolution"
          changeType="neutral"
          icon={<Gavel className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          iconBg="bg-blue-50 dark:bg-blue-950/60"
          description="Percentage of dispute refunds"
        />
      </div>

      {/* Advanced Reusable DataTable */}
      <DataTable
        data={disputes}
        columns={columns}
        searchPlaceholder="Search order code, buyer, seller name, or claim..."
        pageSize={5}
        emptyMessage="No dispute records found."
      />

      {/* ADJUDICATE DISPUTE RULING MODAL */}
      {adjudicateTarget && (
        <Modal
          isOpen={Boolean(adjudicateTarget)}
          onClose={() => setAdjudicateTarget(null)}
          title={`Adjudicate Escrow Dispute Ruling — ${adjudicateTarget.order_code}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">BUYER CLAIM REPORT</span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">{adjudicateTarget.dispute_description}</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Buyer: {adjudicateTarget.buyer_name} • Store: {adjudicateTarget.seller_name} • Rider: {adjudicateTarget.transporter_name}
              </p>
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between font-bold">
                <span className="text-slate-700 dark:text-slate-300">Frozen Escrow Amount:</span>
                <span className="text-sm text-slate-900 dark:text-slate-100 font-extrabold">{formatXAF(adjudicateTarget.escrow_amount)}</span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Binding Staff Escrow Ruling *</label>
              <select
                value={rulingType}
                onChange={(e: any) => setRulingType(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100"
              >
                <option value="BUYER_REFUND">100% Full Buyer Refund (Escrow Returned)</option>
                <option value="SELLER_RELEASE">100% Full Seller Release (Escrow Credited to Merchant)</option>
                <option value="SPLIT_50_50">50/50 Split Settlement (Partial Disbursal)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Mandatory Legal Rationale &amp; Evidence Audit Notes *
              </label>
              <textarea
                rows={3}
                value={rulingRationale}
                onChange={(e) => setRulingRationale(e.target.value)}
                placeholder="Detail legal findings and rationale for audit ledger..."
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" onClick={() => setAdjudicateTarget(null)}>
                Cancel
              </Button>
              {canAdjudicate ? (
                <Button variant="primary" disabled={!rulingRationale.trim()} onClick={handleExecuteRuling}>
                  Execute Binding Ruling &amp; Log Audit
                </Button>
              ) : (
                <Button variant="outline" disabled className="opacity-60 cursor-not-allowed font-bold text-xs">
                  <Lock className="w-3.5 h-3.5 mr-1 text-amber-600" />
                  Adjudication Locked (Admin Only)
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </PageContainer>
  );
};
