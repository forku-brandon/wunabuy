import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { formatXAF } from '@wunabuy/utils';
import { useStaffAuth } from '../stores/staffAuthStore';
import { Wallet, TrendingUp, Lock, CheckCircle2, ShieldCheck, Download, AlertTriangle } from 'lucide-react';

interface PayoutRequestItem {
  id: string;
  recipient_name: string;
  recipient_role: string;
  amount: number;
  phone: string;
  provider: 'MTN' | 'ORANGE';
  status: 'pending' | 'completed' | 'rejected';
  requested_at: string;
  is_high_value?: boolean;
}

const MOCK_PAYOUTS: PayoutRequestItem[] = [
  {
    id: 'pay_1',
    recipient_name: 'Penja Organic Farm Shop',
    recipient_role: 'SELLER',
    amount: 450000,
    phone: '+237 699 887 766',
    provider: 'ORANGE',
    status: 'pending',
    requested_at: '2026-09-02 12:10',
  },
  {
    id: 'pay_3',
    recipient_name: 'Douala Tech Hub Wholesale',
    recipient_role: 'SELLER',
    amount: 850000,
    phone: '+237 670 123 456',
    provider: 'MTN',
    status: 'pending',
    requested_at: '2026-09-02 11:30',
    is_high_value: true,
  },
  {
    id: 'pay_2',
    recipient_name: 'Samuel Mbida',
    recipient_role: 'TRANSPORTER',
    amount: 14000,
    phone: '+237 675 112 233',
    provider: 'MTN',
    status: 'completed',
    requested_at: '2026-09-02 10:45',
  },
];

export const FinancialsPage: React.FC = () => {
  const { user, addAuditLog, hasPermission } = useStaffAuth();
  const [payouts, setPayouts] = useState<PayoutRequestItem[]>(MOCK_PAYOUTS);
  const [selectedPayout, setSelectedPayout] = useState<PayoutRequestItem | null>(null);
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [payoutPIN, setPayoutPIN] = useState('');

  const canApprovePayouts = hasPermission('approve_payouts');

  const handleInitiateApprove = (payout: PayoutRequestItem) => {
    setSelectedPayout(payout);
    setPayoutModalOpen(true);
  };

  const handleConfirmPayout = () => {
    if (!selectedPayout || payoutPIN.length < 4) return;

    setPayouts((prev) =>
      prev.map((p) => (p.id === selectedPayout.id ? { ...p, status: 'completed' } : p))
    );

    addAuditLog({
      action_code: selectedPayout.is_high_value ? 'PAYOUT_DUAL_APPROVE' : 'PAYOUT_APPROVE',
      action_description: `Approved ${selectedPayout.provider} Payout of ${formatXAF(selectedPayout.amount)} for ${selectedPayout.recipient_name} (${selectedPayout.phone})`,
      target_id: selectedPayout.id,
      security_level: selectedPayout.is_high_value ? 'CRITICAL' : 'INFO',
    });

    setPayoutModalOpen(false);
    setSelectedPayout(null);
    setPayoutPIN('');
  };

  const handleExportFinancialStatement = () => {
    addAuditLog({
      action_code: 'FINANCIAL_EXPORT_STATEMENT',
      action_description: 'Exported platform monthly financial statement CSV/PDF',
      security_level: 'INFO',
    });
    alert('📊 Financial Ledger Statement exported & downloaded!');
  };

  return (
    <PageContainer
      title="Finance, Treasury & Escrow Ledger Center"
      subtitle="Reconcile MTN MoMo & Orange Money Operations, Process Merchant Payouts & Audit 3.5% Commission Revenue"
    >
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="TOTAL ESCROW BALANCE"
          value={formatXAF(22850000)}
          change="48h Protection"
          changeType="neutral"
          icon={<Lock className="w-5 h-5 text-amber-500" />}
          description="Locked funds held across active orders"
        />

        <StatCard
          title="PLATFORM COMMISSIONS"
          value={formatXAF(4820000)}
          change="3.5% Fee"
          changeType="positive"
          icon={<TrendingUp className="w-5 h-5 text-teal-600" />}
          description="Net revenue earned this month"
        />

        <StatCard
          title="MTN MOMO RECONCILED"
          value={formatXAF(34500000)}
          change="100% Matched"
          changeType="positive"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          description="USSD *126# automated reconciliation"
        />

        <StatCard
          title="ORANGE MONEY RECONCILED"
          value={formatXAF(16100000)}
          change="100% Matched"
          changeType="positive"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          description="USSD #150# automated reconciliation"
        />
      </div>

      {/* Payout Requests Queue Table */}
      <Card className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-heading">
              Merchant &amp; Driver Payout Requests
            </h3>
            <p className="text-xs text-slate-500">Requires finance officer authorization before Mobile Money transfer</p>
          </div>

          <Button variant="outline" size="sm" onClick={handleExportFinancialStatement}>
            <Download className="w-4 h-4 mr-1.5" />
            Export Statement PDF
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Recipient</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Mobile Money Provider</th>
                <th className="py-3.5 px-4">Requested At</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {payouts.map((payout) => (
                <tr key={payout.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4 font-bold text-slate-900">
                    {payout.recipient_name}
                    {payout.is_high_value && (
                      <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        HIGH VALUE (&gt;500k)
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant={payout.recipient_role === 'SELLER' ? 'teal' : 'amber'}>
                      {payout.recipient_role}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 font-extrabold text-slate-900">{formatXAF(payout.amount)}</td>
                  <td className="py-4 px-4 font-mono font-semibold text-slate-800">
                    {payout.provider} ({payout.phone})
                  </td>
                  <td className="py-4 px-4 text-slate-500">{payout.requested_at}</td>
                  <td className="py-4 px-4">
                    <Badge variant={payout.status === 'completed' ? 'success' : 'warning'}>
                      {payout.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 text-right">
                    {canApprovePayouts && payout.status === 'pending' && (
                      <Button size="sm" variant="primary" onClick={() => handleInitiateApprove(payout)}>
                        <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                        Authorize Payout
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Payout Authorization & Security PIN Modal */}
      <Modal isOpen={payoutModalOpen} onClose={() => setPayoutModalOpen(false)} title="Authorize Mobile Money Payout">
        <div className="space-y-4 text-xs">
          {selectedPayout?.is_high_value && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-amber-900">
                <p className="font-bold">Dual Signature Required (&gt;500,000 FCFA)</p>
                <p className="mt-0.5 text-[11px]">
                  Payout exceeds standard threshold. Approval requires staff security PIN confirmation and creates a Level-5 Audit Record under employee ID {user?.employee_id}.
                </p>
              </div>
            </div>
          )}

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-[10px] text-slate-400 font-bold uppercase">PAYOUT SUMMARY</p>
            <p className="text-base font-extrabold text-slate-900">{formatXAF(selectedPayout?.amount || 0)}</p>
            <p className="text-xs text-slate-600 mt-1">
              Transfer to: <strong className="text-slate-900">{selectedPayout?.recipient_name}</strong> ({selectedPayout?.provider} {selectedPayout?.phone})
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Enter Staff Security Authorization PIN (min 4 digits) *
            </label>
            <input
              type="password"
              maxLength={6}
              value={payoutPIN}
              onChange={(e) => setPayoutPIN(e.target.value)}
              placeholder="••••"
              className="w-full text-center text-lg font-mono tracking-widest p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <Button variant="outline" onClick={() => setPayoutModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" disabled={payoutPIN.length < 4} onClick={handleConfirmPayout}>
              Authorize MoMo Payout &amp; Record Audit
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
};
