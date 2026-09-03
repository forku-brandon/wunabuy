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
  Wallet,
  ArrowUpRight,
  Lock,
  Download,
  Smartphone,
} from 'lucide-react';

interface PayoutTransactionItem {
  id: string;
  reference_code: string;
  entity_name: string;
  entity_type: 'SELLER' | 'TRANSPORTER';
  payment_method: 'MTN_MOMO' | 'ORANGE_MONEY';
  account_number: string;
  amount: number;
  commission_deducted: number;
  net_payout: number;
  status: 'PENDING_APPROVAL' | 'PROCESSED' | 'FLAGGED';
  requested_at: string;
  risk_score: 'LOW' | 'MEDIUM' | 'HIGH';
}

const MOCK_PAYOUT_LEDGER: PayoutTransactionItem[] = [
  {
    id: 'pay_901',
    reference_code: 'WB-PAY-8841',
    entity_name: 'Douala Tech Hub',
    entity_type: 'SELLER',
    payment_method: 'MTN_MOMO',
    account_number: '+237 670 123 456',
    amount: 850000,
    commission_deducted: 29750,
    net_payout: 820250,
    status: 'PENDING_APPROVAL',
    requested_at: '2026-09-02 11:20',
    risk_score: 'LOW',
  },
  {
    id: 'pay_902',
    reference_code: 'WB-PAY-8842',
    entity_name: 'Penja Organic Farm',
    entity_type: 'SELLER',
    payment_method: 'ORANGE_MONEY',
    account_number: '+237 699 887 766',
    amount: 450000,
    commission_deducted: 15750,
    net_payout: 434250,
    status: 'PROCESSED',
    requested_at: '2026-09-02 09:45',
    risk_score: 'LOW',
  },
  {
    id: 'pay_903',
    reference_code: 'WB-PAY-8843',
    entity_name: 'Jean-Paul Nkoum (Rider)',
    entity_type: 'TRANSPORTER',
    payment_method: 'MTN_MOMO',
    account_number: '+237 670 112 233',
    amount: 68500,
    commission_deducted: 2397,
    net_payout: 66103,
    status: 'PROCESSED',
    requested_at: '2026-09-01 16:30',
    risk_score: 'LOW',
  },
  {
    id: 'pay_904',
    reference_code: 'WB-PAY-8844',
    entity_name: 'Heritage African Couture',
    entity_type: 'SELLER',
    payment_method: 'ORANGE_MONEY',
    account_number: '+237 675 443 322',
    amount: 1250000,
    commission_deducted: 43750,
    net_payout: 1206250,
    status: 'FLAGGED',
    requested_at: '2026-09-01 10:15',
    risk_score: 'HIGH',
  },
];

