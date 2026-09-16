# Software Requirements Specification (SRS)
# Wunabuy — Multi-Sided E-Commerce & Web Staff Operations Platform

**Document Version:** 4.1 (Google Play Store 2026 Compliance, Real-Time Inventory Engine, Live Financial Transactions Engine, Modular Payment Gateways)  
**Date:** September 16, 2026  
**Status:** Approved / In Production Use  
**Companion Documents:** Wunabuy PRD v4.1, Wunabuy Frontend Tech Spec v4.1, Wunabuy Backend Tech Spec v4.1, Wunabuy Backend API Contract v4.1  

---

## 🛡️ Google Play Store 2026 Developer Policy Compliance (September 16, 2026 - v4.1)

- **Android Scoped Permissions & Hardware Justifications**:
  - **Pruned Legacy Storage**: Completely eliminated `READ_EXTERNAL_STORAGE` and `WRITE_EXTERNAL_STORAGE` from `mobile/app.json`. Substituted with modern Android Photo Picker (`READ_MEDIA_IMAGES`) on Android 13+ (API 33+).
  - **Pruned Background Location**: Eradicated `ACCESS_BACKGROUND_LOCATION` declaration. Upgraded active delivery carrier tracking to foreground location service via `FOREGROUND_SERVICE` and `FOREGROUND_SERVICE_LOCATION` with prominent runtime notification disclosure (`POST_NOTIFICATIONS`).
  - **Version Code**: Explicitly added release integer `android.versionCode: 1`.

- **Mandatory In-App & Web Account Deletion Pathway**:
  - **API Contract (`DELETE /api/v1/user/account`)**:
    - Serialized database transaction revokes active Sanctum API tokens (`$user->tokens()->delete()`).
    - Anonymizes PII: replaces full name with generic marker, hashes telephone to an unroutable placeholder, anonymizes email, and scrubs saved delivery addresses (`delivery_addresses`).
    - Deactivates linked merchant store (`stores.is_active = false`) and transporter profile (`transporters.is_active = false`).
    - Creates immutable security audit record in `audit_logs` table while archiving statutory financial tax receipts per CEMAC commercial legal standards.
  - **Mobile UI**: Destructive "Delete Account & Data" action in `SettingsScreen.tsx` with high-contrast warning modal, explanation of consequences, and automatic session logout.
  - **Web URL**: Official online deletion portal registered at `https://wunabuy.com/account/delete`.

- **User-Generated Content (UGC) Moderation & Reporting**:
  - **In-App Review Reporting**: Product (`ProductDetailScreen.tsx`) and store (`StoreDetailScreen.tsx`) customer review cards provide discrete "Report Review" action triggers.
  - **Categorized Reporting Modal**: Users select from violation categories: *Offensive or Inappropriate Content*, *Spam, Advertising, or Fake Review*, *Harassment or Personal Attack*, *Misleading or False Information*.
  - **API Contract (`POST /api/v1/reviews/{id}/report`)**: Records reports in moderation queue with reporter ID, timestamp, and review metadata.

---

## 📦 Real-Time Inventory Engine, Dynamic Seller Orders & Analytics (September 16, 2026 - v4.0)

- **Real-Time Stock Locking & Harmonization**:
  - **Pre-Flight Stock Verification**: Atomic stock checks during order placement (`OrderController::store`). Insufficient inventory triggers immediate `422 INSUFFICIENT_STOCK`.
  - **Atomic Stock Decrement**: Automatic decrement of `products.quantity` upon order creation.
  - **Automated Restock Recovery**: Immediate inventory restoration (`products.quantity += item.quantity`) when an order is declined by merchant or cancelled by buyer, paired with automatic escrow refund (`EscrowService::refundEscrow`).
  - **Immediate Catalog Sync**: Seller catalog edits (`PUT /api/v1/products/{id}` and stock updates) synchronize in real time.

- **Transporter Active Trip Auto-Resolution**:
  - **State Loss Recovery**: Backend `TransporterController` auto-resolves active order and current trip stage for drivers upon app restart or screen remount, eliminating 404 stage update errors.
  - **Purge of Fake Stubs**: Eradicated all dummy PIN autofills and static counter badges.

---

## 💳 Live Financial Transactions Engine, Escrow Safety & Modular Gateways (September 16, 2026 - v3.9)

