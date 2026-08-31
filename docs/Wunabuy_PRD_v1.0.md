# Product Requirements Document (PRD)
# Wunabuy — Multi-Sided Mobile E-Commerce & Logistics Platform

**Document Version:** 1.8  
**Status:** Revised / Launch-Ready Production Baseline  
**Date:** August 31, 2026  
**Author:** Product Management & Engineering Architecture Team  
**Target Launch:** Q1 2027  
**File Location:** `wunabuy/docs/Wunabuy_PRD_v1.0.md`

---

## Executive Summary & Document Control

### Document Ownership
- **Product Manager:** Agemo Technologies Product Team
- **Lead Architect:** Antigravity (AI Engineering Lead)
- **Target Audience:** Executive Stakeholders, Engineering Leads, Product Designers, QA Engineers, Operations & Compliance Personnel.

### Purpose of This Document
This PRD defines the product vision, market outcome, launch scope, UI/UX architectural specifications, and decision framework for Wunabuy. It is intentionally focused on business outcomes, user experience standards, and release priorities.

### Revision History
| Version | Date | Author | Description of Changes |
|---|---|---|---|
| 1.0 | July 26, 2026 | Product Management Team | Initial comprehensive PRD baseline covering Mobile Apps (Buyer, Seller, Transporter), Staff Portal, Escrow Engine, Real-time Logistics, and Social Video Feed. |
| 1.1 | August 25, 2026 | Product Management Team | Tightened launch scope, clarified MVP vs Phase 2, added critical business rules for escrow, dispute, timeout, moderation, and release gating. |
| 1.2 | August 27, 2026 | Architecture & Engineering Team | Updated PRD with comprehensive UI/UX layout specifications (Home, Product Detail, Cart, Profile/Me Tab), simplified direct OTP auth flow, Slide-Out Navigation Drawer, dedicated Settings Architecture, and Android system navigation inset standards. |
| 1.3 | August 27, 2026 | Architecture & Engineering Team | Added Partner Carousel, Search screen circular category slider, Buyer Orders stacked action buttons, and complete Backend API Contracts v1.2. |
| 1.4 | August 28, 2026 | Architecture & Engineering Team | Added Buyer Wallet architecture (Fund, Withdraw, MTN MoMo `*126#`, Orange Money `#150*50#`, USSD prompt simulation, transaction history), Seller Welcome onboarding (70% hero carousel, 20% capsule CTA), 4-Stage Store KYC Form (80% form / 20% action button split, Error Callout Card, Stage 5 Celebration), and Profile & Drawer wallet entry points. |
| 1.5 | August 28, 2026 | Architecture & Engineering Team | Added App-Wide Native Pull-to-Refresh (`RefreshControl`) standards across all screens (`ScreenContainer`, `Search`, `Cart`, `Orders`, `Profile`, `Wallet`, `SellerInventory`, `TransporterJobs`, `TransporterEarnings`, `Settings`), Product Detail v2.0 Redesign (expansive 92% width hero image gallery with 4% margins, Top Floating Header Bar with 3-action buttons on same line [Love, Share, Cart], 2-column Recommendation / Related Products grid replacing static features, and optimized Dual CTA bottom bar), and Store KYC Stage 1 textarea dynamic container expansion (`minHeight: 110px`) with zero text overflow and horizontal category multi-select slider chips. |
| 1.6 | August 28, 2026 | Architecture & Engineering Team | Added "Become a Transporter" Onboarding Flow (`TransporterWelcomeScreen` with logo-free modern header, live status badge, 70% automated hero carousel with exact screen-width snapping, 4 Transport Modality Cards [Bike 🏍️, Taxi 🚕, Van 🚐, Plane ✈️], and 20% capsule CTA; `TransporterKYCScreen` with 4-stage Driver KYC and Stage 5 celebration modal), KYC Completion Redirection Rule (redirecting users back to initial Buyer Home Dashboard upon document submission while in 24-hour review queue), 3D Clay-Style Black Character Avatar System bundled in `mobile/assets/avatar.png` with 52px Profile header avatar and Camera Edit badge, and Dynamic Cart Promo Banner Architecture (hidden by default, backend-driven with 6-second auto-dismiss timeout). |
| 1.7 | August 28, 2026 | Architecture & Engineering Team | Added Wunabuy Wallet Checkout integration in `CheckoutPaymentScreen` (dual options: Wallet Balance instant 1-tap escrow vs Mobile Money USSD push; country-neutral provider labels), ProductCard interactive Quick-View Expand Modal with horizontal swipeable multi-image gallery (`FlatList horizontal pagingEnabled`, counter badge, stepper, dual actions), Strict Default Buyer Role Isolation in Settings (`RoleSwitcherCard` hiding Seller/Transporter buttons until backend API staff approval, with dedicated Apply to Sell and Apply to Transport action cards), and App-Wide `canGoBack` Navigation Safety with root reset fallbacks across all 11+ screens. |
| 1.8 | August 31, 2026 | Architecture & Engineering Team | Comprehensive Seller Section Architecture (`SellerApp`), Dynamic Key-Based Workspace Isolation in `RootNavigator.tsx` (`key={isAuthenticated ? 'auth_workspace_' + activeRole : 'unauth_root'}`) eliminating cross-stack bleeding, 2-Hour Auto-Cancel Fulfillment Queue (`SellerOrdersScreen`) with live countdown timers, Dual Delivery Dispatch Modal (Express Transporter vs Store In-House Rider), Seller Store Wallet & MoMo Payout Engine (`SellerWalletScreen`), and Complete Platform Visual Design & Color Harmonization across Buyer and Seller workspaces with unified Emerald Teal (`#0D9488` / `#0F766E`) and Warm Amber (`#F59E0B`) design tokens. |

