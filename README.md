<p align="center">
  <img src="docs/assets/wunabuy-logo.jpg" alt="Wunabuy Logo" width="400" />
</p>

<h3 align="center">Multi-Sided E-Commerce & On-Demand Logistics Marketplace</h3>

<p align="center">
  <em>Escrow-protected commerce built for emerging African markets</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-0.74+-61DAFB?logo=react&logoColor=white" alt="React Native" />
  <img src="https://img.shields.io/badge/Expo_SDK-51-000020?logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/Laravel-13-FF2D20?logo=laravel&logoColor=white" alt="Laravel" />
  <img src="https://img.shields.io/badge/PostgreSQL-18-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/TypeScript-5.4-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
</p>

---

## 🌍 About Wunabuy

Wunabuy is an enterprise multi-sided mobile e-commerce and on-demand logistics platform designed specifically for emerging African markets, launching first in **Yaoundé & Douala, Cameroon**.

It connects three user groups through a single escrow-protected ecosystem:

| Role | What They Do |
|---|---|
| 🛒 **Buyers** | Search verified stores, purchase with escrow protection, track deliveries in real-time |
| 🏪 **Sellers (Store Owners)** | Digitize storefronts, manage inventory, receive guaranteed payouts after verified delivery |
| 🚚 **Transport Providers** | Accept delivery jobs, navigate with GPS, earn transparent mileage-based fees |

The **Full-Stack Platform (v3.5)** integrates a **100% dynamic, live database architecture backed by PostgreSQL 18** and **Laravel 13**, completely purging all fake stores, mock sellers, and static mock financial data. It features strict **Anti-IDOR Authorization Hardening** and **Elimination of all `::first()` Database Fallbacks**, dual-entry escrow settlement (`EscrowService.php`), dynamic logistics with HMAC-SHA256 parcel custody QR tags (`LogisticsService.php`), real Cameroon Mobile Money ledger simulations (`PaymentService.php`), a **Zero-Demo Profile & Catalog Architecture** (with all 25 catalog products affiliated to verified seller *Brandon Official Tech Store*), **Sanctum Token Auto-Recovery** (`/auth/refresh`, `/auth/dev-session`), and modern **Android Edge-to-Edge System Navigation** compliance. Engineered with **zero-code environment switching** (`mobile/src/config/env.ts` with Android emulator `10.0.2.2`, iOS/Web `localhost`, LAN Wi-Fi, and cloud production `https://api.wunabuy.com/api/v1`) and dynamic CORS origin governance.

An internal **Staff Portal (v3.1)** provides operational dashboards across 7 departments with **OWASP Top 10:2025 Enterprise Security Hardening** (Permission Guards `PermissionGuard.tsx`, Strict CSP Headers `index.html`, Asset Origin Whitelisting `securitySupplyChain.ts`, Encrypted Storage & 15-Min Session Idle Auto-Logout `securityCrypto.ts` & `useSessionTimeout.ts`, Input Sanitization & XSS Stripping `securitySanitizer.ts`, Dual-Control Confirmations `DualControlConfirmModal.tsx`, Action Throttling `rateLimiter.ts`, Brute-Force Lockout, HMAC State Integrity Checksums, Security Audit Logger `securityLogger.ts`, and React Error Boundary `ErrorBoundary.tsx`).

The **Mobile App (v3.5)** features instant Seller Dashboard catalog hydration (live products and active orders loaded on startup), a dedicated **6-Digit PIN Login & Setup Screen** (`PinLoginScreen.tsx` & `RegisterScreen.tsx`), an interactive quantity input modal (`QuantityInputModal.tsx`), a 2D tabular store pickup & location component with bidirectional scrolling (`StorePickupTable.tsx`), live camera seller store QR & PIN scanner modal (`SellerQRScannerModal.tsx`), printable encrypted parcel QR shipping tags with central logo emblem (`PrintableParcelQRModal.tsx`), real-time transporter parcel code match verification (`TransporterActiveTripScreen.tsx`), direct phone dialer integration (`Linking.openURL('tel:...')`), and zero-demo profile customization (`ProfileScreen.tsx`, `EditStoreProfileScreen.tsx`, `TransporterProfileScreen.tsx`).

### Core Value Propositions

