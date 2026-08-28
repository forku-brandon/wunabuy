# Software Requirements Specification (SRS)
# Wunabuy — Multi-Sided Mobile E-Commerce Platform

**Document Version:** 1.4 (Production Synchronized Baseline)  
**Date:** August 28, 2026  
**Status:** Approved / In Production Use  
**Companion Documents:** Wunabuy PRD v1.4, Wunabuy Backend Tech Spec v1.3  

> **Resolved Architecture & UI Specifications (August 28, 2026):**
> - **Backend:** Laravel 13 + Laravel Reverb WebSockets + PostgreSQL 15 (PostGIS).
> - **Direct OTP Auth:** `POST /api/v1/auth/otp/verify` logs user into account and redirects straight to Home.
> - **Home Screen Top AppBar:** Hamburger menu icon (`☰`) on left; Search (`🔍`), Notifications (`🔔` badge), and Cart (`🛍️` badge) on right. Subtitle greeting stack moved below AppBar.
> - **Partners Showcase (`PartnersCarousel`):** Replaces search bar with manual horizontal slideshow for official partners (MTN MoMo, Orange Money, Flutterwave, DHL, Ecobank).
> - **Categories Circular Slider (`CategoryChip`):** Placed directly above Best Sellers.
> - **Buyer Wallet Architecture (`WalletScreen`):** In-app mobile wallet supporting MTN MoMo (`*126#`) & Orange Money (`#150*50#`) funding/withdrawals with 50-70% responsive bottom sheets, USSD instructions, live validation, and transaction ledger.
> - **Seller Welcome Onboarding (`SellerWelcomeScreen`):** 70% automated hero carousel (3.5s interval, 4 benefit cards) and 20% capsule CTA button (`Get Started Now ➔`).
> - **4-Stage Store KYC Form (`StoreKYCScreen`):** 80% scrollable form grid / 20% action button split, animated progress bar (`25%` -> `100%`), 5-line description textarea, Error Callout Alert Banner, and Stage 5 celebration modal.
> - **Slide-Out Navigation Drawer (`SidebarDrawer`):** 84% width overlay panel with My Wallet entrypoint (`MoMo` badge), Partner cards, Delivery Addresses, Dark Appearance toggle, and Logout.
> - **Profile Screen (`ProfileScreen`):** Teal gradient Wallet Quick-Access banner card (`47,500 XAF`, `48H ESCROW`) and `My Wallet` tool shortcut.

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
- **FR-019:** Stage 1 SHALL collect Store Name, 5-line Description textarea (`minHeight: 110px`), and Category chips.
- **FR-020:** Stage 2 SHALL collect physical Street Address, City, and display GPS Location Auto-Pin Active notice.
- **FR-021:** Stage 3 & 4 SHALL collect National ID CNI number, Front/Back CNI photo uploads, storefront photo, and business registration doc.
- **FR-022:** Validation errors SHALL be displayed in high-contrast Error Callout Alert Banners (`alert-circle-sharp`, red tint `#FEF2F2`, red border `#EF4444`).
- **FR-023:** Stage 5 SHALL display completion celebration notice and trigger 24-hour compliance review queue.

---

## 4. Non-Functional Requirements

- **NFR-001:** Cold start time $\le 3\text{s}$ on mid-range Android devices over 3G networks.
- **NFR-002:** All action buttons MUST enforce safe bottom inset padding (`paddingBottom: Math.max(insets.bottom + spacing.xl, spacing['3xl'])`) to guarantee zero collision with Android soft keys.
- **NFR-003:** Monorepo type-checking MUST achieve 100% pass (`7 successful, 7 total`).
- **NFR-004:** KYC form cards MUST enforce 80% form card height / 20% action button proportion to guarantee optimal ergonomics on mobile screens.

---

### Approval Signatures

**Product Lead:** _Agemo Technologies_  
**Technical Lead:** _Antigravity (AI Lead Architect)_  
**QA Lead:** _Wunabuy QA Team_  

---
**[End of Software Requirements Specification v1.4]**