---

## 1. Product Vision & Value Proposition

### 1.1 Vision Statement
Wunabuy aims to become the definitive multi-sided mobile e-commerce and logistics marketplace across emerging African markets by bridging buyers, local merchant stores, and independent motorcycle/vehicle transporters into a high-trust, escrow-backed digital ecosystem.

### 1.2 Core Value Proposition
- **For Buyers:** Unlocks reliable local product discovery, verified merchant authentications, transparent delivery pricing, real-time GPS tracking, in-app mobile wallet (MoMo/Orange top-up & withdrawal), and absolute payment safety via 48-hour escrow protection.
- **For Store Owners (Sellers):** Digitizes local brick-and-mortar storefronts, provides streamlined mobile onboarding with multi-step KYC verification, mobile inventory management, instant order notifications, and guaranteed payouts upon verified delivery.
- **For Transport Providers (Riders/Drivers):** Provides flexible local earning opportunities, optimized route navigation via Google Maps integration, instant job matching, and transparent payout tracking.
- **For Company Operations:** A high-density web Staff Portal across 6 departments with role-based access control (RBAC), automated KYC review pipelines, financial reconciliation tools, and dispute mediation workspaces.

---

## 2. Problem Statement & Market Opportunity

### 2.1 Market Pain Points
1. **Lack of Trust in Online Transactions:** Buyers fear payment scams, non-delivery, or misrepresentation of goods when buying online in African markets.
2. **Cash-on-Delivery (COD) Risk:** Merchants and drivers incur high financial losses from buyer cancellations, fake addresses, and cash handling vulnerabilities.
3. **Inefficient Local Delivery:** Fragmented informal delivery services lack real-time GPS tracking, standardized distance pricing, or delivery confirmation proof.
4. **Connectivity & Device Constraints:** Intermittent 3G networks and mid-range mobile devices cause high drop-off rates on unoptimized, heavy web apps.

### 2.2 Product Solution
Wunabuy addresses these challenges through a **mobile-first, offline-resilient app suite** supported by an **escrow payment & in-app wallet architecture** (MTN MoMo, Orange Money, Flutterwave, Paystack) that holds funds securely until the buyer or system confirms valid product delivery.

---

## 3. Target User Personas & User Journeys

### 3.1 User Personas

#### Persona 1: Amadou (The Tech-Savvy Buyer)
- **Demographics:** 26 years old, university graduate, uses mid-range Android smartphone in Yaoundé.
- **Needs:** Looking for verified electronics and fashion items nearby; wants guaranteed refund if product is defective; wants an in-app wallet to fund via MTN MoMo and pay directly.
- **Behavior:** Prefers paying via Mobile Money (MTN MoMo); expects real-time updates when driver picks up item.

#### Persona 2: Mama Chantal (The Boutique Seller)
- **Demographics:** 42 years old, small business owner running a clothing and accessories store in Akwa, Douala.
- **Needs:** Wants to onboard her store quickly via structured KYC steps (CNI, storefront picture, GPS pin); needs fast, guaranteed bank/MoMo payouts.
- **Behavior:** Low to moderate tech literacy; relies on clear mobile notifications, animated progress indicators, and simple visual dashboards.

#### Persona 3: Jean-Paul (The Transport Rider)
- **Demographics:** 24 years old, motorcycle owner operating in urban transport hubs.
- **Needs:** Flexible daily earnings, clear GPS directions, fair mileage compensation.
- **Behavior:** Works outdoors on 3G mobile data; requires high-contrast, large-touch-target UI controls.

#### Persona 4: Marie (Internal Operations Staff)
- **Demographics:** 31 years old, Senior Finance & Compliance Officer at Wunabuy HQ.
- **Needs:** High-density web workspace to approve merchant KYC, audit escrow ledger, process payouts, and resolve buyer-seller disputes.

---

## 4. Key Performance Indicators (KPIs) & OKRs

### 4.1 North Star Metric
- **Monthly Gross Merchandise Value (GMV)** processed through escrow-confirmed deliveries.

### 4.2 Primary Business & Operational KPIs
- **Monthly Active Users (MAU):** Target 5,000+ registered buyers within 6 months of launch.
- **Merchant Onboarding:** Target 1,000+ active verified stores.
- **Wallet Adoption:** Target 60%+ of recurring buyers funding in-app wallet via Mobile Money.
- **Transport Fleet:** Target 200+ active riders in primary launch city.
- **Dispute Rate:** Maintain total order disputes below $2.0\%$.
- **Average Delivery Fulfillment Time:** $\le 45\text{ minutes}$ from store acknowledgment to doorstep delivery.
- **Merchant KYC Processing Time:** $\le 24\text{ hours}$ end-to-end review latency.
- **App Performance:** Cold start time $\le 3\text{s}$ on mid-range Android devices over 3G networks.

---

## 5. UI/UX Architecture & Screen Specifications (v1.4 Update)