- **Anti-IDOR Security & Zero Database Fallbacks** — Complete elimination of dangerous `::first()` fallbacks across all controllers. Order fulfillment, escrow release, order cancellation, and catalog modifications enforce strict ownership checks.
- **100% Dynamic PostgreSQL Database Engine** — Live financial ledger, buyer disputes, wallet balances, store analytics, and transporter dispatch jobs query real PostgreSQL tables with zero static mock constants.
- **Zero-Demo Profile & Catalog Architecture** — Buyer profiles, Seller store profiles, and Transporter profiles start completely free of fake mock data. Real merchant catalog with 25 authentic products assigned exclusively to verified seller Forku Brandon.
- **Self-Healing Token Recovery & Developer Session Minting** — Client-side Axios interceptors auto-refresh Sanctum access tokens on 401 and auto-recover developer testing sessions in local mode, preventing session drops and console warning loops.
- **Modern Edge-to-Edge Android Compliance** — Full compatibility with Android 15 edge-to-edge transparent navigation system UI.
- **6-Digit PIN Authentication & Dynamic Permissions** — Instant, zero-cost, reliable login via 6-digit security PIN and phone number with fine-grained role permissions, eager-loaded wallets, and forward-compatible SMS OTP 2FA architecture.
- **OWASP Top 10:2025 Enterprise Security Hardening** — Web Staff Operations Portal hardened against all 10 critical security risk categories with route access guards, CSP, encrypted storage, 15-minute idle session auto-logout, input sanitization, dual-control action authorization, and security audit telemetry.
- **Escrow-Protected Payments** — Buyer funds are locked until delivery is confirmed via photo proof + buyer digital signature. 48-hour auto-release with dispute protection.
- **Encrypted Parcel QR Shipping Tags & Rider Code Comparison** — Sellers print branded QR shipping labels containing zero plaintext PINs; assigned riders scan tags with hardware camera sensors to verify parcel matching prior to dispatch.
- **Interactive Numeric Quantity Input** — Direct numerical popups replace legacy +/- stepper buttons for fast cart & stock adjustments.
- **2D Tabular Store Location & Directions Grid** — Clean 2-column specifications table for pickup locations, counter operating hours, and landmark directions with tap-to-call store contact actions.
- **Live Camera Barcode Cataloging & Verification** — Real-time camera sensor scanning (`expo-camera`) with hardware torch toggle for instant product catalog auto-fill and secure parcel release.
- **Outstanding Cameroon-Tailored Onboarding** — Welcoming, non-technical onboarding experience with custom pure escrow diagrams and rebranded delivery visuals.
- **3.5% Platform Commission** — Transparent, configurable marketplace fee deducted before seller wallet credit.
- **Real-Time GPS Tracking** — Live transporter location updates every 10 seconds via Laravel Reverb WebSockets.
- **Offline-Resilient Design** — Built for spotty 3G/4G in African urban markets with queued background sync.
- **Multi-Language** — English, French, and Swahili support (Phase 1).

---

## 📁 Repository Structure

```
wunabuy/
├── backend/                   # Laravel 13 Modular Monolith (PHP 8.3+)
│   ├── app/                   # Core Service Providers & Middleware
│   ├── Modules/               # nwidart/laravel-modules (Auth, Commerce, Payment, Delivery, etc.)
│   ├── config/                # Horizon, Reverb, Sanctum, Permissions configuration
│   ├── database/              # PostgreSQL + PostGIS Migrations & Seeders
│   └── routes/                # API v1 & Reverb WebSocket channel routes
│
├── mobile/                    # Expo React Native App (iOS & Android)
│   ├── src/
│   │   ├── components/        # Shared design system UI components
│   │   ├── features/          # Feature modules (auth, product, cart, order, delivery, chat)
│   │   ├── navigation/        # Role-based navigators (Buyer, Seller, Transporter)
│   │   ├── stores/            # Zustand client state stores
│   │   ├── i18n/              # Internationalization (EN, FR, SW)
│   │   └── services/          # Offline sync, push notifications, location
│   ├── app.json               # Expo SDK 51 configuration
│   └── package.json
│
├── staff-portal/              # React Web Staff Portal (Vite 5 + shadcn/ui + Tailwind CSS)
│   ├── src/
│   │   ├── layouts/           # Dashboard shell, sidebar, header
│   │   └── pages/             # Department dashboards (Finance, Ops, CS, Compliance, IT, Marketing)
│   ├── vite.config.ts
│   └── package.json
│
├── packages/                  # Shared Monorepo Packages
│   ├── design-tokens/         # Brand palette, typography, spacing, dark/light themes
│   ├── types/                 # Shared TypeScript API contracts & domain interfaces
│   ├── api-client/            # Axios instance with Sanctum token refresh interceptors
│   ├── realtime/              # Laravel Reverb Echo WebSocket subscriptions
│   └── utils/                 # XAF currency formatting, date, phone, geo helpers
│
├── docs/                      # Architecture & Product Specifications
│   ├── assets/                # Brand assets (logo, icons)
│   ├── Wunabuy_PRD_v1.0.md
│   ├── Wunabuy_SRS_v1.2.md
│   ├── Wunabuy_Backend_Tech_Spec_v1.0.md
│   ├── Wunabuy_Frontend_Tech_Spec_v1.0.md
│   └── Wunabuy_Backend_API_Contract_v1.0.md
│
├── .github/
│   └── workflows/             # CI/CD Pipelines
│       ├── backend-ci.yml     # PHP 8.3 + PostgreSQL + Redis test suite
│       ├── mobile-ci.yml      # TypeScript typecheck + Jest tests
│       └── staff-portal-ci.yml # Vite build + Vitest tests
│
├── pnpm-workspace.yaml        # Monorepo workspace config
├── turbo.json                 # Turborepo build cache pipeline
├── tsconfig.base.json         # Shared TypeScript base config
├── package.json               # Root monorepo scripts
├── CONTRIBUTING.md
├── LICENSE                    # MIT
└── README.md
```

