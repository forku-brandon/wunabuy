import React, { useState, useRef } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useStaffAuth } from '../stores/staffAuthStore';
import {
  User,
  Lock,
  Bell,
  Camera,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Building,
  Key,
  ShieldAlert,
  Info,
} from 'lucide-react';

export const StaffProfilePage: React.FC = () => {
  const { user, hasPermission, addAuditLog, updateUserAvatar } = useStaffAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'password' | 'notifications'>('profile');

  // STRICT ADMIN PERMISSION GUARD FOR PROFILE CORE IDENTITY CRUD
  const canEditProfile = hasPermission('manage_profile_crud') || user?.security_clearance_level === 5;

  // Form State matching Reference FinTech UI
  const initialFirstName = user?.full_name ? user.full_name.split(' ')[0] : 'Pauline';
  const initialLastName = user?.full_name ? user.full_name.split(' ').slice(1).join(' ') : 'Mbarga';

  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [email, setEmail] = useState(user?.email || 'pauline.admin@wunabuy.com');
  const [phone, setPhone] = useState(user?.phone ? user.phone.replace('+237', '').trim() : '670 123 456');
  const [gender, setGender] = useState<'male' | 'female'>('female');
  const [employeeId] = useState(user?.employee_id || 'WNB-EMP-001');
  const [taxId, setTaxId] = useState('M082618940291X');
  const [taxCountry, setTaxCountry] = useState('Cameroon');
  const [address, setAddress] = useState('Akwa Boulevard, Street 104, Douala, Cameroon');

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Notifications State
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(true);

  // Success Alert State
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // FILE UPLOAD HANDLER FOR AVATAR (ALLOWED FOR ALL STAFF MEMBERS)
  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result as string;
      updateUserAvatar(base64Data);

      addAuditLog({
        action_code: 'PROFILE_AVATAR_UPDATE',
        action_description: `Updated staff profile picture for ${user?.full_name}`,
        security_level: 'INFO',
      });

      setSuccessMessage('Profile picture updated and saved locally!');
      setTimeout(() => setSuccessMessage(''), 3000);
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteAvatar = () => {
    updateUserAvatar(null);

    addAuditLog({
      action_code: 'PROFILE_AVATAR_DELETE',
      action_description: `Deleted staff profile picture for ${user?.full_name}`,
      security_level: 'INFO',
    });

    setSuccessMessage('Profile picture removed!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditProfile) {
      setErrorMessage('Access Restricted: Corporate identity fields can only be modified by Super Admins.');
      setTimeout(() => setErrorMessage(''), 4000);
      return;
    }

    addAuditLog({
      action_code: 'PROFILE_UPDATE_INFO',
      action_description: `Updated profile details for ${firstName} ${lastName}`,
      security_level: 'INFO',
    });

    setSuccessMessage('Corporate profile information successfully updated!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match!');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    addAuditLog({
      action_code: 'STAFF_PASSWORD_CHANGE',
      action_description: `Changed account password for employee ID ${employeeId}`,
      security_level: 'CRITICAL',
    });

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setSuccessMessage('Corporate account password updated successfully!');
    setTimeout(() => setSuccessMessage(''), 3500);
  };

  return (
    <PageContainer
      title="Corporate Staff Profile &amp; Settings"
      subtitle="Manage your staff profile avatar, credentials, and notification preferences."
    >
      {/* Hidden File Input for Avatar Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarFileSelect}
        accept="image/*"
        className="hidden"
      />

      {/* TOAST ALERTS */}
      {successMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center space-x-2 animate-fade-in shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-900 dark:text-red-200 text-xs font-bold flex items-center space-x-2 animate-fade-in shadow-2xs">
          <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* MAIN PROFILE LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* LEFT COLUMN: NAVIGATION & AVATAR CARD */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 text-center">
            {/* Avatar Image & Overlay Upload Controls */}
            <div className="relative w-28 h-28 mx-auto mb-4 group">
              <img
                src={
                  user?.avatar_url ||
                  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'
                }
                alt={user?.full_name || 'Staff User'}
                className="w-28 h-28 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-md transition-transform group-hover:scale-105"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-lg transition-all transform hover:scale-110"
                title="Upload Profile Picture"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 font-heading">
              {user?.full_name || 'Pauline Mbarga'}
            </h3>
            <p className="text-xs text-teal-600 dark:text-teal-400 font-mono font-bold mt-0.5">
              {user?.staff_department_role || 'SUPER_ADMIN'}
            </p>

            <div className="mt-3 flex items-center justify-center space-x-2">
              <Badge variant={user?.security_clearance_level === 5 ? 'purple' : 'teal'}>
                Level {user?.security_clearance_level || 5} Clearance
              </Badge>
              <Badge variant="success">Active Staff</Badge>
            </div>

            {/* Avatar Action Buttons (Allowed for all Staff) */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center space-x-2 text-xs">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-bold"
              >
                <Camera className="w-3.5 h-3.5 mr-1 text-teal-600" />
                Change Picture
              </Button>

              {user?.avatar_url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteAvatar}
                  className="text-xs text-red-600 hover:bg-red-50"
                  title="Remove Picture"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </Card>

          {/* VERTICAL SUB-NAVIGATION PANEL */}
          <Card className="p-2 space-y-1">
            <button
              onClick={() => setActiveSubTab('profile')}
              className={`w-full p-3 rounded-lg text-left text-xs font-extrabold flex items-center justify-between transition-all ${
                activeSubTab === 'profile'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <User className="w-4 h-4" />
                <span>Profile Identity</span>
              </div>
              {!canEditProfile && <Lock className="w-3.5 h-3.5 opacity-60" />}
            </button>

            <button
              onClick={() => setActiveSubTab('password')}
              className={`w-full p-3 rounded-lg text-left text-xs font-extrabold flex items-center justify-between transition-all ${
                activeSubTab === 'password'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Key className="w-4 h-4" />
                <span>Change Password</span>
              </div>
            </button>

            <button
              onClick={() => setActiveSubTab('notifications')}
              className={`w-full p-3 rounded-lg text-left text-xs font-extrabold flex items-center justify-between transition-all ${
                activeSubTab === 'notifications'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Bell className="w-4 h-4" />
                <span>Notification Settings</span>
              </div>
            </button>
          </Card>
        </div>

        {/* RIGHT COLUMN: TAB CONTENT FORM */}
        <div className="lg:col-span-3">
          {/* SUB-TAB 1: PROFILE IDENTITY FORM */}
          {activeSubTab === 'profile' && (
            <Card className="p-8">
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-heading">
                    Corporate Staff Personal Details
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Corporate personnel identity record filed with Wunabuy HR.
                  </p>
                </div>
                {!canEditProfile ? (
                  <span className="px-3 py-1 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-[10px] font-bold rounded-full flex items-center space-x-1">
                    <Lock className="w-3 h-3 text-amber-600" />
                    <span>LOCKED BY ADMIN GOVERNANCE</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-emerald-800 text-[10px] font-bold rounded-full flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>SUPER ADMIN EDIT ACCESS</span>
                  </span>
                )}
              </div>

              <form onSubmit={handleSaveChanges} className="space-y-6">
                {/* First Name & Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
                      <span>First Name</span>
                      {!canEditProfile && <Lock className="w-3 h-3 text-slate-400" />}
                    </label>
                    <input
                      type="text"
                      disabled={!canEditProfile}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-xs font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
                      <span>Last Name</span>
                      {!canEditProfile && <Lock className="w-3 h-3 text-slate-400" />}
                    </label>
                    <input
                      type="text"
                      disabled={!canEditProfile}
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-xs font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
                      <span>Corporate Email Address</span>
                      {!canEditProfile && <Lock className="w-3 h-3 text-slate-400" />}
                    </label>
                    <input
                      type="email"
                      disabled={!canEditProfile}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-xs font-bold font-mono text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
                      <span>Mobile Phone (+237)</span>
                      {!canEditProfile && <Lock className="w-3 h-3 text-slate-400" />}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">🇨🇲 +237</span>
                      <input
                        type="text"
                        disabled={!canEditProfile}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-18 pr-3 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-xs font-bold font-mono text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* Gender & Employee ID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Gender Identity</label>
                    <div className="flex items-center space-x-4 pt-1">
                      <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          value="female"
                          disabled={!canEditProfile}
                          checked={gender === 'female'}
                          onChange={() => setGender('female')}
                          className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                        />
                        <span>Female</span>
                      </label>

                      <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          value="male"
                          disabled={!canEditProfile}
                          checked={gender === 'male'}
                          onChange={() => setGender('male')}
                          className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                        />
                        <span>Male</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">System Employee ID</label>
                    <input
                      type="text"
                      disabled
                      value={employeeId}
                      className="w-full p-3 bg-slate-100 dark:bg-slate-900 border-none rounded-lg text-xs font-mono font-extrabold text-teal-700 dark:text-teal-400 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* NIU Tax ID & Country */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">NIU Tax Identification Number</label>
                    <input
                      type="text"
                      disabled={!canEditProfile}
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-xs font-bold font-mono text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Office Branch Address</label>
                    <input
                      type="text"
                      disabled={!canEditProfile}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-xs font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Action Footer */}
                {canEditProfile && (
                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <Button type="submit" variant="primary">
                      Save Profile Changes
                    </Button>
                  </div>
                )}
              </form>
            </Card>
          )}

          {/* SUB-TAB 2: CHANGE PASSWORD FORM (ALLOWED FOR ALL STAFF) */}
          {activeSubTab === 'password' && (
            <Card className="p-8">
              <div className="pb-6 mb-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-heading">
                  Change Account Password
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Update your corporate staff access password.
                </p>
              </div>

              <form onSubmit={handleSavePassword} className="space-y-5 max-w-lg">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-xs font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-xs font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-xs font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <Button type="submit" variant="primary">
                    Update Password
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* SUB-TAB 3: NOTIFICATION SETTINGS (ALLOWED FOR ALL STAFF) */}
          {activeSubTab === 'notifications' && (
            <Card className="p-8">
              <div className="pb-6 mb-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-heading">
                  Staff Notification Preferences
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Configure corporate SMS and email operational alerts.
                </p>
              </div>

              <div className="space-y-4 max-w-xl">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Corporate Email Dispatch Alerts</h4>
                    <p className="text-[10px] text-slate-500 font-medium">Receive assigned task notifications via email.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailNotifs}
                    onChange={(e) => setEmailNotifs(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500 cursor-pointer"
                  />
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Urgent SMS Due Alarm Notifications</h4>
                    <p className="text-[10px] text-slate-500 font-medium">Receive SMS alerts when tasks are within 48h of deadline.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={smsNotifs}
                    onChange={(e) => setSmsNotifs(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500 cursor-pointer"
                  />
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </PageContainer>
  );
};
