# Software Requirements Specification (SRS)
# Wunabuy — Multi-Sided E-Commerce & Web Staff Operations Platform

**Document Version:** 2.2 (Enterprise HR Operations, Staff Profile & 15-Flag RBAC Control)  
**Date:** September 3, 2026  
**Status:** Approved / In Production Use  
**Companion Documents:** Wunabuy PRD v1.8, Wunabuy Frontend Tech Spec v1.8, Wunabuy Backend Tech Spec v1.4  

---

## 🚀 Key Staff Portal v2.2 Architecture & Feature Specifications (September 2026)

- **HR Operations & Staff Payroll Management Module (`HROpsPage.tsx`)**:
  - Monthly Salary Disbursal Ledger: Base salary, transport allowance, performance incentives, CNPS social security deductions (4.2%), income tax (IRPP), and net payable in FCFA (XAF).
  - Printable Payslip Engine: Official 1-click **Print Payslip** modal (`window.print()`) with Wunabuy HR header, employer CNPS registration (`389201-X`), itemized tax breakdown, and digital authorization.
  - Staff Compliance Document Vault: Centralized storage for Employment Contracts, CNI ID copies, NIU Tax certificates, and Health clearances with view and upload actions.
  - Time-Off Leave Request Queue: Annual leave, sick leave, and maternity leave request queue with 1-click Approve / Reject management workflow.

- **Staff Account Profile & Credentials Management (`StaffProfilePage.tsx`)**:
  - FinTech SaaS structural layout: Vertical left sub-navigation card (`Profile Settings`, `Password`, `Notifications`), 2-column form grid (First Name, Last Name, Email, Mobile with 🇨🇲 +237 flag, Gender radio options, Read-only Employee ID, NIU Tax ID, Office Branch Address).
  - Local Avatar Image Upload & Persistence: `FileReader` Base64 encoding with `localStorage` browser persistence (`wunabuy_staff_avatar_<id>`) and real-time avatar updates across Header, SidebarNav, and Profile Page.
  - Strict Admin Profile Guard: Restricted strictly to Super Admins (Level 5 Clearance) or roles granted `manage_profile_crud` permission. Non-admins receive read-only field states and a security alert banner.

- **15-Flag RBAC Roles & Permissions Matrix (`staffAuthStore.ts` & `SettingsPage.tsx`)**:
  - Total system permissions: 15 active permission flags including `view_dashboard`, `view_kyc`, `approve_kyc`, `view_disputes`, `resolve_disputes`, `view_financials`, `approve_payouts`, `view_logistics`, `override_logistics`, `manage_users`, `manage_marketing`, `manage_settings`, `manage_profile_crud`, `view_hr_ops`, `manage_hr_payroll`, `view_audit_logs`.
  - Roles Matrix: Super Admin (Level 5), HR & People Operations Lead (Level 4), Finance & Treasury Officer (Level 4), Compliance Officer (Level 4), Operations Manager (Level 3), Support Agent (Level 2), Marketing Lead (Level 2).

- **Borderless Enterprise Design System (`Card.tsx`, `Badge.tsx`, `Button.tsx`, `SidebarNav.tsx`)**:
  - Completely borderless card container aesthetic (`bg-white dark:bg-[#121824]`) with clean surface contrast and soft elevation (`shadow-2xs`).
  - Crisp geometry: `rounded-xl` for cards, `rounded-lg` for form controls & inputs, `rounded-md font-mono` for badges.
  - Obsidian Dark Mode Palette: Canvas `#090D16`, Card Surface `#121824`.

---

## 4. Staff Portal Functional Requirements

### 4.1 Staff Authentication & Security
- **STF-001:** Staff auth SHALL execute a 2-Stage OTP verification flow (`AuthPage.tsx`).
- **STF-002:** Navigation links SHALL filter strictly based on role clearance permissions (`SidebarNav.tsx`).
- **STF-003:** Every security sensitive operation SHALL emit an entry to the immutable audit log ledger (`auditLogs`).

### 4.2 Department Operations & Tools
- **STF-004:** KYC Compliance Queue (`KYCPage.tsx`) SHALL allow inspecting CNI front/back photos and approving or rejecting merchant/driver submissions.
- **STF-005:** Escrow Disputes (`DisputesPage.tsx`) SHALL support 3-way dispute investigation and 100% Buyer Refund, 100% Seller Release, or 50/50 Split rulings with mandatory rationale notes.
- **STF-006:** Logistics Telemetry (`LogisticsOpsPage.tsx`) SHALL display live GPS coordinates and allow staff manual trip status overrides.
- **STF-007:** Financials & Payouts (`FinancialsPage.tsx`) SHALL support security PIN authorization for MTN MoMo and Orange Money disbursals.
- **STF-008:** Internal Communications (`CommunicationsPage.tsx`) SHALL provide departmental chat channels and company-wide system announcement broadcasting.
- **STF-009:** HR & Staff Operations (`HROpsPage.tsx`) SHALL support monthly payroll ledgers, itemized salary calculations, 1-click printable payslips, compliance document vaults, and leave request approval workflows.
- **STF-010:** Staff Profile Management (`StaffProfilePage.tsx`) SHALL allow permitted staff members to update profile details, upload custom avatars with browser `localStorage` persistence, change passwords, and configure operational alerts.
