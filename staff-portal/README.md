# Wunabuy Web Staff Operations Portal (v3.8)

Enterprise Web Application for Wunabuy company personnel, featuring Full KYC Credential Inspection, Escrow Dispute Photographic Evidence Adjudication, High-Precision Lightbox with 90° Rotation & Zoom, System Notifications & Operational Alerts Center, Live Marketing Adverts & Commercial Partnerships Engine, Corporate Avatar Photo Uploads with 0ms Optimistic Preview, Vite Dev Server Reverse Proxy for Static Media, OWASP Top 10:2025 Enterprise Security Hardening, Support Broadcast Center, Persona Switcher ACL Security Guard, Per-Account Staff Auth Persistence, Active Bilingual (EN/FR) i18n Language Engine, Production API Service Adapter Layer, Granular Field-Level ACL Controls, Universal Data Table Searchers, Corporate Staff Account Provisioning CRUD, Dual OTP/Password Authentication, 18-flag RBAC security clearance, HR & Staff Payroll with printable payslips, borderless design system, and light/dark theme switching.

---

## 🌟 Key Features in Version 3.8

### 1. 🪪 Complete KYC Document Inspection Suite (`KYCPage.tsx`, `DocumentInspectionCard.tsx`)
- **Dual Applicant Flow Verification**:
  - **Store Merchant**: 4-credential verification card grid displaying Cameroon National ID (CNI Front), CNI Back (Date of issue & Signature), Physical Storefront Signage & Stock, and Business Registration Certificate (RCCM / Tax Notice).
  - **Transporter & Rider**: 4-credential verification card grid displaying Driver National CNI, Driver's License (*Permis de Conduire*), Vehicle & License Plate Photo (with vehicle type and plate number metadata), and Vehicle Insurance (*Attestation d'Assurance*).
- **Compliance Status Indicators**: Visual status tags (`Uploaded` in emerald vs `Missing` in amber) with direct hover actions (*Inspect*, *Open in New Tab*).
- **One-Click Compliance Presets**: Instant chips to autofill common audit rejections (*"CNI photo blurry"*, *"Storefront name mismatch"*, *"RCCM invalid or missing"*, *"Expired driver license"*, *"Expired vehicle insurance"*).

### 2. ⚖️ Escrow Dispute Photographic Evidence Gallery & Itemized Adjudication (`DisputesPage.tsx`)
- **Visual Photographic Evidence**: Responsive grid displaying all buyer-uploaded package, delivery, and product damage photos.
- **Disputed Order Itemization**: Real-time table displaying the exact items in the disputed order (thumbnail, product name, quantity, unit price, and subtotal) so arbitrators can verify claims against specific purchase lines.
- **Binding Legal Rulings**: Supports `BUYER_REFUND` (100% return to buyer wallet), `SELLER_RELEASE` (100% payout to merchant), or `SPLIT_50_50` partial disbursals.
- **Arbitration Presets**: One-click autofill for common arbitration legal rationales with immutable audit logging.

### 3. 🔍 High-Precision Image Lightbox (`ImageLightbox.tsx`)
- **90° Clockwise Rotation (`RotateCw`)**: Solves orientation issues with smartphone camera captures of CNI cards, licenses, and receipts.
- **Full Resolution Zoom (`ZoomIn` / `ZoomOut` / `RefreshCcw`)**: Scale factor up to 400% with view reset to inspect microprint, stamps, and signatures.
- **Direct High-Res Download (`Download`)**: Officers can download copies locally for legal compliance records.
- **Keyboard Shortcut**: `Escape` key listener closes the lightbox instantly.

### 4. 📸 Corporate Avatar Photo Upload System (`StaffProfilePage.tsx`, `authApi.ts`, `staffAuthStore.ts`)
- **Instant 0ms Local Preview**: Utilizes HTML5 `FileReader` (`readAsDataURL`) to render uploaded photos immediately without perceptible UI latency.
- **Server Sync & Progress Feedback**: Features responsive `Loader2` spinner state during active transport to `POST /api/v1/staff/profile/avatar`.
- **Fallback Image Protection**: Automatic `onError` image routing to high-fidelity corporate placeholder fallbacks if a remote asset is temporarily unreachable.
- **Normalized Relative Storage**: Strips host dependencies to store clean `/uploads/avatars/...` paths in localStorage, ensuring seamless loading across local LAN IPs and domain names.

