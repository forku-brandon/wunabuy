# Software Requirements Specification (SRS)
# Wunabuy — Multi-Sided E-Commerce & Web Staff Operations Platform

**Document Version:** 2.7 (Notifications Center, Support Chat, 3-Color Brand Palette & Backend Technical Specs v2.7)  
**Date:** September 3, 2026  
**Status:** Approved / In Production Use  
**Companion Documents:** Wunabuy PRD v2.7, Wunabuy Backend Tech Spec v2.7  

---

## 🚀 Key Staff Portal v2.7 Architecture & Feature Specifications (September 2026)

- **System Notifications & Operational Alerts Center (`NotificationsPage.tsx`, `notificationsStore.ts`, `Header.tsx`)**:
  - **Dedicated Route (`/notifications`)**: Centralized system notifications ledger with unread counter, telemetry KPI cards (Total Alerts, Unread, Critical, Payouts), category tabs (`PAYOUT`, `KYC`, `DISPUTE`, `LOGISTICS`, `HR`, `SYSTEM`), priority filters, real-time text search, and direct operational target action links.
  - **Top Navbar Bell Dropdown (`Header.tsx`)**: Interactive operational alerts dropdown with unread badge counter, direct target routing, and a prominent **"View All Notifications Center →"** button.

- **Staff Support Chat & Broadcast Center Connection (`Header.tsx`, `CommunicationsPage.tsx`)**:
  - Top header `MessageSquare` support chat button directly routes to the **Internal Staff Support Chat & Broadcast Center (`/communications`)**.

- **Strict 3-Color Brand Palette Unification**:
  - Enforced Emerald Teal (`#0D9488`) primary, Amber Gold (`#F59E0B`) accent, and Clean White / Obsidian Dark Slate (`bg-[#121824]`) secondary surface colors across all UI components, badges, sidebars, headers, and stat cards.

- **Backend Technical Specifications & API Harmony (`Wunabuy_Backend_Tech_Spec_v1.0.md`)**:
  - Updated backend technical specifications (v2.7) detailing all Staff API endpoints (`/api/v1/staff/*`), 18-flag RBAC permissions, notifications schema, payroll CNPS tax ledger, and escrow payout disbursal endpoints.

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
