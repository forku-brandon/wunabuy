# Software Requirements Specification (SRS)
# Wunabuy — Multi-Sided Mobile E-Commerce Platform

**Document Version:** 1.0  
**Date:** July 25, 2026  
**Status:** Final Draft  

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

This Software Requirements Specification (SRS) defines the complete functional and non-functional requirements for **Wunabuy**, a multi-sided mobile e-commerce marketplace designed to connect customers with local stores and transport providers across African markets. The document serves as the authoritative reference for all stakeholders — including product managers, developers, QA engineers, and business executives.

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

### 1.4 Project Scope

**In Scope:**
- Mobile app (iOS & Android via React Native) for Customers, Store Owners, and Transport Providers
- Store KYC verification (identity, location, ownership proof)
- Product catalog with inventory management
- Advanced search with filters (price, location, quantity, quality, rating)
- Escrow-based payment: mobile money (MTN MoMo, Orange Money) + card (Flutterwave/Paystack)
- Real-time GPS delivery tracking via Google Maps
- Review, rating & dispute resolution
- Admin dashboard & multi-language support (English, French, Swahili)

**Out of Scope (Phase 2+):**
- Web storefront, cross-border logistics, AI recommendations, loyalty program, B2B wholesale

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

---

## 2. Overall Description

### 2.1 Product Perspective

Wunabuy is a new, self-contained mobile e-commerce ecosystem bridging three user groups into an integrated marketplace:

```
+-------------------------------------------------------+
|                   WUNABUY PLATFORM                     |
|                                                        |
|  +----------+   +----------+   +------------------+   |
|  | CUSTOMER |   |  STORE   |   |   TRANSPORT      |   |
|  |   App    |   |  Owner   |   |   Provider App   |   |
|  +----+-----+   +----+-----+   +--------+---------+   |
|       |              |                  |              |
|  +----+--------------+------------------+----------+   |
|  |            BACKEND (Supabase + Firebase)          |   |
|  |  Auth │ Orders │ Payment │ Search │ KYC │ Track  |   |
|  +--------------------------------------------------+   |
|                                                        |
|  +--------------------------------------------------+   |
|  |       EXTERNAL: Google Maps │ Flutterwave        |   |
|  |       Paystack │ MTN MoMo │ Orange Money         |   |
|  +--------------------------------------------------+   |
+-------------------------------------------------------+
```

### 2.2 Product Functions

| Area | Description |
|---|---|
| User Management | Registration, auth (phone+OTP, email, social SSO), profiles |
| Store Onboarding | KYC workflow: document upload, location verification, approval |
| Product Catalog | Upload with images, pricing, stock; bulk upload; inventory tracking |
| Search & Discovery | Full-text search; filter by price, distance, quality, rating |
| Escrow Payment | Pay → Hold → Deliver → Confirm → Release to store |
| Order Lifecycle | Pending → Paid → Preparing → In Transit → Delivered → Completed |
| Delivery Tracking | Real-time GPS via Google Maps; ETA; photo confirmation |
| Reviews & Ratings | Star ratings, text/photo reviews; weighted aggregation |
| Admin Panel | KYC queue, dispute management, analytics, configuration |
| Notifications | Push (FCM/APNs), SMS fallback, in-app center |

### 2.3 User Classes

#### Customer
- Technical level: Low-moderate (smartphone user)
- Onboarding: Phone + OTP
- Volume: 5,000+ registered, ~500 concurrent

#### Store Owner
- Technical level: Low-moderate (small business owners)
- Onboarding: KYC required (ID, store photos, location, business proof)
- Volume: 1,000+ stores

#### Transport Provider
- Technical level: Low (riders, drivers)
- Onboarding: Vehicle registration, license, photo
- Volume: 200+ active in launch city

#### Admin
- Technical level: Moderate-high
- Access: Web dashboard
- Key needs: Workflow automation, bulk operations, audit logs

### 2.4 Operating Environment

| Component | Specification |
|---|---|
| Client | iOS 15+, Android 10+ |
| Network | 3G/4G/LTE/WiFi (low-bandwidth optimized) |
| Backend | Supabase (PostgreSQL + PostGIS) + Firebase Cloud Functions |
| Storage | Supabase Storage for images/docs |
| Notifications | FCM / APNs |
| Maps | Google Maps SDK + Platform APIs |
| Payments | Flutterwave (primary), Paystack (fallback) |

### 2.5 Design Constraints

