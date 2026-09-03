# Wunabuy Web Staff Operations Portal (v2.6)

Enterprise Web Application for Wunabuy company personnel, featuring real-time operational telemetry, Persona Switcher ACL Security Guard, Per-Account Staff Auth Persistence, Active Bilingual (EN/FR) i18n Language Engine, Production API Service Adapter Layer, Granular Field-Level ACL Controls, SearchableSelect Dropdown Primitives, Universal Data Table Searchers, Corporate Staff Account Provisioning CRUD, Dual OTP/Password Authentication, 18-flag RBAC security clearance, HR & Staff Payroll with printable payslips, borderless design system, and light/dark theme switching.

---

## 🌟 Key Features in Version 2.6

### 1. 🔒 Persona Switcher Access Control Restriction & Security Hardening (`Header.tsx`, `staffAuthStore.ts`, `SettingsPage.tsx`)
- **`switch_staff_personas` ACL Permission Flag**: Restricted by default to Super Admin (`SUPER_ADMIN` / Level 5 Clearance). Super Admin can grant or revoke persona switching access per role via the RBAC Governance matrix.
- **Header Menu Security Guard**: For all non-admin staff users, the persona switcher section is COMPLETELY REMOVED from their user dropdown panel for high security.

### 2. 🔐 Per-Account Staff Authentication & Session Persistence (`AuthPage.tsx` & `staffAuthStore.ts`)
- **Staff Account Quick Picker**: Quick-select dropdown on `AuthPage.tsx` listing all corporate staff accounts (`Pauline Mbarga`, `Christian Atangana`, `Chantal Nguesso`, `Marie Eyebe`, `Alain Ngueme`, `Therese Abena`, `Marcelle Njoya`, and newly provisioned staff).
- **Exact Session Hydration**: Authenticating via 2-Factor OTP (`654321`) or Password (`wunabuy2026`) matches the staff member's exact email/phone and hydrates their exact clearance level (1-5) and department permissions.

### 3. 🌐 Active Bilingual (EN/FR) i18n Language Engine (`LanguageContext.tsx`, `translations.ts`, `Header.tsx`)
- **Top Header Language Selector**: Interactive language pill dropdown (`🌐 EN 🇬🇧` / `🌐 FR 🇫🇷`) next to Theme Switcher allowing 1-click instant switching between English and French with `localStorage` persistence.

### 4. 🔌 Production API Service Client & Endpoint Integration Adapter Layer (`staff-portal/src/services/`)
- **Base HTTP Client & Modular Service Adapters**: Sanctum Bearer token injection, `ApiError` parsing, and endpoint adapters for Auth (`authApi.ts`), Staff Roster (`staffDirectoryApi.ts`), KYC Queue (`kycApi.ts`), Escrow Disputes (`disputesApi.ts`), Financial Payouts (`financialsApi.ts`), Logistics Telemetry (`logisticsApi.ts`), Work Tasks (`tasksApi.ts`), RBAC Matrix (`rbacApi.ts`), and Audit Logs (`auditLogsApi.ts`).

---

## 🛠️ Local Development & Setup

```bash
cd staff-portal
npm install
npm run dev
```

The app will run at `http://localhost:5173`.
