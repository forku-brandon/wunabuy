# Wunabuy — Backend Technical Specification & API Contracts

**Document Version:** 1.4 (Production API Architecture Baseline)  
**Date:** August 28, 2026  
**Status:** Approved / In Production Use  
**Companion Documents:** Wunabuy SRS v1.7, Wunabuy PRD v1.7, Wunabuy Frontend Tech Spec v1.7  
**Framework:** Laravel 13 (PHP 8.3+)  
**Frontend Monorepo Targets:** `wunabuy-mobile` (Expo SDK 54), `@wunabuy/api-client`, `@wunabuy/types`, `@wunabuy/utils`

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [API Conventions & Response Schemas](#2-api-conventions--response-schemas)
3. [Authentication, Direct OTP & Role Governance Contracts](#3-authentication-direct-otp--role-governance-contracts)
4. [Home Feed, Multi-Image Products & Partner Contracts](#4-home-feed-multi-image-products--partner-contracts)
5. [Buyer Wallet & Mobile Money Engine Contracts](#5-buyer-wallet--mobile-money-engine-contracts)
6. [Orders, Escrow Engine & Checkout Payment Contracts](#6-orders-escrow-engine--checkout-payment-contracts)
7. [Real-Time Logistics & WebSocket Event Specifications](#7-real-time-logistics--websocket-event-specifications)
8. [User Profile, Settings & Role Switching API Contracts](#8-user-profile-settings--role-switching-api-contracts)
9. [Store & Transporter Onboarding & KYC API Contracts](#9-store--transporter-onboarding--kyc-api-contracts)
10. [Dynamic Promotions & Cart Banner API Contracts](#10-dynamic-promotions--cart-banner-api-contracts)
11. [Database Schema & PostGIS Spatial Extensions](#11-database-schema--postgis-spatial-extensions)
12. [Error Codes & Troubleshooting Matrix](#12-error-codes--troubleshooting-matrix)

---

## 1. Architecture Overview

### 1.1 Modular Monolith Topology
Wunabuy backend operates as a **Modular Monolith** built on **Laravel 13 (PHP 8.3+)** utilizing `nwidart/laravel-modules`. Ingress traffic is processed through Nginx with API Gateway TLS 1.3 termination, rate-limiting, and CORS handling.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          WUNABUY BACKEND TOPOLOGY                               │
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │ Nginx / API Gateway Ingress                                               │  │
│  │ - TLS 1.3 termination & HTTPS enforcement                                 │  │
│  │ - REST API Routing (/api/v1/* and /api/v1/staff/*)                       │  │
│  │ - WebSocket Ingress (/app/* via Laravel Reverb)                           │  │
│  └─────────────────────────────────────┬─────────────────────────────────────┘  │
│                                        │                                        │
│                                        ▼                                        │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │ Laravel 13 Application (Modular Monolith)                                 │  │
│  │ - Auth, Commerce, Wallet, Escrow, Delivery, Chat, KYC, Staff Modules      │  │
│  │ - Sanctum Token Middleware, Form Requests, Eloquent ORM                   │  │
│  └─────────────────────────────────────┬─────────────────────────────────────┘  │
│                                        │                                        │
│                                        ▼                                        │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │ Operational Data & Event Layer                                            │  │
│  │ - PostgreSQL 15 + PostGIS (Spatial indexing & JSONB storage)              │  │
│  │ - Redis 7 (Cache, Session blacklist, Queue backplane)                     │  │
│  │ - Laravel Reverb (High-performance native WebSockets)                     │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. API Conventions & Response Schemas

### 2.1 Base URL & Headers
All REST API endpoints are prefixed under `/api/v1`.

- **Base URL:** `https://api.wunabuy.com/api/v1`
- **Required Headers:**
  - `Content-Type: application/json`
  - `Accept: application/json`
  - `Authorization: Bearer <access_token>` (for authenticated endpoints)

### 2.2 Standard Success Response Envelope
```json
{
  "success": true,
  "data": {},
  "meta": {
    "timestamp": "2026-08-28T09:00:00Z",
    "request_id": "req_88492019"
  }
}
```

### 2.3 Standard Error Response Envelope
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please enter a valid 9-digit Cameroon phone number.",
    "details": {
      "phone": ["The phone number field must start with +237 or 6."]
    },
    "request_id": "req_88492020"
  }
}
```

---

## 3. Authentication & Direct OTP Endpoint Contracts

### 3.1 Send 6-Digit SMS OTP
- **Endpoint:** `POST /api/v1/auth/otp/send`
- **Rate Limit:** 5 requests per 10 minutes per IP/Phone.
- **Request Body:**
```json
{
  "phone": "+237670123456",
  "purpose": "login"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "phone": "+237670123456",
    "otp_sent": true,
    "expires_in_seconds": 300,
    "demo_code": "123456"
  }
}
```

### 3.2 Verify OTP & Direct Login
- **Endpoint:** `POST /api/v1/auth/otp/verify`
- **Request Body:**
```json
{
  "phone": "+237670123456",
  "otp": "123456"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "access_token": "1|sanctum_token_88492019...",
    "token_type": "Bearer",
    "user": {
      "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "phone": "+237670123456",
      "email": "jean.dupont@wunabuy.com",
      "full_name": "Jean Dupont",
      "role": "buyer",
      "status": "active",
      "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      "is_phone_verified": true,
      "available_roles": ["buyer"]
    }
  }
}
```

---

## 4. Home Feed & Partners Endpoint Contracts

### 4.1 Fetch Aggregated Home Feed
- **Endpoint:** `GET /api/v1/home/feed`
- **Access:** Public or Authenticated
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "hero_banners": [
      {
        "id": "hero_1",
        "tag": "100% ESCROW GUARANTEE",
        "title": "Shop with Total Peace of Mind",
        "subtitle": "Your payment is held safely until you inspect & confirm delivery.",
        "bg_color": "#0D9488",
        "image_url": "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80"
      }
    ],
    "partners": [
      {
        "id": "partner_1",
        "name": "MTN Mobile Money",
        "category": "Official MoMo Partner",
        "icon_name": "phone-portrait-outline",
        "icon_color": "#F59E0B",
        "badge": "1-Tap Cashout",
        "dial_code": "*126#"
      },
      {
        "id": "partner_2",
        "name": "Orange Money",
        "category": "Mobile Wallet Partner",
        "icon_name": "wallet-outline",
        "icon_color": "#F97316",
        "badge": "Instant Transfer",
        "dial_code": "#150*50#"
      },
      {
        "id": "partner_3",
        "name": "Flutterwave",
        "category": "PCI-DSS Escrow Gateway",
        "icon_name": "card-outline",
        "icon_color": "#0D9488",
        "badge": "Verified Gateway"
      },
      {
        "id": "partner_4",
        "name": "DHL Logistics",
        "category": "Regional Express Freight",
        "icon_name": "airplane-outline",
        "icon_color": "#E11D48",
        "badge": "Freight Partner"
      },
      {
        "id": "partner_5",
        "name": "Ecobank Cameroon",
        "category": "Bank Settlement Partner",
        "icon_name": "business-outline",
        "icon_color": "#2563EB",
        "badge": "Bank Partner"
      }
    ],
    "categories": [
      "All", "Skincare", "Makeup", "Fragrance", "Haircare", "Tools", "Offers"
    ],
    "best_sellers": [],
    "special_offer": {
      "eyebrow": "Special Offer",
      "title": "Up to 30% Off",
      "subtitle": "On selected beauty & verified essentials",
      "discount_percent": 30,
      "image_url": "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80"
    }
  }
}
```

---

## 5. Buyer Wallet & Mobile Money Engine Contracts

### 5.1 Fetch Wallet Balance & Escrow Metrics
- **Endpoint:** `GET /api/v1/wallet`
- **Access:** Authenticated (`Bearer <token>`)
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "wallet_id": "wal_99812039",
    "currency": "XAF",
    "balance_available": 47500,
    "balance_escrow_locked": 236000,
    "balance_total": 283500,
    "total_deposited": 500000,
    "total_spent": 216500,
    "is_active": true,
    "last_updated_at": "2026-08-28T08:50:00Z"
  }
}
```

### 5.2 Fetch Wallet Transactions (Paginated Ledger)
- **Endpoint:** `GET /api/v1/wallet/transactions`
- **Query Parameters:** `page=1`, `per_page=20`, `type` (`credit` | `debit`), `provider` (`mtn` | `orange`)
- **Access:** Authenticated
- **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "tx001",
      "type": "credit",
      "amount": 20000,
      "currency": "XAF",
      "description": "Wallet Top-Up via MTN MoMo",
      "provider": "mtn",
      "status": "completed",
      "reference": "WNB-MOMO-99120",
      "created_at": "2026-08-27T14:02:00Z"
    },
    {
      "id": "tx002",
      "type": "debit",
      "amount": 8500,
      "currency": "XAF",
      "description": "Escrow Payment — Order #WNB-00412",
      "provider": "mtn",
      "status": "completed",
      "reference": "WNB-ESC-00412",
      "created_at": "2026-08-26T09:18:00Z"
    }
  ],
  "meta": {
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total": 4,
      "has_more": false
    }
  }
}
```

### 5.3 Initiate Wallet Funding (Top-Up via Mobile Money)
- **Endpoint:** `POST /api/v1/wallet/fund`
- **Access:** Authenticated
- **Request Body:**
```json
{
  "provider": "mtn",
  "phone": "+237670123456",
  "amount": 25000,
  "currency": "XAF"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "transaction_id": "tx_fund_991203",
    "status": "pending_dial",
    "provider": "mtn",
    "phone": "+237670123456",
    "amount": 25000,
    "currency": "XAF",
    "dial_code": "*126#",
    "instruction": "Please dial *126# on your mobile phone to approve payment of 25 000 FCFA to Wunabuy.",
    "expires_at": "2026-08-28T09:10:00Z"
  }
}
```

### 5.4 Initiate Wallet Withdrawal (Payout to Mobile Money)
- **Endpoint:** `POST /api/v1/wallet/withdraw`
- **Access:** Authenticated
- **Request Body:**
```json
{
  "provider": "orange",
  "phone": "+237699112233",
  "amount": 15000,
  "currency": "XAF"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "transaction_id": "tx_with_883910",
    "status": "processing",
    "provider": "orange",
    "phone": "+237699112233",
    "amount": 15000,
    "fee": 0,
    "net_amount": 15000,
    "currency": "XAF",
    "estimated_arrival": "Instant (within 5 minutes)"
  }
}
```

### 5.5 Check Transaction Status (Polling Endpoint)
- **Endpoint:** `GET /api/v1/wallet/transactions/{id}/status`
- **Access:** Authenticated
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "transaction_id": "tx_fund_991203",
    "status": "completed",
    "amount": 25000,
    "new_balance": 72500,
    "completed_at": "2026-08-28T09:03:15Z"
  }
}
```

### 5.6 Payment Webhooks (MTN MoMo & Orange Money Callbacks)
- **MTN Callback:** `POST /api/v1/webhooks/momo`
- **Orange Callback:** `POST /api/v1/webhooks/orange`
- **Security:** HMAC-SHA256 signature verification via `X-Signature` header.

---

## 6. Orders, Escrow Engine & Dispute Contracts

### 6.1 Fetch Buyer Orders & Escrow Summary
- **Endpoint:** `GET /api/v1/orders`
- **Query Parameters:** `status` (`pending_payment`, `paid_escrow`, `preparing`, `en_route`, `in_transit`, `delivered`, `completed`, `disputed`)
- **Access:** Authenticated (`Bearer <token>`)
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "escrow_summary": {
      "total_locked_xaf": 236000,
      "active_escrow_orders_count": 2
    },
    "orders": [
      {
        "id": "wb_order_1",
        "order_code": "WNB-2026-9842",
        "store_name": "Douala Tech Hub (Akwa)",
        "item_name": "Samsung Galaxy A54 5G (128GB, Awesome Lime)",
        "item_image": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80",
        "total": 188000,
        "currency": "XAF",
        "status": "en_route",
        "created_at": "2026-08-26T14:30:00Z"
      }
    ]
  }
}
```

### 6.2 Confirm Receipt & Release Escrow
- **Endpoint:** `POST /api/v1/orders/{order_id}/confirm-delivery`
- **Access:** Authenticated
- **Request Body:**
```json
{
  "signature_data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "rating": 5,
  "review_text": "Great seller and fast driver!"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "order_id": "wb_order_1",
    "status": "completed",
    "escrow_released": true,
    "released_amount": 188000,
    "completed_at": "2026-08-27T14:50:00Z"
  }
}
```

### 6.3 File Escrow Dispute
- **Endpoint:** `POST /api/v1/orders/{order_id}/dispute`
- **Access:** Authenticated
- **Request Body:**
```json
{
  "reason": "damaged",
  "description": "The item screen was broken upon arrival when handed by the rider.",
  "evidence_photos": [
    "https://storage.wunabuy.com/disputes/evidence_1.jpg"
  ]
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "dispute_id": "disp_884920",
    "order_id": "wb_order_1",
    "status": "disputed",
    "escrow_frozen": true,
    "created_at": "2026-08-27T14:52:00Z"
  }
}
```

### 6.4 Escrow Checkout Payment (Wallet or Mobile Money)
- **Endpoint:** `POST /api/v1/checkout/pay`
- **Access:** Authenticated (`Bearer <token>`)
- **Request Body (Wallet Payment):**
```json
{
  "order_id": "wb_order_1",
  "method": "wallet",
  "amount": 188000,
  "currency": "XAF"
}
```
- **Response (200 OK — Wallet Instant Escrow Lock):**
```json
{
  "success": true,
  "data": {
    "payment_ref": "WNB-ESC-WAL-99812",
    "order_id": "wb_order_1",
    "status": "paid_escrow",
    "method": "wallet",
    "amount": 188000,
    "currency": "XAF",
    "escrow_locked_at": "2026-08-28T09:20:00Z"
  }
}
```
- **Request Body (Mobile Money Payment):**
```json
{
  "order_id": "wb_order_1",
  "method": "momo",
  "provider": "mtn",
  "phone": "+237670123456",
  "amount": 188000,
  "currency": "XAF"
}
```
- **Response (200 OK — USSD Push Triggered):**
```json
{
  "success": true,
  "data": {
    "payment_ref": "WNB-ESC-MOMO-88319",
    "order_id": "wb_order_1",
    "status": "pending_escrow_confirmation",
    "provider": "mtn",
    "dial_code": "*126#",
    "instruction": "Please dial *126# on your mobile phone to approve the 188 000 FCFA escrow payment."
  }
}
```

---

## 7. Real-Time Logistics & WebSocket Event Specifications

### 7.1 Channel Definition
- **Channel Name:** `private-tracking.{order_code}`
- **Protocol:** Laravel Reverb (WSS)

### 7.2 Event Payload: `DriverLocationUpdated`
```json
{
  "event": "DriverLocationUpdated",
  "data": {
    "order_code": "WNB-2026-9842",
    "driver": {
      "name": "Jean-Paul Mbida",
      "phone": "+237675112233",
      "rating": "4.9 ★"
    },
    "location": {
      "latitude": 4.0531200,
      "longitude": 9.7712400,
      "heading": 142.5,
      "speed_kmh": 24.0
    },
    "logistics": {
      "distance_km": 1.8,
      "eta_minutes": 8
    }
  }
}
```

---

## 8. User Profile & Settings API Contracts

### 8.1 Update Profile Info
- **Endpoint:** `PUT /api/v1/user/profile`
- **Request Body:**
```json
{
  "full_name": "Jean Dupont",
  "email": "jean.dupont@wunabuy.com"
}
```

### 8.2 Update User Preferences
- **Endpoint:** `PUT /api/v1/user/preferences`
- **Request Body:**
```json
{
  "language": "en",
  "currency": "XAF",
  "dark_mode": true
}
```

### 8.3 Switch Active Workspace Role (Staff-Approved Roles Only)
- **Endpoint:** `POST /api/v1/user/switch-role`
- **Access:** Authenticated (`Bearer <token>`)
- **Request Body:**
```json
{
  "requested_role": "seller"
}
```
- **Response (200 OK — Role Switch Authorized):**
```json
{
  "success": true,
  "data": {
    "user_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "active_role": "seller",
    "available_roles": ["buyer", "seller"],
    "switched_at": "2026-08-28T09:22:00Z"
  }
}
```
- **Error Response (403 Forbidden — Unapproved Role):**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED_ROLE_ACCESS",
    "message": "Role 'seller' has not been verified or approved by Wunabuy Staff. Please complete your Store KYC application first.",
    "request_id": "req_88492025"
  }
}
```

### 8.4 Delivery Address Manager (Full CRUD)
- **Endpoints:**
  - `GET /api/v1/user/addresses` (List saved addresses)
  - `POST /api/v1/user/addresses` (Add new delivery address)
  - `PUT /api/v1/user/addresses/{id}` (Update address details)
  - `DELETE /api/v1/user/addresses/{id}` (Delete address)
  - `POST /api/v1/user/addresses/{id}/default` (Set as default delivery address)

### 8.5 Followed Stores Feed
- **Endpoints:**
  - `GET /api/v1/user/followed-stores` (Returns followed stores and their latest products)
  - `POST /api/v1/stores/{id}/follow` (Follow store)
  - `DELETE /api/v1/stores/{id}/unfollow` (Unfollow store)

### 8.6 Favorites & Wishlist
- **Endpoints:**
  - `GET /api/v1/user/favorites` (Returns favorited products with stock & pricing)
  - `POST /api/v1/user/favorites/{product_id}` (Add to favorites)
  - `DELETE /api/v1/user/favorites/{product_id}` (Remove from favorites)

### 8.7 Browsing Footprint Engine
- **Endpoints:**
  - `GET /api/v1/user/footprints` (Returns chronological history of viewed products)
  - `POST /api/v1/user/footprints` (Log product view)
  - `DELETE /api/v1/user/footprints` (Clear browsing history)

### 8.8 Refunds & Escrow Disputes
- **Endpoints:**
  - `GET /api/v1/user/refunds` (Returns in-progress disputes and completed refunds)

---

## 9. Store & Transporter Onboarding & KYC API Contracts

### 9.1 Submit 4-Stage Store KYC Application
- **Endpoint:** `POST /api/v1/seller/kyc/submit`
- **Access:** Authenticated (`Bearer <token>`)
- **Content-Type:** `multipart/form-data`
- **Form Fields:**
  - `store_name` (string, required): Business or store name (min 3 chars)
  - `description` (string, required): Business description (min 10 chars)
  - `category` (string, required): Primary store category (e.g. `Electronics`, `Fashion`)
  - `address_text` (string, required): Street address
  - `city` (string, required): City (e.g. `Douala`, `Yaoundé`)
  - `latitude` (numeric, required): GPS latitude (e.g. `4.0510564`)
  - `longitude` (numeric, required): GPS longitude (e.g. `9.7678687`)
  - `cni_number` (string, required): National ID card number
  - `id_card_front` (file, required): JPG/PNG/WEBP photo of CNI Front
  - `id_card_back` (file, required): JPG/PNG/WEBP photo of CNI Back
  - `storefront_photo` (file, required): Photo of physical storefront or workshop
  - `business_reg_or_affidavit` (file, optional): Tax ID or Ownership affidavit doc
- **Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "submission_id": "kyc_sub_881920",
    "store_id": "store_991823",
    "status": "under_review",
    "estimated_review_hours": 24,
    "submitted_at": "2026-08-28T09:15:00Z"
  }
}
```

### 9.2 Check Store KYC Review Status
- **Endpoint:** `GET /api/v1/seller/kyc/status`
- **Access:** Authenticated
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "status": "under_review",
    "reviewer_notes": null,
    "submitted_at": "2026-08-28T09:15:00Z",
    "verified_at": null
  }
}
```

### 9.3 Submit 4-Stage Transporter (Driver) KYC Application
- **Endpoint:** `POST /api/v1/transporter/kyc/submit`
- **Access:** Authenticated (`Bearer <token>`)
- **Content-Type:** `multipart/form-data`
- **Form Fields:**
  - `driver_name` (string, required): Full legal name of driver
  - `phone` (string, required): Driver mobile phone number
  - `bio` (string, optional): Bio / experience description (max 300 chars)
  - `vehicle_type` (string, required): `bike` | `taxi` | `van` | `plane`
  - `license_plate` (string, required): Vehicle registration plate (e.g. `LT-982-AA`)
  - `base_station_quarter` (string, required): Primary operating neighborhood/quarter
  - `city` (string, required): Operating city
  - `cni_number` (string, required): Driver National ID number
  - `id_card_front` (file, required): CNI Front photo
  - `id_card_back` (file, required): CNI Back photo
  - `drivers_license_photo` (file, required): Driver's License photo
  - `carte_grise_photo` (file, required): Vehicle Registration (Carte Grise) document
  - `vehicle_assurance_photo` (file, required): Valid Insurance policy document
  - `vehicle_exterior_photo` (file, required): Clean exterior vehicle photo with plate clearly legible
- **Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "submission_id": "driver_kyc_771920",
    "transporter_id": "trans_881923",
    "vehicle_type": "bike",
    "status": "under_review",
    "estimated_review_hours": 24,
    "submitted_at": "2026-08-28T09:25:00Z"
  }
}
```

### 9.4 Check Transporter KYC Review Status
- **Endpoint:** `GET /api/v1/transporter/kyc/status`
- **Access:** Authenticated
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "status": "under_review",
    "vehicle_type": "bike",
    "reviewer_notes": null,
    "submitted_at": "2026-08-28T09:25:00Z",
    "verified_at": null
  }
}
```

---

## 10. Dynamic Promotions & Cart Banner API Contracts

### 10.1 Fetch Cart Promotion Banner
- **Endpoint:** `GET /api/v1/promotions/cart-banner`
- **Access:** Authenticated or Public
- **Response (200 OK — Active Promotion Available):**
```json
{
  "success": true,
  "data": {
    "show_banner": true,
    "promo_id": "promo_express_free",
    "promo_code": "EXPRESSFREE",
    "headline": "You've unlocked Free Express Delivery!",
    "subtext": "Orders above 15,000 FCFA qualify for instant doorstep delivery.",
    "auto_dismiss_seconds": 6,
    "expires_at": "2026-08-31T23:59:59Z"
  }
}
```
- **Response (200 OK — No Active Promotion):**
```json
{
  "success": true,
  "data": {
    "show_banner": false,
    "promo_id": null
  }
}
```

---

## 11. Database Schema & PostGIS Spatial Extensions

```sql
-- PostgreSQL 15 + PostGIS Core Tables

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'buyer',
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    avatar_url TEXT NULL,
    is_phone_verified BOOLEAN DEFAULT TRUE,
    available_roles TEXT[] NOT NULL DEFAULT '{buyer}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'XAF',
    quantity INTEGER NOT NULL DEFAULT 0,
    quality_tier VARCHAR(50) NOT NULL DEFAULT 'new',
    images TEXT[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    rating_avg NUMERIC(3, 2) NULL DEFAULT 5.0,
    total_reviews INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    balance_available NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    balance_escrow_locked NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'XAF',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- 'credit', 'debit'
    amount NUMERIC(14, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'XAF',
    provider VARCHAR(50) NOT NULL, -- 'mtn', 'orange', 'wallet_escrow'
    status VARCHAR(30) NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed'
    reference VARCHAR(100) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE seller_kyc_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    store_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    address_text TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    location GEOMETRY(Point, 4326),
    cni_number VARCHAR(100) NOT NULL,
    id_card_front_url TEXT NOT NULL,
    id_card_back_url TEXT NOT NULL,
    storefront_photo_url TEXT NOT NULL,
    business_reg_url TEXT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'under_review', -- 'pending', 'under_review', 'approved', 'rejected'
    reviewer_notes TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP WITH TIME ZONE NULL
);

CREATE TABLE transporter_kyc_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    driver_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    bio TEXT NULL,
    vehicle_type VARCHAR(50) NOT NULL, -- 'bike', 'taxi', 'van', 'plane'
    license_plate VARCHAR(50) NOT NULL,
    base_station_quarter VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    cni_number VARCHAR(100) NOT NULL,
    id_card_front_url TEXT NOT NULL,
    id_card_back_url TEXT NOT NULL,
    drivers_license_url TEXT NOT NULL,
    carte_grise_url TEXT NOT NULL,
    assurance_url TEXT NOT NULL,
    vehicle_exterior_photo_url TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'under_review', -- 'pending', 'under_review', 'approved', 'rejected'
    reviewer_notes TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP WITH TIME ZONE NULL
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_code VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES users(id),
    store_id UUID NOT NULL,
    transporter_id UUID NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'paid_escrow',
    payment_method VARCHAR(50) NOT NULL DEFAULT 'momo', -- 'wallet', 'momo', 'card'
    subtotal NUMERIC(12, 2) NOT NULL,
    delivery_fee NUMERIC(12, 2) NOT NULL,
    total NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'XAF',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 12. Error Codes & Troubleshooting Matrix

| Error Code | HTTP Status | Description | User Message |
|---|---|---|---|
| `VALIDATION_ERROR` | 422 | Required fields missing or invalid format | Please check your form entries and try again. |
| `UNAUTHENTICATED` | 401 | Missing or expired Sanctum Bearer token | Please log in to continue. |
| `UNAUTHORIZED_ROLE_ACCESS` | 403 | Attempt to switch to unapproved workspace role | This workspace role requires staff approval. Please submit your application first. |
| `INSUFFICIENT_FUNDS` | 400 | Wallet available balance is lower than required payment | Insufficient wallet balance. Please top up your wallet to proceed. |
| `MOMO_GATEWAY_TIMEOUT` | 504 | Telco USSD gateway did not respond in time | Telco verification timed out. Please retry dialing *126# or #150*50#. |
| `KYC_ALREADY_SUBMITTED` | 409 | KYC application already under active review | Your KYC application is currently being verified. |
| `ESCROW_LOCKED` | 403 | Attempt to modify order while escrow is frozen | Order is protected under 48-hour escrow lock. |

---

### Approval Signatures

**Backend Lead Architect:** _Laravel Engineering Team_  
**Frontend Lead Architect:** _Antigravity (AI Lead Architect)_  
**Product Manager:** _Agemo Technologies Product Lead_  

---
**[End of Backend Technical Specification & API Contracts v1.4]**
