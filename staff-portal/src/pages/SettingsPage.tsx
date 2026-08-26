import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useStaffAuth } from '../stores/staffAuthStore';
import { Shield, Lock, Bell } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useStaffAuth();

  return (
    <PageContainer
      title="Staff Admin Settings"
      subtitle="Manage your staff profile credentials, security preferences, and system notification alerts."
    >
      <div className="max-w-3xl space-y-6">
        {/* Profile Details */}
        <Card>
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
            <Shield className="w-5 h-5 text-teal-600" />
            <h3 className="text-base font-bold text-slate-900 font-heading">
              Staff Profile & Credentials
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Full Name" defaultValue={user?.full_name || 'Pauline Mbarga'} readOnly />
            <Input label="Staff Email Address" defaultValue={user?.email || 'admin@wunabuy.com'} readOnly />
            <Input label="Assigned Role" defaultValue="Platform Admin (Full Privileges)" readOnly />
            <Input label="Staff Security ID" defaultValue={user?.id || 'staff_901'} readOnly />
          </div>
        </Card>

        {/* Change Password */}
        <Card>
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
            <Lock className="w-5 h-5 text-teal-600" />
            <h3 className="text-base font-bold text-slate-900 font-heading">
              Security & Password
            </h3>
          </div>

          <form className="space-y-4 max-w-md" onSubmit={(e) => e.preventDefault()}>
            <Input label="Current Password" type="password" placeholder="••••••••" />
            <Input label="New Password" type="password" placeholder="••••••••" />
            <Input label="Confirm New Password" type="password" placeholder="••••••••" />

            <Button variant="primary" size="md">
              Update Password
            </Button>
          </form>
        </Card>
      </div>
    </PageContainer>
  );
};
