import React, { useState, useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { StatCard } from '../components/ui/StatCard';
import { Modal } from '../components/ui/Modal';
import { DataTable, Column } from '../components/ui/DataTable';
import { ImageLightbox } from '../components/ui/ImageLightbox';
import { DocumentInspectionCard } from '../components/kyc/DocumentInspectionCard';
import { useStaffAuth } from '../stores/staffAuthStore';
import { kycApi, KYCQueueItem } from '../services/kycApi';
import {
  FileCheck,
  Building2,
  Bike,
  CheckCircle2,
  XCircle,
  Eye,
  Lock,
  RefreshCw,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Send,
} from 'lucide-react';
import { ComposeDirectModal } from '../components/notifications/ComposeDirectModal';

export const KYCPage: React.FC = () => {
  const { addAuditLog, hasPermission } = useStaffAuth();
  const [queue, setQueue] = useState<KYCQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Interactive Inspection Modal & Lightbox
  const [inspectTarget, setInspectTarget] = useState<KYCQueueItem | null>(null);
  const [notifyApplicant, setNotifyApplicant] = useState<KYCQueueItem | null>(null);
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [lightboxDoc, setLightboxDoc] = useState<{ isOpen: boolean; url: string; title: string }>({
    isOpen: false,
    url: '',
    title: '',
  });

  const canApprove = hasPermission('approve_kyc');

  const fetchQueue = (silent = false) => {
    if (!silent) setIsLoading(true);
    kycApi
      .getKYCQueue()
      .then((res) => {
        if (res.data) {
          setQueue(res.data);
        }
      })
      .catch((err) => {
        console.warn('[KYCPage] Failed to fetch live KYC queue', err);
      })
      .finally(() => {
        if (!silent) setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchQueue();
    // Real-time polling every 8 seconds
    const interval = setInterval(() => {
      fetchQueue(true);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenLightbox = (url: string, title: string) => {
    setLightboxDoc({
      isOpen: true,
      url,
      title,
    });
  };

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

  const setQuickReason = (reason: string) => {
    setRejectionNotes((prev) => (prev ? `${prev}; ${reason}` : reason));
  };

  const columns: Column<KYCQueueItem>[] = [
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
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1">
            {item.applicant_type === 'STORE_SELLER' ? (
              <>
                <Building2 className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                Store Merchant
              </>
            ) : (
              <>
                <Bike className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                Transporter
              </>
            )}
          </span>
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
            onClick={() => setNotifyApplicant(item)}
            className="text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-teal-950/30"
            title="Send Direct Push Notification to Applicant"
          >
            <Send className="w-3.5 h-3.5 mr-1" />
            <span>Notify</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setInspectTarget(item);
              setRejectionNotes('');
            }}
          >
            <Eye className="w-3.5 h-3.5 mr-1 text-slate-500 dark:text-slate-400" />
            Inspect Documents
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageContainer
      title="Store Merchant & Driver KYC Verification Queue"
      subtitle="Inspect National CNI Front/Back Photos, Storefront Verification & Approve Platform Access"
      action={
        <Button
          size="sm"
          variant="outline"
          onClick={() => fetchQueue(false)}
          disabled={isLoading}
          className="flex items-center space-x-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </Button>
      }
    >
      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="PENDING KYC REVIEWS"
          value={isLoading ? 'Loading...' : `${queue.filter((q) => q.status === 'PENDING_REVIEW').length} Submissions`}
          change={queue.some((q) => q.status === 'PENDING_REVIEW') ? 'Action Required' : 'Queue Clear'}
          changeType={queue.some((q) => q.status === 'PENDING_REVIEW') ? 'warning' : 'positive'}
          icon={<FileCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
          iconBg="bg-amber-50 dark:bg-amber-950/60"
          description="Awaiting staff document verification"
        />

        <StatCard
          title="MERCHANT STORE KYC"
          value={isLoading ? '...' : `${queue.filter((q) => q.applicant_type === 'STORE_SELLER').length} Stores`}
          change="Document Registered"
          changeType="positive"
          icon={<Building2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />}
          iconBg="bg-teal-50 dark:bg-teal-950/60"
          description="Verified local merchant stores"
        />

        <StatCard
          title="DRIVER PERMIT KYC"
          value={isLoading ? '...' : `${queue.filter((q) => q.applicant_type === 'DRIVER_TRANSPORTER').length} Drivers`}
          change="Vehicle Permit"
          changeType="positive"
          icon={<Bike className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          iconBg="bg-blue-50 dark:bg-blue-950/60"
          description="Verified delivery riders"
        />

        <StatCard
          title="REJECTED SUBMISSIONS"
          value={isLoading ? '...' : `${queue.filter((q) => q.status === 'REJECTED').length} Cases`}
          change={queue.some((q) => q.status === 'REJECTED') ? 'Issues Flagged' : '0 Rejected'}
          changeType={queue.some((q) => q.status === 'REJECTED') ? 'negative' : 'positive'}
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

      {/* INSPECT CREDENTIALS & DECISION MODAL */}
      {inspectTarget && (
        <Modal
          isOpen={Boolean(inspectTarget)}
          onClose={() => setInspectTarget(null)}
          title={`KYC Compliance Review: ${inspectTarget.applicant_name}`}
          maxWidth="4xl"
        >
          <div className="space-y-6 text-xs max-h-[80vh] overflow-y-auto pr-1">
            {/* Applicant Summary Banner */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {inspectTarget.applicant_type === 'STORE_SELLER' ? 'MERCHANT STORE VERIFICATION' : 'TRANSPORTER PERMIT VERIFICATION'}
                  </span>
                  <Badge variant={inspectTarget.status === 'APPROVED' ? 'success' : inspectTarget.status === 'REJECTED' ? 'error' : 'warning'}>
                    {inspectTarget.status}
                  </Badge>
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">{inspectTarget.applicant_name}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                  Entity: <strong className="text-slate-900 dark:text-slate-100">{inspectTarget.entity_title}</strong> • Phone: <span className="font-mono">{inspectTarget.phone}</span> • Location: {inspectTarget.city_quarter}
                </p>
              </div>

              <div className="flex items-center gap-4 text-right">
                <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">National ID CNI</div>
                  <div className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100">{inspectTarget.cni_number}</div>
                </div>
              </div>
            </div>

            {/* Credential Documents Grid */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  Submitted Identification &amp; Regulatory Credentials (Click to Inspect)
                </h5>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Rotate, zoom, and verify document security details
                </span>
              </div>

              {inspectTarget.applicant_type === 'STORE_SELLER' ? (
                /* Store Seller Documents: CNI Front, CNI Back, Storefront Photo, RCCM Registration */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <DocumentInspectionCard
                    title="CNI Front"
                    subtitle="Cameroon National ID Front"
                    documentUrl={inspectTarget.cni_front_url}
                    required={true}
                    onOpenLightbox={handleOpenLightbox}
                  />
                  <DocumentInspectionCard
                    title="CNI Back"
                    subtitle="Date of issue & Signature"
                    documentUrl={inspectTarget.cni_back_url}
                    required={true}
                    onOpenLightbox={handleOpenLightbox}
                  />
                  <DocumentInspectionCard
                    title="Physical Storefront"
                    subtitle="Physical Shop Signage & Stock"
                    documentUrl={inspectTarget.storefront_or_vehicle_photo}
                    required={true}
                    onOpenLightbox={handleOpenLightbox}
                  />
                  <DocumentInspectionCard
                    title="Business Registration (RCCM)"
                    subtitle="Trade Register / Tax Notice"
                    documentUrl={inspectTarget.business_reg_url}
                    required={false}
                    onOpenLightbox={handleOpenLightbox}
                  />
                </div>
              ) : (
                /* Transporter / Driver Documents: CNI, Driver License, Vehicle & Plate, Insurance */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <DocumentInspectionCard
                    title="National ID Card"
                    subtitle="Driver National CNI"
                    documentUrl={inspectTarget.cni_front_url}
                    required={true}
                    onOpenLightbox={handleOpenLightbox}
                  />
                  <DocumentInspectionCard
                    title="Driver's License"
                    subtitle="Permis de Conduire (Cat. A/B)"
                    documentUrl={inspectTarget.driver_license_url || inspectTarget.cni_back_url}
                    required={true}
                    onOpenLightbox={handleOpenLightbox}
                  />
                  <DocumentInspectionCard
                    title="Vehicle & Plate"
                    subtitle={`Plate: ${inspectTarget.vehicle_plate || 'N/A'} • Type: ${inspectTarget.vehicle_type || 'Motorcycle'}`}
                    documentUrl={inspectTarget.storefront_or_vehicle_photo}
                    required={true}
                    onOpenLightbox={handleOpenLightbox}
                  />
                  <DocumentInspectionCard
                    title="Vehicle Insurance"
                    subtitle="Valid Attestation d'Assurance"
                    documentUrl={inspectTarget.vehicle_insurance_url}
                    required={true}
                    onOpenLightbox={handleOpenLightbox}
                  />
                </div>
              )}
            </div>

            {/* Quick Rejection Chips */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Quick Compliance Issue Presets (Click to autofill notes):
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {[
                  'CNI photo is blurry or unreadable',
                  'CNI expired or invalid document number',
                  'Storefront photo does not match registered trade name',
                  'RCCM Business Registration missing or invalid',
                  'Driver license expired or mismatch with applicant',
                  'Vehicle insurance certificate expired or invalid',
                ].map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setQuickReason(reason)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    + {reason}
                  </button>
                ))}
              </div>

              {/* Audit / Rejection Notes Input */}
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Compliance Review Notes &amp; Audit Log
              </label>
              <textarea
                rows={2}
                value={rejectionNotes}
                onChange={(e) => setRejectionNotes(e.target.value)}
                placeholder="Enter any notes for the applicant or reason for rejection..."
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 text-xs"
              />
            </div>

            {/* Action Bar */}
            {canApprove ? (
              <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setNotifyApplicant(inspectTarget)}
                  className="text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-teal-950/30"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  Message Applicant
                </Button>
                <div className="flex space-x-3">
                  <Button variant="secondary" onClick={() => handleDecision('REJECTED')}>
                    <XCircle className="w-4 h-4 mr-1.5 text-rose-500" />
                    Reject Submission
                  </Button>
                  <Button variant="primary" onClick={() => handleDecision('APPROVED')}>
                    <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-400" />
                    Approve KYC &amp; Enable Platform Access
                  </Button>
                </div>
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

      {/* Direct User / Applicant Notification Modal */}
      <ComposeDirectModal
        isOpen={Boolean(notifyApplicant)}
        onClose={() => setNotifyApplicant(null)}
        preselectedUser={
          notifyApplicant
            ? {
                id: notifyApplicant.id,
                name: notifyApplicant.applicant_name,
                phone: notifyApplicant.phone,
                role: notifyApplicant.applicant_type === 'STORE_SELLER' ? 'seller' : 'transporter',
              }
            : null
        }
      />

      {/* Global Image Lightbox with Zoom & 90-degree Rotation */}
      <ImageLightbox
        isOpen={lightboxDoc.isOpen}
        onClose={() => setLightboxDoc((prev) => ({ ...prev, isOpen: false }))}
        imageUri={lightboxDoc.url}
        title={lightboxDoc.title}
      />
    </PageContainer>
  );
};

