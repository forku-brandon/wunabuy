# Product Requirements Document (PRD)
# Wunabuy — Multi-Sided Mobile E-Commerce & Logistics Platform

**Document Version:** 1.2  
**Status:** Revised / Launch-Ready Production Baseline  
**Date:** August 27, 2026  
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

---

## 1. Product Vision & Value Proposition

### 1.1 Vision Statement
Wunabuy aims to become the definitive multi-sided mobile e-commerce and logistics marketplace across emerging African markets by bridging buyers, local merchant stores, and independent motorcycle/vehicle transporters into a high-trust, escrow-backed digital ecosystem.

### 1.2 Core Value Proposition
- **For Buyers:** Unlocks reliable local product discovery, verified merchant authentications, transparent delivery pricing, real-time GPS tracking, and absolute payment safety via escrow protection.
- **For Store Owners (Sellers):** Digitizes local brick-and-mortar storefronts, provides streamlined mobile inventory management, instant order notifications, guaranteed payouts upon verified delivery, and viral shoppable video features.
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
Wunabuy addresses these challenges through a **mobile-first, offline-resilient app suite** supported by an **escrow payment architecture** (MTN MoMo, Orange Money, Flutterwave, Paystack) that holds funds securely until the buyer or system confirms valid product delivery.

---

## 3. Target User Personas & User Journeys

### 3.1 User Personas

#### Persona 1: Amadou (The Tech-Savvy Buyer)
- **Demographics:** 26 years old, university graduate, uses mid-range Android smartphone in Yaoundé.
- **Needs:** Looking for verified electronics and fashion items nearby; wants guaranteed refund if product is defective.
- **Behavior:** Prefers paying via Mobile Money (MTN MoMo); expects real-time updates when driver picks up item.

#### Persona 2: Mama Chantal (The Boutique Seller)
- **Demographics:** 42 years old, small business owner running a clothing and accessories store.
- **Needs:** Wants to list products easily without complex technical setup; needs fast, guaranteed bank/MoMo payouts.
- **Behavior:** Low to moderate tech literacy; relies on clear mobile notifications and simple visual dashboards.

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
- **Transport Fleet:** Target 200+ active riders in primary launch city.
- **Dispute Rate:** Maintain total order disputes below $2.0\%$.
- **Average Delivery Fulfillment Time:** $\le 45\text{ minutes}$ from store acknowledgment to doorstep delivery.
- **Merchant KYC Processing Time:** $\le 24\text{ hours}$ end-to-end review latency.
- **App Performance:** Cold start time $\le 3\text{s}$ on mid-range Android devices over 3G networks.

---

## 5. UI/UX Architecture & Screen Specifications (v1.2 Update)

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
- **Top Header Stack**:
  - Square soft-shadow menu icon button (`☰`, `borderRadius: 14`) opening the slide-out navigation drawer.
  - Greeting stack: `Hello, [User Name]! ✨` | `Discover Products` | `48-hour escrow protection on every purchase`.
  - Notification Bell icon (`🔔`) with red count badge (`3`) + Shopping Bag shortcut (`🛍️`).
- **Active Auto-Scrolling Hero Carousel (`HeroCarousel`)**: Rotates automatically every 4.5 seconds across 3 feature banners (`100% ESCROW GUARANTEE`, `VERIFIED LOCAL STORES`, `EXPRESS GPS DELIVERY`), featuring white oval CTA buttons and 5-dot active indicators (`▪ ▫ ▫ ▫ ▫`).
- **Search & Filter Row**: Full-width rounded search pill (`Search for products...`) + square rounded filter button (`🎛️`).
- **Circular Category Avatar Slider (`CategoryChip`)**: 6 circular avatar items (`width: 58, height: 58`, light teal `#F0FDFA` bg) with icons & text labels (`Skincare`, `Makeup`, `Fragrance`, `Haircare`, `Tools`, `Offers`).
- **Best Sellers Horizontal Scroll Section**: Cards featuring top-right favorite heart button (`♡`), 5-star rating row (`★★★★★`), price (`18 500 FCFA`), and primary Teal circular `+` quick-add button.
- **Special Offer Promo Card**: Light teal rounded card (`#F0FDFA`, `borderRadius: 24`) with `Special Offer` eyebrow, `Up to 30% Off` headline, white `Grab Now ➔` CTA button, and circular `30% OFF` badge.
- **Explore Verified Items Product Grid**: 2-Column purchasing product feed below the Special Offer card enabling buyers to browse and purchase items directly from the main feed.

### 5.4 Slide-Out Navigation Drawer (`SidebarDrawer`)
- **Overlay Panel**: Covers 84% screen width from left upon tapping the top-left hamburger menu (`☰`).
- **Header & Profile Summary**: Wunabuy Logo, user Avatar, Full Name, Phone number, and `BUYER ACCOUNT` badge.
- **Partner Opportunities**:
  - 🏪 **Become a Seller (Store Owner)**: Navigates to `StoreKYC` screen.
  - 🚚 **Become a Transporter (Driver)**: Opens Driver Onboarding workflow.
- **Preferences & Account**: Delivery Addresses (`AddressManager`), Notification Settings, Dark Appearance toggle, and Logout action button.

### 5.5 Profile Screen (Me Tab Structure — `ProfileScreen`)
- **Top Profile Header Row**: User Avatar, Full Name, Phone Number, and top-right **Settings Gear Icon button (`⚙️`)**.
- **"My Orders" Status Grid**:
  - 💳 **To Pay** (Pending Payment)
  - 📦 **To Ship** (Paid Escrow / Preparing, badge `3`)
  - 🚚 **To Receive** (En Route / In Transit, badge `15`)
  - 💬 **To Review** (Delivered / Received, badge `1`)
  - 💸 **Refund** (Disputed / Cancelled)