---

## 🛠 Technology Stack

### Mobile App (Buyer / Seller / Transporter)

| Layer | Technology |
|---|---|
| Framework | React Native 0.74+ / Expo SDK 51 (Hermes engine) |
| Navigation | React Navigation 6.x (Native Stack, Bottom Tabs, Drawer) |
| Client State | Zustand 4.x (persisted to AsyncStorage) |
| Server State | TanStack React Query 5.x |
| Networking | Axios 1.x with Sanctum Bearer token interceptors |
| Real-Time | `laravel-echo` + `pusher-js` → Laravel Reverb WebSockets |
| Maps & GPS | `react-native-maps` + `expo-location` (background tracking) |
| Secure Storage | `react-native-keychain` (hardware-backed keystore) |
| Images | `expo-image` (BlurHash placeholders) + `expo-image-manipulator` |
| Push Notifications | `@react-native-firebase/messaging` + `notifee` |
| i18n | `i18next` + `react-i18next` (EN, FR, SW) |
| Animations | React Native Reanimated 3.x + Moti |
| Lists | `@shopify/flash-list` (recycling virtualized lists) |

### Staff Portal (Internal Operations)

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite 5 |
| Routing | TanStack Router |
| UI Components | shadcn/ui (Radix UI primitives) + Tailwind CSS 3.x |
| Data Tables | TanStack Table v8 + `@tanstack/react-virtual` |
| Charts | Recharts 2.x |
| Forms | `react-hook-form` + `zod` |

### Backend (Managed by Backend Team)

| Layer | Technology |
|---|---|
| Framework | Laravel 13 (PHP 8.3+) |
| Auth | Laravel Sanctum (opaque Bearer tokens) + TOTP MFA (Staff) |
| Database | PostgreSQL 15 + PostGIS spatial extensions |
| Queues | Laravel Horizon + Redis 7 |
| WebSockets | Laravel Reverb |
| Storage | Laravel Flysystem (S3-compatible) |
| Modules | `nwidart/laravel-modules` (10 domain modules) |
| Payments | Flutterwave (primary) + Paystack (fallback) |

---

## 🎨 Design System

| Token | Value |
|---|---|
| **Primary Color** | `#0D9488` (Emerald Teal) |
| **Accent Color** | `#F59E0B` (Radiant Amber) |
| **Heading Font** | Plus Jakarta Sans (Google Fonts) |
| **Body Font** | Inter (Google Fonts) |
| **Dark Mode** | Supported (Phase 1) |
| **Touch Targets** | Minimum 48×48dp |
| **Min Font Size** | 14sp |

### Role Color Coding

| Role | Color | Hex |
|---|---|---|
| 🛒 Buyer | Emerald Teal | `#0D9488` |
| 🏪 Seller | Sapphire Blue | `#2563EB` |
| 🚚 Transporter | Radiant Amber | `#F59E0B` |
| 👔 Staff | Indigo | `#6366F1` |

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version |
|---|---|
| Node.js | v20 LTS |
| pnpm | v9.0+ |
| PHP | v8.3+ |
| Composer | v2.6+ |
| PostgreSQL | v15+ (with PostGIS) |
| Redis | v7.0+ |

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/agemo-technologies/wunabuy.git
cd wunabuy

