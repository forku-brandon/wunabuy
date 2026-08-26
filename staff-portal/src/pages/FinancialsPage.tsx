import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { formatXAF } from '@wunabuy/utils';
import { Wallet, TrendingUp, Lock, CheckCircle2 } from 'lucide-react';

interface PayoutRequestItem {
  id: string;
  recipient_name: string;
  recipient_role: string;
  amount: number;
  phone: string;
  provider: 'MTN' | 'ORANGE';
  status: 'pending' | 'completed' | 'rejected';
  requested_at: string;
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
    requested_at: '2026-08-26 12:10',
  },
  {
    id: 'pay_2',
    recipient_name: 'Samuel Mbida',
    recipient_role: 'TRANSPORTER',
    amount: 14000,
    phone: '+237 675 112 233',
    provider: 'MTN',
    status: 'pending',
    requested_at: '2026-08-26 13:45',
  },
];

export const FinancialsPage: React.FC = () => {
  const [payouts, setPayouts] = useState<PayoutRequestItem[]>(MOCK_PAYOUTS);
  const [toast, setToast] = useState<string | null>(null);

  const handleApprovePayout = (id: string) => {
    setPayouts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'completed' } : p))
    );
    setToast('Payout request authorized! Mobile Money transfer initiated.');
  };

  return (
    <PageContainer
      title="Financials, Revenue & Escrow Ledgers"
      subtitle="Track platform 3.5% commission earnings, locked escrow reserves, and authorize Mobile Money payouts."
    >
      {/* Financial Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="TOTAL ESCROW RESERVES"
          value={formatXAF(22850000)}
          change="48h Auto-Hold"
          changeType="neutral"
          icon={<Lock className="w-5 h-5" />}
          description="Protected customer funds across active orders"
        />

        <StatCard
          title="PLATFORM COMMISSION (3.5%)"
          value={formatXAF(1771000)}
          change="+14.2%"
          changeType="positive"
          icon={<TrendingUp className="w-5 h-5" />}
          description="Net Wunabuy platform revenue earned"
        />

        <StatCard
          title="PENDING PAYOUT QUEUE"
          value={formatXAF(464000)}
          change="2 Requests"
          changeType="warning"
          icon={<Wallet className="w-5 h-5" />}
          description="Awaiting staff authorization to MoMo"
        />
      </div>

      {/* Payout Requests Queue Table */}
      <Card className="p-0 overflow-hidden mb-8">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-heading">
              Merchant & Driver Payout Queue
            </h3>
            <p className="text-xs text-slate-500">Authorize Mobile Money withdrawals to Cameroon MoMo accounts</p>
          </div>
          <Badge variant="amber">2 PENDING</Badge>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-6">Recipient Name</th>
              <th className="py-3.5 px-6">Role</th>
              <th className="py-3.5 px-6">MoMo Account</th>
              <th className="py-3.5 px-6">Requested Amount</th>
              <th className="py-3.5 px-6">Status</th>
              <th className="py-3.5 px-6 text-right">Authorize</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {payouts.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-4 px-6 font-bold text-slate-900">{item.recipient_name}</td>
                <td className="py-4 px-6">
                  <Badge variant={item.recipient_role === 'SELLER' ? 'teal' : 'amber'} size="sm">
                    {item.recipient_role}
                  </Badge>
                </td>
                <td className="py-4 px-6 font-medium text-slate-700">
                  {item.provider} MoMo ({item.phone})
                </td>
                <td className="py-4 px-6 font-bold text-slate-900">{formatXAF(item.amount)}</td>
                <td className="py-4 px-6">
                  <Badge variant={item.status === 'completed' ? 'success' : 'warning'}>
                    {item.status.toUpperCase()}
                  </Badge>
                </td>
                <td className="py-4 px-6 text-right">
                  {item.status === 'pending' ? (
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      onClick={() => handleApprovePayout(item.id)}
                    >
                      Authorize MoMo Payout
                    </Button>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">Completed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-2xl font-medium border border-slate-800">
          {toast}
        </div>
      )}
    </PageContainer>
  );
};
