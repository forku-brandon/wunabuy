# Software Requirements Specification (SRS)
# Wunabuy — Multi-Sided Mobile E-Commerce Platform

**Document Version:** 1.2  
**Date:** July 25, 2026  
**Status:** Draft — Under Revision  

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)  
3. [System Features](#3-system-features)
4. [External Interface Requirements](#4-external-interface-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [Data Requirements](#6-data-requirements)
7. [Development Approach](#7-development-approach)
8. [Appendices](#8-appendices)

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) defines the complete functional and non-functional requirements for **Wunabuy**, a multi-sided mobile e-commerce marketplace designed to connect customers with local stores and transport providers across African markets. The platform is operated by a company whose internal staff manage day-to-day operations through a dedicated Staff Portal with role-based access control across multiple departments. This document serves as the authoritative reference for all stakeholders — including product managers, developers, QA engineers, business executives, and company operations staff.

### 1.2 Document Conventions

| Convention | Meaning |
|---|---|
| **SHALL** | Mandatory requirement |
| **SHOULD** | Recommended but not mandatory |
| **MAY** | Optional feature |

Requirements are identified as FR-XXX (Functional) or NFR-XXX (Non-Functional) for traceability.

### 1.3 Intended Audience

| Audience | Use |
|---|---|
| Product Management | Feature scoping, backlog prioritization |
| Engineering Team | Architecture design, implementation reference |
| QA Team | Test case design, acceptance criteria |
| UI/UX Designers | User flow understanding, interface requirements |
| Business Stakeholders | Investment decisions, go-to-market planning |
| Company Operations Staff | Role permissions, departmental workflow understanding |

### 1.4 Project Scope

**In Scope:**
- Mobile app (iOS & Android via React Native) for Customers (Buyers, Sellers, Transport Providers)
- Store KYC verification (identity, location, ownership proof)
- Product catalog with inventory management
- Advanced search with filters (price, location, quantity, quality, rating)
- Smart Discovery engine: rules-based ranking by location, price, quality, and user behavior (Phase 1)
- Escrow-based payment: mobile money (MTN MoMo, Orange Money) + card (Flutterwave/Paystack)
- Real-time GPS delivery tracking via Google Maps
- Review, rating & dispute resolution
- In-app chat: real-time messaging between all users (buyer↔seller, buyer↔buyer, seller↔seller) with media sharing, typing indicators, and message search
- Staff Portal (separate web application) with departmental dashboards, role-based access control (RBAC), and audit logging for company staff across Accounting/Finance, IT/Engineering, Customer Service, Operations, Compliance/Legal, and Marketing
- Multi-language support (English, French, Swahili)

**Out of Scope (Phase 2+):**
- Social Video Feed: short-form vertical video (mini TikTok) where sellers post product showcase videos; buyers watch, like, comment, follow/subscribe stores; optional product tagging (shoppable videos)
- Web storefront for customers, cross-border logistics, full ML recommendation models (collaborative filtering, dynamic pricing, demand prediction), loyalty program, B2B wholesale

> **Scope change from v1.0:** AI/ML recommendations were previously fully out of scope. Per v1.1, lightweight rules-based Smart Discovery ranking is now in Phase 1 scope. Full ML model training, collaborative filtering, and dynamic pricing remain Phase 2. The standalone Admin Dashboard has been replaced by the comprehensive Staff Portal with departmental RBAC.
>
> **Scope change from v1.1 to v1.2:** In-app chat (all-user messaging) added to Phase 1 scope. Social Video Feed (short-form video with social engagement) added as Phase 2 scope — sellers post, buyers watch/like/comment/follow, optional shoppable product tags.

### 1.5 References

| Reference | Description |
|---|---|
| IEEE 830-1998 | IEEE Recommended Practice for SRS |
| Pinduoduo | Group-buying, social commerce, C2M supply chain |
| Alibaba/Taobao | Alipay escrow: funds held until delivery confirmed |
| Amazon Marketplace | Third-party seller model, review system |
| Flutterwave API | Payment gateway for African markets |
| Google Maps Platform | Geolocation, tracking APIs |
| Laravel 13 | PHP 8.3+, Eloquent, Sanctum, Horizon, Reverb |
| PostgreSQL 15 | Relational DB, PostGIS spatial extension, JSONB |
| OWASP RBAC | Role-based access control best practices |

---

## 2. Overall Description

### 2.1 Product Perspective

Wunabuy is a multi-sided e-commerce ecosystem operated by a company. It bridges four user groups into an integrated marketplace, with a dedicated Staff Portal for the company's internal team to manage operations:

```
+---------------------------------------------------------------------------+
|                         WUNABUY PLATFORM                                   |
|                                                                            |
|  +----------+   +----------+   +------------------+   +---------------+  |
|  | CUSTOMER |   |  STORE   |   |   TRANSPORT      |   |    STAFF      |  |
|  |   App    |   |  Owner   |   |   Provider App   |   |   Portal (Web)|  |
|  | (Mobile) |   |  (Mobile)|   |    (Mobile)      |   |   (Internal)  |  |
|  +----+-----+   +----+-----+   +--------+---------+   +-------+-------+  |
|       |              |                  |                      |         |
|  +----+--------------+------------------+----------------------+-------+  |
|  |                  BACKEND (Laravel 13 + Horizon)                    |  |
|  |  Auth │ Orders │ Payment │ Search │ Smart Ranking │ KYC │ Track  |  |
|  |  RBAC │ Audit Log │ Staff Roles │ Permissions                     |  |
|  +--------------------------------------------------------------------+  |
|                                                                            |
|  +--------------------------------------------------------------------+  |
|  |       EXTERNAL: Google Maps │ Flutterwave │ Paystack               |  |
|  |       MTN MoMo │ Orange Money │ SMS Gateway                        |  |
|  +--------------------------------------------------------------------+  |
+---------------------------------------------------------------------------+
```

### 2.2 Product Functions

| Area | Description |
|---|---|
| User Management | Registration, auth (phone+OTP, email, social SSO), profiles; three customer-facing roles: Buyer, Seller (verified store owner), Transport Provider |
| Store Onboarding | KYC workflow: document upload, location verification, approval |
| Product Catalog | Upload with images, pricing, stock; bulk upload; inventory tracking |
| Search & Discovery | Full-text search; filter by price, distance, quality, rating |
| Smart Discovery | Rules-based ranking engine: location proximity, price competitiveness, quality tier, store rating, user behavior signals, popularity scoring |
| In-App Chat | Real-time messaging between all users: buyer↔seller, buyer↔buyer, seller↔seller; media sharing, typing indicators, message search, block/report |
| Social Video Feed (Phase 2) | Short-form vertical video: sellers post product showcases; buyers watch, like, comment, follow stores; optional shoppable product tags |
| Escrow Payment | Pay → Hold → Deliver → Confirm → Release to store |
| Order Lifecycle | Pending → Paid → Preparing → In Transit → Delivered → Completed |
| Delivery Tracking | Real-time GPS via Google Maps; ETA; photo confirmation |
| Reviews & Ratings | Star ratings, text/photo reviews; weighted aggregation |
| Staff Portal | Departmental dashboards, RBAC, KYC review, dispute resolution, financial reconciliation, system monitoring, compliance tracking, audit logging |
| Notifications | Push (FCM/APNs), SMS fallback, in-app center |

### 2.3 User Classes

#### Buyer (Customer)
- Technical level: Low-moderate (smartphone user)
- Onboarding: Phone + OTP
- Volume: 5,000+ registered, ~500 concurrent
- Key needs: Find goods nearby, compare prices, pay securely, track delivery, chat with sellers and other buyers, watch product videos

#### Seller (Store Owner)
- Technical level: Low-moderate (small business owners)
- Onboarding: KYC required (ID, store photos, location, business proof)
- Volume: 1,000+ stores
- Key needs: Upload products, manage inventory, receive orders, track earnings, chat with buyers, post product showcase videos (Phase 2), build store following

#### Transport Provider
- Technical level: Low (riders, drivers)
- Onboarding: Vehicle registration, license, photo
- Volume: 200+ active in launch city
- Key needs: Receive delivery jobs, navigate, earn

#### Company Staff (Staff Portal Users)
Company personnel who manage the platform through the Staff Portal web application. Each staff member belongs to one or more departments with specific role-based permissions.

| Department | Roles | Key Responsibilities |
|---|---|---|
| **Accounting/Finance** | Finance Officer, Senior Accountant, Finance Manager | Escrow reconciliation, payout approvals, commission tracking, financial reporting, tax compliance |
| **IT/Engineering** | IT Support, System Admin, DevOps Engineer | System health monitoring, configuration management, incident response, user access provisioning |
| **Customer Service** | Support Agent, Senior Support, Support Lead | User inquiries, order assistance, dispute mediation, refund processing |
| **Operations** | Operations Agent, Operations Manager | Store relations, delivery logistics oversight, KYC review, platform configuration |
| **Compliance/Legal** | Compliance Officer, Legal Reviewer | KYC approval authority, regulatory compliance, fraud investigation, legal documentation |
| **Marketing** | Marketing Coordinator, Marketing Manager | Promotional campaigns, featured product curation, analytics review, user acquisition |
| **Super Admin** | Platform Administrator | Full system access, role assignment, all departmental functions, audit log review |

> **Multi-role support:** A staff member MAY be assigned to multiple departments. Permissions are additive across assigned roles.

### 2.4 Operating Environment

| Component | Specification |
|---|---|
| Customer/Store/Transport App | iOS 15+, Android 10+ (React Native) |
| Staff Portal | Modern web browser (Chrome 100+, Firefox 100+, Safari 15+, Edge 100+) |
| Network | 3G/4G/LTE/WiFi (low-bandwidth optimized for mobile apps) |
| Backend | Laravel 13 (PostgreSQL 15 + PostGIS) + Laravel Horizon + Redis 7 |
| Storage | Laravel Flysystem (AWS S3 / Supabase Storage driver) |
| Notifications | FCM / APNs |
| Maps | Google Maps SDK + Platform APIs |
| Payments | Flutterwave (primary), Paystack (fallback) |

### 2.5 Design Constraints

| ID | Constraint |
|---|---|
| C1 | Mobile-first for customer-facing apps — no web storefront in Phase 1 |
| C2 | Staff Portal is web-only — no mobile app for internal staff in Phase 1 |
| C3 | Offline resilience with graceful degradation (mobile apps) |
| C4 | Low bandwidth optimized: <2MB initial load on 3G (mobile apps) |
| C5 | Multi-currency: XAF, NGN, KES, USD |
| C6 | Regulatory: NDPR (Nigeria), DPA (Kenya) |
| C7 | React Native for cross-platform mobile apps |
| C8 | Laravel 13 + Horizon + Redis backend |
| C9 | Staff Portal: React (web) — separate codebase from mobile apps |
| C10 | All staff actions logged in immutable audit trail |

### 2.6 Assumptions & Dependencies

| # | Item |
|---|---|
| A1 | Users have smartphones (Android 10+ / iOS 15+) |
| A2 | 3G+ network coverage in target areas |
| A3 | Payment gateways support target countries |
| A4 | Google Maps coverage adequate in target cities |
| A5 | Company staff have access to desktop/laptop computers with modern browsers |
| D1 | Flutterwave/Paystack API uptime |
| D2 | Laravel backend & PostgreSQL database availability |
| D3 | SMS gateway (Africa's Talking/Twilio) for OTP |

---

## 3. System Features

### 3.1 User Management & Authentication

| ID | Requirement | Priority |
|---|---|---|
| FR-001 | Register via phone number with SMS OTP | High |
| FR-002 | Register via email with password | High |
| FR-003 | Social login (Google, Facebook) | Medium |
| FR-004 | Role choice on self-registration restricted to Buyer or Seller (Store Owner); Transporter role granted exclusively via Wunabuy Admin/Operations vetting approval in Staff Portal | High |
| FR-005 | Multi-role support (e.g., Buyer + Transport Provider with separate verification) | Low |
| FR-006 | JWT-based session management (access + refresh tokens) | High |
| FR-007 | Password reset via SMS or email | High |
| FR-008 | Phone number uniqueness enforced platform-wide | High |
| FR-009 | Profile management: name, photo, contact, default address | Medium |
| FR-010 | Multiple delivery addresses per customer | Medium |

> **Terminology change from v1.0:** "Customer" role renamed to "Buyer" for clarity. "Store Owner" renamed to "Seller." These are the three customer-facing roles: Buyer, Seller, Transport Provider.

### 3.2 Store Registration & KYC Verification

KYC State Machine: `Registration → Pending → Under Review → Approved (Active) / Rejected (Retry up to 3x)`

| ID | Requirement | Priority |
|---|---|---|
| FR-011 | Multi-step KYC: personal ID, store details, location pin, document upload | High |
| FR-012 | Required docs: government ID (front/back), storefront photo, GPS location, business registration or ownership affidavit | High |
| FR-013 | Validate photo clarity and authenticity | High |
| FR-014 | KYC queue with status: Pending → Under Review → Approved/Rejected | High |
| FR-015 | Staff Portal: Compliance/Operations staff approve/reject/request-info actions | High |
| FR-016 | Notify via push + SMS on KYC decision | High |
| FR-017 | Allow resubmission up to 3 times | Medium |
| FR-018 | KYC documents encrypted at rest (AES-256) | High |
| FR-019 | Flag suspicious submissions (duplicate IDs, blacklisted phones) | High |
| FR-020 | Approved stores immediately access product features | High |

### 3.3 Product & Inventory Management

| ID | Requirement | Priority |
|---|---|---|
| FR-021 | Add product: name, description, category, price, quantity, quality tier (New/Like New/Good/Fair), up to 5 photos | High |
| FR-022 | Categories: Electronics, Fashion, Food & Groceries, Home & Garden, Health & Beauty, Automotive, Services, Other | High |
| FR-023 | Auto inventory: decrement on sale; alert at ≤5 units | High |
| FR-024 | Hide/unhide product (pause sales) | Medium |
| FR-025 | Bulk upload via CSV | Medium |
| FR-026 | Image compression: thumbnail 200px, display 800px | High |
| FR-027 | Validate: ≥1 photo, price > 0 | High |
| FR-028 | Edit products (except during active fulfillment) | Medium |
| FR-029 | Hide products from unverified/suspended stores | High |
| FR-030 | Product variants (size, color) with separate pricing — Phase 2 | Low |

### 3.4 Customer Search & Product Discovery

| ID | Requirement | Priority |
|---|---|---|
| FR-031 | Full-text search across names, descriptions, categories | High |
| FR-032 | Filters: price range, location radius, quality tier, minimum store rating, category | High |
| FR-033 | Sort: relevance, price (asc/desc), distance, store rating, newest | High |
| FR-034 | Results display: thumbnail, name, price, store, distance, rating, availability | High |
| FR-035 | Category browsing with subcategories | Medium |
| FR-036 | Fuzzy matching / typo tolerance | Medium |
| FR-037 | Recent searches cache and suggestions | Low |
| FR-038 | Product detail: photo carousel, full description, price, stock, store info, rating, delivery estimate, reviews | High |
| FR-039 | Smart Discovery ranking applied to all search and browse results (see Section 3.10) | High |

### 3.5 Order Management & Escrow Payment

**Order State Machine:**
```
PENDING_PAYMENT → PAID_ESCROW → PREPARING → READY_FOR_PICKUP → IN_TRANSIT → DELIVERED → RECEIVED → COMPLETED
                                                                                              ↓
                                                                                           DISPUTED → RESOLVED
```

| ID | Requirement | Priority |
|---|---|---|
| FR-040 | Add to cart and checkout flow | High |
| FR-041 | Checkout: order summary, address selector, transport estimate, total | High |
| FR-042 | Flutterwave integration: card + mobile money (MoMo) | High |
| FR-043 | Paystack as fallback gateway | Medium |
| FR-044 | Escrow: funds held until delivery confirmation | High |
| FR-045 | Push + in-app notification to store on new order | High |
| FR-046 | Store must acknowledge within 2 hours or auto-cancel + refund | High |
| FR-047 | Cancellation: by customer (pre-preparing), by store, auto-timeout | High |
| FR-048 | Auto-refund on cancellation | High |
| FR-049 | Full audit trail of order state transitions | High |
| FR-050 | Customer order history with status | High |
| FR-051 | Store order dashboard with filters | High |
| FR-052 | Platform commission (configurable, default 5-10%) | High |
| FR-053 | Store wallet: escrow balance, available balance, transactions, payouts | High |
| FR-054 | Auto-release escrow after 48 hours if no dispute | High |
| FR-055 | Staff Portal: Finance staff can view escrow balances, approve/reject payouts, reconcile transactions | High |

### 3.6 Delivery & GPS Tracking

| ID | Requirement | Priority |
|---|---|---|
| FR-056 | Store assigns transporter or uses own delivery | High |
| FR-057 | In-house delivery: store acts as transporter | Medium |
| FR-058 | Transport job notification: pickup, drop-off, item, fee | High |
| FR-059 | Accept/decline delivery jobs | High |
| FR-060 | Route optimization via Google Maps Directions API | High |
| FR-061 | Real-time GPS tracking (10s intervals) via Maps SDK | High |
| FR-062 | Customer views transporter location + ETA on map | High |
| FR-063 | Status updates: En Route → Picked Up → In Transit → Delivered | High |
| FR-064 | Delivery confirmation photo upload | Medium |
| FR-065 | Fee calculation: Distance Matrix + base rate + vehicle multiplier | High |
| FR-066 | Transport payment: bundled or COD | Medium |
| FR-067 | Delivery history with metrics | Medium |
| FR-068 | Staff Portal: Operations staff can monitor active deliveries, reassign transporters, override fees | Medium |

### 3.7 Review, Rating & Dispute Resolution

| ID | Requirement | Priority |
|---|---|---|
| FR-069 | Post-delivery rating: product (1-5), store service (1-5), transporter (1-5) | High |
| FR-070 | Text reviews + photo uploads | Medium |
| FR-071 | Store rating: weighted aggregate (70% product + 30% service) | High |
| FR-072 | Transporter rating: aggregate of delivery reviews | High |
| FR-073 | Display ratings on profiles, listings, and search results | High |
| FR-074 | Dispute reasons: wrong item, damaged, not as described, non-delivery | High |
| FR-075 | Dispute workflow: Customer opens → Store 24h to respond → Staff Portal mediation | High |
| FR-076 | Freeze escrow during disputes | High |
| FR-077 | Staff Portal: Customer Service staff handle dispute mediation; Compliance staff handle fraud investigations | High |
| FR-078 | Flag stores with >10% dispute rate for review/suspension | Medium |

### 3.8 Staff Portal & Internal Operations

The Staff Portal is a dedicated web application for company personnel to manage the Wunabuy platform. It replaces the standalone Admin Dashboard from v1.0 with a comprehensive, role-based internal operations system.

#### 3.8.1 Authentication & Access Control

| ID | Requirement | Priority |
|---|---|---|
| FR-079 | Staff login via email + password with mandatory MFA (TOTP) | High |
| FR-080 | Role-based access control (RBAC): permissions assigned per department role | High |
| FR-081 | Staff member MAY hold multiple department roles; permissions are additive | High |
| FR-082 | Super Admin can create/edit/deactivate staff accounts and assign roles | High |
| FR-083 | Session timeout after 15 minutes of inactivity | High |
| FR-084 | IP allowlist for Staff Portal access (configurable by IT/System Admin) | Medium |
| FR-085 | All staff actions logged to immutable audit trail (who, what, when, before/after) | High |
| FR-086 | Audit log searchable and exportable (Super Admin, Compliance) | High |

#### 3.8.2 RBAC Permission Matrix

| Permission | Accounting | IT/Eng | Cust. Service | Operations | Compliance | Marketing | Super Admin |
|---|---|---|---|---|---|---|---|
| View financial dashboard | ✅ | — | — | — | ✅ (read) | — | ✅ |
| Approve/reject payouts | ✅ (Mgr+) | — | — | — | — | — | ✅ |
| Reconcile escrow | ✅ | — | — | — | — | — | ✅ |
| View system health | — | ✅ | — | ✅ (read) | — | — | ✅ |
| Manage system config | — | ✅ (Admin+) | — | — | — | — | ✅ |
| Manage staff accounts | — | ✅ (Admin+) | — | — | — | — | ✅ |
| View/support user inquiries | — | — | ✅ | ✅ (read) | — | — | ✅ |
| Process refunds | — | — | ✅ (Sr+) | — | ✅ (read) | — | ✅ |
| Mediate disputes | — | — | ✅ (Sr+) | ✅ | ✅ | — | ✅ |
| Review KYC submissions | — | — | — | ✅ | ✅ | — | ✅ |
| Approve/reject KYC | — | — | — | ✅ (Mgr+) | ✅ | — | ✅ |
| Suspend/unsuspend users | — | — | ✅ (Lead) | ✅ (Mgr+) | ✅ | — | ✅ |
| Manage delivery logistics | — | — | — | ✅ | — | — | ✅ |
| View analytics | ✅ (read) | — | — | ✅ (read) | — | ✅ | ✅ |
| Manage campaigns/promotions | — | — | — | — | — | ✅ (Mgr+) | ✅ |
| Curate featured products | — | — | — | — | — | ✅ | ✅ |
| Investigate fraud | — | — | ✅ (read) | — | ✅ | — | ✅ |
| View audit logs | — | ✅ (read) | — | — | ✅ | — | ✅ |
| Export audit logs | — | — | — | — | ✅ | — | ✅ |
| Moderate chat (review reports, warn/suspend) | — | — | ✅ | ✅ (read) | ✅ (read) | — | ✅ |
| Moderate videos (remove, warn, strike) (Phase 2) | — | — | — | ✅ | ✅ | — | ✅ |
| View video analytics (Phase 2) | — | — | — | — | — | ✅ | ✅ |

> **Suffix notation:** `(Mgr+)` = Manager role and above only. `(Sr+)` = Senior role and above. `(Lead)` = Lead role only. `(read)` = view-only, no modifications. Unmarked ✅ = full access for that department.

#### 3.8.3 Department Dashboards

**Accounting/Finance Dashboard**
| ID | Requirement | Priority |
|---|---|---|
| FR-087 | Escrow balance overview: total held, pending release, released today | High |
| FR-088 | Payout queue: pending payout requests with approve/reject actions | High |
| FR-089 | Commission tracking: per-store, per-period, platform-wide totals | High |
| FR-090 | Transaction ledger: searchable by date, store, order, type | High |
| FR-091 | Financial reports: daily/weekly/monthly revenue, commission, refunds, payouts | Medium |
| FR-092 | Tax compliance exports: transaction summaries by country/period | Medium |
| FR-093 | Reconciliation: match gateway settlements against platform records | High |

**IT/Engineering Dashboard**
| ID | Requirement | Priority |
|---|---|---|
| FR-094 | System health monitor: API latency, error rates, uptime, DB metrics | High |
| FR-095 | Active incident log with severity, status, assigned responder | High |
| FR-096 | Configuration management: commission rates, delivery rates, timeouts, feature flags | High |
| FR-097 | Staff account management: create, edit, deactivate, role assignment | High |
| FR-098 | API key and integration status: Flutterwave, Paystack, Google Maps, SMS gateway | High |
| FR-099 | Audit log viewer with filtering by staff member, action type, date range | High |

**Customer Service Dashboard**
| ID | Requirement | Priority |
|---|---|---|
| FR-100 | Support ticket queue: open, in-progress, resolved, escalated | High |
| FR-101 | User lookup: search by phone, email, order ID, store name | High |
| FR-102 | Order intervention: view order details, status, contact parties | High |
| FR-103 | Refund processing: initiate full/partial refunds with reason logging | High |
| FR-104 | Dispute mediation workspace: evidence viewer, communication thread, resolution actions | High |
| FR-105 | Quick actions: resend OTP, reset password trigger, temporary account unlock | Medium |

**Operations Dashboard**
| ID | Requirement | Priority |
|---|---|---|
| FR-106 | KYC review queue: pending submissions with document viewer and approve/reject/request-info | High |
| FR-107 | Active deliveries map: real-time view of all in-transit orders | High |
| FR-108 | Store management: search, suspend/unsuspend, edit store details, contact | High |
| FR-109 | Delivery reassignment: override transporter assignment for stuck orders | Medium |
| FR-110 | Delivery fee override: manually adjust fees for exceptional cases | Low |
| FR-111 | Platform-wide metrics: active orders, registrations, deliveries, completion rate | High |

**Compliance/Legal Dashboard**
| ID | Requirement | Priority |
|---|---|---|
| FR-112 | KYC approval authority: final approval/rejection with legal notes | High |
| FR-113 | Fraud investigation workspace: flagged accounts, suspicious patterns, case history | High |
| FR-114 | Regulatory compliance tracker: NDPR, DPA, central bank requirements status | High |
| FR-115 | Data subject requests: access, deletion, export requests with workflow | Medium |
| FR-116 | Legal documentation: terms of service, privacy policy version management | Medium |
| FR-117 | Suspicious activity reports: generate and export for regulatory bodies | Medium |

**Marketing Dashboard**
| ID | Requirement | Priority |
|---|---|---|
| FR-118 | Campaign management: create, schedule, and track promotional campaigns | High |
| FR-119 | Featured product curation: select and rotate featured items on home screen | High |
| FR-120 | Analytics: user acquisition, retention, conversion funnels, GMV trends | High |
| FR-121 | Push notification campaigns: targeted by region, user segment, behavior | Medium |
| FR-122 | Store promotion tools: spotlight verified stores, boost listings | Medium |

### 3.9 Notifications

| ID | Requirement | Priority |
|---|---|---|
| FR-123 | Push notifications (FCM/APNs) for order, payment, delivery, KYC, dispute events | High |
| FR-124 | SMS fallback for OTP, KYC decisions, critical payment confirmations | Medium |
| FR-125 | Notification preferences per user type | Medium |
| FR-126 | In-app notification center with history and deep-linking | Medium |
| FR-127 | Distinct notification sound for new store orders | Medium |
| FR-128 | Staff Portal: in-app notifications for assigned tasks, escalations, alerts | High |

### 3.10 Smart Discovery & Recommendation Engine

The Smart Discovery engine ranks and personalizes product discovery for buyers. Phase 1 implements a rules-based scoring system that mimics intelligent recommendation behavior without requiring ML model training infrastructure. Phase 2 introduces full ML models.

#### 3.10.1 Phase 1: Rules-Based Smart Ranking

| ID | Requirement | Priority |
|---|---|---|
| FR-129 | Composite relevance score per product, calculated from weighted signals | High |
| FR-130 | Location proximity signal: closer stores score higher (distance decay function) | High |
| FR-131 | Price competitiveness signal: rank favorably within category price range | High |
| FR-132 | Quality tier signal: higher quality tiers receive ranking boost | Medium |
| FR-133 | Store rating signal: stores with ≥4.0 rating receive boost; <3.0 penalized | High |
| FR-134 | Popularity signal: recent view count, purchase velocity per product | Medium |
| FR-135 | Freshness signal: newly listed products receive temporary boost | Low |
| FR-136 | Behavior signal: products in categories the buyer previously viewed/purchased rank higher | Medium |
| FR-137 | Stock availability signal: out-of-stock items deprioritized or hidden | High |
| FR-138 | Configurable weights: IT/Engineering staff can tune signal weights via Staff Portal | High |
| FR-139 | A/B testing support: compare ranking weight configurations | Low |

**Scoring Formula (Phase 1):**
```
relevance_score = (
    w_location * location_score +
    w_price * price_score +
    w_quality * quality_score +
    w_rating * rating_score +
    w_popularity * popularity_score +
    w_freshness * freshness_score +
    w_behavior * behavior_score +
    w_stock * stock_score
)

Default weights (configurable):
  w_location=0.25, w_price=0.20, w_rating=0.20, w_behavior=0.10,
  w_popularity=0.10, w_quality=0.05, w_freshness=0.05, w_stock=0.05
```

#### 3.10.2 Phase 2: ML-Powered Recommendations (Roadmap)

| ID | Requirement | Priority |
|---|---|---|
| FR-140 | Collaborative filtering: recommend based on similar buyer behavior patterns | Phase 2 |
| FR-141 | Content-based filtering: recommend based on product attribute similarity | Phase 2 |
| FR-142 | Dynamic pricing suggestions: ML-driven price recommendations for sellers | Phase 2 |
| FR-143 | Demand prediction: forecast demand by category, region, season | Phase 2 |
| FR-144 | Personalized home feed: per-buyer curated product stream | Phase 2 |
| FR-145 | Search relevance learning: ML model trained on search → purchase conversions | Phase 2 |

### 3.11 In-App Chat

Real-time messaging system enabling all user types to communicate. Chat is integrated into the commerce flow (buyer↔seller pre-purchase questions, order coordination) and also supports peer-to-peer social interaction (buyer↔buyer deal sharing, seller↔seller networking).

#### 3.11.1 Conversations & Messaging

| ID | Requirement | Priority |
|---|---|---|
| FR-146 | One-on-one text chat between any two users (buyer↔seller, buyer↔buyer, seller↔seller) | High |
| FR-147 | Real-time message delivery via WebSocket (Supabase Realtime) | High |
| FR-148 | Message types: text, image (compressed), product card (shared listing), order card (shared order status) | High |
| FR-149 | Typing indicators | Medium |
| FR-150 | Read receipts (configurable per user) | Medium |
| FR-151 | Message pagination: load 50 messages at a time, infinite scroll | High |
| FR-152 | Conversation list with last message preview, unread count, timestamp | High |
| FR-153 | Message search within a conversation | Medium |
| FR-154 | Global search across all conversations (by keyword, user name, store name) | Low |
| FR-155 | Offline message queue: messages composed offline are sent when connection restored | High |
| FR-156 | Message status: sent, delivered, read | High |
| FR-157 | Push notification for new messages when app is backgrounded | High |
| FR-158 | Auto-link product names and order IDs in messages (deep link on tap) | Medium |
| FR-159 | Edit and delete message (within 5 minutes of sending, sender only) | Low |

#### 3.11.2 Group Conversations

| ID | Requirement | Priority |
|---|---|---|
| FR-160 | Group chat: up to 50 participants (buyer-initiated deal sharing, seller team coordination) | Medium |
| FR-161 | Group creation: name, optional avatar, participant selection from contacts/following list | Medium |
| FR-162 | Group roles: admin (creator) can add/remove participants, edit group info | Medium |
| FR-163 | Group mention notifications (@username) | Low |

#### 3.11.3 Safety & Moderation

| ID | Requirement | Priority |
|---|---|---|
| FR-164 | Block user: blocked users cannot send messages or start new conversations | High |
| FR-165 | Report message: flag inappropriate content with reason (spam, harassment, fraud, other) | High |
| FR-166 | Mute conversation: stop notifications for a specific chat while remaining a participant | Medium |
| FR-167 | Auto-detect: URL/link scanning, suspicious payment requests outside platform escrow | High |
| FR-168 | Staff Portal: Customer Service staff can view reported messages, warn/suspend users, close reports | High |
| FR-169 | Profanity filter: optional, configurable per user (on/off) | Low |
| FR-170 | Rate limiting: max 30 messages/min per user to prevent spam | High |

#### 3.11.4 Commerce Integration

| ID | Requirement | Priority |
|---|---|---|
| FR-171 | Share product: send a product card in chat that deep-links to product detail | High |
| FR-172 | Share order: send an order status card (useful for buyer↔seller coordination) | Medium |
| FR-173 | Share store: send a store profile card | Medium |
| FR-174 | Quick reply: seller can send pre-configured responses (e.g., "Item in stock", "Preparing your order") | Medium |
| FR-175 | Order context banner: when chat participants have an active order, show order status banner at top of conversation | Medium |

### 3.12 Social Video Feed (Phase 2)

A short-form vertical video feature (mini TikTok) that allows verified sellers to create and post entertaining product showcase videos. Buyers can watch, like, comment, follow stores, and optionally purchase tagged products directly from videos. This feature drives engagement and repeat visits to the platform.

> **Phase placement:** The entire Social Video Feed is Phase 2 (post-launch). This section defines requirements for the Phase 2 development cycle. Chat (Section 3.11) is Phase 1.

#### 3.12.1 Video Upload & Management (Sellers)

| ID | Requirement | Priority |
|---|---|---|
| FR-176 | Only verified sellers (KYC-approved) can upload videos | High |
| FR-177 | Video specs: vertical (9:16), 10-60 seconds, MP4/MOV, max 50MB, 720p+ | High |
| FR-178 | Upload flow: record in-app (camera) or upload from gallery, add caption, add optional product tags | High |
| FR-179 | Product tagging: seller can tag 1-5 products per video; tagged products appear as tappable overlays | High |
| FR-180 | Video processing: server-side transcode to adaptive bitrate (360p, 480p, 720p), generate thumbnail | High |
| FR-181 | Video management dashboard for sellers: list, view analytics (views, likes, comments, product click-through), delete | Medium |
| FR-182 | Draft saving: save video as draft before publishing | Low |
| FR-183 | Video caption max 300 characters with hashtags (#) for discoverability | Medium |
| FR-184 | Background music: royalty-free audio library (licensed tracks) or original audio | Medium |

#### 3.12.2 Video Feed & Discovery (Buyers)

| ID | Requirement | Priority |
|---|---|---|
| FR-185 | Vertical full-screen feed: swipe up for next video, auto-play on view | High |
| FR-186 | For You feed: algorithmic mix based on viewed categories, followed stores, liked videos, location | High |
| FR-187 | Following feed: videos only from stores the buyer follows | High |
| FR-188 | Hashtag discovery: tap a hashtag to see all videos with that tag | Medium |
| FR-189 | Search videos: by hashtag, store name, product name, caption text | Medium |
| FR-190 | Video buffering: pre-load next 2 videos in background for smooth playback | High |
| FR-191 | Bandwidth adaptation: auto-adjust quality based on network (360p on 3G, 720p on 4G/WiFi) | High |
| FR-192 | Data saver mode: user toggle to limit video quality and pre-loading | Medium |

#### 3.12.3 Social Engagement

| ID | Requirement | Priority |
|---|---|---|
| FR-193 | Like: tap to like/unlike; like count displayed | High |
| FR-194 | Comment: text comments on videos; reply to comments (1 level nesting); comment count displayed | High |
| FR-195 | Follow/Subscribe: follow a store to see their videos in Following feed and get notifications on new posts | High |
| FR-196 | Share: share video link within Wunabuy chat or to external apps (WhatsApp, Telegram) via system share sheet | Medium |
| FR-197 | Save: bookmark a video to a private "Saved" tab for later viewing | Medium |
| FR-198 | Video view count: displayed on each video | Medium |
| FR-199 | Store profile from video: tap store name/avatar to view store profile, products, and all videos | High |
| FR-200 | Comment moderation: video owner can delete comments on their videos; users can report comments | Medium |

#### 3.12.4 Shoppable Videos

| ID | Requirement | Priority |
|---|---|---|
| FR-201 | Product tag overlay: tappable product tags appear on video; tap opens product detail sheet (bottom sheet, not full screen) | High |
| FR-202 | Product carousel: if multiple products tagged, swipeable product cards at bottom of video | Medium |
| FR-203 | Add to cart from video: product detail sheet includes Add to Cart button | High |
| FR-204 | Buy from video: full checkout flow accessible without leaving video feed (modal) | High |
| FR-205 | Product tag timing: tags can appear at specific timestamps during video playback | Low |
| FR-206 | Analytics: sellers see product click-through rate and purchases originating from each video | Medium |

#### 3.12.5 Video Content Moderation

| ID | Requirement | Priority |
|---|---|---|
| FR-207 | Pre-publish scan: automated check for prohibited content (violence, explicit material) using content moderation API | High |
| FR-208 | Manual review queue: flagged videos routed to Operations/Compliance staff in Staff Portal | High |
| FR-209 | Staff Portal: Operations staff can remove videos, warn/suspend sellers for policy violations | High |
| FR-210 | Report video: buyers can report videos with reason (inappropriate, misleading, counterfeit goods, spam) | High |
| FR-211 | Content policy: defined terms for sellers (no counterfeit goods, no misleading claims, no prohibited items) | High |
| FR-212 | Strike system: 3 strikes → temporary upload suspension; 5 strikes → permanent video ban | Medium |
| FR-213 | Automated takedown: videos with >5 reports within 1 hour auto-hidden pending staff review | Medium |

#### 3.12.6 Video Analytics (Sellers)

| ID | Requirement | Priority |
|---|---|---|
| FR-214 | Per-video metrics: views, unique viewers, likes, comments, shares, saves, product clicks, product purchases | Medium |
| FR-215 | Aggregate metrics: total views, follower growth, average engagement rate across all videos | Medium |
| FR-216 | Time-range filtering: metrics by day, week, month, custom range | Low |
| FR-217 | Staff Portal: Marketing staff can view platform-wide video metrics, top-performing videos, engagement trends | Medium |

---

## 4. External Interface Requirements

### 4.1 User Interfaces

#### Buyer App Screens
| Screen | Elements |
|---|---|
| Home | Smart Discovery feed (personalized ranking), search bar, categories, featured products, nearby stores, recent orders, video feed entry point (Phase 2) |
| Search | Filter panel, product cards (image/name/price/store/distance/rating), sort, smart-ranked results |
| Product Detail | Image carousel, price, quality, store card, delivery estimate, reviews, Add to Cart |
| Cart | Product list, qty controls, subtotal, delivery estimate, Checkout |
| Checkout | Address selector, payment method (MoMo/Card), order summary, Pay Now |
| Track Order | Live map, transporter location, status timeline, ETA |
| Orders | Tabs: Active/Completed/Cancelled |
| Reviews | Star inputs, text, photo upload |
| Chat List | Conversation list with avatar, last message, unread badge, timestamp, search bar |
| Chat Conversation | Message bubbles (text/image/product card/order card), input bar, typing indicator, read receipts, attach media, share product, order context banner |
| Video Feed (Phase 2) | Vertical full-screen video, auto-play, swipe up for next, For You / Following tabs, like/comment/share/save buttons, store avatar + follow button, product tag overlays |
| Video Comments (Phase 2) | Comment list, reply input, like comments, report comments |
| Store Profile (Phase 2) | Store info, products tab, videos tab, follow button, rating, chat button |
| Saved Videos (Phase 2) | Grid of bookmarked videos, tap to replay |

#### Seller (Store Owner) App Screens
| Screen | Elements |
|---|---|
| Dashboard | Today's orders, pending revenue, store rating, follower count (Phase 2) |
| Products | Product grid with stock levels, add/edit, search |
| Add Product | Name, category, description, price, qty, quality, photo upload |
| Orders | Incoming orders, accept/decline, fulfillment flow |
| Wallet | Escrow balance, available balance, transactions, payouts |
| KYC | Verification status, document re-upload |
| Chat List | Conversation list with buyer avatar, last message, unread badge, quick reply suggestions |
| Chat Conversation | Message bubbles, input bar, share product card, share order card, order context banner, typing indicator |
| Video Studio (Phase 2) | Record/upload video, add caption + hashtags, tag products, publish or save draft, video list with analytics |
| Video Analytics (Phase 2) | Per-video views, likes, comments, shares, product clicks, purchases; aggregate metrics, follower growth chart |
| Store Profile Preview (Phase 2) | How buyers see the store: info, products, videos, followers, rating |

#### Transport Provider App Screens
| Screen | Elements |
|---|---|
| Dashboard | Available jobs, active deliveries, earnings |
| Delivery Detail | Pickup/drop-off, item, fee, accept/decline |
| Active Delivery | Map + route, status buttons, navigation |
| Earnings | Daily/weekly history, payouts |
| Chat List | Conversation list (coordinate with stores and buyers about deliveries) |
| Chat Conversation | Message bubbles, input bar, share order card, typing indicator |

#### Staff Portal — Web Application

**Global Elements (all departments):**
| Element | Description |
|---|---|
| Top Navigation | Department switcher (for multi-role staff), notifications, profile, logout |
| Sidebar | Department-specific navigation menu filtered by permissions |
| Breadcrumb | Current section path |
| Search | Global search across users, stores, orders, products, disputes |
| Audit indicator | Visual badge on all actions that are audit-logged |

**Accounting/Finance Screens:**
| Screen | Elements |
|---|---|
| Finance Overview | Escrow total, pending payouts, today's revenue, commission earned, charts |
| Payout Queue | Pending payout table, approve/reject, batch approve, payout history |
| Transaction Ledger | Searchable transaction table, filters by type/date/store, export CSV |
| Reconciliation | Gateway settlement matching, discrepancy alerts, manual match |
| Financial Reports | Date-range report generator, revenue/commission/refund/payout summaries, export |

**IT/Engineering Screens:**
| Screen | Elements |
|---|---|
| System Health | API latency graphs, error rate, uptime %, DB connection pool, queue depth |
| Incidents | Active incident list, severity, status, assignee, resolution notes |
| Configuration | Commission rate, delivery rates, timeouts, feature flags, ranking weights |
| Staff Management | Staff table, add/edit/deactivate, role assignment, permission preview |
| Integrations | Gateway status, API key management, webhook health, test connection |
| Audit Log | Filterable log viewer, export, staff action timeline |

**Customer Service Screens:**
| Screen | Elements |
|---|---|
| Ticket Queue | Open/in-progress/resolved tickets, priority, assignment, SLA timer |
| User Lookup | Search by phone/email/order/store, user detail with order history |
| Order Detail | Full order lifecycle, party contact info, intervention actions |
| Dispute Workspace | Evidence viewer (photos, messages), communication thread, resolution actions |
| Refund Console | Refund request form, full/partial, reason, approval flow |
| Chat Moderation | Reported messages queue, message context viewer, warn/suspend users, close reports |

**Operations Screens:**
| Screen | Elements |
|---|---|
| KYC Queue | Pending submissions, document viewer, approve/reject/request-info, batch actions |
| Active Deliveries | Map view of all in-transit orders, transporter details, reassignment |
| Store Management | Store table, search, suspend/unsuspend, edit, contact, performance metrics |
| Platform Metrics | Active orders, registrations, delivery completion rate, response time |

**Compliance/Legal Screens:**
| Screen | Elements |
|---|---|
| KYC Approval | Final review queue, legal notes, approve/reject with documentation |
| Fraud Cases | Flagged accounts, suspicious pattern viewer, case history, investigation notes |
| Regulatory Tracker | Compliance status by country/regulation, deadline tracking, document storage |
| Data Subject Requests | Access/deletion/export requests, workflow status, fulfillment tracking |

**Marketing Screens:**
| Screen | Elements |
|---|---|
| Campaigns | Create/schedule/track promotions, active/past campaigns, performance metrics |
| Featured Curation | Product selector, rotation scheduler, home screen preview |
| Analytics | User acquisition, retention cohorts, conversion funnel, GMV trends |
| Push Campaigns | Target audience builder, message composer, schedule, delivery stats |
| Video Analytics (Phase 2) | Platform-wide video metrics, top-performing videos, engagement trends, video-to-purchase conversion rate |
| Content Moderation (Phase 2) | Reported videos queue, video review player, remove/warn/suspend actions, strike history, auto-flagged videos |

### 4.2 Hardware Interfaces

| Interface | Usage |
|---|---|
| Camera | Product photos, KYC docs, delivery confirmation, review photos, chat media, video recording (Phase 2) |
| Microphone | Video audio recording (Phase 2) |
| GPS | Real-time delivery tracking, store location verification |

### 4.3 API Integrations

#### Payment (Flutterwave - Primary)
- Collect: `POST /v3/charges?type=momo` (MoMo) or `card`
- Verify: `GET /v3/transactions/{id}/verify`
- Payout: `POST /v3/transfers`
- Webhook: `charge.completed` events
- Escrow: Platform balance → transfer on delivery confirmation

#### Payment (Paystack - Fallback)
- Collect: `POST /transaction/initialize`
- Verify: `GET /transaction/verify/{reference}`
- Payout: `POST /transferrecipient` + `POST /transfer`

#### Google Maps
| API | Purpose |
|---|---|
| Maps SDK | Interactive maps in app |
| Directions API | Route optimization |
| Distance Matrix | Delivery fee calculation |
| Geocoding | Address ↔ coordinates |
| Places API | Address autocomplete |

#### Backend (Laravel 13)
- PostgreSQL + PostGIS (geo queries)
- Laravel Sanctum Auth (phone/email for mobile apps; email+MFA for Staff Portal)
- Laravel Reverb WebSockets (order status, live tracking, staff notifications, real-time chat)
- Database Data Isolation & Middleware (data isolation, staff permission enforcement)

#### Notifications
- Firebase Cloud Messaging (push — mobile apps)
- Web Push API (Staff Portal notifications)
- Africa's Talking / Twilio (SMS OTP)
- SendGrid / Resend (transactional email)

#### Video Streaming (Phase 2)
| Service | Purpose |
|---|---|
| Mux / Cloudflare Stream | Video hosting, transcoding (adaptive bitrate 360p/480p/720p), CDN delivery, analytics |
| AWS S3 / Laravel Flysystem | Raw video upload storage before processing |
| Google Cloud Video Intelligence / AWS Rekognition | Automated content moderation (pre-publish scan) |

#### Content Moderation (Phase 2)
| Service | Purpose |
|---|---|
| Google Cloud Video Intelligence | Video content classification, explicit content detection |
| AWS Rekognition | Image/video moderation for thumbnails and frames |
| Profanity filter API | Text moderation for comments and captions |

### 4.4 Communication Protocols

| Protocol | Usage |
|---|---|
| HTTPS/REST | All API calls (mobile apps + Staff Portal) |
| WebSocket (Laravel Reverb) | Live order/tracking updates, staff real-time alerts, real-time chat messaging |
| SMS | OTP, critical alerts |
| FCM/APNs | Push notifications (mobile) |
| Web Push | Staff Portal browser notifications |
| HLS / DASH (Phase 2) | Adaptive bitrate video streaming |

---

## 5. Non-Functional Requirements

### 5.1 Performance

| ID | Requirement | Target |
|---|---|---|
| NFR-001 | Cold start time (mobile) | ≤ 3s on mid-range device, 3G |
| NFR-002 | Search results (mobile) | ≤ 2s (50km radius) |
| NFR-003 | Image loading (mobile) | Thumbnail ≤ 500ms; progressive |
| NFR-004 | Payment confirmation | ≤ 15s end-to-end |
| NFR-005 | GPS update frequency | Every 10s during delivery |
| NFR-006 | API p95 latency | ≤ 500ms |
| NFR-007 | Concurrent users (mobile) | 500 without degradation |
| NFR-008 | DB query time | ≤ 100ms (indexed) |
| NFR-009 | Staff Portal page load | ≤ 2s on standard office connection |
| NFR-010 | Smart Discovery ranking computation | ≤ 200ms per search query |
| NFR-011 | Staff Portal concurrent sessions | 50 without degradation |
| NFR-056 | Chat message delivery latency | ≤ 500ms (WebSocket) |
| NFR-057 | Chat message send confirmation | ≤ 1s on 3G |
| NFR-058 | Chat media (image) upload + display | ≤ 3s on 3G (compressed) |
| NFR-059 | Chat concurrent connections | 500 WebSocket connections without degradation |
| NFR-060 | Chat message history pagination | ≤ 1s for 50 messages |
| NFR-061 | Video initial playback start (Phase 2) | ≤ 2s on 4G, ≤ 5s on 3G |
| NFR-062 | Video buffer-free playback (Phase 2) | ≥ 95% of playback time on 4G |
| NFR-063 | Video upload processing time (Phase 2) | ≤ 30s for 60s clip at 720p |
| NFR-064 | Video feed pre-loading (Phase 2) | Next 2 videos pre-loaded in background |
| NFR-065 | Video concurrent viewers (Phase 2) | 200 concurrent streamers without degradation |
| NFR-066 | Content moderation scan time (Phase 2) | ≤ 60s per video (pre-publish) |

### 5.2 Security

| ID | Requirement |
|---|---|
| NFR-012 | HTTPS with TLS 1.3 minimum |
| NFR-013 | JWT: access 1hr, refresh 30 days (mobile apps) |
| NFR-014 | Staff Portal: JWT access 15min, refresh 8hr, MFA required |
| NFR-015 | KYC and PII encrypted at rest (AES-256) |
| NFR-016 | No card data stored (tokenization only) |
| NFR-017 | Row-Level Security (RLS) on Supabase — enforced for both mobile and Staff Portal |
| NFR-018 | Rate limiting: 100 req/min general, 5 req/min OTP |
| NFR-019 | Staff Portal MFA required (TOTP) |
| NFR-020 | Security event logging |
| NFR-021 | Quarterly security audits |
| NFR-022 | Staff Portal: IP allowlist configurable |
| NFR-023 | Audit log tamper-evident (append-only, hashed chain) |
| NFR-024 | Staff password policy: 12+ chars, complexity, 90-day rotation |
| NFR-067 | Chat messages encrypted in transit (TLS 1.3); at-rest encryption for media attachments |
| NFR-068 | Chat message retention: 90 days post-conversation, then archived |
| NFR-069 | Video content scanned for prohibited material before publishing (Phase 2) |
| NFR-070 | Video upload restricted to KYC-verified sellers only (Phase 2) |

### 5.3 Reliability & Availability

| ID | Requirement | Target |
|---|---|---|
| NFR-025 | Uptime (mobile platform) | 99.5% |
| NFR-026 | Uptime (Staff Portal) | 99.5% (business hours: 99.9%) |
| NFR-027 | Maintenance windows | 2-5AM local, 48h notice |
| NFR-028 | Backups | Daily, point-in-time recovery |
| NFR-029 | DR RTO | ≤ 4 hours |
| NFR-030 | DR RPO | ≤ 1 hour |

### 5.4 Scalability

| ID | Requirement |
|---|---|
| NFR-031 | Horizontal scaling for backend |
| NFR-032 | Support 1,000 stores, 5,000 customers, 50,000 products |
| NFR-033 | Auto-scaling image storage with CDN |
| NFR-034 | Expand to new countries/languages without rearchitecture |
| NFR-035 | Staff Portal scales to 100 staff members across departments |
| NFR-071 | Chat: support 10,000 concurrent conversations across platform |
| NFR-072 | Video: support 50,000 stored videos, 200 concurrent viewers (Phase 2) |

### 5.5 Maintainability

| ID | Requirement |
|---|---|
| NFR-036 | Git version control (GitHub) |
| NFR-037 | ESLint/Prettier code standards (mobile + Staff Portal) |
| NFR-038 | OpenAPI/Swagger API docs |
| NFR-039 | ≥ 80% unit test coverage (critical logic) |
| NFR-040 | CI/CD: lint, test, build on every PR |
| NFR-041 | Staff Portal: component-based architecture, reusable RBAC hooks |

### 5.6 Usability

| ID | Requirement |
|---|---|
| NFR-042 | i18n: English, French, Swahili (Phase 1 — mobile apps) |
| NFR-043 | Minimum 14sp font size (mobile) |
| NFR-044 | Touch targets ≥ 48x48dp (mobile) |
| NFR-045 | Support 4.7" to 6.9" screens (mobile) |
| NFR-046 | Clear validation errors in user language (mobile) |
| NFR-047 | Search → Buy in ≤ 5 taps (mobile) |
| NFR-048 | Staff Portal: WCAG 2.1 AA compliance |
| NFR-049 | Staff Portal: keyboard navigable, responsive (desktop/tablet) |

### 5.7 Regulatory

| ID | Requirement |
|---|---|
| NFR-050 | Nigeria NDPR compliance |
| NFR-051 | Kenya DPA compliance |
| NFR-052 | Central bank financial regulations |
| NFR-053 | In-app privacy policy + terms (all languages) |
| NFR-054 | Explicit data consent with opt-out |
| NFR-055 | Staff data access logged and auditable for regulatory review |

---

## 6. Data Requirements

### 6.1 Core Schema

#### Users
```sql
users (id UUID PK, phone VARCHAR(20) UNIQUE, email VARCHAR(255) UNIQUE,
  full_name VARCHAR(255), role ENUM('buyer','seller','transporter'),
  avatar_url TEXT, default_address JSONB, is_verified BOOLEAN,
  is_suspended BOOLEAN, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ)
```

#### Stores
```sql
stores (id UUID PK, owner_id UUID FK→users, store_name VARCHAR(255),
  description TEXT, category VARCHAR(100), location GEOGRAPHY(POINT),
  address_text TEXT, rating_avg DECIMAL(2,1), total_reviews INT,
  is_verified BOOLEAN, kyc_status ENUM('pending','under_review','approved','rejected'),
  kyc_documents JSONB, commission_rate DECIMAL(3,1) DEFAULT 10.0,
  created_at TIMESTAMPTZ)

CREATE INDEX idx_stores_location ON stores USING GIST(location);
```

#### Products
```sql
products (id UUID PK, store_id UUID FK→stores, name VARCHAR(500),
  description TEXT, category VARCHAR(100), price DECIMAL(12,2),
  quantity INT, quality_tier ENUM('new','like_new','good','fair'),
  images TEXT[], is_active BOOLEAN, rating_avg DECIMAL(2,1),
  view_count INT DEFAULT 0, purchase_count INT DEFAULT 0,
  search_vector TSVECTOR, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ)

CREATE INDEX idx_products_search ON products USING GIN(search_vector);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_created ON products(created_at DESC);
```

#### Orders
```sql
orders (id UUID PK, customer_id UUID FK→users, store_id UUID FK→stores,
  transporter_id UUID FK→users, status ENUM('pending_payment','paid_escrow',
  'preparing','ready_for_pickup','in_transit','delivered','received',
  'completed','cancelled','disputed','refunded'),
  items JSONB, subtotal DECIMAL(12,2), delivery_fee DECIMAL(12,2),
  commission DECIMAL(12,2), total DECIMAL(12,2),
  payment_method VARCHAR(50), payment_ref VARCHAR(255),
  delivery_address JSONB, pickup_location JSONB, tracking_data JSONB,
  delivery_photo TEXT, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ)
```

#### Reviews
```sql
reviews (id UUID PK, order_id UUID FK→orders, reviewer_id UUID FK→users,
  target_type ENUM('product','store','transporter'), target_id UUID,
  rating INT CHECK(1-5), review_text TEXT, photos TEXT[], created_at TIMESTAMPTZ)
```

#### Wallets & Transactions
```sql
wallets (id UUID PK, user_id UUID FK→users UNIQUE,
  balance_escrow DECIMAL(12,2), balance_available DECIMAL(12,2),
  total_earned DECIMAL(12,2), updated_at TIMESTAMPTZ)

transactions (id UUID PK, wallet_id UUID FK→wallets, order_id UUID FK→orders,
  type ENUM('payment_received','escrow_hold','escrow_release',
  'commission_deduct','payout','refund'),
  amount DECIMAL(12,2), balance_after DECIMAL(12,2),
  reference VARCHAR(255), description TEXT, created_at TIMESTAMPTZ)
```

#### Notifications
```sql
notifications (id UUID PK, user_id UUID FK→users, type VARCHAR(50),
  title VARCHAR(255), body TEXT, data JSONB, is_read BOOLEAN,
  channel ENUM('push','sms','email','in_app','web_push'), created_at TIMESTAMPTZ)
```

#### Staff Accounts
```sql
staff_accounts (id UUID PK, email VARCHAR(255) UNIQUE,
  full_name VARCHAR(255), department VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE, mfa_secret TEXT ENCRYPTED,
  last_login TIMESTAMPTZ, password_changed_at TIMESTAMPTZ,
  created_by UUID FK→staff_accounts, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ)
```

#### Staff Roles & Permissions
```sql
staff_roles (id UUID PK, staff_id UUID FK→staff_accounts,
  department ENUM('accounting','it_engineering','customer_service',
  'operations','compliance_legal','marketing','super_admin'),
  role_level ENUM('officer','senior','lead','manager','admin'),
  assigned_at TIMESTAMPTZ, assigned_by UUID FK→staff_accounts,
  is_active BOOLEAN DEFAULT TRUE)

staff_permissions (id UUID PK, role_key VARCHAR(100) UNIQUE,
  department VARCHAR(100), role_level VARCHAR(50),
  permissions JSONB,  -- e.g. {"payouts.approve": true, "kyc.review": true, ...}
  description TEXT)

-- Junction: staff can have multiple roles
staff_role_assignments (id UUID PK, staff_id UUID FK→staff_accounts,
  role_id UUID FK→staff_roles, assigned_at TIMESTAMPTZ,
  assigned_by UUID FK→staff_accounts, is_active BOOLEAN DEFAULT TRUE)
```

#### Audit Log
```sql
audit_log (id BIGSERIAL PK, staff_id UUID FK→staff_accounts,
  action VARCHAR(100),  -- e.g. 'payout.approve', 'kyc.reject', 'user.suspend'
  entity_type VARCHAR(50),  -- 'order', 'store', 'user', 'payout', 'config'
  entity_id UUID,
  before_state JSONB, after_state JSONB,
  ip_address INET, user_agent TEXT,
  previous_hash VARCHAR(64),  -- hash chain for tamper-evidence
  current_hash VARCHAR(64),
  created_at TIMESTAMPTZ DEFAULT NOW())

CREATE INDEX idx_audit_staff ON audit_log(staff_id);
CREATE INDEX idx_audit_action ON audit_log(action);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);
```

#### Smart Discovery — Ranking Signals
```sql
ranking_signals (id UUID PK, product_id UUID FK→products UNIQUE,
  location_score DECIMAL(3,2), price_score DECIMAL(3,2),
  quality_score DECIMAL(3,2), rating_score DECIMAL(3,2),
  popularity_score DECIMAL(3,2), freshness_score DECIMAL(3,2),
  stock_score DECIMAL(3,2), composite_score DECIMAL(3,2),
  computed_at TIMESTAMPTZ)

-- User behavior tracking for personalization
user_behavior (id UUID PK, user_id UUID FK→users,
  product_id UUID FK→products, action ENUM('view','search','cart_add','purchase'),
  search_query TEXT, category VARCHAR(100), created_at TIMESTAMPTZ)

CREATE INDEX idx_user_behavior_user ON user_behavior(user_id);
CREATE INDEX idx_user_behavior_category ON user_behavior(category);

-- Configurable ranking weights
ranking_config (id UUID PK, name VARCHAR(100),
  w_location DECIMAL(3,2) DEFAULT 0.25, w_price DECIMAL(3,2) DEFAULT 0.20,
  w_quality DECIMAL(3,2) DEFAULT 0.05, w_rating DECIMAL(3,2) DEFAULT 0.20,
  w_popularity DECIMAL(3,2) DEFAULT 0.10, w_freshness DECIMAL(3,2) DEFAULT 0.05,
  w_behavior DECIMAL(3,2) DEFAULT 0.10, w_stock DECIMAL(3,2) DEFAULT 0.05,
  is_active BOOLEAN DEFAULT FALSE, updated_by UUID FK→staff_accounts,
  updated_at TIMESTAMPTZ)
```

#### Support Tickets
```sql
support_tickets (id UUID PK, user_id UUID FK→users,
  assigned_to UUID FK→staff_accounts, subject VARCHAR(255),
  body TEXT, status ENUM('open','in_progress','resolved','escalated'),
  priority ENUM('low','medium','high','urgent'),
  related_order_id UUID FK→orders, related_store_id UUID FK→stores,
  sla_deadline TIMESTAMPTZ, resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ)

ticket_messages (id UUID PK, ticket_id UUID FK→support_tickets,
  sender_type ENUM('user','staff'), sender_id UUID,
  message TEXT, attachments TEXT[], created_at TIMESTAMPTZ)
```

#### Disputes
```sql
disputes (id UUID PK, order_id UUID FK→orders,
  opened_by UUID FK→users, reason VARCHAR(100),
  description TEXT, evidence_photos TEXT[],
  status ENUM('open','store_responded','in_mediation','resolved','rejected'),
  assigned_to UUID FK→staff_accounts,
  resolution TEXT, resolution_type ENUM('refund','partial_refund','redelivery','rejected'),
  store_response TEXT, store_responded_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ, created_at TIMESTAMPTZ)
```

#### Chat — Conversations & Messages
```sql
conversations (id UUID PK, type ENUM('direct','group'),
  name VARCHAR(255),  -- NULL for direct, name for group
  avatar_url TEXT,    -- group avatar
  created_by UUID FK→users, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ)

conversation_participants (id UUID PK, conversation_id UUID FK→conversations,
  user_id UUID FK→users, role ENUM('member','admin'),
  joined_at TIMESTAMPTZ, left_at TIMESTAMPTZ,
  is_muted BOOLEAN DEFAULT FALSE, last_read_at TIMESTAMPTZ)

messages (id UUID PK, conversation_id UUID FK→conversations,
  sender_id UUID FK→users, type ENUM('text','image','product_card','order_card','store_card'),
  content TEXT,  -- text content or JSON for card types
  media_url TEXT,  -- image attachment URL
  product_id UUID FK→products,  -- for product_card type
  order_id UUID FK→orders,      -- for order_card type
  store_id UUID FK→stores,      -- for store_card type
  status ENUM('sent','delivered','read'),
  edited_at TIMESTAMPTZ, deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ)

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX idx_conversation_participants_user ON conversation_participants(user_id);
```

#### Chat — Blocks & Reports
```sql
blocked_users (id UUID PK, blocker_id UUID FK→users,
  blocked_id UUID FK→users, created_at TIMESTAMPTZ)

chat_reports (id UUID PK, message_id UUID FK→messages,
  reporter_id UUID FK→users, reason ENUM('spam','harassment','fraud','inappropriate','other'),
  description TEXT, status ENUM('open','reviewing','resolved','dismissed'),
  resolved_by UUID FK→staff_accounts, resolution TEXT,
  created_at TIMESTAMPTZ, resolved_at TIMESTAMPTZ)
```

#### Social Video — Videos
```sql
videos (id UUID PK, store_id UUID FK→stores, seller_id UUID FK→users,
  caption VARCHAR(300), hashtags TEXT[],
  video_url TEXT,  -- processed streaming URL (HLS/DASH)
  thumbnail_url TEXT, duration_seconds INT,
  status ENUM('processing','pending_review','published','removed','rejected'),
  view_count INT DEFAULT 0, unique_view_count INT DEFAULT 0,
  like_count INT DEFAULT 0, comment_count INT DEFAULT 0,
  share_count INT DEFAULT 0, save_count INT DEFAULT 0,
  is_shoppable BOOLEAN DEFAULT FALSE,
  audio_track VARCHAR(255),  -- royalty-free track name or 'original'
  moderation_status ENUM('pending','approved','flagged','rejected'),
  moderation_notes TEXT, strike_count INT DEFAULT 0,
  published_at TIMESTAMPTZ, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ)

CREATE INDEX idx_videos_store ON videos(store_id);
CREATE INDEX idx_videos_status ON videos(status);
CREATE INDEX idx_videos_published ON videos(published_at DESC);
```

#### Social Video — Product Tags
```sql
video_product_tags (id UUID PK, video_id UUID FK→videos,
  product_id UUID FK→products, display_order INT,
  timestamp_seconds INT,  -- when tag appears in video (NULL = always visible)
  click_count INT DEFAULT 0, purchase_count INT DEFAULT 0,
  created_at TIMESTAMPTZ)

CREATE INDEX idx_video_tags_video ON video_product_tags(video_id);
CREATE INDEX idx_video_tags_product ON video_product_tags(product_id);
```

#### Social Video — Engagement
```sql
video_likes (id UUID PK, video_id UUID FK→videos,
  user_id UUID FK→users, created_at TIMESTAMPTZ)

video_comments (id UUID PK, video_id UUID FK→videos,
  user_id UUID FK→users, parent_comment_id UUID FK→video_comments,
  comment_text TEXT, like_count INT DEFAULT 0,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ)

video_saves (id UUID PK, video_id UUID FK→videos,
  user_id UUID FK→users, created_at TIMESTAMPTZ)

video_views (id UUID PK, video_id UUID FK→videos,
  user_id UUID FK→users, watch_duration_seconds INT,
  created_at TIMESTAMPTZ)

CREATE INDEX idx_video_likes_video ON video_likes(video_id);
CREATE INDEX idx_video_comments_video ON video_comments(video_id);
```

#### Social Video — Follows
```sql
store_follows (id UUID PK, follower_id UUID FK→users,
  store_id UUID FK→stores, created_at TIMESTAMPTZ)

CREATE INDEX idx_store_follows_store ON store_follows(store_id);
CREATE INDEX idx_store_follows_follower ON store_follows(follower_id);
```

#### Social Video — Video Reports
```sql
video_reports (id UUID PK, video_id UUID FK→videos,
  reporter_id UUID FK→users, reason ENUM('inappropriate','misleading','counterfeit','spam','other'),
  description TEXT, status ENUM('open','reviewing','resolved','dismissed'),
  resolved_by UUID FK→staff_accounts, resolution TEXT,
  created_at TIMESTAMPTZ, resolved_at TIMESTAMPTZ)
```

### 6.2 Data Flow

```
[Mobile Apps] --REST--> [Supabase API] --> [PostgreSQL]
                              |
                        [Realtime] --WS--> [Store App]
                              |         --WS--> [Transporter App]
                              |         --WS--> [Buyer App (chat)]
                                
[Staff Portal] --REST--> [Supabase API] --> [PostgreSQL]
                              |
                        [Realtime] --WS--> [Staff Portal notifications]

[Chat System] --WS--> [Supabase Realtime] --> [All mobile apps]
     |
     v
[conversations, messages, blocked_users, chat_reports]

[Smart Ranking Engine] <-- [ranking_config] + [ranking_signals] + [user_behavior]
     |
     v
[Search/Browse API] --ranked results--> [Mobile Apps]

[Video Upload] --[raw video]--> [S3/Supabase Storage] --[transcode]--> [Mux/Cloudflare Stream]
     |                                                                    |
     v                                                                    v
[Content Moderation API] --flag/approve--> [videos table] --HLS/DASH--> [Mobile App Video Feed]

[Payment Gateway] --Webhook--> [Cloud Function] --> Update Order + Wallet
[Google Maps] <--REST-- [All Apps + Staff Portal]
[FCM/APNs] <--API-- [Cloud Function] --> [Mobile Apps]
[Web Push] <--API-- [Staff Portal Backend] --> [Staff Portal]
[SMS Gateway] <--API-- [Cloud Function]
[Audit Logger] <-- [All Staff Portal actions] --> [audit_log (append-only)]
```

---

## 7. Development Approach

### 7.1 Agile (Scrum) — 2-Week Sprints

**Team:** Product Owner, Scrum Master, 3 React Native Devs, 1 Backend Dev, 1 React (Web) Dev (Staff Portal), 1 UI/UX Designer, 1 QA, 1 DevOps (part-time)

### 7.2 Sprint Plan — 34 Weeks to Launch (Phase 1) + 12 Weeks (Phase 2)

**Phase 1: Foundation (Weeks 1-8)**
| Sprint | Deliverables |
|---|---|
| 1 | React Native scaffold, Supabase setup, CI/CD, design system |
| 2 | Phone/email auth, OTP, JWT, role-based profiles (Buyer/Seller/Transport) |
| 3 | Multi-step KYC form, document upload, staff KYC review queue (Staff Portal base) |
| 4 | Product CRUD, image upload, inventory tracking |

**Milestone M1 (Week 8):** MVP Core — Registration, KYC submission, product listing, Staff Portal shell with auth + RBAC.

**Phase 2: Commerce Engine (Weeks 9-18)**
| Sprint | Deliverables |
|---|---|
| 5 | Full-text search, filters, geolocation queries, category browsing |
| 6 | Smart Discovery ranking engine: signal computation, configurable weights, behavior tracking |
| 7 | Cart, checkout, address management, Flutterwave integration |
| 8 | Payment processing, escrow, order state machine, store wallet |
| 9 | In-app chat: 1-on-1 messaging, WebSocket real-time, media sharing, conversation list |

**Milestone M2 (Week 18):** Full commerce + chat: smart-ranked search → buy → pay → escrow → chat with seller/buyers.

> **Timeline change from v1.1:** Phase 2 extended from 8 to 10 weeks (1 additional sprint for in-app chat). Total Phase 1 timeline: 34 weeks (was 32).

**Phase 3: Delivery & Trust (Weeks 19-26)**
| Sprint | Deliverables |
|---|---|
| 10 | Transporter registration, job assignment, Google Maps integration |
| 11 | Real-time GPS tracking, route optimization, ETA, delivery confirmation |
| 12 | Rating system, reviews, dispute workflow, dispute workspace in Staff Portal |
| 13 | Customer Service dashboard: support tickets, user lookup, refund console, chat moderation |

**Milestone M3 (Week 26):** Full delivery + review + dispute + customer service operations + chat.

**Phase 4: Staff Portal Completion & Launch Prep (Weeks 27-34)**
| Sprint | Deliverables |
|---|---|
| 14 | Accounting/Finance dashboard: escrow reconciliation, payout queue, financial reports |
| 15 | IT/Engineering dashboard: system health, config management, staff management, audit log |
| 16 | Operations + Compliance dashboards: KYC approval, delivery monitoring, fraud cases, regulatory tracker |
| 17 | Marketing dashboard + group chat + i18n + performance optimization + security audit + load testing + app store submission |

**Milestone M4 (Week 34):** Launch-ready in first African city with full Staff Portal + chat.

**Phase 5: Social Video Feed (Weeks 35-46 — Post-Launch)**
| Sprint | Deliverables |
|---|---|
| 18 | Video upload pipeline: in-app recording, upload, server-side transcoding (Mux/Cloudflare Stream), thumbnail generation |
| 19 | Video feed: vertical full-screen player, For You / Following tabs, auto-play, pre-loading, bandwidth adaptation |
| 20 | Social engagement: like, comment (with replies), follow/subscribe, share, save, view count |
| 21 | Shoppable videos: product tagging, product detail sheet, add-to-cart from video, checkout modal |
| 22 | Content moderation: pre-publish scan, manual review queue in Staff Portal, report system, strike system |
| 23 | Video analytics: seller dashboard (per-video + aggregate), Staff Portal Marketing video analytics, hashtag discovery |

**Milestone M5 (Week 46):** Social Video Feed live — sellers posting, buyers watching, engaging, and buying from videos.

> **Timeline change from v1.1:** Sprint plan extended from 32 to 34 weeks for Phase 1 (chat added as Sprint 9). Phase 2 (Social Video Feed) is 12 additional weeks post-launch (Sprints 18-23).

### 7.3 Technology Stack

| Layer | Technology |
|---|---|
| Mobile App | React Native 0.76+, Zustand, React Query, React Navigation 7 |
| Mobile UI | Custom design system + React Native Paper |
| Maps | react-native-maps + Google Maps |
| Staff Portal | React 18 + Vite, TypeScript, TanStack Router, TanStack Query |
| Staff Portal UI | Tailwind CSS + shadcn/ui (component library) |
| Database | Supabase (PostgreSQL 15 + PostGIS) |
| Serverless | Firebase Cloud Functions |
| Storage | Supabase Storage |
| Push (Mobile) | Firebase Cloud Messaging |
| Push (Staff Portal) | Web Push API |
| SMS | Africa's Talking / Twilio |
| Payment | Flutterwave + Paystack |
| CI/CD | GitHub Actions + Fastlane (mobile) + Vite build (Staff Portal) |
| Monitoring | Firebase Crashlytics + Analytics (mobile), Sentry (Staff Portal) |
| Smart Ranking | PostgreSQL computed columns + scheduled Cloud Functions for signal refresh |
| Chat (Real-time) | Supabase Realtime (WebSocket), react-native-gifted-chat, message pagination |
| Video Streaming (Phase 2) | Mux / Cloudflare Stream (hosting, transcoding, CDN, HLS/DASH) |
| Video Player (Phase 2) | react-native-video, vertical pager (FlashList/RecyclerListView) |
| Content Moderation (Phase 2) | Google Cloud Video Intelligence / AWS Rekognition |

### 7.4 Risk Management

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Payment gateway downtime | Medium | High | Dual gateway (Flutterwave + Paystack), graceful fallback |
| Poor mobile networks | High | Medium | Offline queue, compression, lightweight app, progressive loading |
| KYC bottleneck | Medium | Medium | OCR auto-validation, batch staff operations |
| Store adoption resistance | Medium | High | Simple UX, local languages, field agent-assisted onboarding |
| Fraud (fake stores) | Medium | High | KYC + GPS verification + dispute system + rating transparency + Compliance dashboard |
| Currency volatility | Medium | Low | Multi-currency, regular exchange rate updates |
| Maps accuracy (small towns) | Medium | Medium | Manual address fallback, store GPS pin, transporter confirmation |
| Staff Portal scope creep | Medium | Medium | Strict RBAC enforcement, department-by-department rollout, prioritize Accounting + Customer Service first |
| Smart Discovery ranking quality | Medium | Medium | Start with conservative default weights, A/B test, tune via Staff Portal, iterate based on conversion data |
| Audit log performance at scale | Low | Medium | Append-only with partitioning by month, async writes, archive after 90 days |
| Staff adoption/training | Medium | Medium | Role-based onboarding, in-app contextual help, department-specific user guides |
| Chat spam/abuse | Medium | Medium | Rate limiting, block/report, staff moderation, link scanning for off-platform payment fraud |
| Chat WebSocket scalability | Low | Medium | Supabase Realtime handles WebSocket management; horizontal scaling via Supabase infrastructure |
| Video storage/streaming cost (Phase 2) | Medium | Medium | Use managed service (Mux/Cloudflare Stream) with usage-based pricing; set per-seller upload limits; compress before upload |
| Video content moderation backlog (Phase 2) | Medium | High | Automated pre-publish scan + auto-takedown on 5+ reports + adequate Operations staffing for manual review |
| Video adoption by sellers (Phase 2) | Medium | Medium | In-app tutorial, simple recording UX, showcase early success stories, highlight product click-through analytics |
| Low bandwidth video playback (Phase 2) | High | Medium | Adaptive bitrate (360p on 3G), data saver mode, pre-loading only on 4G/WiFi, graceful degradation |

---

## 8. Appendices

### A. Glossary

| Term | Definition |
|---|---|
| Escrow | Funds held by platform until delivery confirmed |
| KYC | Know Your Customer — identity verification |
| OTP | One-Time Password via SMS |
| MoMo | Mobile Money (MTN, Orange) |
| RLS | Row-Level Security (PostgreSQL) |
| PostGIS | PostgreSQL geo-spatial extension |
| C2M | Consumer-to-Manufacturer (Pinduoduo model) |
| RBAC | Role-Based Access Control — permissions mapped to department roles |
| MFA | Multi-Factor Authentication |
| TOTP | Time-based One-Time Password (for MFA) |
| Smart Discovery | Rules-based product ranking engine using weighted signals (Phase 1); ML-powered recommendations (Phase 2) |
| Staff Portal | Dedicated web application for company staff to manage platform operations |
| Audit Trail | Immutable, tamper-evident log of all staff actions |
| Signal Weight | Configurable multiplier for a ranking factor in the Smart Discovery engine |
| In-App Chat | Real-time messaging between all platform users (buyers, sellers, transporters) |
| Social Video Feed | Short-form vertical video feature where sellers post product showcases and buyers watch, like, comment, follow, and shop (Phase 2) |
| Shoppable Video | Video with tappable product tags that link directly to product detail and checkout |
| Store Follow | Subscription to a store's content; followers see new videos in Following feed |
| Video Strike | Policy violation recorded against a seller's video; 3 strikes = temporary upload ban, 5 = permanent |
| Content Moderation | Automated + manual review of video and chat content for policy compliance |
| HLS/DASH | Adaptive bitrate streaming protocols for video delivery (HTTP Live Streaming / Dynamic Adaptive Streaming over HTTP) |

### B. Competitive Landscape

| Feature | Pinduoduo | Alibaba | Amazon | Wunabuy |
|---|---|---|---|---|
| Group Buying | Core | Limited | None | Phase 3 |
| Social Commerce | Built-in | Limited | None | Phase 3 |
| Escrow Payment | Alipay | Alipay | Direct | Core |
| KYC for Sellers | Yes | Yes | Yes | Yes |
| Delivery Tracking | Cainiao | Cainiao | Amazon Logistics | Google Maps real-time |
| Independent Transport | No | No | Flex | Core |
| Mobile-First | Yes | Yes | Yes | Yes (only) |
| African Focus | No | No | Limited | Core mission |
| Mobile Money | WeChat Pay | Alipay | No | MoMo, Orange |
| Smart Discovery/Recommendation | ML-powered | ML-powered | ML-powered | Rules-based (Phase 1) → ML (Phase 2) |
| Internal Staff Portal | Yes | Yes | Yes | Yes (6 departments, RBAC) |
| In-App Chat | Yes (Wangwang) | Yes (Wangwang) | Limited | Yes (all-user, Phase 1) |
| Short-Form Video | Yes (PDD Live) | Yes (Taobao Live) | Yes (Inspire) | Yes (seller-only, Phase 2) |
| Shoppable Video | Yes | Yes | Yes | Yes (optional product tags, Phase 2) |
| Social Following | Yes | Yes | Limited | Yes (store follow, Phase 2) |

### C. API Reference (Preliminary)

**Auth:** `POST /api/v1/auth/{register,verify-otp,login,refresh,reset-password}`
**Products:** `GET/POST /api/v1/products`, `GET/PUT/DELETE /api/v1/products/{id}`, `POST /api/v1/products/bulk`
**Stores:** `GET /api/v1/stores`, `GET /api/v1/stores/{id}`, `POST /api/v1/stores/kyc`
**Orders:** `POST /api/v1/orders`, `GET /api/v1/orders`, `GET /api/v1/orders/{id}`, `PUT /api/v1/orders/{id}/status`, `POST /api/v1/orders/{id}/{dispute,confirm,cancel}`
**Delivery:** `GET /api/v1/delivery/jobs`, `POST /api/v1/delivery/{id}/accept`, `PUT /api/v1/delivery/{id}/{location,status}`, `POST /api/v1/delivery/{id}/photo`
**Payments:** `POST /api/v1/payments/charge`, `GET /api/v1/payments/verify/{ref}`, `GET /api/v1/wallet`, `POST /api/v1/wallet/payout`
**Reviews:** `POST /api/v1/reviews`, `GET /api/v1/reviews/{type}/{id}`
**Chat:** `GET /api/v1/chat/conversations`, `POST /api/v1/chat/conversations`, `GET /api/v1/chat/conversations/{id}/messages`, `POST /api/v1/chat/conversations/{id}/messages`, `PUT /api/v1/chat/messages/{id}`, `DELETE /api/v1/chat/messages/{id}`, `POST /api/v1/chat/block`, `POST /api/v1/chat/report`, `GET /api/v1/chat/search`
**Smart Discovery:** `GET /api/v1/discovery/feed` (personalized home feed), `GET /api/v1/discovery/ranking-config` (staff: view weights), `PUT /api/v1/discovery/ranking-config` (staff: update weights)
**Videos (Phase 2):** `POST /api/v1/videos` (upload), `GET /api/v1/videos/feed` (For You), `GET /api/v1/videos/following` (Following feed), `GET /api/v1/videos/{id}`, `DELETE /api/v1/videos/{id}`, `POST /api/v1/videos/{id}/like`, `POST /api/v1/videos/{id}/comments`, `GET /api/v1/videos/{id}/comments`, `POST /api/v1/stores/{id}/follow`, `DELETE /api/v1/stores/{id}/follow`, `POST /api/v1/videos/{id}/save`, `POST /api/v1/videos/{id}/report`, `GET /api/v1/videos/search`, `GET /api/v1/videos/hashtag/{tag}`, `GET /api/v1/videos/my-analytics` (seller)
**Staff Auth:** `POST /api/v1/staff/{login,verify-mfa,refresh,logout}`
**Staff KYC:** `GET /api/v1/staff/kyc/queue`, `PUT /api/v1/staff/kyc/{id}/{approve,reject,request-info}`
**Staff Disputes:** `GET /api/v1/staff/disputes`, `PUT /api/v1/staff/disputes/{id}/resolve`
**Staff Payouts:** `GET /api/v1/staff/payouts/queue`, `PUT /api/v1/staff/payouts/{id}/{approve,reject}`
**Staff Finance:** `GET /api/v1/staff/finance/{overview,ledger,reconciliation,reports}`
**Staff Users:** `GET /api/v1/staff/users/{search,detail}`, `PUT /api/v1/staff/users/{id}/{suspend,unsuspend}`
**Staff Config:** `GET/PUT /api/v1/staff/config/{commission,delivery,feature-flags,ranking-weights}`
**Staff Analytics:** `GET /api/v1/staff/analytics/{overview,acquisition,conversion,gmv}`
**Staff Audit:** `GET /api/v1/staff/audit-log`, `GET /api/v1/staff/audit-log/export`
**Staff Management:** `GET/POST/PUT /api/v1/staff/accounts`, `PUT /api/v1/staff/accounts/{id}/roles`
**Support Tickets:** `GET/POST /api/v1/staff/tickets`, `PUT /api/v1/staff/tickets/{id}/{assign,resolve,escalate}`
**Campaigns:** `GET/POST/PUT /api/v1/staff/campaigns`, `PUT /api/v1/staff/campaigns/{id}/feature`

---

## Document Control

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-07-25 | Agemo Technologies | Initial SRS — Full Document |
| 1.1 | 2026-07-25 | Agemo Technologies | Added Staff Portal (6 departments, RBAC, audit logging); replaced standalone Admin Dashboard; added Smart Discovery engine (Phase 1 rules-based ranking, Phase 2 ML roadmap); renamed customer roles to Buyer/Seller/Transport; expanded schema (staff_accounts, staff_roles, audit_log, ranking_signals, user_behavior, support_tickets, disputes); expanded sprint plan (28→32 weeks); added Staff Portal tech stack; updated risk management |
| 1.2 | 2026-07-25 | Agemo Technologies | Added In-App Chat (Phase 1: all-user real-time messaging, group chat, moderation, commerce integration); added Social Video Feed (Phase 2: seller-only short-form video, shoppable product tags, social engagement, content moderation, analytics); new FRs 146-217; new NFRs 056-072; new schema (conversations, messages, blocked_users, chat_reports, videos, video_product_tags, video_likes, video_comments, video_saves, video_views, store_follows, video_reports); expanded sprint plan (32→34 weeks Phase 1 + 12 weeks Phase 2); added chat/video tech stack; 7 new risks; updated RBAC with chat/video moderation permissions; added chat/video API endpoints |

**Approval Signatures**

| Role | Name | Signature | Date |
|---|---|---|---|
| Product Owner | ___________ | ___________ | ___________ |
| Lead Engineer | ___________ | ___________ | ___________ |
| Business Sponsor | ___________ | ___________ | ___________ |
| Operations Lead | ___________ | ___________ | ___________ |

---

*End of Document*