### 5. 📢 Live Marketing Adverts & Commercial Partnerships Engine (`MarketingAdvertsPage.tsx`)
- **Dedicated Route (`/marketing/adverts`)**: Interactive dashboard for managing promotional campaigns, featured merchant partnerships, and platform discount banners.
- **Full CRUD Management**: Create, edit, toggle active state, and delete campaigns communicating with `/api/v1/staff/adverts`.
- **Customizable Badges & Icons**: Configurable badge text, custom badge hex color picker, discount percentage tags, custom Ionicons selector, and sort order.
- **Real-Time Mobile Sync**: Instantly updates promotional banners, discount cards, and `PartnersCarousel` in the mobile app.

### 6. 🎨 Enterprise Layout Redesign & Typography Overhaul
- **Modernized Typographic Hierarchy**: Upgraded to clean Inter/Outfit typography with enhanced legibility and weight balance across all table headers, stat cards, and data badges.
- **Decluttered Navigation**: Streamlined sidebar layout ([SidebarNav.tsx](src/components/layout/SidebarNav.tsx)) grouping core operational departments (Finance, KYC, Disputes, Logistics, HR, Marketing, Security Settings).
- **Obsidian Dark / Clean Slate Surfaces**: Unified slate color tokens (`slate-50` to `slate-950`) providing seamless light/dark mode transitions.

### 7. 🔔 System Notifications & Operational Alerts Center (`NotificationsPage.tsx`, `notificationsStore.ts`, `Header.tsx`)
- **Dedicated Route (`/notifications`)**: Centralized operational alerts ledger with unread counters, category tabs (`PAYOUT`, `KYC`, `DISPUTE`, `LOGISTICS`, `HR`, `SYSTEM`), priority filters (`CRITICAL`, `HIGH`, `MEDIUM`, `INFO`), real-time search, and direct action routing.
- **Resilient Local Persistence**: Safe JSON parsing with try/catch fallbacks protecting against corrupted localStorage state.
- **Top Navbar Bell Dropdown (`Header.tsx`)**: Real-time dropdown preview with instant badge counter and direct link to the full notifications center.

### 8. 🔌 Zero-CORS Vite Dev Reverse Proxy (`vite.config.ts`, `apiClient.ts`)
- **Same-Origin Reverse Proxy**:
  - `/api` -> `http://127.0.0.1:8000`
  - `/uploads` -> `http://127.0.0.1:8000`
  - `/storage` -> `http://127.0.0.1:8000`
- Guarantees zero-CORS requests, eliminating 500 errors and mixed content blocks when accessing the portal across LAN Wi-Fi IP addresses (e.g. `http://192.168.100.1:3001`).

### 9. 🔒 OWASP Top 10:2025 Enterprise Security Hardening
- Route Access Guards (`PermissionGuard.tsx`), Strict Content Security Policy (`index.html`), Encrypted Local Storage with SHA-256 HMAC state checksums (`securityCrypto.ts`), 15-Minute Session Idle Auto-Logout (`useSessionTimeout.ts`), Input Sanitization (`securitySanitizer.ts`), Dual-Control Confirmations (`DualControlConfirmModal.tsx`), and Centralized Security Audit Logger (`securityLogger.ts`).


---

## 🛠️ Environment Configuration & Local Setup

### Environment Variables (`.env`)
```env
# In development, the Vite dev server reverse-proxies /api/v1 directly to the backend
VITE_API_URL=/api/v1

# For standalone or production cloud hosting:
# VITE_API_URL=https://api.wunabuy.com/api/v1

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

The portal runs locally at **`http://localhost:3001`** (or `http://<YOUR_LAN_IP>:3001` on network). In production, deploy to `https://staff.wunabuy.com`.
