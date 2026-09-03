import React, { useState, useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useStaffAuth } from '../stores/staffAuthStore';
import {
  Calendar as CalendarIcon,
  CheckSquare,
  Bell,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Tag,
  Check,
  X,
} from 'lucide-react';

interface ToDoItem {
  id: string;
  title: string;
  category: 'KYC Review' | 'Payout Disbursal' | 'Dispute Hearing' | 'Staff Meeting' | 'General';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  due_date: string;
  completed: boolean;
}

interface ReminderItem {
  id: string;
  title: string;
  alarm_time: string;
  priority: 'URGENT' | 'STANDARD';
  status: 'ACTIVE' | 'DISMISSED';
}

const INITIAL_TODOS: ToDoItem[] = [
  { id: 'td_1', title: 'Approve 850,000 FCFA MTN MoMo merchant payout for Douala Tech Hub', category: 'Payout Disbursal', priority: 'HIGH', due_date: '2026-09-03', completed: false },
  { id: 'td_2', title: 'Review CNI & Storefront photos for Akwa Supermarket KYC submission', category: 'KYC Review', priority: 'HIGH', due_date: '2026-09-03', completed: false },
  { id: 'td_3', title: 'Conduct 3-way dispute hearing for damaged phone order #WB-ORD-8821', category: 'Dispute Hearing', priority: 'MEDIUM', due_date: '2026-09-04', completed: true },
  { id: 'td_4', title: 'Executive board bi-weekly strategy meeting with regional leads', category: 'Staff Meeting', priority: 'MEDIUM', due_date: '2026-09-05', completed: false },
];

const INITIAL_REMINDERS: ReminderItem[] = [
  { id: 'rem_1', title: '🚨 Escrow hold 48-hour timeout deadline for Order #WB-9912', alarm_time: '14:30 Today', priority: 'URGENT', status: 'ACTIVE' },
  { id: 'rem_2', title: '📋 Monthly CNPS & Tax filing deadline for Douala HQ staff', alarm_time: '17:00 Tomorrow', priority: 'STANDARD', status: 'ACTIVE' },
];

