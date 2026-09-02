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
  Wallet,
  CreditCard,
  Building2,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
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

const MOCK_DONUT_DATA = [
  { name: 'Completed Escrow', value: 66, color: '#10B981' },
  { name: '48h Hold Frozen', value: 20, color: '#3B82F6' },
  { name: 'Disputed Hold', value: 9, color: '#F59E0B' },
  { name: 'Platform Commissions', value: 5, color: '#8B5CF6' },
];

export const DashboardPage: React.FC = () => {
  return (
    <PageContainer
      title="Executive Overview Dashboard"
      subtitle="Real-time Platform GMV, Mobile Money Reconciliation & Escrow Telemetry"
    >
      {/* Top Row: Compact Stat Cards with Colorful Avatar Icons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="TOTAL PLATFORM GMV"
          value={formatXAF(50600000)}
          change="+18.4% this week"
          changeType="positive"
          icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
          iconBg="bg-emerald-50"
          description="Gross merchandise volume in Cameroon"
        />

        <StatCard
          title="LOCKED IN ESCROW"
          value={formatXAF(22850000)}
          change="48h Hold"
          changeType="neutral"
          icon={<Lock className="w-5 h-5 text-amber-600" />}
          iconBg="bg-amber-50"
          description="Protected funds held across 42 active orders"
        />

        <StatCard
          title="PENDING STORE KYC"
          value="4 Stores"
          change="Action Req."
          changeType="negative"
          icon={<FileCheck className="w-5 h-5 text-blue-600" />}
          iconBg="bg-blue-50"
          description="Awaiting staff document verification"
        />

        <StatCard
          title="OPEN DISPUTES"
          value="2 Cases"
          change="Under Review"
          changeType="negative"
          icon={<ShieldAlert className="w-5 h-5 text-red-600" />}
          iconBg="bg-red-50"
          description="Requires staff adjudication"
        />
      </div>

      {/* Main Analytics Grid: Left Donut Statistic & Right Smooth Curved Area Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Left: Donut Chart "Current Escrow Statistic" (Inspired by Reference Design) */}
        <Card className="lg:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-slate-900 font-heading">
                Current Escrow Statistic
              </h3>
              <PieChartIcon className="w-4 h-4 text-slate-400" />
            </div>

            <div className="h-48 w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={MOCK_DONUT_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {MOCK_DONUT_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center">
                <span className="text-xs font-bold text-slate-400 block">Total Hold</span>
                <span className="text-lg font-extrabold text-slate-900 font-heading">100%</span>
              </div>
            </div>

            <div className="space-y-2.5 mt-4 pt-4 border-t border-slate-100 text-xs">
              {MOCK_DONUT_DATA.map((item) => (
                <div key={item.name} className="flex items-center justify-between font-semibold">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600">{item.name}</span>
                  </div>
                  <span className="text-slate-900 font-extrabold">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Right: Smooth Curved Line Graph "Market & Escrow Overview" */}
        <Card className="lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 font-heading">
                Market &amp; Escrow Telemetry Overview
              </h3>
              <p className="text-xs text-slate-500 font-medium">Weekly transaction volume processed in XAF</p>
            </div>

            <div className="flex items-center space-x-4 text-xs font-extrabold">
              <span className="flex items-center text-teal-600">
                <span className="w-3 h-3 rounded-full bg-teal-500 mr-1.5" /> Total GMV
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
                <Area type="monotone" dataKey="gmv" stroke="#0D9488" strokeWidth={3} fillOpacity={1} fill="url(#colorGmv)" />
                <Area type="monotone" dataKey="escrow" stroke="#F59E0B" strokeWidth={3} fillOpacity={1} fill="url(#colorEscrow)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Row of Vibrant Accent Cards (Inspired by Reference Design colorful wallet card row) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card 1: Emerald Green MTN MoMo Balance */}
        <div className="p-6 rounded-3xl bg-emerald-600 text-white shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10 blur-xl" />
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-200 block">MTN MOMO RECONCILED</span>
            <h4 className="text-2xl font-extrabold font-heading mt-2">{formatXAF(54200000)}</h4>
          </div>
          <div className="mt-6 flex items-center justify-between text-xs text-emerald-100 font-semibold">
            <span>USSD *126# Node</span>
            <span>100% Matched</span>
          </div>
        </div>

        {/* Card 2: Royal Blue Orange Money Balance */}
        <div className="p-6 rounded-3xl bg-blue-600 text-white shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10 blur-xl" />
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-200 block">ORANGE MONEY RECONCILED</span>
            <h4 className="text-2xl font-extrabold font-heading mt-2">{formatXAF(32150000)}</h4>
          </div>
          <div className="mt-6 flex items-center justify-between text-xs text-blue-100 font-semibold">
            <span>USSD #150# Node</span>
            <span>100% Matched</span>
          </div>
        </div>

        {/* Card 3: Violet Purple Escrow Hold */}
        <div className="p-6 rounded-3xl bg-purple-600 text-white shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10 blur-xl" />
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-200 block">ESCROW PROTECTED FUNDS</span>
            <h4 className="text-2xl font-extrabold font-heading mt-2">{formatXAF(22850000)}</h4>
          </div>
          <div className="mt-6 flex items-center justify-between text-xs text-purple-100 font-semibold">
            <span>42 Orders Hold</span>
            <span>Frozen Ledger</span>
          </div>
        </div>

        {/* Card 4: Amber Orange Platform Commission */}
        <div className="p-6 rounded-3xl bg-amber-500 text-white shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10 blur-xl" />
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-100 block">NET REVENUE (3.5% FEE)</span>
            <h4 className="text-2xl font-extrabold font-heading mt-2">{formatXAF(4820000)}</h4>
          </div>
          <div className="mt-6 flex items-center justify-between text-xs text-amber-100 font-semibold">
            <span>Monthly Yield</span>
            <span>+14.2% YoY</span>
          </div>
        </div>
      </div>

      {/* Priority Action Task Queue */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-extrabold text-slate-900 font-heading">
            Priority Action Tasks
          </h3>
          <Badge variant="warning">4 ACTION REQ.</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Task 1 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between">
            <div>
              <span className="text-xs font-extrabold text-slate-900 block">Douala Tech Hub</span>
              <span className="text-[11px] text-slate-500 mt-0.5 block font-medium">KYC Verification • National ID Front/Back</span>
            </div>
            <Badge variant="warning" size="sm">REVIEW</Badge>
          </div>

          {/* Task 2 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between">
            <div>
              <span className="text-xs font-extrabold text-slate-900 block">Dispute #WB-2026-9842</span>
              <span className="text-[11px] text-slate-500 mt-0.5 block font-medium">Buyer reported damaged screen</span>
            </div>
            <Badge variant="error" size="sm">DISPUTE</Badge>
          </div>

          {/* Task 3 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between">
            <div>
              <span className="text-xs font-extrabold text-slate-900 block">Penja Organic Farm</span>
              <span className="text-[11px] text-slate-500 mt-0.5 block font-medium">MoMo Payout Request (450,000 FCFA)</span>
            </div>
            <Badge variant="teal" size="sm">PAYOUT</Badge>
          </div>
        </div>
      </Card>
    </PageContainer>
  );
};
