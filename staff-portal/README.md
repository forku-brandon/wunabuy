# Wunabuy Web Staff Operations Portal (v2.5)

Enterprise Web Application for Wunabuy company personnel, featuring real-time operational telemetry, Active Bilingual (EN/FR) i18n Language Engine, Production API Service Adapter Layer, Granular Field-Level ACL Controls, SearchableSelect Dropdown Primitives, Universal Data Table Searchers, Corporate Staff Account Provisioning CRUD, Dual OTP/Password Authentication, 18-flag RBAC security clearance, HR & Staff Payroll with printable payslips, borderless design system, and light/dark theme switching.

---

## 🌟 Key Features in Version 2.5

### 1. 🌐 Active Bilingual (EN/FR) i18n Language Engine (`LanguageContext.tsx`, `translations.ts`, `Header.tsx`)
- **Top Header Language Selector**: Interactive language pill dropdown (`🌐 EN 🇬🇧` / `🌐 FR 🇫🇷`) next to Theme Switcher allowing 1-click instant switching between English and French.
- **Language Preference Persistence**: Saves user language selection in `localStorage` (`wunabuy_staff_lang`) and sets document root `<html lang="en">` / `<html lang="fr">`.
- **Comprehensive Translations**: Dictionary covering navigation, actions, status badges, hero clock, and operational dialogs.

### 2. 🔌 Production API Service Client & Endpoint Integration Adapter Layer (`staff-portal/src/services/`)
- **Base HTTP Client (`apiClient.ts`)**: Sanctum Bearer token injection, `ApiError` parsing, and configurable `VITE_API_BASE_URL`.
- **Modular Service Clients**: Dedicated endpoint adapters for Auth (`authApi.ts`), Staff Roster (`staffDirectoryApi.ts`), KYC Queue (`kycApi.ts`), Escrow Disputes (`disputesApi.ts`), Financial Payouts (`financialsApi.ts`), Logistics Telemetry (`logisticsApi.ts`), Work Tasks (`tasksApi.ts`), RBAC Matrix (`rbacApi.ts`), and Audit Logs (`auditLogsApi.ts`).
- **Offline Fallback**: Every service method gracefully falls back to local seeders if the backend API server is unreachable.

### 3. 🔒 Granular Field-Level ACL Controls & Lock Indicators (`StaffProfilePage.tsx`, `FinancialsPage.tsx`, `KYCPage.tsx`, `DisputesPage.tsx`, `LogisticsOpsPage.tsx`)
- **Field & Action Locks**: Profile avatar upload & password change allowed for all staff, while core corporate identity fields and critical operational action buttons are locked with visual `Lock` badges for non-admins.

### 4. 🔍 SearchableSelect Primitive & Universal Data Table Searchers (`SearchableSelect.tsx` & `DataTable.tsx`)
- In-built text search bar in dropdowns and top search filter enabled across all data tables.

### 5. 👔 Corporate Staff Account Directory & Provisioning (`HROpsPage.tsx` & `staffAuthStore.ts`)
- Full CRUD management of corporate staff accounts with corporate email (`@wunabuy.com`), phone (`+237 6XX XXX XXX`), clearance levels (Level 1-5), and department roles.

---

## 🛠️ Local Development & Setup

```bash
cd staff-portal
npm install
npm run dev
```

The app will run at `http://localhost:5173`.
