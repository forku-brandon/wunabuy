# Software Requirements Specification (SRS)
# Wunabuy — Multi-Sided E-Commerce & Web Staff Operations Platform

**Document Version:** 2.9 (Direct Native Phone Dialer Integration, Hardware Camera Scanner & Dynamic API Receive Points Baseline)  
**Date:** September 4, 2026  
**Status:** Approved / In Production Use  
**Companion Documents:** Wunabuy PRD v2.9, Wunabuy Frontend Tech Spec v2.9, Wunabuy Backend Tech Spec v2.9  

---

## 🚀 Key Mobile & Architecture v2.9 Specifications (September 2026)

- **Direct Native Phone Dialer Integration (`Linking.openURL('tel:...')`)**:
  - System-wide native dialer integration across all call buttons and phone number rows (`TransporterActiveTripScreen.tsx`, `TransporterJobsScreen.tsx`, `StoreDetailScreen.tsx`, `SellerOrdersScreen.tsx`, `BuyerCartScreen.tsx`, `OrderTrackingScreen.tsx`, `LiveTrackingMap.tsx`, `ProfileScreen.tsx`, `EditStoreProfileScreen.tsx`).
  - Automatic string sanitization for Cameroon (`+237`) and international E.164 formats, stripping non-numeric characters, spaces, and multi-number fallback delimiters (`/`, `,`).
  - Graceful exception handling for non-cellular devices and web/emulator environments.

- **Dynamic API Service Layer & Endpoint Receive Points**:
  - Full client-side service layer binding mobile UI actions to backend API contracts:
    - `SellerService.updateStoreProfile()` -> `POST /api/v1/seller/store/profile`
    - `AuthService.verifyOTP()` -> `POST /api/v1/auth/verify-otp`
    - `OrderService.createOrder()` -> `POST /api/v1/orders/checkout`
    - `TransporterService.updateTripStatus()` -> `PUT /api/v1/transporter/trips/:id/status`
    - `StoreService.getStoreDetails()` -> `GET /api/v1/stores/:id`
  - Strict Sanctum Bearer token authorization header propagation (`Authorization: Bearer <token>`) and standardized `{ success, data, meta }` response envelope handling.

- **Transporter Hardware Camera Scanner (`TransporterJobsScreen.tsx`, `TransporterActiveTripScreen.tsx`)**:
  - Live hardware camera viewfinder powered by `expo-camera` with real-time `onBarcodeScanned` sensor callback.
  - Flashlight torch toggle button (**Torch ON/OFF**), reticle laser viewfinder, status indicator pulse, and 3-tab mode selector (`📦 Package QR`, `💳 Driver Permit`, `🏪 Store Check-in`).

- **Seller Store Profile & Branding Architecture (`EditStoreProfileScreen.tsx`, `SellerProfileScreen.tsx`, `StoreDetailScreen.tsx`)**:
  - Full merchant profile creation and editing workspace for sellers to configure public store branding.
  - Form fields & storage: Store Name, Category, Tagline, Bio / Description, Physical Address, Landmark Directions, GPS Coordinates (Lat/Lng), Counter Operating Hours, Primary & Secondary Contact Phones, Email, Rider Pickup Instructions, Logo, and Banner Cover photos.
  - Public Store Profile (`StoreDetailScreen.tsx`): Displays store stats, ratings, landmark directions, pickup specs for buyers and drivers, catalog grid, and social/contact actions.

- **Rider Handover Code Verification System (`orders.pickup_pin`)**:
  - 5-digit security PIN generated automatically when order reaches `ready_for_pickup` status.
  - Transporters must present or verify this PIN at the merchant counter before parcel release to prevent unauthorized order pickups.

- **Delivery Fee Restructuring & Personal Courier / Self-Pickup Workflow (`BuyerCartScreen.tsx`, `CheckoutPaymentScreen.tsx`)**:
  - Restructured cart breakdown with downward delivery fee summary row (Base fee + Distance calculation).
  - 0 FCFA self-pickup option: Allows buyers to collect orders directly from store counter without delivery fees.
  - Embedded store pickup specs modal detailing store location, operating hours, and counter pickup instructions.

