import React, { useState } from 'react';
import { sanitizeInput } from '../../services/security/securitySanitizer';

interface DualControlConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  title: string;
  description: string;
  confirmWord?: string; // e.g. "APPROVE" or "DELETE"
  actionButtonText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  requireReason?: boolean;
}

/**
 * Dual-Control Confirmation Modal — Wunabuy Staff Portal (OWASP A06:2025 Mitigation)
 * 
 * Mandates secondary verification and explicit justification input before executing
 * sensitive administrative actions (e.g., high-value payout disbursals, role deletions, account revokings).
 */
export const DualControlConfirmModal: React.FC<DualControlConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmWord = 'CONFIRM',
  actionButtonText = 'Authorize Action',
  variant = 'danger',
  requireReason = true,
}) => {
  const [inputConfirmWord, setInputConfirmWord] = useState('');
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (confirmWord && inputConfirmWord.trim().toUpperCase() !== confirmWord.toUpperCase()) {
      setErrorMsg(`Please type "${confirmWord}" to verify dual-control authorization.`);
      return;
    }

    if (requireReason && reason.trim().length < 6) {
      setErrorMsg('Mandatory audit reason must be at least 6 characters.');
      return;
    }

    const cleanReason = sanitizeInput(reason, 'dual_control_reason');
    onConfirm(cleanReason || 'Action authorized via Dual-Control confirmation modal.');
    
    // Reset state
    setInputConfirmWord('');
    setReason('');
    onClose();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          badge: 'bg-red-500/15 text-red-600 dark:text-red-400',
          btn: 'bg-red-600 hover:bg-red-500 text-white',
          border: 'border-red-500/30',
        };
      case 'warning':
        return {
          badge: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
          btn: 'bg-amber-600 hover:bg-amber-500 text-white',
          border: 'border-amber-500/30',
        };
      default:
        return {
          badge: 'bg-teal-500/15 text-teal-600 dark:text-teal-400',
          btn: 'bg-teal-600 hover:bg-teal-500 text-white',
          border: 'border-teal-500/30',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in font-sans">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className={`p-3 rounded-xl border ${styles.border} ${styles.badge}`}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md mb-1 ${styles.badge}`}>
              Dual-Control Authorization Required
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {title}
            </h3>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 mb-5 leading-relaxed">
          {description}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Confirmation Keypad Input */}
          {confirmWord && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Verification Phrase: Type <span className="font-mono text-red-500 font-bold">{confirmWord}</span> to confirm
              </label>
              <input
                type="text"
                value={inputConfirmWord}
                onChange={(e) => setInputConfirmWord(e.target.value)}
                placeholder={`Type ${confirmWord} here...`}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
              />
            </div>
          )}

          {/* Audit Reason Input */}
          {requireReason && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mandatory Operational Audit Justification *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Specify regulatory, compliance, or business justification..."
                rows={2}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          )}

          {/* Error Feedback */}
          {errorMsg && (
            <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-500 font-medium">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-xs font-semibold rounded-xl shadow transition-colors ${styles.btn}`}
            >
              {actionButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
