import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { StatCard } from '../components/ui/StatCard';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useStaffAuth, DEMO_STAFF_PERSONAS, StaffUser } from '../stores/staffAuthStore';
import { formatXAF } from '@wunabuy/utils';
import {
  TrendingUp,
  Lock,
  FileCheck,
  ShieldAlert,
  PieChart as PieChartIcon,
  CheckCircle2,
  CalendarDays,
  Plus,
  Clock,
  Check,
  UserCheck,
  Search,
  ChevronDown,
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
  completed: boolean;
}

const INITIAL_ASSIGNED_TASKS: AssignedStaffTask[] = [
  {
    id: 'asgn_1',
    assigned_to_id: 'staff_901', // Pauline Mbarga
    assigned_to_name: 'Pauline Mbarga',
    assigned_by_name: 'Board Executive',
    title: 'Audit weekly MTN MoMo & Orange Money platform fee reconciliation statements',
    recurrence: 'WEEKLY',
    priority: 'HIGH',
    due_date: '2026-09-05',
    completed: false,
  },
  {
    id: 'asgn_2',
    assigned_to_id: 'staff_901', // Pauline Mbarga
    assigned_to_name: 'Pauline Mbarga',
    assigned_by_name: 'Board Executive',
    title: 'Review high-value MoMo payouts exceeding 500,000 FCFA threshold',
    recurrence: 'DAILY',
    priority: 'HIGH',
    due_date: '2026-09-03',
    completed: false,
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
    completed: false,
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
    completed: false,
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
      p.email.toLowerCase().includes(q) ||
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

  const handleToggleTaskCompletion = (taskId: string) => {
    setAssignedTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
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
      completed: false,
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

  // Filter assigned tasks for the currently logged-in persona
  const myAssignedTasks = assignedTasks.filter(
    (t) => t.assigned_to_id === user?.id || t.assigned_to_name === user?.full_name
  );

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

      {/* NEW SECTION: PERSONAL ASSIGNED STAFF WORK DIRECTIVES */}
      <Card className="mb-8 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-heading flex items-center">
              <CalendarDays className="w-5 h-5 text-teal-600 dark:text-teal-400 mr-2" />
              My Assigned Work Directives &amp; Operational Tasks
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Daily, Weekly, or Monthly recurring tasks assigned specifically to {user?.full_name}
            </p>
          </div>

          {canAssignTasks && (
            <Button variant="primary" size="sm" onClick={() => setIsAssignModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Assign Work Task to Employee
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {myAssignedTasks.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs font-medium bg-slate-50 dark:bg-slate-800/40 rounded-xl">
              No assigned work directives for your persona today. Check back later or create a new task.
            </div>
          ) : (
            myAssignedTasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 rounded-xl flex items-start justify-between transition-all ${
                  task.completed
                    ? 'bg-slate-50/50 dark:bg-slate-800/20 opacity-60'
                    : 'bg-slate-50 dark:bg-slate-800/60'
                }`}
              >
                <div className="flex items-start space-x-3.5">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleTaskCompletion(task.id)}
                    className="mt-1 w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                  />
                  <div className="space-y-1">
                    <span
                      className={`text-xs font-bold block ${
                        task.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {task.title}
                    </span>
                    <div className="flex items-center space-x-2 text-[10px]">
                      <span className="font-mono font-extrabold px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300">
                        {task.recurrence} TASK
                      </span>
                      <span className="text-slate-400 font-medium">Assigned by {task.assigned_by_name}</span>
                      <span className="font-mono text-slate-400 font-bold">• Due {task.due_date}</span>
                    </div>
                  </div>
                </div>

                <Badge
                  variant={task.priority === 'HIGH' ? 'error' : task.priority === 'MEDIUM' ? 'warning' : 'neutral'}
                  size="sm"
                >
                  {task.priority}
                </Badge>
              </div>
            ))
          )}
        </div>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">Recurrence Schedule</label>
              <select
                value={taskRecurrence}
                onChange={(e) => setTaskRecurrence(e.target.value as any)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                <option value="DAILY">DAILY 🔄</option>
                <option value="WEEKLY">WEEKLY 📅</option>
                <option value="MONTHLY">MONTHLY 📆</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">Priority Level</label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as any)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                <option value="HIGH">HIGH (🔴)</option>
                <option value="MEDIUM">MEDIUM (🟡)</option>
                <option value="LOW">LOW (🟢)</option>
              </select>
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
