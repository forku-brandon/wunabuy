# Software Requirements Specification (SRS)
# Wunabuy — Multi-Sided E-Commerce & Web Staff Operations Platform

**Document Version:** 2.4 (Granular Field-Level ACL Locks, SearchableSelect Dropdowns & Universal Table Searchers)  
**Date:** September 3, 2026  
**Status:** Approved / In Production Use  
**Companion Documents:** Wunabuy PRD v1.0, Wunabuy Frontend Tech Spec v1.8, Wunabuy Backend Tech Spec v1.4  

---

## 🚀 Key Staff Portal v2.4 Architecture & Feature Specifications (September 2026)

- **Granular Field-Level ACL Permission Enforcement & Action Lock Indicators (`StaffProfilePage.tsx`, `FinancialsPage.tsx`, `KYCPage.tsx`, `DisputesPage.tsx`, `LogisticsOpsPage.tsx`)**:
  - **Staff Profile Page (`StaffProfilePage.tsx`)**: All staff members CAN upload/change their profile avatar (`updateUserAvatar`), change access password, and update notification preferences. Core corporate identity fields (First Name, Last Name, Email, Phone, Department, Role Code, Clearance Level, NIU Tax ID) are strictly locked (`disabled={!canEditProfile}`) for non-admins with explicit `Lock` indicators (`LOCKED BY ADMIN GOVERNANCE`).
  - **Action Locks on Operational Pages**: Action buttons for non-authorized personnel are replaced with disabled lock badges (`<Lock /> Locked (Admin Only)`) across MoMo Payout Approvals (`approve_payouts`), KYC Compliance Verification (`approve_kyc`), Escrow Dispute Adjudication (`resolve_disputes`), and Logistics Dispatch Overrides (`override_logistics`).

- **SearchableSelect Primitive & Universal In-Built Table Searchers (`SearchableSelect.tsx` & `DataTable.tsx`)**:
  - **SearchableSelect Component (`SearchableSelect.tsx`)**: Reusable UI component featuring an in-built top text search bar filtering options in real time. Applied to all form dropdowns in Provision Staff Modal, Edit Staff Modal, Assign Work Directive Modal, and RBAC Clearance Editor.
  - **Universal Table Search**: All data tables across the platform leverage `DataTable.tsx` with `searchable={true}` enabled with a top search input filtering across all dataset properties.

- **18-Flag RBAC System Permission Matrix (`staffAuthStore.ts` & `SettingsPage.tsx`)**:
  - Fully synchronized permissions matrix for all 7 corporate staff roles (`SUPER_ADMIN`, `HR_MANAGER`, `FINANCE_OFFICER`, `COMPLIANCE_OFFICER`, `OPS_MANAGER`, `MARKETING_LEAD`, `SUPPORT_AGENT`).
  - Level 5 Clearance / Super Admin accounts automatically override all permission checks to ensure 100% platform governance access.

- **Corporate Staff Account Directory & Lifecycle Management Engine (`HROpsPage.tsx` & `staffAuthStore.ts`)**:
  - Full CRUD management of corporate staff accounts: Provisioning modal, editable details, status toggle (`🟢 ACTIVE` / `🔴 SUSPENDED`), and account revocation.

- **Dual Corporate Authentication Engine (`AuthPage.tsx`)**:
  - Dual login modes: **2-Factor OTP Code** (6-digit OTP `654321`) AND **Corporate Password Authentication** (`wunabuy2026`).

---

## 4. Staff Portal Functional Requirements

### 4.1 Staff Authentication & Security
- **STF-001:** Staff auth SHALL support both 2-Factor OTP verification (`654321`) and Corporate Password authentication (`AuthPage.tsx`).
- **STF-002:** Navigation links SHALL filter strictly based on role clearance permissions (`SidebarNav.tsx`).
- **STF-003:** Every security sensitive operation SHALL emit an entry to the immutable audit log ledger (`auditLogs`).
- **STF-004:** All sensitive actions and identity input fields SHALL enforce granular field-level ACL guards with visual `Lock` badges for non-authorized staff personnel.
