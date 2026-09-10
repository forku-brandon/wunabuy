import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
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
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 transition-colors">
      <div className="max-w-7xl mx-auto w-full">
        {/* Top Breadcrumb & Status Bar */}
        <div className="flex items-center justify-between mb-4 pb-1">
          <div className="flex items-center space-x-2 text-xs font-medium text-slate-400 dark:text-slate-500">
            <span className="flex items-center text-slate-600 dark:text-slate-400">
              <Home className="w-3.5 h-3.5 mr-1.5 text-teal-600 dark:text-teal-400" />
              <span>Staff Portal</span>
            </span>
            <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600" />
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              {user?.department_name || 'Operations'}
            </span>
            <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600" />
            <span className="text-slate-900 dark:text-slate-100 font-semibold">{title}</span>
          </div>

          {/* Understated Live Node Indicator */}
          <div className="hidden sm:flex items-center space-x-2 text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800/60 px-2.5 py-1 rounded-full border border-slate-200/60 dark:border-slate-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Douala Live Node</span>
          </div>
        </div>

        {/* Dignified Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200/60 dark:border-slate-800/70">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight font-heading">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="flex items-center space-x-2.5 flex-shrink-0">{action}</div>}
        </div>

        {/* Page Content Body */}
        <div>{children}</div>
      </div>
    </div>
  );
};