### 5.1 Onboarding & Entry Page (`WelcomeScreen` & `WalkthroughCarousel`)
- **Branding Header**: Official Wunabuy logo (`assets/icon.png`), brand title `Wunabuy`, tagline `ESCROW MARKETPLACE`, and top-right "Skip" action.
- **Contextual Feature Illustration Cards**:
  - **Slide 1**: `100% ESCROW PROTECTION` badge | `🔒 48h Escrow Guarantee` pill | `shield-checkmark-sharp` icon in Emerald Teal (`#0D9488`).
  - **Slide 2**: `VERIFIED LOCAL MERCHANTS` badge | `🏬 100% Verified Stores` pill | `storefront-sharp` icon in Royal Blue (`#2563EB`).
  - **Slide 3**: `REAL-TIME LIVE GPS` badge | `📍 Live GPS Tracking` pill | `location-sharp` icon in Warm Amber (`#F59E0B`).
- **Pill Pagination & Action Controls**: Dynamic active-pill pagination indicator, primary `Continue →` / `Get Started →` button, and direct `Log In` link.

### 5.2 Direct OTP Authentication & Registration Flow
- **OTP Verification (`VerifyOTPScreen`)**: Entering 6-digit OTP code authenticates the user directly for that mobile number via `SecureTokenService` and navigates straight into their account feed on the Home Screen without redundant pre-auth role friction.
- **Simplified Account Setup (`RegisterScreen`)**: Prompts for Full Name (required) and Delivery Address (optional), defaulting role to `BUYER` and saving default `Address` records.
- **Elevated Button Insets**: All authentication screens enforce dynamic `paddingBottom` with `useSafeAreaInsets()` so action buttons sit comfortably above device soft navigation keys.

### 5.3 Home Screen Architecture (`HomeScreen`)
- **Top AppBar**:
  - Left: Hamburger menu icon button (`☰`, `borderRadius: 14`) opening the slide-out navigation drawer.
  - Right: Search (`🔍`), Notification Bell (`🔔` count badge), and Shopping Cart (`🛍️` badge) icon buttons.
  - Subtitle Greeting Stack below AppBar: `Hello, [User Name]! ✨` | `Discover Products` | `48-hour escrow protection on every purchase`.
- **Active Auto-Scrolling Hero Carousel (`HeroCarousel`)**: Rotates automatically every 4.5 seconds across 3 feature banners (`100% ESCROW GUARANTEE`, `VERIFIED LOCAL STORES`, `EXPRESS GPS DELIVERY`), featuring white oval CTA buttons and 5-dot active indicators (`▪ ▫ ▫ ▫ ▫`).
- **Partners Showcase (`PartnersCarousel`)**: Manual horizontal carousel displaying verified corporate partners (MTN MoMo, Orange Money, Flutterwave, DHL, Ecobank) directly below the hero section.
- **Circular Category Avatar Slider (`CategoryChip`)**: 6 circular avatar items (`width: 58, height: 58`, light teal `#F0FDFA` bg) with icons & text labels (`Skincare`, `Makeup`, `Fragrance`, `Haircare`, `Tools`, `Offers`) placed directly above Best Sellers.
- **Best Sellers Horizontal Scroll Section**: Cards featuring top-right favorite heart button (`♡`), 5-star rating row (`★★★★★`), price (`18 500 FCFA`), and primary Teal circular `+` quick-add button.
- **Special Offer Promo Card**: Light teal rounded card (`#F0FDFA`, `borderRadius: 24`) with `Special Offer` eyebrow, `Up to 30% Off` headline, white `Grab Now ➔` CTA button, and circular `30% OFF` badge.
- **Explore Verified Items Product Grid**: 2-Column purchasing product feed below the Special Offer card enabling buyers to browse and purchase items directly from the main feed.

### 5.4 Buyer Wallet Architecture (`WalletScreen`)
- **Route:** `BuyerWallet` (registered in `RootNavigator.tsx`).
- **Entrypoints:**
  - **Sidebar Drawer:** `My Wallet` menu row with Emerald Green icon box and `MoMo` badge.
  - **Profile Screen:** Prominent Teal Gradient Quick-Access Wallet Card (`47,500 XAF`, `48H ESCROW` badge, `Open Wallet ›`) + `My Wallet` tool shortcut in the services grid.
- **Balance Card:**
  - Shows Available Balance in XAF (FCFA) with eye toggle button (`👁`) for privacy masking.
  - 48H Escrow protection badge and Wunabuy wallet identifier.
  - Dual action buttons: `+ Fund Account` and `↑ Withdraw`.
- **Payment Method Quick Showcase:**
  - `MTN MoMo` (Dial `*126#`, Amber `#F59E0B`)
  - `Orange Money` (Dial `#150*50#`, Orange `#F97316`)
- **Fund / Withdraw Bottom Sheet Modal (50%–70% Max Height):**
  - **Step 1 (Form):** Provider selector cards (equal-width grid with checkmark badge), 9-digit Cameroon Phone input, Amount input (min 100 XAF), balance validation banner for withdrawals.
  - **Step 2 (Dial Prompt):** Shows exact USSD code (`*126#` for MTN, `#150*50#` for Orange) with prompt instructions and `I've Dialed the Code` confirmation button.
  - **Step 3 (Verification Loader):** Secure transaction confirmation spinner with encryption badge.
  - **Step 4 (Result Card):** High-impact Success (`Wallet Funded! 🎉` / `Withdrawal Successful! ✅`) or Failure card with retry trigger and balance refresh.
- **Transaction History Feed:** Paginated credit/debit transaction ledger with direction icons, provider color dot, timestamp, and amount formatting.

