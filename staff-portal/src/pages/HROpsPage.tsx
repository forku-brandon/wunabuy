import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { DataTable, Column } from '../components/ui/DataTable';
import { Modal } from '../components/ui/Modal';
import { DualControlConfirmModal } from '../components/ui/DualControlConfirmModal';
import { SearchableSelect } from '../components/ui/SearchableSelect';
import { useStaffAuth, StaffUser, StaffDepartmentRole } from '../stores/staffAuthStore';
import { sanitizeInput, maskPhone, maskEmail } from '../services/security';
import {
  Users,
  Wallet,
  FileText,
  Calendar,
  Printer,
  Download,
  Upload,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Search,
  Building2,
  Briefcase,
  Check,
  X,
  Plus,
  UserPlus,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Lock,
} from 'lucide-react';

interface PayrollRecord {
  id: string;
  employee_id: string;
  staff_name: string;
  department: string;
  job_title: string;
  base_salary: number;
  transport_allowance: number;
  bonus: number;
  cnps_deduction: number;
  tax_deduction: number;
  net_salary: number;
  payment_status: 'PAID' | 'PENDING' | 'PROCESSING';
  pay_period: string;
  payment_date: string;
}

interface StaffDocument {
  id: string;
  employee_id: string;
  staff_name: string;
  doc_type: 'CNI ID Card' | 'Employment Contract' | 'NIU Tax Certificate' | 'Health Clearance';
  file_name: string;
  upload_date: string;
  verification_status: 'VERIFIED' | 'PENDING' | 'REJECTED';
}

interface LeaveRequest {
  id: string;
  employee_id: string;
  staff_name: string;
  leave_type: 'Annual Leave' | 'Sick Leave' | 'Maternity Leave' | 'Emergency Leave';
  start_date: string;
  end_date: string;
  days_count: number;
  reason: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
}

const MOCK_PAYROLL_DATA: PayrollRecord[] = [
  {
    id: 'pay_101',
    employee_id: 'WNB-EMP-001',
    staff_name: 'Pauline Mbarga',
    department: 'Executive Management',
    job_title: 'Chief Operations Officer',
    base_salary: 1250000,
    transport_allowance: 150000,
    bonus: 200000,
    cnps_deduction: 52500,
    tax_deduction: 87500,
    net_salary: 1460000,
    payment_status: 'PAID',
    pay_period: 'August 2026',
    payment_date: '2026-08-28',
  },
  {
    id: 'pay_102',
    employee_id: 'WNB-EMP-014',
    staff_name: 'Christian Atangana',
    department: 'Finance & Treasury',
    job_title: 'Finance & Treasury Officer',
    base_salary: 850000,
    transport_allowance: 80000,
    bonus: 50000,
    cnps_deduction: 35700,
    tax_deduction: 59500,
    net_salary: 884800,
    payment_status: 'PAID',
    pay_period: 'August 2026',
    payment_date: '2026-08-28',
  },
  {
    id: 'pay_103',
    employee_id: 'WNB-EMP-007',
    staff_name: 'Chantal Nguesso',
    department: 'Human Resources & People Ops',
    job_title: 'HR & People Operations Lead',
    base_salary: 950000,
    transport_allowance: 100000,
    bonus: 75000,
    cnps_deduction: 39900,
    tax_deduction: 66500,
    net_salary: 1018600,
    payment_status: 'PAID',
    pay_period: 'August 2026',
    payment_date: '2026-08-28',
  },
];

const MOCK_DOCUMENTS_DATA: StaffDocument[] = [
  {
    id: 'doc_201',
    employee_id: 'WNB-EMP-001',
    staff_name: 'Pauline Mbarga',
    doc_type: 'Employment Contract',
    file_name: 'Pauline_Mbarga_Executive_Contract_2026.pdf',
    upload_date: '2026-01-15',
    verification_status: 'VERIFIED',
  },
  {
    id: 'doc_202',
    employee_id: 'WNB-EMP-014',
    staff_name: 'Christian Atangana',
    doc_type: 'CNI ID Card',
    file_name: 'CNI_Christian_Atangana_109283.pdf',
    upload_date: '2026-02-01',
    verification_status: 'VERIFIED',
  },
];

