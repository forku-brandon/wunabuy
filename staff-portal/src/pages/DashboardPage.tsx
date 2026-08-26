import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { StatCard } from '../components/ui/StatCard';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { formatXAF } from '@wunabuy/utils';
import {
  TrendingUp,
  Lock,
  FileCheck,
  ShieldAlert,
  ArrowUpRight,
  Store,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

const MOCK_CHART_DATA = [
  { day: 'Mon', gmv: 4200000, escrow: 1850000 },
  { day: 'Tue', gmv: 5800000, escrow: 2400000 },
  { day: 'Wed', gmv: 3900000, escrow: 1600000 },
  { day: 'Thu', gmv: 7100000, escrow: 3200000 },
  { day: 'Fri', gmv: 8900000, escrow: 4100000 },
  { day: 'Sat', gmv: 11200000, escrow: 5300000 },
  { day: 'Sun', gmv: 9500000, escrow: 4400000 },
];

export const DashboardPage: React.FC = () => {
  return (
    <PageContainer
      title="Executive Overview Dashboard"
      subtitle="Real-time Platform GMV, Locked Escrow Ledgers & High-Priority Task Queues"
    >
      {/* Metric Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="TOTAL PLATFORM GMV"
          value={formatXAF(50600000)}
          change="+18.4%"
          changeType="positive"
          icon={<TrendingUp className="w-5 h-5" />}
          description="Gross Merchandise Volume this week"
        />

        <StatCard
          title="LOCKED IN ESCROW"
          value={formatXAF(22850000)}
          change="48h Auto-Hold"
          changeType="neutral"
          icon={<Lock className="w-5 h-5" />}
          description="Protected funds held across 42 active orders"
        />

        <StatCard
          title="PENDING STORE KYC"
          value="3 Stores"
          change="Action Req."
          changeType="negative"
          icon={<FileCheck className="w-5 h-5" />}
          description="Awaiting staff document verification"
        />

        <StatCard
          title="OPEN DISPUTES"
          value="1 Case"
          change="Under Review"
          changeType="negative"
          icon={<ShieldAlert className="w-5 h-5" />}
          description="Requires staff adjudication"
        />
      </div>

      {/* Analytics Chart & Task Queue Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Weekly GMV & Escrow Volume Chart */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-heading">
                Weekly Escrow & GMV Volume (XAF)
              </h3>
              <p className="text-xs text-slate-500">Total volume processed in Douala, Cameroon</p>
            </div>
            <div className="flex items-center space-x-4 text-xs font-semibold">
              <span className="flex items-center text-teal-600">
                <span className="w-3 h-3 rounded-full bg-teal-500 mr-1.5" /> GMV
              </span>
              <span className="flex items-center text-amber-600">
                <span className="w-3 h-3 rounded-full bg-amber-500 mr-1.5" /> Escrow Locked
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_CHART_DATA}>
                <defs>
                  <linearGradient id="colorGmv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D9488" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorEscrow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={10} tickFormatter={(val) => `${val / 1000000}M`} />
                <Tooltip formatter={(value: number) => formatXAF(value)} />
                <Area type="monotone" dataKey="gmv" stroke="#0D9488" strokeWidth={2} fillOpacity={1} fill="url(#colorGmv)" />
                <Area type="monotone" dataKey="escrow" stroke="#F59E0B" strokeWidth={2} fillOpacity={1} fill="url(#colorEscrow)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Priority Action Task Queue */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 font-heading">
              Priority Tasks
            </h3>
            <Badge variant="warning">4 ACTION REQ.</Badge>
          </div>

          <div className="space-y-4">
            {/* Task Item 1 */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Douala Tech Hub</span>
                <span className="text-[11px] text-slate-500 block">KYC Verification • National ID Front/Back</span>
              </div>
              <Badge variant="warning" size="sm">REVIEW</Badge>
            </div>

            {/* Task Item 2 */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Dispute #WB-2026-9842</span>
                <span className="text-[11px] text-slate-500 block">Buyer reported damaged screen</span>
              </div>
              <Badge variant="error" size="sm">DISPUTE</Badge>
            </div>

            {/* Task Item 3 */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Penja Organic Farm</span>
                <span className="text-[11px] text-slate-500 block">MoMo Payout Request (450,000 FCFA)</span>
              </div>
              <Badge variant="teal" size="sm">PAYOUT</Badge>
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
};