- **Real-Time Financial Transactions & Mathematical Integrity**:
  - **Atomic Dual-Entry Ledger**: All wallet mutations (deposits, purchases, escrow locks, deliveries, withdrawals, and dispute adjudications) execute within serialized PostgreSQL database transactions with row-level locks (`lockForUpdate()`), preventing race conditions, balance inconsistencies, and double debits.
  - **Real-Time Balance Recalculation**:
    - **Buyer Checkout**: Immediate buyer wallet deduction with balance floor check (`balance >= total_amount`); simultaneously locks equivalent total in escrow ledger (`escrows.amount`).
    - **Transporter Verification & Delivery**: Upon verified delivery completion, escrow funds are unlocked and mathematically apportioned in real-time:
      - Platform Commission: Exactly 3.5% of product subtotal credited to platform revenue account.
      - Transporter Delivery Fee: 100% of delivery fee credited to transporter wallet.
      - Seller Net Payout: `Subtotal - 3.5% Commission` credited to seller store wallet.
    - **Deposits & Top-Ups**: Wallet balance incremented immediately upon gateway payment confirmation with fee accounting.
    - **Withdrawals / Payouts**: Real-time balance debit with telecom operator fee calculations (1.5% fee capped at 5,000 XAF with 25 XAF minimum).

- **Modular Payment Gateway Architecture & Production Pluggability**:
  - **Standardized Gateway Contract (`PaymentGatewayInterface`)**:
    - Defines unified methods: `collect(array $payload)`, `disburse(array $payload)`, `verify(string $reference)`, `parseWebhook(Request $request)`.
  - **Modular Gateway Providers (`app/Services/Gateways/`)**:
    - `MtnMomoGateway`: Integrates MTN MoMo API v1.0 specifications (`POST /collection/v1_0/requesttopay`, `POST /disbursement/v1_0/transfer`) with OAuth Bearer token caching and X-Reference-Id idempotency headers.
    - `OrangeMoneyGateway`: Implements Orange Money WebPay and MP-Payment REST APIs with OAuth2 basic client authorization.
    - `DirectEscrowGateway`: In-memory and internal ledger gateway for direct wallet-to-escrow operations.
    - `PaymentGatewayFactory`: Dynamic resolution of active gateway based on provider string (`mtn_momo`, `orange_money`, `direct_escrow`), reading settings from `config/payment.php`.
  - **Plug-and-Play Production Slots**:
    - Explicit environment variable slots defined in `.env.example` and `config/payment.php` (`MTN_MOMO_USER_ID`, `MTN_MOMO_API_KEY`, `MTN_MOMO_SUBSCRIPTION_KEY`, `ORANGE_MONEY_CLIENT_ID`, `ORANGE_MONEY_CLIENT_SECRET`, `ORANGE_MONEY_MERCHANT_KEY`).
    - Gateway drivers automatically operate in robust **Sandbox Simulation Mode** until production API licenses and credentials are provided, permitting full end-to-end testing without external API rejections.
  - **Phone Number Operator Resolution**:
    - Automatic operator prefix resolution for Cameroon telecoms: MTN Cameroon (`+237 67X`, `68X`, `650`-`654`) and Orange Cameroon (`+237 69X`, `655`-`659`).

- **Frontend & Mobile Real-Time Harmony (`walletService.ts`, `CheckoutPaymentScreen.tsx`)**:
  - **Dedicated Wallet Operations**: Full typed API client for wallet metrics (`getWallet()`), real-time fee calculation (`calculateFees(amount, provider)`), deposit initiation (`deposit(amount, provider, phone)`), withdrawal requests (`withdraw(amount, provider, phone)`), and direct escrow checkout (`payWithEscrow(orderId)`).
  - **Instant UI Response**: Dynamic fee preview display, balance warnings, and zero-latency transaction updates upon successful payment processing.

---

## 🪪 KYC Document Inspection, Dispute Photo Evidence & Permanent Media Acceleration (September 15, 2026 - v3.8)

