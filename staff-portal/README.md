# Wunabuy Web Staff Operations Portal (v2.0)

Enterprise Web Application for Wunabuy company personnel, featuring real-time operational telemetry, 2-Stage OTP authentication, strict RBAC security clearance, Mobile Money payout disbursals, internal chat, system announcement broadcasts, and advanced data tables.

---

## 🌟 Key Features in Version 2.0

### 1. 🔑 Security & Authentication
- **2-Stage OTP Verification (`AuthPage.tsx`)**: Corporate email/phone entry -> 6-digit box grid with 45s resend timer and 1-tap demo auto-fill (`654321`).
- **Strict Role-Based Access Control (RBAC)**: Unauthorized sidebar links are completely hidden from the DOM based on active staff clearance level (Levels 1 to 5).
- **Super Admin Governance (`SettingsPage.tsx`)**: Create custom roles, edit permission matrices across 13 system flags, and record Level-5 `CRITICAL` audit logs.

### 2. 🎨 Enterprise SaaS Aesthetic & Responsive Layout
- **Modern Soft Design (Boltz Dashboard Style)**: Soft off-white blue canvas (`bg-[#F4F6FB]`) with rounded white cards (`bg-white rounded-2xl border border-slate-200/70 shadow-xs`).
- **Mobile Slide-Out Drawer (`SidebarNav.tsx`)**: Responsive sidebar drawer on mobile/tablet viewports (`lg:hidden`) with dark backdrop overlay and scrollable menu container (`flex-1 overflow-y-auto`).
- **Streamlined Top Header (`Header.tsx`)**: Compact search pill (`w-44 sm:w-64 lg:w-80`), date period filter pill (`Filter Period`), notification drawer (`Bell` badge 12), support chat drawer (`MessageSquare` badge 5), and RBAC persona switcher.

### 3. 💬 Internal Chat & Announcement Broadcast Center
- **Departmental Channels (`CommunicationsPage.tsx`)**: `#general-hq`, `#finance-treasury`, `#compliance-kyc`, `#logistics-fleet`, `#executive-board`.
- **Direct Colleague Messaging**: Direct messaging with staff team members (`Pauline Mbarga`, `Christian Atangana`, `Marie-Noelle Bikoe`, `Jean-Luc Fotso`, `Therese Abena`).
- **Official Broadcast Feed**: Broadcast executive directives with severity tags (`URGENT 🚨`, `POLICY 📋`, `GENERAL 📣`) and target audience selection.

### 4. 📊 Advanced Data Tables & Neutral Slate Typography
- **Reusable `DataTable.tsx` Component**: Integrated search bar, pagination controls ("Showing 1 to 5 of X entries", "Page 1 of Y", `Previous` and `Next` buttons), and clean default slate typography.
- **Refactored Modules**:
  - `KYCPage.tsx`: Store merchant & driver CNI verification queue.
  - `DisputesPage.tsx`: 3-Way Escrow Disputes adjudication bench.
  - `LogisticsOpsPage.tsx`: Driver GPS telemetry & dispatch manual override.
  - `FinancialsPage.tsx`: MTN MoMo & Orange Money payout security authorization.
  - `UsersPage.tsx`: Buyer, Seller, Transporter directory & restriction controls.
  - `MarketingPage.tsx`: Promo banner campaigns & voucher claims.
  - `SettingsPage.tsx`: Immutable security audit log ledger.

---

## 🛠️ Local Development & Setup

```bash
cd staff-portal
npm install
npm run dev
```

The app will run at `http://localhost:5173`.

### QA Testing Demo Accounts (Role Switcher in Header)
1. **Pauline Mbarga** — Super Administrator (Clearance Level 5)
2. **Christian Atangana** — Senior Finance Officer (Clearance Level 4)
3. **Marie-Noelle Bikoe** — Compliance & KYC Specialist (Clearance Level 3)
4. **Jean-Luc Fotso** — Operations & Dispatch Lead (Clearance Level 3)
5. **Therese Abena** — Customer Service Lead (Clearance Level 2)

---

## 📄 Documentation

- [Software Requirements Specification (SRS v2.0)](../docs/Wunabuy_SRS_v2.0.md)
- [Backend Tech Spec](../docs/Wunabuy_Backend_Tech_Spec_v1.0.md)
- [Product Requirements Document (PRD v1.8)](../docs/Wunabuy_PRD_v1.0.md)
