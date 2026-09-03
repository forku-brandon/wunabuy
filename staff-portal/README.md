# Wunabuy Web Staff Operations Portal (v2.3)

Enterprise Web Application for Wunabuy company personnel, featuring real-time operational telemetry, Corporate Staff Account Provisioning CRUD, Dual OTP/Password Authentication, 18-flag RBAC security clearance, HR & Staff Payroll with printable payslips, 3-stage Task Lifecycle engine with live countdown clocks, borderless design system, and light/dark theme switching.

---

## 🌟 Key Features in Version 2.3

### 1. 👔 Corporate Staff Account Directory & Provisioning (`HROpsPage.tsx` & `staffAuthStore.ts`)
- **Full Corporate Staff Account CRUD**: Super Admins and HR Managers can provision, edit, suspend, or revoke staff accounts.
- **Staff Provisioning Modal**: Form to create new staff accounts with Full Name, Corporate Email (`fname.lname@wunabuy.com`), Mobile Phone (`+237 6XX XXX XXX`), Department Name, Department Role, and Security Clearance Level (Level 1-5).
- **Searchable Staff Roster DataTable**: Lists all staff members with live status badges (`🟢 ACTIVE` / `🔴 SUSPENDED`), Searchable Employee Select picker, and modal actions (`Edit Info`, `Suspend/Activate`, `Revoke/Delete`).

### 2. 🔐 Dual Corporate Authentication Engine (`AuthPage.tsx`)
- **Dual Login Modes**: Support for 2-Factor OTP verification (6-digit code `654321`) AND Corporate Password authentication (`wunabuy2026`).
- **Seamless Authentication**: Instant login access for newly provisioned corporate staff accounts.

### 3. ⏰ Large Corporate Employee Working Clock & Task Countdown (`DashboardPage.tsx`)
- **Hero Card Digital Clock**: Prominent digital clock with live second-by-second ticking time, full date, West Africa Time zone tag (`WAT / UTC+1`), Douala Node status pill (`28°C Douala Node Live`), and active working shift counter.
- **3-Stage Task Lifecycle**: `ASSIGNED` ➡️ `IN_PROGRESS` (Accepted) ➡️ `COMPLETED` with live countdown clock and 48-hour due date proximity warning alarm.

### 4. 👔 HR Operations & Staff Payroll (`HROpsPage.tsx`)
- **Monthly Salary Disbursal Ledger**: Base salary, transport allowance, performance incentives, CNPS social security deductions (4.2%), income tax (IRPP), and net payable in FCFA (XAF).
- **Printable Payslip Engine**: Official 1-click **Print Payslip** modal (`window.print()`) with Wunabuy HR header, employer CNPS registration (`389201-X`), itemized tax breakdown, and digital authorization.
- **Staff Document Vault & Leave Request Queue**.

### 5. 🔒 18-Flag RBAC Roles & Governance (`SettingsPage.tsx` & `staffAuthStore.ts`)
- **18 System Permissions**: Includes `manage_staff_crud` ("Create, Edit & Revoke Corporate Staff Accounts"), `manage_profile_crud`, `assign_staff_tasks`, `view_hr_ops`, `manage_hr_payroll`, `view_dashboard`, `view_kyc`, `approve_kyc`, `view_disputes`, `resolve_disputes`, `view_financials`, `approve_payouts`, `view_logistics`, `override_logistics`, `manage_users`, `manage_marketing`, `manage_settings`, `view_audit_logs`.

---

## 🛠️ Local Development & Setup

```bash
cd staff-portal
npm install
npm run dev
```

The app will run at `http://localhost:5173`.
