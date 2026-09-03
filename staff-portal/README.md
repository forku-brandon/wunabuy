# Wunabuy Web Staff Operations Portal (v2.7)

Enterprise Web Application for Wunabuy company personnel, featuring System Notifications & Operational Alerts Center, Support Chat routing, Strict 3-Color Brand Palette Unification, Persona Switcher ACL Security Guard, Per-Account Staff Auth Persistence, Active Bilingual (EN/FR) i18n Language Engine, Production API Service Adapter Layer, Granular Field-Level ACL Controls, SearchableSelect Dropdown Primitives, Universal Data Table Searchers, Corporate Staff Account Provisioning CRUD, Dual OTP/Password Authentication, 18-flag RBAC security clearance, HR & Staff Payroll with printable payslips, borderless design system, and light/dark theme switching.

---

## 🌟 Key Features in Version 2.7

### 1. 🔔 System Notifications & Operational Alerts Center (`NotificationsPage.tsx`, `notificationsStore.ts`, `Header.tsx`)
- **Dedicated Route (`/notifications`)**: Centralized system notifications ledger with unread counter, telemetry KPI cards (Total Alerts, Unread, Critical, Payouts), category tabs (`PAYOUT`, `KYC`, `DISPUTE`, `LOGISTICS`, `HR`, `SYSTEM`), priority filters, real-time text search, and direct operational target action links.
- **Top Navbar Bell Dropdown (`Header.tsx`)**: Interactive operational alerts dropdown with unread badge counter, direct target routing, and a prominent **"View All Notifications Center →"** button.

### 2. 💬 Staff Support Chat & Broadcast Center Connection (`Header.tsx`, `CommunicationsPage.tsx`)
- Top header `MessageSquare` support chat button directly routes to the **Internal Staff Support Chat & Broadcast Center (`/communications`)**.

### 3. 🎨 Strict 3-Color Brand Palette Unification
- Enforced Emerald Teal (`#0D9488`) primary, Amber Gold (`#F59E0B`) accent, and Clean White / Obsidian Dark Slate (`bg-[#121824]`) secondary surface colors across all UI components, badges, sidebars, headers, and stat cards.

### 4. 🔌 Backend Technical Specifications & API Specifications v2.7 (`Wunabuy_Backend_Tech_Spec_v1.0.md`)
- Full RESTful API specifications for all 9 staff modules (`/api/v1/staff/*`), 18-flag RBAC permissions, notifications schema, payroll CNPS tax ledger, and escrow payout disbursal endpoints.

---

## 🛠️ Local Development & Setup

```bash
cd staff-portal
npm install
npm run dev
```

The app will run at `http://localhost:5173`.
