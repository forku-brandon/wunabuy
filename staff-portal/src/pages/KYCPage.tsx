import React, { useState, useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { StatCard } from '../components/ui/StatCard';
import { Modal } from '../components/ui/Modal';
import { DataTable, Column } from '../components/ui/DataTable';
import { useStaffAuth } from '../stores/staffAuthStore';
import { kycApi } from '../services';
import {
  FileCheck,
  Building2,
  Bike,
  CheckCircle2,
  XCircle,
  Eye,
  Lock,
} from 'lucide-react';

interface KYCSubmissionItem {
  id: string;
  applicant_name: string;
  applicant_type: 'STORE_SELLER' | 'DRIVER_TRANSPORTER';
  entity_title: string;
  phone: string;
  city_quarter: string;
  cni_number: string;
  submitted_at: string;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  cni_front_url: string;
  cni_back_url: string;
  storefront_or_vehicle_photo: string;
}

const MOCK_KYC_QUEUE: KYCSubmissionItem[] = [
  {
    id: 'kyc_101',
    applicant_name: 'Emmanuel Nsangou',
    applicant_type: 'STORE_SELLER',
    entity_title: 'Douala Tech Hub',
    phone: '+237 670 123 456',
    city_quarter: 'Akwa, Douala',
    cni_number: 'CNI-118940291',
    submitted_at: '2026-09-02 09:30',
    status: 'PENDING_REVIEW',
    cni_front_url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=400&q=80',
    cni_back_url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=400&q=80',
    storefront_or_vehicle_photo: 'https://images.unsplash.com/photo-1555421689-491a97ff2040?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'kyc_102',
    applicant_name: 'Jean-Paul Nkoum',
    applicant_type: 'DRIVER_TRANSPORTER',
    entity_title: 'Yamaha Crux 110cc (Bike)',
    phone: '+237 670 112 233',
    city_quarter: 'Bonanjo, Douala',
    cni_number: 'CNI-109283741',
    submitted_at: '2026-09-02 10:15',
    status: 'PENDING_REVIEW',
    cni_front_url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=400&q=80',
    cni_back_url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=400&q=80',
    storefront_or_vehicle_photo: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=400&q=80',
  },
];

export const KYCPage: React.FC = () => {
  const { addAuditLog, hasPermission } = useStaffAuth();
  const [queue, setQueue] = useState<KYCSubmissionItem[]>(MOCK_KYC_QUEUE);
  
  // Interactive Modal
  const [inspectTarget, setInspectTarget] = useState<KYCSubmissionItem | null>(null);
  const [rejectionNotes, setRejectionNotes] = useState('');

  const canApprove = hasPermission('approve_kyc');

  useEffect(() => {
    kycApi
      .getKYCQueue()
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setQueue(res.data);
        }
      })
      .catch(() => {
        // Fallback to local mock data when API server is offline
      });
  }, []);

  const handleDecision = async (decision: 'APPROVED' | 'REJECTED') => {
    if (!inspectTarget) return;

    // Call backend API endpoint with fallback
    kycApi.submitDecision(inspectTarget.id, decision, rejectionNotes).catch(() => {
      // Offline fallback handling
    });

    addAuditLog({
      action_code: decision === 'APPROVED' ? 'KYC_DOCUMENT_APPROVE' : 'KYC_DOCUMENT_REJECT',
      action_description: `${decision === 'APPROVED' ? 'Approved' : 'Rejected'} KYC submission for ${inspectTarget.applicant_name} (${inspectTarget.entity_title}). Notes: ${rejectionNotes || 'Document compliance verified'}`,
      target_id: inspectTarget.id,
      security_level: 'WARNING',
    });

    setQueue((prev) =>
      prev.map((item) => (item.id === inspectTarget.id ? { ...item, status: decision } : item))
    );

    setInspectTarget(null);
    setRejectionNotes('');
  };

  const columns: Column<KYCSubmissionItem>[] = [
    {
      key: 'applicant_name',
      header: 'Applicant Name',
      render: (item) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-slate-100 block">{item.applicant_name}</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{item.phone}</span>
        </div>
      ),
    },
    {
      key: 'applicant_type',
      header: 'Type / Entity',
      render: (item) => (
        <div>
          <span className="font-bold text-slate-800 dark:text-slate-200 block">{item.entity_title}</span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{item.applicant_type}</span>
        </div>
      ),
    },
    {
      key: 'cni_number',
      header: 'National ID CNI',
      render: (item) => <span className="font-mono text-slate-900 dark:text-slate-100 font-bold">{item.cni_number}</span>,
    },
    {
      key: 'city_quarter',
      header: 'Quarter / City',
      render: (item) => <span className="text-slate-700 dark:text-slate-300 font-medium">{item.city_quarter}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <Badge
          variant={
            item.status === 'APPROVED'
              ? 'success'
              : item.status === 'REJECTED'
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
          <Button
            size="sm"
            variant="outline"
            onClick={() => setInspectTarget(item)}
          >
            <Eye className="w-3.5 h-3.5 mr-1 text-slate-500 dark:text-slate-400" />
            Inspect CNI
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageContainer
      title="Store Merchant &amp; Driver KYC Verification Queue"
      subtitle="Inspect National CNI Front/Back Photos, Storefront Verification &amp; Approve Platform Access"
    >
      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="PENDING KYC REVIEWS"
          value="4 Submissions"
          change="Action Required"
          changeType="warning"
          icon={<FileCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
          iconBg="bg-amber-50 dark:bg-amber-950/60"
          description="Awaiting staff document verification"
        />

        <StatCard
          title="MERCHANT STORE KYC"
          value="1,840 Approved"
          change="98.2% Pass Rate"
          changeType="positive"
          icon={<Building2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />}
          iconBg="bg-teal-50 dark:bg-teal-950/60"
          description="Verified local merchant stores"
        />

        <StatCard
          title="DRIVER PERMIT KYC"
          value="420 Approved"
          change="Carte Grise Checked"
          changeType="positive"
          icon={<Bike className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          iconBg="bg-blue-50 dark:bg-blue-950/60"
          description="Verified delivery riders"
        />

        <StatCard
          title="REJECTED SUBMISSIONS"
          value="12 Cases"
          change="Document Mismatch"
          changeType="negative"
          icon={<XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />}
          iconBg="bg-red-50 dark:bg-red-950/60"
          description="Submissions rejected by staff"
        />
      </div>

      {/* Advanced Reusable DataTable */}
      <DataTable
        data={queue}
        columns={columns}
        searchPlaceholder="Search applicant, CNI number, store title, quarter..."
        pageSize={5}
        emptyMessage="No KYC submissions found."
      />

      {/* INSPECT CNI & DECISION MODAL */}
      {inspectTarget && (
        <Modal
          isOpen={Boolean(inspectTarget)}
          onClose={() => setInspectTarget(null)}
          title={`KYC Document Verification — ${inspectTarget.applicant_name}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">APPLICANT DETAILS</span>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">{inspectTarget.applicant_name}</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Entity: {inspectTarget.entity_title} • Phone: {inspectTarget.phone} • CNI: {inspectTarget.cni_number}
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Optional Audit Notes or Rejection Reason
              </label>
              <textarea
                rows={2}
                value={rejectionNotes}
                onChange={(e) => setRejectionNotes(e.target.value)}
                placeholder="Enter notes for applicant..."
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            {canApprove ? (
              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button variant="secondary" onClick={() => handleDecision('REJECTED')}>
                  <XCircle className="w-4 h-4 mr-1" />
                  Reject Submission
                </Button>
                <Button variant="primary" onClick={() => handleDecision('APPROVED')}>
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Approve KYC &amp; Enable Role
                </Button>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/60 rounded-xl text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-center space-x-2">
                <Lock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Approval Access Restricted: Your account does not have "approve_kyc" clearance.</span>
              </div>
            )}
          </div>
        </Modal>
      )}
    </PageContainer>
  );
};