# 2. Install monorepo frontend dependencies
pnpm install

# 3. Build shared packages
pnpm build

# 4. Setup backend Laravel application
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
cd ..
```

### Running Development Servers

```bash
# Mobile App (Expo)
pnpm dev:mobile

# Staff Portal (Vite)
pnpm dev:staff

# Backend (Laravel)
pnpm dev:backend

# Run all type checks
pnpm type-check

# Run all tests
pnpm test

# Run all linters
pnpm lint
```

### 📱 Testing the Mobile App on Android

1. **Physical Android Device (Recommended via Expo Go)**:
   - Install **Expo Go** from the Google Play Store on your Android phone.
   - Connect your phone to the same Wi-Fi network as your development machine.
   - Run `pnpm dev:mobile` (or `npx expo start` in `mobile/`).
   - Open Expo Go on your phone and scan the QR code displayed in the terminal, or tap "Enter URL manually" and enter `exp://<YOUR_LAN_IP>:8081`.
   - *Note*: Pressing `a` in the terminal invokes `adb` to connect to an Android emulator or USB device. If you do not have Android Studio / Android SDK installed locally, `adb` will not be found; simply scan the QR code or open the Expo URL directly in Expo Go.

2. **Android Emulator / USB ADB**:
   - If using an Android emulator or USB debugging via terminal (`a`), ensure Android Studio is installed and Android SDK Platform-Tools are added to your Windows PATH:
     `C:\Users\<Username>\AppData\Local\Android\Sdk\platform-tools`

---

## 💰 Business Model

| Revenue Stream | Details |
|---|---|
| **Marketplace Commission** | 3.5% deducted from product subtotal on completed orders |
| **Delivery Fees** | Base rate + (Distance × Per-km rate) × Vehicle class multiplier |
| **Escrow Flow** | Buyer pays → Escrow holds → Delivery confirmed → 48h auto-release → Commission deducted → Seller wallet credited |

---

## 🗺 Development Roadmap

### Phase 1 — MVP (Q1 2027)

| Sprint | Weeks | Milestone |
|---|---|---|
| 1 | 1–2 | Monorepo foundation, shared packages, design system, Expo scaffold |
| 2 | 3–4 | Authentication (Phone + OTP), navigation shell, secure token storage |
| 3 | 5–6 | Buyer: Home feed, search, product detail, categories |
| 4 | 7–8 | Seller: KYC onboarding, product CRUD, inventory management |
| 5 | 9–10 | Cart, checkout, escrow payment (Flutterwave/Paystack) |
| 6 | 11–12 | Order management, status tracking, seller order processing |
| 7 | 13–14 | Delivery: transporter jobs, GPS tracking, proof of delivery |
| 8 | 15–16 | Basic 1-on-1 chat, ratings & reviews, dispute submission |
| 9 | 17–18 | Wallet & payouts, push notifications, offline sync |
| 10 | 19–20 | i18n (FR, SW), accessibility, dark mode, E2E testing, launch prep |

### Phase 2 — Social Commerce (Post-Launch)

- Short-form shoppable video feed (TikTok-style)
- In-video product tagging & checkout
- Store follow/subscribe system & group chats
- AI-driven personalized feeds & dynamic pricing

---

## 📚 Documentation

| Document | Description |
|---|---|
| [Product Requirements Document (PRD v1.9)](docs/Wunabuy_PRD_v1.0.md) | Business vision, personas, revenue model, and launch requirements |
| [Software Requirements Specification (SRS v1.9)](docs/Wunabuy_SRS_v1.2.md) | Complete functional & non-functional system requirements |
| [Frontend Technical Specification (v1.9)](docs/Wunabuy_Frontend_Tech_Spec_v1.0.md) | Mobile & web architecture, design system, state management, screen inventory |
| [Backend Technical Specification (v1.4)](docs/Wunabuy_Backend_Tech_Spec_v1.0.md) | Modular Laravel API, database schemas, WebSocket channels |
| [Backend API Contract (v1.4)](docs/Wunabuy_Backend_API_Contract_v1.0.md) | REST JSON schemas, auth endpoints, and Reverb events |


---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines, branch naming conventions, and PR review process.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ by <strong>Agemo Technologies</strong> for emerging African markets
</p>