### 5.5 Seller Welcome & Onboarding (`SellerWelcomeScreen`)
- **Screen Proportions:**
  - **Top 70% Body Height (`flex: 0.72`):** Automated Hero Benefit Slideshow rotating every 3.5 seconds across 4 high-contrast merchant benefit cards:
    1. 🛡️ `VERIFIED MERCHANT BADGE` (Store authenticity & trust)
    2. 🔒 `100% GUARANTEED ESCROW PAYOUTS` (48-hour automated payout guarantee)
    3. ⚡ `EXPRESS GPS LOGISTICS FLEET` (On-demand rider matching)
    4. 📊 `MOBILE INVENTORY & REVENUE ANALYTICS` (Live sales tracking)
  - **Bottom 20% Action Section (`flex: 0.22`):** Advanced rounded capsule CTA button `Get Started Now ➔` with white forward arrow badge, navigating directly to Store KYC.

### 5.6 4-Stage Store KYC Onboarding Form (`StoreKYCScreen`)
- **Screen Proportions:**
  - **Top 80% Form Section (`flex: 0.8`):**
    - Animated progress bar (`25%` ➔ `50%` ➔ `75%` ➔ `100%`) with step indicators.
    - Full-height stage cards (`minHeight: 380px`, `justifyContent: space-between`).
    - **Stage 1 (Store Basic Details):** Store Name, 5-line spacious Description textarea (`minHeight: 110px`), Horizontal category chips.
    - **Stage 2 (Location & Address):** Physical street address, City, GPS Location Auto-Pin Active notice card.
    - **Stage 3 (Identity Verification):** National ID / CNI number, Front & Back CNI photo uploaders with thumbnail grid.
    - **Stage 4 (Storefront Proof):** Physical storefront/workshop photo uploader, optional Business Registration/Affidavit uploader.
    - **Stage 5 (Completion Celebration):** Royal Blue celebration card with Wunabuy logo ring (*"Thank You for Becoming Part of Wunabuy Family! 🎉"*) and 24-hour review notice card.
    - **Validation Callout Alert Banner:** Styled warning card (`alert-circle-sharp`, red tint `#FEF2F2`, red border `#EF4444`, bold message).
  - **Bottom 20% Navigation Action Section (`flex: 0.2`):**
    - `← Back` Pill Button (rounded outline capsule, `54px` height).
    - `Continue to Next Stage →` / `Submit Documents ➔` Pill Button (Royal Blue `#2563EB`, `54px` height, white arrow circle badge).
    - `Go Back to Home Page →` Button on Stage 5 completion.

### 5.7 Slide-Out Navigation Drawer (`SidebarDrawer`)
- **Overlay Panel**: Covers 84% screen width from left upon tapping the top-left hamburger menu (`☰`).
- **Header & Profile Summary**: Wunabuy Logo with Teal ring, user Avatar with green online pulse dot, Full Name, Phone number, and `48H ESCROW` badge.
- **Partner Opportunities**:
  - 🏪 **Become a Seller (Store Owner)**: Navigates to `SellerWelcomeScreen`.
  - 🚚 **Become a Transporter (Driver)**: Opens Driver Onboarding workflow (`StoreKYC` with transporter role).
- **Navigation & Orders Section**:
  - 💳 **My Wallet**: Green icon box, sublabel *"Balance, Fund & Withdraw"*, and `MoMo` green pill badge.
  - 🛍️ **My Orders & Escrow**: Direct link to buyer orders and dispute management.
  - 📍 **Delivery Addresses**: `AddressManagerScreen`.
  - 🔔 **Notifications & Alerts**: `NotificationSettingsScreen`.
  - ⚙️ **Settings & Preferences**: `SettingsScreen`.
- **App Controls**: Dark Appearance toggle (`Switch`) and Logout Account pill button.

### 5.9 Seller Workspace UI/UX Architecture (`SellerApp`)
- **Visual Brand Harmonization**: Full alignment with Buyer aesthetic using core Emerald Teal (`colors.primary[500]` `#0D9488`, `colors.primary[600]` `#0F766E`) and Warm Amber (`colors.accent[500]` `#F59E0B`).
- **5.9.1 Merchant Dashboard (`SellerDashboardScreen`)**:
  - Top header: Merchant Store name, verified badge, and 1-tap **"🛒 Buyer Mode"** pill button allowing immediate transition back to customer shopping.
  - **Store Balances Card**: Matches Buyer Wallet card geometry with Emerald Teal background, decorative translucent glass circles (`rgba(255,255,255,0.08)`), Available Earnings in XAF, Locked Escrow indicator, privacy eye toggle (`👁`), and quick `Withdraw Payout` CTA button.
  - **Operational Stat Tiles (2x2 Grid)**: Real-time metrics for Today's Sales (XAF), Pending Orders Queue, Active Products, and Store Rating.
  - **Quick Action Grid**: `+ Add Product`, `Fulfillment Orders`, `Store Wallet`, and `Store Settings`.
  - **Recent Orders Queue Preview**: Quick-access preview cards with live status badges and 1-tap action buttons.
- **5.9.2 Catalog & Stock Inventory (`SellerProductsScreen` & `AddEditProductScreen`)**:
  - Real-time catalog feed with search bar, active/paused switch (`is_active`), stock steppers `[ − 1 + ]` for instant quantity modification, and low-stock warning badges ($\le 5$ units).
  - Product Listing Creation/Edit: 5-photo upload grid with camera and gallery integration, category scroll selector, numeric price/stock inputs, and quality tier chips (`NEW`, `LIKE_NEW`, `GOOD`, `FAIR`).
