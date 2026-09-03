import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useStaffAuth, ALL_STAFF_PERMISSIONS } from '../stores/staffAuthStore';
import {
  User,
  ShieldCheck,
  Key,
  Lock,
  Mail,
  Phone,
  Building2,
  Calendar,
  Camera,
  CheckCircle2,
  Save,
  Globe,
  Check,
  X,
} from 'lucide-react';

export const StaffProfilePage: React.FC = () => {
  const { user, hasPermission, addAuditLog } = useStaffAuth();

  const [activeTab, setActiveTab] = useState<'details' | 'security' | 'permissions'>('details');

  // Form State
  const [fullName, setFullName] = useState(user?.full_name || 'Pauline Mbarga');
  const [phone, setPhone] = useState(user?.phone || '+237 670 000 099');
  const [email, setEmail] = useState(user?.email || 'pauline.admin@wunabuy.com');
  const [officeBranch, setOfficeBranch] = useState('Douala HQ — Akwa Boulevard');
  
  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mfaEnabled, setMfaEnabled] = useState(true);

  // Success Alert State
  const [successMessage, setSuccessMessage] = useState('');

  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    addAuditLog({
      action_code: 'PROFILE_DETAILS_UPDATE',
      action_description: `Updated personal profile details for ${user?.full_name}`,
      security_level: 'INFO',
    });
    setSuccessMessage('Profile details updated successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('New password and confirm password do not match.');
      return;
    }
    addAuditLog({
      action_code: 'PROFILE_PASSWORD_CHANGE',
      action_description: `Changed account login password for ${user?.full_name}`,
      security_level: 'WARNING',
    });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setSuccessMessage('Staff account password updated successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleToggleMFA = () => {
    const nextState = !mfaEnabled;
    setMfaEnabled(nextState);
    addAuditLog({
      action_code: nextState ? 'MFA_ENABLE' : 'MFA_DISABLE',
      action_description: `${nextState ? 'Enabled' : 'Disabled'} 2-Factor Authentication (MFA) for ${user?.full_name}`,
      security_level: 'WARNING',
    });
    setSuccessMessage(`2-Factor Authentication (2FA) ${nextState ? 'enabled' : 'disabled'}!`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <PageContainer
      title="Staff Account Profile &amp; Credentials"
      subtitle="Manage Personal Profile Information, Security Passwords, 2FA &amp; View Clearance Permissions"
    >
      {/* SUCCESS TOAST ALERT */}
      {successMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center space-x-2 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* HERO STAFF IDENTITY PROFILE CARD */}
      <Card className="mb-8 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
          {/* Avatar Container with Upload Badge */}
          <div className="relative group flex-shrink-0">
            <img
              src={user?.avatar_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'}
              alt={user?.full_name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-teal-500 shadow-md"
            />
            <button
              onClick={() => alert('Avatar upload modal opened. Select new 3D portrait asset.')}
              className="absolute -bottom-2 -right-2 p-2.5 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-lg hover:scale-105 transition-transform"
              title="Update Staff Avatar Photo"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* User Details Header Content */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-extrabold bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                EMPLOYEE ID: {user?.employee_id || 'WNB-EMP-001'}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                LEVEL {user?.security_clearance_level || 5} CLEARANCE
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 mr-1" />
                ACTIVE SESSION
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight font-heading">
              {user?.full_name || 'Pauline Mbarga'}
            </h2>
            <p className="text-xs font-extrabold text-teal-600 dark:text-teal-400 mt-0.5">
              {user?.staff_department_role} • {user?.department_name}
            </p>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="flex items-center justify-center md:justify-start space-x-2 text-slate-600 dark:text-slate-400 font-medium">
                <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                <span className="truncate">{user?.email}</span>
              </div>
              <div className="flex items-center justify-center md:justify-start space-x-2 text-slate-600 dark:text-slate-400 font-medium">
                <Phone className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                <span>{user?.phone}</span>
              </div>
              <div className="flex items-center justify-center md:justify-start space-x-2 text-slate-600 dark:text-slate-400 font-medium">
                <Building2 className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                <span>{officeBranch}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* TOP TAB NAVIGATION BAR */}
      <div className="flex items-center space-x-3 mb-6 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('details')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold flex items-center space-x-2 transition-all shadow-xs flex-shrink-0 ${
            activeTab === 'details'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-white dark:bg-[#151C28] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Personal Details &amp; Contact</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold flex items-center space-x-2 transition-all shadow-xs flex-shrink-0 ${
            activeTab === 'security'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-white dark:bg-[#151C28] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Security &amp; Password</span>
        </button>

        <button
          onClick={() => setActiveTab('permissions')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold flex items-center space-x-2 transition-all shadow-xs flex-shrink-0 ${
            activeTab === 'permissions'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-white dark:bg-[#151C28] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Granted Permissions Matrix ({ALL_STAFF_PERMISSIONS.length})</span>
        </button>
      </div>

      {/* TAB 1: PERSONAL DETAILS & CONTACT INFORMATION */}
      {activeTab === 'details' && (
        <Card className="p-6 sm:p-8">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-heading mb-6 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center">
            <User className="w-5 h-5 text-teal-600 dark:text-teal-400 mr-2" />
            Edit Personal &amp; Corporate Contact Information
          </h3>

          <form onSubmit={handleSaveDetails} className="space-y-6 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Corporate Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Phone Number (E.164 Cameroon Format) *
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Physical Office Branch Location
                </label>
                <input
                  type="text"
                  value={officeBranch}
                  onChange={(e) => setOfficeBranch(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
              <Button type="submit" variant="primary">
                <Save className="w-4 h-4 mr-1.5" />
                Save Profile Changes
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* TAB 2: SECURITY & PASSWORD CREDENTIALS */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <Card className="p-6 sm:p-8">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-heading mb-6 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center">
              <Lock className="w-5 h-5 text-teal-600 dark:text-teal-400 mr-2" />
              Change Staff Login Password
            </h3>

            <form onSubmit={handleUpdatePassword} className="space-y-6 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Current Password *
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password..."
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    New Password *
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new strong password..."
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password..."
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
                <Button type="submit" variant="primary" disabled={!currentPassword || !newPassword}>
                  <Key className="w-4 h-4 mr-1.5" />
                  Update Password &amp; Log Audit
                </Button>
              </div>
            </form>
          </Card>

          {/* 2-FACTOR AUTHENTICATION STATUS */}
          <Card className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-heading">
                  2-Factor Authentication (2FA / OTP Enforcement)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Requires 6-digit SMS / Email OTP verification upon every corporate staff login.
                </p>
              </div>

              <Button
                variant={mfaEnabled ? 'outline' : 'primary'}
                onClick={handleToggleMFA}
              >
                {mfaEnabled ? 'Disable 2FA' : 'Enable 2FA Enforcement'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: GRANTED PERMISSIONS MATRIX */}
      {activeTab === 'permissions' && (
        <Card className="p-6 sm:p-8">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-heading flex items-center">
                <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400 mr-2" />
                Active Staff Role Permission Matrix
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Permissions granted to role <strong className="text-teal-700 dark:text-teal-400">{user?.staff_department_role}</strong> (Level {user?.security_clearance_level} Clearance)
              </p>
            </div>
            <Badge variant="teal">STRICT RBAC ENFORCED</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ALL_STAFF_PERMISSIONS.map((perm) => {
              const isGranted = hasPermission(perm.code);

              return (
                <div
                  key={perm.code}
                  className={`p-4 rounded-2xl border flex items-start justify-between transition-all ${
                    isGranted
                      ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700'
                      : 'bg-slate-100/40 dark:bg-slate-900/40 border-slate-200/40 dark:border-slate-800 opacity-60'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-slate-900 dark:text-slate-100 text-xs">{perm.label}</span>
                      <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {perm.code}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{perm.description}</p>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center space-x-1 ${
                      isGranted
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {isGranted ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 mr-0.5" />
                        GRANTED
                      </>
                    ) : (
                      <>
                        <X className="w-3 h-3 text-slate-400 dark:text-slate-500 mr-0.5" />
                        RESTRICTED
                      </>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </PageContainer>
  );
};