| ID | Constraint |
|---|---|
| C1 | Mobile-first — no web storefront in Phase 1 |
| C2 | Offline resilience with graceful degradation |
| C3 | Low bandwidth optimized: <2MB initial load on 3G |
| C4 | Multi-currency: XAF, NGN, KES, USD |
| C5 | Regulatory: NDPR (Nigeria), DPA (Kenya) |
| C6 | React Native for cross-platform |
| C7 | Supabase + Firebase backend |

### 2.6 Assumptions & Dependencies

| # | Item |
|---|---|
| A1 | Users have smartphones (Android 10+ / iOS 15+) |
| A2 | 3G+ network coverage in target areas |
| A3 | Payment gateways support target countries |
| A4 | Google Maps coverage adequate in target cities |
| D1 | Flutterwave/Paystack API uptime |
| D2 | Supabase/Firebase availability |
| D3 | SMS gateway (Africa's Talking/Twilio) for OTP |

---

## 3. System Features

### 3.1 User Management & Authentication

| ID | Requirement | Priority |
|---|---|---|
| FR-001 | Register via phone number with SMS OTP | High |
| FR-002 | Register via email with password | High |
| FR-003 | Social login (Google, Facebook) | Medium |
| FR-004 | Role assignment on registration: Customer, Store Owner, or Transport Provider | High |
| FR-005 | Multi-role support (e.g., Customer + Transport Provider with separate verification) | Low |
| FR-006 | JWT-based session management (access + refresh tokens) | High |
| FR-007 | Password reset via SMS or email | High |
| FR-008 | Phone number uniqueness enforced platform-wide | High |
| FR-009 | Profile management: name, photo, contact, default address | Medium |
| FR-010 | Multiple delivery addresses per customer | Medium |

### 3.2 Store Registration & KYC Verification

KYC State Machine: `Registration → Pending → Under Review → Approved (Active) / Rejected (Retry up to 3x)`

| ID | Requirement | Priority |
|---|---|---|
| FR-011 | Multi-step KYC: personal ID, store details, location pin, document upload | High |
| FR-012 | Required docs: government ID (front/back), storefront photo, GPS location, business registration or ownership affidavit | High |
| FR-013 | Validate photo clarity and authenticity | High |
| FR-014 | KYC queue with status: Pending → Under Review → Approved/Rejected | High |
| FR-015 | Admin approve/reject/request-info actions | High |
| FR-016 | Notify via push + SMS on KYC decision | High |
| FR-017 | Allow resubmission up to 3 times | Medium |
| FR-018 | KYC documents encrypted at rest (AES-256) | High |
| FR-019 | Flag suspicious submissions (duplicate IDs, blacklisted phones) | Medium |
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

### 3.5 Order Management & Escrow Payment

**Order State Machine:**
```
PENDING_PAYMENT → PAID_ESCROW → PREPARING → READY_FOR_PICKUP → IN_TRANSIT → DELIVERED → RECEIVED → COMPLETED
                                                                                            ↓
                                                                                         DISPUTED → RESOLVED
```

| ID | Requirement | Priority |
|---|---|---|
| FR-039 | Add to cart and checkout flow | High |
| FR-040 | Checkout: order summary, address selector, transport estimate, total | High |
| FR-041 | Flutterwave integration: card + mobile money (MoMo) | High |
| FR-042 | Paystack as fallback gateway | Medium |
| FR-043 | Escrow: funds held until delivery confirmation | High |
| FR-044 | Push + in-app notification to store on new order | High |
| FR-045 | Store must acknowledge within 2 hours or auto-cancel + refund | High |
| FR-046 | Cancellation: by customer (pre-preparing), by store, auto-timeout | High |
| FR-047 | Auto-refund on cancellation | High |
| FR-048 | Full audit trail of order state transitions | High |
| FR-049 | Customer order history with status | High |
| FR-050 | Store order dashboard with filters | High |
| FR-051 | Platform commission (configurable, default 5-10%) | High |
| FR-052 | Store wallet: escrow balance, available balance, transactions, payouts | High |
| FR-053 | Auto-release escrow after 48 hours if no dispute | High |

### 3.6 Delivery & GPS Tracking

| ID | Requirement | Priority |
|---|---|---|
| FR-054 | Store assigns transporter or uses own delivery | High |
| FR-055 | In-house delivery: store acts as transporter | Medium |
| FR-056 | Transport job notification: pickup, drop-off, item, fee | High |
| FR-057 | Accept/decline delivery jobs | High |
| FR-058 | Route optimization via Google Maps Directions API | High |
| FR-059 | Real-time GPS tracking (10s intervals) via Maps SDK | High |
| FR-060 | Customer views transporter location + ETA on map | High |
| FR-061 | Status updates: En Route → Picked Up → In Transit → Delivered | High |
| FR-062 | Delivery confirmation photo upload | Medium |
| FR-063 | Fee calculation: Distance Matrix + base rate + vehicle multiplier | High |
| FR-064 | Transport payment: bundled or COD | Medium |
| FR-065 | Delivery history with metrics | Medium |

### 3.7 Review, Rating & Dispute Resolution

| ID | Requirement | Priority |
|---|---|---|
| FR-066 | Post-delivery rating: product (1-5), store service (1-5), transporter (1-5) | High |
| FR-067 | Text reviews + photo uploads | Medium |
| FR-068 | Store rating: weighted aggregate (70% product + 30% service) | High |
| FR-069 | Transporter rating: aggregate of delivery reviews | High |
| FR-070 | Display ratings on profiles, listings, and search results | High |
| FR-071 | Dispute reasons: wrong item, damaged, not as described, non-delivery | High |
| FR-072 | Dispute workflow: Customer opens → Store 24h to respond → Admin mediates | High |
| FR-073 | Freeze escrow during disputes | High |
| FR-074 | Admin dispute tools: evidence viewer, resolution actions | High |
| FR-075 | Flag stores with >10% dispute rate for review/suspension | Medium |

### 3.8 Admin Dashboard

| ID | Requirement | Priority |
|---|---|---|
| FR-076 | KYC review queue with document viewer and actions | High |
| FR-077 | Dispute resolution dashboard with evidence comparison | High |
| FR-078 | Search any user, store, product, or order | High |
| FR-079 | Suspend/unsuspend users with reason logging | High |
| FR-080 | Real-time metrics: active orders, escrow, transactions, registrations, disputes | Medium |
| FR-081 | Configure: commission rate, delivery rates, timeouts | Medium |
| FR-082 | Downloadable reports: daily/weekly/monthly summaries | Low |

### 3.9 Notifications

| ID | Requirement | Priority |
|---|---|---|
| FR-083 | Push notifications (FCM/APNs) for order, payment, delivery, KYC, dispute events | High |
| FR-084 | SMS fallback for OTP, KYC decisions, critical payment confirmations | Medium |
| FR-085 | Notification preferences per user type | Medium |
| FR-086 | In-app notification center with history and deep-linking | Medium |
| FR-087 | Distinct notification sound for new store orders | Medium |

---

## 4. External Interface Requirements

### 4.1 User Interfaces

#### Customer App Screens
| Screen | Elements |
|---|---|
| Home | Search bar, categories, featured products, nearby stores, recent orders |
| Search | Filter panel, product cards (image/name/price/store/distance/rating), sort |
| Product Detail | Image carousel, price, quality, store card, delivery estimate, reviews, Add to Cart |
| Cart | Product list, qty controls, subtotal, delivery estimate, Checkout |
| Checkout | Address selector, payment method (MoMo/Card), order summary, Pay Now |
| Track Order | Live map, transporter location, status timeline, ETA |
| Orders | Tabs: Active/Completed/Cancelled |
| Reviews | Star inputs, text, photo upload |

#### Store Owner App Screens
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

#### Admin Web Dashboard
| Screen | Elements |
|---|---|
| Overview | KPI cards, transaction charts, user growth, activity feed |
| KYC Queue | Pending table, document viewer modal, approve/reject |
| Disputes | Active disputes, evidence comparison, resolution |
| Users | Searchable table, detail view, suspend |
| Config | Commission, delivery rates, timeouts, categories |

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
- Supabase Auth (phone/email/social)
- Realtime subscriptions (order status, tracking)
- Row-Level Security (data isolation)

#### Notifications
- Firebase Cloud Messaging (push)
- Africa's Talking / Twilio (SMS OTP)
- SendGrid / Resend (transactional email)

### 4.4 Communication Protocols

| Protocol | Usage |
|---|---|
| HTTPS/REST | All API calls |
| WebSocket (Supabase Realtime) | Live order/tracking updates |
| SMS | OTP, critical alerts |
| FCM/APNs | Push notifications |

---

## 5. Non-Functional Requirements

### 5.1 Performance

| ID | Requirement | Target |
|---|---|---|
| NFR-001 | Cold start time | ≤ 3s on mid-range device, 3G |
| NFR-002 | Search results | ≤ 2s (50km radius) |
| NFR-003 | Image loading | Thumbnail ≤ 500ms; progressive |
| NFR-004 | Payment confirmation | ≤ 15s end-to-end |
| NFR-005 | GPS update frequency | Every 10s during delivery |
| NFR-006 | API p95 latency | ≤ 500ms |
| NFR-007 | Concurrent users | 500 without degradation |
| NFR-008 | DB query time | ≤ 100ms (indexed) |

### 5.2 Security

| ID | Requirement |
|---|---|
| NFR-009 | HTTPS with TLS 1.3 minimum |
| NFR-010 | JWT: access 1hr, refresh 30 days |
| NFR-011 | KYC and PII encrypted at rest (AES-256) |
| NFR-012 | No card data stored (tokenization only) |
| NFR-013 | Row-Level Security (RLS) on Supabase |
| NFR-014 | Rate limiting: 100 req/min general, 5 req/min OTP |
| NFR-015 | Admin MFA required |
| NFR-016 | Security event logging |
| NFR-017 | Quarterly security audits |

### 5.3 Reliability & Availability

| ID | Requirement | Target |
|---|---|---|
| NFR-018 | Uptime | 99.5% |
| NFR-019 | Maintenance windows | 2-5AM local, 48h notice |
| NFR-020 | Backups | Daily, point-in-time recovery |
| NFR-021 | DR RTO | ≤ 4 hours |
| NFR-022 | DR RPO | ≤ 1 hour |

### 5.4 Scalability

| ID | Requirement |
|---|---|
| NFR-023 | Horizontal scaling for backend |
| NFR-024 | Support 1,000 stores, 5,000 customers, 50,000 products |
| NFR-025 | Auto-scaling image storage with CDN |
| NFR-026 | Expand to new countries/languages without rearchitecture |

### 5.5 Maintainability

| ID | Requirement |
|---|---|
| NFR-027 | Git version control (GitHub/GitLab) |
| NFR-028 | ESLint/Prettier code standards |
| NFR-029 | OpenAPI/Swagger API docs |
| NFR-030 | ≥ 80% unit test coverage (critical logic) |
| NFR-031 | CI/CD: lint, test, build on every PR |

### 5.6 Usability

| ID | Requirement |
|---|---|
| NFR-032 | i18n: English, French, Swahili (Phase 1) |
| NFR-033 | Minimum 14sp font size |
| NFR-034 | Touch targets ≥ 48x48dp |
| NFR-035 | Support 4.7" to 6.9" screens |
| NFR-036 | Clear validation errors in user language |
| NFR-037 | Search → Buy in ≤ 5 taps |

### 5.7 Regulatory

| ID | Requirement |
|---|---|
| NFR-038 | Nigeria NDPR compliance |
| NFR-039 | Kenya DPA compliance |
| NFR-040 | Central bank financial regulations |
| NFR-041 | In-app privacy policy + terms (all languages) |
| NFR-042 | Explicit data consent with opt-out |

---

## 6. Data Requirements

### 6.1 Core Schema

#### Users
```sql
users (id UUID PK, phone VARCHAR(20) UNIQUE, email VARCHAR(255) UNIQUE,
  full_name VARCHAR(255), role ENUM('customer','store_owner','transporter','admin'),
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
  search_vector TSVECTOR, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ)

CREATE INDEX idx_products_search ON products USING GIN(search_vector);
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
  channel ENUM('push','sms','email','in_app'), created_at TIMESTAMPTZ)
```

### 6.2 Data Flow

```
[Customer App] --REST--> [Supabase API] --> [PostgreSQL]
                              |
                        [Realtime] --WS--> [Store App]
                              |         --WS--> [Transporter App]
                              
[Payment Gateway] --Webhook--> [Cloud Function] --> Update Order + Wallet
[Google Maps] <--REST-- [All Apps]
[FCM/APNs] <--API-- [Cloud Function]
[SMS Gateway] <--API-- [Cloud Function]
```

---

## 7. Development Approach

### 7.1 Agile (Scrum) — 2-Week Sprints

**Team:** Product Owner, Scrum Master, 2-3 React Native Devs, 1 Backend Dev, 1 UI/UX Designer, 1 QA, 1 DevOps (part-time)

### 7.2 Sprint Plan — 28 Weeks to Launch

**Phase 1: Foundation (Weeks 1-8)**
| Sprint | Deliverables |
|---|---|
| 1 | React Native scaffold, Supabase setup, CI/CD, design system |
| 2 | Phone/email auth, OTP, JWT, role-based profiles |
| 3 | Multi-step KYC form, document upload, admin review queue |
| 4 | Product CRUD, image upload, inventory tracking |

**Milestone M1 (Week 8):** MVP Core — Registration, KYC submission, product listing.

**Phase 2: Commerce Engine (Weeks 9-16)**
| Sprint | Deliverables |
|---|---|
| 5 | Full-text search, filters, geolocation queries, category browsing |
| 6 | Cart, checkout, address management, Flutterwave integration |
| 7 | Payment processing, escrow, order state machine, store wallet |
| 8 | Order lifecycle, notifications, store order dashboard |

**Milestone M2 (Week 16):** Full commerce: search → buy → pay → escrow.

**Phase 3: Delivery & Trust (Weeks 17-22)**
| Sprint | Deliverables |
|---|---|
| 9 | Transporter registration, job assignment, Google Maps integration |
| 10 | Real-time GPS tracking, route optimization, ETA, delivery confirmation |
| 11 | Rating system, reviews, dispute workflow, dispute admin |

**Milestone M3 (Week 22):** Full delivery + review + dispute system.

**Phase 4: Admin & Launch Prep (Weeks 23-28)**
| Sprint | Deliverables |
|---|---|
| 12 | Admin dashboard: KPIs, KYC queue, disputes, analytics |
| 13 | i18n, performance, low-bandwidth optimization, offline resilience |
| 14 | Regression testing, security audit, load testing, app store submission |

**Milestone M4 (Week 28):** Launch-ready in first African city.

### 7.3 Technology Stack

| Layer | Technology |
|---|---|
| Mobile | React Native 0.76+, Zustand, React Query, React Navigation 7 |
| UI | Custom design system + React Native Paper |
| Maps | react-native-maps + Google Maps |
| Database | Supabase (PostgreSQL 15 + PostGIS) |
| Serverless | Firebase Cloud Functions |
| Storage | Supabase Storage |
| Push | Firebase Cloud Messaging |
| SMS | Africa's Talking / Twilio |
| Payment | Flutterwave + Paystack |
| CI/CD | GitHub Actions + Fastlane |
| Monitoring | Firebase Crashlytics + Analytics |

### 7.4 Risk Management

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Payment gateway downtime | Medium | High | Dual gateway (Flutterwave + Paystack), graceful fallback |
| Poor mobile networks | High | Medium | Offline queue, compression, lightweight app, progressive loading |
| KYC bottleneck | Medium | Medium | OCR auto-validation, batch admin operations |
| Store adoption resistance | Medium | High | Simple UX, local languages, field agent-assisted onboarding |
| Fraud (fake stores) | Medium | High | KYC + GPS verification + dispute system + rating transparency |
| Currency volatility | Medium | Low | Multi-currency, regular exchange rate updates |
| Maps accuracy (small towns) | Medium | Medium | Manual address fallback, store GPS pin, transporter confirmation |

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

### C. API Reference (Preliminary)

**Auth:** `POST /api/v1/auth/{register,verify-otp,login,refresh,reset-password}`
**Products:** `GET/POST /api/v1/products`, `GET/PUT/DELETE /api/v1/products/{id}`, `POST /api/v1/products/bulk`
**Stores:** `GET /api/v1/stores`, `GET /api/v1/stores/{id}`, `POST /api/v1/stores/kyc`
**Orders:** `POST /api/v1/orders`, `GET /api/v1/orders`, `GET /api/v1/orders/{id}`, `PUT /api/v1/orders/{id}/status`, `POST /api/v1/orders/{id}/{dispute,confirm,cancel}`
**Delivery:** `GET /api/v1/delivery/jobs`, `POST /api/v1/delivery/{id}/accept`, `PUT /api/v1/delivery/{id}/{location,status}`, `POST /api/v1/delivery/{id}/photo`
**Payments:** `POST /api/v1/payments/charge`, `GET /api/v1/payments/verify/{ref}`, `GET /api/v1/wallet`, `POST /api/v1/wallet/payout`
**Reviews:** `POST /api/v1/reviews`, `GET /api/v1/reviews/{type}/{id}`
**Admin:** `GET/PUT /api/v1/admin/{kyc,disputes,metrics,config}`

---

## Document Control

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-07-25 | Agemo Technologies | Initial SRS — Full Document |

**Approval Signatures**

| Role | Name | Signature | Date |
|---|---|---|---|
| Product Owner | ___________ | ___________ | ___________ |
| Lead Engineer | ___________ | ___________ | ___________ |
| Business Sponsor | ___________ | ___________ | ___________ |

---

*End of Document*