- **5.9.3 Order Fulfillment Queue & Dual Delivery Dispatch (`SellerOrdersScreen`)**:
  - Horizontal segmented status filter bar (`All`, `New Orders`, `Preparing`, `Ready`, `In Transit`, `Completed`).
  - **2-Hour Auto-Cancel Acceptance SLA**: Live ticking countdown timer (`⏳ 01:45:00`) for new orders enforcing automatic cancellation and buyer refund upon timeout (BR-01).
  - **Dual Delivery Dispatch Modal**: When marking an order "Ready for Pickup", merchants can choose between:
    1. **🏍️ Wunabuy Express Transporter (Recommended)**: Auto-broadcasts pickup job to nearby verified riders with live GPS route tracking.
    2. **🚚 Store In-House Rider / Self-Delivery**: Merchant fulfills delivery directly with optional rider phone assignment.
  - Lifecycle action buttons: `Accept Order` $\rightarrow$ `📦 Mark Ready for Pickup` $\rightarrow$ `🚚 Handover to Rider` $\rightarrow$ `✓ Confirm Buyer Received`.
- **5.9.4 Store Wallet & MoMo Payout Engine (`SellerWalletScreen`)**:
  - Available Store Balance & Escrow Locked banner with privacy toggle (`👁`).
  - Instant Mobile Money Payout Modal (MTN MoMo `*126#` and Orange Money `#150#`) with percentage quick presets (`25%`, `50%`, `75%`, `Max`), automated 1% telecom fee deduction display, phone validation, and real-time ledger audit log.
- **5.9.5 Seller Bottom Tab Navigation (`SellerTabNavigator.tsx`)**:
  - 4 core tabs: `Dashboard` (speedometer icon), `Orders` (receipt icon with live pending count badge), `Inventory` (cube icon), and `Store Wallet` (wallet icon).
  - Tab bar height: `56px + bottomInset`, active tint: `colors.primary[500]` (`#0D9488`), elevation: `10`.

### 5.10 App-Wide Key-Based Workspace Isolation & Security Architecture (`RootNavigator.tsx`)
- **Root Stack Remounting**: `RootNavigator` mounts the main navigation tree with dynamic key assignment:
  ```typescript
  <Stack.Navigator
    key={isAuthenticated ? `auth_workspace_${activeRole}` : 'unauth_root'}
    screenOptions={{ headerShown: false }}
  >
  ```
- **Guaranteed Workspace Separation**:
  - In `activeRole === UserRole.BUYER`: Stack root is strictly `BuyerApp`. No Seller or Transporter screens can bleed into navigation history.
  - In `activeRole === UserRole.SELLER`: Stack root is strictly `SellerApp`.
  - In `activeRole === UserRole.TRANSPORTER`: Stack root is strictly `TransporterApp`.
  - In unauthenticated state: Stack root is strictly `UnauthStack` (`Welcome`, `Login`, `VerifyOTP`, `Register`).
- **Dynamic Context Adaptation in Profile**:
  - `ProfileScreen.tsx` adapts header badge (`BUYER` in teal, `SELLER` in emerald, `TRANSPORTER` in amber).
  - Bottom Partner Card dynamically presents the inverse workspace switcher ("🏪 Seller Workspace (Manage Store ➔)" when in Buyer mode, vs "🛒 Buyer Workspace (Shop on Wunabuy ➔)" when in Seller mode).

---

## 6. Functional Requirements (EPICs & Features)

### EPIC 1: User Management & Authentication Framework
- **FR-001 (High):** Registration via mobile phone number with 6-digit SMS OTP verification.
- **FR-002 (High):** Direct account login and OTP verification linking mobile numbers directly to Home user accounts.
- **FR-003 (High):** `Transporter` permissions granted exclusively by Wunabuy Admin/Operations staff in the Staff Portal after vehicle & driver license verification.
- **FR-004 (High):** Secure session management using API access tokens and refresh tokens.
- **FR-005 (High):** Staff Portal MFA with 15-minute inactivity auto-logout.

### EPIC 2: Store Onboarding & KYC Verification
- **FR-006 (High):** Seller onboarding starts with animated benefit welcome carousel before document collection.
- **FR-007 (High):** Merchant KYC split into 4 structured stages (Basic Details, Address & GPS, National ID CNI Front/Back, Storefront & Business Registry).
- **FR-008 (High):** Stage form UI strictly enforces 80% form card height / 20% action button proportion with animated progress tracking.
- **FR-009 (High):** Stage 1 Short Business Description textarea dynamically expands across full horizontal card width with `minHeight: 110px`, zero text overflow, and live character counter (300 limit).
- **FR-010 (High):** Stage 1 Primary Store Categories provides a horizontal slider (`ScrollView horizontal`) with multi-select checkmark chip pills (`✓ CategoryName`).
- **FR-011 (High):** Document validation with immediate Error Callout Alert Banner and encrypted photo storage.
- **FR-012 (High):** Stage 5 displays confirmation celebration and triggers 24-hour compliance review queue.

