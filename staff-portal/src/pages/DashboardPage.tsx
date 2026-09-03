import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  PieChart as PieChartIcon,
  CheckCircle2,
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
  { name: 'Completed Escrow', value: 66, color: '#0D9488' },
  { name: '48h Hold Frozen', value: 20, color: '#3B82F6' },
  { name: 'Disputed Hold', value: 9, color: '#F59E0B' },
  { name: 'Platform Yield', value: 5, color: '#6366F1' },
];

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageContainer
      title="Executive Overview Dashboard"
      subtitle="Real-time Platform GMV, Mobile Money Disbursal Reconciliation & Escrow Telemetry"
    >
      {/* Top Row: Precision Enterprise Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="TOTAL PLATFORM GMV"
          value={formatXAF(50600000)}
          change="+18.4%"
          changeType="positive"
          icon={<TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
          iconBg="bg-emerald-50 dark:bg-emerald-950/60"
          description="Gross merchandise volume"
        />

        <StatCard
          title="LOCKED IN ESCROW"
          value={formatXAF(22850000)}
          change="48h Hold"
          changeType="neutral"
          icon={<Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
          iconBg="bg-amber-50 dark:bg-amber-950/60"
          description="42 active order holds"
        />

        <StatCard
          title="PENDING STORE KYC"
          value="4 Stores"
          change="Action Req."
          changeType="warning"
          icon={<FileCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
          iconBg="bg-blue-50 dark:bg-blue-950/60"
          description="Awaiting staff document audit"
        />

        <StatCard
          title="OPEN DISPUTES"
          value="2 Cases"
          change="Under Review"
          changeType="negative"
          icon={<ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400" />}
          iconBg="bg-red-50 dark:bg-red-950/60"
          description="Requires staff adjudication"
        />
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left: Donut Chart "Current Escrow Allocation" */}
        <Card className="lg:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                CURRENT ESCROW ALLOCATION
              </h3>
              <PieChartIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            </div>

            <div className="h-44 w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={MOCK_DONUT_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={75}
                    paddingAngle={4}
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
                <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 block uppercase">TOTAL HOLD</span>
                <span className="text-xl font-extrabold font-mono text-slate-900 dark:text-slate-100">100%</span>
              </div>
            </div>

            <div className="space-y-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              {MOCK_DONUT_DATA.map((item) => (
                <div key={item.name} className="flex items-center justify-between font-medium">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600 dark:text-slate-300 font-semibold">{item.name}</span>
                  </div>
                  <span className="text-slate-900 dark:text-slate-100 font-mono font-bold">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Right: Enterprise Smooth Area Chart */}
        <Card className="lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                MARKETPLACE TELEMETRY OVERVIEW
              </h3>
              <p className="text-xs text-slate-900 dark:text-slate-100 font-extrabold mt-0.5 font-heading">
                Weekly Platform Processing Volume (XAF)
              </p>
            </div>

            <div className="flex items-center space-x-4 text-xs font-bold font-mono">
              <span className="flex items-center text-teal-700 dark:text-teal-400">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600 mr-1.5" /> Total GMV
              </span>
              <span className="flex items-center text-amber-700 dark:text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-1.5" /> Escrow Locked
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_CHART_DATA}>
                <defs>
                  <linearGradient id="colorGmv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D9488" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorEscrow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`} />
                <Tooltip formatter={(value: number) => formatXAF(value)} />
                <Area type="monotone" dataKey="gmv" stroke="#0D9488" strokeWidth={2.5} fillOpacity={1} fill="url(#colorGmv)" />
                <Area type="monotone" dataKey="escrow" stroke="#F59E0B" strokeWidth={2.5} fillOpacity={1} fill="url(#colorEscrow)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Row of Enterprise Financial Ledger Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Dark Slate Navy Primary Card */}
        <div className="p-5 rounded-2xl bg-[#0F172A] text-white shadow-sm flex flex-col justify-between relative overflow-hidden border border-slate-800">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block">TOTAL RECONCILED YIELD</span>
            <h4 className="text-2xl font-extrabold font-mono mt-2 tracking-tight">{formatXAF(86350000)}</h4>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>MTN &amp; Orange Nodes</span>
            <span className="text-emerald-400 font-bold flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> 100% Matched
            </span>
          </div>
        </div>

        {/* Card 2: MTN MoMo */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#151C28] border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between text-slate-900 dark:text-slate-100">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 block">MTN MOMO RECONCILED</span>
            <h4 className="text-2xl font-extrabold font-mono text-slate-900 dark:text-slate-100 mt-2 tracking-tight">{formatXAF(54200000)}</h4>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span>USSD *126# Node</span>
            <span className="text-slate-900 dark:text-slate-100 font-bold">62.7% Volume</span>
          </div>
        </div>

        {/* Card 3: Orange Money */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#151C28] border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between text-slate-900 dark:text-slate-100">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 block">ORANGE MONEY RECONCILED</span>
            <h4 className="text-2xl font-extrabold font-mono text-slate-900 dark:text-slate-100 mt-2 tracking-tight">{formatXAF(32150000)}</h4>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span>USSD #150# Node</span>
            <span className="text-slate-900 dark:text-slate-100 font-bold">37.3% Volume</span>
          </div>
        </div>

        {/* Card 4: Platform Yield */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#151C28] border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between text-slate-900 dark:text-slate-100">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 block">NET REVENUE (3.5% FEE)</span>
            <h4 className="text-2xl font-extrabold font-mono text-slate-900 dark:text-slate-100 mt-2 tracking-tight">{formatXAF(4820000)}</h4>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span>Monthly Yield</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">+14.2% YoY</span>
          </div>
        </div>
      </div>

      {/* Priority Action Task Queue */}
      <Card>
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            OPERATIONAL TASK QUEUE
          </h3>
          <Badge variant="warning">4 ACTION REQ.</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Task 1 */}
          <div
            onClick={() => navigate('/kyc')}
            className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex items-start justify-between cursor-pointer hover:border-slate-400 dark:hover:border-slate-600 transition-all text-slate-900 dark:text-slate-100"
          >
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block font-heading">Douala Tech Hub</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block font-medium">KYC Verification • National ID Front/Back</span>
            </div>
            <Badge variant="warning" size="sm">REVIEW</Badge>
          </div>

          {/* Task 2 */}
          <div
            onClick={() => navigate('/disputes')}
            className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex items-start justify-between cursor-pointer hover:border-slate-400 dark:hover:border-slate-600 transition-all text-slate-900 dark:text-slate-100"
          >
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block font-heading">Dispute #WB-2026-9842</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block font-medium">Buyer reported damaged screen</span>
            </div>
            <Badge variant="error" size="sm">DISPUTE</Badge>
          </div>

          {/* Task 3 */}
          <div
            onClick={() => navigate('/financials')}
            className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex items-start justify-between cursor-pointer hover:border-slate-400 dark:hover:border-slate-600 transition-all text-slate-900 dark:text-slate-100"
          >
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block font-heading">Penja Organic Farm</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block font-medium">MoMo Payout Request (450,000 FCFA)</span>
            </div>
            <Badge variant="teal" size="sm">PAYOUT</Badge>
          </div>
        </div>
      </Card>
    </PageContainer>
  );
};