- **Grid-Safe Route Directions & Logistics Specs (`TransporterActiveTripScreen.tsx`, `OrderTrackingScreen.tsx`)**:
  - Transporter Active Trip: Dedicated 🟢 Merchant Collection Specs card (Landmark directions, counter hours, pickup PIN note, store contacts, `Call Merchant` + `GPS Route` actions) and 🔴 Buyer Destination Specs card (Landmark directions, drop-off note, customer contacts, `Call Customer` + `GPS Route` actions).
  - Strict layout safety ensuring zero text overflow across all screen sizes and grid containers.

- **Seller Live Camera Barcode Scanner (`AddEditProductScreen.tsx`)**:
  - Hardware camera feed via `expo-camera` supporting real-time `onBarcodeScanned` sensor callback across EAN-13, EAN-8, UPC-A, UPC-E, QR, Code 128, and Code 39 barcode formats.
  - Features hardware torch flashlight toggle button (**Torch ON/OFF**), laser reticle viewfinder, scanner status pulse indicator, and automated product catalog field population (Title, Category, Price in FCFA, Stock, Quality Tier, Description, Image).

- **Outstanding Onboarding Experience v2.8 (`OnboardingScreen.tsx`)**:
  - Redesigned 3-slider carousel tailored specifically for Cameroon / Central-West Africa:
    - **Slide 1 (100% Safe Shopping - Escrow Trust)**: *"No Worries. Your Money is Safe."* - Custom pure escrow diagram illustrating Buyer → Escrow → Seller protection with zero mobile frame clutter.
    - **Slide 2 (Track Your Delivery Live)**: *"Track Your Order Live Across Douala & Yaoundé"* - Rebranded delivery rider illustration (Wunabuy branding) with full-bleed dimmed background.
    - **Slide 3 (Shop Directly from Verified Stores)**: *"Buy Directly from Top Local Stores"* - Rebranded store discovery illustration matching Wunabuy brand palette.
  - Manual touch/swipe gesture controls (auto-slide disabled for user reading comfort), bottom active dot indicators, dynamic primary action button (`Next` / `Get Started →`), and direct `Log In` link.

- **Multi-Image Product Gallery Modal (`ProductImageGalleryModal.tsx`)**:
  - Full-screen interactive image gallery for multi-photo product listings with pinch/zoom support, image counter badge, and thumbnail navigation.

- **Monorepo Shared Package Suite (`packages/`)**:
  - `@wunabuy/design-tokens`: Emerald Teal (`#0D9488`) & Amber Gold (`#F59E0B`) palette, typography scale, 4px grid spacing, shadows, borders, themes.
  - `@wunabuy/types`: Domain model TypeScript contracts (Auth, Commerce, Order, Delivery, Chat, Wallet, KYC, API responses).
  - `@wunabuy/utils`: Localized helper utilities (`formatXAF`, `formatPhone` for +237, Haversine GPS `calculateDistance`, date/time relative formatting).

- **System Notifications & Operational Alerts Center (`NotificationsPage.tsx`, `notificationsStore.ts`, `Header.tsx`)**:
  - **Dedicated Route (`/notifications`)**: Centralized system notifications ledger with unread counter, telemetry KPI cards (Total Alerts, Unread, Critical, Payouts), category tabs (`PAYOUT`, `KYC`, `DISPUTE`, `LOGISTICS`, `HR`, `SYSTEM`), priority filters, real-time text search, and direct operational target action links.
  - **Top Navbar Bell Dropdown (`Header.tsx`)**: Interactive operational alerts dropdown with unread badge counter, direct target routing, and a prominent **"View All Notifications Center →"** button.

- **Staff Support Chat & Broadcast Center Connection (`Header.tsx`, `CommunicationsPage.tsx`)**:
  - Top header `MessageSquare` support chat button directly routes to the **Internal Staff Support Chat & Broadcast Center (`/communications`)**.

- **Strict 3-Color Brand Palette Unification**:
  - Enforced Emerald Teal (`#0D9488`) primary, Amber Gold (`#F59E0B`) accent, and Clean White / Obsidian Dark Slate (`bg-[#121824]`) secondary surface colors across all UI components, badges, sidebars, headers, and stat cards.

- **Backend Technical Specifications & API Harmony (`Wunabuy_Backend_Tech_Spec_v1.0.md`)**:
  - Updated backend technical specifications (v2.9) detailing all Staff API endpoints (`/api/v1/staff/*`), 18-flag RBAC permissions, notifications schema, payroll CNPS tax ledger, and escrow payout disbursal endpoints.

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