export const FinancialsPage: React.FC = () => {
  const { user, addAuditLog, hasPermission } = useStaffAuth();
  const [ledger, setLedger] = useState<PayoutTransactionItem[]>(MOCK_PAYOUT_LEDGER);
  
  // Interactive Modals
  const [authorizeTarget, setAuthorizeTarget] = useState<PayoutTransactionItem | null>(null);
  const [securityPin, setSecurityPin] = useState('');

  const canApprovePayout = hasPermission('approve_payouts');

  const handleAuthorizePayout = () => {
    if (!authorizeTarget || securityPin.length < 4) return;

    addAuditLog({
      action_code: 'FINANCIAL_PAYOUT_AUTHORIZE',
      action_description: `Authorized mobile money payout of ${formatXAF(authorizeTarget.net_payout)} to ${authorizeTarget.entity_name} (${authorizeTarget.payment_method})`,
      target_id: authorizeTarget.id,
      security_level: 'CRITICAL',
    });

    setLedger((prev) =>
      prev.map((item) => (item.id === authorizeTarget.id ? { ...item, status: 'PROCESSED' } : item))
    );

    setAuthorizeTarget(null);
    setSecurityPin('');
  };

  const handleExportStatement = () => {
    addAuditLog({
      action_code: 'FINANCIAL_STATEMENT_EXPORT',
      action_description: 'Exported platform Mobile Money reconciliation ledger statement CSV',
      security_level: 'INFO',
    });
    alert('Platform financial reconciliation statement exported successfully.');
  };

  const columns: Column<PayoutTransactionItem>[] = [
    {
      key: 'reference_code',
      header: 'Payout Ref',
      render: (item) => <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{item.reference_code}</span>,
    },
    {
      key: 'entity_name',
      header: 'Payee Merchant / Rider',
      render: (item) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-slate-100 block">{item.entity_name}</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{item.entity_type}</span>
        </div>
      ),
    },
    {
      key: 'payment_method',
      header: 'Mobile Money Gateway',
      render: (item) => (
        <div>
          <span className="font-bold text-slate-800 dark:text-slate-200 block">
            {item.payment_method === 'MTN_MOMO' ? 'MTN Mobile Money (*126#)' : 'Orange Money (#150#)'}
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{item.account_number}</span>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Gross Amount',
      render: (item) => <span className="font-bold text-slate-900 dark:text-slate-100">{formatXAF(item.amount)}</span>,
    },
    {
      key: 'net_payout',
      header: 'Net Payout (Fee 3.5%)',
      render: (item) => <span className="font-bold text-slate-900 dark:text-slate-100">{formatXAF(item.net_payout)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <Badge
          variant={
            item.status === 'PROCESSED'
              ? 'success'
              : item.status === 'FLAGGED'
              ? 'error'
              : 'warning'
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
          {item.status === 'PENDING_APPROVAL' ? (
            canApprovePayout ? (
              <Button
                size="sm"
                variant="primary"
                onClick={() => setAuthorizeTarget(item)}
              >
                Authorize Payout
              </Button>
            ) : (
              <Button size="sm" variant="outline" disabled className="opacity-60 cursor-not-allowed text-xs font-bold">
                <Lock className="w-3.5 h-3.5 mr-1 text-amber-600" />
                Locked (Admin Only)
              </Button>
            )
          ) : (
            <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 font-semibold">
              {item.status === 'PROCESSED' ? 'Reconciled' : 'Under Investigation'}
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <PageContainer
      title="Financials, Escrow Ledgers &amp; Mobile Money Payouts"
      subtitle="Reconcile MTN MoMo &amp; Orange Money Disbursal Streams, Platform Yield &amp; High-Value Transfers"
      action={
        <Button variant="outline" size="sm" onClick={handleExportStatement}>
          <Download className="w-4 h-4 mr-1.5" />
          Export Financial Statement
        </Button>
      }
    >
      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="TOTAL RECONCILED YIELD"
          value={formatXAF(86350000)}
          change="MTN & Orange"
          changeType="positive"
          icon={<Wallet className="w-5 h-5 text-teal-600 dark:text-teal-400" />}
          iconBg="bg-teal-50 dark:bg-teal-950/60"
          description="Total funds processed in Cameroon"
        />

        <StatCard
          title="ESCROW FROZEN LEDGER"
          value={formatXAF(22850000)}
          change="48h Protection"
          changeType="neutral"
          icon={<Lock className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
          iconBg="bg-purple-50 dark:bg-purple-950/60"
          description="Protected funds in escrow pool"
        />

        <StatCard
          title="NET PLATFORM COMMISSIONS"
          value={formatXAF(4820000)}
          change="3.5% Standard Fee"
          changeType="positive"
          icon={<ArrowUpRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          iconBg="bg-emerald-50 dark:bg-emerald-950/60"
          description="Platform operational revenue"
        />

        <StatCard
          title="PENDING PAYOUT QUEUE"
          value="1 High-Value"
          change="Action Required"
          changeType="warning"
          icon={<Smartphone className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
          iconBg="bg-amber-50 dark:bg-amber-950/60"
          description="Awaiting staff security PIN authorization"
        />
      </div>

      {/* Advanced Reusable DataTable */}
      <DataTable
        data={ledger}
        columns={columns}
        searchPlaceholder="Search payout code, payee merchant, account number..."
        pageSize={5}
        emptyMessage="No payout transactions found."
      />

      {/* AUTHORIZE PAYOUT SECURITY PIN MODAL */}
      {authorizeTarget && (
        <Modal
          isOpen={Boolean(authorizeTarget)}
          onClose={() => setAuthorizeTarget(null)}
          title={`Authorize Mobile Money Payout — ${authorizeTarget.reference_code}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">PAYEE MERCHANT</span>
                <span className="font-mono text-slate-900 dark:text-slate-100 font-bold">{authorizeTarget.payment_method}</span>
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">{authorizeTarget.entity_name}</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Account: {authorizeTarget.account_number}</p>
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700 dark:text-slate-300">Net Disbursal Amount:</span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{formatXAF(authorizeTarget.net_payout)}</span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Enter Staff Security PIN (L{user?.security_clearance_level} Authorization) *
              </label>
              <input
                type="password"
                maxLength={6}
                value={securityPin}
                onChange={(e) => setSecurityPin(e.target.value)}
                placeholder="Enter 6-digit staff security PIN..."
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-center text-sm font-mono font-bold tracking-widest text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" onClick={() => setAuthorizeTarget(null)}>
                Cancel
              </Button>
              <Button variant="primary" disabled={securityPin.length < 4} onClick={handleAuthorizePayout}>
                Confirm Disbursal &amp; Log Audit
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </PageContainer>
  );
};