- **Permanent Local Media Acceleration & Zero-External CDN Engine**:
  - **Self-Hosted Static Media Infrastructure**: Replaced all external Unsplash CDN dependencies across the catalog with locally hosted, optimized assets stored under `backend/public/uploads/` (`products`, `stores`, `adverts`, `avatars`, `kyc`, `disputes`).
  - **High-Efficiency WebP Pipeline**: Automated GD compression pipeline converting catalog photography into compact, retina-ready WebP files (4KB–18KB, 500–600px) with automated vector graphics fallback for missing assets, reducing network payload by over 96%.
  - **Immutable Caching Headers**: Implemented `/uploads/{folder}/{filename}` static delivery route with `Cache-Control: public, max-age=31536000, immutable` and ETag validation, reducing repeat image retrieval latency to <8ms.
  - **Hardware-Accelerated Mobile Image Engine (`OptimizedImage.tsx`)**: Upgraded mobile client from default React Native `<Image>` to `expo-image` with `cachePolicy="memory-disk"`, utilizing native Glide (Android) and SDWebImage (iOS) drivers for instant 0ms cached re-renders and local bundled asset fallbacks during offline state.
  - **Node Heap Optimization**: Configured `NODE_OPTIONS=--max-old-space-size=8192` across Expo start scripts to prevent bundler heap exhaustion.

- **Staff Portal Complete KYC Document Inspection Suite (`KYCPage.tsx`, `DocumentInspectionCard.tsx`)**:
  - **Dual Applicant Flow Verification**:
    - **Store Merchants**: 4-credential verification card grid displaying Cameroon National ID (CNI Front), CNI Back (Date of issue & Signature), Physical Storefront Signage & Stock, and Business Registration Certificate (RCCM / Tax Notice).
    - **Transporters & Drivers**: 4-credential verification card grid displaying Driver National CNI, Driver's License (*Permis de Conduire*), Vehicle & License Plate Photo (with vehicle type and plate number metadata), and Vehicle Insurance (*Attestation d'Assurance*).
  - **Compliance Status Indicators**: Visual status tags (`Uploaded` in emerald vs `Missing` in amber) with direct hover inspection overlays (*Inspect*, *Open in New Tab*).
  - **One-Click Compliance Presets**: Instant chips to autofill common audit rejections (*"CNI photo blurry"*, *"Storefront name mismatch"*, *"RCCM invalid or missing"*, *"Expired driver license"*, *"Expired vehicle insurance"*).

- **Staff Portal Escrow Dispute Photographic Evidence Gallery (`DisputesPage.tsx`)**:
  - **Visual Photographic Evidence**: Responsive grid displaying all buyer-uploaded package, delivery, and product damage photos.
  - **Disputed Order Itemization**: Real-time table displaying the exact items in the disputed order (thumbnail, product name, quantity, unit price, and subtotal) so arbitrators can verify claims against specific purchase lines.
  - **Binding Legal Rulings**: Supports `BUYER_REFUND` (100% return to buyer wallet), `SELLER_RELEASE` (100% payout to merchant), or `SPLIT_50_50` partial disbursals with atomic ledger updates.
  - **Arbitration Presets**: One-click autofill for common arbitration legal rationales with immutable audit logging.

- **High-Precision Image Lightbox (`ImageLightbox.tsx`)**:
  - **90° Clockwise Rotation (`RotateCw`)**: Solves orientation issues with smartphone camera captures of CNI cards, licenses, and receipts.
  - **Full Resolution Zoom (`ZoomIn` / `ZoomOut` / `RefreshCcw`)**: Scale factor up to 400% with view reset to inspect microprint, stamps, and signatures.
  - **Direct High-Res Download (`Download`)**: Officers can download copies locally for legal compliance records.
  - **Keyboard Shortcut**: `Escape` key listener closes the lightbox instantly.

- **Google Play Store Legal Compliance & Onboarding Consent**:
  - **Mandatory Terms Acceptance (`RegisterScreen.tsx`)**: Integrated Terms of Service & Privacy Policy agreement into onboarding signup.
  - **Bilingual OHADA Compliance**: Formal legal clauses governing digital commerce, wallet escrow custody, dispute arbitration, and personal data protection in compliance with Google Play Developer policies.

- **Automated Credential & Dispute Evidence Upload Pipeline**:
  - Mobile services (`kycService.ts`, `disputesService.ts`, `ordersService.ts`) automatically upload local camera/gallery photos (`file:///...`) to isolated server repositories (`/api/v1/upload/image` under folders `kyc` and `disputes`) before transmitting Store KYC, Transporter KYC, or Escrow Dispute payloads.


