# Software Requirements Specification (SRS)
# Wunabuy — Multi-Sided E-Commerce & Web Staff Operations Platform

**Document Version:** 2.5 (Production API Service Client Layer & Active Bilingual EN/FR i18n Language Engine)  
**Date:** September 3, 2026  
**Status:** Approved / In Production Use  
**Companion Documents:** Wunabuy PRD v1.0, Wunabuy Frontend Tech Spec v1.8, Wunabuy Backend Tech Spec v1.4  

---

## 🚀 Key Staff Portal v2.5 Architecture & Feature Specifications (September 2026)

- **Active Bilingual Internationalization (i18n) Engine & Top Header Selector (`LanguageContext.tsx`, `translations.ts`, `Header.tsx`)**:
  - **Language Context & Hook (`LanguageContext.tsx`)**: Global React context provider exposing active language (`'en'` vs `'fr'`), `setLanguage`, and `t(key, fallbackText)` dictionary lookup.
  - **Top Header Language Selector Dropdown (`Header.tsx`)**: Interactive language pill button (`🌐 EN 🇬🇧` / `🌐 FR 🇫🇷`) next to Theme Switcher with instant 1-click language toggling.
  - **Automatic Persistence**: User's chosen language preference is saved in `localStorage` (`wunabuy_staff_lang`) and sets document root `<html lang="en">` / `<html lang="fr">`.

- **Production API Service Client Layer & Backend Integration Adapter Layer (`staff-portal/src/services/`)**:
  - **Base HTTP Client (`apiClient.ts`)**: Fetch API wrapper with `VITE_API_BASE_URL` (defaults to `http://localhost:8000/api/v1`), Sanctum Bearer token injection (`Authorization: Bearer <token>`), `ApiError` parsing, and offline fallback.
  - **Modular Service Clients**: Dedicated endpoint adapters for Auth (`authApi.ts`), Staff Roster (`staffDirectoryApi.ts`), KYC Queue (`kycApi.ts`), Escrow Disputes (`disputesApi.ts`), Financial Payouts (`financialsApi.ts`), Logistics Telemetry (`logisticsApi.ts`), Work Tasks (`tasksApi.ts`), RBAC Matrix (`rbacApi.ts`), and Audit Logs (`auditLogsApi.ts`).
  - **Seamless Offline Fallback**: Every service method gracefully falls back to local seeders if the backend API server is unreachable, maintaining 100% working UI.

- **Granular Field-Level ACL Permission Enforcement & Action Lock Indicators (`StaffProfilePage.tsx`, `FinancialsPage.tsx`, `KYCPage.tsx`, `DisputesPage.tsx`, `LogisticsOpsPage.tsx`)**:
  - Profile avatar upload & password change allowed for all staff, while core corporate identity fields (Name, Email, Phone, Department, Clearance) are locked (`disabled={!canEditProfile}`) with `Lock` badges for non-admins.

- **18-Flag RBAC System Permission Matrix (`staffAuthStore.ts` & `SettingsPage.tsx`)**:
  - Fully synchronized permissions matrix for all 7 corporate staff roles with Level 5 Super Admin override rules.

---

## 4. Staff Portal Functional Requirements

### 4.1 Staff Authentication & Security
- **STF-001:** Staff auth SHALL support both 2-Factor OTP verification (`654321`) and Corporate Password authentication (`AuthPage.tsx`).
- **STF-002:** Navigation links SHALL filter strictly based on role clearance permissions (`SidebarNav.tsx`).
- **STF-003:** Every security sensitive operation SHALL emit an entry to the immutable audit log ledger (`auditLogs`).
- **STF-004:** All sensitive actions and identity input fields SHALL enforce granular field-level ACL guards with visual `Lock` badges.
- **STF-005:** The application SHALL provide an active bilingual i18n switcher allowing users to switch between English (`en`) and French (`fr`).
