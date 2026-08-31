# Software Requirements Specification (SRS)
# Wunabuy — Multi-Sided Mobile E-Commerce Platform

**Document Version:** 1.8 (Production Synchronized Baseline)  
**Date:** August 31, 2026  
**Status:** Approved / In Production Use  
**Companion Documents:** Wunabuy PRD v1.8, Wunabuy Frontend Tech Spec v1.8, Wunabuy Backend Tech Spec v1.4  

> **Resolved Architecture & UI Specifications (August 31, 2026):**
> - **Backend:** Laravel 13 + Laravel Reverb WebSockets + PostgreSQL 15 (PostGIS).
> - **Dynamic Key-Based Workspace Isolation (`RootNavigator`):** `key={isAuthenticated ? 'auth_workspace_' + activeRole : 'unauth_root'}` guarantees complete remounting of the navigation tree on role switches, eliminating route bleeding and inverted redirects between Buyer, Seller, and Transporter stacks.
> - **Platform Visual Design & Color Harmonization:** Full alignment of Seller screens with Buyer brand identity using Emerald Teal (`colors.primary[500]` `#0D9488` / `colors.primary[600]` `#0F766E`) and Warm Amber (`colors.accent[500]` `#F59E0B`), unified tab bar metrics, and matching card geometries.
> - **Direct OTP Auth:** `POST /api/v1/auth/otp/verify` logs user into account and redirects straight to Home.
> - **Home Screen Top AppBar:** Hamburger menu icon (`☰`) on left; Search (`🔍`), Notifications (`🔔` badge), and Cart (`🛍️` badge) on right. Subtitle greeting stack moved below AppBar.
> - **Partners Showcase (`PartnersCarousel`):** Replaces search bar with manual horizontal slideshow for official partners (MTN MoMo, Orange Money, Flutterwave, DHL, Ecobank).
> - **Categories Circular Slider (`CategoryChip`):** Placed directly above Best Sellers.
> - **Buyer Wallet Architecture (`WalletScreen`):** In-app mobile wallet supporting MTN MoMo (`*126#`) & Orange Money (`#150*50#`) funding/withdrawals with 50-70% responsive bottom sheets, USSD instructions, live validation, and transaction ledger.
> - **Wunabuy Wallet Checkout (`CheckoutPaymentScreen`):** Integrated in-app wallet balance payment tab with real-time balance checking, instant 1-tap escrow lock, and low-balance shortcut alongside country-neutral Mobile Money providers (MTN MoMo, Orange Money).
> - **Seller Dashboard (`SellerDashboardScreen`):** Features 1-tap `🛒 Buyer Mode` header button, Emerald Teal Store Balances Card with decorative translucent circles and privacy toggle (`👁`), 2x2 operational metrics grid, and recent order queue cards.
> - **Order Fulfillment Queue & 2-Hour Acceptance SLA (`SellerOrdersScreen`):** Real-time countdown timer (`⏳ 01:45:00`) enforcing BR-01 auto-cancellation, Dual Delivery Dispatch Modal (Express Transporter vs Store In-House Rider), and step-by-step lifecycle actions.
> - **Catalog & Inventory Management (`SellerProductsScreen` & `AddEditProductScreen`):** Real-time stock steppers `[ − 1 + ]`, low-stock indicators ($\le 5$ units), active/paused switches, and 5-photo upload grid with native camera & gallery picker.
> - **Seller Store Wallet (`SellerWalletScreen`):** In-app merchant ledger, MTN MoMo (`*126#`) & Orange Money (`#150#`) instant payout modal with 1% telecom charge calculations, percentage presets (`25%`, `50%`, `75%`, `Max`), and audit ledger.
> - **ProductCard Quick-View Expand & Swipeable Gallery (`ProductCard`):** `(+)` button expands an interactive modal with horizontal multi-image paging gallery (`FlatList horizontal pagingEnabled`), counter badge (`1 / 4`), pagination dots, 5-star ratings, full description, quantity stepper `[ − 1 + ]`, `Add to Cart`, and `View Full Product ➔`.
> - **Strict Default Buyer Role Isolation (`RoleSwitcherCard`):** All users default strictly to Buyer (`UserRole.BUYER`). Seller and Transporter role switchers are completely hidden in Settings until approved by backend API upon Staff Portal KYC verification, accompanied by dedicated `Apply to Sell` and `Apply to Transport` action cards.
> - **App-Wide `canGoBack` Navigation Safety:** Every back button across all 11+ screens checks `navigation.canGoBack()` and falls back to graceful root stack reset (`BuyerApp`), permanently eliminating unhandled `GO_BACK` errors.
> - **Seller Welcome Onboarding (`SellerWelcomeScreen`):** 70% automated hero carousel (3.5s interval, 4 benefit cards) and 20% capsule CTA button (`Get Started Now ➔`).
> - **4-Stage Store KYC Form (`StoreKYCScreen`):** 80% scrollable form grid / 20% action button split, animated progress bar (`25%` -> `100%`), flexible multiline description textarea (`minHeight: 110px`, live `0/300` char counter), horizontal category multi-select chips (`✓ CategoryName`), Error Callout Alert Banner, and Stage 5 celebration modal.
> - **Transporter Welcome Onboarding (`TransporterWelcomeScreen`):** Logo-free modern header, live status badge (`TRANSPORTER FLEET`), 70% automated hero carousel with exact screen-width snapping, 4 Transport Modality Cards (`Bike 🏍️`, `Taxi 🚕`, `Van 🚐`, `Plane ✈️`), and 20% capsule CTA button (`Start Driver Verification ➔`).
> - **4-Stage Driver KYC Form (`TransporterKYCScreen`):** 4-stage driver verification form (Stage 1: Driver Details & Experience Bio textarea, Stage 2: Vehicle Class Selector & Plate/Base Station, Stage 3: National ID CNI Front/Back & Driver's License photo, Stage 4: Vehicle Carte Grise, Assurance & Vehicle Photo, Stage 5: 24-Hour Review Notice).
> - **KYC Completion Redirection Rule:** Completing document submission in Driver KYC or Store KYC smoothly routes the user back to their initial Buyer Home Dashboard (`BuyerApp` root reset) while documents are verified.
> - **3D Clay-Style Character Avatar System:** Bundled local asset `mobile/assets/avatar.png` (3D stylized Black character portrait with sunglasses and teal hoodie) for instant 0ms offline loading, integrated into `Avatar.tsx` and `ProfileScreen.tsx` (52px with camera edit badge).
> - **Dynamic Cart Promo Banner:** Removed hardcoded static unlock banner in `BuyerCartScreen.tsx`; replaced with dynamic backend-driven notification state (`backendPromo`) with 6-second auto-dismiss timeout and manual close button.
> - **Slide-Out Navigation Drawer (`SidebarDrawer`):** 84% width overlay panel with interactive Wallet Balance Display (`walletBalanceBadge`, `47,500 XAF`) with privacy eye toggle button (`👁`), Partner cards, Delivery Addresses, Dark Appearance toggle, and Logout.
> - **Profile Screen (`ProfileScreen`):** Teal gradient Wallet Quick-Access banner card (`47,500 XAF`, `48H ESCROW`) and `My Wallet` tool shortcut.
> - **Product Detail Screen v2.0 (`ProductDetailScreen`):** Expansive 92% screen width hero image gallery stage (4% margins, 380px height), thumbnail strip selector, Top Floating Header Bar with 3-action buttons on same line (`❤️` Love, Share, Shopping Cart), verified merchant store card, 48H Escrow guarantee banner, 2-column Recommendation / Related Products grid ("You May Also Like ✨"), and optimized dual CTA bottom bar (`Add to Cart` + `Buy Now ➔`).
> - **App-Wide Native Pull-to-Refresh (`RefreshControl`):** Implemented across `<ScreenContainer>` and all list/grid screens with Emerald Teal tint (`#0D9488`).

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)  
3. [System Features & Functional Requirements](#3-system-features--functional-requirements)
4. [External Interface Requirements](#4-external-interface-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [Data Requirements & Payload Schemas](#6-data-requirements--payload-schemas)
7. [Development & Verification Matrix](#7-development--verification-matrix)

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) defines the complete functional and non-functional requirements for **Wunabuy**, a multi-sided mobile e-commerce marketplace connecting buyers, local stores, and transport providers across emerging African markets.

---

## 2. Overall Description

### 2.1 Product Perspective
Wunabuy consists of a **React Native monorepo** (`wunabuy-mobile`, `@wunabuy/design-tokens`, `@wunabuy/types`, `@wunabuy/utils`, `@wunabuy/api-client`) communicating with a **Laravel 13 API backend** via HTTPS REST endpoints and Laravel Reverb WebSockets.

---

## 3. System Features & Functional Requirements

### 3.1 User Authentication & OTP Verification
- **FR-001:** System SHALL support phone number entry with 6-digit SMS OTP verification.
- **FR-002:** Verifying OTP SHALL authenticate user session directly and redirect immediately to the Home Screen (`BuyerApp` -> `HomeScreen`).
- **FR-003:** System SHALL provide auto-fill demo number shortcuts for rapid QA testing (`+237 670 123 456`).

### 3.2 Home Feed & Navigation
- **FR-004:** Top AppBar SHALL feature hamburger menu button (`☰`) on left and Search, Notifications, Cart shortcuts on right.
- **FR-005:** System SHALL render active auto-scrolling hero carousel (`HeroCarousel`, 4.5s timer) and official partners slideshow (`PartnersCarousel`).
- **FR-006:** System SHALL render circular category avatars (`CategoryChip`) directly above the Best Sellers horizontal slider.

### 3.3 Orders, Escrow & Live GPS Tracking
- **FR-007:** My Orders dashboard SHALL display total locked escrow funds in 48-hour buyer protection.
- **FR-008:** Order cards SHALL provide a stacked full-width `Track Live GPS Order ➔` button and an equal 50/50 split row for `Confirm Receipt` and `Open Dispute`.
- **FR-009:** Live tracking map SHALL render Store, Driver (with speed & heading), and Buyer pins with live ETA badges and direct driver Call/Message triggers.
- **FR-010:** Confirming delivery signature SHALL trigger automatic release of escrow funds to merchant wallet.
- **FR-011:** Filing a dispute SHALL freeze escrow funds and escalate to staff mediation.

### 3.4 Buyer Wallet & Mobile Money Engine
- **FR-012:** System SHALL provide dedicated Buyer Wallet screen (`WalletScreen`) accessible via Drawer, Profile card, and tool shortcuts.
- **FR-013:** Wallet SHALL display Available Balance in XAF with privacy eye toggle (`👁`) and 48H Escrow protection badge.
- **FR-014:** System SHALL support Wallet Top-Up (Funding) and Withdrawals via MTN Mobile Money and Orange Money.
- **FR-015:** Bottom sheet modal SHALL render 4 distinct flow stages:
  1. Payment method selection & amount/phone form
  2. USSD dial-code prompt (`*126#` for MTN, `#150*50#` for Orange) with confirmation action
  3. Secure transaction verification loader
  4. Success / Failure result card with balance refresh trigger
- **FR-016:** System SHALL render paginated transaction history list displaying credit/debit indicators, provider badge, timestamp, and amount.

### 3.5 Seller Welcome & Multi-Step Store KYC Onboarding
- **FR-017:** Tapping "Become a Seller" SHALL launch `SellerWelcomeScreen` with 70% automated hero carousel (3.5s interval, 4 benefit cards) and 20% capsule CTA button.
- **FR-018:** Merchant KYC SHALL be structured into 4 stages with animated progress tracking (`25%`, `50%`, `75%`, `100%`).
- **FR-019:** Stage 1 SHALL collect Store Name, multiline Description textarea (`minHeight: 110px`, live `0/300` char limit counter), and horizontal category slider with multi-select checkmark chips (`✓ CategoryName`).
- **FR-020:** Stage 2 SHALL collect physical Street Address, City, and display GPS Location Auto-Pin Active notice.
- **FR-021:** Stage 3 & 4 SHALL collect National ID CNI number, Front/Back CNI photo uploads, storefront photo, and business registration doc.
- **FR-022:** Validation errors SHALL be displayed in high-contrast Error Callout Alert Banners (`alert-circle-sharp`, red tint `#FEF2F2`, red border `#EF4444`).
- **FR-023:** Stage 5 SHALL display completion celebration notice and trigger 24-hour compliance review queue.

### 3.6 Product Detail Screen & Dynamic Recommendations
- **FR-024:** Product Detail Screen (`ProductDetailScreen`) SHALL display an expansive hero gallery stage covering 92% screen width (4% side margins, 380px height) with rounded corners (`borderRadius: 20px`), quality tier pill badge, and thumbnail selector strip.
- **FR-025:** Top Floating Header Bar SHALL align the Back button on the left, and Favorite Love Icon (`❤️` / `🤍`), Native Share Button, and Shopping Cart Button (with live item count badge) on the same horizontal row on the right.
- **FR-026:** System SHALL query and render related products from the same category or verified stores in a 2-column Recommendation Grid ("You May Also Like ✨").
- **FR-027:** Tapping any recommended product card SHALL navigate smoothly into its product detail view (`navigation.push('ProductDetail', { productId: item.id })`).
- **FR-028:** Sticky Bottom Action Bar SHALL feature a compact `[ − 1 + ]` quantity stepper, 48px soft-teal `Add to Cart` button (`flex: 1.1`), and solid Emerald Teal `Buy Now ➔` button (`flex: 1.2`).

### 3.7 App-Wide Native Pull-to-Refresh
- **FR-029:** `<ScreenContainer>` SHALL provide default native `RefreshControl` support for all scrollable views with Emerald Teal branding tint (`#0D9488`).
- **FR-030:** FlatLists and ScrollViews on `SearchScreen`, `BuyerCartScreen`, `BuyerOrdersScreen`, `ProfileScreen`, `WalletScreen`, `SellerProductsScreen`, `TransporterJobsScreen`, `TransporterEarningsScreen`, and `SettingsScreen` SHALL implement active pull-to-refresh data re-fetching.

### 3.8 Transporter Onboarding & Driver KYC Lifecycle
- **FR-031:** Tapping "Become a Transporter" SHALL launch `TransporterWelcomeScreen` featuring a logo-free modern header, live status badge (`TRANSPORTER FLEET`), 70% automated hero carousel with 4 benefit cards, 4 Transport Modality Cards (`Bike 🏍️`, `Taxi 🚕`, `Van 🚐`, `Plane ✈️`), and 20% capsule CTA button.
- **FR-032:** Driver KYC (`TransporterKYCScreen`) SHALL collect Driver Info & Bio textarea (`minHeight: 110px`, `0/300` char limit) (Stage 1), Vehicle Class Selector & Operating Base Quarter (Stage 2), National ID CNI Front/Back & Driver's License photo (Stage 3), and Vehicle Carte Grise, Assurance, & Exterior Vehicle photo with plate visible (Stage 4).
- **FR-033:** Completing Stage 5 of Driver KYC or Store KYC SHALL automatically redirect the user to their initial Buyer Home Dashboard (`BuyerApp` root reset) while their application remains in the 24-hour compliance queue.

### 3.9 User Profile Picture & 3D Character Avatar System
- **FR-034:** System SHALL bundle a local 3D clay-style Black character avatar (`mobile/assets/avatar.png`) to serve as the default profile picture with 0ms offline latency.
- **FR-035:** `ProfileScreen` SHALL render a 52px circular avatar with Emerald border ring and a Camera Edit badge icon (`camera` in `#0D9488`).

### 3.10 Dynamic Cart Promotion & Auto-Dismiss Architecture
- **FR-036:** `BuyerCartScreen` SHALL hide promotional banners by default.
- **FR-037:** Promotional messages SHALL only be displayed upon receiving dynamic backend payload events (`backendPromo`) with a mandatory 6-second auto-dismiss timeout and manual close button.

### 3.11 Wunabuy Wallet Checkout & Neutral Payment Method Architecture
- **FR-038:** `CheckoutPaymentScreen` SHALL support dual payment tabs: **Wunabuy Wallet** (`PaymentMethod.WALLET`) with real-time balance checking, instant 1-tap escrow lock, and low-balance shortcut; and **Mobile Money** (`PaymentMethod.MOMO`) with MTN MoMo (`*126#`) and Orange Money (`#150*50#`).
- **FR-039:** Labels across all checkout and authentication screens SHALL be country-neutral ("Mobile Money Provider", "Mobile Phone Number").

### 3.12 ProductCard Quick-View Expand Modal & Horizontal Swipe Gallery
- **FR-040:** Tapping the circular `(+)` button on `ProductCard` SHALL expand an interactive preview modal featuring a high-performance horizontal swipe gallery (`FlatList horizontal pagingEnabled`), counter badge (`1 / 4`), pagination dots, 5-star ratings, description, quantity stepper `[ − 1 + ]`, `Add to Cart`, and `View Full Product ➔`.

### 3.13 Strict Default Buyer Role Isolation & App-Wide Navigation Safety
- **FR-041:** All user accounts SHALL default strictly to **Buyer** (`UserRole.BUYER`).
- **FR-042:** Seller and Transporter role switchers SHALL be completely **hidden** in Settings & Preferences until authorized by backend API staff approval.
- **FR-043:** Dedicated `Apply to Sell (Store Owner)` and `Apply to Transport (Driver)` application cards SHALL be rendered underneath active roles for unapproved users.
- **FR-044:** Every `navigation.goBack()` call across all 11+ screens SHALL check `navigation.canGoBack()` and fall back to graceful root stack reset (`BuyerApp`).

### 3.14 Seller Dashboard & Real-Time Operational Telemetry
- **FR-045:** `SellerDashboardScreen` SHALL provide a top header AppBar with 3-strokes hamburger button (`☰`) on the far left triggering `SellerSidebarDrawer`, and Notification Bell (`🔔`), QR Scanner (`🔲`), and Buyer Mode Cart Button (`🛒`) all aligned horizontally on the **same top line**.
- **FR-046:** Store Balances Card SHALL display formatted account identifier (`2 1 4 5 4 5 5 3 6`) with 1-tap copy, Available Earnings, Locked Escrow, eye toggle button (`👁`) for privacy masking, and quick `Withdraw Payout` CTA button.
- **FR-047:** Dashboard SHALL render Top Services 4x2 grid (`Send money`, `+ Product`, `Orders`, `Inventory`, `Dispatch`, `Store KYC`, `Settings`, `More`).
- **FR-048:** System SHALL render an auto-sliding Sales Tips & Merchant Growth Carousel Presenter (`SellerSalesTipsCarousel.tsx`, 4.5s timer) with lifestyle & product photography, conversion badges (`+45% CONVERSION`, `SEARCH BOOST`, etc.), and 1-tap navigation CTAs.
- **FR-049:** Dashboard SHALL replace static transaction lists with an interactive Store Products Catalog Grid displaying product image, name, category, quality tier pill, price in XAF, stock adjustment steppers `[ − qty + ]`, and `(+)` expand button triggering an expandable modal with multi-angle photo gallery and deep product telemetry.
- **FR-050:** KYC Status verification banner SHALL be **hidden by default** (`kycStatus === null`), dynamically rendering a celebratory dismissable "STORE VERIFIED BY STAFF" notice only upon explicit staff approval.

### 3.15 Order Fulfillment Queue & 2-Hour Acceptance SLA
- **FR-051:** `SellerOrdersScreen` SHALL enforce a real-time countdown timer (`⏳ HH:MM:SS`) for newly received orders. If not accepted within 2 hours, the order auto-cancels and triggers a buyer refund (BR-01).
- **FR-052:** Marking an order ready for pickup SHALL trigger the Dual Delivery Dispatch Modal with selectable options: **Wunabuy Express Transporter** (automated GPS rider broadcast) or **Store In-House Rider** (with optional driver phone entry).

### 3.16 Catalog & Inventory CRUD with Real-Time Stock Steppers
- **FR-053:** `SellerProductsScreen` SHALL provide real-time `[ − 1 + ]` stock steppers for 1-tap quantity updates, active/paused catalog toggles, and low-stock warning badges ($\le 5$ units).
- **FR-054:** `AddEditProductScreen` SHALL support 5-photo upload grid with native camera & gallery picker, category horizontal selector, and quality tier chips.

### 3.17 Merchant Store Wallet & Mobile Money Payout Engine
- **FR-055:** `SellerWalletScreen` SHALL provide instant payout requests to MTN MoMo (`*126#`) and Orange Money (`#150#`) with percentage quick presets (`25%`, `50%`, `75%`, `Max`), automated 1% telecom charge deduction calculation, and audit ledger.

### 3.18 Dedicated Merchant Profile Screen & Store Operations
- **FR-056:** `SellerTabNavigator` Tab 5 SHALL mount a dedicated `SellerProfileScreen` providing store avatar management, Store Name & ID copy, Store Wallet overview, Store Fulfillment Queue status grid (`Accept`, `Pack`, `Handover`, `En Route`, `Settled`), Store Management Tools (`Add Product`, `Catalog`, `Store KYC`, `GPS Hub`, `Alerts`), 1-Tap Switch to Buyer Workspace card, and active store listings showcase.

### 3.19 Merchant Sidebar Drawer & Navigation Isolation
- **FR-057:** `SellerSidebarDrawer` SHALL provide slide-out merchant navigation replacing buyer recruitment cards with store workspace operations (`Shop as Buyer`, `Express Transporters`, `Store Analytics`, and store navigation).
- **FR-058:** `RootNavigator` SHALL register all shared modal and auxiliary screens across `SELLER`, `TRANSPORTER`, and `BUYER` stacks, guaranteeing zero unhandled navigation route errors across all workspace transitions.
- **FR-059:** `RootNavigator` SHALL dynamically assign stack key `auth_workspace_${activeRole}`, guaranteeing zero route bleeding and strict isolation between Buyer, Seller, and Transporter stacks.
- **FR-060:** All Seller screens SHALL strictly adhere to the unified Emerald Teal (`#0D9488` / `#0F766E`) and Warm Amber (`#F59E0B`) design tokens.

---

## 4. Non-Functional Requirements

- **NFR-001:** Cold start time $\le 3\text{s}$ on mid-range Android devices over 3G networks.
- **NFR-002:** All action buttons MUST enforce safe bottom inset padding (`paddingBottom: Math.max(insets.bottom + spacing.xl, spacing['3xl'])`) to guarantee zero collision with Android soft keys.
- **NFR-003:** Monorepo type-checking MUST achieve 100% pass (`7 successful, 7 total`).
- **NFR-004:** KYC form cards MUST enforce 80% form card height / 20% action button proportion to guarantee optimal ergonomics on mobile screens.
- **NFR-005:** Product hero images MUST render with `resizeMode="cover"` without layout clipping or text bleeding.

---

### Approval Signatures

**Product Lead:** _Agemo Technologies_  
**Technical Lead:** _Antigravity (AI Lead Architect)_  
**QA Lead:** _Wunabuy QA Team_  

---
**[End of Software Requirements Specification v1.9]**

