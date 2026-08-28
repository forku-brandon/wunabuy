# Software Requirements Specification (SRS)
# Wunabuy — Multi-Sided Mobile E-Commerce Platform

**Document Version:** 1.2  
**Date:** August 25, 2026  
**Status:** Revised Draft — Launch Readiness Update  

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

**In Scope (Launch MVP):**
- Mobile app (iOS & Android via React Native) for Buyers, Sellers, and Transport Providers
- Store KYC verification (identity, location, ownership proof)
- Product catalog with basic inventory management
- Search with filters, category browsing, and basic product detail views
- Smart Discovery engine: rules-based ranking by location, price, quality, and user behavior (Phase 1)
- Escrow-based payment: mobile money (MTN MoMo, Orange Money) + card via Flutterwave/Paystack
- Real-time GPS delivery tracking via Google Maps for in-city delivery flows
- Review, rating, and dispute resolution for completed orders
- Staff Portal (web application) with selective departmental dashboards, RBAC, and audit logging
- Multi-language support for launch markets (English, French, Swahili)

**Out of Scope (Phase 2+):**
- Web storefront for customers
- Cross-border logistics
- Full ML recommendation models (collaborative filtering, dynamic pricing, demand prediction)
- Loyalty program, B2B wholesale, group-buying social commerce
- Advanced custom analytics beyond initial operational dashboards

> **Scope clarification for v1.2:** The platform remains intentionally scoped to a launch-ready MVP with a constrained operational footprint. The Staff Portal is required, but the launch scope prioritizes the department dashboards that support payments, KYC, customer support, delivery, and compliance. Full-feature marketing automation, advanced analytics, and broad ML-driven personalization remain Phase 2.

> **Launch priority rule:** Requirements marked High may still be deferred if they materially increase operational risk or expand the launch scope. All critical trust, payment, KYC, delivery, and audit requirements remain mandatory for launch.

### 1.5 References

| Reference | Description |
|---|---|
| IEEE 830-1998 | IEEE Recommended Practice for SRS |
| Pinduoduo | Group-buying, social commerce, C2M supply chain |
| Alibaba/Taobao | Alipay escrow: funds held until delivery confirmed |
| Amazon Marketplace | Third-party seller model, review system |
| Flutterwave API | Payment gateway for African markets |
| Google Maps Platform | Geolocation, tracking APIs |
| Supabase | PostgreSQL, Auth, Realtime, RLS |
| Firebase | Cloud Functions, FCM, Analytics |
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
|  |                  BACKEND (Supabase + Firebase)                     |  |
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
- Key needs: Find goods nearby, compare prices, pay securely, track delivery