- **Universal Avatar & Profile Picture Architecture Across Web, Mobile & Backend**:
  - **Web Staff Portal Upload (`StaffProfilePage.tsx`)**: Instant 0ms optimistic local preview using HTML5 `FileReader` (`readAsDataURL`), responsive `Loader2` spinner state during active server transport, seamless upload to `POST /api/v1/staff/profile/avatar`, fallback recovery via `onError` image routing to high-fidelity Unsplash default, and immediate session updates in `staffAuthStore.ts` with clean `/uploads/avatars/` relative path normalization.
  - **Mobile Expo React Native App (`Avatar.tsx`, `authService.ts`, Profile Screens)**: Dynamic avatar image picker integration supporting native device file URIs (`Platform.OS === 'android' ? imageUri : imageUri.replace('file://', '')`) with automatic MIME type detection (`image/jpeg`, `image/png`, `image/webp`) and multipart form data transport to `POST /api/v1/user/avatar`. Supports general store branding, banners, and review photos via `POST /api/v1/upload/image`.
  - **Dynamic URL Normalization Engine (`normalizeMobileImageUrl`)**: Intelligently inspects image URLs on physical devices; dynamically strips `localhost:8000` / `127.0.0.1:8000` and relative storage prefixes (`/uploads/avatars/...`, `/storage/...`), prepending the device's reachable active API base server host (`API_BASE_URL`). Prevents broken image icons across all Android and iOS hardware form factors.
  - **Vite Dev Server Reverse Proxy (`vite.config.ts`)**: Configured reverse proxy routes for `/uploads` and `/storage` targeting `http://127.0.0.1:8000`, guaranteeing zero-CORS same-origin static file serving across all local LAN Wi-Fi IP addresses without browser security blocks.
  - **Laravel Backend Media Controller (`AuthController.php`, `StaffPortalController.php`)**: Multi-part and base64 data-URI payload ingestion, automated directory generation (`public/uploads/avatars/`), cryptographically secure filename generation, dynamic host resolution (`$request->getSchemeAndHttpHost()`), and dual URL response returns (`avatar_url` absolute URL + `relative_url`).

- **Staff Portal Enterprise UI/UX Redesign & Marketing Adverts Management Engine**:
  - **Enterprise Layout & Typography Overhaul**: Redesigned navigation, streamlined sidebar hierarchy, unified slate palettes, decluttered inactive legacy modules, and modernized telemetry stat cards (`StatCard.tsx`, `DataTable.tsx`, `Card.tsx`). Top navbar includes persistent notifications drawer routing (`/notifications`) and direct support broadcast center (`/communications`).
  - **Live Marketing Adverts & Commercial Partnerships Engine (`MarketingAdvertsPage.tsx`)**:
    - Complete CRUD management for platform advertisements and featured merchant partnerships (`GET/POST /api/v1/staff/adverts`, `GET/PUT/DELETE /api/v1/staff/adverts/{id}`).
    - Configurable badge text, custom badge hex color picker, discount percentage tags, custom Ionicons identifier mapping, sorting priority weight, and active toggle state.
    - Real-time synchronization to mobile discovery feeds (`HomeScreen.tsx`, `PartnersCarousel`, promotional discount cards), permanently replacing static mock banners.
  - **Real-Time KYC & Dispute Polling**: Hardened continuous polling against `/api/v1/staff/kyc/queue` and `/api/v1/staff/disputes` with instant dual-control modal confirmations.

- **End-to-End Real-Time Order Lifecycle & Escrow Settlement Engine**:
  - **Synchronized 5-Phase Transaction Lifecycle**:
    1. **Catalog Publishing**: Verified merchant publishes product with pricing and stock inventory.
    2. **Escrow Checkout**: Buyer places order via In-App Wallet or Mobile Money (MTN MoMo `*126#` / Orange Money `#150*50#`); funds atomically lock into `balance_escrow_locked`.
    3. **Store Fulfillment**: Merchant accepts order and packages items for pickup.
    4. **Logistics Dispatch & Chain of Custody**: Transporter claims dispatch job, verifies encrypted HMAC-SHA256 parcel QR code tag, and initiates live GPS tracking.
    5. **Receipt Confirmation & Escrow Release**: Buyer confirms receipt via delivery OTP or digital signature; `EscrowService.php` automatically deducts 3.5% marketplace commission, instantly releases net sales to the seller wallet, credits the delivery fee to the transporter wallet, and transitions order status to `completed`.
  - **Tab State Synchronization**: Synchronized Buyer and Seller `Completed` order tabs filtering strictly by `status === 'completed'`.
  - **React Key & FlatList Stabilization**: Resolved duplicate key collisions by generating unique job identifiers and hardening `keyExtractor` across transporter dispatch feeds.

