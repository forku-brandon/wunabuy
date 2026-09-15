# Wunabuy Mobile App

Enterprise React Native application for Wunabuy (Expo SDK 51+, React Native 0.74+, TypeScript 5.4) supporting three distinct role workspaces with dynamic key-based isolation:

- **🛒 Buyer Workspace** — Discovery feed, auto-sliding hero & partners carousels, expandable product quick-views, full-text category filtering, 48-hour escrow protection, in-app mobile wallet (MTN MoMo & Orange Money), live search, dedicated `TransactionHistoryScreen.tsx` with date filter pills (`7 Days`, `15 Days`, `1 Month`, `Custom Date`), PDF statement export, live GPS delivery tracking, and rich profile tools (Followed Stores, Favorites, Browsing Footprints, Disputes/Refunds).
- **🏪 Seller (Store Owner) Workspace** — Modern Merchant Dashboard with AppBar same-line actions (`☰`, `🔔`, `🔲`, `🛒`), Merchant Subtitle Stack, Emerald Teal balance card with 1-tap store account ID copy, Top Services 4x2 grid, Auto-Slide Sales Tips & Merchant Growth Carousel Presenter, Interactive Store Products Catalog with stock steppers and quick-view expand modal, 2-Hour Auto-Cancel Fulfillment Queue (`SellerOrdersScreen`), Dual Dispatch Modals, Store Wallet & MoMo Payout Engine, dedicated `StoreAnalyticsScreen.tsx` (revenue telemetry, sales velocity graph, KPIs, top products table), `AddEditProductScreen.tsx` with `BarcodeScannerModal` (EAN-13 presets), and dedicated `SellerProfileScreen`.
- **🏍️ Transport Provider Workspace** — Driver onboarding welcome carousel, 4-stage Driver KYC form, nearby delivery job offers with distance sorting and QR/Barcode Scanner Modal (`QRScannerModal`), live trip route navigation, and driver earnings ledger.

---

---

## 🚀 Getting Started & Environment Configuration

