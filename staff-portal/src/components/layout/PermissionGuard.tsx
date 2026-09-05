import React, { ReactNode } from 'react';
import { useStaffAuth, StaffPermission } from '../../stores/staffAuthStore';
import { securityLogger } from '../../services/security/securityLogger';

interface PermissionGuardProps {
  permission: StaffPermission;
  children: ReactNode;
  fallbackTitle?: string;
  fallbackDescription?: string;
}

/**
 * Route & Component Level Access Control Guard — Wunabuy Staff Portal (OWASP A01:2025 Mitigation)
 * 
 * Enforces role clearance permissions before rendering administrative views or UI components.
 * Emits security audit events when unauthorized access attempts occur.
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  children,
  fallbackTitle = 'Access Restricted — Clearance Level Required',
  fallbackDescription = 'Your current corporate staff department role does not possess authorization clearance for this administrative workspace.',
}) => {
  const { user, hasPermission } = useStaffAuth();

  const isAllowed = hasPermission(permission);

  if (!isAllowed) {
    // Log security violation attempt once
    securityLogger.logEvent(
      {
        action_code: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        action_description: `Staff member attempted to access restricted route requiring permission '${permission}'.`,
        security_level: 'WARNING',
        meta: { requiredPermission: permission, path: window.location.pathname },
      },
      user?.full_name || 'Anonymous',
      user?.staff_department_role || 'UNKNOWN'
    );

    return (
      <div className="flex-1 p-6 md:p-8 flex flex-col items-center justify-center min-h-[70vh] font-sans">
        <div className="max-w-lg w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-8 shadow-xl text-center">
          {/* Lock Icon */}
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6 text-amber-500">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <span className="inline-block px-3 py-1 bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-semibold rounded-full uppercase tracking-wider mb-3">
            403 Forbidden • Security Access Guard
          </span>

          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            {fallbackTitle}
          </h2>

          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            {fallbackDescription}
          </p>

          {/* User Details Badge */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-xl p-4 mb-6 text-left text-xs">
            <div className="flex justify-between items-center mb-1 text-slate-500">
              <span>Active Employee:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.full_name || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center mb-1 text-slate-500">
              <span>Department Role:</span>
              <span className="font-semibold text-teal-600 dark:text-teal-400">{user?.staff_department_role || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center text-slate-500">
              <span>Required Clearance:</span>
              <span className="font-mono text-amber-600 dark:text-amber-400 font-medium">{permission}</span>
            </div>
          </div>

          <a
            href="/"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs rounded-xl shadow transition-colors gap-2"
          >
            ← Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