- **Authentication & Wallet Ledger Hardening**:
  - **Multi-Role Session Protection**: Developer and administrative accounts are protected during role transitions, preventing session termination and token invalidation on role switch.
  - **Registration Security Baseline**: Enforced 100 FCFA registration reward with non-withdrawable security constraints and clean, zero-fake-transaction ledger across all newly registered accounts.

---

## 🛡️ Zero-Demo RBAC, Strict IDOR Protections & Store Catalog Architecture (September 10, 2026 - v3.5)

- **Strict Role-Based Access Control (RBAC) & Anti-IDOR Enforcement**:
  - **Financial Escrow Protection**: Order completion (`POST /api/v1/seller/orders/:id/complete`) strictly validates that the caller owns the fulfilling store (`$order->store_id === $sellerUser->store->id`). Receipt confirmation (`POST /api/v1/orders/:id/confirm`) strictly verifies caller is the purchasing buyer (`$order->customer_id === $user->id`).
  - **Zero Database Fallbacks (`::first()`)**: Completely eliminated all unsafe `Model::first()` fallbacks across `CommerceController`, `OrderController`, `SellerController`, `TransporterController`, `AuthController`, and `StaffPortalController`. Non-existent records or unauthenticated inputs strictly return HTTP 404 NOT_FOUND or HTTP 401/403.
  - **Order Mutation Ownership**: Order cancellation and disputes strictly verify caller authorization (customer or store owner). Unauthorized callers receive HTTP 403 FORBIDDEN.
  - **Catalog Listing Ownership**: Product creation, updates, status toggles, stock adjustments, and deletion strictly require authenticated seller store ownership.
  - **Transporter Job Integrity**: Transporters can only accept unassigned jobs matching exact IDs. Active trip queries return only trips assigned to the requesting transporter, eliminating cross-user data leakage.
  - **Header Spoofing Prevention**: Dev headers (`X-User-Id`, `X-Dev-User`) are strictly ignored outside `local` and `testing` environments.

- **Legitimate Seller Catalog Affiliation & Zero Fake Stores**:
  - All fake stores (*Marché Central Fresh & Organics*, *Akwa Super Store*, *Douala Glam*, *K-Town Fashion*) and fake users (*Mama Helene*, *Amadou Bello*, *Fatima Njoya*, *Cedric Tagne*) permanently purged from PostgreSQL.
  - All catalog products (25 items) affiliated to **Brandon Official Tech Store** (`01a0872b-a556-7183-b186-9bcec9d61ca4`, user: **Forku Brandon** `+237682656287`).
  - Mobile Seller Dashboard hydrates products and active orders on startup via `Promise.all([SellerService.getStoreProducts(), SellerService.getFulfillmentOrders(), ...])`, immediately displaying the merchant's 25 products and live stock counters.

---

## 🚀 Zero-Demo Profile Architecture, Token Auto-Recovery & Edge-to-Edge System Specifications (September 10, 2026 - v3.4)

- **Zero-Demo Profile Architecture Across All 3 Workspaces**:
  - **Buyer Profile (`ProfileScreen.tsx`)**: User identity (phone number, full name, avatar) loads dynamically from live authenticated user session. All order badges (`Pending`, `Processing`, `Delivered`, `Completed`) query real-time order counts from PostgreSQL. Unconfigured default addresses or empty transaction histories display clean, user-friendly empty states without static mock constants.
  - **Seller Store Profile (`SellerProfileScreen.tsx` & `EditStoreProfileScreen.tsx`)**: Real-time store branding, physical address, landmark directions, GPS coordinates, operating hours, and rider pickup instructions. If store is newly created or unconfigured, fields remain blank to prompt legitimate merchant onboarding, completely eliminating hardcoded demo store names or fake revenue metrics (`500,000 FCFA`).
  - **Transporter Driver Profile (`TransporterProfileScreen.tsx`)**: Driver vehicle information (vehicle type, license plate, driver license number, carte grise, and insurance) is managed via `GET /api/v1/transporter/profile` and `POST /api/v1/transporter/profile`. Default unconfigured states present clean placeholder prompts. Completed delivery counts and earnings strictly reflect verified jobs.