export const CalendarPage: React.FC = () => {
  const { user, addAuditLog } = useStaffAuth();

  const [selectedDate, setSelectedDate] = useState<number>(3); // 3rd of September 2026
  const [currentMonth] = useState('September 2026');

  // Persistence State
  const [toDos, setToDos] = useState<ToDoItem[]>(() => {
    const saved = localStorage.getItem('wunabuy_staff_todos');
    return saved ? JSON.parse(saved) : INITIAL_TODOS;
  });

  const [reminders, setReminders] = useState<ReminderItem[]>(() => {
    const saved = localStorage.getItem('wunabuy_staff_reminders');
    return saved ? JSON.parse(saved) : INITIAL_REMINDERS;
  });

  // Filter State
  const [todoFilter, setTodoFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');

  // Modal States
  const [isAddTodoModalOpen, setIsAddTodoModalOpen] = useState(false);
  const [isAddReminderModalOpen, setIsAddReminderModalOpen] = useState(false);

  // New To-Do Form State
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoCategory, setNewTodoCategory] = useState<ToDoItem['category']>('General');
  const [newTodoPriority, setNewTodoPriority] = useState<ToDoItem['priority']>('MEDIUM');
  const [newTodoDueDate, setNewTodoDueDate] = useState('2026-09-03');

  // New Reminder Form State
  const [newReminderTitle, setNewReminderTitle] = useState('');
  const [newReminderTime, setNewReminderTime] = useState('15:00 Today');
  const [newReminderPriority, setNewReminderPriority] = useState<ReminderItem['priority']>('STANDARD');

  // Toast Alert
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    localStorage.setItem('wunabuy_staff_todos', JSON.stringify(toDos));
  }, [toDos]);

  useEffect(() => {
    localStorage.setItem('wunabuy_staff_reminders', JSON.stringify(reminders));
  }, [reminders]);

  const handleToggleTodo = (id: string) => {
    setToDos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDeleteTodo = (id: string) => {
    setToDos((prev) => prev.filter((t) => t.id !== id));
  };

  const handleCreateTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    const newItem: ToDoItem = {
      id: 'td_' + Date.now().toString().slice(-4),
      title: newTodoTitle,
      category: newTodoCategory,
      priority: newTodoPriority,
      due_date: newTodoDueDate,
      completed: false,
    };

    setToDos((prev) => [newItem, ...prev]);
    addAuditLog({
      action_code: 'TODO_CREATE',
      action_description: `Created new To-Do task "${newTodoTitle}"`,
      security_level: 'INFO',
    });

    setNewTodoTitle('');
    setIsAddTodoModalOpen(false);
    setToastMessage('New To-Do task added successfully!');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminderTitle.trim()) return;

    const newItem: ReminderItem = {
      id: 'rem_' + Date.now().toString().slice(-4),
      title: newReminderTitle,
      alarm_time: newReminderTime,
      priority: newReminderPriority,
      status: 'ACTIVE',
    };

    setReminders((prev) => [newItem, ...prev]);
    addAuditLog({
      action_code: 'REMINDER_CREATE',
      action_description: `Created new system reminder "${newReminderTitle}"`,
      security_level: 'INFO',
    });

    setNewReminderTitle('');
    setIsAddReminderModalOpen(false);
    setToastMessage('New reminder alarm set!');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleDismissReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'DISMISSED' } : r))
    );
  };

  const filteredToDos = toDos.filter((t) => {
    if (todoFilter === 'PENDING') return !t.completed;
    if (todoFilter === 'COMPLETED') return t.completed;
    return true;
  });

  // Calendar days grid generator for September 2026 (starts on Tuesday)
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <PageContainer
      title="Operational Calendar &amp; Task Manager"
      subtitle="Schedule corporate milestones, manage daily to-do tasks &amp; set automated system alarms"
    >
      {/* TOAST ALERT */}
      {toastMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center space-x-2 animate-fade-in shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* MAIN 3-COLUMN STRUCTURAL LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT COLUMN: INTERACTIVE MONTHLY CALENDAR GRID */}
        <Card className="lg:col-span-1 p-5">
          <div className="flex items-center justify-between pb-4 mb-4">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-heading">
                {currentMonth}
              </h3>
            </div>
            <div className="flex items-center space-x-1">
              <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] font-bold text-slate-400 mb-2">
            <span>SU</span>
            <span>MO</span>
            <span>TU</span>
            <span>WE</span>
            <span>TH</span>
            <span>FR</span>
            <span>SA</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold">
            {/* Blank offset for September 2026 starting Tuesday */}
            <span className="p-2"></span>
            <span className="p-2"></span>

            {daysInMonth.map((day) => {
              const isSelected = day === selectedDate;
              const isToday = day === 3;
              const hasEvents = day === 3 || day === 4 || day === 10 || day === 28;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(day)}
                  className={`p-2 rounded-lg relative transition-all ${
                    isSelected
                      ? 'bg-teal-600 text-white shadow-2xs font-extrabold scale-105'
                      : isToday
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-extrabold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>{day}</span>
                  {hasEvents && !isSelected && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Date Operational Deadlines Summary */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
              DEADLINES FOR SEP {selectedDate}, 2026
            </span>

            {selectedDate === 3 && (
              <div className="p-3 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 font-semibold space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span>💰 850k FCFA Merchant Payout</span>
                  <Badge variant="teal" size="sm">DUE TODAY</Badge>
                </div>
                <p className="text-[10px] text-teal-700 dark:text-teal-400 font-mono">Douala Tech Hub MoMo Disbursal</p>
              </div>
            )}

            {selectedDate !== 3 && (
              <p className="text-slate-400 font-medium text-xs">No critical operational deadlines scheduled for this date.</p>
            )}
          </div>
        </Card>

        {/* CENTER & RIGHT COLUMN: TO-DO MANAGER & SYSTEM REMINDERS */}
        <div className="lg:col-span-2 space-y-6">
          {/* TO-DO TASK LIST CONTAINER */}
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-heading flex items-center">
                  <CheckSquare className="w-5 h-5 text-teal-600 dark:text-teal-400 mr-2" />
                  Staff To-Do Task List
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {toDos.filter((t) => !t.completed).length} pending tasks • Priority tagged &amp; persisted
                </p>
              </div>

              <div className="flex items-center space-x-2">
                {/* Status Filter Buttons */}
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-bold">
                  <button
                    onClick={() => setTodoFilter('ALL')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${todoFilter === 'ALL' ? 'bg-white dark:bg-[#121824] text-slate-900 dark:text-slate-100 shadow-2xs' : 'text-slate-500'}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setTodoFilter('PENDING')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${todoFilter === 'PENDING' ? 'bg-white dark:bg-[#121824] text-slate-900 dark:text-slate-100 shadow-2xs' : 'text-slate-500'}`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => setTodoFilter('COMPLETED')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${todoFilter === 'COMPLETED' ? 'bg-white dark:bg-[#121824] text-slate-900 dark:text-slate-100 shadow-2xs' : 'text-slate-500'}`}
                  >
                    Done
                  </button>
                </div>

                <Button variant="primary" size="sm" onClick={() => setIsAddTodoModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Task
                </Button>
              </div>
            </div>

            {/* To-Do Items List */}
            <div className="space-y-3">
              {filteredToDos.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs font-medium">
                  No tasks matching the selected filter.
                </div>
              ) : (
                filteredToDos.map((task) => (
                  <div
                    key={task.id}
                    className={`p-4 rounded-lg flex items-start justify-between transition-all ${
                      task.completed
                        ? 'bg-slate-50/50 dark:bg-slate-800/20 opacity-60'
                        : 'bg-slate-50 dark:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleToggleTodo(task.id)}
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
                          <Badge variant="teal" size="sm">{task.category}</Badge>
                          <span className="font-mono text-slate-400 font-medium">Due: {task.due_date}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={task.priority === 'HIGH' ? 'error' : task.priority === 'MEDIUM' ? 'warning' : 'neutral'}
                        size="sm"
                      >
                        {task.priority}
                      </Badge>
                      <button
                        onClick={() => handleDeleteTodo(task.id)}
                        className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* SYSTEM REMINDERS & ALARMS CONTAINER */}
          <Card className="p-6">
            <div className="flex items-center justify-between pb-4 mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-heading flex items-center">
                  <Bell className="w-5 h-5 text-amber-500 mr-2" />
                  System Alarms &amp; Operational Reminders
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Automated alert signals &amp; time triggers
                </p>
              </div>

              <Button variant="outline" size="sm" onClick={() => setIsAddReminderModalOpen(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Add Reminder
              </Button>
            </div>

            <div className="space-y-3">
              {reminders.map((rem) => (
                <div
                  key={rem.id}
                  className={`p-3.5 rounded-lg flex items-center justify-between transition-all ${
                    rem.status === 'DISMISSED'
                      ? 'bg-slate-100/40 dark:bg-slate-900/40 opacity-50'
                      : 'bg-amber-50/60 dark:bg-amber-950/40'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">{rem.title}</span>
                      <span className="text-[10px] font-mono font-bold text-amber-800 dark:text-amber-300">Alarm: {rem.alarm_time}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge variant={rem.priority === 'URGENT' ? 'error' : 'amber'} size="sm">
                      {rem.priority}
                    </Badge>
                    {rem.status === 'ACTIVE' && (
                      <Button variant="ghost" size="sm" onClick={() => handleDismissReminder(rem.id)}>
                        Dismiss
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* CREATE NEW TO-DO MODAL */}
      <Modal
        isOpen={isAddTodoModalOpen}
        onClose={() => setIsAddTodoModalOpen(false)}
        title="Create New Staff To-Do Task"
      >
        <form onSubmit={handleCreateTodo} className="space-y-4 text-xs font-semibold">
          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">Task Description *</label>
            <input
              type="text"
              value={newTodoTitle}
              onChange={(e) => setNewTodoTitle(e.target.value)}
              placeholder="e.g. Audit MTN MoMo payout statement..."
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">Category</label>
              <select
                value={newTodoCategory}
                onChange={(e) => setNewTodoCategory(e.target.value as any)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                <option value="KYC Review">KYC Review</option>
                <option value="Payout Disbursal">Payout Disbursal</option>
                <option value="Dispute Hearing">Dispute Hearing</option>
                <option value="Staff Meeting">Staff Meeting</option>
                <option value="General">General</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">Priority</label>
              <select
                value={newTodoPriority}
                onChange={(e) => setNewTodoPriority(e.target.value as any)}
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
              value={newTodoDueDate}
              onChange={(e) => setNewTodoDueDate(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="pt-4 flex items-center justify-end space-x-3">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddTodoModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Create Task
            </Button>
          </div>
        </form>
      </Modal>

      {/* CREATE NEW REMINDER MODAL */}
      <Modal
        isOpen={isAddReminderModalOpen}
        onClose={() => setIsAddReminderModalOpen(false)}
        title="Set Operational Reminder Alarm"
      >
        <form onSubmit={handleCreateReminder} className="space-y-4 text-xs font-semibold">
          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">Reminder Title *</label>
            <input
              type="text"
              value={newReminderTitle}
              onChange={(e) => setNewReminderTitle(e.target.value)}
              placeholder="e.g. Escrow payout timeout signal..."
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">Alarm Time</label>
              <input
                type="text"
                value={newReminderTime}
                onChange={(e) => setNewReminderTime(e.target.value)}
                placeholder="16:00 Today"
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">Priority</label>
              <select
                value={newReminderPriority}
                onChange={(e) => setNewReminderPriority(e.target.value as any)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                <option value="URGENT">URGENT</option>
                <option value="STANDARD">STANDARD</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end space-x-3">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddReminderModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Set Alarm Reminder
            </Button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
};