### EPIC 3: Product Catalog, Inventory & Search
- **FR-013 (High):** Seller can create product listings with up to 5 images, price, description, stock quantity, and quality tier.
- **FR-014 (High):** Inventory decrements automatically after order confirmation and triggers low-stock alerts at $\le 5$ units.
- **FR-015 (High):** Search supports full-text search, category chips, rating filter, price range, and geographic radius filters.
- **FR-016 (High):** Categories screen provides horizontal circular category avatar slider for real-time grid filtering.
- **FR-017 (High):** Product Detail Screen (v2.0) features an expansive hero gallery stage covering 92% screen width (4% side margins), thumbnail strip selector, verified quality pill badge, and verified merchant store card.
- **FR-018 (High):** Top Floating Header Bar aligns Back button on the left, and Favorite Love Icon (`❤️`), Native Share, and Shopping Cart (with live badge) in a clean horizontal row on the right on the same line.
- **FR-019 (High):** Product Detail replaces static features list with an automated 2-column Recommendation / Related Products grid ("You May Also Like ✨").
- **FR-020 (High):** Sticky Bottom Action Bar provides an optimized layout with compact `[ − 1 + ]` stepper pill, 48px soft-teal `Add to Cart` button, and solid Emerald Teal `Buy Now ➔` button.

### EPIC 4: Commerce, Wallet & Escrow Payments
- **FR-021 (High):** In-app Buyer Wallet allows funding via MTN Mobile Money and Orange Money.
- **FR-022 (High):** System displays dynamic USSD dialing codes (`*126#` for MTN, `#150*50#` for Orange) during mobile money top-up and withdrawal.
- **FR-023 (High):** Buyers can pay for orders directly from wallet balance or through direct gateway checkout (Flutterwave / Paystack fallback).
- **FR-024 (High):** Funds are held in 48-hour secure escrow until delivery confirmation signature or dispute resolution.
- **FR-025 (High):** Wallet ledger logs all credit, debit, payout, and escrow transitions with timestamps and reference codes.

### EPIC 5: Logistics & Delivery
- **FR-026 (High):** Stores can assign delivery to a transporter or use in-house delivery.
- **FR-027 (High):** Nearby transport providers receive job notifications and can accept or reject jobs.
- **FR-028 (High):** GPS route and live tracking updates are visible to buyer and store (with driver speed and heading).
- **FR-029 (High):** Proof-of-delivery photo/signature is required before the order is marked delivered.
- **FR-030 (High):** Delivery fee is calculated using distance, base rate, and vehicle class.

### EPIC 6: App-Wide Pull-to-Refresh & Ergonomics
- **FR-031 (High):** Every scrollable screen across Buyer, Seller, and Transporter apps SHALL support native Pull-to-Refresh (`RefreshControl`) styled with Emerald Teal (`#0D9488`).
- **FR-032 (High):** Pulling down on `HomeScreen`, `SearchScreen`, `BuyerCartScreen`, `BuyerOrdersScreen`, `ProfileScreen`, `WalletScreen`, `SellerProductsScreen`, `TransporterJobsScreen`, `TransporterEarningsScreen`, and `SettingsScreen` triggers live data synchronization.