- **Sanctum Token Auto-Recovery & Developer Session Self-Healing**:
  - **Auto-Refresh Route (`POST /api/v1/auth/refresh`)**: Revokes existing access tokens and mints a fresh Sanctum Bearer token along with eager-loaded user permissions and wallet balances.
  - **Developer Session Auto-Minting (`POST /api/v1/auth/dev-session`)**: In local development (`APP_ENV=local`), the mobile client automatically recovers developer testing sessions for authorized accounts without prompting manual re-login on token expiry.
  - **Client Interceptor Self-Healing (`apiClient.ts`)**: Synchronizes tokens between `SecureTokenService` and `useAuthStore`, passes developer tracking headers (`X-User-Id`), and on HTTP 401 executes an instant in-flight recovery, eliminating console warning loops.

- **Android 15 Edge-to-Edge Navigation Compliance (`App.tsx`)**:
  - Removed deprecated `NavigationBar.setBackgroundColorAsync` invocation, fully conforming to modern Android edge-to-edge transparent navigation bar requirements.
  - Retained dynamic button contrast adaptation via `NavigationBar.setButtonStyleAsync(isDark ? 'light' : 'dark')`.

- **Completed Order Lifecycle & Tab Synchronization**:
  - Synchronized order lifecycle state transitions across all 3 roles: Buyer receipt confirmation (`POST /api/v1/orders/:id/confirm`) automatically marks order `status: 'completed'`, releases escrow balances, credits seller and transporter wallets, and updates `completed_at` timestamps.
  - Buyer and Seller `Completed` order tabs filter strictly by `status === 'completed'`, ensuring all completed transactions appear immediately in their respective tabs.

---

## 🌐 Enterprise Backend Architecture & Live Full-Stack Wiring Specifications (September 8, 2026 - v3.2)

- **Laravel 13 & PostgreSQL 18 Production Backend Architecture**:
  - Engineered 23 relational database tables across 15 migrations (`audit_logs`, `staff_tasks`, `wallets`, `wallet_transactions`, `orders`, `order_items`, `transporters`, `disputes`, `seller_kyc_submissions`, `transporter_kyc_submissions`, `addresses`, `reviews`, `notifications`, etc.).
  - Primary keys standard: RFC 4122 UUID primary keys across all relational entities.

- **Dual-Entry Escrow & Financial Settlement Engine (`EscrowService.php`)**:
  - Atomic database transactions for checkout escrow fund locks (`balance_available` -> `balance_escrow_locked`).
  - Automated escrow release on buyer delivery receipt confirmation: automatically deducts 3.5% platform commission, credits net sales to seller wallet, credits delivery fee to transporter, and updates payment state to `released`.
  - Formal dispute filing freezes funds (`payment_status: frozen`, `status: disputed`).
  - Compliance arbitration engine enforces three legally binding rulings: `BUYER_REFUND` (100% principal refunded to customer), `SELLER_RELEASE` (released to store minus commission), or `SPLIT_50_50` (50% refund, 50% seller credit).

- **Cameroon Fintech Integration & Mobile Money (`PaymentService.php`)**:
  - Realistic carrier USSD push simulations (`*126#` for MTN MoMo, `#150*50#` for Orange Money).
  - Dual-control security PIN authorization for financial payouts above risk thresholds (>= 500,000 XAF).
  - Instant wallet top-up (`POST /api/v1/wallet/fund`) and withdrawal cash-out (`POST /api/v1/wallet/withdraw`).

- **Spatial Geodesic Logistics & Chain of Custody (`LogisticsService.php`)**:
  - Pure Haversine spherical trigonometric distance computation eliminating external binary dependencies.
  - Dynamic delivery fee computation by vehicle category (`BIKE` 1.0x, `CAR` 1.4x, `VAN` 2.0x).
  - HMAC-SHA256 cryptographically signed parcel custody QR tags (`WB-PARCEL:...`) preventing unauthorized or fraudulent parcel handovers.
  - Background driver GPS breadcrumb telemetry (`POST /api/v1/transporter/location`) and real-time dispatch overrides.

