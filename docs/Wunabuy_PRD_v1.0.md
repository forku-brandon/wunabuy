# Product Requirements Document (PRD)
# Wunabuy — Multi-Sided Mobile E-Commerce & Logistics Platform

**Document Version:** 1.0  
**Status:** Approved / Final  
**Date:** July 26, 2026  
**Author:** Product Management & Engineering Architecture Team  
**Target Launch:** Q1 2027  
**File Location :** `C:\Users\HP\Downloads\Wunabuy_PRD_v1.0.md`

---

## Executive Summary & Document Control

### Document Ownership
- **Product Manager:** Agemo Technologies Product Team
- **Lead Architect:** Cade (AI Engineering Lead)
- **Target Audience:** Executive Stakeholders, Engineering Leads, Product Designers, QA Engineers, Operations & Compliance Personnel.

### Revision History
| Version | Date | Author | Description of Changes |
|---|---|---|---|
| 1.0 | July 26, 2026 | Product Management Team | Initial comprehensive PRD baseline covering Mobile Apps (Buyer, Seller, Transporter), Staff Portal, Escrow Engine, Real-time Logistics, and Social Video Feed. |

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

## 5. Functional Requirements (EPICs & Features)

### EPIC 1: User Management & Authentication Framework
- **FR-001 (High):** Registration via mobile phone number with 6-digit SMS OTP verification (Africa's Talking / Twilio).
- **FR-002 (High):** Email + password registration fallback with email verification links.
- **FR-003 (High):** Contextual role switching (`Buyer`, `Seller`, `Transporter`) within a single unified account profile.
- **FR-004 (High):** Secure session management utilizing JWT Access Tokens (1h expiry) and Refresh Tokens (30-day expiry).
- **FR-005 (High):** Staff Portal Multi-Factor Authentication (TOTP MFA) with 15-minute inactivity auto-logout.

### EPIC 2: Store Onboarding & Tiered KYC Verification
- **FR-006 (High):** Multi-step merchant KYC submission form collecting:
  - Personal identification (National ID / Passport front & back).
  - Physical store verification (GPS coordinates pin + storefront photograph).
  - Business registration certificate or signed ownership affidavit.
- **FR-007 (High):** Automated document clarity check and secure encrypted storage (AES-256) in private Supabase buckets.
- **FR-008 (High):** Operations/Compliance staff review queue in Staff Portal with Approve, Reject, and Request Info workflows.
- **FR-009 (High):** Push notification and SMS alert dispatch upon KYC status changes.

### EPIC 3: Product Catalog, Inventory & Search Engine
- **FR-010 (High):** Store product creation supporting up to 5 photos, title, category, description, quality tier (`New`, `Like New`, `Good`, `Fair`), price, and stock quantity.
- **FR-011 (High):** Automated inventory decrementing upon order confirmation with low-stock alerts ($\le 5\text{ units}$).
- **FR-012 (High):** Advanced Search & Discovery:
  - Full-text search across product titles, descriptions, and categories.
  - Multi-parameter filtering (price range, PostGIS distance radius 1–50 km, quality tier, store rating).
  - Multi-option sorting (Smart Recommendation Rank, Distance, Price Low-to-High, Rating, Newest).

### EPIC 4: Escrow Payment & Multi-Currency Engine
- **FR-013 (High):** Integration with primary African payment gateways:
  - **Flutterwave (Primary):** MTN Mobile Money, Orange Money, Card payments.
  - **Paystack (Fallback):** Automatic fallback execution upon primary gateway timeout/failure.
- **FR-014 (High):** Escrow Funds Lifecycle:
  1. Buyer pays $\rightarrow$ Funds held in platform escrow account (`PAID_ESCROW`).
  2. Order delivered & confirmed $\rightarrow$ Escrow released to Store Wallet (`COMPLETED`).
  3. Auto-release trigger after 48 hours if no dispute is raised by buyer.
- **FR-015 (High):** Store & Transporter Wallet management with automated platform commission deduction ($5\% - 10\%$).

### EPIC 5: Logistics, Route Optimization & GPS Real-Time Tracking
- **FR-016 (High):** Automated job dispatch notifying nearby active transport providers within configured radius.
- **FR-017 (High):** Real-time GPS location broadcasting at 10-second intervals via Supabase Realtime WebSockets.
- **FR-018 (High):** Interactive Google Maps UI displaying driver location marker, route polyline, and dynamic ETA.
- **FR-019 (High):** Proof of Delivery requirement: Rider must upload a clear photo of delivered goods to complete job.

### EPIC 6: Review, Rating & Dispute Resolution Framework
- **FR-020 (High):** Post-delivery 3-tier rating system: Product (1-5 stars), Store Service (1-5 stars), Transporter (1-5 stars).
- **FR-021 (High):** Weighted Store Aggregate Rating calculation: $70\%$ product score + $30\%$ service score.
- **FR-022 (High):** Dispute Resolution Workflow:
  - Buyer opens dispute within 48h of delivery (reasons: wrong item, damaged, non-delivery).
  - Escrow funds frozen immediately (`DISPUTED`).
  - Store granted 24h to respond/resolve directly.
  - Escalate to Staff Portal Customer Service workspace for binding staff mediation and refund issuance.

### EPIC 7: Real-Time Chat & Commerce Integration
- **FR-023 (High):** One-on-one text messaging between Buyer $\leftrightarrow$ Seller and Buyer $\leftrightarrow$ Transporter via Supabase Realtime.
- **FR-024 (High):** Rich message payloads: In-chat Product Cards (deep link to listing) and Order Status Cards.
- **FR-025 (High):** Safety Controls: Automated profanity filter, URL link scanner, and user block/report mechanisms.

### EPIC 8: Social Video Showcase (Phase 2 Roadmap)
- **FR-026 (High):** Verified merchant short-form vertical video uploads (9:16 aspect ratio, 10–60s duration).
- **FR-027 (High):** Shoppable Video Overlays: Tag 1–5 catalog products on video; tap tag to reveal bottom-sheet purchase modal without leaving video feed.
- **FR-028 (High):** Video Feed Recommendation Engine: "For You" feed and "Following" store feed.

### EPIC 9: Staff Web Operations Portal
- **FR-029 (High):** Dedicated Web App featuring 6 specialized department workspaces:
  1. **Accounting/Finance:** Escrow reconciliation, pending payout approval queue, transaction ledger, revenue analytics.
  2. **Operations:** KYC queue review, live delivery map monitoring, store suspension control.
  3. **Customer Service:** Support ticket queues, dispute evidence comparison viewer, refund trigger tool, chat moderation.
  4. **Compliance/Legal:** Final KYC verification authority, fraud detection alerts, audit log export.
  5. **Marketing:** Featured product curation, push campaign builder, analytics overview.
  6. **IT & System Admin:** System health monitoring, global configuration parameters, staff user provisioning.

---

## 6. System Architecture & Technical Specifications

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
                       │          Node.js / Express API           │
                       │             (v1 Endpoints)               │
                       └────────────────────┬─────────────────────┘
                                            │
               ┌────────────────────────────┼────────────────────────────┐
               │                            │                            │
               ▼                            ▼                            ▼
┌─────────────────────────────┐ ┌───────────────────────┐ ┌───────────────────────────┐
│     Supabase PostgreSQL     │ │  Firebase Cloud Func. │ │    Third-Party APIs       │
│  (PostGIS, Auth, Realtime)  │ │   (FCM, Cron Jobs)    │ │ (Flutterwave, Maps, SMS)  │
└─────────────────────────────┘ └───────────────────────┘ └───────────────────────────┘
```

### 6.1 Tech Stack Summary
- **Mobile Client:** React Native 0.74+, Expo SDK 51+, TypeScript, React Navigation 6, Zustand, TanStack React Query v5.
- **Staff Portal Client:** React 18, Vite 5, Tailwind CSS, Radix UI, TanStack Table v8, Recharts.
- **Backend & Database:** Node.js/Express, Supabase PostgreSQL 15 with PostGIS spatial extensions, Supabase Storage, Redis caching.
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
- **NFR-008:** Row-Level Security (RLS) policies configured on Supabase tables to enforce strict data isolation between stores and users.

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
