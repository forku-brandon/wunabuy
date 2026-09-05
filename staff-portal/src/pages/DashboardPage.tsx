import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { StatCard } from '../components/ui/StatCard';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { SearchableSelect } from '../components/ui/SearchableSelect';
import { useStaffAuth, DEMO_STAFF_PERSONAS, StaffUser } from '../stores/staffAuthStore';
import { useLanguage } from '../context/LanguageContext';
import { formatXAF } from '@wunabuy/utils';
import {
  TrendingUp,
  Lock,
  FileCheck,
  ShieldAlert,
  CheckCircle2,
  CalendarDays,
  Plus,
  Clock,
  Check,
  UserCheck,
  Search,
  ChevronDown,
  ArrowRight,
  Send,
  PlayCircle,
  AlertTriangle,
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

export interface AssignedStaffTask {
  id: string;
  assigned_to_id: string;
  assigned_to_name: string;
  assigned_by_name: string;
  title: string;
  recurrence: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  due_date: string;
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';
  accepted_at?: string;
  completed_at?: string;
}

const INITIAL_ASSIGNED_TASKS: AssignedStaffTask[] = [
  {
    id: 'asgn_1',
    assigned_to_id: 'staff_901', // Pauline Mbarga
    assigned_to_name: 'Pauline Mbarga',
    assigned_by_name: 'Executive Board',
    title: 'Audit weekly MTN MoMo & Orange Money platform fee reconciliation statements',
    recurrence: 'WEEKLY',
    priority: 'HIGH',
    due_date: '2026-09-05',
    status: 'IN_PROGRESS',
    accepted_at: '08:30 AM Today',
  },
  {
    id: 'asgn_2',
    assigned_to_id: 'staff_901', // Pauline Mbarga
    assigned_to_name: 'Pauline Mbarga',
    assigned_by_name: 'Executive Board',
    title: 'Review high-value MoMo payouts exceeding 500,000 FCFA threshold',
    recurrence: 'DAILY',
    priority: 'HIGH',
    due_date: '2026-09-04',
    status: 'ASSIGNED',
  },
  {
    id: 'asgn_3',
    assigned_to_id: 'staff_907', // Chantal Nguesso (HR)
    assigned_to_name: 'Chantal Nguesso',
    assigned_by_name: 'Pauline Mbarga',
    title: 'Process monthly CNPS social security deductions and print staff payslips',
    recurrence: 'MONTHLY',
    priority: 'MEDIUM',
    due_date: '2026-09-28',
    status: 'IN_PROGRESS',
    accepted_at: '09:15 AM Today',
  },
  {
    id: 'asgn_4',
    assigned_to_id: 'staff_902', // Christian Atangana
    assigned_to_name: 'Christian Atangana',
    assigned_by_name: 'Pauline Mbarga',
    title: 'Verify seller Mobile Money wallet ledger entries before Friday disbursal',
    recurrence: 'WEEKLY',
    priority: 'HIGH',
    due_date: '2026-09-04',
    status: 'COMPLETED',
    accepted_at: '07:45 AM Today',
    completed_at: '09:00 AM Today',
  },
];

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

// LARGE ENTERPRISE DIGITAL EMPLOYEE WORKING CLOCK COMPONENT
const LargeEmployeeWorkingClock: React.FC = () => {
  const { t, language } = useLanguage();
  const [time, setTime] = useState<Date>(new Date());
  const [shiftSeconds, setShiftSeconds] = useState<number>(15480); // 04h 18m 00s initial shift duration

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
      setShiftSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = time.toLocaleTimeString(language === 'fr' ? 'fr-FR' : 'en-US', {
    hour12: true,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const dateString = time.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formatShiftDuration = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hrs).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`;
  };

  return (
    <div className="mb-8 p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#121824] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden transition-all">
      {/* Decorative Left Accent Bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-teal-500 via-teal-600 to-amber-500"></div>

      {/* Left: Ticking Digital Time Display */}
      <div className="flex items-center space-x-5 pl-2">
        <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center shadow-2xs">
          <Clock className="w-7 h-7 animate-pulse" />
        </div>
        <div>
          <div className="flex items-baseline space-x-3">
            <h2 className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-slate-900 dark:text-slate-100">
              {timeString}
            </h2>
            <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/60">
              WAT (UTC+1)
            </span>
          </div>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
            {dateString}
          </p>
        </div>
      </div>

      {/* Right: Employee Shift Duty & Node Status Badges */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Douala Node Live Status Pill */}
        <div className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 flex items-center space-x-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <div className="text-left">
            <span className="text-[10px] font-mono font-extrabold text-slate-400 uppercase tracking-wider block">TELEMETRY NODE</span>
            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">{t('clock.node_status', '28°C Douala Node (Live)')}</span>
          </div>
        </div>

        {/* Working Shift Active Counter */}
        <div className="px-4 py-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 flex items-center space-x-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></div>
          <div className="text-left">
            <span className="text-[10px] font-mono font-extrabold text-teal-800 dark:text-teal-300 uppercase tracking-wider block">{t('clock.active_shift', 'EMPLOYEE SHIFT DUTY')}</span>
            <span className="text-xs font-mono font-black text-teal-900 dark:text-teal-200">{formatShiftDuration(shiftSeconds)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// LIVE TICKING COUNTDOWN CLOCK & PROXIMITY NOTIFIER COMPONENT
interface TaskCountdownClockProps {
  dueDateStr: string;
}

const TaskCountdownClock: React.FC<TaskCountdownClockProps> = ({ dueDateStr }) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isOverdue: boolean;
    isUrgent: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isOverdue: false,
    isUrgent: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      const dueTime = new Date(`${dueDateStr}T23:59:59`).getTime();
      const now = new Date().getTime();
      const diff = dueTime - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isOverdue: true, isUrgent: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      // Urgent if 2 days or less remaining
      const isUrgent = days <= 2;

      setTimeLeft({ days, hours, minutes, seconds, isOverdue: false, isUrgent });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [dueDateStr]);

  if (timeLeft.isOverdue) {
    return (
      <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300 font-mono font-extrabold text-[11px] animate-pulse shadow-2xs">
        <AlertTriangle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
        <span>🚨 OVERDUE DEADLINE</span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg font-mono font-extrabold text-[11px] transition-all shadow-2xs ${
        timeLeft.isUrgent
          ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 animate-pulse border border-amber-300 dark:border-amber-700'
          : 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300'
      }`}
    >
      <Clock className={`w-3.5 h-3.5 ${timeLeft.isUrgent ? 'text-amber-600 dark:text-amber-400 animate-spin' : 'text-teal-600 dark:text-teal-400'}`} />
      <span>
        {timeLeft.days}d {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
      </span>
      {timeLeft.isUrgent && (
        <span className="ml-1 text-[9px] bg-amber-500 text-slate-950 px-1 rounded font-black">
          ⏰ DUE SOON
        </span>
      )}
    </div>
  );
};

// REUSABLE SEARCHABLE EMPLOYEE SELECT DROPDOWN COMPONENT
interface SearchableEmployeeSelectProps {
  selectedStaffId: string;
  onSelectStaff: (staffId: string) => void;
}

const SearchableEmployeeSelect: React.FC<SearchableEmployeeSelectProps> = ({
  selectedStaffId,
  onSelectStaff,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedPersona = DEMO_STAFF_PERSONAS.find((p) => p.id === selectedStaffId) || DEMO_STAFF_PERSONAS[0];

  const filteredPersonas = DEMO_STAFF_PERSONAS.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.full_name.toLowerCase().includes(q) ||
      p.department_name.toLowerCase().includes(q) ||
      (p.email && p.email.toLowerCase().includes(q)) ||
      p.employee_id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-left flex items-center justify-between font-bold text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors shadow-2xs"
      >
        <div className="flex items-center space-x-3">
          <img
            src={selectedPersona.avatar_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80'}
            alt={selectedPersona.full_name}
            className="w-7 h-7 rounded-full object-cover border border-teal-500"
          />
          <div>
            <span className="text-xs font-extrabold block">{selectedPersona.full_name}</span>
            <span className="text-[10px] text-slate-400 font-mono font-semibold">{selectedPersona.department_name} • {selectedPersona.employee_id}</span>
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-[#121824] rounded-xl shadow-2xl p-3 z-50 animate-fade-in space-y-2">
          {/* Live Search Input Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search staff by name, department, ID..."
              className="w-full pl-8 pr-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Filtered Employees List */}
          <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {filteredPersonas.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-400 font-medium">No matching staff members found</div>
            ) : (
              filteredPersonas.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onSelectStaff(p.id);
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                  className={`w-full p-2.5 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-lg transition-colors ${
                    p.id === selectedStaffId ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold' : ''
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <img
                      src={p.avatar_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80'}
                      alt={p.full_name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <div>
                      <span className="text-xs font-bold block text-slate-900 dark:text-slate-100">{p.full_name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{p.department_name} • {p.employee_id}</span>
                    </div>
                  </div>
                  {p.id === selectedStaffId && <Check className="w-4 h-4 text-teal-600 dark:text-teal-400" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, hasPermission, addAuditLog } = useStaffAuth();

  const canAssignTasks = hasPermission('assign_staff_tasks') || user?.security_clearance_level === 5;

  // Assigned Tasks Persistence
  const [assignedTasks, setAssignedTasks] = useState<AssignedStaffTask[]>(() => {
    const saved = localStorage.getItem('wunabuy_assigned_staff_tasks');
    return saved ? JSON.parse(saved) : INITIAL_ASSIGNED_TASKS;
  });

  // Active Sub-Tab View (Inbound Directives vs Outbound Manager Bench)
  const [taskViewTab, setTaskViewTab] = useState<'inbound' | 'outbound'>('inbound');

  // Modal State for Assigning Task
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Form State
  const [targetStaffId, setTargetStaffId] = useState(DEMO_STAFF_PERSONAS[0].id);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskRecurrence, setTaskRecurrence] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('WEEKLY');
  const [taskPriority, setTaskPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const [taskDueDate, setTaskDueDate] = useState('2026-09-05');

  // Toast State
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    localStorage.setItem('wunabuy_assigned_staff_tasks', JSON.stringify(assignedTasks));
  }, [assignedTasks]);

  // STAGE 1 -> STAGE 2: ACCEPT TASK BY EMPLOYEE
  const handleAcceptTask = (taskId: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAssignedTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: 'IN_PROGRESS', accepted_at: `${timeStr} Today` }
          : t
      )
    );

    addAuditLog({
      action_code: 'TASK_ACCEPT',
      action_description: `Accepted work directive: "${taskId}"`,
      security_level: 'INFO',
    });

    setToastMessage('Task ACCEPTED! Countdown clock activated for due date deadline.');
    setTimeout(() => setToastMessage(''), 3000);
  };

  // STAGE 2 -> STAGE 3: MARK COMPLETED BY EMPLOYEE
  const handleCompleteTask = (taskId: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAssignedTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: 'COMPLETED', completed_at: `${timeStr} Today` }
          : t
      )
    );

    addAuditLog({
      action_code: 'TASK_COMPLETE',
      action_description: `Marked work directive as COMPLETED: "${taskId}"`,
      security_level: 'INFO',
    });

    setToastMessage('Task COMPLETED! Reflected to assigning manager.');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const targetPersona = DEMO_STAFF_PERSONAS.find((p) => p.id === targetStaffId) || DEMO_STAFF_PERSONAS[0];

    const newTask: AssignedStaffTask = {
      id: 'asgn_' + Date.now().toString().slice(-4),
      assigned_to_id: targetPersona.id,
      assigned_to_name: targetPersona.full_name,
      assigned_by_name: user?.full_name || 'Manager',
      title: taskTitle,
      recurrence: taskRecurrence,
      priority: taskPriority,
      due_date: taskDueDate,
      status: 'ASSIGNED',
    };

    setAssignedTasks((prev) => [newTask, ...prev]);

    addAuditLog({
      action_code: 'TASK_ASSIGN_DISPATCH',
      action_description: `Assigned ${taskRecurrence.toLowerCase()} work task to ${targetPersona.full_name}: "${taskTitle}"`,
      security_level: 'INFO',
    });

    setTaskTitle('');
    setIsAssignModalOpen(false);
    setToastMessage(`Work directive successfully assigned to ${targetPersona.full_name}!`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Inbound tasks assigned TO current user
  const myInboundTasks = assignedTasks.filter(
    (t) => t.assigned_to_id === user?.id || t.assigned_to_name === user?.full_name
  );

  // Outbound tasks assigned BY current user (or all if Super Admin)
  const myOutboundTasks = assignedTasks.filter(
    (t) => user?.security_clearance_level === 5 || t.assigned_by_name.includes(user?.full_name?.split(' ')[0] || 'Pauline')
  );

  // Check if any in-progress tasks are urgent (due in <= 2 days)
  const hasUrgentInboundTask = myInboundTasks.some((t) => {
    if (t.status !== 'IN_PROGRESS') return false;
    const dueTime = new Date(`${t.due_date}T23:59:59`).getTime();
    const diffDays = (dueTime - Date.now()) / (1000 * 60 * 60 * 24);
    return diffDays <= 2;
  });

  return (
    <PageContainer
      title="Executive Overview Dashboard"
      subtitle="Real-time Platform GMV, Mobile Money Disbursal Reconciliation & Escrow Telemetry"
    >
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center space-x-2 animate-fade-in shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* LARGE CORPORATE DIGITAL EMPLOYEE WORKING CLOCK HERO CARD */}
      <LargeEmployeeWorkingClock />

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

      {/* SECTION: MULTI-STAGE ASSIGNED WORK DIRECTIVES & MANAGER BENCH */}
      <Card className="mb-8 p-6">
        {/* DUE SOON PROXIMITY ALARM BANNER FOR ACCEPTED TASKS */}
        {hasUrgentInboundTask && taskViewTab === 'inbound' && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-center justify-between shadow-2xs animate-pulse">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 animate-spin" />
              <div>
                <span className="font-extrabold uppercase block font-heading">⏰ URGENT DUE DATE ALARM</span>
                <p className="text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                  You have accepted task(s) due within the next 48 hours! Check live countdown ticking clocks below.
                </p>
              </div>
            </div>
            <Badge variant="amber" size="sm">ACTION REQUIRED</Badge>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <button
                onClick={() => setTaskViewTab('inbound')}
                className={`text-base font-extrabold font-heading pb-1 transition-colors ${
                  taskViewTab === 'inbound'
                    ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-600'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-700'
                }`}
              >
                My Inbound Tasks ({myInboundTasks.length})
              </button>

              {canAssignTasks && (
                <button
                  onClick={() => setTaskViewTab('outbound')}
                  className={`text-base font-extrabold font-heading pb-1 transition-colors ${
                    taskViewTab === 'outbound'
                      ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-600'
                      : 'text-slate-400 dark:text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Dispatched Work Bench ({myOutboundTasks.length})
                </button>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {taskViewTab === 'inbound'
                ? `Work directives assigned to ${user?.full_name} (Accept -> Execute -> Complete)`
                : 'Live status tracking of directives assigned to employees'}
            </p>
          </div>

          {canAssignTasks && (
            <Button variant="primary" size="sm" onClick={() => setIsAssignModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Assign Work Task to Employee
            </Button>
          )}
        </div>

        {/* TAB 1: MY INBOUND DIRECTIVES (EMPLOYEE VIEW) */}
        {taskViewTab === 'inbound' && (
          <div className="space-y-3">
            {myInboundTasks.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs font-medium bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                No assigned work directives for your persona today. Check back later or request an assignment.
              </div>
            ) : (
              myInboundTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                    task.status === 'COMPLETED'
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20'
                      : task.status === 'IN_PROGRESS'
                      ? 'bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/60'
                      : 'bg-slate-50 dark:bg-slate-800/60'
                  }`}
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300">
                        {task.recurrence} TASK
                      </span>
                      <Badge
                        variant={task.priority === 'HIGH' ? 'error' : task.priority === 'MEDIUM' ? 'warning' : 'neutral'}
                        size="sm"
                      >
                        {task.priority}
                      </Badge>

                      {/* LIVE TICKING COUNTDOWN CLOCK FOR ACCEPTED IN_PROGRESS TASKS */}
                      {task.status === 'IN_PROGRESS' && (
                        <TaskCountdownClock dueDateStr={task.due_date} />
                      )}

                      {task.status === 'ASSIGNED' && (
                        <span className="font-mono text-[10px] text-slate-400 font-bold">Due {task.due_date}</span>
                      )}
                    </div>

                    <h4
                      className={`text-xs font-bold ${
                        task.status === 'COMPLETED'
                          ? 'line-through text-slate-400'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {task.title}
                    </h4>

                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      Assigned by <strong className="text-slate-700 dark:text-slate-300">{task.assigned_by_name}</strong>
                      {task.accepted_at && <span className="ml-2 font-mono text-amber-600 dark:text-amber-400">Accepted: {task.accepted_at}</span>}
                      {task.completed_at && <span className="ml-2 font-mono text-emerald-600 dark:text-emerald-400">Completed: {task.completed_at}</span>}
                    </p>
                  </div>

                  {/* 2-STAGE ACTION BUTTONS FOR EMPLOYEE */}
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {task.status === 'ASSIGNED' && (
                      <Button variant="primary" size="sm" onClick={() => handleAcceptTask(task.id)}>
                        <PlayCircle className="w-3.5 h-3.5 mr-1" />
                        Accept Task
                      </Button>
                    )}

                    {task.status === 'IN_PROGRESS' && (
                      <Button variant="secondary" size="sm" onClick={() => handleCompleteTask(task.id)}>
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Mark Completed
                      </Button>
                    )}

                    {task.status === 'COMPLETED' && (
                      <Badge variant="success" size="md">
                        ✓ COMPLETED
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: DISPATCHED WORK BENCH (MANAGER OUTBOUND TRACKING VIEW) */}
        {taskViewTab === 'outbound' && (
          <div className="space-y-3">
            {myOutboundTasks.map((task) => (
              <div
                key={task.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100">Assigned To: {task.assigned_to_name}</span>
                    <Badge variant="teal" size="sm">{task.recurrence}</Badge>
                    {task.status === 'IN_PROGRESS' && <TaskCountdownClock dueDateStr={task.due_date} />}
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">{task.title}</p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Due: {task.due_date}
                    {task.accepted_at && <span className="ml-2 text-amber-600 dark:text-amber-400">Accepted: {task.accepted_at}</span>}
                    {task.completed_at && <span className="ml-2 text-emerald-600 dark:text-emerald-400">Completed: {task.completed_at}</span>}
                  </p>
                </div>

                <div>
                  <Badge
                    variant={
                      task.status === 'COMPLETED'
                        ? 'success'
                        : task.status === 'IN_PROGRESS'
                        ? 'warning'
                        : 'info'
                    }
                    size="md"
                  >
                    {task.status === 'ASSIGNED' ? '🔵 AWAITING ACCEPTANCE' : task.status === 'IN_PROGRESS' ? '🟡 IN PROGRESS' : '🟢 COMPLETED'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left: Donut Chart "Current Escrow Allocation" */}
        <Card className="lg:col-span-1 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
              ESCROW ALLOCATION BREAKDOWN
            </h3>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Active Mobile Money Escrow Hold Distribution</p>
            <div className="h-56 mt-4 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={MOCK_DONUT_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {MOCK_DONUT_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#121824',
                      borderColor: '#1E293B',
                      borderRadius: '8px',
                      color: '#F8FAFC',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-extrabold text-slate-900 dark:text-slate-100 font-mono">100%</span>
                <span className="text-[10px] text-slate-400 font-mono uppercase">Escrow Total</span>
              </div>
            </div>
          </div>

          {/* Donut Legend */}
          <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] font-semibold">
            {MOCK_DONUT_DATA.map((item) => (
              <div key={item.name} className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="truncate text-slate-600 dark:text-slate-400">{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Right: Area Chart "7-Day GMV vs Escrow Velocity" */}
        <Card className="lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  GMV &amp; ESCROW VELOCITY (7-DAY TELEMETRY)
                </h3>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                  Platform Volume vs Escrow Lockup (FCFA)
                </p>
              </div>
              <Badge variant="teal" size="sm">LIVE REVERB WSS</Badge>
            </div>

            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gmvGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0D9488" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="escrowGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#121824',
                      borderColor: '#1E293B',
                      borderRadius: '8px',
                      color: '#F8FAFC',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [formatXAF(Number(val)), '']}
                  />
                  <Area type="monotone" dataKey="gmv" stroke="#0D9488" strokeWidth={2.5} fillOpacity={1} fill="url(#gmvGradient)" />
                  <Area type="monotone" dataKey="escrow" stroke="#F59E0B" strokeWidth={2} fillOpacity={1} fill="url(#escrowGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold">
            <div className="flex items-center space-x-4">
              <span className="flex items-center text-teal-600 dark:text-teal-400">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500 mr-1.5" /> Gross GMV
              </span>
              <span className="flex items-center text-amber-600 dark:text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-1.5" /> Escrow Lockup
              </span>
            </div>
            <span className="font-mono text-slate-400 text-[11px]">Updated 1 min ago</span>
          </div>
        </Card>
      </div>

      {/* MODAL: ASSIGN NEW WORK TASK TO EMPLOYEE WITH SEARCHABLE DROPDOWN */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Work Directive to Employee"
      >
        <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs font-semibold">
          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              Select Employee (Search by Name, Department, or ID) *
            </label>
            <SearchableEmployeeSelect
              selectedStaffId={targetStaffId}
              onSelectStaff={(id) => setTargetStaffId(id)}
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">Work Directive Description *</label>
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="e.g. Audit weekly MoMo disbursal statements..."
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">Recurrence Schedule (Searchable)</label>
              <SearchableSelect
                options={[
                  { value: 'DAILY', label: 'DAILY 🔄', description: 'Repeats every workday' },
                  { value: 'WEEKLY', label: 'WEEKLY 📅', description: 'Repeats every Monday' },
                  { value: 'MONTHLY', label: 'MONTHLY 📆', description: 'Repeats on 1st of month' },
                ]}
                value={taskRecurrence}
                onChange={(val) => setTaskRecurrence(val as any)}
                searchPlaceholder="Search recurrence..."
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">Priority Level (Searchable)</label>
              <SearchableSelect
                options={[
                  { value: 'HIGH', label: 'HIGH (🔴)', description: 'Urgent immediate action' },
                  { value: 'MEDIUM', label: 'MEDIUM (🟡)', description: 'Standard operational task' },
                  { value: 'LOW', label: 'LOW (🟢)', description: 'Low priority backlog' },
                ]}
                value={taskPriority}
                onChange={(val) => setTaskPriority(val as any)}
                searchPlaceholder="Search priority..."
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">Due Date</label>
            <input
              type="date"
              value={taskDueDate}
              onChange={(e) => setTaskDueDate(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="pt-4 flex items-center justify-end space-x-3">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Assign &amp; Dispatch Task
            </Button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
};
