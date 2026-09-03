# Wunabuy Web Staff Operations Portal (v2.4)

Enterprise Web Application for Wunabuy company personnel, featuring real-time operational telemetry, Granular Field-Level ACL Controls, SearchableSelect Dropdown Primitives, Universal Data Table Searchers, Corporate Staff Account Provisioning CRUD, Dual OTP/Password Authentication, 18-flag RBAC security clearance, HR & Staff Payroll with printable payslips, borderless design system, and light/dark theme switching.

---

## 🌟 Key Features in Version 2.4

### 1. 🔒 Granular Field-Level ACL Controls & Lock Indicators (`StaffProfilePage.tsx`, `FinancialsPage.tsx`, `KYCPage.tsx`, `DisputesPage.tsx`, `LogisticsOpsPage.tsx`)
- **Staff Profile Field Governance**: All staff members can upload profile pictures (`updateUserAvatar`), change passwords, and update notification preferences, while core corporate identity fields (Name, Email, Phone, Department, Clearance Level) are locked (`disabled={!canEditProfile}`) with `Lock` badges for non-admins.
- **Action Guard Locks**: Interactive action buttons for unauthorized personnel display disabled lock badges (`<Lock /> Locked (Admin Only)`) across MoMo Payout Approvals, KYC Verification, Dispute Adjudication, and Logistics Overrides.

### 2. 🔍 SearchableSelect Primitive & Universal Data Table Searchers (`SearchableSelect.tsx` & `DataTable.tsx`)
- **`SearchableSelect` Component**: Reusable dropdown component with an in-built text search bar filtering options in real time.
- **Universal Table Search**: Enabled `searchable={true}` across all operational data tables with a top search input filtering across all dataset properties.

### 3. 👔 Corporate Staff Account Directory & Provisioning (`HROpsPage.tsx` & `staffAuthStore.ts`)
- **Full Corporate Staff Account CRUD**: Super Admins and HR Managers can provision, edit, suspend, or revoke staff accounts with corporate email (`@wunabuy.com`), phone (`+237 6XX XXX XXX`), clearance levels (Level 1-5), and department roles.

### 4. 🔐 Dual Corporate Authentication Engine (`AuthPage.tsx`)
- **Dual Login Modes**: Support for 2-Factor OTP verification (6-digit code `654321`) AND Corporate Password authentication (`wunabuy2026`).

### 5. ⏰ Large Corporate Employee Working Clock & Task Countdown (`DashboardPage.tsx`)
- **Hero Card Digital Clock**: Prominent digital clock with live second-by-second ticking time, full date, West Africa Time zone tag (`WAT / UTC+1`), Douala Node status pill (`28°C Douala Node Live`), and active working shift counter.

### 6. 🔒 18-Flag RBAC Roles & Governance (`SettingsPage.tsx` & `staffAuthStore.ts`)
- **18 System Permissions**: Fully synchronized permissions matrix across all 7 staff department roles with Level 5 Super Admin override logic.

---

## 🛠️ Local Development & Setup

```bash
cd staff-portal
npm install
npm run dev
```

The app will run at `http://localhost:5173`.
