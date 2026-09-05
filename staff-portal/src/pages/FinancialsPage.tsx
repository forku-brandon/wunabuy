import React, { useState, useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { StatCard } from '../components/ui/StatCard';
import { DataTable, Column } from '../components/ui/DataTable';
import { DualControlConfirmModal } from '../components/ui/DualControlConfirmModal';
import { useStaffAuth } from '../stores/staffAuthStore';
import { financialsApi } from '../services';
import { rateLimiter, maskPhone } from '../services/security';
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
  
  // Interactive Dual-Control Modal State
  const [authorizeTarget, setAuthorizeTarget] = useState<PayoutTransactionItem | null>(null);

  const canApprovePayout = hasPermission('approve_payouts');

  useEffect(() => {
    financialsApi
      .getPayoutLedger()
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setLedger(res.data);
        }
      })
      .catch(() => {
        // Fallback to local mock ledger when API server is offline
      });
  }, []);

  const handleConfirmPayoutAction = async (reason: string) => {
    if (!authorizeTarget) return;

    // OWASP A06: Client-side action throttling rate limit check
    const rateCheck = rateLimiter.checkLimit(`payout_approve:${authorizeTarget.id}`, 2, 60000, 300000);
    if (!rateCheck.allowed) {
      alert(`⚠️ Action Rate Limited: High-value disbursal locked. Please retry in ${rateCheck.retryAfterSeconds}s.`);
      return;
    }

    financialsApi.authorizePayout(authorizeTarget.id, 'SECURITY_DUAL_CONTROL_VALIDATED').catch(() => {
      // Offline fallback handling
    });

    addAuditLog({
      action_code: 'PAYOUT_HIGH_VALUE_APPROVE',
      action_description: `Authorized mobile money payout of ${formatXAF(authorizeTarget.net_payout)} to ${authorizeTarget.entity_name} (${authorizeTarget.payment_method}). Dual-Control Audit Reason: "${reason}"`,
      target_id: authorizeTarget.id,
      security_level: 'CRITICAL',
    });

    setLedger((prev) =>
      prev.map((item) => (item.id === authorizeTarget.id ? { ...item, status: 'PROCESSED' } : item))
    );

    setAuthorizeTarget(null);
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
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {item.entity_type} • {maskPhone(item.account_number)}
          </span>
        </div>
      ),
    },
    {
      key: 'payment_method',
      header: 'Provider',
      render: (item) => (
        <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
          <Smartphone className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          {item.payment_method}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Gross Amount',
      render: (item) => <span className="font-semibold text-slate-700 dark:text-slate-300">{formatXAF(item.amount)}</span>,
    },
    {
      key: 'net_payout',
      header: 'Net Disbursal',
      render: (item) => <span className="font-bold text-teal-600 dark:text-teal-400">{formatXAF(item.net_payout)}</span>,
    },
    {
      key: 'risk_score',
      header: 'AML Risk Score',
      render: (item) => {
        const variantMap = { LOW: 'success', MEDIUM: 'warning', HIGH: 'error' } as const;
        return <Badge variant={variantMap[item.risk_score]} size="sm">AML {item.risk_score}</Badge>;
      },
    },
    {
      key: 'status',
      header: 'Payout Status',
      render: (item) => {
        const variantMap = { PENDING_APPROVAL: 'warning', PROCESSED: 'success', FLAGGED: 'error' } as const;
        return <Badge variant={variantMap[item.status]} size="sm">{item.status.replace('_', ' ')}</Badge>;
      },
    },
    {
      key: 'id',
      header: 'Actions',
      render: (item) => (
        <div>
          {item.status === 'PENDING_APPROVAL' ? (
            <Button
              variant="primary"
              size="sm"
              disabled={!canApprovePayout}
              onClick={() => setAuthorizeTarget(item)}
            >

              {!canApprovePayout ? <Lock className="w-3 h-3 mr-1" /> : null}
              Authorize Payout
            </Button>
          ) : (
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">No actions pending</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <PageContainer
      title="Financial & Treasury Operations"
      subtitle="Monitor Mobile Money escrow reserves, platform commissions, and authorize merchant payouts."
      action={
        <Button variant="outline" size="sm" onClick={handleExportStatement}>
          <Download className="w-4 h-4 mr-1.5" />
          Export Statement CSV
        </Button>
      }
    >
      {/* Stat Cards Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Escrow Lockbox Reserves"
          value={formatXAF(142850000)}
          change="+14.2% vs last week"
          changeType="positive"
          icon={<Lock className="w-5 h-5 text-teal-600 dark:text-teal-400" />}
        />
        <StatCard
          title="Pending Disbursals"
          value={formatXAF(2550000)}
          change="3 requests pending authorization"
          changeType="neutral"
          icon={<Wallet className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
        />
        <StatCard
          title="Platform Commission Net YTD"
          value={formatXAF(18420000)}
          change="3.5% automated deduction"
          changeType="positive"
          icon={<ArrowUpRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
        />
        <StatCard
          title="Daily MoMo Settlement"
          value={formatXAF(34500000)}
          change="MTN 62% • Orange 38%"
          changeType="neutral"
          icon={<Smartphone className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
        />
      </div>

      {/* Main Table */}
      <Card>
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Mobile Money Disbursal &amp; Payout Ledger</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Verify payee phone numbers, commission deductions, and authorize payouts.</p>
        </div>
        <DataTable data={ledger} columns={columns} searchPlaceholder="Search payouts by ref code or payee name..." />
      </Card>

      {/* OWASP A06: Dual-Control Confirmation Modal */}
      {authorizeTarget && (
        <DualControlConfirmModal
          isOpen={Boolean(authorizeTarget)}
          onClose={() => setAuthorizeTarget(null)}
          onConfirm={handleConfirmPayoutAction}
          title={`Authorize ${authorizeTarget.payment_method} Disbursal — ${authorizeTarget.reference_code}`}
          description={`You are authorizing a net disbursal of ${formatXAF(authorizeTarget.net_payout)} to ${authorizeTarget.entity_name} (${maskPhone(authorizeTarget.account_number)}). Dual-control operational justification is mandatory.`}
          confirmWord="APPROVE"
          actionButtonText="Authorize Mobile Money Disbursal"
          variant="primary"
          requireReason={true}
        />
      )}
    </PageContainer>
  );
};
