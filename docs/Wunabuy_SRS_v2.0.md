# Software Requirements Specification (SRS)
# Wunabuy — Multi-Sided E-Commerce & Web Staff Operations Platform

**Document Version:** 2.3 (Corporate Staff Account Directory CRUD, Dual OTP/Password Auth & Live Shift Telemetry)  
**Date:** September 3, 2026  
**Status:** Approved / In Production Use  
**Companion Documents:** Wunabuy PRD v1.0, Wunabuy Frontend Tech Spec v1.8, Wunabuy Backend Tech Spec v1.4  

---

## 🚀 Key Staff Portal v2.3 Architecture & Feature Specifications (September 2026)

- **Corporate Staff Account Directory & Lifecycle Management Engine (`HROpsPage.tsx` & `staffAuthStore.ts`)**:
  - Full CRUD management of corporate staff accounts: Super Admins and HR Managers can provision, edit, suspend, or revoke staff accounts.
  - Staff Provisioning Fields: Staff Full Name, Corporate Email (`fname.lname@wunabuy.com`), Mobile Phone (`+237 6XX XXX XXX`), Department, Staff Department Role, and Security Clearance Level (Level 1-5).
  - Searchable Staff Roster DataTable with live status badges (`🟢 ACTIVE` / `🔴 SUSPENDED`), Searchable Employee Select picker with live search input, and modal actions (`Edit Info`, `Suspend/Activate`, `Revoke/Delete`).

- **Dual Corporate Authentication Engine (`AuthPage.tsx`)**:
  - Dual login modes: **2-Factor OTP Code** (6-digit OTP `654321`) AND **Corporate Password Authentication** (`wunabuy2026`).
  - Seamless authentication for newly provisioned corporate staff accounts.

- **Large Corporate Employee Working Clock & Duty Telemetry (`DashboardPage.tsx`)**:
  - Hero Card Digital Clock with live second-by-second ticking time, full date, West Africa Time zone tag (`WAT / UTC+1`), Douala Node status pill (`28°C Douala Node Live`), and active working shift counter.
  - 3-Stage Task Lifecycle (**`ASSIGNED`** ➡️ **`IN_PROGRESS`** [Accepted] ➡️ **`COMPLETED`**) with live ticking countdown clock and 48-hour due date proximity warning alarm.

- **HR Operations & Staff Payroll Management Module (`HROpsPage.tsx`)**:
  - Monthly Salary Disbursal Ledger: Base salary, transport allowance, performance incentives, CNPS social security deductions (4.2%), income tax (IRPP), and net payable in FCFA (XAF).
  - Printable Payslip Engine: Official 1-click **Print Payslip** modal (`window.print()`) with Wunabuy HR header, employer CNPS registration (`389201-X`), itemized tax breakdown, and digital authorization.
  - Staff Compliance Document Vault & Time-Off Leave Request Queue.

- **18-Flag RBAC Roles & Permissions Matrix (`staffAuthStore.ts` & `SettingsPage.tsx`)**:
  - Active permissions matrix including `manage_staff_crud` ("Create, Edit & Revoke Corporate Staff Accounts"), `manage_profile_crud`, `assign_staff_tasks`, `view_hr_ops`, `manage_hr_payroll`, `view_dashboard`, `view_kyc`, `approve_kyc`, `view_disputes`, `resolve_disputes`, `view_financials`, `approve_payouts`, `view_logistics`, `override_logistics`, `manage_users`, `manage_marketing`, `manage_settings`, `view_audit_logs`.

---

## 4. Staff Portal Functional Requirements

### 4.1 Staff Authentication & Security
- **STF-001:** Staff auth SHALL support both 2-Factor OTP verification (`654321`) and Corporate Password authentication (`AuthPage.tsx`).
- **STF-002:** Navigation links SHALL filter strictly based on role clearance permissions (`SidebarNav.tsx`).
- **STF-003:** Every security sensitive operation SHALL emit an entry to the immutable audit log ledger (`auditLogs`).
