import React, { useState } from 'react';
import { ChevronRight, Home, CloudSun, ShieldCheck, Activity, Radio, Cpu, HardDrive } from 'lucide-react';
import { useStaffAuth } from '../../stores/staffAuthStore';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

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
  const [nodeModalOpen, setNodeModalOpen] = useState(false);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F4F6FB] dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Metadata & Breadcrumb Hierarchy Bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-1.5 sm:space-x-2 text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-slate-500 overflow-x-auto no-scrollbar">
          <span className="flex items-center text-slate-600 dark:text-slate-300 flex-shrink-0">
            <Home className="w-3.5 h-3.5 mr-1 text-teal-600 dark:text-teal-400" />
            <span>Staff Portal</span>
          </span>
          <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-700 flex-shrink-0" />
          <span className="text-slate-600 dark:text-slate-400 font-extrabold uppercase tracking-wider flex-shrink-0">{user?.department_name || 'System Operations'}</span>
          <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-700 flex-shrink-0" />
          <span className="text-teal-700 dark:text-teal-400 font-extrabold flex-shrink-0">{title}</span>
        </div>

        {/* Weather / Node Indicator Pill */}
        <button
          onClick={() => setNodeModalOpen(true)}
          className="hidden sm:flex items-center space-x-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white dark:bg-[#151C28] border border-slate-200/80 dark:border-slate-800 shadow-xs text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
        >
          <CloudSun className="w-4 h-4 text-amber-500" />
          <span>28°C • Douala Node (Live)</span>
        </button>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 pb-4 border-b border-slate-200/60 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              {user?.staff_department_role || 'STAFF MODULE'}
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500">
              Clearance L{user?.security_clearance_level || 5}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight font-heading">
            {title}
          </h1>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">{subtitle}</p>}
        </div>
        {action && <div className="flex items-center space-x-3">{action}</div>}
      </div>

      {/* Page Content Body */}
      <div>{children}</div>

      {/* DOUALA INFRASTRUCTURE SERVER NODE MODAL */}
      <Modal isOpen={nodeModalOpen} onClose={() => setNodeModalOpen(false)} title="Douala Platform Server Node Health Telemetry">
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Activity className="w-6 h-6 text-emerald-600 dark:text-emerald-400 animate-pulse" />
              <div>
                <span className="text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">SERVER NODE STATUS</span>
                <p className="text-base font-extrabold text-emerald-950 dark:text-emerald-200 font-heading">Douala HQ Node #CM-DLA-01</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200">
              100% OPERATIONAL
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-semibold">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block">WEBSOCKET LATENCY</span>
              <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">14 ms (TLS 1.3 Strict)</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block">REVERB CONNECTIONS</span>
              <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">1,420 Active Sockets</p>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setNodeModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
