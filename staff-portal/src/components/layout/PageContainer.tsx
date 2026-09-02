import React from 'react';
import { ChevronRight, Home, ShieldCheck } from 'lucide-react';
import { useStaffAuth } from '../../stores/staffAuthStore';

export interface PageContainerProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  title,
  subtitle,
  action,
  children,
}) => {
  const { user } = useStaffAuth();

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
      {/* Breadcrumb Hierarchy Bar */}
      <div className="flex items-center space-x-2 text-[11px] font-semibold text-slate-400 mb-4">
        <span className="flex items-center text-slate-600">
          <Home className="w-3.5 h-3.5 mr-1 text-teal-600" />
          <span>Staff Portal</span>
        </span>
        <ChevronRight className="w-3 h-3 text-slate-300" />
        <span className="text-slate-600 font-bold uppercase tracking-wider">{user?.department_name || 'System Operations'}</span>
        <ChevronRight className="w-3 h-3 text-slate-300" />
        <span className="text-teal-700 font-bold">{title}</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-teal-500/10 text-teal-700 border border-teal-500/20">
              {user?.staff_department_role || 'STAFF MODULE'}
            </span>
            <span className="text-[10px] font-mono font-semibold text-slate-400">
              Clearance L{user?.security_clearance_level || 5}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
            {title}
          </h1>
          {subtitle && <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>}
        </div>
        {action && <div className="flex items-center space-x-3">{action}</div>}
      </div>

      {/* Page Content Body */}
      <div>{children}</div>
    </div>
  );
};