const MOCK_LEAVE_DATA: LeaveRequest[] = [
  {
    id: 'lv_301',
    employee_id: 'WNB-EMP-038',
    staff_name: 'Jean-Luc Fotso',
    leave_type: 'Annual Leave',
    start_date: '2026-09-10',
    end_date: '2026-09-24',
    days_count: 14,
    reason: 'Annual family vacation leave in Yaounde.',
    status: 'PENDING',
  },
];

const DEPARTMENT_OPTIONS = [
  { value: 'Executive Management', label: 'Executive Management', description: 'Board Executives & C-Level Admin' },
  { value: 'Human Resources & People Ops', label: 'Human Resources & People Ops', description: 'Staffing, Payroll & CNPS Compliance' },
  { value: 'Finance & Treasury', label: 'Finance & Treasury', description: 'MoMo Disbursals & Bank Ledger' },
  { value: 'Legal & Risk Verification', label: 'Legal & Risk Verification', description: 'Store & Driver KYC Audit' },
  { value: 'Logistics & Fleet Ops', label: 'Logistics & Fleet Ops', description: 'Rider & Driver Trip Telemetry' },
  { value: 'Customer Escrow Support', label: 'Customer Escrow Support', description: '3-Way Escrow Dispute Adjudication' },
];

const ROLE_OPTIONS = [
  { value: StaffDepartmentRole.SUPER_ADMIN, label: 'SUPER_ADMIN', description: 'Level 5 Full Access Clearance' },
  { value: StaffDepartmentRole.HR_MANAGER, label: 'HR_MANAGER', description: 'Level 4 Staffing & Payroll Lead' },
  { value: StaffDepartmentRole.FINANCE_OFFICER, label: 'FINANCE_OFFICER', description: 'Level 4 Treasury & MoMo Disbursals' },
  { value: StaffDepartmentRole.COMPLIANCE_OFFICER, label: 'COMPLIANCE_OFFICER', description: 'Level 4 KYC Verification Specialist' },
  { value: StaffDepartmentRole.OPS_MANAGER, label: 'OPS_MANAGER', description: 'Level 3 Logistics & Fleet Manager' },
  { value: StaffDepartmentRole.SUPPORT_AGENT, label: 'SUPPORT_AGENT', description: 'Level 2 Customer Support Specialist' },
];

const CLEARANCE_OPTIONS = [
  { value: '5', label: 'Level 5 (Super Admin Executive)', description: 'Full System Control & Audit Ledger' },
  { value: '4', label: 'Level 4 (Department Manager)', description: 'Departmental Approval Authority' },
  { value: '3', label: 'Level 3 (Supervisor)', description: 'Operational Dispatch & Overrides' },
  { value: '2', label: 'Level 2 (Support)', description: 'Customer Service Queue' },
  { value: '1', label: 'Level 1 (Auditor)', description: 'Read-Only Telemetry' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'ACTIVE 🟢', description: 'Corporate Portal Access Enabled' },
  { value: 'suspended', label: 'SUSPENDED 🔴', description: 'Access Revoked & Blocked' },
];

