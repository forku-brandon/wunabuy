# Wunabuy — Backend Technical Specification (Laravel 13 Version)

**Document Version:** 1.0 (Laravel Architecture Revision)  
**Date:** August 25, 2026  
**Status:** Approved  
**Companion Documents:** Wunabuy SRS v1.2, Wunabuy PRD v1.0  
**Framework:** Laravel 13 (PHP 8.3+)  

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Database Design](#4-database-design)
5. [API Specification](#5-api-specification)
6. [Authentication, Authorization & Security](#6-authentication-authorization--security)
7. [Real-Time Services (Laravel Reverb)](#7-real-time-services-laravel-reverb)
8. [Payment, Escrow & Wallet System](#8-payment-escrow--wallet-system)
9. [File & Media Handling](#9-file--media-handling)
10. [Video Pipeline (Phase 2)](#10-video-pipeline-phase-2)
11. [Background Jobs & Scheduled Tasks (Laravel Horizon)](#11-background-jobs--scheduled-tasks-laravel-horizon)
12. [Third-Party Integrations](#12-third-party-integrations)
13. [Error Handling, Logging & Monitoring](#13-error-handling-logging--monitoring)
14. [Deployment, CI/CD & Testing](#14-deployment-cicd--testing)
15. [Appendices](#15-appendices)

---

## 1. Architecture Overview

### 1.1 Architecture Pattern

Wunabuy uses a **Modular Monolith** backend pattern powered by **Laravel 13**. Public API ingress is handled by Nginx / API Gateway for TLS termination, request routing, rate limiting, and HTTP/WebSocket dispatching. The application logic is organized into discrete domain modules managed via `nwidart/laravel-modules`. This structure ensures clear boundaries while avoiding microservice complexity. Modules communicate through internal PHP service calls or Laravel Event Broadcasting.

```
+------------------------------------------------------------------------------------+
|                              WUNABUY BACKEND TOPOLOGY                              |
|                                                                                    |
|  +--------------------------------------------------------------------------+    |
|  | Nginx / API Gateway                                                      |    |
|  | - TLS termination & HSTS                                                |    |
|  | - Request routing and rate limiting                                     |    |
|  | - REST ingress (/api/v1/* and /api/v1/staff/*)                         |    |
|  | - WebSocket ingress (/app/* via Laravel Reverb)                         |    |
|  +--------------------------┬-----------------------------------------------+    |
|                             │                                                   |
|                             ▼                                                   |
|  +--------------------------------------------------------------------------+    |
|  | Laravel 13 Application (Modular Monolith)                                |    |
|  | - Auth, Commerce, Payment, Delivery, Chat, KYC, Staff, Search, Video   |    |
|  | - Controllers, Form Requests, Eloquent ORM, Service Layer               |    |
|  | - Spatie RBAC Middleware, State Machine, Transaction Engine             |    |
|  +--------------------------┬-----------------------------------------------+    |
|                             │                                                   |
|                             ▼                                                   |
|  +--------------------------------------------------------------------------+    |
|  | Operational Data & Event Plane                                           |    |
|  | - PostgreSQL 15 + PostGIS (Spatial indexing & JSONB storage)            |    |
|  | - Redis 7 (Cache, Session blacklist, Queue backplane)                    |    |
|  | - Laravel Reverb (High-performance native WebSockets)                    |    |
|  | - Laravel Flysystem (AWS S3 / Supabase Storage driver)                   |    |
|  +--------------------------------------------------------------------------+    |
|                                                                                    |
|  +--------------------------------------------------------------------------+    |
|  | Async Processing & Daemon Workers                                        |    |
|  | - Laravel Horizon Daemon Workers (Escrow timers, Webhooks, Payouts)      |    |
|  | - Laravel Scheduler (Ranking refresh, daily reconciliation, cleanup)      |    |
|  +--------------------------------------------------------------------------+    |
+------------------------------------------------------------------------------------+
```

### 1.2 Architecture Alignment Statement

The architecture is intentionally structured to preserve existing API contracts:
- Nginx / API Gateway handles public ingress, TLS, and protocol routing.
- Laravel 13 owns domain logic and module boundaries via `nwidart/laravel-modules`.
- PostgreSQL 15 + PostGIS + Redis 7 form the operational data plane.
- Realtime messaging and tracking use Laravel Reverb WebSocket channels (`chat.{id}`, `order.{id}`, `tracking.{id}`).
- Background tasks run asynchronously via Laravel Horizon daemon workers backed by Redis queues.

### 1.3 Module Inventory

| Module | Domain | Description |
|---|---|---|
| **Auth** | Identity | Registration, phone OTP, Sanctum API tokens, password reset, staff TOTP MFA |
| **Commerce** | Products & Orders | Products, categories, cart management, checkout, order lifecycle state machine |
| **Payment** | Money | Flutterwave/Paystack integration, escrow engine, wallets, payouts, reconciliation |
| **Delivery** | Logistics | Transporter jobs, GPS tracking, route optimization, delivery fee calculation |
| **Chat** | Messaging | Conversations, messages, group chat, media, interactive cards, moderation |
| **KYC** | Verification | Store KYC submission, document storage, staff review workflow |
| **Search** | Discovery | PostGIS spatial search, `TSVECTOR` full-text search, Smart Discovery ranking |
| **Video** | Content (Phase 2) | Video upload, Mux transcoding, For You feed, shoppable overlays, moderation |
| **Staff** | Internal Ops | Staff Sanctum auth, Spatie RBAC, audit log hash chain, platform config |
| **Notification** | Comms | FCM/APNs push, Africa's Talking/Twilio SMS, SendGrid email, in-app notifications |

### 1.4 Request Flow

```
Client (Mobile/Web)
    │
    ▼
Nginx Gateway (HTTPS / WSS)
    │
    ├── REST request ──▶ Route Dispatcher (Laravel 13)
    │                        │
    │                        ├── Form Request Validation
    │                        ├── Authenticate (Sanctum Middleware)
    │                        ├── Authorize (Spatie Permission Middleware)
    │                        ├── Domain Service Execution
    │                        │      ├── Read/Write PostgreSQL (Eloquent)
    │                        │      ├── Dispatch Notification (Queue)
    │                        │      └── Emit Laravel Events
    │                        └── Return JSON Response Envelope
    │
    └── WebSocket ──▶ Laravel Reverb Server
                         │
                         ├── Channel: chat.{conversation_id}
                         ├── Channel: order.{order_id}
                         ├── Channel: tracking.{delivery_id}
                         └── Channel: staff.notifications.{staff_id}
```

### 1.5 Design Principles

| Principle | Application |
|---|---|
| Single Responsibility | Each module in `Modules/` owns its models, services, form requests, and routes. |
| Service Pattern | Controllers delegate business logic to dedicated Service classes. |
| Event-Driven Side Effects | Notifications, ranking signals, and audit logging are triggered via Laravel Events/Listeners. |
| Idempotency | Payment and order state mutation endpoints accept `Idempotency-Key` headers. |
| Auditability | Every staff mutation or money movement writes to a SHA-256 hash-chained audit log. |
| Graceful Degradation | External service failures (payment gateways, SMS, maps) produce structured API errors. |

---

## 2. Technology Stack

### 2.1 Core Stack

| Component | Technology | Version | Rationale |
|---|---|---|---|
| Framework | Laravel | 13.x | Industry-standard PHP framework with modern features |
| Runtime | PHP | 8.3+ / 8.4 | High-performance JIT execution, strict typing |
| Web Server | Nginx | 1.24+ | Reverse proxy, TLS termination, static asset serving |
| Database | PostgreSQL | 15+ | Relational data, PostGIS geo extension, JSONB, full-text search |
| Cache & Queue | Redis | 7.x | Caching, session blacklist, queue backend for Horizon |
| WebSockets | Laravel Reverb | Latest | Official high-performance native Laravel WebSocket server |
| Queue Manager | Laravel Horizon | Latest | Real-time queue metrics and process supervisor for Redis queues |
| API Auth | Laravel Sanctum | Latest | Lightweight token authentication for mobile and SPA applications |
| Staff RBAC | Spatie Laravel-Permission | Latest | Department and role-level permission matrix for Staff Portal |
| Storage Driver | Laravel Flysystem | Latest | S3 / Supabase Storage driver integration for media assets |
| Video CDN (Phase 2) | Mux SDK | Latest | Managed transcoding, adaptive HLS bitrate streaming |

### 2.2 Environment Variables (`.env`)

```bash
APP_NAME=Wunabuy
APP_ENV=production
APP_KEY=base64:...
APP_DEBUG=false
APP_URL=https://api.wunabuy.com

# ─── Database ───
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=wunabuy
DB_USERNAME=postgres
DB_PASSWORD=secret

# ─── Redis ───
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# ─── Laravel Reverb ───
REVERB_APP_ID=wunabuy_reverb
REVERB_APP_KEY=reverb_key_xxx
REVERB_APP_SECRET=reverb_secret_xxx
REVERB_HOST=0.0.0.0
REVERB_PORT=8080
REVERB_SCHEME=https

# ─── Sanctum & Auth ───
SANCTUM_STATEFUL_DOMAINS=app.wunabuy.com,staff.wunabuy.com
OTP_TTL=300
OTP_MAX_ATTEMPTS=5

# ─── Payment ───
FLUTTERWAVE_SECRET_KEY=FLWSECK-...
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-...
FLUTTERWAVE_HASH=flw_webhook_hash_xxx
PAYSTACK_SECRET_KEY=sk_live_...
PAYSTACK_PUBLIC_KEY=pk_live_...
PAYSTACK_HASH=paystack_webhook_hash_xxx
ESCROW_AUTO_RELEASE_HOURS=48
PLATFORM_COMMISSION_DEFAULT=10.0

# ─── Google Maps ───
GOOGLE_MAPS_API_KEY=AIzaSy...

# ─── SMS ───
AFRICAS_TALKING_USERNAME=wunabuy
AFRICAS_TALKING_API_KEY=atsk_...
AFRICAS_TALKING_SENDER_ID=WUNABUY
TWILIO_SID=AC...
TWILIO_AUTH_TOKEN=...

# ─── Push & Email ───
FCM_SERVER_KEY=AAAA...
SENDGRID_API_KEY=SG....
MAIL_FROM_ADDRESS=noreply@wunabuy.com

# ─── Video (Phase 2) ───
MUX_TOKEN_ID=...
MUX_TOKEN_SECRET=...

# ─── Monitoring ───
SENTRY_LARAVEL_DSN=https://...
```

---

## 3. Project Structure

```
wunabuy-backend-laravel/
├── app/
│   ├── Console/Commands/                # Custom Artisan commands
│   ├── Exceptions/Handler.php          # Centralized error response envelope
│   ├── Http/Middleware/                # Rate limit, Idempotency, IP Allowlist
│   └── Providers/                      # App, Event, Horizon, Broadcast Providers
│
├── Modules/                             # nwidart/laravel-modules layout
│   ├── Auth/
│   │   ├── Http/Controllers/
│   │   ├── Http/Requests/
│   │   ├── Services/
│   │   └── Routes/api.php
│   ├── Commerce/
│   │   ├── Models/ Product.php, Order.php, OrderItem.php, Cart.php
│   │   ├── StateMachines/ OrderStateMachine.php
│   │   ├── Services/
│   │   └── Routes/api.php
│   ├── Payment/
│   │   ├── Models/ Wallet.php, Transaction.php, Payout.php
│   │   ├── Services/ EscrowService.php, WalletService.php, PayoutService.php
│   │   ├── Gateways/ FlutterwaveGateway.php, PaystackGateway.php
│   │   └── Routes/api.php
│   ├── Delivery/
│   │   ├── Services/ DeliveryJobService.php, RouteService.php
│   │   └── Routes/api.php
│   ├── Chat/
│   │   ├── Models/ Conversation.php, Message.php
│   │   ├── Services/ ChatService.php
│   │   └── Routes/api.php
│   ├── KYC/
│   │   ├── Services/ KycReviewService.php
│   │   └── Routes/api.php
│   ├── Search/
│   │   ├── Services/ SmartRankingService.php, GeoSearchService.php
│   │   └── Routes/api.php
│   ├── Video/                           # Phase 2
│   │   ├── Services/ MuxVideoService.php, ForYouAlgorithmService.php
│   │   └── Routes/api.php
│   ├── Staff/
│   │   ├── Models/ StaffAccount.php, AuditLog.php
│   │   ├── Observers/ AuditLogObserver.php
│   │   └── Routes/api.php
│   └── Notification/
│       ├── Services/ PushService.php, SmsService.php, EmailService.php
│       └── Routes/api.php
│
├── config/                              # Horizon, Reverb, Sanctum, Permission
├── database/
│   ├── migrations/                      # PostgreSQL DDL migrations
│   └── seeders/
├── routes/
│   ├── api.php                          # /api/v1 router loading module routes
│   └── channels.php                     # Reverb WebSocket authorization channels
├── composer.json
├── Dockerfile
└── phpunit.xml
```

---

## 4. Database Design

### 4.1 Overview & Schema Integrity
- **Engine**: PostgreSQL 15+ with `postgis`, `pg_trgm`, `uuid-ossp` extensions.
- **Primary Keys**: UUID v4 (`$table->uuid('id')->primary()`).
- **Soft Deletes**: `$table->softDeletes()` (`deleted_at` timestamp).
- **Timezone**: UTC stored as `TIMESTAMPTZ`.

### 4.2 Core Migrations DDL

#### Users & User Addresses
```php
Schema::create('users', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('phone')->unique();
    $table->string('email')->nullable()->unique();
    $table->string('full_name');
    $table->string('password')->nullable();
    $table->string('role')->default('buyer'); // buyer, seller, transporter
    $table->string('status')->default('active');
    $table->string('avatar_url')->nullable();
    $table->jsonb('default_address')->nullable();
    $table->boolean('is_phone_verified')->default(false);
    $table->string('fcm_token')->nullable();
    $table->string('apns_token')->nullable();
    $table->timestamp('last_login_at')->nullable();
    $table->softDeletes();
    $table->timestamps();
});

Schema::create('user_addresses', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
    $table->string('label');
    $table->decimal('latitude', 10, 7);
    $table->decimal('longitude', 10, 7);
    $table->text('address_text');
    $table->string('city')->nullable();
    $table->boolean('is_default')->default(false);
    $table->timestamps();
});
```

#### Stores & Products
```php
Schema::create('stores', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->foreignUuid('owner_id')->constrained('users')->cascadeOnDelete();
    $table->string('store_name');
    $table->text('description')->nullable();
    $table->string('category');
    $table->geometry('location', subtype: 'point', srid: 4326); // PostGIS Point
    $table->text('address_text');
    $table->decimal('rating_avg', 2, 1)->default(0.0);
    $table->integer('total_reviews')->default(0);
    $table->string('kyc_status')->default('pending');
    $table->jsonb('kyc_documents')->nullable();
    $table->decimal('commission_rate', 5, 2)->default(10.00);
    $table->boolean('is_active')->default(true);
    $table->boolean('is_suspended')->default(false);
    $table->softDeletes();
    $table->timestamps();
});

Schema::create('products', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->foreignUuid('store_id')->constrained('stores')->cascadeOnDelete();
    $table->string('name', 500);
    $table->text('description')->nullable();
    $table->string('category');
    $table->decimal('price', 12, 2);
    $table->string('currency', 3)->default('XAF');
    $table->integer('quantity')->default(0);
    $table->string('quality_tier')->default('new');
    $table->jsonb('images')->default('[]');
    $table->boolean('is_active')->default(true);
    $table->decimal('rating_avg', 2, 1)->default(0.0);
    $table->softDeletes();
    $table->timestamps();
});
```

#### Orders & Order Items
```php
Schema::create('orders', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('order_code', 20)->unique();
    $table->foreignUuid('customer_id')->constrained('users');
    $table->foreignUuid('store_id')->constrained('stores');
    $table->foreignUuid('transporter_id')->nullable()->constrained('users');
    $table->string('status')->default('pending_payment');
    $table->jsonb('items_json');
    $table->decimal('subtotal', 12, 2);
    $table->decimal('delivery_fee', 12, 2)->default(0);
    $table->decimal('commission', 12, 2)->default(0);
    $table->decimal('total', 12, 2);
    $table->string('currency', 3)->default('XAF');
    $table->string('payment_method')->nullable();
    $table->string('payment_ref')->nullable();
    $table->jsonb('delivery_address');
    $table->jsonb('tracking_data')->nullable();
    $table->jsonb('status_history')->default('[]');
    $table->timestamp('expires_at')->nullable();
    $table->timestamp('delivered_at')->nullable();
    $table->timestamp('completed_at')->nullable();
    $table->timestamps();
});
```

#### Wallets & Transactions
```php
Schema::create('wallets', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->foreignUuid('user_id')->unique()->constrained('users')->cascadeOnDelete();
    $table->decimal('balance_escrow', 12, 2)->default(0.00);
    $table->decimal('balance_available', 12, 2)->default(0.00);
    $table->decimal('total_earned', 12, 2)->default(0.00);
    $table->decimal('total_payout', 12, 2)->default(0.00);
    $table->string('currency', 3)->default('XAF');
    $table->timestamps();
});

Schema::create('transactions', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('transaction_code', 30)->unique();
    $table->foreignUuid('wallet_id')->constrained('wallets')->cascadeOnDelete();
    $table->foreignUuid('order_id')->nullable()->constrained('orders');
    $table->string('type'); // payment_received, escrow_hold, escrow_release, payout, refund
    $table->decimal('amount', 12, 2);
    $table->decimal('balance_after', 12, 2);
    $table->string('reference')->nullable();
    $table->text('description')->nullable();
    $table->timestamps();
});
```

#### Audit Log Hash Chain Table
```php
Schema::create('audit_log', function (Blueprint $table) {
    $table->id();
    $table->foreignUuid('staff_id')->nullable()->constrained('staff_accounts');
    $table->string('action');
    $table->string('entity_type');
    $table->uuid('entity_id')->nullable();
    $table->jsonb('before_state')->nullable();
    $table->jsonb('after_state')->nullable();
    $table->ipAddress('ip_address')->nullable();
    $table->string('previous_hash', 64);
    $table->string('current_hash', 64);
    $table->timestamp('created_at')->useCurrent();
});
```

---

## 5. API Specification

### 5.1 Standard Response Envelopes

```json
// Success Response (200 / 201)
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

// Error Response (4xx / 5xx)
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The given data was invalid.",
    "details": { "phone": ["The phone field is required."] },
    "request_id": "req_66cc8a12b"
  }
}
```

### 5.2 Key API Endpoint Contracts

- **`POST /api/v1/auth/register`**: `{ phone, full_name, role }` ➔ Returns `{ user_id, otp_sent }`
- **`POST /api/v1/auth/verify-otp`**: `{ phone, otp }` ➔ Returns `{ access_token, user }`
- **`GET /api/v1/products`**: Query params `?search=&category=&lat=&lng=&radius_km=` ➔ Returns paginated list
- **`POST /api/v1/orders`**: `{ items: [{product_id, quantity}], delivery_address_id, payment_method }` ➔ Returns created order
- **`POST /api/v1/payments/charge`**: `{ order_id, method, phone }` ➔ Returns gateway reference
- **`GET /api/v1/wallet`**: Returns `{ balance_escrow, balance_available, total_earned }`
- **`POST /api/v1/wallet/payout`**: `{ amount, destination_details }` ➔ Creates payout request

---

## 6. Authentication, Authorization & Security

### 6.1 Mobile Sanctum Authentication Flow
1. User registers via `POST /api/v1/auth/register`.
2. Server dispatches 6-digit OTP stored in Redis (`otp:{phone}`, TTL: 300s).
3. User verifies OTP via `POST /api/v1/auth/verify-otp`.
4. Server issues a Sanctum PlainText API Token returned in response envelope.

### 6.2 Staff Authorization (Spatie RBAC + MFA)
- Staff authentication mandates email + password + TOTP code verification (`VerifyStaffMfa` middleware).
- Operations protected by Spatie permissions (e.g. `finance.approve_payouts`, `ops.review_kyc`).

---

## 7. Real-Time Services (Laravel Reverb)

Laravel Reverb manages high-throughput WebSockets:

```php
// routes/channels.php
Broadcast::channel('chat.{conversationId}', function ($user, $conversationId) {
    return $user->conversations()->where('conversations.id', $conversationId)->exists();
});

Broadcast::channel('order.{orderId}', function ($user, $orderId) {
    $order = Order::find($orderId);
    return $user->id === $order->customer_id || $user->id === $order->store->owner_id;
});

Broadcast::channel('tracking.{deliveryId}', function ($user, $deliveryId) {
    return true;
});
```

---

## 8. Payment, Escrow & Wallet System

### 8.1 Dual-Wallet Accounting
`balance_escrow` holds unconfirmed funds; `balance_available` holds cleared earnings.

```php
namespace Modules\Payment\Services;

use Modules\Commerce\Models\Order;
use Modules\Payment\Models\Wallet;
use Illuminate\Support\Facades\DB;

class EscrowService
{
    public function releaseEscrow(Order $order): void
    {
        DB::transaction(function () use ($order) {
            $wallet = Wallet::where('user_id', $order->store->owner_id)->lockForUpdate()->first();
            $storePayout = $order->subtotal - $order->commission;

            $wallet->balance_escrow -= $order->total;
            $wallet->balance_available += $storePayout;
            $wallet->total_earned += $storePayout;
            $wallet->save();

            $wallet->transactions()->create([
                'transaction_code' => 'TXN-' . strtoupper(str_random(10)),
                'order_id' => $order->id,
                'type' => 'escrow_release',
                'amount' => $storePayout,
                'balance_after' => $wallet->balance_available,
                'description' => "Escrow release for order {$order->order_code}",
            ]);
        });
    }
}
```

---

## 9. File & Media Handling

Images and KYC files uploaded via Laravel Flysystem to AWS S3 or Supabase Storage:
- Product images generate 200px thumbnails, 800px display, and 1200px full size via Intervention Image.
- KYC files stored with AES-256 encryption; accessible only via temporary signed URLs (60s expiry).

---

## 10. Video Pipeline (Phase 2)

- Seller uploads raw MP4 ➔ Processed by Mux SDK for HLS streaming (`.m3u8`).
- Content scanned via Google Cloud Video Intelligence API before setting status to `published`.
- For You feed scores videos by boosting followed stores (3x), preferred categories (2x), and recency (1.5x).

---

## 11. Background Jobs & Scheduled Tasks (Laravel Horizon)

```php
// app/Console/Kernel.php or routes/console.php
use Illuminate\Support\Facades\Schedule;
use Modules\Payment\Jobs\AutoReleaseEscrowJob;
use Modules\Search\Jobs\RefreshRankingSignalsJob;

Schedule::job(new AutoReleaseEscrowJob)->hourly();
Schedule::job(new RefreshRankingSignalsJob)->everySixHours();
Schedule::command('wunabuy:reconcile-gateways')->dailyAt('06:00');
```

---

## 12. Third-Party Integrations

- **Flutterwave / Paystack**: Integrated via dedicated `FlutterwaveService` & `PaystackService` implementing a common `PaymentGatewayInterface`.
- **Google Maps API**: Distance matrix & direction polyline calculation in `RouteService`.
- **SMS Gateways**: Africa's Talking with Twilio fallback in `SmsService`.

---

## 13. Error Handling, Logging & Monitoring

Centralized error handling in `app/Exceptions/Handler.php` captures all exceptions and formats standardized JSON error responses. Logged via Pino-compatible structured JSON format to Sentry.

---

## 14. Deployment, CI/CD & Testing

### GitHub Actions Pipeline (`.github/workflows/laravel-ci.yml`)

```yaml
name: Laravel 13 CI/CD

on:
  push:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgis/postgis:15-3.4
        env:
          POSTGRES_DB: wunabuy_test
          POSTGRES_PASSWORD: test
        ports: [ 5432:5432 ]
      redis:
        image: redis:7
        ports: [ 6379:6379 ]

    steps:
      - uses: actions/checkout@v4
      - uses: shivammathur/setup-php@v2
        with:
          php-version: '8.3'
          extensions: mbstring, pdo_pgsql, postgis, redis
      - run: composer install
      - run: php artisan test
```

---

## 15. Appendices

### A. Order State Machine

```
pending_payment ──▶ paid_escrow ──▶ preparing ──▶ ready_for_pickup ──▶ in_transit ──▶ delivered ──▶ received ──▶ completed
       │               │
       ▼               ▼
   cancelled       cancelled / refunded
```

---
