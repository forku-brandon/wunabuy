# Product Requirements Document (PRD)
# Wunabuy — Multi-Sided Mobile E-Commerce & Logistics Platform

**Document Version:** 1.1  
**Status:** Revised / Launch-Ready Draft  
**Date:** August 25, 2026  
**Author:** Product Management & Engineering Architecture Team  
**Target Launch:** Q1 2027  
**File Location:** `wunabuy/docs/Wunabuy_PRD_v1.0.md`

---

## Executive Summary & Document Control

### Document Ownership
- **Product Manager:** Agemo Technologies Product Team
- **Lead Architect:** Cade (AI Engineering Lead)
- **Target Audience:** Executive Stakeholders, Engineering Leads, Product Designers, QA Engineers, Operations & Compliance Personnel.

### Purpose of This Document
This PRD defines the product vision, market outcome, launch scope, and decision framework for Wunabuy. It is intentionally focused on business outcomes and release priorities. Detailed system behavior, technical requirements, APIs, and data contracts are covered in the SRS.

### Revision History
| Version | Date | Author | Description of Changes |
|---|---|---|---|
| 1.0 | July 26, 2026 | Product Management Team | Initial comprehensive PRD baseline covering Mobile Apps (Buyer, Seller, Transporter), Staff Portal, Escrow Engine, Real-time Logistics, and Social Video Feed. |
| 1.1 | August 25, 2026 | Product Management Team | Tightened launch scope, clarified MVP vs Phase 2, added critical business rules for escrow, dispute, timeout, moderation, and release gating, and reduced overlap with the SRS for clearer product execution. |

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

### 4.3 Product Success Criteria for Launch
The product is considered ready to launch when all of the following are true:
- Buyer can register, verify identity, browse, search, order, pay, track, and receive goods without staff intervention.
- Seller can onboard, list products, receive order notifications, acknowledge fulfillment, and receive escrow payouts.
- Vehicle rider can accept jobs, navigate routes, update delivery status, and confirm proof of delivery.
- Staff Portal enables KYC approval, dispute mediation, payout review, and audit logging.
- Escrow, payouts, and order state transitions are fully auditable.

---

## 5. Product Scope: MVP vs Phase 2

### 5.1 MVP Launch Scope (Required for Q1 2027 Launch)
The following features are mandatory for launch in the first city:
- Buyer registration and authentication
- Seller onboarding and KYC review
- Product listing and inventory management
- Product search, filters, category browsing, and product detail
- Cart, checkout, payment, and escrow hold
- Order lifecycle and notifications
- Store order dashboard and basic wallet views
- Delivery job assignment, GPS tracking, and proof of delivery
- Ratings and disputes
- Staff Portal with critical ops dashboards
- Audit logging and RBAC enforcement
- Real-time chat for commerce coordination

### 5.2 Explicit Out-of-Scope for Launch
The following features SHALL be postponed until after launch:
- Social video feed
- Shoppable video overlays
- Group buying / social commerce features
- Advanced ML personalization
- Dynamic pricing recommendations
- Large-scale marketing automation
- Full video moderation analytics suite

### 5.3 Scope Guardrails
To prevent product creep and launch failure, the following guardrails are required:
- No feature is considered launch-critical unless it directly affects trust, payment, fulfillment, or regulatory compliance.
- Phase 2 features must not block the launch of MVP features.
- Every deferred feature must have an owner, business case, and acceptance criteria.

---

## 6. Functional Requirements (EPICs & Features)

### EPIC 1: User Management & Authentication Framework
- **FR-001 (High):** Registration via mobile phone number with 6-digit SMS OTP verification.
- **FR-002 (High):** Self-registration role selection strictly restricted to `Buyer` or `Seller` (Store Owner).
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

### EPIC 6: Reviews, Ratings & Disputes
- **FR-026 (High):** Buyer can rate product, store, and transporter after delivery.
- **FR-027 (High):** Disputes can be opened for wrong item, damage, non-delivery, and misrepresentation.
- **FR-028 (High):** Escrow remains frozen while a dispute is active.
- **FR-029 (High):** Customer support and compliance staff can mediate and issue final outcomes.