#### Seller (Store Owner)
- Technical level: Low-moderate (small business owners)
- Onboarding: KYC required (ID, store photos, location, business proof)
- Volume: 1,000+ stores
- Key needs: Upload products, manage inventory, receive orders, track earnings

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
| Backend | Supabase (PostgreSQL + PostGIS) + Firebase Cloud Functions |
| Storage | Supabase Storage for images/docs |
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
| C8 | Supabase + Firebase backend |
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
| D2 | Supabase/Firebase availability |
| D3 | SMS gateway (Africa's Talking/Twilio) for OTP |

### 2.7 Launch Scope & Risk Controls

The platform SHALL follow a constrained launch strategy. The following policy SHALL govern scope and implementation prioritization:

| ID | Policy |
|---|---|
| L1 | Launch MUST prioritize trust, payment, KYC, core commerce, and delivery reliability over non-critical marketing or social features |
| L2 | Non-MVP features SHALL be explicitly deferred and tracked in the backlog with clear owners |
| L3 | Store acknowledgement, dispute timeouts, and escrow release rules SHALL be deterministic and auditable |
| L4 | Role-based access SHALL be enforced server-side; UI restrictions alone are not sufficient |
| L5 | Ranking heuristics SHALL include safety rules to prevent manipulation, stale ranking, and cold-start instability |
| L6 | Operational dashboards SHALL be phase-gated so only required department workflows ship at launch |

---

## 3. System Features

### 3.1 User Management & Authentication

| ID | Requirement | Priority |
|---|---|---|
| FR-001 | Register via phone number with SMS OTP | High |
| FR-002 | Register via email with password | High |
| FR-003 | Social login (Google, Facebook) | Medium |
| FR-004 | Role assignment on registration: Buyer default; Seller and Transporter unlocked only after staff approval | High |
| FR-005 | Guarded role switching (hidden until approved in user.available_roles by backend staff) | High |
| FR-006 | Laravel Sanctum token-based session management (access + refresh tokens) | High |
| FR-007 | Password reset via SMS OTP | High |
| FR-008 | Phone number uniqueness enforced platform-wide | High |
| FR-009 | Profile management: name, photo avatar, contact, preferences | Medium |
| FR-009A | Wallet Balance Privacy Masking: Interactive eye toggle to hide/show balances | High |
| FR-009B | Followed Stores Feed: Dedicated screen showing followed stores and their latest products | High |
| FR-009C | Favorites & Wishlist: One-tap heart like interaction with dedicated management screen | High |
| FR-009D | Browsing Footprint: Chronological tracking of viewed products with clearing capabilities | High |
| FR-009E | Refunds & Disputes Dashboard: Dual-tab review of in-progress escrow claims vs. completed refunds | High |
| FR-010 | Address Manager: Full CRUD for saved delivery addresses with default selection | High |

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
| FR-046 | Store must acknowledge within 2 hours of order receipt or the order SHALL auto-cancel and refund the buyer | High |
| FR-047 | Cancellation: by customer (pre-preparing), by store, or by timeout policy | High |
| FR-048 | Auto-refund on cancellation SHALL be processed within the configured payout window and must record the reason in the ledger | High |
| FR-049 | Full audit trail of order state transitions SHALL capture before/after state, actor, timestamp, and related metadata | High |
| FR-050 | Customer order history with status | High |
| FR-051 | Store order dashboard with filters | High |
| FR-052 | Platform commission (configurable, default 5-10%) | High |
| FR-053 | Store wallet: escrow balance, available balance, transactions, payouts | High |
| FR-054 | Auto-release escrow after 48 hours if no dispute is raised; if a dispute is raised, escrow remains frozen until the case is resolved | High |
| FR-055 | Staff Portal: Finance staff can view escrow balances, approve/reject payouts, reconcile transactions | High |
| FR-056 | Order timeout events SHALL be retried and logged to avoid silent failures in payment or acknowledgement workflows | Medium |
| FR-057 | When a gateway payout or transfer fails, the system SHALL create a failed-payout record and notify staff for manual review | High |

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
| FR-087 | Access control SHALL be enforced at the backend API layer; UI role restrictions SHALL NOT be treated as the sole enforcement mechanism | High |
| FR-088 | A staff member without explicit permission SHALL be denied access even if assigned to a department with a different role | High |
| FR-089 | Role assignment changes SHALL emit an audit event and invalidate active sessions if they reduce privileges or change access scope | Medium |

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
| FR-140 | Ranking SHALL include safety rules to prevent manipulation by fake reviews, duplicate listings, or inventory gaming | High |
| FR-141 | Cold-start products SHALL receive a stable default score rather than being hidden indefinitely when behavior data is insufficient | Medium |
| FR-142 | Ranking configuration changes SHALL be versioned and logged for rollback and audit review | High |
| FR-143 | Fraudulent or suspended stores SHALL be excluded from Smart Discovery rankings regardless of product quality or pricing | High |

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
| FR-144 | Collaborative filtering: recommend based on similar buyer behavior patterns | Phase 2 |
| FR-145 | Content-based filtering: recommend based on product attribute similarity | Phase 2 |
| FR-146 | Dynamic pricing suggestions: ML-driven price recommendations for sellers | Phase 2 |
| FR-147 | Demand prediction: forecast demand by category, region, season | Phase 2 |
| FR-148 | Personalized home feed: per-buyer curated product stream | Phase 2 |
| FR-149 | Search relevance learning: ML model trained on search → purchase conversions | Phase 2 |

---

## 4. External Interface Requirements

### 4.1 User Interfaces

#### Buyer App Screens
| Screen | Elements |
|---|---|
| Home | Smart Discovery feed (personalized ranking), search bar, categories, featured products, nearby stores, recent orders |
| Search | Filter panel, product cards (image/name/price/store/distance/rating), sort, smart-ranked results |
| Product Detail | Image carousel, price, quality, store card, delivery estimate, reviews, Add to Cart |
| Cart | Product list, qty controls, subtotal, delivery estimate, Checkout |
| Checkout | Address selector, payment method (MoMo/Card), order summary, Pay Now |
| Track Order | Live map, transporter location, status timeline, ETA |
| Orders | Tabs: Active/Completed/Cancelled |
| Reviews | Star inputs, text, photo upload |

#### Seller (Store Owner) App Screens
| Screen | Elements |
|---|---|
| Dashboard | Today's orders, pending revenue, store rating |
| Products | Product grid with stock levels, add/edit, search |
| Add Product | Name, category, description, price, qty, quality, photo upload |
| Orders | Incoming orders, accept/decline, fulfillment flow |
| Wallet | Escrow balance, available balance, transactions, payouts |
| KYC | Verification status, document re-upload |

#### Transport Provider App Screens
| Screen | Elements |
|---|---|
| Dashboard | Available jobs, active deliveries, earnings |
| Delivery Detail | Pickup/drop-off, item, fee, accept/decline |
| Active Delivery | Map + route, status buttons, navigation |
| Earnings | Daily/weekly history, payouts |

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

### 4.2 Hardware Interfaces

| Interface | Usage |
|---|---|
| Camera | Product photos, KYC docs, delivery confirmation, review photos |
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

#### Backend (Supabase)
- PostgreSQL + PostGIS (geo queries)
- Supabase Auth (phone/email/social for mobile apps; email+MFA for Staff Portal)
- Realtime subscriptions (order status, tracking, staff notifications)
- Row-Level Security (data isolation, staff permission enforcement)

#### Notifications
- Firebase Cloud Messaging (push — mobile apps)
- Web Push API (Staff Portal notifications)
- Africa's Talking / Twilio (SMS OTP)
- SendGrid / Resend (transactional email)

### 4.4 Communication Protocols

| Protocol | Usage |
|---|---|
| HTTPS/REST | All API calls (mobile apps + Staff Portal) |
| WebSocket (Supabase Realtime) | Live order/tracking updates, staff real-time alerts |
| SMS | OTP, critical alerts |
| FCM/APNs | Push notifications (mobile) |
| Web Push | Staff Portal browser notifications |

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

### 6.2 Data Flow

```
[Mobile Apps] --REST--> [Supabase API] --> [PostgreSQL]
                              |
                        [Realtime] --WS--> [Store App]
                              |         --WS--> [Transporter App]
                              
[Staff Portal] --REST--> [Supabase API] --> [PostgreSQL]
                              |
                        [Realtime] --WS--> [Staff Portal notifications]

[Smart Ranking Engine] <-- [ranking_config] + [ranking_signals] + [user_behavior]
     |
     v
[Search/Browse API] --ranked results--> [Mobile Apps]

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

### 7.2 Sprint Plan — 32 Weeks to Launch

**Phase 1: Foundation (Weeks 1-8)**
| Sprint | Deliverables |
|---|---|
| 1 | React Native scaffold, Supabase setup, CI/CD, design system |
| 2 | Phone/email auth, OTP, JWT, role-based profiles (Buyer/Seller/Transport) |
| 3 | Multi-step KYC form, document upload, staff KYC review queue (Staff Portal base) |
| 4 | Product CRUD, image upload, inventory tracking |

**Milestone M1 (Week 8):** MVP Core — Registration, KYC submission, product listing, Staff Portal shell with auth + RBAC.

**Phase 2: Commerce Engine (Weeks 9-16)**
| Sprint | Deliverables |
|---|---|
| 5 | Full-text search, filters, geolocation queries, category browsing |
| 6 | Smart Discovery ranking engine: signal computation, configurable weights, behavior tracking |
| 7 | Cart, checkout, address management, Flutterwave integration |
| 8 | Payment processing, escrow, order state machine, store wallet |

**Milestone M2 (Week 16):** Full commerce: smart-ranked search → buy → pay → escrow.

**Phase 3: Delivery & Trust (Weeks 17-24)**
| Sprint | Deliverables |
|---|---|
| 9 | Transporter registration, job assignment, Google Maps integration |
| 10 | Real-time GPS tracking, route optimization, ETA, delivery confirmation |
| 11 | Rating system, reviews, dispute workflow, dispute workspace in Staff Portal |
| 12 | Customer Service dashboard: support tickets, user lookup, refund console |

**Milestone M3 (Week 24):** Full delivery + review + dispute + customer service operations.

**Phase 4: Staff Portal Completion & Launch Prep (Weeks 25-32)**
| Sprint | Deliverables |
|---|---|
| 13 | Accounting/Finance dashboard: escrow reconciliation, payout queue, financial reports |
| 14 | IT/Engineering dashboard: system health, config management, staff management, audit log |
| 15 | Operations + Compliance dashboards: KYC approval, delivery monitoring, fraud cases, regulatory tracker |
| 16 | Marketing dashboard + i18n + performance optimization + security audit + load testing + app store submission |

**Milestone M4 (Week 32):** Launch-ready in first African city with full Staff Portal.

> **Timeline change from v1.0:** Sprint plan extended from 28 to 32 weeks to accommodate Staff Portal development (separate web codebase, 6 department dashboards, RBAC, audit logging) and Smart Discovery engine. Team expanded by 1 React Web Developer.

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

### C. API Reference (Preliminary)

**Auth:** `POST /api/v1/auth/{register,verify-otp,login,refresh,reset-password}`
**Products:** `GET/POST /api/v1/products`, `GET/PUT/DELETE /api/v1/products/{id}`, `POST /api/v1/products/bulk`
**Stores:** `GET /api/v1/stores`, `GET /api/v1/stores/{id}`, `POST /api/v1/stores/kyc`
**Orders:** `POST /api/v1/orders`, `GET /api/v1/orders`, `GET /api/v1/orders/{id}`, `PUT /api/v1/orders/{id}/status`, `POST /api/v1/orders/{id}/{dispute,confirm,cancel}`
**Delivery:** `GET /api/v1/delivery/jobs`, `POST /api/v1/delivery/{id}/accept`, `PUT /api/v1/delivery/{id}/{location,status}`, `POST /api/v1/delivery/{id}/photo`
**Payments:** `POST /api/v1/payments/charge`, `GET /api/v1/payments/verify/{ref}`, `GET /api/v1/wallet`, `POST /api/v1/wallet/payout`
**Reviews:** `POST /api/v1/reviews`, `GET /api/v1/reviews/{type}/{id}`
**Smart Discovery:** `GET /api/v1/discovery/feed` (personalized home feed), `GET /api/v1/discovery/ranking-config` (staff: view weights), `PUT /api/v1/discovery/ranking-config` (staff: update weights)
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
| 1.2 | 2026-08-25 | Agemo Technologies | Tightened launch scope to prioritized MVP requirements; added explicit operational rules for order acknowledgement, escrow release, payout failure handling, and dispute controls; formalized backend enforcement for RBAC; added ranking safety controls; clarified launch-readiness and backlog deferral policy |

**Approval Signatures**

| Role | Name | Signature | Date |
|---|---|---|---|
| Product Owner | ___________ | ___________ | ___________ |
| Lead Engineer | ___________ | ___________ | ___________ |
| Business Sponsor | ___________ | ___________ | ___________ |
| Operations Lead | ___________ | ___________ | ___________ |

---

*End of Document*