- **Quick Services & Tools Grid**:
  - Row 1: 🛫 `Overseas Ship`, 📍 `Shipping Address`, 🏬 `Followed Stores`, ⭐ `Favorites`, 🐾 `Footprints`
  - Row 2: 💬 `Help Center`, 💳 `Pay Later`, 🌟 `PLUS Member`, 🎟️ `Vouchers`, 🛡️ `88 Solution` (Escrow Guarantee)
- **"Recommended For You" Product Grid**: 2-Column purchasing grid below the tools section.

### 5.6 Dedicated Settings & Preferences Page (`SettingsScreen`)
- Houses all account & preference management options starting from saved delivery addresses downward:
  - 📍 **Saved Delivery Addresses** (`AddressManager`)
  - 🔔 **Notification Preferences** (`NotificationSettings`)
  - 🌐 **Language Selection** (`LanguageSelectorModal` for English / French)
  - 💱 **Currency Settings** (`FCFA / XAF`)
  - 🎨 **Appearance** (`Dark Mode` switch)
  - 🛡️ **Application Security & Biometrics**
  - 📱 **Manage Connected Devices**
  - 🔑 **Change Password / PIN**
  - 🏪 **Partner Role Switcher Card** (`RoleSwitcherCard`)
  - 🚪 **Logout Account** button

---

## 6. Functional Requirements (EPICs & Features)

### EPIC 1: User Management & Authentication Framework
- **FR-001 (High):** Registration via mobile phone number with 6-digit SMS OTP verification.
- **FR-002 (High):** Direct account login and OTP verification linking mobile numbers directly to Home user accounts.
- **FR-003 (High):** `Transporter` permissions granted exclusively by Wunabuy Admin/Operations staff in the Staff Portal after vehicle & driver license verification.
- **FR-004 (High):** Secure session management using API access tokens and refresh tokens.
- **FR-005 (High):** Staff Portal MFA with 15-minute inactivity auto-logout.

### EPIC 2: Store Onboarding & KYC Verification
- **FR-006 (High):** Merchant KYC submission with ID, storefront photo, GPS location, and business registration or ownership affidavit.
- **FR-007 (High):** Document validation and encrypted storage for KYC evidence.
- **FR-008 (High):** Staff review queue for Approve, Reject, and Request Info actions.
- **FR-009 (High):** Push and SMS notification on KYC status changes.
- **FR-010 (High):** Suspicious or duplicate KYC submissions flagged for staff review.

### EPIC 3: Product Catalog, Inventory & Search
- **FR-011 (High):** Seller can create product listings with up to 5 images, price, description, stock quantity, and quality tier.
- **FR-012 (High):** Inventory decrements automatically after order confirmation and triggers low-stock alerts at $\le 5$ units.
- **FR-013 (High):** Search supports full-text search, category filters, rating filter, price range, and geographic radius filters.
- **FR-014 (High):** Product detail page includes stock, reviews, seller rating, delivery estimate, and order availability.
- **FR-015 (Medium):** Product editing is allowed unless fulfillment is already active.

### EPIC 4: Commerce, Payments & Escrow
- **FR-016 (High):** Buyer can add products to cart, choose address, review order, and pay.
- **FR-017 (High):** Flutterwave is the primary payment gateway; Paystack is the fallback.
- **FR-018 (High):** Funds are held in escrow until delivery confirmation or failure resolution.
- **FR-019 (High):** Store wallet tracks available balance, escrow balance, transactions, and payouts.
- **FR-020 (High):** Platform commission is configurable and applied to confirmed sales.

### EPIC 5: Logistics & Delivery
- **FR-021 (High):** Stores can assign delivery to a transporter or use in-house delivery.
- **FR-022 (High):** Nearby transport providers receive job notifications and can accept or reject jobs.
- **FR-023 (High):** GPS route and live tracking updates are visible to buyer and store.
- **FR-024 (High):** Proof-of-delivery photo is required before the order is marked delivered.
- **FR-025 (High):** Delivery fee is calculated using distance, base rate, and vehicle class.

---

## 7. Critical Business Rules (Launch Requirements)

| Rule ID | Rule | Operational Requirement |
|---|---|---|
| BR-01 | Store acknowledgment timeout | Store must acknowledge a new order within 2 hours or the order auto-cancels and the buyer is refunded. |
| BR-02 | Escrow release | Escrow releases automatically 48 hours after delivery confirmation if no dispute is raised. |
| BR-03 | Dispute freeze | Escrow remains frozen while a dispute is open or being reviewed. |
| BR-04 | Payment failure fallback | If primary gateway fails, the system retries through Paystack or marks transaction as pending. |
| BR-05 | Refund authority | Only approved staff or the system can trigger a refund according to dispute policy. |
| BR-06 | Rider no-show | If a rider does not accept or reach the pickup point within a configured window, the order is reassigned or auto-cancelled. |
| BR-07 | KYC re-submission | Users may resubmit KYC only up to 3 times before being escalated for manual review. |
| BR-08 | Suspended seller restrictions | Suspended or unverified stores cannot list products or receive payments. |
| BR-09 | Chat safety | Off-platform payment requests and spam patterns are blocked and escalated to staff moderation. |
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
│   (PostGIS, Reverb WS)      │ │  (Redis Queue Workers)│ │ (Flutterwave, Maps, SMS)  │
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
4. **Documentation:** PRD document updated to reflect exact codebase state and UI specifications.

---

### Approval Signatures

**Product Manager:** _Agemo Technologies Product Lead_  
**Technical Lead:** _Antigravity (AI Lead Architect)_  
**Lead QA Engineer:** _Wunabuy Quality Assurance Team_  

---
**[End of Product Requirements Document]**