### EPIC 7: Transporter Onboarding & KYC Lifecycle
- **FR-033 (High):** Transporter onboarding welcome screen (`TransporterWelcomeScreen`) features a logo-free modern header, live network status badge, 70% automated hero carousel with 4 rotating benefit slides with exact screen-width snapping, 4 Transport Modality Cards (`Bike 🏍️`, `Taxi 🚕`, `Van 🚐`, `Plane ✈️`), and 20% capsule CTA (`Start Driver Verification ➔`).
- **FR-034 (High):** Driver verification form (`TransporterKYCScreen`) features 4-stage KYC: Stage 1 (Driver Info & Bio textarea with 300 char limit), Stage 2 (Vehicle Class Selector & Base Quarter), Stage 3 (National ID CNI Front/Back & Driver's License photo), Stage 4 (Vehicle Carte Grise, Assurance, & Exterior Vehicle photo with plate visible).
- **FR-035 (High):** KYC Submission Redirection Rule: Upon completing document submission in Stage 5, the user is redirected cleanly back to their initial **Buyer Home Dashboard** (`BuyerApp` root reset) while their application remains in the 24-hour compliance review queue (`under_review`).

### EPIC 8: User Profile Picture & 3D Character Avatar System
- **FR-036 (High):** Profile Picture displays a locally bundled **3D Clay-Style Black Character Avatar** (`mobile/assets/avatar.png`) with 0ms offline latency whenever a custom photo URL is not provided.
- **FR-037 (High):** `ProfileScreen` header provides an expanded 52px circular avatar with an Emerald border ring and a Camera Edit badge icon (`camera` in `#0D9488`).

### EPIC 9: Dynamic Cart Promotion & Auto-Dismiss Architecture
- **FR-038 (High):** Cart screen (`BuyerCartScreen`) hides promotional and free delivery banners by default to maintain a clean, uncluttered layout.
- **FR-039 (High):** Promotional notices are dynamically triggered by backend coupon/discount payload events (`backendPromo`) with a mandatory auto-dismiss timeout (6 seconds) and manual close button `(X)`.

### EPIC 10: Wunabuy Wallet Checkout & Neutral Payment Methods
- **FR-040 (High):** Checkout payment screen (`CheckoutPaymentScreen`) supports dual payment options: **Wunabuy Wallet** (`PaymentMethod.WALLET`) with real-time balance inspection, instant 1-tap escrow lock, and low-balance shortfall warning; and **Mobile Money** (`PaymentMethod.MOMO`) with MTN MoMo (`*126#`) and Orange Money (`#150*50#`).
- **FR-041 (High):** All payment method and provider labels SHALL be country-neutral ("Mobile Money Provider", "Mobile Phone Number").

### EPIC 11: ProductCard Quick-View Expand & Swipeable Gallery
- **FR-042 (High):** Tapping the circular `(+)` button on any `ProductCard` expands an interactive quick-view modal featuring a high-performance horizontal swipe gallery (`FlatList horizontal pagingEnabled`), real-time image counter (`1 / 4`), pagination dots, 5-star ratings, full description, quantity stepper `[ − 1 + ]`, and dual action buttons (`Add to Cart` + `View Full Product ➔`).

### EPIC 12: Role Isolation & App-Wide Navigation Safety
- **FR-043 (High):** All user accounts SHALL default strictly to **Buyer (Customer)** (`UserRole.BUYER`).
- **FR-044 (High):** Seller (Store Owner) and Transport Driver workspace buttons remain completely **hidden** in Settings & Preferences until authorized by the backend API via Staff Portal KYC approval.
- **FR-045 (High):** Dedicated `Apply to Sell` and `Apply to Transport` action cards are rendered underneath active roles for unapproved users.
- **FR-046 (High):** Every back button across all mobile screens is guarded with `navigation.canGoBack()` and falls back to root stack reset (`BuyerApp`).

### EPIC 13: Profile Privacy Masking & Buyer Service Discovery Hub
- **FR-047 (High):** Wallet Balance Privacy Masking: `ProfileScreen` features an interactive eye toggle (`eye-outline` / `eye-off-outline`) on the Wunabuy Wallet card to seamlessly hide/mask (`•••••• FCFA`) or display live balances (`47 500 FCFA`) with event propagation isolation.
- **FR-048 (High):** Followed Stores Feed (`FollowedStoresScreen`): Dedicated screen presenting all followed stores with merchant avatars, verified badges, ratings, follower count, location, follow/unfollow action, and a horizontal carousel of each store's latest products with 1-tap cart addition.
- **FR-049 (High):** Favorites & Wishlist (`FavoritesScreen`): Dedicated screen displaying all liked products in a 2-column grid, hooked into `useFavoritesStore` and love heart triggers across `ProductCard` and `ProductDetailScreen`, with instant Add to Cart and Clear All actions.
- **FR-050 (High):** Browsing Footprint Engine (`FootprintScreen`): Chronological browsing history tracking up to 50 viewed products with formatted timestamps (`formatDate`), individual removal, and Clear All action.
- **FR-051 (High):** Refunds & Escrow Disputes Screen (`RefundsScreen`): Dedicated screen with segmented tab controls for In-Progress escrow disputes (reason, evidence photos, frozen escrow status, 48h staff arbitration timeline) vs. Completed refunds credited back to Wallet or Mobile Money.
- **FR-052 (High):** Address Manager (`AddressManagerScreen`): Delivery addresses management with Default address badge, Add/Edit BottomSheet modal, instant default address switching, and deletion.
- **FR-053 (High):** Interactive Profile Picture Camera Update & Device Storage: Tapping the user avatar or camera badge icon on `ProfileScreen` triggers an interactive `AvatarUpdateModal`. The user can capture a new square photo with the device camera (`ImagePicker.launchCameraAsync`) or choose from the photo gallery (`ImagePicker.launchImageLibraryAsync`) after granting native device permissions. The captured image is stored immediately in local device state (`AsyncStorage` via `useAuthStore`) with background dispatch to the backend API (`AuthService.updateProfile`).

### EPIC 14: Automated Build & Distribution Pipeline (EAS / Standalone APK Delivery)
- **FR-054 (High):** Standalone Android APK Compilation: Mobile project is configured with Expo Application Services (`EAS Build`) with preview distribution profiles (`buildType: "apk"`), enabling continuous cloud compilation of installable release APKs without local Android SDK or Java JDK dependencies.
- **FR-055 (High):** Direct Tester Distribution: Cloud builds automatically output signed `.apk` binaries accessible via direct HTTPS download URLs and scannable QR codes for testing across Android devices.

### EPIC 15: Seller Store Operations & Merchant Fulfillment Hub
- **FR-056 (High):** Fulfillment Queue & 2-Hour Auto-Cancel Acceptance Timer (`SellerOrdersScreen`): Dedicated fulfillment queue with real-time countdown timer (`⏳ 01:45:00`) enforcing BR-01. Orders not accepted within 2 hours auto-cancel and refund the buyer. Includes stage tabs: `New Orders`, `Preparing`, `Ready for Pickup`, `In Transit`, `Completed`, `Disputed`.
- **FR-057 (High):** Dual Delivery Dispatch Mode: When marking orders ready for pickup, merchants can choose between **Wunabuy Express Transporters** (automated GPS dispatch to verified riders) and **Self-Delivery / Store In-House Rider**.
- **FR-058 (High):** Store Wallet & Instant Mobile Money Payouts (`SellerWalletScreen`): Real-time escrow ledger with interactive Privacy Eye toggle (`👁` / `👁‍🗨`), instant Mobile Money (MTN MoMo & Orange Money) payout requests with 1% telecom charge calculations, and audit history.
- **FR-059 (High):** Merchant Inventory CRUD with Stock Steppers (`SellerProductsScreen` & `AddEditProductScreen`): 2-column inventory catalog with active/paused toggle, instant `[ − 1 + ]` stock steppers, low-stock warnings ($\le 5$ units), and 5-photo upload grid with native camera and gallery integration.

### EPIC 16: Role Workspace Isolation, Remount Security & Brand Palette Harmonization
- **FR-060 (High):** Key-Based Stack Remounting: `RootNavigator.tsx` SHALL dynamically bind stack key `auth_workspace_${activeRole}` upon active role transitions, ensuring immediate unmounting of inactive workspace screens and complete isolation between Buyer, Seller, and Transporter workflows.
- **FR-061 (High):** 1-Tap Quick Workspace Switching: Merchant Dashboard (`SellerDashboardScreen`) SHALL feature a top-right `🛒 Buyer Mode` button, and `ProfileScreen` SHALL dynamically display inverse workspace transition cards to allow fluid, authorized role context switching.
- **FR-062 (High):** Platform-Wide Visual Brand Harmonization: All Seller screens SHALL share the same design token palette (`@wunabuy/design-tokens`) as the Buyer app (Emerald Teal `#0D9488` / `#0F766E`, Warm Amber `#F59E0B`, crisp white `#FFFFFF`), with matching tab heights, elevation, and card geometries.

---

## 7. Critical Business Rules (Launch Requirements)

| Rule ID | Rule | Operational Requirement |
|---|---|---|
| BR-01 | Store acknowledgment timeout | Store must acknowledge a new order within 2 hours or the order auto-cancels and the buyer is refunded. |
| BR-02 | Escrow release | Escrow releases automatically 48 hours after delivery confirmation if no dispute is raised. |
| BR-03 | Dispute freeze | Escrow remains frozen while a dispute is open or being reviewed. |
| BR-04 | Payment failure fallback | If primary gateway fails, the system retries through Paystack or marks transaction as pending. |
| BR-05 | Wallet minimum funding | Minimum wallet top-up is 100 XAF; withdrawals cannot exceed available (unlocked) wallet balance. |
| BR-06 | Refund authority | Only approved staff or the system can trigger a refund according to dispute policy. |
| BR-07 | Rider no-show | If a rider does not accept or reach the pickup point within a configured window, the order is reassigned or auto-cancelled. |
| BR-08 | KYC re-submission | Users may resubmit KYC only up to 3 times before being escalated for manual review. |
| BR-09 | Suspended seller restrictions | Suspended or unverified stores cannot list products or receive payments. |
| BR-10 | Auditability | All operational decisions with financial or trust impact must be logged with actor, time, before/after state, and reason. |

---

## 8. System Architecture & Tech Stack

```
                       ┌──────────────────────────────────────────┐
                       │       React Native Mobile App            │
                       │   (Expo SDK 54 / Hermes Engine)          │
                       └────────────────────┬─────────────────────┘
                                            │
                                    HTTPS / REST / WSS
                                            │
                                            ▼
                       ┌──────────────────────────────────────────┐
                       │          Laravel 13 Backend API           │
                       │             (v1 Endpoints)               │
                       └────────────────────┬─────────────────────┘
                                            │
               ┌────────────────────────────┼────────────────────────────┐
               │                            │                            │
               ▼                            ▼                            ▼
┌─────────────────────────────┐ ┌───────────────────────┐ ┌───────────────────────────┐
│     PostgreSQL 15 Database  │ │    Laravel Horizon    │ │    Third-Party APIs       │
│   (PostGIS, Reverb WS)      │ │  (Redis Queue Workers)│ │ (MTN MoMo, Orange, Maps)  │
└─────────────────────────────┘ └───────────────────────┘ └───────────────────────────┘
```

- **Mobile Client:** React Native 0.81+, Expo SDK 54+, TypeScript, React Navigation 6, Zustand, TanStack React Query v5, `expo-navigation-bar`, `@expo/vector-icons`.
- **Backend & Database:** Laravel 13 (PHP 8.3+), PostgreSQL 15 with PostGIS spatial extensions, Redis caching & Horizon queues, Laravel Reverb WebSockets.

---

## 9. Non-Functional Requirements (NFRs)

- **NFR-001:** Cold start time $\le 3\text{s}$ on mid-range Android hardware (3G connection).
- **NFR-002:** Product search response latency $\le 2\text{s}$ for $50\text{km}$ radius queries.
- **NFR-003:** API 95th percentile (p95) response latency $\le 500\text{ms}$.
- **NFR-004:** Zero UI overlap with Android soft navigation buttons (`|||`, `O`, `<`) via mandatory `useSafeAreaInsets()`.
- **NFR-005:** All network communications strictly enforced via HTTPS with TLS 1.3 minimum.

---

## 10. Acceptance Criteria & Definition of Done (DoD)

A requirement is considered **Complete and Ready for Release** when:
1. **Code Completeness:** Source code written, peer-reviewed, and merged into `main`.
2. **Type Safety:** Zero TypeScript build errors across all monorepo packages (`7 successful, 7 total`).
3. **Integration Verification:** End-to-end user journeys pass successfully on physical iOS and Android devices.
4. **Documentation:** PRD, SRS, Frontend Tech Spec, Backend Tech Spec, and [Backend API Contract v1.0](file:///c:/Users/HP/Desktop/wunabuy%20mobile%20project/wunabuy/docs/Wunabuy_Backend_API_Contract_v1.0.md) synchronized with exact codebase state and UI specifications.

---

### Approval Signatures

**Product Manager:** _Agemo Technologies Product Lead_  
**Technical Lead:** _Antigravity (AI Lead Architect)_  
**Lead QA Engineer:** _Wunabuy Quality Assurance Team_  

---
**[End of Product Requirements Document v1.5]**