- **Zero-Code Hosting & Environment Architecture**:
  - Centralized environment resolution in `mobile/src/config/env.ts` auto-detecting Android Emulator (`10.0.2.2:8000`), iOS Simulator / Web (`localhost:8000`), LAN Wi-Fi (`192.168.x.x`), and Cloud Production (`api.wunabuy.com`).
  - Web Staff Portal dynamic resolution supporting `VITE_API_URL` and `VITE_API_BASE_URL`.
  - Environment-driven CORS in `backend/config/cors.php` via `CORS_ALLOWED_ORIGINS`.

- **Live End-to-End Frontend Wiring**:
  - Mobile authentication (`LoginScreen.tsx` & `VerifyOTPScreen.tsx`) wired to live `POST /api/v1/auth/otp/send` and `verify`, persisting Sanctum Bearer tokens in hardware-backed `SecureTokenService` and hydrating `useAuthStore`.
  - Cart checkout (`CheckoutPaymentScreen.tsx`) wired to `OrdersService.createOrder` and `payCheckout` (`POST /api/v1/checkout/pay`).
  - Order tracking and receipt confirmation (`BuyerOrdersScreen.tsx`, `OrderTrackingScreen.tsx`) wired to live escrow release and dispute freeze endpoints.
  - Mobile wallet (`WalletScreen.tsx`) wired to live balance, transaction ledger, and MTN MoMo / Orange Money top-ups.
  - Web Staff Portal (`DisputesPage.tsx`, `FinancialsPage.tsx`, `KYCPage.tsx`) wired to live `/api/v1/staff/*` endpoints with dual-control security PIN authorization.

---

## 🔒 Key Staff Operations Portal OWASP Top 10:2025 Specifications (September 7, 2026 - v3.1)

- **Route & Action Access Control Guards (`PermissionGuard.tsx`)**:
  - Route-level access enforcement across administrative modules (`/financials`, `/hr`, `/users`, `/settings`, `/kyc`, `/disputes`).
  - Displays authorized 403 Forbidden screen upon access violation and logs security telemetry. Restricts persona switching strictly to Super Admins (`switch_staff_personas`).

- **Security Misconfiguration Baseline (`index.html`)**:
  - Implemented strict Content Security Policy (`CSP`), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy`.

- **Supply Chain Integrity Module (`securitySupplyChain.ts`)**:
  - Dynamic validator verifying asset origin domains against corporate whitelists and blocking untrusted dynamic script injections.

- **Encrypted Local Storage, HMAC Checksums & 15-Minute Session Idle Timeout (`securityCrypto.ts`, `useSessionTimeout.ts`)**:
  - Cryptographic encryption of local storage state payloads with SHA-256 HMAC checksums.
  - Automatic 15-minute idle session auto-logout with modal warning and session teardown. PII data masking (`maskPhone`, `maskEmail`, `maskEmployeeId`).

- **DOM-Safe Input Sanitization & XSS Stripping (`securitySanitizer.ts`)**:
  - HTML entity escaping and stripping of malicious script tags, iframes, and inline event handlers (`onload`, `onerror`, `onclick`) across search inputs and forms.

- **Dual-Control Authorization & Action Throttling (`DualControlConfirmModal.tsx`, `rateLimiter.ts`)**:
  - Mandatory dual-control modal requiring confirmation keywords and justification notes for high-risk actions (role deletions, payout disbursals, account suspensions).
  - Rate limiting utility (`rateLimiter.ts`) throttling action frequency.

- **Brute-Force Lockout Engine**:
  - 5 consecutive failed login/OTP attempts trigger a 15-minute account lockout with `AUTH_BRUTE_FORCE_LOCKOUT` audit logging.

- **Centralized Security Audit Logger (`securityLogger.ts`)**:
  - Structured security telemetry logger recording events (`INFO`, `WARNING`, `CRITICAL`) with client IP, timestamp, user context, and action codes.

- **Enterprise React Error Boundary (`ErrorBoundary.tsx`)**:
  - React Error Boundary wrapping route trees, masking raw stack traces, and presenting single-click session recovery UI.

---

## 🚀 Key Mobile & Architecture v3.0 Specifications (September 5, 2026)

- **Interactive Numeric Quantity Input System (`QuantityInputModal.tsx`)**:
  - Replaced legacy stepper buttons (+/-) with direct numeric popups across Buyer & Seller applications (Alibaba/Aliexpress UX style).
  - Modal includes item details, direct numerical keypad entry, quick preset buttons (`+1`, `+5`, `+10`, `+20`, `+50`), stock limit validation (`max_quantity`), and instant cart/inventory updates.

- **2D Tabular Store Pickup & Location Component (`StorePickupTable.tsx`)**:
  - 2-column specifications grid (`SPECIFICATION` | `DETAILS & DIRECTIONS`) embedded in `BuyerCartScreen.tsx` and `CheckoutPaymentScreen.tsx`.
  - Bidirectional scrolling (vertical up/down + horizontal left/right with strict `140px`/`340px` column width bounds) ensuring zero layout clipping or horizontal overflow.
  - Native telephone call integration (`Linking.openURL('tel:...')`) for store phone numbers.

- **Live Hardware Camera Seller Store QR & PIN Scanner Modal (`SellerQRScannerModal.tsx`)**:
  - Hardware camera feed via `expo-camera` supporting real-time `onBarcodeScanned` sensor callback (`CameraView` & `useCameraPermissions`).
  - Torch flashlight toggle button (**Torch ON/OFF**), reticle laser viewfinder animation, status indicator pulse, and instant escrow handover release upon code scanning or 5-digit PIN entry.

- **Printable Encrypted Parcel QR Shipping Tag Generator (`PrintableParcelQRModal.tsx`)**:
  - Encrypted QR shipping barcode payload (`ENCRYPTED QR • RIDER SCANNER ONLY 🔒`) generated for sellers upon clicking "Ready to Pick Up".
  - Centered Wunabuy logo emblem overlay inside the QR code for brand integrity.
  - Security enhancement: Plaintext PINs (`#84920`) and order numbers removed from printed tags; readable exclusively by assigned transporter hardware camera scanners.

