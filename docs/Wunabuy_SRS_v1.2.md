# Software Requirements Specification (SRS)
# Wunabuy — Multi-Sided Mobile E-Commerce Platform

**Document Version:** 1.3 (Production Synchronized Baseline)  
**Date:** August 27, 2026  
**Status:** Approved / In Production Use  
**Companion Documents:** Wunabuy PRD v1.3, Wunabuy Backend Tech Spec v1.2  

> **Resolved Architecture & UI Specifications (August 27, 2026):**
> - **Backend:** Laravel 13 + Laravel Reverb WebSockets + PostgreSQL 15 (PostGIS).
> - **Direct OTP Auth:** `POST /api/v1/auth/otp/verify` logs user into account and redirects straight to Home.
> - **Home Screen Top AppBar:** Hamburger menu icon (`☰`) on left; Search (`🔍`), Notifications (`🔔` badge), and Cart (`🛍️` badge) on right. Subtitle greeting stack moved below AppBar.
> - **Partners Showcase (`PartnersCarousel`):** Replaces search bar with manual horizontal slideshow for official partners (MTN MoMo, Orange Money, Flutterwave, DHL, Ecobank).
> - **Categories Circular Slider (`CategoryChip`):** Placed directly above Best Sellers.
> - **My Orders & Escrow Dashboard (`BuyerOrdersScreen`):** Locked escrow summary header, status filter tabs, stacked full-width Track Order button, and equal 50/50 split Confirm Receipt & Open Dispute action buttons.
> - **Live GPS Map Tracking (`LiveTrackingMap`):** Custom map grid canvas with Store, Driver (with speed `24 km/h`), and Buyer pins, live ETA badge, driver profile card with Call (`📞`) and Message (`💬`) triggers.
> - **Slide-Out Navigation Drawer (`SidebarDrawer`):** 84% width overlay panel for User Profile summary, Partner Opportunities (Become a Seller/Transporter), Delivery Addresses, Dark Appearance toggle, and Logout.
> - **Dedicated Settings Page (`SettingsScreen`):** Separate route containing all preference options starting from saved delivery addresses downward.

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

---

## 4. Non-Functional Requirements

- **NFR-001:** Cold start time $\le 3\text{s}$ on mid-range Android devices over 3G networks.
- **NFR-002:** All action buttons MUST enforce safe bottom inset padding (`paddingBottom: Math.max(insets.bottom + spacing.xl, spacing['3xl'])`) to guarantee zero collision with Android soft keys.
- **NFR-003:** Monorepo type-checking MUST achieve 100% pass (`7 successful, 7 total`).

---

### Approval Signatures

**Product Lead:** _Agemo Technologies_  
**Technical Lead:** _Antigravity (AI Lead Architect)_  
**QA Lead:** _Wunabuy QA Team_  

---
**[End of Software Requirements Specification v1.3]**
