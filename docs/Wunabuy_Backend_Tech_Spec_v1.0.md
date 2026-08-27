# Wunabuy — Backend Technical Specification & API Contracts

**Document Version:** 1.2 (Production API Architecture Baseline)  
**Date:** August 27, 2026  
**Status:** Approved / In Production Use  
**Companion Documents:** Wunabuy SRS v1.3, Wunabuy PRD v1.3  
**Framework:** Laravel 13 (PHP 8.3+)  
**Frontend Monorepo Targets:** `wunabuy-mobile` (Expo SDK 54), `@wunabuy/api-client`, `@wunabuy/types`, `@wunabuy/utils`

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [API Conventions & Response Schemas](#2-api-conventions--response-schemas)
3. [Authentication & Direct OTP Endpoint Contracts](#3-authentication--direct-otp-endpoint-contracts)
4. [Home Feed & Partners Endpoint Contracts](#4-home-feed--partners-endpoint-contracts)
5. [Orders, Escrow Engine & Dispute Contracts](#5-orders-escrow-engine--dispute-contracts)
6. [Real-Time Logistics & WebSocket Event Specifications](#6-real-time-logistics--websocket-event-specifications)
7. [User Profile & Settings API Contracts](#7-user-profile--settings-api-contracts)
8. [Store Onboarding & KYC API Contracts](#8-store-onboarding--kyc-api-contracts)
9. [Database Schema & PostGIS Spatial Extensions](#9-database-schema--postgis-spatial-extensions)
10. [Error Codes & Troubleshooting Matrix](#10-error-codes--troubleshooting-matrix)

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
│  │ - Auth, Commerce, Payment, Escrow, Delivery, Chat, KYC, Staff Modules     │  │
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
    "timestamp": "2026-08-27T14:45:00Z",
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

### 3.1 Send Phone OTP Code
- **Endpoint:** `POST /api/v1/auth/otp/send`
- **Access:** Public
- **Request Body:**
```json
{
  "phone": "+237670123456"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user_id": "usr_99201029",
    "phone": "+237670123456",
    "otp_sent": true,
    "expires_in_seconds": 300
  }
}
```

### 3.2 Verify OTP & Authenticate User (Direct Home Login)
- **Endpoint:** `POST /api/v1/auth/otp/verify`
- **Access:** Public
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
    "access_token": "1|sanctum_access_token_mock_884920",
    "refresh_token": "sanctum_refresh_token_mock_884920",
    "token_type": "Bearer",
    "user": {
      "id": "usr_670123456",
      "phone": "+237670123456",
      "email": "user@wunabuy.com",
      "full_name": "Jean Dupont",
      "role": "buyer",
      "status": "active",
      "avatar_url": null,
      "is_phone_verified": true,
      "default_address": {
        "id": "addr_default_1",
        "label": "Home",
        "latitude": 4.0510564,
        "longitude": 9.7678687,
        "address_text": "Rue Joss, Akwa",
        "city": "Douala",
        "is_default": true
      },
      "available_roles": ["buyer"],
      "created_at": "2026-08-27T12:00:00Z",
      "updated_at": "2026-08-27T12:00:00Z"
    }
  }
}
```

---

## 4. Home Feed & Partners Endpoint Contracts

### 4.1 Fetch Home Screen Feed Data
- **Endpoint:** `GET /api/v1/home/feed`
- **Access:** Public / Authenticated
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "hero_carousel": [
      {
        "id": "slide_1",
        "badge": "100% ESCROW GUARANTEE",
        "badge_color": "#0D9488",
        "title": "Shop Safely, ✨\nBuy Confidently",
        "subtitle": "Your money stays 100% safe in 48-hour escrow protection until delivery is signed.",
        "cta_text": "Explore Escrow",
        "image_url": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80"
      }
    ],
    "official_partners": [
      {
        "id": "partner_1",
        "name": "MTN MoMo",
        "category": "Mobile Money Escrow",
        "icon_name": "phone-portrait-outline",
        "icon_color": "#F59E0B",
        "badge": "1-Tap Cashout"
      },
      {
        "id": "partner_2",
        "name": "Orange Money",
        "category": "Mobile Wallet Partner",
        "icon_name": "wallet-outline",
        "icon_color": "#F97316",
        "badge": "Instant Transfer"
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

## 5. Orders, Escrow Engine & Dispute Contracts

### 5.1 Fetch Buyer Orders & Escrow Summary
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

### 5.2 Confirm Receipt & Release Escrow
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

### 5.3 File Escrow Dispute
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

---

## 6. Real-Time Logistics & WebSocket Event Specifications

### 6.1 Channel Definition
- **Channel Name:** `private-tracking.{order_code}`
- **Protocol:** Laravel Reverb (WSS)

### 6.2 Event Payload: `DriverLocationUpdated`
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

## 7. User Profile & Settings API Contracts

### 7.1 Update Profile Info
- **Endpoint:** `PUT /api/v1/user/profile`
- **Request Body:**
```json
{
  "full_name": "Jean Dupont",
  "email": "jean.dupont@wunabuy.com"
}
```

### 7.2 Update User Preferences
- **Endpoint:** `PUT /api/v1/user/preferences`
- **Request Body:**
```json
{
  "language": "en",
  "currency": "XAF",
  "dark_mode": true
}
```

---

## 8. Database Schema & PostGIS Spatial Extensions

```sql
-- PostgreSQL + PostGIS Core Tables

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'buyer',
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    avatar_url TEXT NULL,
    is_phone_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_code VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES users(id),
    store_id UUID NOT NULL,
    transporter_id UUID NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'paid_escrow',
    subtotal NUMERIC(12, 2) NOT NULL,
    delivery_fee NUMERIC(12, 2) NOT NULL,
    total NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'XAF',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

### Approval Signatures

**Backend Lead Architect:** _Laravel Engineering Team_  
**Frontend Lead Architect:** _Antigravity (AI Lead Architect)_  
**Product Manager:** _Agemo Technologies Product Lead_  

---
**[End of Backend Technical Specification & API Contracts]**
