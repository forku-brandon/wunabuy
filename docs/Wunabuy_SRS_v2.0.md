# Software Requirements Specification (SRS)
# Wunabuy — Multi-Sided E-Commerce & Web Staff Operations Platform

**Document Version:** 2.6 (Persona Switcher ACL Security Guard, Per-Account Auth Persistence & Production API Services)  
**Date:** September 3, 2026  
**Status:** Approved / In Production Use  
**Companion Documents:** Wunabuy PRD v1.0, Wunabuy Frontend Tech Spec v1.8, Wunabuy Backend Tech Spec v1.4  

---

## 🚀 Key Staff Portal v2.6 Architecture & Feature Specifications (September 2026)

- **Persona Switcher Access Control Restriction & Security Hardening (`Header.tsx`, `staffAuthStore.ts`, `SettingsPage.tsx`)**:
  - **New ACL Permission Flag (`switch_staff_personas`)**: Registered `switch_staff_personas` ("Switch QA Staff Personas & Roles") in platform ACL. By default, granted **ONLY** to `SUPER_ADMIN` (Level 5 Clearance). Super Admin can grant/revoke this flag per role via the RBAC Governance matrix (`SettingsPage.tsx`).
  - **Header Menu Security Guard (`Header.tsx`)**: Evaluates `hasPermission('switch_staff_personas')`. For all non-admin staff users, the persona switcher section is **COMPLETELY REMOVED** from their user dropdown panel for high security.

- **Per-Account Staff Authentication & Session Persistence (`AuthPage.tsx` & `staffAuthStore.ts`)**:
  - **Registered Staff Quick Picker (`AuthPage.tsx`)**: Dropdown menu on both 2-Factor OTP and Password login modes listing all corporate staff accounts (`Pauline Mbarga`, `Christian Atangana`, `Chantal Nguesso`, `Marie Eyebe`, `Alain Ngueme`, `Therese Abena`, `Marcelle Njoya`, and newly provisioned staff).
  - **Exact Session Hydration**: Authenticating via 2-Factor OTP (`654321`) or Password (`wunabuy2026`) matches the staff member's exact email/phone and hydrates their exact clearance level (1-5) and department permissions.

- **Production API Service Client Layer & Endpoint Adapters (`staff-portal/src/services/`)**:
  - **Base HTTP Client (`apiClient.ts`)**: Base Fetch HTTP client with `VITE_API_BASE_URL` (defaults to `http://localhost:8000/api/v1`), Sanctum Bearer tokens, `ApiError` parsing, and offline fallback.
  - **Modular Service Clients**: Dedicated RESTful endpoint adapters for Auth (`authApi.ts`), Staff Roster (`staffDirectoryApi.ts`), KYC Queue (`kycApi.ts`), Escrow Disputes (`disputesApi.ts`), Financial Payouts (`financialsApi.ts`), Logistics Telemetry (`logisticsApi.ts`), Work Tasks (`tasksApi.ts`), RBAC Matrix (`rbacApi.ts`), and Audit Logs (`auditLogsApi.ts`).
  - **Offline Fallback**: Every service method gracefully falls back to local seeders if the backend API server is unreachable.

- **Active Bilingual Internationalization (i18n) Engine (`LanguageContext.tsx`, `translations.ts`, `Header.tsx`)**:
  - Instant 1-click language toggling between **English (EN 🇬🇧)** and **French (FR 🇫🇷)** with persistent `localStorage` state.

---

## 4. Staff Portal Functional Requirements

### 4.1 Staff Authentication & Security
- **STF-001:** Staff auth SHALL support both 2-Factor OTP verification (`654321`) and Corporate Password authentication (`AuthPage.tsx`).
- **STF-002:** Navigation links SHALL filter strictly based on role clearance permissions (`SidebarNav.tsx`).
- **STF-003:** Every security sensitive operation SHALL emit an entry to the immutable audit log ledger (`auditLogs`).
- **STF-004:** All sensitive actions and identity input fields SHALL enforce granular field-level ACL guards with visual `Lock` badges.
- **STF-005:** The application SHALL provide an active bilingual i18n switcher allowing users to switch between English (`en`) and French (`fr`).
- **STF-006:** Persona switching SHALL be hidden by default for non-admin staff users and restricted strictly via the `switch_staff_personas` ACL permission flag.