export const HROpsPage: React.FC = () => {
  const {
    user,
    hasPermission,
    addAuditLog,
    staffMembers,
    createStaffAccount,
    updateStaffAccount,
    deleteStaffAccount,
  } = useStaffAuth();

  const canViewHR = hasPermission('view_hr_ops') || user?.security_clearance_level === 5;
  const canManagePayroll = hasPermission('manage_hr_payroll') || user?.security_clearance_level === 5;
  const canManageStaff = hasPermission('manage_staff_crud') || user?.security_clearance_level === 5;

  const [activeTab, setActiveTab] = useState<'payroll' | 'documents' | 'leave' | 'staff_directory'>('staff_directory');
  const [payrollList] = useState<PayrollRecord[]>(MOCK_PAYROLL_DATA);
  const [leaveList, setLeaveList] = useState<LeaveRequest[]>(MOCK_LEAVE_DATA);

  // Payslip Modal State
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollRecord | null>(null);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState('');

  // STAFF ACCOUNT CRUD MODALS STATE
  const [isCreateStaffModalOpen, setIsCreateStaffModalOpen] = useState(false);
  const [isEditStaffModalOpen, setIsEditStaffModalOpen] = useState(false);
  const [isDeleteStaffModalOpen, setIsDeleteStaffModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffUser | null>(null);

  // Form State for Creating Staff Account
  const [newStaffFullName, setNewStaffFullName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('670123456');
  const [newStaffDepartment, setNewStaffDepartment] = useState('Logistics & Fleet Ops');
  const [newStaffRole, setNewStaffRole] = useState<string>(StaffDepartmentRole.OPS_MANAGER);
  const [newStaffClearance, setNewStaffClearance] = useState<number>(3);

  // Form State for Editing Staff Account
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editClearance, setEditClearance] = useState<number>(3);
  const [editStatus, setEditStatus] = useState<string>('active');

  const formatFCFA = (amount: number) => {
    return new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 })
      .format(amount)
      .replace('FCFA', 'FCFA');
  };

  const handlePrintPayslip = () => {
    window.print();
  };

  const handleApproveLeave = (leaveId: string, staffName: string) => {
    if (!canManagePayroll) {
      alert('Access Restricted: Only HR Managers can approve leave requests.');
      return;
    }
    setLeaveList((prev) =>
      prev.map((l) => (l.id === leaveId ? { ...l, status: 'APPROVED' } : l))
    );
    addAuditLog({
      action_code: 'HR_LEAVE_APPROVE',
      action_description: `Approved leave request for ${staffName}`,
      security_level: 'INFO',
    });
    setToastMessage(`Leave request for ${staffName} APPROVED!`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // STAFF ACCOUNT CREATION HANDLER
  const handleCreateStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffFullName.trim() || !newStaffEmail.trim()) return;

    if (!canManageStaff) {
      alert('Security Policy: Only HR Managers or Super Admins can provision staff accounts.');
      return;
    }

    const created = createStaffAccount({
      full_name: newStaffFullName,
      email: newStaffEmail,
      phone: newStaffPhone,
      department_name: newStaffDepartment,
      staff_department_role: newStaffRole,
      security_clearance_level: newStaffClearance,
    });

    setNewStaffFullName('');
    setNewStaffEmail('');
    setIsCreateStaffModalOpen(false);
    setToastMessage(`Corporate Staff Account for ${created.full_name} (${created.employee_id}) successfully provisioned!`);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // STAFF ACCOUNT EDIT HANDLER
  const handleOpenEditModal = (staff: StaffUser) => {
    setSelectedStaff(staff);
    setEditFullName(staff.full_name);
    setEditEmail(staff.email || '');
    setEditPhone(staff.phone || '');
    setEditDepartment(staff.department_name);
    setEditRole(staff.staff_department_role);
    setEditClearance(staff.security_clearance_level);
    setEditStatus(staff.status || 'active');
    setIsEditStaffModalOpen(true);
  };

  const handleEditStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;

    if (!canManageStaff) {
      alert('Security Policy: Only HR Managers or Super Admins can modify staff accounts.');
      return;
    }

    updateStaffAccount(selectedStaff.id, {
      full_name: editFullName,
      email: editEmail,
      phone: editPhone,
      department_name: editDepartment,
      staff_department_role: editRole,
      security_clearance_level: editClearance,
      status: editStatus as any,
    });

    setIsEditStaffModalOpen(false);
    setToastMessage(`Staff details for ${editFullName} updated successfully!`);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // STAFF ACCOUNT DELETE HANDLER
  const handleConfirmDeleteStaff = () => {
    if (!selectedStaff) return;

    if (!canManageStaff) {
      alert('Security Policy: Only HR Managers or Super Admins can revoke staff accounts.');
      return;
    }

    deleteStaffAccount(selectedStaff.id);
    setIsDeleteStaffModalOpen(false);
    setToastMessage(`Corporate access revoked and staff account deleted for ${selectedStaff.full_name}!`);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleToggleStaffStatus = (staff: StaffUser) => {
    if (!canManageStaff) {
      alert('Security Policy: Only HR Managers or Super Admins can alter staff account status.');
      return;
    }
    const newStatus = staff.status === 'active' ? 'suspended' : 'active';
    updateStaffAccount(staff.id, { status: newStatus as any });
    setToastMessage(`Staff account status for ${staff.full_name} changed to ${newStatus.toUpperCase()}`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  if (!canViewHR) {
    return (
      <PageContainer title="HR Operations &amp; Staff Directory" subtitle="Access Control Restricted">
        <div className="p-8 bg-amber-50 dark:bg-amber-950/60 rounded-xl text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-center space-x-4 shadow-2xs">
          <ShieldAlert className="w-8 h-8 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <div>
            <h3 className="font-extrabold text-sm uppercase">SECURITY CLEARANCE RESTRICTED</h3>
            <p className="mt-1 font-medium text-amber-800 dark:text-amber-300">
              Your active staff account does not have permission <code className="font-mono font-bold">view_hr_ops</code>. Contact Super Admin to request HR Clearance.
            </p>
          </div>
        </div>
      </PageContainer>
    );
  }

  // DATA TABLE COLUMNS FOR STAFF DIRECTORY
  const staffDirectoryColumns: Column<StaffUser>[] = [
    {
      key: 'full_name',
      header: 'Staff Member & ID',
      render: (row) => (
        <div className="flex items-center space-x-3">
          <img
            src={row.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
            alt={row.full_name}
            className="w-8 h-8 rounded-full object-cover border border-teal-500 flex-shrink-0"
          />
          <div>
            <div className="font-extrabold text-slate-900 dark:text-slate-100 text-xs">{row.full_name}</div>
            <div className="font-mono text-[10px] text-teal-600 dark:text-teal-400 font-bold">{row.employee_id}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Corporate Email & Phone',
      render: (row) => (
        <div className="space-y-0.5 text-xs">
          <div className="font-bold text-slate-800 dark:text-slate-200 font-mono">{row.email}</div>
          <div className="text-[10px] text-slate-400 font-mono">{row.phone}</div>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department & Role',
      render: (row) => (
        <div className="space-y-0.5">
          <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">{row.department_name}</span>
          <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400 font-extrabold">{row.staff_department_role}</span>
        </div>
      ),
    },
    {
      key: 'clearance',
      header: 'Clearance Level',
      render: (row) => (
        <Badge variant={row.security_clearance_level === 5 ? 'amber' : row.security_clearance_level >= 4 ? 'teal' : 'neutral'}>
          Level {row.security_clearance_level}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Account Status',
      render: (row) => (
        <Badge variant={row.status === 'active' ? 'success' : 'error'}>
          {row.status === 'active' ? '🟢 ACTIVE' : '🔴 SUSPENDED'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center space-x-1.5">
          <Button
            variant="outline"
            size="sm"
            disabled={!canManageStaff}
            onClick={() => handleOpenEditModal(row)}
            title="Edit Staff Info"
          >
            <Edit className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={!canManageStaff}
            onClick={() => handleToggleStaffStatus(row)}
            title={row.status === 'active' ? 'Suspend Account' : 'Activate Account'}
          >
            {row.status === 'active' ? (
              <UserX className="w-3.5 h-3.5 text-amber-600" />
            ) : (
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            )}
          </Button>

          {user?.security_clearance_level === 5 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedStaff(row);
                setIsDeleteStaffModalOpen(true);
              }}
              title="Revoke & Delete Staff Account"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-600" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const payrollColumns: Column<PayrollRecord>[] = [
    {
      key: 'staff_name',
      header: 'Employee Staff Member',
      render: (row) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-extrabold flex items-center justify-center text-xs">
            {row.staff_name.charAt(0)}
          </div>
          <div>
            <div className="font-extrabold text-slate-900 dark:text-slate-100 text-xs">{row.staff_name}</div>
            <div className="font-mono text-[10px] text-teal-600 dark:text-teal-400 font-bold">{row.employee_id} • {row.job_title}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      render: (row) => <span className="font-medium text-xs text-slate-600 dark:text-slate-300">{row.department}</span>,
    },
    {
      key: 'base_salary',
      header: 'Base Salary',
      render: (row) => <span className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100">{formatFCFA(row.base_salary)}</span>,
    },
    {
      key: 'deductions',
      header: 'Deductions (CNPS/Tax)',
      render: (row) => (
        <span className="font-mono text-xs text-red-600 dark:text-red-400 font-medium">
          -{formatFCFA(row.cnps_deduction + row.tax_deduction)}
        </span>
      ),
    },
    {
      key: 'net_salary',
      header: 'Net Payable',
      render: (row) => (
        <span className="font-mono font-extrabold text-xs text-emerald-700 dark:text-emerald-400">
          {formatFCFA(row.net_salary)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      render: (row) => (
        <Button variant="secondary" size="sm" onClick={() => setSelectedPayslip(row)}>
          <Printer className="w-3.5 h-3.5 mr-1" />
          Print Payslip
        </Button>
      ),
    },
  ];

  return (
    <PageContainer
      title="Human Resources &amp; Corporate Staff Operations"
      subtitle="Staff Account Roster, Provisioning CRUD, Monthly Payroll &amp; CNPS Tax Ledger"
    >
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center space-x-2 animate-fade-in shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Total Staff Members"
          value={`${staffMembers.length} Staff`}
          change="Active Roster"
          changeType="positive"
          icon={<Users className="w-5 h-5 text-teal-600 dark:text-teal-400" />}
          description="Provisioned company accounts"
        />
        <StatCard
          title="Monthly Gross Payroll"
          value={formatFCFA(3363400)}
          change="August 2026"
          changeType="neutral"
          icon={<Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          description="Salary + CNPS + Tax"
        />
        <StatCard
          title="Pending Leave Queue"
          value="1 Request"
          change="Requires Action"
          changeType="warning"
          icon={<Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
          description="Annual &amp; Sick leave"
        />
        <StatCard
          title="Verified Contracts"
          value="100%"
          change="Compliant"
          changeType="positive"
          icon={<FileText className="w-5 h-5 text-teal-600 dark:text-teal-400" />}
          description="CNI &amp; NIU tax filed"
        />
      </div>

      {/* TAB NAVIGATION BAR */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button
          onClick={() => setActiveTab('staff_directory')}
          className={`px-4 py-2.5 rounded-lg text-xs font-extrabold flex items-center space-x-2 transition-all ${
            activeTab === 'staff_directory'
              ? 'bg-teal-600 text-white shadow-2xs'
              : 'bg-white dark:bg-[#121824] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Staff Directory &amp; Roster ({staffMembers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('payroll')}
          className={`px-4 py-2.5 rounded-lg text-xs font-extrabold flex items-center space-x-2 transition-all ${
            activeTab === 'payroll'
              ? 'bg-teal-600 text-white shadow-2xs'
              : 'bg-white dark:bg-[#121824] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Payroll &amp; Payslips</span>
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2.5 rounded-lg text-xs font-extrabold flex items-center space-x-2 transition-all ${
            activeTab === 'documents'
              ? 'bg-teal-600 text-white shadow-2xs'
              : 'bg-white dark:bg-[#121824] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Staff Documents ({MOCK_DOCUMENTS_DATA.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('leave')}
          className={`px-4 py-2.5 rounded-lg text-xs font-extrabold flex items-center space-x-2 transition-all ${
            activeTab === 'leave'
              ? 'bg-teal-600 text-white shadow-2xs'
              : 'bg-white dark:bg-[#121824] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Leave Requests ({leaveList.length})</span>
        </button>
      </div>

      {/* TAB 0: STAFF DIRECTORY & PROVISIONING (CRUD ENGINE) */}
      {activeTab === 'staff_directory' && (
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-heading">
                Corporate Staff Roster &amp; Account Provisioning
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Create corporate accounts with email, phone, security clearance, and dual OTP/Password login.
              </p>
            </div>
            {canManageStaff && (
              <Button variant="primary" size="sm" onClick={() => setIsCreateStaffModalOpen(true)}>
                <UserPlus className="w-4 h-4 mr-1.5" />
                Provision New Staff Account
              </Button>
            )}
          </div>

          <DataTable
            data={staffMembers}
            columns={staffDirectoryColumns}
            searchable={true}
            searchPlaceholder="Search staff member by name, corporate email, phone, employee ID..."
          />
        </Card>
      )}

      {/* TAB 1: PAYROLL & PRINTABLE PAYSLIPS */}
      {activeTab === 'payroll' && (
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-heading">
                Monthly Staff Payroll Disbursal Ledger
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Period: August 2026 • Itemized CNPS &amp; IRPP Tax Deductions (XAF)
              </p>
            </div>
            <Button variant="primary" disabled={!canManagePayroll} onClick={() => alert('Batch salary disbursal initiated to staff bank/MoMo accounts!')}>
              <Wallet className="w-4 h-4 mr-1.5" />
              Disburse All Pending Payroll
            </Button>
          </div>

          <DataTable
            data={payrollList}
            columns={payrollColumns}
            searchable={true}
            searchPlaceholder="Search staff member, employee ID..."
          />
        </Card>
      )}

      {/* TAB 2: STAFF DOCUMENTS VAULT */}
      {activeTab === 'documents' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-heading">
                Staff Document Vault &amp; Legal Contracts
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Verified CNI Cards, Employment Contracts &amp; NIU Tax Certificates
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {MOCK_DOCUMENTS_DATA.map((doc) => (
              <div key={doc.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{doc.doc_type} — {doc.staff_name}</h4>
                    <p className="text-[10px] text-slate-400 font-mono">{doc.file_name} • Uploaded {doc.upload_date}</p>
                  </div>
                </div>
                <Badge variant="success">VERIFIED</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 3: LEAVE QUEUE */}
      {activeTab === 'leave' && (
        <Card className="p-6">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-heading mb-4">
            Staff Leave Requests &amp; Approval Queue
          </h3>
          <div className="space-y-4">
            {leaveList.map((req) => (
              <div key={req.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">{req.staff_name} ({req.leave_type})</span>
                  <span className="text-[10px] text-slate-500 font-medium">{req.start_date} to {req.end_date} ({req.days_count} Days)</span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">{req.reason}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {req.status === 'PENDING' ? (
                    <Button variant="primary" size="sm" onClick={() => handleApproveLeave(req.id, req.staff_name)}>
                      Approve Leave
                    </Button>
                  ) : (
                    <Badge variant="success">APPROVED</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* MODAL 1: PROVISION NEW STAFF ACCOUNT WITH SEARCHABLE DROPDOWNS */}
      <Modal
        isOpen={isCreateStaffModalOpen}
        onClose={() => setIsCreateStaffModalOpen(false)}
        title="Provision New Corporate Staff Account"
      >
        <form onSubmit={handleCreateStaffSubmit} className="space-y-4 text-xs font-semibold">
          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">Staff Full Name *</label>
            <input
              type="text"
              required
              value={newStaffFullName}
              onChange={(e) => setNewStaffFullName(e.target.value)}
              placeholder="e.g. Jean-Luc Fotso"
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">Corporate Email Address *</label>
            <input
              type="email"
              required
              value={newStaffEmail}
              onChange={(e) => setNewStaffEmail(e.target.value)}
              placeholder="jeanluc.fotso@wunabuy.com"
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">Employee Phone Number (+237) *</label>
            <input
              type="text"
              required
              value={newStaffPhone}
              onChange={(e) => setNewStaffPhone(e.target.value)}
              placeholder="670123456"
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">Department (Searchable)</label>
              <SearchableSelect
                options={DEPARTMENT_OPTIONS}
                value={newStaffDepartment}
                onChange={(val) => setNewStaffDepartment(val)}
                searchPlaceholder="Search department..."
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">Staff Role Code (Searchable)</label>
              <SearchableSelect
                options={ROLE_OPTIONS}
                value={newStaffRole}
                onChange={(val) => setNewStaffRole(val)}
                searchPlaceholder="Search role..."
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">Security Clearance Level (Searchable)</label>
            <SearchableSelect
              options={CLEARANCE_OPTIONS}
              value={String(newStaffClearance)}
              onChange={(val) => setNewStaffClearance(Number(val))}
              searchPlaceholder="Search clearance..."
            />
          </div>

          <div className="pt-4 flex items-center justify-end space-x-3">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateStaffModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              <UserPlus className="w-4 h-4 mr-1.5" />
              Provision Staff Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: EDIT STAFF ACCOUNT WITH SEARCHABLE DROPDOWNS */}
      <Modal
        isOpen={isEditStaffModalOpen}
        onClose={() => setIsEditStaffModalOpen(false)}
        title={`Edit Staff Account — ${selectedStaff?.full_name}`}
      >
        <form onSubmit={handleEditStaffSubmit} className="space-y-4 text-xs font-semibold">
          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">Full Name *</label>
            <input
              type="text"
              required
              value={editFullName}
              onChange={(e) => setEditFullName(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">Corporate Email *</label>
            <input
              type="email"
              required
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">Phone Number *</label>
            <input
              type="text"
              required
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">Department (Searchable)</label>
              <SearchableSelect
                options={DEPARTMENT_OPTIONS}
                value={editDepartment}
                onChange={(val) => setEditDepartment(val)}
                searchPlaceholder="Search department..."
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">Account Status (Searchable)</label>
              <SearchableSelect
                options={STATUS_OPTIONS}
                value={editStatus}
                onChange={(val) => setEditStatus(val)}
                searchPlaceholder="Search status..."
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">Security Clearance Level (Searchable)</label>
            <SearchableSelect
              options={CLEARANCE_OPTIONS}
              value={String(editClearance)}
              onChange={(val) => setEditClearance(Number(val))}
              searchPlaceholder="Search clearance..."
            />
          </div>

          <div className="pt-4 flex items-center justify-end space-x-3">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsEditStaffModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Account Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: DELETE / REVOKE STAFF ACCOUNT CONFIRMATION */}
      {selectedStaff && (
        <DualControlConfirmModal
          isOpen={isDeleteStaffModalOpen}
          onClose={() => setIsDeleteStaffModalOpen(false)}
          onConfirm={(reason) => {
            handleConfirmDeleteStaff();
          }}
          title={`Revoke Staff Account — ${selectedStaff.full_name}`}
          description={`You are revoking corporate access and deleting employee account ${selectedStaff.full_name} (${selectedStaff.employee_id}). Dual-control operational reason is mandatory.`}
          confirmWord="REVOKE"
          actionButtonText="Revoke & Delete Staff Account"
          variant="danger"
          requireReason={true}
        />
      )}

      {/* PRINTABLE PAYSLIP MODAL */}
      <Modal
        isOpen={Boolean(selectedPayslip)}
        onClose={() => setSelectedPayslip(null)}
        title={`Official Staff Payslip — ${selectedPayslip?.pay_period}`}
      >
        {selectedPayslip && (
          <div className="space-y-6 text-slate-900 text-xs">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center space-x-3">
                <img
                  src="/wunabuy-icon.png"
                  alt="Wunabuy Icon Logo"
                  className="w-12 h-12 rounded-xl object-contain border border-teal-600 shadow-2xs bg-white p-1"
                />
                <div>
                  <h2 className="text-lg font-black font-heading text-teal-800">WUNABUY CAMEROON SARL</h2>
                  <p className="text-[10px] text-slate-500 font-mono">Akwa Boulevard, Street 104, Douala • NIU: M082618940291X</p>
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="font-bold text-xs block text-slate-800">PAYSLIP #{selectedPayslip.id.toUpperCase()}</span>
                <span className="text-[10px] text-slate-500">Issued: {selectedPayslip.payment_date}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl font-medium">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Employee Name</span>
                <span className="font-bold text-sm text-slate-900">{selectedPayslip.staff_name}</span>
                <span className="text-[11px] text-teal-700 font-mono block">{selectedPayslip.employee_id}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Department &amp; Title</span>
                <span className="font-bold text-xs text-slate-900">{selectedPayslip.job_title}</span>
                <span className="text-[11px] text-slate-600 block">{selectedPayslip.department}</span>
              </div>
            </div>

            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between font-bold">
                <span>Base Gross Salary</span>
                <span className="font-mono">{formatFCFA(selectedPayslip.base_salary)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Transport Allowance</span>
                <span className="font-mono">{formatFCFA(selectedPayslip.transport_allowance)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Performance Bonus</span>
                <span className="font-mono">{formatFCFA(selectedPayslip.bonus)}</span>
              </div>
              <div className="flex justify-between text-red-600 font-medium">
                <span>CNPS Social Security (4.2%)</span>
                <span className="font-mono">-{formatFCFA(selectedPayslip.cnps_deduction)}</span>
              </div>
              <div className="flex justify-between text-red-600 font-medium">
                <span>IRPP Income Tax Deduction</span>
                <span className="font-mono">-{formatFCFA(selectedPayslip.tax_deduction)}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold border-t pt-3 text-emerald-800 font-mono">
                <span>NET PAYABLE DISBURSED</span>
                <span>{formatFCFA(selectedPayslip.net_salary)}</span>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end space-x-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setSelectedPayslip(null)}>
                Close
              </Button>
              <Button type="button" variant="primary" size="sm" onClick={handlePrintPayslip}>
                <Printer className="w-4 h-4 mr-1.5" />
                Print Payslip (PDF)
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};