### EPIC 7: Staff Portal & Operations
- **FR-030 (High):** Staff Portal supports login, MFA, department switching, RBAC, and audit logging.
- **FR-031 (High):** Staff can review KYC, manage payouts, view transactions, and monitor active deliveries.
- **FR-032 (High):** The portal provides financial, operational, and support workspaces needed for launch.
- **FR-033 (High):** All staff actions are logged with before/after state and actor metadata.

### EPIC 8: Real-Time Chat (Launch)
- **FR-034 (High):** Buyer, Seller, and Transporter can message each other in real time.
- **FR-035 (High):** Message payloads support text, product cards, order cards, and shared media.
- **FR-036 (High):** Report, block, and mute flows are available for safety and moderation.
- **FR-037 (High):** Message traffic is rate-limited and monitored against abuse.

### EPIC 9: Social Video Feed (Deferred to Phase 2)
- **FR-038 (Medium):** Verified sellers can post short-form videos after launch.
- **FR-039 (Medium):** Shoppable video tags and product overlays are enabled only after the core flow is stable.
- **FR-040 (Medium):** Video analytics and moderation features are policy-gated and staff-reviewed.

---

## 7. Critical Business Rules (Launch Requirements)

These rules are mandatory for launch and cannot be treated as optional product polish.

| Rule ID | Rule | Operational Requirement |
|---|---|---|
| BR-01 | Store acknowledgment timeout | Store must acknowledge a new order within 2 hours or the order auto-cancels and the buyer is refunded. |
| BR-02 | Escrow release | Escrow releases automatically 48 hours after delivery confirmation if no dispute is raised. |
| BR-03 | Dispute freeze | Escrow remains frozen while a dispute is open or being reviewed. |
| BR-04 | Payment failure fallback | If primary gateway fails, the system retries through Paystack or marks the transaction as pending for staff review. |
| BR-05 | Refund authority | Only approved staff or the system can trigger a refund according to dispute policy; no ad hoc manual override without audit logging. |
| BR-06 | Rider no-show | If a rider does not accept or reach the pickup point within a configured window, the order is reassigned or auto-cancelled under policy. |
| BR-07 | KYC re-submission | Users may resubmit KYC only up to 3 times before being escalated for manual review. |
| BR-08 | Suspended seller restrictions | Suspended or unverified stores cannot list products or receive payments. |
| BR-09 | Chat safety | Off-platform payment requests, abuse reports, and spam patterns are blocked and escalated to staff moderation. |
| BR-10 | Auditability | All operational decisions with financial or trust impact must be logged with actor, time, before/after state, and reason. |

---

## 8. System Architecture & Technical Specifications

```
                       ┌──────────────────────────────────────────┐
                       │       React Native Mobile App            │
                       │   (Expo SDK 51 / Hermes Engine)          │
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

### 6.1 Tech Stack Summary
- **Mobile Client:** React Native 0.74+, Expo SDK 51+, TypeScript, React Navigation 6, Zustand, TanStack React Query v5.
- **Staff Portal Client:** React 18, Vite 5, Tailwind CSS, Radix UI, TanStack Table v8, Recharts.
- **Backend & Database:** Laravel 13 (PHP 8.3+), PostgreSQL 15 with PostGIS spatial extensions, Laravel Flysystem Storage, Redis caching & Horizon queues, Laravel Reverb WebSockets.
- **External Integrations:** Google Maps SDK (Directions, Distance Matrix), Flutterwave, Paystack, Africa's Talking (SMS OTP), Firebase FCM / Apple APNs.

---

## 7. Non-Functional Requirements (NFRs)

### 7.1 Performance & Latency
- **NFR-001:** Cold start time $\le 3\text{s}$ on mid-range Android hardware (3G connection).
- **NFR-002:** Product search response latency $\le 2\text{s}$ for $50\text{km}$ radius queries.
- **NFR-003:** Product image thumbnail load time $\le 500\text{ms}$ with progressive blur-up placeholders.
- **NFR-004:** API 95th percentile (p95) response latency $\le 500\text{ms}$.

### 7.2 Security & Data Privacy
- **NFR-005:** All network communications strictly enforced via HTTPS with TLS 1.3 minimum.
- **NFR-006:** Encrypted database storage (AES-256) for sensitive user PII and KYC identity documents.
- **NFR-007:** PCI-DSS compliance: Zero payment card numbers stored directly in Wunabuy databases (strict tokenization via Flutterwave/Paystack).
- **NFR-008:** Database policies and middleware enforced to guarantee strict data isolation between stores and users.

### 7.3 Scalability & Availability
- **NFR-009:** Backend service uptime target of $99.5\%$ excluding scheduled maintenance windows.
- **NFR-010:** System architecture supports minimum 1,000 active stores, 5,000 active buyers, and 500 concurrent delivery tracking sessions without performance degradation.

---

## 8. Release Roadmap & Milestones

```
Phase 1: Core Foundation (Weeks 1-8)
├── React Native Scaffold, Monorepo Setup, Design Tokens
├── Phone / Email Auth, OTP Verification, Profile Context
├── Store Registration & Multi-step KYC Submission Flow
└── Product CRUD, Image Upload, Inventory Tracking