- **Transporter Camera Scanner Code Comparison & Wrong Item Matching (`TransporterActiveTripScreen.tsx`)**:
  - Real-time scanner comparison validating scanned package QR tags against assigned pickup trips.
  - Displays instant visual & haptic status feedback (`✅ PARCEL MATCH CONFIRMED!` vs `❌ WRONG ITEM WARNING!`).

- **Monorepo Utils Stability**:
  - Fixed Babel block-scoping duplicate identifier compilation error in `@wunabuy/utils` (`normalizePhone`).

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
- **STF-007 (A01 Access Control):** Every administrative view (`/financials`, `/hr`, `/users`, `/settings`, `/kyc`, `/disputes`) SHALL be guarded by `PermissionGuard.tsx` and render a 403 Forbidden screen upon unauthorized navigation.
- **STF-008 (A02 Security Configuration):** The Web Staff Portal SHALL specify HTTP security headers (`CSP`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`) in `index.html`.
- **STF-009 (A03 Supply Chain):** External script execution and dynamic module loading SHALL be validated against a corporate domain whitelist via `securitySupplyChain.ts`.
- **STF-010 (A04 Cryptographic Storage):** Client-side state persistence SHALL encrypt data with HMAC-SHA256 checksum integrity verification and automatically log out idle users after 15 minutes (`useSessionTimeout.ts`).
- **STF-011 (A05 Injection Prevention):** User input and search strings SHALL be sanitized for HTML entities and malicious DOM scripts via `securitySanitizer.ts` prior to rendering.
- **STF-012 (A06 Dual Control & Throttling):** High-risk actions (payout disbursals, role deletions, account terminations) SHALL require dual-control authorization confirmation with mandatory justification notes (`DualControlConfirmModal.tsx`) and rate limiting (`rateLimiter.ts`).
- **STF-013 (A07 Authentication Hardening):** The authentication engine SHALL enforce a 15-minute lockout after 5 consecutive failed login or OTP validation attempts.
- **STF-014 (A08 Data Integrity):** Frontend state mutations SHALL recalculate SHA-256 HMAC state checksums (`generateStateChecksum`) to prevent local storage tampering.
- **STF-015 (A09 Security Telemetry):** Security events and clearance violations SHALL automatically generate structured telemetry entries sent to `securityLogger.ts`.
- **STF-016 (A10 Error Handling):** Unhandled runtime exceptions SHALL be intercepted by `ErrorBoundary.tsx`, presenting user-friendly recovery UI without exposing internal stack traces.
