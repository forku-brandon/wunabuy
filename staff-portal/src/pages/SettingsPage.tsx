import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useStaffAuth, AuditLogEntry } from '../stores/staffAuthStore';

import { ShieldCheck, Lock, Activity, FileText, Download, ShieldAlert, Key } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, auditLogs, addAuditLog } = useStaffAuth();
  const [toast, setToast] = useState<string | null>(null);

  const handleExportAuditLogs = () => {
    addAuditLog({
      action_code: 'AUDIT_LOGS_EXPORT',
      action_description: 'Exported system security audit log ledger CSV',
      security_level: 'INFO',
    });
    alert('🛡️ System Audit Logs exported to CSV successfully!');
  };

  return (
    <PageContainer
      title="System Security, RBAC Policies & Audit Log Center"
      subtitle="Immutable Audit Trail, Infrastructure Nodes Status & Staff Security Clearance Settings"
    >
      <div className="space-y-8">
        {/* Active Staff Profile Card */}
        <Card>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div className="flex items-center space-x-3">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
              <div>
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  Active Staff Session &amp; Security Clearance
                </h3>
                <p className="text-xs text-slate-500">Employee credentials and active RBAC permissions</p>
              </div>
            </div>

            <Badge variant="teal" size="sm">
              LEVEL {user?.security_clearance_level} CLEARANCE
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">EMPLOYEE NAME</span>
              <p className="font-bold text-slate-900 mt-0.5">{user?.full_name}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">STAFF DEPARTMENT</span>
              <p className="font-bold text-teal-700 mt-0.5">{user?.department_name}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">RBAC ROLE CODE</span>
              <p className="font-mono font-bold text-slate-900 mt-0.5">{user?.staff_department_role}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">EMPLOYEE ID</span>
              <p className="font-mono font-bold text-slate-900 mt-0.5">{user?.employee_id}</p>
            </div>
          </div>
        </Card>

        {/* Immutable System Security Audit Logs */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-heading flex items-center">
                <Activity className="w-4 h-4 text-teal-600 mr-2" />
                Immutable System Security Audit Logs
              </h3>
              <p className="text-xs text-slate-500">Cryptographically ordered event log of all staff administrative actions</p>
            </div>

            <Button variant="outline" size="sm" onClick={handleExportAuditLogs}>
              <Download className="w-4 h-4 mr-1.5" />
              Export Audit CSV
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Role Code</th>
                  <th className="py-3 px-4">Action Code</th>
                  <th className="py-3 px-4">Action Description</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">Security Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {auditLogs.map((log: AuditLogEntry) => (

                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-500">{log.timestamp}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{log.staff_name}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                        {log.staff_role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-teal-700">{log.action_code}</td>
                    <td className="py-3.5 px-4">{log.action_description}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">{log.ip_address}</td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          log.security_level === 'CRITICAL'
                            ? 'error'
                            : log.security_level === 'WARNING'
                            ? 'warning'
                            : 'success'
                        }
                      >
                        {log.security_level}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
};