Phase 2: Commerce & Payments (Weeks 9-16)
├── Full-Text Search, PostGIS Radius Filters, Category Navigation
├── Cart, Address Selector, Flutterwave/Paystack Integration
├── Escrow Lifecycle State Machine, Store Wallet
└── Order Management Dashboard for Merchants

Phase 3: Logistics & Trust Engine (Weeks 17-22)
├── Transporter Job Acceptance, Pickup Workflow
├── Real-Time GPS Tracking via Google Maps SDK
├── Photo Proof of Delivery, Escrow Auto-Release Trigger
└── Review & 3-Tier Rating System, Dispute Resolution Engine

Phase 4: Operations & Launch (Weeks 23-28)
├── Staff Web Portal Dashboards (Finance, Ops, Support, etc.)
├── Multi-language support (English, French, Swahili)
├── Security Audits, Load Testing, App Store & Play Store Release
└── Phase 2 Social Video Feed rollout (Post-Launch)
```

---

## 9. Risk Management Matrix

| Risk Event | Probability | Impact | Mitigation Strategy |
|---|---|---|---|
| Payment Gateway Downtime | Medium | High | Dual gateway redundancy (Flutterwave primary, Paystack auto-fallback). |
| Unstable 3G Mobile Networks | High | Medium | Offline write queues, request retry handlers, image size compression, low-bandwidth optimization. |
| Fraudulent Merchant Registration | Medium | High | Mandatory multi-step KYC (Government ID + GPS Store Photo + Business Registration) validated by staff. |
| Transport Driver Delay / No-Show | Medium | Medium | Automated job reassignment if rider does not arrive at store within 15 minutes of job acceptance. |

---

## 10. Acceptance Criteria & Definition of Done (DoD)

A requirement is considered **Complete and Ready for Release** when:
1. **Code Completeness:** Source code written, peer-reviewed via Pull Request, and merged into `main`.
2. **Type Safety:** Zero TypeScript build errors in monorepo packages, mobile app, and staff portal.
3. **Automated Test Coverage:** $\ge 80\%$ unit test coverage for core business logic (Escrow state transitions, pricing calculators, auth utilities).
4. **Integration Verification:** End-to-end user journeys pass successfully on physical iOS and Android devices over 3G network throttlers.
5. **Security Verification:** Code passes static security analysis (SAST) and OWASP Top 10 web/mobile security checks.
6. **Documentation:** API endpoints updated in Swagger/OpenAPI spec and user manual documented for Staff Portal departments.

---

### Approval Signatures

**Product Manager:** _Agemo Technologies Product Lead_  
**Technical Lead:** _Cade (AI Lead Architect)_  
**Lead QA Engineer:** _Wunabuy Quality Assurance Team_  

---
**[End of Product Requirements Document]**
