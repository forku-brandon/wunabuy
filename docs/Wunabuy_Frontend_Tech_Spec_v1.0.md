# Wunabuy — Frontend Technical Specification
### Version 1.0 | July 2026

> **Resolved Decisions (August 26, 2026):**
> - Real-time: Laravel 13 + Laravel Reverb (all Supabase references removed)
> - Navigation: React Navigation 6.x + Expo SDK 51
> - Staff Portal: TanStack Router + shadcn/ui + Tailwind CSS
> - Auth: Laravel Sanctum opaque Bearer tokens (not JWT)
> - Currency: XAF-only for Phase 1 (Cameroon market)
> - Commission: 3.5% platform fee
> - Dark mode: Required in Phase 1

**Prepared for:** Agemo Technologies Frontend Engineering Team  
**Companion Documents:**  
- Wunabuy Software Requirements Specification (SRS v1.0 / v1.2)  
- Wunabuy Backend Technical Specification (v1.0)  

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Technology Stack](#2-technology-stack)
3. [Monorepo Structure & Configuration](#3-monorepo-structure--configuration)
4. [Design System](#4-design-system)
5. [Mobile App — React Native Specification](#5-mobile-app--react-native-specification)
6. [Staff Portal — React Web Specification](#6-staff-portal--react-web-specification)
7. [State Management & Data Fetching](#7-state-management--data-fetching)
8. [API Integration Layer](#8-api-integration-layer)
9. [Real-Time Services (Laravel Reverb)](#9-real-time-services-laravel-reverb)
10. [Authentication & Session Management](#10-authentication--session-management)
11. [Navigation Architecture](#11-navigation-architecture)
12. [Offline Support & Write Queue Sync](#12-offline-support--write-queue-sync)
13. [Internationalization (i18n)](#13-internationalization-i18n)
14. [Image & Media Handling](#14-image--media-handling)
15. [Video Pipeline Integration (Phase 2)](#15-video-pipeline-integration-phase-2)
16. [Testing Strategy & Code Samples](#16-testing-strategy--code-samples)
17. [CI/CD & Deployment Pipelines](#17-cicd--deployment-pipelines)
18. [Performance Budgets & Optimization](#18-performance-budgets--optimization)
19. [Accessibility Standards](#19-accessibility-standards)
20. [Appendices](#20-appendices)
21. [Security & Compliance](#21-security--compliance)
22. [Observability & Monitoring](#22-observability--monitoring)
23. [Environment Strategy & Release Management](#23-environment-strategy--release-management)
24. [Error Handling & Resilience](#24-error-handling--resilience)
25. [Frontend Governance & Standards](#25-frontend-governance--standards)
26. [Quality Gates & Test Matrix](#26-quality-gates--test-matrix)

---

## 1. Architecture Overview

### 1.1 Frontend Landscape

Wunabuy consists of two core client applications connected to a single unified Laravel 13 backend:

| Application | Platform | Tech Stack | User Target | Target Devices |
|---|---|---|---|---|
| **Mobile App** | iOS & Android | React Native 0.74+ (Expo SDK 51+) | Buyers, Store Owners (Sellers), Transport Providers | iOS 15+, Android 10+ (4.7" - 6.9" screens) |
| **Staff Portal** | Web App | React 18 + Vite | Company Staff across 6 departments + Super Admin | Desktop (1280px+) & Tablet (768px+) |

### 1.2 Core Design & Architectural Principles

1. **Unified Monorepo Architecture**: A pnpm workspace containing shared packages for design tokens (`@wunabuy/design-tokens`), TypeScript definitions (`@wunabuy/types`), API client (`@wunabuy/api-client`), real-time helpers (`@wunabuy/realtime`), and utility functions (`@wunabuy/utils`).
2. **Single Source of Truth for API Types**: Frontend TypeScript interfaces match the backend OpenAPI schemas exactly.
3. **Server-Driven Configuration**: Feature flags, commission tiers, ranking weights, and operational parameters are loaded dynamically from `/staff/config` endpoints.
4. **Offline-Resilient Mobile Design**: High tolerance for spotty 3G/4G coverage in African urban and peri-urban markets. Caching, pessimistic writes with queued background syncing, and optimistic UI updates.
5. **Strict Role-Based Navigation & UI**: The mobile app switches navigation modes dynamically based on active user context (`buyer`, `seller`, `transporter`). The Staff Portal enforces granular RBAC at the route and component levels.
6. **Strict Performance Budgets**: Mobile app cold start $\le 3\text{s}$, initial JS bundle size $\le 2\text{MB}$ (gzipped). Staff Portal initial load $\le 300\text{KB}$ (gzipped).

### 1.3 System Data Flow Architecture

Wunabuy follows a hybrid runtime model: a lightweight public ingress layer for TLS, routing, and protocol handling, backed by a modular Laravel 13 application for business logic and a shared data plane powered by PostgreSQL, Redis, Laravel Reverb, and Flysystem storage services. This keeps the system operationally simple at launch while enabling future extraction of domain services without changing client contracts.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       WUNABUY FRONTEND CLIENTS                              │
│                                                                             │
│   ┌──────────────────────────────────┐     ┌─────────────────────────────┐  │
│   │    React Native Mobile App       │     │    React Staff Web Portal   │  │
│   │ (Buyer / Seller / Transporter)   │     │  (Finance/Ops/CS/Admin/etc) │  │
│   └────────────────┬─────────────────┘     └──────────────┬──────────────┘  │
│                    │                                      │                 │
│                    ▼                                      ▼                 │
│         ┌────────────────────────────────────────────────────────┐          │
│         │            Shared Packages (@wunabuy/*)                │          │
│         │  - design-tokens   - api-client   - realtime          │          │
│         │  - types           - utils          - state stores     │          │
│         └──────────────────────────┬─────────────────────────────┘          │
└────────────────────────────────────┼────────────────────────────────────────┘
                                     │
                             HTTPS / WebSocket (WSS)
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    WUNABUY BACKEND RUNTIME TOPOLOGY                        │
│                                                                             │
│   ┌───────────────────────────────┐   ┌──────────────────────────────────┐ │
│   │ Nginx / API Gateway           │   │ Laravel 13 Backend Services      │ │
│   │ TLS, request routing, rate    │   │ Modular monolith: auth,          │ │
│   │ limiting, protocol handling   │   │ commerce, payment, delivery,     │ │
│   │ /api/v1/* and /api/v1/staff/ │   │ chat, KYC, staff, search, etc.  │ │
│   └──────────────┬────────────────┘   └────────────────┬──────────────────┘ │
│                  │                                      │                    │
│                  └──────────────────────┬───────────────┘                    │
│                                         ▼                                    │
│                         ┌──────────────────────────────────────┐            │
│                         │ Shared Backend Data & Services      │            │
│                         │ PostgreSQL 15 + PostGIS + RLS      │            │
│                         │ Redis cache / queues / pub-sub      │            │
│                         │ Laravel Flysystem + Reverb WebSockets│            │
│                         └──────────────────────────────────────┘            │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ Async Processing & Queue Workers                                    │   │
│   │ Laravel Horizon Redis workers / scheduled tasks / webhooks          │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

This architecture keeps the public boundary thin and stable while moving business logic into a clear, domain-based server implementation. The Nginx layer acts as the ingress and protocol terminator; the Laravel layer owns business workflows; PostgreSQL and Redis provide the operational data plane.

---

## 2. Technology Stack

### 2.1 Mobile App Stack (React Native)

- **Framework**: React Native 0.74+ with Expo SDK 51+ (Hermes JS Engine enabled).
- **Navigation**: React Navigation 6.x (Native Stack, Bottom Tabs, Drawer).
- **State Management**:
  - Client state: Zustand 4.x (persisted with `@react-native-async-storage/async-storage`).
  - Server state / Caching: TanStack React Query 5.x.
- **API & Networking**: Axios 1.x with refresh interceptors; `laravel-echo` + `pusher-js` for Laravel Reverb WebSockets.
- **UI & Styling**: Custom Design System built with React Native `StyleSheet` driven by `@wunabuy/design-tokens`.
- **Maps & Geolocation**: `react-native-maps` with Google Maps SDK; `expo-location` for background GPS.
- **Secure Token Storage**: `react-native-keychain` (Encrypted Storage on Android / Keychain on iOS).
- **Media & Images**: `expo-image` (disk caching, BlurHash placeholders) and `expo-image-manipulator` (compression).
- **Notifications**: `@react-native-firebase/messaging` + `notifee` (FCM for Android, APNs for iOS).
- **Internationalization**: `i18next` + `react-i18next` (English, French, Swahili).

### 2.2 Staff Portal Stack (React Web)

- **Framework**: React 18.x + Vite 5.x.
- **Routing**: TanStack Router with route-level code splitting (`React.lazy`).
- **State Management**: Zustand 4.x (Client/Auth) + TanStack React Query 5.x (Server).
- **Styling & UI**: shadcn/ui (built on Radix UI primitives) + Tailwind CSS.
- **Data Tables**: TanStack Table (React Table v8) with virtualized scrolling via `@tanstack/react-virtual`.
- **Data Visualization**: Recharts 2.x for financial metrics, transaction trends, and analytics.
- **Forms & Validation**: `react-hook-form` + `zod` schemas.

---

## 3. Monorepo Structure & Configuration

The codebase uses **pnpm workspaces** and **Turborepo** for optimized task execution and build caching.

```
wunabuy/
├── packages/
│   ├── design-tokens/     # Colors, typography, spacing, shadows, motion
│   ├── types/             # Shared TypeScript API & domain interfaces
│   ├── api-client/        # Pre-configured Axios instance & endpoint methods
│   ├── realtime/          # Laravel Reverb channels & event payload helpers
│   └── utils/             # Currency (XAF/NGN), date, phone, and geo helpers
├── mobile/                # Expo React Native App (iOS/Android)
├── staff-portal/          # React Web App (Vite)
├── pnpm-workspace.yaml
├── turbo.json
└── tsconfig.base.json
```

### 3.1 `pnpm-workspace.yaml`
```yaml
packages:
  - 'packages/*'
  - 'mobile'
  - 'staff-portal'
```

### 3.2 `turbo.json`
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", "build/**", ".expo/**"]
    },
    "lint": {
      "outputs": []
    },
    "type-check": {
      "outputs": []
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

---

## 4. Design System & Aesthetics Architecture

The Wunabuy design system provides a **premium, state-of-the-art visual experience** designed to wow users at first glance. It balances rich aesthetics (vibrant color gradients, dark mode, glassmorphism, micro-animations) with high-contrast outdoor visibility for mobile users and high-density clarity for staff portal operators.

### 4.1 Typography System

- **Display & Headings**: `Plus Jakarta Sans` (Google Fonts) — modern geometric typeface for titles, headers, and callouts.
- **Body & Controls**: `Inter` (Google Fonts) — highly readable sans-serif optimized for mobile screens and data tables.

| Token | Font Family | Size (sp/px) | Line Height | Weight | Mobile Application | Staff Portal Application |
|---|---|---|---|---|---|---|
| `display` | Plus Jakarta Sans | 32 | 40 | 700 (Bold) | Hero onboarding, sale banners | Page headlines, key KPI metrics |
| `h1` | Plus Jakarta Sans | 24 | 32 | 700 (Bold) | Screen headers, store titles | Section headers, modal titles |
| `h2` | Plus Jakarta Sans | 20 | 28 | 600 (SemiBold) | Card titles, section headers | Table section headers |
| `h3` | Plus Jakarta Sans | 18 | 24 | 600 (SemiBold) | Product names, bottom sheets | Widget titles, tab labels |
| `bodyLarge` | Inter | 16 | 24 | 500 (Medium) | Input labels, order status | Primary table cells |
| `bodyMedium` | Inter | 14 | 20 | 400 (Regular) | Product descriptions, chat text | Standard table text |
| `caption` | Inter | 12 | 16 | 500 (Medium) | Timestamps, badge labels | Dense metadata, footnotes |

### 4.2 Color Palette & HSL Tokens

```typescript
// packages/design-tokens/src/colors.ts
export const colors = {
  // Primary Emerald/Teal (Vibrant & Trustworthy)
  primary: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#0D9488', // Main Primary Teal
    600: '#0F766E',
    700: '#115E59',
    800: '#134E4A',
    900: '#042F2C',
    gradient: 'linear-gradient(135deg, #0F766E 0%, #10B981 100%)',
  },

  // Secondary Accent (Radiant Amber/Orange CTAs)
  accent: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B', // Radiant CTA & Sale Badge
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #ED6C02 100%)',
  },

  // Glassmorphism Surface Tokens
  glass: {
    light: {
      background: 'rgba(255, 255, 255, 0.75)',
      border: '1px solid rgba(255, 255, 255, 0.4)',
      blur: 'backdrop-filter: blur(16px)',
      shadow: '0px 8px 32px rgba(15, 118, 110, 0.08)',
    },
    dark: {
      background: 'rgba(15, 23, 42, 0.80)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      blur: 'backdrop-filter: blur(16px)',
      shadow: '0px 8px 32px rgba(0, 0, 0, 0.37)',
    },
  },

  // Role Color Coding
  role: {
    buyer: '#0D9488',       // Emerald Teal
    seller: '#2563EB',      // Sapphire Blue
    transporter: '#F59E0B', // Radiant Amber
    staff: '#6366F1',       // Indigo
  },

  // Neutrals (Dark Mode Enabled)
  neutral: {
    0: '#FFFFFF',
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A', // Slate Dark Background
  },

  // Semantic Feedback
  semantic: {
    success: { 50: '#ECFDF5', 500: '#10B981', 700: '#047857' },
    warning: { 50: '#FFFBEB', 500: '#F59E0B', 700: '#B45309' },
    error:   { 50: '#FEF2F2', 500: '#EF4444', 700: '#B91C1C' },
    info:    { 50: '#EFF6FF', 500: '#3B82F6', 700: '#1D4ED8' },
  }
};
```

### 4.3 Micro-Animations & Dynamic Interactions

1. **Mobile Animations (React Native Reanimated 3 + Moti)**:
   - **Button Touch Feedback**: Micro-scale compression (`transform: [{ scale: 0.97 }]`) with haptic feedback (`expo-haptics`).
   - **Skeleton Placeholders**: Animated shimmer pulse effect during data fetching.
   - **Live GPS Tracking Marker**: Smooth 60fps interpolation of rider map marker movements along route polylines.
   - **Bottom Sheet Modal**: Physics-based spring gesture entry/exit transitions.

2. **Staff Portal Animations (Framer Motion)**:
   - **Route Page Transitions**: Fade-and-slide entry (`initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}`).
   - **Interactive Table Rows**: Subtle hover elevation and background highlight.
   - **KPI Card Numbers**: Animated count-up metrics for revenue and transaction totals.

### 4.4 Outdoor Ergonomics & High-Contrast Mode
- **Transporter High-Contrast Mode**: Offers a dedicated high-contrast outdoor mode for riders operating under direct sunlight, raising contrast ratios to $\ge 7:1$.
- **Touch Target Enforcements**: All mobile touchable elements maintain a minimum hit boundary of $48 \times 48\text{ dp}$.

---

## 5. Mobile App — React Native Specification

The mobile app incorporates three distinct role views in a single codebase with dynamic role switching.

### 5.1 Screen Inventory

#### 1. Buyer Flow
- **Home (`HomeScreen`)**: Top AppBar (`☰` hamburger drawer trigger on left; Search, Notifications with badge, and Shopping Cart with badge on right), auto-scrolling `HeroCarousel` (4.5s interval), official `PartnersCarousel` (MTN MoMo, Orange Money, Flutterwave, DHL, Ecobank), circular `CategoryChip` avatars, and native `RefreshControl`.
- **Search & Discovery (`SearchScreen`)**: Full-text search with active query filtering, manual category avatar scrollbar, filter bottom sheet (price range, distance radius, rating, quality tier), and `ProductGrid` with native `RefreshControl`.
- **Product Detail (`ProductDetailScreen` v2.0)**:
  - Expansive hero gallery stage covering 92% screen width (4% side margins, 380px height) with rounded corners (`borderRadius: 20px`), quality tier pill badge (`NEW • 100% VERIFIED`), multi-image thumbnail selector strip, and pagination dots.
  - Top Floating Header Bar aligning Back button on the left, and Favorite Love Icon (`❤️` / `🤍`), Native Share Button, and Shopping Cart Button (with live item count badge) in a clean horizontal row on the right on the same line.
  - Verified Merchant Store Card displaying store title, verification badge, and 99.4% fulfillment score.
  - 48-Hour Escrow Protection & Express GPS Delivery trust banner.
  - Color variant selector and expandable description with Read More / Show Less toggle.
  - 2-Column Recommendation / Related Products Grid ("You May Also Like ✨") querying related products from the same category with direct navigation (`navigation.push('ProductDetail')`).
  - Sticky Bottom Action Bar with compact `[ − 1 + ]` quantity stepper, 48px soft-teal `Add to Cart` button (`flex: 1.1`), and solid Emerald Teal `Buy Now ➔` button (`flex: 1.2`).
- **Cart & Checkout (`BuyerCartScreen`, `CheckoutPaymentScreen`)**: Cart item list with quantity steppers, promo code discount box, dynamic backend-driven promotion & free shipping banner (hidden by default, auto-dismisses after 6s timeout with manual `X` close trigger), and `FlatList` with native `RefreshControl`.
- **Order Tracking & Dispute (`BuyerOrdersScreen`, `OrderTrackingScreen`)**:
  - `BuyerOrdersScreen`: 48H Escrow metrics, tab filters (`All`, `Paid Escrow`, `En Route`, `Completed`, `Disputed`), digital signature confirmation modal, dispute filing modal, and `FlatList` with native `RefreshControl`.
  - `OrderTrackingScreen`: Live Google Map with real-time transporter marker, route polyline, ETA countdown, order status step timeline, and direct call/chat triggers.
- **My Wallet (`WalletScreen`)**: In-app mobile wallet with Available Balance card, privacy eye toggle (`👁`), quick fund/withdraw modal (MTN MoMo `*126#` & Orange Money `#150*50#`, USSD dial simulation, result card), and `ScrollView` with native `RefreshControl`.
- **User Profile (`ProfileScreen`)**: Top header with settings shortcut, 52px circular avatar featuring bundled 3D clay-style Black character avatar (`assets/avatar.png`) with Camera Edit badge, Wallet Quick-Access card (`47,500 XAF`, `48H ESCROW`), My Orders status shortcuts, My Tools shortcuts, recommended product feed, and `FlatList` with native `RefreshControl`.

#### 2. Seller (Store Owner) Flow
- **Seller Welcome (`SellerWelcomeScreen`)**: 70% automated hero carousel (3.5s interval across 4 benefit cards) and 20% capsule CTA button (`Get Started Now ➔`).
- **Store KYC Form (`StoreKYCScreen`)**:
  - 4-stage wizard with 80% form card height / 20% action button split and animated progress bar (`25%` -> `100%`).
  - Stage 1: Store name, flexible multiline business description textarea (`minHeight: 110px`, live `0/300` char limit counter, zero text overflow), and horizontal category slider with multi-select checkmark chips (`✓ CategoryName`).
  - Stage 2: Street address, city, and GPS Auto-Pin notice.
  - Stage 3 & 4: National ID CNI number, front/back CNI photo uploads, storefront photo, and business registration certificate.
  - High-contrast Error Callout Alert Banner and Stage 5 celebration modal (redirects user back to initial Buyer Home Dashboard upon completion).
- **Seller Dashboard (`SellerDashboardScreen`)**: Total store balances, revenue metrics, KYC verification status banner, and `ScreenContainer` with native `RefreshControl`.
- **Store Inventory (`SellerProductsScreen`)**: Product inventory list, active stock switches, search filter, and `FlatList` with native `RefreshControl`.
- **Add/Edit Product (`AddEditProductScreen`)**: Multi-image photo picker, category selector, quality tier, price in XAF, and stock quantity.

#### 3. Transport Provider Flow
- **Transporter Welcome (`TransporterWelcomeScreen`)**: Logo-free modern header, live status badge (`TRANSPORTER FLEET`), 70% automated hero benefit carousel with exact screen-width snapping, 4 Transport Modality Cards (`Bike 🏍️`, `Taxi 🚕`, `Van 🚐`, `Plane ✈️`), and 20% capsule CTA button (`Start Driver Verification ➔`).
- **Driver KYC Form (`TransporterKYCScreen`)**:
  - 4-stage driver verification form with 80% form / 20% action button split and animated progress bar (`25%` -> `100%`).
  - Stage 1: Driver legal name, active phone, emergency phone, and multiline experience/city knowledge bio textarea (`minHeight: 110px`, `0/300` char limit counter).
  - Stage 2: Vehicle class selector chips (`Motorcycle`, `Car`, `Van`, `Bicycle`, `Truck`), make/model, license plate, operating city & base quarter.
  - Stage 3: National ID CNI number, driver's license number, front/back CNI photos, and driver's license photo upload.
  - Stage 4: Vehicle Carte Grise registration photo, insurance certificate photo, and exterior vehicle photo with license plate visible.
  - Stage 5: 24-hour compliance queue celebration modal (redirects smoothly back to Buyer Home Dashboard on completion).
- **Available Delivery Jobs (`TransporterJobsScreen`)**: Nearby transport offers sorted by distance, pickup/drop-off cards, and `FlatList` with native `RefreshControl`.
- **Driver Earnings (`TransporterEarningsScreen`)**: Available driver balance card, payout to MoMo trigger, completed trip history, and `FlatList` with native `RefreshControl`.
- **Active Delivery Workflow (`TransporterActiveTripScreen`)**: GPS navigation to pickup store, store pickup confirmation, live GPS route broadcasting to buyer, and delivery completion signature capture.

---

## 6. Staff Portal — React Web Specification

The Staff Portal provides operational oversight for internal company personnel across 6 operational departments.

### 6.1 Department Dashboard Matrix & Navigation

```
Staff Portal Navigation Structure:
├── Auth Gate (/login -> /mfa)
└── Dashboard Layout
    ├── Finance (/finance)           -> Overview | Payout Queue | Ledger | Reconciliation
    ├── Operations (/operations)     -> KYC Queue | Active Deliveries | Stores | Metrics
    ├── Customer Service (/support)  -> Tickets | User Search | Disputes | Refunds | Chat Logs
    ├── Compliance (/compliance)     -> KYC Approval | Fraud Cases | Regulatory | DSR Reports
    ├── Marketing (/marketing)       -> Campaigns | Featured Items | Analytics | Push Center
    ├── IT & Engineering (/system)   -> System Health | Config | Staff Accounts | Audit Logs
    └── Super Admin (/admin)        -> Full System Oversight + Global RBAC Matrix
```

### 6.2 Granular RBAC Permission Matrix

| Permission Key | Finance | Operations | Support | Compliance | Marketing | IT | Super Admin |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `finance.view_dashboard` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `finance.approve_payouts` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `kyc.review` | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ |
| `kyc.approve_final` | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| `disputes.resolve` | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ |
| `disputes.refund` | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| `marketing.curate` | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| `system.config_edit` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| `system.staff_manage` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

---

## 7. State Management & Data Fetching

### 7.1 Server State with TanStack React Query

All remote data is fetched, cached, and synchronized using React Query.

```typescript
// mobile/src/features/product/queries/product.queries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProducts, getProductById, createProduct } from '@wunabuy/api-client';

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

export function useProductsQuery(filters: { category?: string; search?: string; lat?: number; lng?: number }) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => getProducts(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}
```

### 7.2 Client State with Zustand

Persistent client state (Auth tokens, Cart, Preferences) is handled via Zustand.

```typescript
// mobile/src/features/cart/store/cart.store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CartItem {
  productId: string;
  storeId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem) => {
        const currentItems = get().items;
        const existingIndex = currentItems.findIndex((i) => i.productId === newItem.productId);
        if (existingIndex > -1) {
          const updated = [...currentItems];
          updated[existingIndex].quantity += newItem.quantity;
          set({ items: updated });
        } else {
          set({ items: [...currentItems, newItem] });
        }
      },
      removeItem: (productId) => set({ items: get().items.filter((i) => i.productId !== productId) }),
      updateQuantity: (productId, qty) => {
        if (qty <= 0) {
          get().removeItem(productId);
        } else {
          set({
            items: get().items.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i)),
          });
        }
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    }),
    {
      name: 'wunabuy-cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

---

## 8. API Integration Layer

### 8.1 Shared Axios Client Implementation

```typescript
// packages/api-client/src/client.ts
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

export interface ApiClientConfig {
  baseURL: string;
  getToken: () => Promise<string | null>;
  getRefreshToken: () => Promise<string | null>;
  onTokenRefreshed: (tokens: { access_token: string; refresh_token: string }) => Promise<void>;
  onAuthError: () => void;
}

export function createApiClient(config: ApiClientConfig): AxiosInstance {
  const client = axios.create({
    baseURL: config.baseURL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
  });

  // Request Interceptor: Attach Laravel Sanctum opaque Bearer token
  client.interceptors.request.use(async (reqConfig: InternalAxiosRequestConfig) => {
    const token = await config.getToken();
    if (token && reqConfig.headers) {
      reqConfig.headers.Authorization = `Bearer ${token}`;
    }
    return reqConfig;
  });

  // Response Interceptor: Handle Token Refresh & Retries
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const refreshToken = await config.getRefreshToken();
          if (!refreshToken) throw new Error('No refresh token');

          const res = await axios.post(`${config.baseURL}/auth/refresh`, { refresh_token: refreshToken });
          const newTokens = res.data.data;
          await config.onTokenRefreshed(newTokens);

          originalRequest.headers.Authorization = `Bearer ${newTokens.access_token}`;
          return client(originalRequest);
        } catch (refreshErr) {
          config.onAuthError();
          return Promise.reject(refreshErr);
        }
      }
      return Promise.reject(error);
    }
  );

  return client;
}
```

---

## 9. Real-Time Services (Laravel Reverb WebSockets)

Real-time channels handle order tracking updates, in-app messaging, and staff alerts via `laravel-echo` connected to Laravel Reverb.

```typescript
// packages/realtime/src/tracking-channel.ts
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

export interface GPSLocationUpdate {
  order_id: string;
  transporter_id: string;
  latitude: number;
  longitude: number;
  heading: number;
  timestamp: string;
}

export function subscribeToDeliveryTracking(
  echo: Echo,
  orderId: string,
  onLocationUpdate: (update: GPSLocationUpdate) => void
) {
  return echo.private(`tracking.${orderId}`)
    .listen('.gps_update', (payload: GPSLocationUpdate) => {
      onLocationUpdate(payload);
    });
}
```

---

## 10. Authentication & Session Management

### 10.1 Mobile Auth Flow (Phone + SMS OTP)

1. **Registration**: User inputs phone number & full name $\rightarrow$ `POST /auth/register` $\rightarrow$ OTP sent via SMS (Africa's Talking).
2. **Verification**: User inputs 6-digit code $\rightarrow$ `POST /auth/verify-otp` $\rightarrow$ Server returns Access Token (1h TTL) and Refresh Token (30d TTL).
3. **Storage**: Tokens are encrypted and stored in hardware keychain via `react-native-keychain`.

### 10.2 Staff Portal Auth Flow (Email + Password + TOTP MFA)

1. **Credentials Input**: Staff enters email & password $\rightarrow$ `POST /staff/login` $\rightarrow$ Returns temporary 5-min MFA token.
2. **MFA Verification**: Staff inputs 6-digit authenticator code $\rightarrow$ `POST /staff/verify-mfa` $\rightarrow$ Returns Access Token (15m TTL) and Refresh Token (8h TTL).
3. **Session Timeout**: 15 minutes of inactivity automatically purges token state and redirects to login.

---

## 11. Navigation Architecture

### 11.1 Mobile Deep Linking Configuration

Deep links support universal opening of shared products, stores, order tracking, and chat threads (`wunabuy://` scheme and `https://wunabuy.com/app/*`).

```typescript
// mobile/src/app/navigation/linking.ts
import { LinkingOptions } from '@react-navigation/native';

export const linkingConfig: LinkingOptions<any> = {
  prefixes: ['wunabuy://', 'https://wunabuy.com/app'],
  config: {
    screens: {
      BuyerApp: {
        screens: {
          Home: 'home',
          ProductDetail: 'product/:id',
          StoreProfile: 'store/:id',
          OrderTracking: 'track/:orderId',
          ChatConversation: 'chat/:conversationId',
        },
      },
    },
  },
};
```

---

## 12. Offline Support & Write Queue Sync

To handle unstable network conditions, background mutations are queued locally and executed automatically when connectivity is restored.

```typescript
// mobile/src/services/OfflineSyncService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { AxiosInstance } from 'axios';

interface QueuedMutation {
  id: string;
  url: string;
  method: 'POST' | 'PUT' | 'DELETE';
  data: any;
  createdAt: number;
}

const QUEUE_STORAGE_KEY = '@wunabuy_offline_queue';

export class OfflineSyncService {
  constructor(private apiClient: AxiosInstance) {
    this.initNetworkListener();
  }

  async enqueue(mutation: Omit<QueuedMutation, 'id' | 'createdAt'>): Promise<void> {
    const existing = await this.getQueue();
    const newItem: QueuedMutation = {
      ...mutation,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: Date.now(),
    };
    await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify([...existing, newItem]));
  }

  async processQueue(): Promise<void> {
    const queue = await this.getQueue();
    if (queue.length === 0) return;

    const remaining: QueuedMutation[] = [];
    for (const item of queue) {
      try {
        await this.apiClient.request({ url: item.url, method: item.method, data: item.data });
      } catch (err) {
        remaining.push(item); // Keep item in queue if request fails again
      }
    }
    await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(remaining));
  }

  private async getQueue(): Promise<QueuedMutation[]> {
    const raw = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  private initNetworkListener(): void {
    NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable) {
        this.processQueue();
      }
    });
  }
}
```

---

## 13. Internationalization (i18n)

The mobile app supports **English (`en`)**, **French (`fr`)**, and **Swahili (`sw`)**.

```typescript
// mobile/src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './locales/en.json';
import fr from './locales/fr.json';
import sw from './locales/sw.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
    sw: { translation: sw },
  },
  lng: Localization.locale.split('-')[0],
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
```

---

## 14. Image & Media Handling

Image uploads are compressed on-device before uploading to Laravel Flysystem to conserve user bandwidth (NFR-058 target: upload under 3s on 3G).

```typescript
// mobile/src/utils/media.ts
import * as ImageManipulator from 'expo-image-manipulator';

export async function compressProductImage(uri: string): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1080 } }], // Resize max width to 1080px maintaining aspect ratio
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );
  return result.uri;
}
```

---

## 15. Video Pipeline Integration (Phase 2)

Phase 2 introduces shoppable short-form vertical videos (mini TikTok feed) for verified sellers.

```typescript
// mobile/src/features/video/components/VideoFeedPlayer.tsx
import React, { useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity } from 'react-native';
import { Video, ResizeMode } from 'expo-av';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface VideoFeedPlayerProps {
  videoUrl: string;
  sellerName: string;
  caption: string;
  isActive: boolean;
  onTagPress: (productId: string) => void;
}

export function VideoFeedPlayer({ videoUrl, sellerName, caption, isActive, onTagPress }: VideoFeedPlayerProps) {
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{ uri: videoUrl }}
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        shouldPlay={isActive && isPlaying}
        isLooping
      />
      <View style={styles.overlay}>
        <Text style={styles.seller}>@{sellerName}</Text>
        <Text style={styles.caption}>{caption}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: SCREEN_HEIGHT, width: '100%', backgroundColor: '#000' },
  video: { flex: 1 },
  overlay: { position: 'absolute', bottom: 40, left: 16, right: 80 },
  seller: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  caption: { color: '#FFF', fontSize: 14, marginTop: 4 },
});
```

---

## 16. Testing Strategy & Code Samples

### 16.1 Unit Test: Cart Store (`cart.store.test.ts`)

```typescript
// mobile/src/features/cart/store/__tests__/cart.store.test.ts
import { useCartStore } from '../cart.store';

describe('Cart Store', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it('should add item and calculate total correctly', () => {
    useCartStore.getState().addItem({
      productId: 'p-101',
      storeId: 's-1',
      name: 'Fresh Mangoes',
      price: 1500,
      quantity: 3,
      imageUrl: 'https://img.wunabuy.com/mango.jpg',
    });

    expect(useCartStore.getState().items.length).toBe(1);
    expect(useCartStore.getState().getTotal()).toBe(4500);
  });
});
```

---

## 17. CI/CD & Deployment Pipelines

### 17.1 Mobile Production Build (`eas.json`)

```json
{
  "cli": { "version": ">= 9.0.0" },
  "build": {
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "production": {
      "channel": "live",
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "android": { "serviceAccountKeyPath": "./play-store-key.json" },
      "ios": { "appleId": "dev@wunabuy.com", "ascAppId": "123456789" }
    }
  }
}
```

---

## 18. Performance Budgets & Optimization

- **FlashList Virtualization**: All long lists (products, orders, messages) use `@shopify/flash-list` rather than standard `FlatList` for zero frame drops during fast scrolling.
- **Vite Portal Bundle Splitting**: Manual chunking separates React core, UI libraries, and Chart engines to ensure vendor chunks cache indefinitely.

---

## 19. Accessibility Standards

- **Touch Target Padding**: All interactive mobile buttons enforce a minimum size of $48\times 48\,\text{dp}$ (NFR-034).
- **WCAG 2.1 AA Web Compliance**: Portal component colors meet contrast ratios $\ge 4.5:1$ for regular text and $\ge 3:1$ for heavy heading components. All table cells are keyboard-focusable with ARIA roles.

---

## 20. Appendices

### A. Currency Formatting Helper

```typescript
// packages/utils/src/format.ts
// Note: XAF-only for Phase 1 launch (Cameroon market), multi-currency deferred.
export function formatCurrency(amount: number, currency: 'XAF' = 'XAF'): string {
  const formatted = new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(amount);
  
  return currency === 'XAF' ? `${formatted} FCFA` : `${currency} ${formatted}`;
}
```

### B. Document Approval Signatures

| Role | Name | Signature | Date |
|---|---|---|---|
| Lead Frontend Architect | Brandon Forku | *Brandon Forku* | July 26, 2026 |
| Head of Product | Agemo Technologies Team | *Approved* | July 26, 2026 |

---

## 21. Security & Compliance

### 21.1 Security Principles

Wunabuy frontend applications shall be designed using a zero-trust mindset for all user-facing and staff-facing interfaces. Sensitive data in the browser, mobile device storage, and application state must be treated as potentially exposed to client-side tampering and must never be trusted without backend validation.

The frontend shall enforce the following principles:

- Token-based authentication only; no long-lived access tokens stored in plain text
- Protection of sensitive user data in encrypted keystore or secure browser storage
- Strict validation of all user input and server responses before rendering or mutation
- No direct access to privileged administrative operations from client-side controls without backend authorization checks
- Defense-in-depth for role-based logic, including route guards, component-level restrictions, and server-side enforcement
- Secure handling of image, document, and location data before upload or persistence

### 21.2 Authentication and Authorization Requirements

For mobile clients:

- Access tokens must be stored using platform secure storage (`react-native-keychain` on mobile)
- Refresh tokens must be rotated on every renewal cycle
- Session expiry and refresh failures must trigger automatic sign-out and redirect to login
- Biometric authentication may be considered only where explicitly permitted and audited

For staff portal:

- All privileged routes must enforce RBAC checks at both the route and component levels
- Session timeout must be enforced after inactivity windows, with a secure logout flow
- MFA is mandatory for privileged staff roles and administrative access
- Sensitive actions such as payout approvals, user suspension, and config mutation must require explicit confirmation and audit logging

### 21.3 Data Protection and Privacy

- Personal data must be masked in UI where appropriate, especially phone numbers, IDs, addresses, and payment references
- Payment details must never be stored in local Zustand state or persistent storage
- Sensitive config values and connection secrets must never be exposed in client bundles or environment files distributed to end users
- Geographic and location metadata must be handled according to consent and privacy requirements, especially for delivery and KYC flows

### 21.4 Compliance Expectations

The Wunabuy frontend must support compliance obligations related to:

- data minimization and least privilege access
- secure collection, transmission, and retention of user identity data
- auditability for money movement actions and enforcement decisions
- accessibility compliance for public-facing commerce and staff operations
- operational security for internal staff systems

The engineering team must maintain signed-off security review procedures for any frontend change impacting authentication, payout logic, payments, user PII, or privileged staff functions.

---

## 22. Observability & Monitoring

### 22.1 Goals

The frontend must provide visibility into application health, user experience quality, and failure patterns across both mobile and web channels. The objective is to detect issues before they materially impact users and to support incident response with actionable telemetry.

### 22.2 Required Monitoring Signals

The platform shall capture the following signal categories:

- Frontend crashes and unhandled exceptions
- Network failures and retry patterns
- Authentication failures and token refresh issues
- Mutation queue backups and sync failure rates
- API latency by endpoint and region
- Bundle load anomalies and screen render performance regressions
- User flow drop-off for critical journeys such as checkout, login, KYC approval, and delivery assignment

### 22.3 Tooling

Recommended tooling for production monitoring includes:

- Sentry or equivalent for mobile/web error monitoring and release tracking
- Application Performance Monitoring (APM) for API resilience and transaction timing
- Log aggregation such as Datadog, Elastic, or OpenTelemetry-based pipelines
- Real-time operational dashboards for queue health, auth errors, and critical flows
- Session replay or frontend telemetry for high-risk user journeys when approved under privacy controls

### 22.4 Alerting Rules

The system must define alert thresholds for:

- sustained API failure rate above agreed thresholds
- crash-free session rate falling below target
- login failure spikes for staff or buyers
- offline write queue backlog exceeding expected queue length
- delivery tracking signal loss beyond 10 minutes during active orders
- unusual payment, payout, or escrow anomalies

### 22.5 Post-Incident Review

All major frontend incidents must trigger a structured postmortem with:

- root cause analysis
- impact summary
- remediation steps
- prevention and detection additions
- ownership and target dates for closure

---

## 23. Environment Strategy & Release Management

### 23.1 Environment Model

The frontend shall operate across at least four environments:

- Development: for engineering iteration and feature validation
- QA/UAT: for business acceptance testing and regression validation
- Staging: near-production environment mirroring operational config
- Production: live environment for end users and staff operations

Each environment must have isolated configuration values for API endpoints, feature flags, analytics keys, and environment-specific security settings.

### 23.2 Configuration Management

Configuration must be externalized and environment-aware. The following data must not be hard-coded into production builds:

- API base URLs
- analytics identifiers
- feature flags
- payment gateway references
- staff role mappings
- environment-specific secrets or certificates

### 23.3 Deployment Strategy

The frontend release process shall include:

- automated build validation in CI
- static analysis, linting, and type-checking
- unit, integration, and E2E verification gates
- staged deployment approval for production changes
- rollback preparation for each release
- release notes documenting user-facing and engineering changes

For mobile apps:

- production builds must be generated through approved channels such as Expo EAS or equivalent signed build pipelines
- app versioning must follow semantic versioning and maintain compatibility with backend contracts
- OTA updates may be permitted only when signing and compatibility checks are validated

For the staff portal:

- production deployment shall use a controlled CI/CD pipeline with health verification and smoke checks before final release
- critical production changes must be behind feature flags where possible

### 23.4 Release Governance

No frontend release may be promoted to production without:

- successful CI pipeline completion
- test evidence covering affected flows
- product owner approval for user-facing changes
- security review for high-risk changes
- rollback plan confirmation by engineering leadership

---

## 24. Error Handling & Resilience

### 24.1 Frontend Error Philosophy

All user-facing interfaces must degrade gracefully. A failing request, stale cache, or slow network condition should never lead to a blank screen, broken workflow, or data loss.

### 24.2 Standard Error States

The frontend must implement explicit UX states for:

- network unavailable
- request timeout
- server error
- validation error
- unauthorized access
- stale or empty data
- pending background sync
- conflict resolution while offline writes are replayed

### 24.3 Retry and Backoff Rules

- Retry logic should be centralized in the API client layer
- Identity and auth-related requests should honor strict refresh and retry rules
- Non-idempotent requests must not be auto-retried without clear safety checks
- Retry policies must include exponential backoff and jitter for queue processing or flaky networks

### 24.4 Offline Sync and Conflict Management

When the mobile app is offline:

- user actions must be queued locally
- UI should clearly communicate pending sync state
- conflicts must be resolved deterministically using server-authoritative status and timestamps
- secondary operations must not silently fail without visible user feedback

### 24.5 Recovery and Restoration

The frontend should provide recovery paths such as:

- refresh state without full logout
- clear stale cache and retry
- resume queued transaction processing automatically on reconnect
- recover previously unsaved draft forms after session interruption

---

## 25. Frontend Governance & Standards

### 25.1 Coding Standards

The frontend codebase must follow explicit standards for consistency and maintainability across mobile and web apps.

Mandatory standards include:

- TypeScript-first development across all frontend packages
- no `any` without justification and approval
- shared domain types imported from `@wunabuy/types`
- strict linting and formatting enforcement
- consistent folder structure within features, modules, and shared services
- meaningful naming conventions for utilities, hooks, stores, and derived state

### 25.2 Package Ownership

Each shared package in the monorepo must have a clear owner and maintainability boundary.

Recommended ownership model:

- `design-tokens`: design system ownership
- `types`: API contract ownership with backend alignment
- `api-client`: frontend API contract and request handling ownership
- `realtime`: notification and streaming integration ownership
- `utils`: shared business utilities and locale formatting rules

### 25.3 Dependency Management

- dependencies must be version-pinned or lockfile-managed through `pnpm`
- major dependency upgrades must be tracked and reviewed in engineering change management
- security advisories must be monitored and remediated within defined SLA windows
- no unapproved third-party library may be introduced without security review

### 25.4 Documentation Standards

Every major frontend feature must have supporting documentation covering:

- user flow and business purpose
- technical assumptions and dependencies
- edge cases and failure modes
- accessibility and testing expectations
- ownership and maintenance guidance

### 25.5 Architecture Decision Records

New technical decisions that materially affect architecture, platform behavior, auth model, data flow, or infrastructure integration must be documented in ADR format or equivalent engineering record. This helps future maintainers understand the rationale for key decisions.

---

## 26. Quality Gates & Test Matrix

### 26.1 Testing Pyramid

Wunabuy frontend quality shall follow a layered test system:

- Unit tests for pure logic, utils, state reducers, formatting, and local utilities
- Integration tests for hooks, API client behavior, mutations, forms, and component interactions
- End-to-end tests for critical user journeys such as buyer checkout, seller KYC, staff login, and admin approvals
- Manual QA for device-specific and visual validation, especially for mobile network variability

### 26.2 Minimum Quality Gates

Every frontend change must pass the following before merge or deployment:

- lint validation
- TypeScript type-checking
- unit tests for changed behavior
- integration tests for affected modules
- UI or E2E regression check for critical flows
- accessibility inspection for impacted components
- security review for sensitive features

### 26.3 Test Coverage Expectations

The team should establish target thresholds such as:

- Unit test coverage for utilities and logic: minimum 80%
- Feature-level coverage for critical user flows: minimum 70%
- High-risk modules (payments, auth, KYC, payouts): 100% of critical branches tested

### 26.4 Critical User Journey Matrix

| Area | Platform | Primary Checks |
|---|---|---|
| Buyer registration/login | Mobile | OTP, token refresh, validation, logout |
| Product discovery and search | Mobile | filters, sorting, caching, empty states |
| Cart and checkout | Mobile | subtotal logic, payment selection, queue sync |
| Seller inventory management | Mobile | add/edit product, image upload, pricing validation |
| Delivery assignment workflow | Mobile | GPS updates, order states, queue sync |
| Staff authentication | Web | MFA, token expiry, RBAC checks |
| KYC review and approval | Web | review queue, notifications, escalation path |
| Finance approval and payouts | Web | reconciliation, ledger checks, audit trail |

### 26.5 CI/CD Validation Requirements

Every pull request must validate:

- code compile and package integrity
- app build generation for targeted platform
- test pass matrix for affected workspaces
- static analysis and lint checks
- no unresolved accessibility violations in impacted component tree

Production deployment must be blocked if any critical quality gate fails.

---

## Final Document Status

This version of the Wunabuy Frontend Technical Specification is intended to represent a production-ready engineering baseline for the company. It establishes the design principles, technical architecture, operational expectations, security posture, quality gates, and governance needed to move from planning into controlled implementation and release management.

The document remains a living specification and must be updated as the platform evolves, new product requirements are introduced, or significant technical decisions alter implementation strategy.

---
**End of Document**
