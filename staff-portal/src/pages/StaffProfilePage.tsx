import React, { useState, useRef } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useStaffAuth, ALL_STAFF_PERMISSIONS } from '../stores/staffAuthStore';
import {
  User,
  Lock,
  Bell,
  ShieldCheck,
  Camera,
  CheckCircle2,
  Save,
  Key,
  Trash2,
  Upload,
  ShieldAlert,
} from 'lucide-react';

export const StaffProfilePage: React.FC = () => {
  const { user, hasPermission, addAuditLog, updateUserAvatar } = useStaffAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'password' | 'notifications' | 'verification'>('profile');

  // STRICT ADMIN PERMISSION GUARD FOR PROFILE CRUD
  const canEditProfile = hasPermission('manage_profile_crud') || user?.security_clearance_level === 5;

  // Form State matching Reference FinTech UI
  const initialFirstName = user?.full_name ? user.full_name.split(' ')[0] : 'Pauline';
  const initialLastName = user?.full_name ? user.full_name.split(' ').slice(1).join(' ') : 'Mbarga';

  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [email, setEmail] = useState(user?.email || 'pauline.admin@wunabuy.com');
  const [phone, setPhone] = useState(user?.phone ? user.phone.replace('+237', '').trim() : '0806 123 7890');
  const [gender, setGender] = useState<'male' | 'female'>('female');
  const [employeeId] = useState(user?.employee_id || '1559 000 7788 8DER');
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

  // FILE UPLOAD HANDLER FOR AVATAR
  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!canEditProfile) {
      alert('Security Policy: Only Level 5 Administrators or accounts with "manage_profile_crud" permission can update staff profile avatars.');
      return;
    }

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
    if (!canEditProfile) {
      alert('Security Policy: Only Level 5 Administrators or accounts with "manage_profile_crud" permission can delete staff profile avatars.');
      return;
    }

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
      alert('Security Policy: Only Level 5 Administrators or accounts with "manage_profile_crud" permission can alter staff profiles.');
      return;
    }
    addAuditLog({
      action_code: 'PROFILE_SETTINGS_UPDATE',
      action_description: `Updated profile account settings for ${firstName} ${lastName}`,
      security_level: 'INFO',
    });
    setSuccessMessage('Account settings saved successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('New password and confirmation do not match.');
      return;
    }
    addAuditLog({
      action_code: 'PROFILE_PASSWORD_CHANGE',
      action_description: `Changed account password for ${user?.full_name}`,
      security_level: 'WARNING',
    });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setSuccessMessage('Password updated successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <PageContainer
      title="Account settings"
      subtitle="Manage corporate staff profile, security credentials, notification alerts &amp; clearance verification"
    >
      {/* HIDDEN FILE INPUT FOR AVATAR UPLOAD */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleAvatarFileSelect}
        className="hidden"
      />

      {/* SUCCESS TOAST NOTIFICATION */}
      {successMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center space-x-2 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* STRICT ADMIN PERMISSION SECURITY BANNER FOR NON-ADMINS */}
      {!canEditProfile && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div>
              <span className="font-extrabold uppercase block font-heading">READ-ONLY PROFILE VIEW</span>
              <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium">
                Only Super Administrators (Level 5) or roles granted <code className="font-mono font-bold">manage_profile_crud</code> permission can modify staff profiles.
              </p>
            </div>
          </div>
          <Badge variant="amber">ADMIN CONTROL ENFORCED</Badge>
        </div>
      )}

      {/* MAIN 2-COLUMN SETTINGS STRUCTURAL LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* LEFT COLUMN: VERTICAL SETTINGS NAVIGATION CARD */}
        <Card className="lg:col-span-1 p-2">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveSubTab('profile')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center space-x-3 transition-all ${
                activeSubTab === 'profile'
                  ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-extrabold border-l-4 border-teal-600 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <User className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Profile Settings</span>
            </button>

            <button
              onClick={() => setActiveSubTab('password')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center space-x-3 transition-all ${
                activeSubTab === 'password'
                  ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-extrabold border-l-4 border-teal-600 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              <span>Password</span>
            </button>

            <button
              onClick={() => setActiveSubTab('notifications')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center space-x-3 transition-all ${
                activeSubTab === 'notifications'
                  ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-extrabold border-l-4 border-teal-600 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Bell className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              <span>Notifications</span>
            </button>

            <button
              onClick={() => setActiveSubTab('verification')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center space-x-3 transition-all ${
                activeSubTab === 'verification'
                  ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-extrabold border-l-4 border-teal-600 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              <span>Verification</span>
            </button>
          </nav>
        </Card>

        {/* RIGHT COLUMN: ACCOUNT SETTINGS FORM CONTAINER */}
        <Card className="lg:col-span-3 p-6 sm:p-8">
          {/* TAB 1: PROFILE SETTINGS FORM */}
          {activeSubTab === 'profile' && (
            <form onSubmit={handleSaveChanges} className="space-y-8">
              {/* TOP AVATAR SECTION WITH DUAL ACTION BUTTONS */}
              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                {/* Circular Profile Avatar */}
                <div className="relative cursor-pointer" onClick={() => canEditProfile && fileInputRef.current?.click()}>
                  <img
                    src={user?.avatar_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'}
                    alt={user?.full_name}
                    className="w-28 h-28 rounded-full object-cover border-4 border-slate-100 dark:border-slate-800 shadow-md"
                  />
                  <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center border-2 border-white dark:border-[#151C28] shadow-sm">
                    <Camera className="w-4 h-4" />
                  </div>
                </div>

                {/* Avatar Action Buttons */}
                <div className="flex items-center space-x-3">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={!canEditProfile}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-3.5 h-3.5 mr-1.5" />
                    Upload New
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!canEditProfile}
                    onClick={handleDeleteAvatar}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                    Delete avatar
                  </Button>
                </div>
              </div>

              {/* 2-COLUMN FORM FIELDS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold">
                {/* First Name */}
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    disabled={!canEditProfile}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    disabled={!canEditProfile}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    disabled={!canEditProfile}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="examples@gmail.com"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  />
                </div>

                {/* Mobile Number with Country Flag */}
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 px-3 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-bold">
                      <span className="text-sm">🇨🇲</span>
                      <span>+237</span>
                    </div>
                    <input
                      type="text"
                      disabled={!canEditProfile}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0806 123 7890"
                      className="flex-1 p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                    />
                  </div>
                </div>

                {/* Gender Radio Selector */}
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                    Gender
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label
                      onClick={() => canEditProfile && setGender('male')}
                      className={`p-3 rounded-xl border flex items-center justify-center space-x-2 font-bold transition-all ${
                        !canEditProfile ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                      } ${
                        gender === 'male'
                          ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-800 dark:text-teal-300 shadow-2xs'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <input type="radio" name="gender" disabled={!canEditProfile} checked={gender === 'male'} onChange={() => {}} className="hidden" />
                      <span>Male</span>
                    </label>

                    <label
                      onClick={() => canEditProfile && setGender('female')}
                      className={`p-3 rounded-xl border flex items-center justify-center space-x-2 font-bold transition-all ${
                        !canEditProfile ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                      } ${
                        gender === 'female'
                          ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-800 dark:text-teal-300 shadow-2xs'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <input type="radio" name="gender" disabled={!canEditProfile} checked={gender === 'female'} onChange={() => {}} className="hidden" />
                      <span>Female</span>
                    </label>
                  </div>
                </div>

                {/* Read-only Employee ID */}
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                    ID / Employee Code
                  </label>
                  <input
                    type="text"
                    disabled
                    value={employeeId}
                    className="w-full p-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 font-mono font-bold cursor-not-allowed"
                  />
                </div>

                {/* Tax Identification Number */}
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                    Tax Identification Number (NIU)
                  </label>
                  <input
                    type="text"
                    disabled={!canEditProfile}
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    placeholder="M082618940291X"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  />
                </div>

                {/* Tax Identification Country */}
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                    Tax Identification Country
                  </label>
                  <div className="flex items-center space-x-2 p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100">
                    <span className="text-sm">🇨🇲</span>
                    <select
                      disabled={!canEditProfile}
                      value={taxCountry}
                      onChange={(e) => setTaxCountry(e.target.value)}
                      className="w-full bg-transparent border-none focus:outline-none font-bold text-slate-900 dark:text-slate-100 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <option value="Cameroon">Cameroon</option>
                      <option value="Nigeria">Nigeria</option>
                      <option value="Ivory Coast">Ivory Coast</option>
                    </select>
                  </div>
                </div>

                {/* Residential Address / Office Branch (Full Width) */}
                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                    Residential Address / Office Branch
                  </label>
                  <textarea
                    rows={3}
                    disabled={!canEditProfile}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ib street orogun ibadan"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  />
                </div>
              </div>

              {/* BOTTOM PRIMARY ACTION BUTTON */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <Button type="submit" variant="primary" size="md" disabled={!canEditProfile}>
                  <Save className="w-4 h-4 mr-1.5" />
                  Save Changes
                </Button>

                {!canEditProfile && (
                  <span className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400">
                    🔒 READ-ONLY: LEVEL 5 ADMIN PERMISSION REQUIRED
                  </span>
                )}
              </div>
            </form>
          )}

          {/* TAB 2: PASSWORD & SECURITY FORM */}
          {activeSubTab === 'password' && (
            <form onSubmit={handleUpdatePassword} className="space-y-6 text-xs">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-heading pb-3 border-b border-slate-100 dark:border-slate-800">
                Change Staff Account Password
              </h3>

              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">Current Password *</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">New Password *</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">Confirm New Password *</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button type="submit" variant="primary" disabled={!currentPassword || !newPassword}>
                  <Key className="w-4 h-4 mr-1.5" />
                  Update Password
                </Button>
              </div>
            </form>
          )}

          {/* TAB 3: NOTIFICATIONS SETTINGS */}
          {activeSubTab === 'notifications' && (
            <div className="space-y-6 text-xs">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-heading pb-3 border-b border-slate-100 dark:border-slate-800">
                Staff Operational Alerts &amp; Notifications
              </h3>

              <div className="space-y-4 max-w-lg">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">Email Payout &amp; Disbursal Alerts</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Receive instant email when high-value payout exceeds 500k FCFA</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailNotifs}
                    onChange={() => setEmailNotifs(!emailNotifs)}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">SMS Urgent Emergency Signals</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Receive direct SMS alerts for rider emergency distress calls</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={smsNotifs}
                    onChange={() => setSmsNotifs(!smsNotifs)}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: VERIFICATION & CLEARANCE */}
          {activeSubTab === 'verification' && (
            <div className="space-y-6 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-heading">
                  Staff Role Clearance Verification
                </h3>
                <Badge variant="teal">LEVEL {user?.security_clearance_level || 5} CLEARANCE</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ALL_STAFF_PERMISSIONS.map((perm) => {
                  const isGranted = hasPermission(perm.code);

                  return (
                    <div
                      key={perm.code}
                      className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                        isGranted
                          ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700'
                          : 'bg-slate-100/40 dark:bg-slate-900/40 border-slate-200/40 dark:border-slate-800 opacity-60'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-slate-100 block text-xs">{perm.label}</span>
                        <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 font-medium">{perm.code}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${isGranted ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300' : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500'}`}>
                        {isGranted ? 'VERIFIED' : 'RESTRICTED'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>
      </div>
    </PageContainer>
  );
};