### 1. Environment Configuration (`.env`)
The app features centralized, dynamic environment resolution via [`src/config/env.ts`](file:///c:/Users/HP/Desktop/wunabuy%20mobile%20project/wunabuy/mobile/src/config/env.ts):

```env
# For Local Dev (Web / iOS Simulator): http://localhost:8000/api/v1
# For Local Dev (Android Emulator):    http://10.0.2.2:8000/api/v1
# For Physical Device (LAN Wi-Fi):     http://192.168.x.x:8000/api/v1
# For Production:                      https://api.wunabuy.com/api/v1
EXPO_PUBLIC_API_URL=http://localhost:8000/api/v1

EXPO_PUBLIC_REVERB_APP_KEY=wunabuy_reverb_key
EXPO_PUBLIC_REVERB_HOST=localhost
EXPO_PUBLIC_REVERB_PORT=8080
EXPO_PUBLIC_REVERB_SCHEME=http
```

### 2. Live Backend Integration & Self-Healing Architecture
- **Permanent Media Localization & Hardware-Accelerated Caching (`expo-image`, `OptimizedImage.tsx`):** Complete elimination of external CDN latency. All catalog products, promotional banners, and store logos are served directly from the high-efficiency local WebP repository (`/uploads/...`) with native hardware acceleration (Glide on Android, SDWebImage on iOS) and `cachePolicy="memory-disk"`, guaranteeing instant 0ms cached re-renders and local bundled asset fallbacks during offline state.
- **Google Play Store Legal & Regulatory Compliance (`RegisterScreen.tsx`, `TermsModal.tsx`):** Mandatory Terms of Service & Privacy Policy acceptance agreement integrated into onboarding signup. Features full bilingual (EN/FR) statutory clauses governing digital commerce, wallet escrow custody, and personal data protection in compliance with Google Play Developer policies and OHADA commercial laws.
- **Automated Credential & Dispute Evidence Uploads (`kycService.ts`, `disputesService.ts`, `ordersService.ts`):** Automatic background conversion and upload of local camera/gallery photos (`file:///...`) to isolated server repositories (`/api/v1/upload/image` under folders `kyc` and `disputes`) before transmitting Store KYC, Transporter KYC, or Escrow Dispute payloads.
- **Unified Media Normalization & Image Resilience (`src/utils/imageUtils.ts`):** Centralized image resolution pipeline (`resolveProductImage`, `resolveStoreLogo`, `resolveAvatarUrl`) that seamlessly sanitizes media URLs. If an image path is relative (`/uploads/...`, `/storage/...`) or contains `localhost:8000` / `127.0.0.1:8000`, it dynamically rewrites it to use the reachable mobile API host (`API_BASE_URL`). Prevents broken image icons across physical devices over LAN Wi-Fi.
- **Universal Avatar & Store Logo Upload:** Full photo picker integration in `EditProfileModal.tsx` (Buyer), `EditStoreProfileScreen.tsx` (Seller Store Logo), and `TransporterProfileScreen.tsx` (Driver). Handles native file URIs (`imageUri.replace('file://', '')`), automatic MIME-type detection, and multi-part upload to `POST /api/v1/user/avatar` and `POST /api/v1/upload/image`.
- **Dynamic Marketing Adverts & Platform Partners:** `HomeScreen.tsx` hydrates `HeroCarousel`, promotional discount cards, and `PartnersCarousel` directly from `GET /api/v1/adverts` in real time, synchronizing seamlessly with campaigns published from the Staff Operations Portal.
- **Auth Flow & Session Self-Healing:** Dedicated **6-Digit PIN Authentication** (`PinLoginScreen.tsx` & `RegisterScreen.tsx`) communicating directly with `POST /api/v1/auth/login-pin` & `POST /api/v1/auth/register`. Zero SMS carrier dependency for reliable, instant login. Sanctum Bearer tokens are persisted securely in `SecureTokenService`, and dynamic permissions & eager-loaded user attributes (wallet, address, role profile) are hydrated in `useAuthStore`.
- **Token Auto-Refresh & Dev Session Minting:** `apiClient.ts` intercepts HTTP 401 unauthenticated errors and automatically issues a refresh via `POST /api/v1/auth/refresh`. In local development, it mints a fresh developer testing token (`POST /api/v1/auth/dev-session`), preventing repetitive 401 console loops without kicking the developer to the login screen.
- **Seller Dashboard Live Hydration:** `SellerDashboardScreen.tsx` loads `SellerService.getStoreProducts()` and `SellerService.getFulfillmentOrders()` in parallel on startup, ensuring the merchant's 25 products and live orders immediately render without requiring navigation to sub-tabs.
- **Anti-IDOR & Zero-Demo Profile Architecture:** Completely purged all static mock data (fake store names, dummy revenues like 500,000 FCFA, fake license plates, hardcoded store IDs). Buyer, Seller, and Transporter profiles render clean empty default states ready for user input, while order and catalog actions enforce strict backend ownership checks.
- **Android 15 Edge-to-Edge UI Compliance:** Fully conforms to modern Android edge-to-edge transparent navigation window specifications without deprecated background color calls.
- **Checkout & Escrow:** `CheckoutPaymentScreen.tsx` submits orders to `POST /api/v1/orders` and initiates MoMo USSD payment push (`POST /api/v1/checkout/pay`).
- **Orders & Tracking:** `BuyerOrdersScreen.tsx` & `OrderTrackingScreen.tsx` execute live delivery confirmations (`confirmReceipt` -> escrow release with 3.5% commission split) and dispute freezes (`dispute`).
- **Wallet & Ledger:** `WalletScreen.tsx` fetches live PostgreSQL balances and transactions (`GET /api/v1/wallet`, `GET /api/v1/wallet/transactions`) and processes MTN MoMo/Orange Money top-ups (`POST /api/v1/wallet/fund`). Enforces a 100 FCFA registration reward with non-withdrawable security protection.


### 3. Running & Testing the Mobile App

```bash
# From mobile directory
npx expo start
```

#### 📱 Testing on Physical Android Phone via Expo Go (Recommended)
1. Install **Expo Go** from Google Play Store on your Android phone.
2. Ensure your computer and phone are connected to the **same Wi-Fi network**.
3. In `mobile/.env`, set `EXPO_PUBLIC_API_URL=http://<YOUR_COMPUTER_LAN_IP>:8000/api/v1` (e.g. `http://192.168.1.243:8000/api/v1`).
4. Run `npx expo start` in the `mobile/` directory.
5. In the Expo Go app on your phone, scan the QR code from your terminal or tap "Enter URL manually" and enter `exp://<YOUR_COMPUTER_LAN_IP>:8081`.

#### ⚠️ Troubleshooting: `Error: 'adb' is not recognized` / `Failed to resolve the Android SDK path`
- If you see `› Opening on Android... Failed to resolve the Android SDK path` in the terminal, it is because the letter `a` was pressed in the Expo CLI terminal.
- Pressing `a` instructs Expo to open an Android emulator or launch over USB via the Android Debug Bridge (`adb`).
- If you are testing on your physical phone with Expo Go over Wi-Fi, **do not press `a`**. Simply scan the QR code or enter the Expo URL in Expo Go.
- If you want to test via USB `adb` or Android emulator, install Android Studio and add `C:\Users\<Username>\AppData\Local\Android\Sdk\platform-tools` to your Windows system `PATH`.

---

## 📱 Mobile Screen Inventory

### 1. Buyer Workspace (`BuyerApp`)
| Screen | File | Highlights |
|---|---|---|
| **Onboarding** | `OnboardingScreen.tsx` | Outstanding 3-slider design tailored for African markets (Escrow Trust, Live GPS Delivery, Verified Stores), non-technical copy ("No Worries. Your Money is Safe."), pure escrow diagram, full-bleed dimmed background art, and touch gesture controls |
| **Home** | `HomeScreen.tsx` | AppBar (`☰`, `🔍`, `🔔`, `🛒`), `HeroCarousel` (4.5s auto-scroll), `PartnersCarousel`, circular `CategoryChip` avatars, 2-column verified products grid |
| **Search** | `SearchScreen.tsx` | Category filter bar, search query filter, price/distance radius bottom sheet |
| **Product Detail** | `ProductDetailScreen.tsx` | 92% width hero gallery with `ProductImageGalleryModal.tsx` multi-photo preview, floating action bar (`❤️`, share, cart), 2-col related recommendations, sticky stepper & dual CTA bottom bar |
| **Cart** | `BuyerCartScreen.tsx` | Item list with steppers, dynamic backend promo banner with 6s timeout, checkout CTA |
| **Checkout** | `CheckoutPaymentScreen.tsx` | Dual payment tabs: In-app Wallet Balance vs Mobile Money (MTN `*126#` / Orange `#150*50#`) |
| **Order Tracking** | `OrderTrackingScreen.tsx` | Real-time rider GPS marker, polyline route, ETA countdown, call/chat triggers |
| **My Wallet** | `WalletScreen.tsx` | Available Balance card, privacy eye toggle (`👁`), 4-stage MoMo funding/withdrawal modal, `RecentTransactionsWidget` |
| **Transactions History** | `TransactionHistoryScreen.tsx` | Full-screen history with text search (`🔍`), date pills (`7d`, `15d`, `1m`, `Custom`), date grouping, PDF statement download (`📥`) |
| **Profile** | `ProfileScreen.tsx` | Zero-Demo Profile architecture: dynamically binds live authenticated phone number & name, live order count badges from PostgreSQL, Wallet Quick-Access card, smart role switching buttons |
| **Followed Stores** | `FollowedStoresScreen.tsx` | Followed merchant feed with latest product previews and 1-tap cart addition |
| **Favorites** | `FavoritesScreen.tsx` | 2-column wishlist grid hooked into `useFavoritesStore` |
| **Footprints** | `FootprintScreen.tsx` | Chronological browsing history logging up to 50 items with timestamps |
| **Refunds** | `RefundsScreen.tsx` | In-progress escrow dispute tracker vs completed refund ledger |
| **Address Manager** | `AddressManagerScreen.tsx` | Delivery addresses with default switcher and bottom-sheet form |

### 2. Seller Workspace (`SellerApp`)
| Screen | File | Highlights |
|---|---|---|
| **Dashboard** | `SellerDashboardScreen.tsx` | Top AppBar with same-line actions, Subtitle Stack, Emerald Teal balance card with 1-tap account ID copy, Top Services 4x2 grid, Auto-Slide Sales Tips carousel, interactive store products catalog with quick-view modal and stock steppers, hidden-by-default KYC banner |
| **Products** | `SellerProductsScreen.tsx` | 2-column store catalog, active/paused switch, real-time `[ − 1 + ]` stock steppers, low-stock warning badges ($\le 5$ units) |
| **Add/Edit Product** | `AddEditProductScreen.tsx` | 5-photo upload grid, category horizontal selector, quality tier chips, and **Live Camera Barcode Scanner** (`expo-camera` real-time EAN-13/UPC/QR sensor detection, hardware torch toggle, laser reticle, instant store catalog auto-fill) |
| **Store Analytics** | `StoreAnalyticsScreen.tsx` | Revenue telemetry, available vs 48H escrow split, weekly Sales Velocity bar graph, key store KPIs, top products table, and PDF report export |
| **Orders Queue** | `SellerOrdersScreen.tsx` | 2-hour auto-cancel countdown timer (`⏳ 01:45:00`), Dual Delivery Dispatch Modal (Express Transporter vs In-House Rider), step-by-step lifecycle actions |
| **Store Wallet** | `SellerWalletScreen.tsx` | Available & Escrow balances, privacy eye toggle (`👁`), instant Mobile Money payout modal, `RecentTransactionsWidget` |
| **Store Profile** | `SellerProfileScreen.tsx` | Zero-Demo Profile architecture: real-time store branding, unconfigured empty state prompt, live store order badges from PostgreSQL, Store Tools grid with Store Analytics link |
| **Edit Store Profile** | `EditStoreProfileScreen.tsx` | Full merchant profile customization: Store Name, Category, Tagline, Address, Landmark Directions, Hours, Rider Pickup Instructions, and Photo upload |
| **Seller Welcome** | `SellerWelcomeScreen.tsx` | 70% automated benefit carousel and capsule CTA button with smart role redirection |
| **Store KYC** | `StoreKYCScreen.tsx` | 4-stage wizard with 80% form / 20% button split, multiline description textarea, category chips, and celebration modal |

### 3. Transport Provider Workspace (`TransporterApp`)
| Screen | File | Highlights |
|---|---|---|
| **Transporter Welcome** | `TransporterWelcomeScreen.tsx` | Logo-free modern header, live status badge, 70% automated hero carousel, 4 Transport Modality Cards, and capsule CTA with smart role redirection |
| **Driver KYC** | `TransporterKYCScreen.tsx` | 4-stage driver verification (Driver Info & Bio, Vehicle Class & Base Quarter, CNI & Driver's License photos, Carte Grise & Assurance photos) |
| **Job Offers** | `TransporterJobsScreen.tsx` | Nearby transport offers sorted by spatial distance, pickup/drop-off cards, and `QRScannerModal` (3 scanning modes) |
| **Driver Earnings** | `TransporterEarningsScreen.tsx` | Available balance card, MoMo payout trigger, `RecentTransactionsWidget` |
| **Active Delivery** | `TransporterActiveTripScreen.tsx` | GPS route navigation, store pickup confirmation, live location broadcasting, digital signature proof of delivery |
| **Driver Profile** | `TransporterProfileScreen.tsx` | Zero-Demo Profile architecture: vehicle type & plate number customization via `POST /api/v1/transporter/profile`, unconfigured placeholder prompts, live trip count and rating stats |

---

## 🎨 Design System & Tokens

Imported directly from `@wunabuy/design-tokens`:
- **Primary Brand Palette**: Emerald Teal (`#0D9488` / `#0F766E`)
- **Accent Brand Palette**: Warm Amber (`#F59E0B`)
- **Neutral Surface Palette**: Slate (`#FFFFFF` Light / `#0F766E` Dark / `#0F172A` Slate Dark)
- **Semantic Feedback**: Green (`#10B981`), Amber (`#F59E0B`), Red (`#EF4444`), Blue (`#3B82F6`)

---

## 📚 Complete Project Documentation

- [Wunabuy PRD v2.0](../docs/Wunabuy_PRD_v1.0.md) — Comprehensive Product Requirements
- [Wunabuy SRS v1.9](../docs/Wunabuy_SRS_v1.2.md) — Software Requirements Specification
- [Frontend Technical Specification v2.0](../docs/Wunabuy_Frontend_Tech_Spec_v1.0.md) — Architecture, UI & State Spec
- [Backend Technical Specification v1.4](../docs/Wunabuy_Backend_Tech_Spec_v1.0.md) — Modular Laravel API & Database

