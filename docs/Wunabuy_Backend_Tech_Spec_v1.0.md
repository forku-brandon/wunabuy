# Wunabuy — Backend Technical Specification

**Document Version:** 1.0  
**Date:** July 25, 2026  
**Status:** Draft  
**Companion to:** Wunabuy SRS v1.2  

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Database Design](#4-database-design)
5. [API Specification](#5-api-specification)
6. [Authentication, Authorization & Security](#6-authentication-authorization--security)
7. [Real-Time Services](#7-real-time-services)
8. [Payment, Escrow & Wallet System](#8-payment-escrow--wallet-system)
9. [File & Media Handling](#9-file--media-handling)
10. [Video Pipeline (Phase 2)](#10-video-pipeline-phase-2)
11. [Background Jobs & Scheduled Tasks](#11-background-jobs--scheduled-tasks)
12. [Third-Party Integrations](#12-third-party-integrations)
13. [Error Handling, Logging & Monitoring](#13-error-handling-logging--monitoring)
14. [Deployment, CI/CD & Testing](#14-deployment-cicd--testing)
15. [Appendices](#15-appendices)

---

## 1. Architecture Overview

### 1.1 Architecture Pattern

Wunabuy uses a **modular monolith** backend pattern: a single deployable codebase organized into domain modules with clear boundaries. This avoids the operational complexity of microservices at launch while keeping the codebase maintainable for a growing team. Modules communicate via internal service calls, not network calls. The system is designed to extract modules into separate services when scale demands it.

```
+---------------------------------------------------------------------------+
|                         WUNABUY BACKEND                                    |
|                                                                            |
|  +--------------------------------------------------------------------+   |
|  |                    API GATEWAY (Supabase Edge)                      |   |
|  |          HTTPS REST + WebSocket (Supabase Realtime)                 |   |
|  +--------------------------------------------------------------------+   |
|                                                                            |
|  +----------+  +----------+  +----------+  +----------+  +----------+   |
|  |   Auth   |  | Commerce |  | Payment  |  | Delivery |  |   Chat   |   |
|  |  Module  |  |  Module  |  |  Module  |  |  Module  |  |  Module  |   |
|  +----------+  +----------+  +----------+  +----------+  +----------+   |
|                                                                            |
|  +----------+  +----------+  +----------+  +----------+  +----------+   |
|  |   KYC    |  |  Search  |  |  Video   |  |  Staff   |  | Notifica.|   |
|  |  Module  |  |  Module  |  |  Module  |  |  Module  |  |  Module  |   |
|  +----------+  +----------+  +----------+  +----------+  +----------+   |
|                                                                            |
|  +--------------------------------------------------------------------+   |
|  |              SHARED INFRASTRUCTURE                                  |   |
|  |  PostgreSQL │ Redis │ Storage │ CDN │ Mail │ SMS │ Push             |   |
|  +--------------------------------------------------------------------+   |
+---------------------------------------------------------------------------+
```

### 1.2 Module Inventory

| Module | Domain | Description |
|---|---|---|
| **auth** | Identity | Registration, login, OTP, JWT, password reset, MFA (staff) |
| **commerce** | Products & Orders | Products, categories, cart, checkout, order lifecycle |
| **payment** | Money | Flutterwave/Paystack integration, escrow, wallets, payouts, reconciliation |
| **delivery** | Logistics | Transporter jobs, GPS tracking, route optimization, delivery fees |
| **chat** | Messaging | Conversations, messages, group chat, media, moderation |
| **kyc** | Verification | Store KYC submission, document storage, staff review workflow |
| **search** | Discovery | Full-text search, Smart Discovery ranking, behavior tracking |
| **video** | Content (Phase 2) | Video upload, transcoding, feed, engagement, moderation |
| **staff** | Internal Ops | Staff portal auth, RBAC, dashboards, audit log, configuration |
| **notification** | Comms | Push, SMS, email, in-app, web push dispatch |

### 1.3 Request Flow

```
Client (Mobile/Web)
    │
    ▼
Supabase Edge (HTTPS / WebSocket)
    │
    ├── REST request ──▶ API Route Handler (Express)
    │                        │
    │                        ├── Validate input (Zod)
    │                        ├── Authenticate (JWT middleware)
    │                        ├── Authorize (RBAC middleware)
    │                        ├── Call domain module service
    │                        │      ├── Service reads/writes PostgreSQL
    │                        │      ├── Service dispatches notifications
    │                        │      └── Service emits events (Redis pub/sub)
    │                        └── Return JSON response
    │
    └── WebSocket ──▶ Supabase Realtime
                         │
                         ├── Channel: chat:{conversation_id}
                         ├── Channel: order:{order_id}
                         ├── Channel: tracking:{delivery_id}
                         └── Channel: staff:notifications
```

### 1.4 Design Principles

| Principle | Application |
|---|---|
| Single Responsibility | Each module owns its tables, services, and routes. No cross-module table access. |
| Dependency Injection | Services receive dependencies (DB client, external APIs) via constructor injection for testability. |
| Event-Driven Side Effects | Side effects (notifications, ranking updates, audit logging) triggered via internal event emitter, not inline. |
| Fail Fast | Input validation at route boundary. Business rule validation in service layer. |
| Idempotency | Payment, payout, and order status endpoints accept idempotency keys to prevent duplicate operations. |
| Auditability | Every mutation that affects money, user state, or staff action is audit-logged. |
| Graceful Degradation | External service failures (payment gateway, maps, SMS) return structured errors, not 500s. |

---

## 2. Technology Stack

### 2.1 Core Stack

| Component | Technology | Version | Rationale |
|---|---|---|---|
| Runtime | Node.js | 20 LTS | Supabase Edge Functions run on Deno, but custom API server runs Node 20 |
| Language | TypeScript | 5.4+ | Type safety across modules, shared types with mobile app |
| Web Framework | Express.js | 4.19+ | Mature, lightweight, large ecosystem |
| ORM / Query Builder | Supabase JS Client + raw SQL | supabase-js 2.x | Supabase RLS enforcement + raw SQL for complex queries |
| Database | PostgreSQL | 15 (Supabase) | Relational + PostGIS for geo + full-text search + RLS |
| Cache / Pub-Sub | Redis | 7.x | Session cache, rate limiting, event bus, job queue |
| Realtime | Supabase Realtime | — | WebSocket management, channel-based subscriptions |
| File Storage | Supabase Storage | — | Images, KYC documents, chat media |
| Video CDN (Phase 2) | Mux / Cloudflare Stream | — | Managed transcoding, adaptive bitrate, CDN delivery |
| Serverless Functions | Firebase Cloud Functions | — | Webhook handlers, scheduled jobs, event triggers |

### 2.2 Supporting Libraries

| Purpose | Library |
|---|---|
| Input validation | Zod |
| Authentication | Supabase Auth (client), jsonwebtoken (verification), otplib (MFA) |
| Rate limiting | express-rate-limit + redis-store |
| HTTP client | axios (retry, timeout, interceptors) |
| Logging | pino (structured JSON logging) |
| Error handling | custom error classes + Express error middleware |
| Testing | Jest + Supertest |
| API documentation | OpenAPI 3.1 (generated from Zod schemas via zod-to-openapi) |
| File upload | multer (multipart), Supabase Storage SDK |
| Image processing | sharp (resize, compress, thumbnail generation) |
| Geospatial | PostGIS (DB-level), @turf/turf (app-level calculations) |
| PDF generation | pdfkit (financial reports, tax exports) |
| Cron / scheduling | node-cron (local), Firebase Cloud Scheduler (production) |
| WebSocket (custom) | ws (fallback if Supabase Realtime insufficient) |

### 2.3 Environment Variables

```bash
# ─── Database ───
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx          # server-only, bypasses RLS
SUPABASE_ANON_KEY=xxx                  # client-side
DATABASE_URL=postgresql://...          # direct Postgres for raw SQL

# ─── Redis ───
REDIS_URL=redis://localhost:6379

# ─── Auth ───
JWT_SECRET=xxx                         # access token signing
JWT_REFRESH_SECRET=xxx                 # refresh token signing
JWT_ACCESS_TTL=15m                     # staff portal
JWT_ACCESS_TTL_MOBILE=1h               # mobile apps
JWT_REFRESH_TTL=30d                    # mobile
JWT_REFRESH_TTL_STAFF=8h               # staff
OTP_TTL=300                            # 5 minutes (seconds)
OTP_MAX_ATTEMPTS=5

# ─── Payment ───
FLUTTERWAVE_SECRET_KEY=xxx
FLUTTERWAVE_PUBLIC_KEY=xxx
FLUTTERWAVE_WEBHOOK_HASH=xxx
PAYSTACK_SECRET_KEY=xxx
PAYSTACK_PUBLIC_KEY=xxx
PAYSTACK_WEBHOOK_HASH=xxx
ESCROW_AUTO_RELEASE_HOURS=48
PLATFORM_COMMISSION_DEFAULT=10.0       # percentage

# ─── Google Maps ───
GOOGLE_MAPS_API_KEY=xxx
GOOGLE_MAPS_DIRECTIONS_URL=https://maps.googleapis.com/maps/api/directions/json
GOOGLE_MAPS_DISTANCE_MATRIX_URL=https://maps.googleapis.com/maps/api/distancematrix/json
GOOGLE_MAPS_GEOCODING_URL=https://maps.googleapis.com/maps/api/geocode/json
GOOGLE_MAPS_PLACES_URL=https://maps.googleapis.com/maps/api/place/autocomplete/json

# ─── SMS ───
AFRICAS_TALKING_API_KEY=xxx
AFRICAS_TALKING_SENDER_ID=WUNABUY
TWILIO_ACCOUNT_SID=xxx                 # fallback
TWILIO_AUTH_TOKEN=xxx

# ─── Push ───
FCM_SERVER_KEY=xxx
APNS_KEY_ID=xxx
APNS_TEAM_ID=xxx
APNS_PRIVATE_KEY=xxx

# ─── Email ───
SENDGRID_API_KEY=xxx
SENDGRID_FROM_EMAIL=noreply@wunabuy.com

# ─── Video (Phase 2) ───
MUX_TOKEN_ID=xxx
MUX_TOKEN_SECRET=xxx
# OR
CLOUDFLARE_STREAM_API_TOKEN=xxx
CLOUDFLARE_STREAM_ACCOUNT_ID=xxx

# ─── Content Moderation (Phase 2) ───
GOOGLE_CLOUD_PROJECT_ID=xxx
GOOGLE_CLOUD_VIDEO_INTELLIGENCE_KEY=xxx
AWS_REKOGNITION_ACCESS_KEY=xxx
AWS_REKOGNITION_SECRET_KEY=xxx

# ─── Monitoring ───
SENTRY_DSN=xxx
LOG_LEVEL=info                         # debug | info | warn | error

# ─── App ───
NODE_ENV=production
PORT=8080
CORS_ORIGINS=https://app.wunabuy.com,https://staff.wunabuy.com
RATE_LIMIT_GENERAL=100                 # req per minute
RATE_LIMIT_OTP=5                       # req per minute
RATE_LIMIT_CHAT=30                     # messages per minute
UPLOAD_MAX_FILE_SIZE_MB=10             # images
VIDEO_MAX_FILE_SIZE_MB=50              # Phase 2
STAFF_IP_ALLOWLIST=                    # comma-separated CIDRs, empty = no restriction
```

---

## 3. Project Structure

```
wunabuy-backend/
├── src/
│   ├── index.ts                    # Entry point: Express app bootstrap
│   ├── config/
│   │   ├── env.ts                  # Environment variable loading + validation (Zod)
│   │   ├── database.ts             # Supabase client initialization
│   │   ├── redis.ts                # Redis client initialization
│   │   └── constants.ts            # App-wide constants (roles, statuses, limits)
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.ts          # Route definitions
│   │   │   ├── auth.controller.ts      # Request handlers
│   │   │   ├── auth.service.ts         # Business logic
│   │   │   ├── auth.schema.ts          # Zod validation schemas
│   │   │   ├── auth.middleware.ts      # JWT verification, OTP middleware
│   │   │   └── auth.types.ts           # TypeScript types/interfaces
│   │   │
│   │   ├── commerce/
│   │   │   ├── product/
│   │   │   │   ├── product.routes.ts
│   │   │   │   ├── product.controller.ts
│   │   │   │   ├── product.service.ts
│   │   │   │   └── product.schema.ts
│   │   │   ├── order/
│   │   │   │   ├── order.routes.ts
│   │   │   │   ├── order.controller.ts
│   │   │   │   ├── order.service.ts
│   │   │   │   ├── order.schema.ts
│   │   │   │   └── order.state-machine.ts   # Order state transitions
│   │   │   └── cart/
│   │   │       ├── cart.routes.ts
│   │   │       ├── cart.controller.ts
│   │   │       ├── cart.service.ts
│   │   │       └── cart.schema.ts
│   │   │
│   │   ├── payment/
│   │   │   ├── payment.routes.ts
│   │   │   ├── payment.controller.ts
│   │   │   ├── payment.service.ts
│   │   │   ├── payment.schema.ts
│   │   │   ├── escrow.service.ts        # Escrow hold/release logic
│   │   │   ├── wallet.service.ts        # Store wallet operations
│   │   │   ├── payout.service.ts        # Payout processing
│   │   │   ├── reconciliation.service.ts
│   │   │   └── gateways/
│   │   │       ├── flutterwave.ts       # Flutterwave API client
│   │   │       ├── paystack.ts          # Paystack API client
│   │   │       └── payment-gateway.interface.ts
│   │   │
│   │   ├── delivery/
│   │   │   ├── delivery.routes.ts
│   │   │   ├── delivery.controller.ts
│   │   │   ├── delivery.service.ts
│   │   │   ├── delivery.schema.ts
│   │   │   ├── tracking.service.ts      # GPS tracking + realtime broadcast
│   │   │   ├── route.service.ts         # Google Maps route optimization
│   │   │   └── fee-calculator.service.ts
│   │   │
│   │   ├── chat/
│   │   │   ├── chat.routes.ts
│   │   │   ├── chat.controller.ts
│   │   │   ├── chat.service.ts
│   │   │   ├── chat.schema.ts
│   │   │   ├── chat-realtime.service.ts # WebSocket channel management
│   │   │   └── chat-moderation.service.ts
│   │   │
│   │   ├── kyc/
│   │   │   ├── kyc.routes.ts
│   │   │   ├── kyc.controller.ts
│   │   │   ├── kyc.service.ts
│   │   │   ├── kyc.schema.ts
│   │   │   └── kyc-review.service.ts    # Staff review workflow
│   │   │
│   │   ├── search/
│   │   │   ├── search.routes.ts
│   │   │   ├── search.controller.ts
│   │   │   ├── search.service.ts        # Full-text + geo search
│   │   │   ├── search.schema.ts
│   │   │   ├── ranking.service.ts       # Smart Discovery scoring
│   │   │   ├── ranking-config.service.ts
│   │   │   └── behavior-tracker.service.ts
│   │   │
│   │   ├── video/                       # Phase 2
│   │   │   ├── video.routes.ts
│   │   │   ├── video.controller.ts
│   │   │   ├── video.service.ts
│   │   │   ├── video.schema.ts
│   │   │   ├── video-upload.service.ts  # Upload + transcoding trigger
│   │   │   ├── video-feed.service.ts    # For You / Following feed algorithm
│   │   │   ├── video-engagement.service.ts
│   │   │   └── video-moderation.service.ts
│   │   │
│   │   ├── staff/
│   │   │   ├── staff.routes.ts
│   │   │   ├── staff.controller.ts
│   │   │   ├── staff.service.ts
│   │   │   ├── staff.schema.ts
│   │   │   ├── rbac.service.ts          # Permission checking
│   │   │   ├── rbac.middleware.ts       # Express middleware: requirePermission('payouts.approve')
│   │   │   ├── audit-log.service.ts     # Audit log write + hash chain
│   │   │   └── config.service.ts        # Platform configuration management
│   │   │
│   │   └── notification/
│   │       ├── notification.service.ts   # Dispatch orchestration
│   │       ├── push.service.ts           # FCM + APNs
│   │       ├── sms.service.ts            # Africa's Talking + Twilio
│   │       ├── email.service.ts          # SendGrid
│   │       ├── in-app.service.ts         # DB + realtime
│   │       ├── web-push.service.ts       # Staff Portal web push
│   │       └── templates.ts              # Notification message templates (i18n)
│   │
│   ├── shared/
│   │   ├── middleware/
│   │   │   ├── error.middleware.ts       # Global error handler
│   │   │   ├── rate-limit.middleware.ts   # Rate limiting configurations
│   │   │   ├── cors.middleware.ts        # CORS configuration
│   │   │   ├── request-logger.middleware.ts
│   │   │   └── idempotency.middleware.ts  # Idempotency key handling
│   │   ├── utils/
│   │   │   ├── crypto.ts                 # Encryption helpers (AES-256)
│   │   │   ├── geo.ts                    # Distance calculations, haversine
│   │   │   ├── money.ts                  # Currency formatting, rounding
│   │   │   ├── pagination.ts             # Cursor + offset pagination helpers
│   │   │   └── id-generator.ts           # UUID, order IDs, reference codes
│   │   ├── types/
│   │   │   ├── api.types.ts              # Shared API response types
│   │   │   ├── domain.types.ts           # Shared domain types
│   │   │   └── events.types.ts           # Event names + payloads
│   │   └── errors/
│   │       ├── app-error.ts              # Base error class
│   │       ├── validation-error.ts
│   │       ├── auth-error.ts
│   │       ├── not-found-error.ts
│   │       ├── conflict-error.ts
│   │       ├── payment-error.ts
│   │       └── error-codes.ts            # Centralized error code registry
│   │
│   ├── events/
│   │   ├── event-bus.ts                  # Redis pub/sub event emitter
│   │   └── handlers/
│   │       ├── order-events.handler.ts   # Order state change → notifications
│   │       ├── payment-events.handler.ts # Payment events → wallet updates
│   │       ├── kyc-events.handler.ts     # KYC decision → notifications
│   │       └── video-events.handler.ts   # Video published → follower notifications
│   │
│   ├── jobs/
│   │   ├── cron.ts                       # Cron job registration
│   │   ├── escrow-auto-release.job.ts    # Release escrow after 48h
│   │   ├── ranking-refresh.job.ts        # Recompute ranking signals
│   │   ├── order-timeout.job.ts          # Auto-cancel unacknowledged orders
│   │   ├── notification-cleanup.job.ts   # Archive old notifications
│   │   ├── chat-archive.job.ts           # Archive messages >90 days
│   │   └── video-moderation-queue.job.ts # Poll moderation API results (Phase 2)
│   │
│   └── app.ts                            # Express app assembly (middleware + routes)
│
├── supabase/
│   ├── migrations/
│   │   ├── 001_create_users.sql
│   │   ├── 002_create_stores.sql
│   │   ├── 003_create_products.sql
│   │   ├── 004_create_orders.sql
│   │   ├── 005_create_reviews.sql
│   │   ├── 006_create_wallets.sql
│   │   ├── 007_create_notifications.sql
│   │   ├── 008_create_staff_tables.sql
│   │   ├── 009_create_audit_log.sql
│   │   ├── 010_create_ranking_tables.sql
│   │   ├── 011_create_support_tickets.sql
│   │   ├── 012_create_disputes.sql
│   │   ├── 013_create_chat_tables.sql
│   │   ├── 014_create_video_tables.sql
│   │   ├── 015_create_rls_policies.sql
│   │   └── 016_create_indexes.sql
│   ├── functions/                        # Supabase Edge Functions (Deno)
│   │   ├── webhook-flutterwave/index.ts
│   │   ├── webhook-paystack/index.ts
│   │   └── video-upload-trigger/index.ts
│   └── seed.sql                          # Development seed data
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── docs/
│   ├── api-openapi.json                  # Generated OpenAPI spec
│   └── postman-collection.json
│
├── .env.example
├── .env.test
├── package.json
├── tsconfig.json
├── jest.config.ts
├── Dockerfile
└── README.md
```

---

## 4. Database Design

### 4.1 Database Overview

| Aspect | Detail |
|---|---|
| Engine | PostgreSQL 15 (Supabase managed) |
| Extensions | `postgis` (geo), `pg_trgm` (fuzzy search), `uuid-ossp` (UUID gen), `pgjwt` (JWT in DB) |
| Character encoding | UTF-8 |
| Timezone | Stored as `TIMESTAMPTZ` (UTC), converted to user timezone on display |
| Primary keys | UUID v4 (generated client-side or DB default) |
| Soft deletes | `deleted_at TIMESTAMPTZ` column on user-deletable entities; NULL = active |
| Audit columns | `created_at`, `updated_at` on all tables (DB defaults + triggers) |

### 4.2 Updated Trigger Function

```sql
-- Auto-update updated_at on every row change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to every table:
-- CREATE TRIGGER set_updated_at BEFORE UPDATE ON <table>
--   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### 4.3 Complete Schema (DDL)

#### 4.3.1 Enums

```sql
CREATE TYPE user_role AS ENUM ('buyer', 'seller', 'transporter');
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'deactivated');
CREATE TYPE kyc_status AS ENUM ('pending', 'under_review', 'approved', 'rejected');
CREATE TYPE product_quality AS ENUM ('new', 'like_new', 'good', 'fair');
CREATE TYPE order_status AS ENUM (
  'pending_payment', 'paid_escrow', 'preparing', 'ready_for_pickup',
  'in_transit', 'delivered', 'received', 'completed',
  'cancelled', 'disputed', 'refunded'
);
CREATE TYPE payment_method AS ENUM ('momo', 'card', 'cod');
CREATE TYPE delivery_status AS ENUM ('assigned', 'accepted', 'en_route_pickup', 'picked_up', 'in_transit', 'delivered', 'failed');
CREATE TYPE transaction_type AS ENUM ('payment_received', 'escrow_hold', 'escrow_release', 'commission_deduct', 'payout', 'refund');
CREATE TYPE review_target_type AS ENUM ('product', 'store', 'transporter');
CREATE TYPE staff_department AS ENUM ('accounting', 'it_engineering', 'customer_service', 'operations', 'compliance_legal', 'marketing', 'super_admin');
CREATE TYPE staff_role_level AS ENUM ('officer', 'senior', 'lead', 'manager', 'admin');
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'escalated');
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE dispute_status AS ENUM ('open', 'store_responded', 'in_mediation', 'resolved', 'rejected');
CREATE TYPE dispute_resolution AS ENUM ('refund', 'partial_refund', 'redelivery', 'rejected');
CREATE TYPE conversation_type AS ENUM ('direct', 'group');
CREATE TYPE message_type AS ENUM ('text', 'image', 'product_card', 'order_card', 'store_card');
CREATE TYPE message_status AS ENUM ('sent', 'delivered', 'read');
CREATE TYPE chat_report_reason AS ENUM ('spam', 'harassment', 'fraud', 'inappropriate', 'other');
CREATE TYPE moderation_status AS ENUM ('pending', 'approved', 'flagged', 'rejected');
CREATE TYPE video_status AS ENUM ('processing', 'pending_review', 'published', 'removed', 'rejected');
CREATE TYPE video_report_reason AS ENUM ('inappropriate', 'misleading', 'counterfeit', 'spam', 'other');
CREATE TYPE notification_channel AS ENUM ('push', 'sms', 'email', 'in_app', 'web_push');
```

#### 4.3.2 Users

```sql
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone           VARCHAR(20) UNIQUE NOT NULL,
  email           VARCHAR(255) UNIQUE,
  full_name       VARCHAR(255) NOT NULL,
  password_hash   TEXT,                    -- NULL if phone-only auth
  role            user_role NOT NULL DEFAULT 'buyer',
  status          user_status NOT NULL DEFAULT 'active',
  avatar_url      TEXT,
  default_address JSONB,                   -- {lat, lng, label, city, country}
  is_email_verified   BOOLEAN DEFAULT FALSE,
  is_phone_verified   BOOLEAN DEFAULT FALSE,
  fcm_token       TEXT,                    -- push notification token
  apns_token      TEXT,
  preferred_language VARCHAR(10) DEFAULT 'en',
  last_login_at   TIMESTAMPTZ,
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
```

#### 4.3.3 User Addresses

```sql
CREATE TABLE user_addresses (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label       VARCHAR(100) NOT NULL,       -- "Home", "Work"
  latitude    DECIMAL(10,7) NOT NULL,
  longitude   DECIMAL(10,7) NOT NULL,
  address_text TEXT NOT NULL,
  city        VARCHAR(100),
  region      VARCHAR(100),
  country     VARCHAR(100),
  is_default  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_addresses_user ON user_addresses(user_id);
```

#### 4.3.4 Stores

```sql
CREATE TABLE stores (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_name      VARCHAR(255) NOT NULL,
  description     TEXT,
  category        VARCHAR(100) NOT NULL,
  location        GEOGRAPHY(POINT, 4326) NOT NULL,
  address_text    TEXT NOT NULL,
  city            VARCHAR(100),
  region          VARCHAR(100),
  country         VARCHAR(100) NOT NULL,
  rating_avg      DECIMAL(2,1) DEFAULT 0.0,
  total_reviews   INT DEFAULT 0,
  follower_count  INT DEFAULT 0,           -- Phase 2
  kyc_status      kyc_status NOT NULL DEFAULT 'pending',
  kyc_documents   JSONB,                   -- {id_front_url, id_back_url, store_front_url, registration_doc_url}
  kyc_submitted_at TIMESTAMPTZ,
  kyc_reviewed_at  TIMESTAMPTZ,
  kyc_reviewed_by  UUID REFERENCES staff_accounts(id),
  kyc_rejection_reason TEXT,
  commission_rate DECIMAL(5,2) DEFAULT 10.00,
  is_active       BOOLEAN DEFAULT TRUE,
  is_suspended    BOOLEAN DEFAULT FALSE,
  suspended_reason TEXT,
  suspended_at    TIMESTAMPTZ,
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_stores_owner ON stores(owner_id);
CREATE INDEX idx_stores_location ON stores USING GIST(location);
CREATE INDEX idx_stores_kyc_status ON stores(kyc_status);
CREATE INDEX idx_stores_category ON stores(category);
CREATE INDEX idx_stores_active ON stores(is_active) WHERE is_active = TRUE;
```

#### 4.3.5 Products

```sql
CREATE TABLE products (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id        UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name            VARCHAR(500) NOT NULL,
  description     TEXT,
  category        VARCHAR(100) NOT NULL,
  subcategory     VARCHAR(100),
  price           DECIMAL(12,2) NOT NULL CHECK (price > 0),
  currency        VARCHAR(3) DEFAULT 'XAF',
  quantity        INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  low_stock_threshold INT DEFAULT 5,
  quality_tier    product_quality NOT NULL DEFAULT 'new',
  images          TEXT[] NOT NULL DEFAULT '{}',
  is_active       BOOLEAN DEFAULT TRUE,
  rating_avg      DECIMAL(2,1) DEFAULT 0.0,
  review_count    INT DEFAULT 0,
  view_count      INT DEFAULT 0,
  purchase_count  INT DEFAULT 0,
  search_vector   TSVECTOR,
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-populate search_vector on insert/update
CREATE TRIGGER products_search_vector_update
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION
  tsvector_update_trigger(search_vector, 'pg_catalog.english', name, description, category);

CREATE INDEX idx_products_search ON products USING GIN(search_vector);
CREATE INDEX idx_products_store ON products(store_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_quality ON products(quality_tier);
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_products_created ON products(created_at DESC);
```

#### 4.3.6 Orders & Order Items

```sql
CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_code      VARCHAR(20) UNIQUE NOT NULL,   -- human-readable: WNB-2026-000123
  customer_id     UUID NOT NULL REFERENCES users(id),
  store_id        UUID NOT NULL REFERENCES stores(id),
  transporter_id  UUID REFERENCES users(id),
  status          order_status NOT NULL DEFAULT 'pending_payment',
  items_json      JSONB NOT NULL,                -- snapshot of items at purchase time
  subtotal        DECIMAL(12,2) NOT NULL,
  delivery_fee    DECIMAL(12,2) DEFAULT 0,
  commission      DECIMAL(12,2) NOT NULL DEFAULT 0,
  total           DECIMAL(12,2) NOT NULL,
  currency        VARCHAR(3) DEFAULT 'XAF',
  payment_method  payment_method,
  payment_ref     VARCHAR(255),
  payment_gateway VARCHAR(20),                   -- 'flutterwave' | 'paystack'
  delivery_address JSONB NOT NULL,               -- snapshot
  pickup_location  JSONB,                        -- store location snapshot
  tracking_data    JSONB,                        -- {current_lat, current_lng, last_updated, route_polyline}
  delivery_photo   TEXT,
  transport_bundled BOOLEAN DEFAULT TRUE,        -- delivery fee paid with order vs COD
  status_history   JSONB DEFAULT '[]',           -- [{status, timestamp, actor_id}]
  expires_at       TIMESTAMPTZ,                  -- payment window deadline
  acknowledged_at  TIMESTAMPTZ,                  -- store acknowledged order
  delivered_at     TIMESTAMPTZ,
  received_at      TIMESTAMPTZ,
  completed_at     TIMESTAMPTZ,
  cancelled_at     TIMESTAMPTZ,
  cancel_reason    TEXT,
  cancelled_by     UUID REFERENCES users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_store ON orders(store_id);
CREATE INDEX idx_orders_transporter ON orders(transporter_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_code ON orders(order_code);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

CREATE TABLE order_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id      UUID REFERENCES products(id),
  product_name    VARCHAR(500) NOT NULL,         -- snapshot
  unit_price      DECIMAL(12,2) NOT NULL,
  quantity        INT NOT NULL,
  quality_tier    product_quality NOT NULL,
  image_url       TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
```

#### 4.3.7 Reviews

```sql
CREATE TABLE reviews (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID NOT NULL REFERENCES orders(id),
  reviewer_id     UUID NOT NULL REFERENCES users(id),
  target_type     review_target_type NOT NULL,
  target_id       UUID NOT NULL,                 -- product_id, store_id, or transporter_id
  rating          INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text     TEXT,
  photos          TEXT[] DEFAULT '{}',
  is_flagged      BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_target ON reviews(target_type, target_id);
CREATE INDEX idx_reviews_reviewer ON reviews(reviewer_id);
CREATE INDEX idx_reviews_order ON reviews(order_id);
```

#### 4.3.8 Wallets & Transactions

```sql
CREATE TABLE wallets (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  balance_escrow    DECIMAL(12,2) DEFAULT 0.00,
  balance_available DECIMAL(12,2) DEFAULT 0.00,
  total_earned      DECIMAL(12,2) DEFAULT 0.00,
  total_payout      DECIMAL(12,2) DEFAULT 0.00,
  currency          VARCHAR(3) DEFAULT 'XAF',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wallets_user ON wallets(user_id);

CREATE TABLE transactions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_code VARCHAR(30) UNIQUE NOT NULL,  -- TXN-2026-000456
  wallet_id       UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  order_id        UUID REFERENCES orders(id),
  type            transaction_type NOT NULL,
  amount          DECIMAL(12,2) NOT NULL,
  balance_after   DECIMAL(12,2) NOT NULL,
  reference       VARCHAR(255),                  -- gateway reference
  description     TEXT,
  metadata        JSONB,                          -- gateway response, fees, etc.
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_wallet ON transactions(wallet_id);
CREATE INDEX idx_transactions_order ON transactions(order_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);

CREATE TABLE payouts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id       UUID NOT NULL REFERENCES wallets(id),
  amount          DECIMAL(12,2) NOT NULL,
  currency        VARCHAR(3) DEFAULT 'XAF',
  status          VARCHAR(20) NOT NULL DEFAULT 'pending',  -- pending, approved, rejected, processing, completed, failed
  gateway_ref     VARCHAR(255),
  requested_by    UUID NOT NULL REFERENCES users(id),
  approved_by     UUID REFERENCES staff_accounts(id),
  approved_at     TIMESTAMPTZ,
  rejected_reason TEXT,
  metadata        JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payouts_wallet ON payouts(wallet_id);
CREATE INDEX idx_payouts_status ON payouts(status);
```

#### 4.3.9 Notifications

```sql
CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  staff_id        UUID REFERENCES staff_accounts(id) ON DELETE CASCADE,
  type            VARCHAR(50) NOT NULL,
  title           VARCHAR(255) NOT NULL,
  body            TEXT,
  data            JSONB,                          -- deep link, order_id, etc.
  is_read         BOOLEAN DEFAULT FALSE,
  channel         notification_channel NOT NULL DEFAULT 'in_app',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- check constraint: either user_id or staff_id must be set
ALTER TABLE notifications ADD CONSTRAINT notif_owner_check
  CHECK (user_id IS NOT NULL OR staff_id IS NOT NULL);

CREATE INDEX idx_notifications_user ON notifications(user_id) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_staff ON notifications(staff_id) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
```

#### 4.3.10 Staff Accounts, Roles & Permissions

```sql
CREATE TABLE staff_accounts (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email               VARCHAR(255) UNIQUE NOT NULL,
  full_name           VARCHAR(255) NOT NULL,
  password_hash       TEXT NOT NULL,
  mfa_secret_encrypted BYTEA,                    -- AES-256 encrypted TOTP secret
  mfa_enabled         BOOLEAN DEFAULT FALSE,
  is_active           BOOLEAN DEFAULT TRUE,
  failed_login_attempts INT DEFAULT 0,
  locked_until        TIMESTAMPTZ,
  last_login_at       TIMESTAMPTZ,
  last_login_ip       INET,
  password_changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by          UUID REFERENCES staff_accounts(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_staff_email ON staff_accounts(email);

CREATE TABLE staff_roles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id        UUID NOT NULL REFERENCES staff_accounts(id) ON DELETE CASCADE,
  department      staff_department NOT NULL,
  role_level      staff_role_level NOT NULL,
  assigned_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assigned_by     UUID REFERENCES staff_accounts(id),
  is_active       BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_staff_roles_staff ON staff_roles(staff_id);
CREATE INDEX idx_staff_roles_dept ON staff_roles(department);

-- Permission definitions (seed data, not a runtime table)
-- Stored as a TypeScript constant in rbac.service.ts and mirrored here for documentation
CREATE TABLE staff_permission_definitions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  permission_key  VARCHAR(100) UNIQUE NOT NULL,
  description     TEXT NOT NULL,
  applies_to      staff_department[],
  min_role_level  staff_role_level
);

-- Seed:
INSERT INTO staff_permission_definitions (permission_key, description, applies_to, min_role_level) VALUES
  ('finance.view_dashboard', 'View financial dashboard', ARRAY['accounting','super_admin'], 'officer'),
  ('finance.approve_payouts', 'Approve/reject payouts', ARRAY['accounting','super_admin'], 'manager'),
  ('finance.reconcile', 'Reconcile escrow', ARRAY['accounting','super_admin'], 'officer'),
  ('finance.export_reports', 'Export financial reports', ARRAY['accounting','super_admin'], 'officer'),
  ('it.view_health', 'View system health', ARRAY['it_engineering','super_admin'], 'officer'),
  ('it.manage_config', 'Manage system configuration', ARRAY['it_engineering','super_admin'], 'admin'),
  ('it.manage_staff', 'Manage staff accounts', ARRAY['it_engineering','super_admin'], 'admin'),
  ('it.view_audit_log', 'View audit logs', ARRAY['it_engineering','super_admin'], 'officer'),
  ('cs.handle_tickets', 'Handle support tickets', ARRAY['customer_service','super_admin'], 'officer'),
  ('cs.process_refunds', 'Process refunds', ARRAY['customer_service','super_admin'], 'senior'),
  ('cs.moderate_chat', 'Moderate chat reports', ARRAY['customer_service','super_admin'], 'officer'),
  ('ops.review_kyc', 'Review KYC submissions', ARRAY['operations','super_admin'], 'officer'),
  ('ops.approve_kyc', 'Approve/reject KYC', ARRAY['operations','super_admin'], 'manager'),
  ('ops.manage_deliveries', 'Manage delivery logistics', ARRAY['operations','super_admin'], 'officer'),
  ('ops.suspend_users', 'Suspend/unsuspend users', ARRAY['operations','super_admin'], 'manager'),
  ('compliance.approve_kyc', 'Final KYC approval', ARRAY['compliance_legal','super_admin'], 'officer'),
  ('compliance.investigate_fraud', 'Investigate fraud', ARRAY['compliance_legal','super_admin'], 'officer'),
  ('compliance.export_audit', 'Export audit logs', ARRAY['compliance_legal','super_admin'], 'officer'),
  ('compliance.moderate_videos', 'Moderate videos', ARRAY['compliance_legal','super_admin'], 'officer'),
  ('marketing.manage_campaigns', 'Manage campaigns', ARRAY['marketing','super_admin'], 'manager'),
  ('marketing.curate_featured', 'Curate featured products', ARRAY['marketing','super_admin'], 'officer'),
  ('marketing.view_video_analytics', 'View video analytics', ARRAY['marketing','super_admin'], 'officer'),
  ('superadmin.all', 'Full system access', ARRAY['super_admin'], 'admin');
```

#### 4.3.11 Audit Log

```sql
CREATE TABLE audit_log (
  id              BIGSERIAL PRIMARY KEY,
  staff_id        UUID REFERENCES staff_accounts(id),
  action          VARCHAR(100) NOT NULL,
  entity_type     VARCHAR(50) NOT NULL,
  entity_id       UUID,
  before_state    JSONB,
  after_state     JSONB,
  ip_address      INET,
  user_agent      TEXT,
  previous_hash   VARCHAR(64),
  current_hash    VARCHAR(64) NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_staff ON audit_log(staff_id);
CREATE INDEX idx_audit_action ON audit_log(action);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);

-- Hash chain: each row's current_hash = SHA256(previous_hash || action || entity_id || staff_id || created_at || before_state || after_state)
-- Enforced in audit-log.service.ts, not DB trigger (to allow error recovery)
```

#### 4.3.12 Ranking (Smart Discovery)

```sql
CREATE TABLE ranking_signals (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id        UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE UNIQUE,
  location_score    DECIMAL(3,2) DEFAULT 0.00,
  price_score       DECIMAL(3,2) DEFAULT 0.00,
  quality_score     DECIMAL(3,2) DEFAULT 0.00,
  rating_score      DECIMAL(3,2) DEFAULT 0.00,
  popularity_score  DECIMAL(3,2) DEFAULT 0.00,
  freshness_score   DECIMAL(3,2) DEFAULT 0.00,
  behavior_score    DECIMAL(3,2) DEFAULT 0.00,
  stock_score       DECIMAL(3,2) DEFAULT 0.00,
  composite_score   DECIMAL(5,2) DEFAULT 0.00,
  computed_at       TIMESTAMPTZ
);

CREATE INDEX idx_ranking_product ON ranking_signals(product_id);
CREATE INDEX idx_ranking_composite ON ranking_signals(composite_score DESC);

CREATE TABLE user_behavior (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id      UUID REFERENCES products(id) ON DELETE CASCADE,
  action          VARCHAR(20) NOT NULL,           -- view, search, cart_add, purchase
  search_query    TEXT,
  category        VARCHAR(100),
  metadata        JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_behavior_user ON user_behavior(user_id);
CREATE INDEX idx_behavior_category ON user_behavior(category);
CREATE INDEX idx_behavior_action ON user_behavior(action);
CREATE INDEX idx_behavior_created ON user_behavior(created_at DESC);

CREATE TABLE ranking_config (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            VARCHAR(100) NOT NULL,
  w_location      DECIMAL(3,2) DEFAULT 0.25,
  w_price         DECIMAL(3,2) DEFAULT 0.20,
  w_quality       DECIMAL(3,2) DEFAULT 0.05,
  w_rating        DECIMAL(3,2) DEFAULT 0.20,
  w_popularity    DECIMAL(3,2) DEFAULT 0.10,
  w_freshness     DECIMAL(3,2) DEFAULT 0.05,
  w_behavior      DECIMAL(3,2) DEFAULT 0.10,
  w_stock         DECIMAL(3,2) DEFAULT 0.05,
  is_active       BOOLEAN DEFAULT FALSE,
  updated_by      UUID REFERENCES staff_accounts(id),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Only one active config at a time
CREATE UNIQUE INDEX idx_ranking_config_active ON ranking_config(is_active) WHERE is_active = TRUE;
```

#### 4.3.13 Support Tickets

```sql
CREATE TABLE support_tickets (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_code     VARCHAR(20) UNIQUE NOT NULL,
  user_id         UUID NOT NULL REFERENCES users(id),
  assigned_to     UUID REFERENCES staff_accounts(id),
  subject         VARCHAR(255) NOT NULL,
  body            TEXT NOT NULL,
  status          ticket_status NOT NULL DEFAULT 'open',
  priority        ticket_priority NOT NULL DEFAULT 'medium',
  related_order_id UUID REFERENCES orders(id),
  related_store_id UUID REFERENCES stores(id),
  sla_deadline    TIMESTAMPTZ,
  resolved_at     TIMESTAMPTZ,
  resolved_by     UUID REFERENCES staff_accounts(id),
  resolution      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tickets_user ON support_tickets(user_id);
CREATE INDEX idx_tickets_assigned ON support_tickets(assigned_to);
CREATE INDEX idx_tickets_status ON support_tickets(status);
CREATE INDEX idx_tickets_priority ON support_tickets(priority);

CREATE TABLE ticket_messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id       UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_type     VARCHAR(10) NOT NULL,           -- user, staff
  sender_id       UUID NOT NULL,
  message         TEXT NOT NULL,
  attachments     TEXT[] DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ticket_messages_ticket ON ticket_messages(ticket_id);
```

#### 4.3.14 Disputes

```sql
CREATE TABLE disputes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dispute_code    VARCHAR(20) UNIQUE NOT NULL,
  order_id        UUID NOT NULL REFERENCES orders(id),
  opened_by       UUID NOT NULL REFERENCES users(id),
  reason          VARCHAR(100) NOT NULL,
  description     TEXT NOT NULL,
  evidence_photos TEXT[] DEFAULT '{}',
  status          dispute_status NOT NULL DEFAULT 'open',
  assigned_to     UUID REFERENCES staff_accounts(id),
  resolution      TEXT,
  resolution_type dispute_resolution,
  store_response  TEXT,
  store_responded_at TIMESTAMPTZ,
  resolved_at     TIMESTAMPTZ,
  resolved_by     UUID REFERENCES staff_accounts(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_disputes_order ON disputes(order_id);
CREATE INDEX idx_disputes_status ON disputes(status);
CREATE INDEX idx_disputes_assigned ON disputes(assigned_to);
```

#### 4.3.15 Chat

```sql
CREATE TABLE conversations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type            conversation_type NOT NULL DEFAULT 'direct',
  name            VARCHAR(255),                   -- NULL for direct, name for group
  avatar_url      TEXT,
  created_by      UUID NOT NULL REFERENCES users(id),
  last_message_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);

CREATE TABLE conversation_participants (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role            VARCHAR(10) NOT NULL DEFAULT 'member',  -- member, admin
  is_muted        BOOLEAN DEFAULT FALSE,
  last_read_at    TIMESTAMPTZ,
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  left_at         TIMESTAMPTZ
);

CREATE INDEX idx_conv_participants_conversation ON conversation_participants(conversation_id);
CREATE INDEX idx_conv_participants_user ON conversation_participants(user_id);

CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES users(id),
  type            message_type NOT NULL DEFAULT 'text',
  content         TEXT,                           -- text or JSON for card types
  media_url       TEXT,                           -- image attachment
  product_id      UUID REFERENCES products(id),
  order_id        UUID REFERENCES orders(id),
  store_id        UUID REFERENCES stores(id),
  status          message_status NOT NULL DEFAULT 'sent',
  edited_at       TIMESTAMPTZ,
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
-- Partial index for undeleted messages (most queries filter deleted_at IS NULL)
CREATE INDEX idx_messages_active ON messages(conversation_id, created_at DESC) WHERE deleted_at IS NULL;

CREATE TABLE blocked_users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

CREATE TABLE chat_reports (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id      UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  reporter_id     UUID NOT NULL REFERENCES users(id),
  reason          chat_report_reason NOT NULL,
  description     TEXT,
  status          VARCHAR(20) NOT NULL DEFAULT 'open',  -- open, reviewing, resolved, dismissed
  resolved_by     UUID REFERENCES staff_accounts(id),
  resolution      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at     TIMESTAMPTZ
);

CREATE INDEX idx_chat_reports_status ON chat_reports(status);
```

#### 4.3.16 Video (Phase 2)

```sql
CREATE TABLE videos (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id            UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  seller_id           UUID NOT NULL REFERENCES users(id),
  caption             VARCHAR(300),
  hashtags            TEXT[] DEFAULT '{}',
  raw_upload_url      TEXT,                       -- pre-processing storage
  video_url           TEXT,                       -- processed streaming URL (HLS/DASH)
  playback_id         VARCHAR(255),               -- Mux/Cloudflare Stream playback ID
  thumbnail_url       TEXT,
  duration_seconds    INT,
  status              video_status NOT NULL DEFAULT 'processing',
  view_count          INT DEFAULT 0,
  unique_view_count   INT DEFAULT 0,
  like_count          INT DEFAULT 0,
  comment_count       INT DEFAULT 0,
  share_count         INT DEFAULT 0,
  save_count          INT DEFAULT 0,
  is_shoppable        BOOLEAN DEFAULT FALSE,
  audio_track         VARCHAR(255),
  moderation_status   moderation_status NOT NULL DEFAULT 'pending',
  moderation_notes    TEXT,
  strike_count        INT DEFAULT 0,
  published_at        TIMESTAMPTZ,
  deleted_at          TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_videos_store ON videos(store_id);
CREATE INDEX idx_videos_status ON videos(status);
CREATE INDEX idx_videos_published ON videos(published_at DESC) WHERE status = 'published';
CREATE INDEX idx_videos_hashtags ON videos USING GIN(hashtags);

CREATE TABLE video_product_tags (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id        UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  display_order   INT NOT NULL DEFAULT 0,
  timestamp_seconds INT,                          -- NULL = always visible
  click_count     INT DEFAULT 0,
  purchase_count  INT DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_video_tags_video ON video_product_tags(video_id);
CREATE INDEX idx_video_tags_product ON video_product_tags(product_id);

CREATE TABLE video_likes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id        UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(video_id, user_id)
);

CREATE INDEX idx_video_likes_video ON video_likes(video_id);

CREATE TABLE video_comments (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id            UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  user_id             UUID NOT NULL REFERENCES users(id),
  parent_comment_id   UUID REFERENCES video_comments(id) ON DELETE CASCADE,
  comment_text        TEXT NOT NULL,
  like_count          INT DEFAULT 0,
  is_deleted          BOOLEAN DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_video_comments_video ON video_comments(video_id, created_at DESC);

CREATE TABLE video_saves (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id        UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(video_id, user_id)
);

CREATE INDEX idx_video_saves_user ON video_saves(user_id);

CREATE TABLE video_views (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id        UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES users(id),
  watch_duration_seconds INT DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_video_views_video ON video_views(video_id);

CREATE TABLE store_follows (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_id        UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(follower_id, store_id)
);

CREATE INDEX idx_store_follows_store ON store_follows(store_id);
CREATE INDEX idx_store_follows_follower ON store_follows(follower_id);

CREATE TABLE video_reports (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id        UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  reporter_id     UUID NOT NULL REFERENCES users(id),
  reason          video_report_reason NOT NULL,
  description     TEXT,
  status          VARCHAR(20) NOT NULL DEFAULT 'open',
  resolved_by     UUID REFERENCES staff_accounts(id),
  resolution      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at     TIMESTAMPTZ
);

CREATE INDEX idx_video_reports_status ON video_reports(status);
```

#### 4.3.17 Platform Configuration

```sql
CREATE TABLE platform_config (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key             VARCHAR(100) UNIQUE NOT NULL,
  value           JSONB NOT NULL,
  description     TEXT,
  updated_by      UUID REFERENCES staff_accounts(id),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed values:
INSERT INTO platform_config (key, value, description) VALUES
  ('commission_rate_default', '10.0', 'Default platform commission percentage'),
  ('delivery_base_rate', '500', 'Base delivery fee in XAF'),
  ('delivery_per_km_rate', '100', 'Per-km delivery fee in XAF'),
  ('delivery_vehicle_multipliers', '{"bike": 1.0, "car": 1.5, "van": 2.0}', 'Vehicle type multipliers for delivery fees'),
  ('order_acknowledge_timeout_hours', '2', 'Hours before auto-cancel unacknowledged order'),
  ('escrow_auto_release_hours', '48', 'Hours before auto-releasing escrow if no dispute'),
  ('kyc_max_resubmissions', '3', 'Max KYC resubmission attempts'),
  ('chat_message_rate_limit', '30', 'Max messages per minute per user'),
  ('chat_message_retention_days', '90', 'Days before chat messages archived'),
  ('video_max_duration_seconds', '60', 'Max video duration'),
  ('video_max_file_size_mb', '50', 'Max video upload size'),
  ('video_strike_threshold_suspend', '3', 'Strikes before upload suspension'),
  ('video_strike_threshold_ban', '5', 'Strikes before permanent video ban'),
  ('video_auto_takedown_report_count', '5', 'Reports within 1hr to auto-hide video');
```

### 4.4 Row-Level Security (RLS) Policies

RLS is enabled on all tables. Policies enforce data isolation at the database level.

```sql
-- ─── Users: users can only read/update their own row ───
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_select_own ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY users_update_own ON users FOR UPDATE
  USING (auth.uid() = id);

-- Staff can read all users (for user lookup in Staff Portal)
-- Staff access is controlled via a custom JWT claim: is_staff = true
CREATE POLICY users_select_staff ON users FOR SELECT
  USING (auth.jwt() ->> 'is_staff' = 'true');

-- ─── Stores: public read (active stores), owner write ───
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY stores_select_public ON stores FOR SELECT
  USING (is_active = TRUE AND is_suspended = FALSE AND kyc_status = 'approved');

CREATE POLICY stores_all_owner ON stores FOR ALL
  USING (auth.uid() = owner_id);

CREATE POLICY stores_all_staff ON stores FOR ALL
  USING (auth.jwt() ->> 'is_staff' = 'true');

-- ─── Products: public read (active products from approved stores), store owner write ───
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY products_select_public ON products FOR SELECT
  USING (
    is_active = TRUE AND deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = products.store_id
      AND stores.is_active = TRUE
      AND stores.is_suspended = FALSE
      AND stores.kyc_status = 'approved'
    )
  );

CREATE POLICY products_all_owner ON products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = products.store_id
      AND stores.owner_id = auth.uid()
    )
  );

CREATE POLICY products_all_staff ON products FOR ALL
  USING (auth.jwt() ->> 'is_staff' = 'true');

-- ─── Orders: customer and store owner can see their orders ───
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY orders_select_customer ON orders FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY orders_select_store ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = orders.store_id
      AND stores.owner_id = auth.uid()
    )
  );

CREATE POLICY orders_select_transporter ON orders FOR SELECT
  USING (auth.uid() = transporter_id);

CREATE POLICY orders_all_staff ON orders FOR ALL
  USING (auth.jwt() ->> 'is_staff' = 'true');

-- ─── Messages: only conversation participants ───
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY messages_select_participant ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = messages.conversation_id
      AND user_id = auth.uid()
      AND left_at IS NULL
    )
  );

CREATE POLICY messages_insert_participant ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = messages.conversation_id
      AND user_id = auth.uid()
      AND left_at IS NULL
    )
  );

-- ─── Wallets: owner only ───
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY wallets_select_owner ON wallets FOR SELECT
  USING (auth.uid() = user_id);

-- Staff can view wallets (finance dashboard)
CREATE POLICY wallets_select_staff ON wallets FOR SELECT
  USING (auth.jwt() ->> 'is_staff' = 'true');

-- ─── Audit Log: staff only (compliance + super admin) ───
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_log_select_staff ON audit_log FOR SELECT
  USING (
    auth.jwt() ->> 'is_staff' = 'true'
    AND (
      auth.jwt() ->> 'department' IN ('compliance_legal', 'super_admin', 'it_engineering')
    )
  );

-- ─── Staff tables: staff only ───
ALTER TABLE staff_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY staff_accounts_select_self ON staff_accounts FOR SELECT
  USING (auth.uid() = id AND auth.jwt() ->> 'is_staff' = 'true');
```

> **Note:** RLS policies shown above are representative. The full migration file (`015_create_rls_policies.sql`) contains policies for every table. The service role key bypasses RLS for server-side operations that need cross-user access (e.g., payment processing, escrow release).

---

## 5. API Specification

### 5.1 Conventions

| Convention | Rule |
|---|---|
| Base URL | `https://api.wunabuy.com/api/v1` |
| Staff Base URL | `https://api.wunabuy.com/api/v1/staff` |
| Auth | `Authorization: Bearer <JWT>` header on all protected endpoints |
| Content type | `application/json` for all requests/responses except file uploads (`multipart/form-data`) |
| Pagination | Cursor-based: `?cursor=<base64>&limit=20`. Response includes `next_cursor` and `has_more` |
| Error format | Standardized JSON (see Section 13.1) |
| Idempotency | Payment and order mutation endpoints accept `Idempotency-Key` header |
| Timestamps | ISO 8601 with timezone (`2026-07-25T12:00:00Z`) |
| Currency amounts | Integer cents in API responses? No — decimal strings to avoid float issues: `"amount": "15000.00"` |
| Rate limiting | `429 Too Many Requests` with `Retry-After` header |

### 5.2 Standard Response Envelope

```typescript
// Success
{
  "success": true,
  "data": { ... },
  "meta": {
    "pagination": {
      "has_more": true,
      "next_cursor": "eyJ..." 
    }
  }
}

// Error
{
  "success": false,
  "error": {
    "code": "PAYMENT_GATEWAY_ERROR",
    "message": "Payment gateway returned an error",
    "details": { "gateway_response": "Insufficient funds" },
    "request_id": "req_abc123"
  }
}
```

### 5.3 Authentication Endpoints

#### POST /auth/register
```json
// Request
{
  "phone": "+2376XXXXXXXX",
  "full_name": "Brandon Forku",
  "role": "buyer",
  "email": "optional@email.com",
  "password": "optional-if-email"
}

// Response 201
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "phone": "+2376XXXXXXXX",
    "otp_sent": true,
    "otp_expires_in": 300
  }
}
```

#### POST /auth/verify-otp
```json
// Request
{
  "phone": "+2376XXXXXXXX",
  "otp": "123456"
}

// Response 200
{
  "success": true,
  "data": {
    "access_token": "eyJ...",
    "refresh_token": "eyJ...",
    "expires_in": 3600,
    "user": {
      "id": "uuid",
      "phone": "+2376XXXXXXXX",
      "full_name": "Brandon Forku",
      "role": "buyer",
      "is_phone_verified": true
    }
  }
}
```

#### POST /auth/login
```json
// Request (phone + password)
{
  "phone": "+2376XXXXXXXX",
  "password": "..."
}
// OR (email + password)
{
  "email": "user@email.com",
  "password": "..."
}

// Response 200 (same as verify-otp)
```

#### POST /auth/refresh
```json
// Request
{ "refresh_token": "eyJ..." }

// Response 200
{ "success": true, "data": { "access_token": "eyJ...", "expires_in": 3600 } }
```

#### POST /auth/reset-password
```json
// Request
{ "phone": "+2376XXXXXXXX" }
// Triggers OTP send

// Response 200
{ "success": true, "data": { "otp_sent": true } }
```

#### POST /auth/reset-password/confirm
```json
// Request
{ "phone": "+2376XXXXXXXX", "otp": "123456", "new_password": "..." }

// Response 200
{ "success": true, "data": { "password_reset": true } }
```

#### POST /auth/social (Google/Facebook)
```json
// Request
{ "provider": "google", "id_token": "eyJ..." }

// Response 200 (same as login)
```

### 5.4 Product Endpoints

#### GET /products
```
Query params:
  ?search=laptop              # full-text search
  ?category=Electronics       # category filter
  ?min_price=10000&max_price=50000
  ?quality=new,like_new       # comma-separated quality tiers
  ?min_rating=4.0             # minimum store rating
  ?lat=3.848&lng=11.502&radius_km=50   # geo filter
  ?sort=relevance|price_asc|price_desc|distance|rating|newest
  ?cursor=eyJ...&limit=20

// Response 200
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "HP Laptop 15",
      "price": "150000.00",
      "currency": "XAF",
      "quality_tier": "new",
      "images": ["url1", "url2"],
      "store": {
        "id": "uuid",
        "name": "TechHub Store",
        "rating_avg": 4.5,
        "distance_km": 3.2
      },
      "ranking_score": 0.87,
      "view_count": 234,
      "created_at": "2026-07-20T..."
    }
  ],
  "meta": {
    "pagination": { "has_more": true, "next_cursor": "eyJ..." }
  }
}
```

#### POST /products (Seller only)
```json
// Request (multipart/form-data for images, or JSON with pre-uploaded URLs)
{
  "name": "HP Laptop 15",
  "description": "Intel i5, 8GB RAM, 256GB SSD",
  "category": "Electronics",
  "subcategory": "Laptops",
  "price": 150000.00,
  "currency": "XAF",
  "quantity": 10,
  "quality_tier": "new",
  "images": ["https://storage.wunabuy.com/products/img1.jpg"]
}

// Response 201
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "HP Laptop 15",
    "is_active": true,
    "created_at": "2026-07-25T..."
  }
}
```

#### GET /products/{id}
```json
// Response 200
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "HP Laptop 15",
    "description": "...",
    "price": "150000.00",
    "quantity": 10,
    "quality_tier": "new",
    "images": ["url1", "url2", "url3"],
    "category": "Electronics",
    "store": {
      "id": "uuid",
      "name": "TechHub Store",
      "rating_avg": 4.5,
      "total_reviews": 120,
      "is_verified": true,
      "distance_km": 3.2,
      "follower_count": 450
    },
    "rating_avg": 4.3,
    "review_count": 45,
    "view_count": 234,
    "delivery_estimate": "1-2 hours",
    "created_at": "2026-07-20T..."
  }
}
```

#### PUT /products/{id} (Seller only, own products)
#### DELETE /products/{id} (Soft delete, Seller only)
#### POST /products/bulk (CSV upload, Seller only)

### 5.5 Order Endpoints

#### POST /orders
```json
// Request
{
  "items": [
    { "product_id": "uuid", "quantity": 2 }
  ],
  "delivery_address_id": "uuid",
  "payment_method": "momo",
  "transport_bundled": true
}

// Response 201
{
  "success": true,
  "data": {
    "id": "uuid",
    "order_code": "WNB-2026-000123",
    "status": "pending_payment",
    "subtotal": "300000.00",
    "delivery_fee": "1500.00",
    "commission": "30000.00",
    "total": "301500.00",
    "currency": "XAF",
    "payment": {
      "gateway": "flutterwave",
      "payment_url": "https://...",
      "flw_ref": "FLW-..."
    },
    "expires_at": "2026-07-25T13:00:00Z"
  }
}
```

#### GET /orders
```
Query: ?status=active&cursor=...&limit=20
// Returns orders for authenticated user (filtered by role: customer sees their orders, 
// store owner sees store orders, transporter sees delivery assignments)
```

#### GET /orders/{id}
#### PUT /orders/{id}/status
```json
// Request (store owner acknowledging order)
{
  "status": "preparing",
  "note": "Preparing items for pickup"
}

// Request (transporter updating status)
{
  "status": "in_transit",
  "tracking": { "lat": 3.851, "lng": 11.505 }
}
```

#### POST /orders/{id}/confirm (Customer confirms receipt)
```json
// Response 200
{
  "success": true,
  "data": {
    "order_id": "uuid",
    "status": "received",
    "escrow_released": true,
    "store_payout_amount": "270000.00"
  }
}
```

#### POST /orders/{id}/cancel
#### POST /orders/{id}/dispute

### 5.6 Payment & Wallet Endpoints

#### POST /payments/charge
```json
// Request
{
  "order_id": "uuid",
  "method": "momo",
  "phone": "+2376XXXXXXXX"
}

// Response 200
{
  "success": true,
  "data": {
    "status": "pending",
    "gateway": "flutterwave",
    "flw_ref": "FLW-...",
    "message": "Payment initiated. Awaiting confirmation."
  }
}
```

#### GET /payments/verify/{reference}
```json
// Response 200
{
  "success": true,
  "data": {
    "status": "successful",
    "amount": "301500.00",
    "currency": "XAF",
    "gateway": "flutterwave",
    "order_id": "uuid",
    "escrow_held": true
  }
}
```

#### GET /wallet
```json
// Response 200
{
  "success": true,
  "data": {
    "balance_escrow": "150000.00",
    "balance_available": "320000.00",
    "total_earned": "1200000.00",
    "total_payout": "730000.00",
    "currency": "XAF"
  }
}
```

#### GET /wallet/transactions
```
Query: ?type=escrow_release&cursor=...&limit=20
```

#### POST /wallet/payout
```json
// Request
{
  "amount": 100000.00,
  "destination": "bank_account",
  "destination_details": { "bank_code": "...", "account_number": "..." }
}

// Response 201
{
  "success": true,
  "data": {
    "payout_id": "uuid",
    "status": "pending",
    "amount": "100000.00",
    "fee": "500.00"
  }
}
```

### 5.7 Delivery Endpoints

#### GET /delivery/jobs (Transporter only)
```
Query: ?status=available&lat=3.848&lng=11.502&radius_km=10
// Returns available delivery jobs near transporter
```

#### POST /delivery/{id}/accept
#### POST /delivery/{id}/decline
#### PUT /delivery/{id}/location (Transporter GPS update)
```json
// Request
{ "lat": 3.851, "lng": 11.505, "heading": 180 }
// Broadcast via Supabase Realtime to customer + staff monitoring
```

#### PUT /delivery/{id}/status
#### POST /delivery/{id}/photo (Delivery confirmation photo)

### 5.8 Chat Endpoints

#### GET /chat/conversations
```json
// Response 200
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "direct",
      "name": null,
      "avatar_url": null,
      "other_participant": {
        "id": "uuid",
        "full_name": "TechHub Store",
        "avatar_url": "..."
      },
      "last_message": {
        "content": "Your order is ready",
        "type": "text",
        "sender_id": "uuid",
        "created_at": "2026-07-25T..."
      },
      "unread_count": 3,
      "is_muted": false
    }
  ]
}
```

#### POST /chat/conversations (Start new conversation)
```json
// Request
{
  "participant_ids": ["uuid"],
  "type": "direct"
}
```

#### GET /chat/conversations/{id}/messages
```
Query: ?cursor=...&limit=50&direction=before
```

#### POST /chat/conversations/{id}/messages
```json
// Request
{
  "type": "text",
  "content": "Is this item still available?"
}
// OR
{
  "type": "product_card",
  "product_id": "uuid"
}
// OR
{
  "type": "image",
  "media_url": "https://storage.wunabuy.com/chat/img1.jpg"
}
```

#### PUT /chat/messages/{id} (Edit, within 5 min)
#### DELETE /chat/messages/{id} (Soft delete, within 5 min)
#### POST /chat/block
#### POST /chat/report
#### GET /chat/search?q=laptop

### 5.9 Search & Discovery Endpoints

#### GET /discovery/feed
```
Query: ?lat=3.848&lng=11.502&limit=20&cursor=...
// Returns personalized Smart Discovery feed based on user behavior + ranking signals
```

### 5.10 Video Endpoints (Phase 2)

#### POST /videos (Seller only)
```json
// Request (multipart/form-data)
// Fields: video (file), caption (string), hashtags (string, space-separated), 
//         product_ids (string, comma-separated UUIDs), is_shoppable (boolean)

// Response 201
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "processing",
    "upload_url": "https://...",  // pre-signed URL for direct upload to storage
    "message": "Video is being processed and will be reviewed."
  }
}
```

#### GET /videos/feed (For You)
```
Query: ?cursor=...&limit=10
```

#### GET /videos/following
#### GET /videos/{id}
#### DELETE /videos/{id}
#### POST /videos/{id}/like
#### DELETE /videos/{id}/like (Unlike)
#### POST /videos/{id}/comments
#### GET /videos/{id}/comments
#### POST /stores/{id}/follow
#### DELETE /stores/{id}/follow (Unfollow)
#### POST /videos/{id}/save
#### DELETE /videos/{id}/save
#### POST /videos/{id}/report
#### GET /videos/search?q=laptop&hashtag=tech
#### GET /videos/my-analytics (Seller only)

### 5.11 Staff Portal Endpoints

#### POST /staff/login
```json
// Request
{ "email": "staff@wunabuy.com", "password": "..." }

// Response 200 (MFA required)
{
  "success": true,
  "data": {
    "mfa_required": true,
    "mfa_token": "temp_token_for_mfa_step"
  }
}
```

#### POST /staff/verify-mfa
```json
// Request
{ "mfa_token": "temp_token", "otp": "123456" }

// Response 200
{
  "success": true,
  "data": {
    "access_token": "eyJ...",
    "refresh_token": "eyJ...",
    "expires_in": 900,
    "staff": {
      "id": "uuid",
      "email": "staff@wunabuy.com",
      "full_name": "...",
      "roles": [
        { "department": "accounting", "role_level": "manager" }
      ],
      "permissions": ["finance.view_dashboard", "finance.approve_payouts", ...]
    }
  }
}
```

#### GET /staff/kyc/queue
#### PUT /staff/kyc/{id}/approve
#### PUT /staff/kyc/{id}/reject
#### PUT /staff/kyc/{id}/request-info

#### GET /staff/disputes
#### PUT /staff/disputes/{id}/resolve

#### GET /staff/payouts/queue
#### PUT /staff/payouts/{id}/approve
#### PUT /staff/payouts/{id}/reject

#### GET /staff/finance/overview
#### GET /staff/finance/ledger
#### GET /staff/finance/reconciliation
#### GET /staff/finance/reports

#### GET /staff/users/search
#### GET /staff/users/{id}
#### PUT /staff/users/{id}/suspend
#### PUT /staff/users/{id}/unsuspend

#### GET /staff/config/{key}
#### PUT /staff/config/{key}

#### GET /staff/analytics/overview
#### GET /staff/analytics/acquisition
#### GET /staff/analytics/conversion
#### GET /staff/analytics/gmv

#### GET /staff/audit-log
#### GET /staff/audit-log/export

#### GET /staff/accounts
#### POST /staff/accounts
#### PUT /staff/accounts/{id}
#### PUT /staff/accounts/{id}/roles

#### GET /staff/tickets
#### PUT /staff/tickets/{id}/assign
#### PUT /staff/tickets/{id}/resolve
#### PUT /staff/tickets/{id}/escalate

#### GET /staff/campaigns
#### POST /staff/campaigns
#### PUT /staff/campaigns/{id}

#### GET /staff/discovery/ranking-config
#### PUT /staff/discovery/ranking-config

#### GET /staff/chat-reports (Chat moderation queue)
#### GET /staff/video-reports (Phase 2, Video moderation queue)
#### PUT /staff/videos/{id}/remove (Phase 2)
#### PUT /staff/videos/{id}/strike (Phase 2)

### 5.12 Webhook Endpoints (Serverless Functions)

#### POST /webhooks/flutterwave
```
Headers: verif-hash: <FLUTTERWAVE_WEBHOOK_HASH>
Body: Flutterwave webhook payload (charge.completed event)

Action:
  1. Verify hash
  2. Extract transaction reference
  3. Verify transaction via Flutterwave API (GET /v3/transactions/{id}/verify)
  4. If successful: update order status to 'paid_escrow', create escrow_hold transaction, 
     notify store, update ranking behavior (purchase event)
  5. If failed: update order to 'cancelled', notify customer
```

#### POST /webhooks/paystack
```
Headers: x-paystack-signature: <HMAC SHA512>
Body: Paystack webhook payload

Action: Same logic as Flutterwave webhook with Paystack verification.
```

---

## 6. Authentication, Authorization & Security

### 6.1 Authentication Flows

#### 6.1.1 Mobile App Authentication

```
Registration:
  1. Client sends phone + full_name + role → POST /auth/register
  2. Server creates user (status: active, is_phone_verified: false)
  3. Server generates 6-digit OTP, stores in Redis (key: otp:{phone}, TTL: 300s)
  4. Server sends OTP via SMS (Africa's Talking)
  5. Client sends phone + OTP → POST /auth/verify-otp
  6. Server validates OTP from Redis
  7. Server issues access_token (1h) + refresh_token (30d)
  8. Server sets is_phone_verified = true

Login (phone + password):
  1. Client sends phone + password → POST /auth/login
  2. Server verifies password hash (bcrypt)
  3. Server issues tokens

Token Refresh:
  1. Client sends refresh_token → POST /auth/refresh
  2. Server verifies refresh_token signature + checks if revoked (Redis blacklist)
  3. Server issues new access_token
  4. Refresh token rotation: old refresh_token is blacklisted, new one issued
```

#### 6.1.2 Staff Portal Authentication

```
Login:
  1. Staff sends email + password → POST /staff/login
  2. Server verifies password + checks account is active + not locked
  3. Server issues temporary mfa_token (5 min TTL)
  4. Client prompts for TOTP code
  5. Staff sends mfa_token + TOTP → POST /staff/verify-mfa
  6. Server verifies TOTP against decrypted mfa_secret
  7. Server issues access_token (15 min) + refresh_token (8h)
  8. JWT contains: { staff_id, email, roles: [...], permissions: [...], is_staff: true }

Session Management:
  - Access token: 15 min TTL
  - Refresh token: 8h TTL, single-use (rotation)
  - Inactivity timeout: 15 min (client-side + server token expiry alignment)
  - Failed login: lock after 5 attempts, unlock by Super Admin
  - IP allowlist: checked on every request if STAFF_IP_ALLOWLIST is set
```

### 6.2 JWT Structure

```json
// Mobile app access token payload
{
  "sub": "user_uuid",
  "role": "buyer",
  "is_staff": false,
  "phone_verified": true,
  "iat": 1721900000,
  "exp": 1721903600
}

// Staff access token payload
{
  "sub": "staff_uuid",
  "email": "staff@wunabuy.com",
  "is_staff": true,
  "roles": [
    { "department": "accounting", "role_level": "manager" }
  ],
  "permissions": ["finance.view_dashboard", "finance.approve_payouts", ...],
  "iat": 1721900000,
  "exp": 1721900900
}
```

### 6.3 RBAC Implementation

```typescript
// rbac.middleware.ts
import { Request, Response, NextFunction } from 'express';

export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user; // set by auth middleware
    
    if (!user?.is_staff) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Staff access required' }
      });
    }
    
    if (!user.permissions.includes(permission) && 
        !user.permissions.includes('superadmin.all')) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: `Permission required: ${permission}` }
      });
    }
    
    // Check role level if needed
    // e.g., 'finance.approve_payouts' requires 'manager' level in 'accounting'
    
    next();
  };
}

// Usage in routes:
router.put('/payouts/:id/approve', 
  authMiddleware, 
  requirePermission('finance.approve_payouts'),
  auditLog('payout.approve'),
  payoutController.approve
);
```

### 6.4 Audit Log Implementation

```typescript
// audit-log.service.ts
async function logAction(params: {
  staffId: string;
  action: string;
  entityType: string;
  entityId?: string;
  beforeState?: any;
  afterState?: any;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  // Get previous hash
  const lastEntry = await db.query('SELECT current_hash FROM audit_log ORDER BY id DESC LIMIT 1');
  const previousHash = lastEntry.rows[0]?.current_hash || 'GENESIS';
  
  // Compute current hash
  const hashPayload = JSON.stringify({
    previousHash,
    action: params.action,
    entityId: params.entityId,
    staffId: params.staffId,
    createdAt: new Date().toISOString(),
    beforeState: params.beforeState,
    afterState: params.afterState
  });
  const currentHash = crypto.createHash('sha256').update(hashPayload).digest('hex');
  
  await db.insert('audit_log', {
    staff_id: params.staffId,
    action: params.action,
    entity_type: params.entityType,
    entity_id: params.entityId,
    before_state: params.beforeState,
    after_state: params.afterState,
    ip_address: params.ipAddress,
    user_agent: params.userAgent,
    previous_hash: previousHash,
    current_hash: currentHash
  });
}
```

### 6.5 Security Measures

| Area | Implementation |
|---|---|
| TLS | TLS 1.3 minimum, HSTS header, no mixed content |
| Password hashing | bcrypt with cost factor 12 |
| OTP storage | Redis with TTL, max 5 attempts, hashed |
| KYC documents | AES-256 encrypted at rest in Supabase Storage, access via signed URLs (5 min expiry) |
| Card data | Never stored. Tokenization via payment gateway only |
| Rate limiting | General: 100 req/min per IP. OTP: 5 req/min. Chat: 30 msg/min. Configurable via env |
| CORS | Whitelist: `https://app.wunabuy.com`, `https://staff.wunabuy.com` |
| Helmet | Security headers: CSP, X-Frame-Options, X-Content-Type-Options, etc. |
| Input sanitization | Zod validation on every endpoint. No raw SQL from user input |
| SQL injection | Parameterized queries only via Supabase client or pg prepared statements |
| XSS | Input sanitization, output encoding, CSP header |
| File upload validation | MIME type check, magic bytes check, max file size enforced |
| Signed URLs | All file access via time-limited signed URLs, no public bucket access |
| Secrets management | Environment variables only, never in code, never logged |
| Dependency scanning | npm audit on CI, Snyk for continuous monitoring |

---

## 7. Real-Time Services

### 7.1 Supabase Realtime Channels

| Channel Pattern | Subscribers | Events |
|---|---|---|
| `chat:{conversation_id}` | Conversation participants | `message:new`, `message:updated`, `message:deleted`, `typing` |
| `order:{order_id}` | Customer, store owner, transporter | `status:changed`, `tracking:updated` |
| `tracking:{delivery_id}` | Customer, Operations staff | `location:updated`, `eta:updated`, `status:changed` |
| `staff:notifications:{staff_id}` | Individual staff member | `notification:new`, `ticket:assigned`, `dispute:assigned` |
| `staff:broadcast` | All online staff | `alert:system`, `alert:fraud` |
| `kyc:queue` | Operations/Compliance staff | `kyc:new_submission`, `kyc:status_changed` |
| `payout:queue` | Finance staff | `payout:new_request` |

### 7.2 Chat Realtime Flow

```
Sender Client
    │
    ├── POST /chat/conversations/{id}/messages (REST)
    │       │
    │       ▼
    │   Server inserts message to DB
    │       │
    │       ├── Broadcast via Supabase Realtime channel: chat:{conversation_id}
    │       │       │
    │       │       ├── Recipient client receives `message:new` event
    │       │       │       │
    │       │       │       ├── If app foreground: update chat UI
    │       │       │       └── If app background: trigger push notification
    │       │       │
    │       │       └── Server updates message status to 'delivered'
    │       │
    │       └── Recipient sends read receipt → server updates status to 'read'
    │               └── Broadcast `message:updated` with status: 'read'
    │
    └── Typing indicator sent directly via Realtime channel (not persisted)
```

### 7.3 Delivery Tracking Realtime

```
Transporter App (sends GPS every 10s)
    │
    ├── PUT /delivery/{id}/location { lat, lng, heading }
    │       │
    │       ▼
    │   Server updates tracking_data in orders table
    │       │
    │       ├── Broadcast via Realtime: tracking:{delivery_id}
    │       │       └── Customer app receives `location:updated`
    │       │               └── Updates map marker + recalculates ETA
    │       │
    │       └── Staff Portal (Operations dashboard) receives location update
    │               └── Updates active deliveries map
    │
    └── If status changes (picked_up, in_transit, delivered):
            ├── Broadcast `status:changed` on tracking:{delivery_id}
            ├── Broadcast `status:changed` on order:{order_id}
            └── Dispatch push notification to customer
```

---

## 8. Payment, Escrow & Wallet System

### 8.1 Payment Flow

```
Customer checkout
    │
    ▼
POST /orders → order created (status: pending_payment, expires_at: +15 min)
    │
    ▼
POST /payments/charge → Flutterwave/Paystack API call
    │
    ├── Gateway returns payment URL / MoMo prompt
    │
    ▼
Customer completes payment on gateway
    │
    ▼
Gateway sends webhook → POST /webhooks/flutterwave (or paystack)
    │
    ├── 1. Verify webhook signature/hash
    ├── 2. Verify transaction via gateway API (double-check)
    ├── 3. If successful:
    │       ├── Update order.status = 'paid_escrow'
    │       ├── Create transaction: type='payment_received', amount=total
    │       ├── Create transaction: type='escrow_hold', amount=total (store wallet)
    │       ├── Increment store wallet.balance_escrow
    │       ├── Emit event: order.paid → notification to store
    │       ├── Update ranking: behavior 'purchase' event
    │       └── Start order acknowledge timer (2h timeout)
    │
    └── 4. If failed:
            ├── Update order.status = 'cancelled'
            └── Emit event: order.cancelled → notification to customer
```

### 8.2 Escrow Lifecycle

```
                    Payment Confirmed
                          │
                          ▼
                   ESCROW HELD
                   (balance_escrow += total)
                          │
              ┌───────────┼───────────┐
              │           │           │
         Order       Customer     Order
         Cancelled   Confirms     Disputed
         (refund)    Receipt      (freeze)
              │           │           │
              ▼           ▼           ▼
         Refund to   ESCROW       Escrow frozen
         customer    RELEASED     pending resolution
                      │
              ┌───────┼───────┐
              │               │
         Store receives   Commission
         (subtotal -      deducted to
          commission)     platform
              │
              ▼
         balance_escrow -= total
         balance_available += (subtotal - commission)
         Create transaction: 'escrow_release'
         Create transaction: 'commission_deduct'
```

### 8.3 Escrow Release Conditions

| Trigger | Action |
|---|---|
| Customer confirms receipt (`POST /orders/{id}/confirm`) | Release escrow immediately |
| 48 hours pass with no dispute and no explicit confirmation | Auto-release (cron job) |
| Dispute opened | Freeze escrow, do not release until resolved |
| Dispute resolved in customer's favor | Refund from escrow |
| Dispute resolved in store's favor | Release escrow to store |
| Order cancelled before preparing | Full refund from escrow |

### 8.4 Payout Flow

```
Store owner requests payout
    │
    ▼
POST /wallet/payout → creates payout record (status: pending)
    │
    ▼
Finance staff reviews in Staff Portal
    │
    ├── Approve → PUT /staff/payouts/{id}/approve
    │       │
    │       ├── Audit log: action='payout.approve'
    │       ├── Call gateway transfer API (Flutterwave/Paystack)
    │       ├── Update payout status: 'processing'
    │       ├── Deduct from wallet.balance_available
    │       └── Create transaction: type='payout'
    │
    └── Reject → PUT /staff/payouts/{id}/reject
            └── Audit log: action='payout.reject'

Gateway transfer completes → webhook → payout status: 'completed'
Gateway transfer fails → webhook → payout status: 'failed', refund to balance_available
```

### 8.5 Reconciliation

Daily reconciliation job matches gateway settlement reports against platform transaction records:

```
1. Fetch gateway settlement report (Flutterwave API: GET /v3/settlements)
2. For each settlement entry, find matching transaction by reference
3. Compare amounts
4. Log discrepancies in reconciliation table
5. Alert Finance staff if discrepancies found
6. Generate daily reconciliation report (accessible via Staff Portal)
```

---

## 9. File & Media Handling

### 9.1 Image Upload Flow

```
Client selects image
    │
    ├── 1. Client requests upload URL: POST /uploads/presign
    │       { type: 'product' | 'kyc' | 'review' | 'chat' | 'avatar' }
    │       → Returns pre-signed Supabase Storage URL
    │
    ├── 2. Client uploads directly to Supabase Storage via pre-signed URL
    │
    ├── 3. Client sends uploaded URL to relevant endpoint (e.g., POST /products)
    │
    └── 4. Server-side post-processing (Cloud Function):
            ├── Validate MIME type (jpeg, png, webp)
            ├── Generate thumbnail (200px) via sharp
            ├── Generate display size (800px) via sharp
            ├── Generate full size (1200px) via sharp
            ├── Compress (quality 80)
            └── Store all sizes in Supabase Storage
```

### 9.2 Storage Bucket Structure

```
wunabuy-storage/
├── products/
│   ├── {product_id}/
│   │   ├── thumb_1.jpg
│   │   ├── display_1.jpg
│   │   ├── full_1.jpg
│   │   └── ...
├── kyc/
│   ├── {store_id}/
│   │   ├── id_front_encrypted.jpg
│   │   ├── id_back_encrypted.jpg
│   │   ├── store_front_encrypted.jpg
│   │   └── registration_doc_encrypted.pdf
├── reviews/
│   ├── {review_id}/
│   │   ├── photo_1.jpg
│   │   └── ...
├── chat/
│   ├── {conversation_id}/
│   │   ├── {message_id}.jpg
│   │   └── ...
├── avatars/
│   ├── {user_id}.jpg
├── delivery/
│   ├── {delivery_id}/
│   │   └── confirmation.jpg
└── videos/                              # Phase 2
    ├── raw/
    │   └── {video_id}.mp4
    ├── thumbnails/
    │   └── {video_id}.jpg
    └── processed/                       # managed by Mux/Cloudflare
```

### 9.3 Image Access

All images accessed via signed URLs generated server-side:
```typescript
async function getSignedUrl(bucket: string, path: string, expiresIn: number = 300): Promise<string> {
  return supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)
    .data.signedUrl;
}
```

KYC documents use shorter expiry (60 seconds) and require staff permission verification before URL generation.

---

## 10. Video Pipeline (Phase 2)

### 10.1 Upload & Processing Flow

```
Seller records video in-app or selects from gallery
    │
    ├── 1. POST /videos → server creates video record (status: processing)
    │       → Returns pre-signed upload URL for raw storage
    │
    ├── 2. Client uploads video to Supabase Storage (raw/)
    │
    ├── 3. Server detects upload completion (Supabase storage event trigger)
    │       │
    │       ├── Create asset in Mux: POST https://api.mux.com/v1/assets
    │       │     { input: raw_upload_url, playback_policy: 'public' }
    │       │
    │       └── Mux processes: transcode to adaptive bitrate (360p, 480p, 720p)
    │             → Returns playback_id + thumbnail URL
    │
    ├── 4. Server updates video record:
    │       ├── video_url = `https://stream.mux.com/{playback_id}.m3u8`
    │       ├── playback_id = mux_playback_id
    │       ├── thumbnail_url = mux_thumbnail_url
    │       └── status = 'pending_review'
    │
    ├── 5. Content moderation scan:
    │       ├── Submit video to Google Cloud Video Intelligence API
    │       │     → Detect explicit/violent content
    │       ├── If clean: moderation_status = 'approved', status = 'published'
    │       ├── If flagged: moderation_status = 'flagged', route to staff review queue
    │       └── If rejected: moderation_status = 'rejected', notify seller
    │
    └── 6. Video published:
            ├── Set published_at = NOW()
            ├── Notify followers via push notification
            └── Include in For You feed algorithm
```

### 10.2 Video Feed Algorithm (For You)

```typescript
// video-feed.service.ts
async function getForYouFeed(userId: string, cursor?: string, limit: number = 10) {
  // 1. Get user's followed stores
  const following = await db.query(
    'SELECT store_id FROM store_follows WHERE follower_id = $1', [userId]
  );
  
  // 2. Get user's viewed categories (from user_behavior)
  const categories = await db.query(
    `SELECT category, COUNT(*) as freq 
     FROM user_behavior 
     WHERE user_id = $1 AND action = 'view' 
     GROUP BY category ORDER BY freq DESC LIMIT 5`, [userId]
  );
  
  // 3. Get user's liked video categories
  const likedCategories = await db.query(
    `SELECT v.hashtags, v.store_id 
     FROM video_likes vl 
     JOIN videos v ON vl.video_id = v.id 
     WHERE vl.user_id = $1 
     ORDER BY vl.created_at DESC LIMIT 20`, [userId]
  );
  
  // 4. Build feed query with weighted scoring:
  //    - Followed stores: 3x boost
  //    - Preferred categories: 2x boost
  //    - Recent videos: 1.5x boost (freshness)
  //    - High engagement: 1.2x boost
  //    - Exclude already-viewed videos
  
  const feed = await db.query(`
    SELECT v.*, 
      (CASE WHEN v.store_id = ANY($1) THEN 3 ELSE 1 END) * 
      (CASE WHEN v.hashtags && $2 THEN 2 ELSE 1 END) * 
      (CASE WHEN v.published_at > NOW() - INTERVAL '7 days' THEN 1.5 ELSE 1 END) * 
      (1 + LOG(v.view_count + 1)) as feed_score
    FROM videos v
    WHERE v.status = 'published' 
      AND v.moderation_status = 'approved'
      AND v.id NOT IN (SELECT video_id FROM video_views WHERE user_id = $3)
    ORDER BY feed_score DESC
    LIMIT $4
  `, [following, categories, userId, limit]);
  
  return feed.rows;
}
```

### 10.3 Shoppable Video Tracking

When a buyer taps a product tag in a video:
```
1. POST /videos/{video_id}/product-click { product_id }
   → Increment video_product_tags.click_count
   → Record user_behavior (action: 'view', source: 'video')

2. If buyer purchases the product:
   → Increment video_product_tags.purchase_count
   → Attributed to video in seller analytics
```

---

## 11. Background Jobs & Scheduled Tasks

### 11.1 Job Inventory

| Job | Schedule | Module | Description |
|---|---|---|---|
| `escrow-auto-release` | Every 1 hour | payment | Release escrow for orders delivered >48h ago with no dispute |
| `order-timeout` | Every 15 min | commerce | Auto-cancel orders not acknowledged by store within 2h of payment |
| `payment-expiry` | Every 5 min | payment | Cancel orders in `pending_payment` past `expires_at` |
| `ranking-refresh` | Every 6 hours | search | Recompute all ranking_signals composite scores |
| `ranking-behavior-decay` | Daily at 2AM | search | Decay old behavior signals (weight recency) |
| `notification-cleanup` | Daily at 3AM | notification | Archive notifications older than 30 days |
| `chat-archive` | Daily at 3AM | chat | Move messages older than 90 days to archive table |
| `reconciliation-daily` | Daily at 6AM | payment | Run daily gateway reconciliation |
| `store-rating-recalc` | Daily at 4AM | commerce | Recalculate store rating_avg from reviews |
| `product-rating-recalc` | Daily at 4AM | commerce | Recalculate product rating_avg from reviews |
| `video-moderation-poll` | Every 2 min (Phase 2) | video | Poll moderation API for scan results on pending videos |
| `video-view-count-flush` | Every 5 min (Phase 2) | video | Flush view counts from Redis to DB (batch write) |
| `video-auto-takedown` | Every 10 min (Phase 2) | video | Check videos with >5 reports in 1hr, auto-hide |

### 11.2 Escrow Auto-Release Job

```typescript
// escrow-auto-release.job.ts
async function runEscrowAutoRelease() {
  const result = await db.query(`
    SELECT id, store_id, subtotal, commission
    FROM orders
    WHERE status = 'delivered'
      AND delivered_at < NOW() - INTERVAL '${ESCROW_AUTO_RELEASE_HOURS} hours'
      AND id NOT IN (SELECT order_id FROM disputes WHERE status IN ('open', 'store_responded', 'in_mediation'))
  `);
  
  for (const order of result.rows) {
    await escrowService.release(order.id, {
      reason: 'auto_release',
      storePayout: order.subtotal - order.commission,
      commission: order.commission
    });
    
    await notificationService.send({
      userId: order.store_id,
      type: 'escrow_released',
      title: 'Payment released',
      body: `Escrow for order ${order.order_code} has been released to your wallet.`,
      channel: 'push'
    });
  }
  
  logger.info(`Escrow auto-release: processed ${result.rows.length} orders`);
}
```

### 11.3 Ranking Refresh Job

```typescript
// ranking-refresh.job.ts
async function runRankingRefresh() {
  const config = await rankingConfigService.getActiveConfig();
  
  // Recompute scores for all active products
  await db.query(`
    UPDATE ranking_signals rs
    SET 
      composite_score = 
        ${config.w_location} * rs.location_score +
        ${config.w_price} * rs.price_score +
        ${config.w_quality} * rs.quality_score +
        ${config.w_rating} * rs.rating_score +
        ${config.w_popularity} * rs.popularity_score +
        ${config.w_freshness} * rs.freshness_score +
        ${config.w_behavior} * rs.behavior_score +
        ${config.w_stock} * rs.stock_score,
      computed_at = NOW()
    FROM products p
    WHERE rs.product_id = p.id AND p.is_active = TRUE AND p.deleted_at IS NULL
  `);
  
  // Update individual signal scores that need periodic recalculation
  // (popularity: based on recent views/purchases, freshness: decays over time)
  
  logger.info('Ranking signals refreshed', { configName: config.name });
}
```

### 11.4 Job Infrastructure

| Environment | Runner |
|---|---|
| Development | node-cron (in-process) |
| Staging | Firebase Cloud Scheduler → Cloud Functions |
| Production | Firebase Cloud Scheduler → Cloud Functions (with retry + dead-letter) |

```
Firebase Cloud Scheduler
    │
    ├── HTTP trigger → Cloud Function endpoint (authenticated via service account)
    │       │
    │       └── Express route: POST /internal/jobs/{job_name}
    │               ├── Verify internal auth token (not JWT)
    │               ├── Execute job
    │               ├── Log result
    │               └── Return 200 (success) or 500 (retry)
    │
    └── Retry policy: max 3 attempts, exponential backoff
```

---

## 12. Third-Party Integrations

### 12.1 Payment Gateways

#### 12.1.1 Flutterwave Client

```typescript
// gateways/flutterwave.ts
import axios from 'axios';

const client = axios.create({
  baseURL: 'https://api.flutterwave.com/v3',
  headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}` },
  timeout: 30000
});

export const flutterwave = {
  // Charge via mobile money
  async chargeMoMo(amount: number, currency: string, phone: string, txRef: string, order_id: string) {
    const response = await client.post('/charges?type=momo', {
      amount, currency, phonenumber: phone,
      tx_ref: txRef,
      redirect_url: `${BASE_URL}/webhooks/flutterwave`,
      meta: { order_id }
    });
    return response.data;
  },
  
  // Charge via card
  async chargeCard(amount: number, currency: string, customer: { email, phone }, txRef: string, order_id: string) {
    const response = await client.post('/charges', {
      amount, currency,
      tx_ref: txRef,
      customer,
      redirect_url: `${BASE_URL}/webhooks/flutterwave`,
      payment_options: 'card',
      meta: { order_id }
    });
    return response.data;
  },
  
  // Verify transaction
  async verifyTransaction(id: number) {
    const response = await client.get(`/transactions/${id}/verify`);
    return response.data;
  },
  
  // Transfer (payout)
  async transfer(amount: number, currency: string, recipient: { bank_code, account_number }, reference: string) {
    const response = await client.post('/transfers', {
      amount, currency,
      bank_code: recipient.bank_code,
      account_number: recipient.account_number,
      reference,
      narration: 'Wunabuy store payout'
    });
    return response.data;
  },
  
  // Get settlements (reconciliation)
  async getSettlements(from: string, to: string) {
    const response = await client.get('/settlements', { params: { from, to } });
    return response.data;
  }
};
```

#### 12.1.2 Paystack Client

Same interface, different API calls. Implements `PaymentGatewayInterface` so the payment service can switch between gateways seamlessly.

```typescript
// gateways/payment-gateway.interface.ts
interface PaymentGateway {
  chargeMoMo(...args): Promise<PaymentResult>;
  chargeCard(...args): Promise<PaymentResult>;
  verifyTransaction(id: string): Promise<VerificationResult>;
  transfer(...args): Promise<TransferResult>;
  getSettlements(from: string, to: string): Promise<Settlement[]>;
}
```

### 12.2 Google Maps Integration

```typescript
// route.service.ts
async function getRoute(origin: {lat, lng}, destination: {lat, lng}): Promise<{
  distance_km: number;
  duration_min: number;
  polyline: string;
}> {
  const response = await axios.get(GOOGLE_MAPS_DIRECTIONS_URL, {
    params: {
      origin: `${origin.lat},${origin.lng}`,
      destination: `${destination.lat},${destination.lng}`,
      key: GOOGLE_MAPS_API_KEY,
      mode: 'driving'
    }
  });
  
  const route = response.data.routes[0].legs[0];
  return {
    distance_km: route.distance.value / 1000,
    duration_min: route.duration.value / 60,
    polyline: response.data.routes[0].overview_polyline.points
  };
}

// fee-calculator.service.ts
async function calculateDeliveryFee(distance_km: number, vehicleType: 'bike' | 'car' | 'van'): Promise<number> {
  const config = await configService.get('delivery_base_rate');
  const perKmConfig = await configService.get('delivery_per_km_rate');
  const multipliers = await configService.get('delivery_vehicle_multipliers');
  
  const base = parseFloat(config.value);
  const perKm = parseFloat(perKmConfig.value);
  const multiplier = multipliers.value[vehicleType] || 1.0;
  
  return Math.round((base + (distance_km * perKm)) * multiplier);
}
```

### 12.3 SMS (Africa's Talking)

```typescript
// sms.service.ts
async function sendSMS(phone: string, message: string): Promise<void> {
  const response = await axios.post('https://api.africastalking.com/version1/messaging', 
    new URLSearchParams({
      username: 'wunabuy',
      to: phone,
      message,
      from: process.env.AFRICAS_TALKING_SENDER_ID
    }),
    {
      headers: {
        'apiKey': process.env.AFRICAS_TALKING_API_KEY,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );
  
  if (response.data.SMSMessageData.recipients[0].status !== 'Success') {
    logger.error('SMS send failed', { phone, response: response.data });
    // Fallback to Twilio
    await twilioFallback.sendSMS(phone, message);
  }
}
```

### 12.4 Push Notifications

```typescript
// push.service.ts
import admin from 'firebase-admin';

admin.initializeApp({ credential: admin.credential.applicationDefault() });

async function sendPushNotification(params: {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}): Promise<void> {
  const user = await db.query('SELECT fcm_token, apns_token FROM users WHERE id = $1', [params.userId]);
  
  if (user.rows[0].fcm_token) {
    await admin.messaging().send({
      token: user.rows[0].fcm_token,
      notification: { title: params.title, body: params.body },
      data: params.data,
      android: { priority: 'high' }
    });
  }
  // APNs handling for iOS if apns_token is set
}
```

### 12.5 Video CDN (Mux) — Phase 2

```typescript
// video-upload.service.ts
import Mux from '@mux/mux-node';

const mux = new Mux(process.env.MUX_TOKEN_ID, process.env.MUX_TOKEN_SECRET);

async function createVideoAsset(uploadUrl: string): Promise<{
  playbackId: string;
  thumbnailUrl: string;
  duration: number;
}> {
  const asset = await mux.video.assets.create({
    input: uploadUrl,
    playback_policy: 'public',
    mp4_support: 'standard'  // for fallback download
  });
  
  return {
    playbackId: asset.playback_ids[0].id,
    thumbnailUrl: `https://image.mux.com/${asset.playback_ids[0].id}/thumbnail.jpg`,
    duration: asset.duration
  };
}
```

---

## 13. Error Handling, Logging & Monitoring

### 13.1 Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ORDER_NOT_FOUND",
    "message": "Order not found",
    "details": { "order_id": "uuid" },
    "request_id": "req_abc123"
  }
}
```

### 13.2 Error Code Registry

| Code | HTTP Status | Description |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Input validation failed (Zod) |
| `INVALID_CREDENTIALS` | 401 | Wrong phone/password/OTP |
| `TOKEN_EXPIRED` | 401 | JWT access token expired |
| `TOKEN_INVALID` | 401 | JWT signature invalid or refresh revoked |
| `MFA_REQUIRED` | 401 | MFA verification needed |
| `FORBIDDEN` | 403 | Insufficient permissions (RBAC) |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | State conflict (e.g., order already confirmed) |
| `RATE_LIMITED` | 429 | Too many requests |
| `PAYMENT_GATEWAY_ERROR` | 502 | Payment gateway returned error |
| `MAPS_API_ERROR` | 502 | Google Maps API error |
| `SMS_GATEWAY_ERROR` | 502 | SMS provider error |
| `VIDEO_PROCESSING_ERROR` | 500 | Video transcoding failed |
| `MODERATION_API_ERROR` | 502 | Content moderation API error |
| `INSUFFICIENT_BALANCE` | 400 | Wallet balance insufficient for payout |
| `ESCROW_FROZEN` | 409 | Escrow is frozen due to dispute |
| `KYC_NOT_APPROVED` | 403 | Store KYC not approved |
| `STORE_SUSPENDED` | 403 | Store is suspended |
| `IDEMPOTENCY_CONFLICT` | 409 | Same idempotency key with different request body |
| `INTERNAL_ERROR` | 500 | Unhandled server error |

### 13.3 Error Handling Middleware

```typescript
// error.middleware.ts
import { AppError, ValidationError, AuthError, NotFoundError, ConflictError } from '../shared/errors';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const requestId = req.id; // from request-logger middleware
  
  if (err instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message,
        details: err.details,
        request_id: requestId
      }
    });
  }
  
  if (err instanceof AuthError) {
    return res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message, request_id: requestId }
    });
  }
  
  if (err instanceof NotFoundError) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: err.message, request_id: requestId }
    });
  }
  
  if (err instanceof ConflictError) {
    return res.status(409).json({
      success: false,
      error: { code: err.code || 'CONFLICT', message: err.message, request_id: requestId }
    });
  }
  
  // Unhandled errors
  logger.error({ err, requestId, path: req.path, method: req.method }, 'Unhandled error');
  Sentry.captureException(err);
  
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      request_id: requestId
    }
  });
}
```

### 13.4 Structured Logging

```typescript
// pino configuration
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label })
  },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      headers: { 'user-agent': req.headers['user-agent'] }
    }),
    res: (res) => ({ statusCode: res.statusCode })
  },
  // In production: log to stdout (collected by logging service)
  // In development: pino-pretty for readable output
});

// Usage:
logger.info({ orderId, userId }, 'Order created');
logger.warn({ orderId, reason }, 'Order acknowledge timeout');
logger.error({ err, orderId }, 'Payment processing failed');
```

### 13.5 Health Checks

```
GET /health
{
  "status": "healthy",
  "services": {
    "database": "up",
    "redis": "up",
    "payment_gateway": "up",
    "maps_api": "up",
    "sms_gateway": "up"
  },
  "uptime_seconds": 86400,
  "version": "1.0.0"
}

GET /health/ready    # Kubernetes readiness probe
GET /health/live     # Kubernetes liveness probe
```

### 13.6 Monitoring

| Metric | Tool | Alert Threshold |
|---|---|---|
| API p95 latency | Sentry Performance | > 500ms |
| Error rate | Sentry | > 1% of requests |
| Database connection pool | Supabase dashboard | > 80% utilization |
| Redis memory | Redis INFO | > 80% |
| Payment gateway response time | Custom (axios interceptor) | > 10s |
| WebSocket connections | Supabase Realtime dashboard | > 80% of plan limit |
| Cron job failures | Firebase Functions logs | Any failure |
| Escrow stuck orders | Custom query + alert | Orders in 'delivered' > 72h without release |

---

## 14. Deployment, CI/CD & Testing

### 14.1 Environments

| Environment | Purpose | Database | Backend | Mobile |
|---|---|---|---|---|
| `local` | Developer machine | Local Postgres + Redis | Node.js direct | Expo dev client |
| `dev` | Integration testing | Supabase dev project | Firebase Functions (dev) | Internal TestFlight / Play Internal |
| `staging` | Pre-production | Supabase staging project | Firebase Functions (staging) | TestFlight / Play Internal |
| `production` | Live | Supabase production project | Firebase Functions (prod) | App Store / Play Store |

### 14.2 CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/backend-ci.yml
name: Backend CI

on:
  pull_request:
    paths: ['wunabuy-backend/**']
  push:
    branches: [main, develop]
    paths: ['wunabuy-backend/**']

jobs:
  lint-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: cd wunabuy-backend && npm ci
      - run: cd wunabuy-backend && npm run lint
      - run: cd wunabuy-backend && npm run typecheck

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgis/postgis:15-3.4
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: wunabuy_test
        ports: ['5432:5432']
      redis:
        image: redis:7
        ports: ['6379:6379']
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: cd wunabuy-backend && npm ci
      - run: cd wunabuy-backend && npm run migrate:test
      - run: cd wunabuy-backend && npm run test:unit
      - run: cd wunabuy-backend && npm run test:integration
      - run: cd wunabuy-backend && npm run test:coverage

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: cd wunabuy-backend && npm audit --audit-level=high
      - name: Run Snyk
        uses: snyk/actions/node@master
        with:
          args: --severity-threshold=high
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  deploy-staging:
    needs: [lint-typecheck, test, security-scan]
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Firebase (staging)
        run: cd wunabuy-backend && npx firebase deploy --only functions --project staging
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_STAGING_TOKEN }}

  deploy-production:
    needs: [lint-typecheck, test, security-scan]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production  # requires manual approval
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Firebase (production)
        run: cd wunabuy-backend && npx firebase deploy --only functions --project production
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_PROD_TOKEN }}
      - name: Run migrations
        run: cd wunabuy-backend && npm run migrate:prod
        env:
          DATABASE_URL: ${{ secrets.PROD_DATABASE_URL }}
```

### 14.3 Database Migration Strategy

```
Migrations are versioned SQL files in supabase/migrations/
  - Applied in order (001, 002, ...)
  - Each migration is idempotent where possible
  - Destructive migrations (DROP, ALTER) require explicit team review
  - Applied via: npm run migrate:{env}
  - Rollback: manual SQL script (no auto-rollback in production)

Migration rules:
  1. Never edit a migration that has been applied to staging or production
  2. New migration file for every schema change
  3. Test migration on dev → staging → production
  4. Backup database before production migration
  5. Long-running migrations (ALTER TABLE on large tables) run during maintenance window
```

### 14.4 Testing Strategy

| Test Type | Scope | Tool | Coverage Target |
|---|---|---|---|
| Unit | Service functions, utilities, pure logic | Jest | 80% of critical modules |
| Integration | API endpoints with test database | Jest + Supertest | All endpoints |
| E2E | Full flow: auth → search → order → pay → track → confirm | Jest + Supertest | Key user journeys |
| Load | API performance under concurrent load | k6 | Before each release |
| Security | Input validation, auth bypass, injection | Jest + custom | Before each release |

```
Key E2E test scenarios:
  1. Buyer registration → OTP → search → add to cart → checkout → pay (mock gateway) → 
     store acknowledges → transporter delivers → customer confirms → escrow released
  2. Store registration → KYC submission → staff approves → product upload → 
     order received → fulfillment → payout request → staff approves
  3. Buyer → chat with seller → share product → order from chat
  4. Dispute: customer opens → store responds → staff mediates → refund processed
  5. Staff login → MFA → dashboard access → RBAC enforcement (cannot access other dept)
  6. Video upload (Phase 2): seller uploads → moderation approved → published → 
     buyer watches → likes → follows → taps product → purchases
```

---

## 15. Appendices

### A. Order State Machine (Full)

```
                        ┌──────────────────┐
                        │  pending_payment  │
                        └────────┬─────────┘
                                 │
                    ┌────────────┼────────────┐
                    │ payment    │ payment    │ payment
                    │ success    │ timeout    │ failed
                    ▼            ▼            ▼
              ┌──────────┐ ┌──────────┐ ┌──────────┐
              │ paid_    │ │ cancelled│ │ cancelled│
              │ escrow   │ └──────────┘ └──────────┘
              └────┬─────┘
                   │ store acknowledges (2h timeout → cancelled + refund)
                   ▼
              ┌──────────┐
              │ preparing│
              └────┬─────┘
                   │ store marks ready
                   ▼
              ┌───────────────┐
              │ ready_for_    │
              │ pickup        │
              └────┬──────────┘
                   │ transporter accepts + picks up
                   ▼
              ┌──────────┐
              │ in_transit│
              └────┬─────┘
                   │ transporter delivers
                   ▼
              ┌──────────┐
              │ delivered │
              └────┬─────┘
              ┌────┼─────────────────────┐
              │    │ customer confirms   │ 48h auto-release
              │    ▼                     │ (no dispute)
              │ ┌──────────┐             │
              │ │ received │◄────────────┘
              │ └────┬─────┘
              │      │ escrow released
              │      ▼
              │ ┌──────────┐
              │ │ completed│
              │ └──────────┘
              │
              │ customer opens dispute
              ▼
         ┌──────────┐
         │ disputed │
         └────┬─────┘
              │ staff resolves
              ├── refund ──► refunded
              ├── partial ─► refunded (partial)
              └── store ──► received → completed
```

### B. Notification Templates

| Event | Channel | Template (EN) |
|---|---|---|
| `order.new` | push + in-app | "New order: {order_code} from {customer_name}. Total: {amount}" |
| `order.paid` | push + in-app | "Payment received for order {order_code}. {amount} held in escrow." |
| `order.acknowledge_timeout` | push + sms | "Order {order_code} was auto-cancelled. Store did not respond in time." |
| `order.in_transit` | push | "Your order {order_code} is on the way! Track your delivery." |
| `order.delivered` | push | "Your order {order_code} has been delivered. Please confirm receipt." |
| `order.escrow_released` | push + in-app | "Payment of {amount} released to your wallet for order {order_code}." |
| `kyc.approved` | push + sms | "Congratulations! Your store {store_name} is now verified on Wunabuy." |
| `kyc.rejected` | push + sms | "Your KYC submission was rejected. Reason: {reason}. You can resubmit." |
| `dispute.opened` | push + in-app | "A dispute has been opened for order {order_code}. Reason: {reason}." |
| `dispute.resolved` | push | "Dispute for order {order_code} resolved. Outcome: {resolution}." |
| `payout.approved` | push + in-app | "Your payout of {amount} has been approved and is processing." |
| `chat.new_message` | push | "{sender_name}: {message_preview}" |
| `video.new_from_followed` (Phase 2) | push | "{store_name} posted a new video. Watch now!" |
| `video.moderation_flagged` (Phase 2) | in-app | "Your video was flagged for review. We'll notify you once reviewed." |
| `staff.ticket_assigned` | web-push | "Ticket {ticket_code} assigned to you. Priority: {priority}." |
| `staff.kyc_new` | web-push | "New KYC submission from {store_name}. Review now." |

### C. API Rate Limits

| Endpoint Group | Rate Limit | Key |
|---|---|---|
| General API | 100 req/min | IP address |
| OTP send | 5 req/min | phone number |
| Auth login | 10 req/min | IP + phone/email |
| Chat messages | 30 msg/min | user ID |
| Video upload (Phase 2) | 5/hour | seller ID |
| Search | 60 req/min | user ID |
| Staff API | 200 req/min | staff ID |

### D. Environment Setup Checklist (New Developer)

```
1. Install Node.js 20 LTS
2. Install PostgreSQL 15 + PostGIS (or use Supabase local)
3. Install Redis 7
4. Clone repo: git clone https://github.com/forku-brandon/wunabuy-backend.git
5. npm install
6. Copy .env.example → .env, fill in values
7. npm run migrate:local
8. npm run seed:local
9. npm run dev  (starts Express + node-cron jobs)
10. npm run test  (verify setup)
```

---

## Document Control

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-07-25 | Agemo Technologies | Initial backend technical specification — full document |

---

*End of Document*
