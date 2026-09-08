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

### 4. 🔌 Live Backend API Service Wiring (`apiClient.ts`)
- Dynamically resolves `VITE_API_URL || VITE_API_BASE_URL || 'http://localhost:8000/api/v1'`.
- Integrates live KYC review queue (`GET /api/v1/staff/kyc/queue`), dispute legal arbitration (`POST /api/v1/staff/disputes/{id}/adjudicate`), financial payout dual-control PIN authorization, and fleet dispatch overrides against the Laravel 13 backend.

---

## 🛠️ Environment Configuration & Local Setup

### Environment Variables (`.env`)
```env
# Local Development: http://localhost:8000/api/v1
# Production Hosting: https://api.wunabuy.com/api/v1
VITE_API_URL=http://localhost:8000/api/v1

VITE_REVERB_APP_KEY=wunabuy_reverb_key
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME=http
```

### Run Staff Portal
```bash
cd staff-portal
npm install
npm run dev
```

The portal runs locally at `http://localhost:5173`. In production, deploy to `https://staff.wunabuy.com`.
