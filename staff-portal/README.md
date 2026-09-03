# Wunabuy Web Staff Operations Portal (v2.2)

Enterprise Web Application for Wunabuy company personnel, featuring real-time operational telemetry, 2-Stage OTP authentication, strict 15-flag RBAC security clearance, HR & Staff Payroll with printable payslips, Mobile Money payout disbursals, internal chat, system announcement broadcasts, borderless design system, and light/dark theme switching.

---

## 🌟 Key Features in Version 2.2

### 1. 👔 HR Operations & Staff Payroll (`HROpsPage.tsx`)
- **Monthly Salary Disbursal Ledger**: Track base salary, transport allowance, performance incentives, CNPS social security deductions (4.2%), income tax (IRPP), and net payable in FCFA (XAF).
- **Printable Payslip Engine**: Official 1-click **Print Payslip** modal (`window.print()`) with Wunabuy HR header, employer CNPS registration (`389201-X`), itemized tax breakdown, and digital authorization.
- **Staff Compliance Document Vault**: Centralized storage for Employment Contracts, CNI ID copies, NIU Tax certificates, and Health clearances with view and upload actions.
- **Time-Off Leave Request Queue**: Annual leave, sick leave, and maternity leave request queue with 1-click Approve / Reject management workflow.

### 2. 👤 Staff Account Profile & Credentials (`StaffProfilePage.tsx`)
- **FinTech SaaS Structural Layout**: Vertical sub-nav panel (`Profile Settings`, `Password`, `Notifications`), 2-column form grid with Cameroon 🇨🇲 flag phone picker, radio gender selector, read-only employee ID box, and NIU tax ID field.
- **Local Avatar Upload & Persistence**: `FileReader` Base64 encoding with `localStorage` browser persistence (`wunabuy_staff_avatar_<id>`) updating avatars across Header, SidebarNav, and Profile Page.
- **Strict Admin Control**: Guarded by `manage_profile_crud` permission and Level 5 clearance. Non-admins receive read-only field states and a security alert banner.

### 3. 🔒 15-Flag RBAC Roles & Governance (`SettingsPage.tsx` & `staffAuthStore.ts`)
- **15 System Permissions**: `view_dashboard`, `view_kyc`, `approve_kyc`, `view_disputes`, `resolve_disputes`, `view_financials`, `approve_payouts`, `view_logistics`, `override_logistics`, `manage_users`, `manage_marketing`, `manage_settings`, `manage_profile_crud`, `view_hr_ops`, `manage_hr_payroll`, `view_audit_logs`.
- **Role Governance**: Super Admins (Level 5) can create custom roles, edit permission matrices across all 15 flags, and record Level-5 `CRITICAL` audit logs.

### 4. 🎨 Borderless Enterprise SaaS UI & Dark Mode Engine
- **Borderless Design System (`Card.tsx`)**: Completely borderless cards (`bg-white dark:bg-[#121824]`) with clean surface background contrast and soft elevation (`shadow-2xs`).
- **Crisp Geometry**: `rounded-xl` for cards, `rounded-lg` for form controls & inputs, `rounded-md font-mono` for badges.
- **Obsidian Dark Mode**: Deep obsidian canvas (`#090D16`), dark card surface (`#121824`), 1-tap Sun/Moon toggle.

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
2. **Chantal Nguesso** — HR & People Operations Lead (Clearance Level 4)
3. **Christian Atangana** — Senior Finance Officer (Clearance Level 4)
4. **Marie-Noelle Bikoe** — Compliance Specialist (Clearance Level 3)
5. **Jean-Luc Fotso** — Logistics Operations Manager (Clearance Level 3)
