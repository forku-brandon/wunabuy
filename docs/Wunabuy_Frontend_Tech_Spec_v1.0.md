# Wunabuy — Frontend Technical Specification
### Version 1.0 | July 2026

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
9. [Real-Time Services (Supabase Realtime)](#9-real-time-services-supabase-realtime)
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

---

## 1. Architecture Overview

### 1.1 Frontend Landscape

Wunabuy consists of two core client applications connected to a single unified Node.js/Supabase backend:

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
│                    WUNABUY BACKEND INFRASTRUCTURE                           │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │              Express API Gateway (Node.js/TypeScript)               │   │
│   │           /api/v1/* (Mobile)   |   /api/v1/staff/* (Portal)         │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │                                      │
│   ┌──────────────────────────────────▼──────────────────────────────────┐   │
│   │           Supabase (PostgreSQL 15 + PostGIS + Realtime)             │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

### 2.1 Mobile App Stack (React Native)

- **Framework**: React Native 0.74+ with Expo SDK 51+ (Hermes JS Engine enabled).
- **Navigation**: React Navigation 6 (Native Stack, Bottom Tabs, Drawer).
- **State Management**:
  - Client state: Zustand 4.x (persisted with `@react-native-async-storage/async-storage`).
  - Server state / Caching: TanStack React Query 5.x.
- **API & Networking**: Axios 1.x with refresh interceptors; `@supabase/supabase-js` for WebSockets.
- **UI & Styling**: Custom Design System built with React Native `StyleSheet` driven by `@wunabuy/design-tokens`.
- **Maps & Geolocation**: `react-native-maps` with Google Maps SDK; `expo-location` for background GPS.
- **Secure Token Storage**: `react-native-keychain` (Encrypted Storage on Android / Keychain on iOS).
- **Media & Images**: `expo-image` (disk caching, BlurHash placeholders) and `expo-image-manipulator` (compression).
- **Notifications**: `@react-native-firebase/messaging` + `notifee` (FCM for Android, APNs for iOS).
- **Internationalization**: `i18next` + `react-i18next` (English, French, Swahili).

### 2.2 Staff Portal Stack (React Web)

- **Framework**: React 18.x + Vite 5.x.
- **Routing**: React Router 6.x with route-level code splitting (`React.lazy`).
- **State Management**: Zustand 4.x (Client/Auth) + TanStack React Query 5.x (Server).
- **Styling & UI**: Tailwind CSS 3.x configured with design tokens, built on Radix UI primitives.
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
│   ├── realtime/          # Supabase Realtime channels & event payload helpers
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

## 4. Design System

The Wunabuy design system provides unified visual consistency while catering to mobile high-contrast outdoor visibility and staff data density.

### 4.1 Color Palette

```typescript
// packages/design-tokens/src/colors.ts
export const colors = {
  // Primary Brand Colors (Teal)
  primary: {
    50: '#E6F4F1',
    100: '#C2E4DD',
    200: '#8FCABE',
    300: '#5BAFA0',
    400: '#35968A',
    500: '#1A7A6E', // Main Primary Teal
    600: '#156358',
    700: '#114E45',
    800: '#0D3931',
    900: '#082821',
  },

  // Secondary Accent Colors (Warm Orange/Amber)
  accent: {
    50: '#FFF8ED',
    100: '#FEECDC',
    200: '#FCD7B5',
    300: '#FABF88',
    400: '#F79E55',
    500: '#EA8C04', // Vibrant Orange CTA / Sale Badge
    600: '#C66C02',
    700: '#9B4F02',
    800: '#753904',
    900: '#542704',
  },

  // Role Color Coding
  role: {
    buyer: '#1A7A6E',       // Primary Teal
    seller: '#2563EB',      // Deep Blue
    transporter: '#EA8C04', // Orange
    staff: '#4F46E5',       // Indigo
  },

  // Neutrals
  neutral: {
    0: '#FFFFFF',
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
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

### 4.2 Typography Scale

| Token | Size (sp/px) | Line Height | Weight | Mobile Usage | Staff Portal Usage |
|---|---|---|---|---|---|
| `display` | 32 | 40 | 700 (Bold) | Hero banners, onboarding | Page headlines |
| `h1` | 24 | 32 | 700 (Bold) | Screen headers | Section headers |
| `h2` | 20 | 28 | 600 (SemiBold) | Card titles, group headers | Table section titles |
| `h3` | 18 | 24 | 600 (SemiBold) | Product names, modals | Widget titles |
| `bodyLarge` | 16 | 24 | 400 / 500 | Body text, input values | Primary table text |
| `bodyMedium` | 14 | 20 | 400 (Regular) | Secondary details, descriptions | Standard table text |
| `caption` | 12 | 16 | 400 / 500 | Timestamps, badge text | Dense metadata, footnotes |

---

## 5. Mobile App — React Native Specification

The mobile app incorporates three distinct role views in a single codebase with dynamic role switching.

### 5.1 Screen Inventory

#### 1. Buyer Flow
- **Home (`HomeScreen`)**: Search bar, category grid, featured products carousel, nearby stores (PostGIS distance), active order tracker widget.
- **Search & Discovery (`SearchScreen`)**: Full-text search, filter bottom sheet (price range, distance radius, rating, quality tier), sort options (smart rank, distance, price).
- **Product Detail (`ProductDetailScreen`)**: Multi-image gallery with zoom, seller store card, stock badge, quality indicator (New/Like New/Good/Fair), customer reviews list, "Add to Cart" and "Chat Seller" CTAs.
- **Cart & Checkout (`CartScreen`, `CheckoutScreen`)**: Cart item list with quantity controls, delivery address selector, delivery fee estimator, payment method selector (MTN MoMo, Orange Money, Credit Card via Flutterwave/Paystack), escrow terms acknowledgment.
- **Order Tracking (`OrderTrackingScreen`)**: Live Google Map with real-time transporter marker, route polyline, ETA countdown, order status step timeline, direct call/chat transporter.

#### 2. Seller (Store Owner) Flow
- **Seller Dashboard (`SellerDashboardScreen`)**: Today's revenue, order count, pending escrow balance, store rating summary, quick-action buttons.
- **Product Management (`ProductListScreen`, `AddProductScreen`)**: Product grid with stock toggle, image picker (up to 5 photos), category picker, quality tier selector, price & inventory input.
- **Store Order Fulfillment (`SellerOrdersScreen`)**: Tabbed order list (`Pending`, `Preparing`, `Ready`, `Completed`), "Accept Order", "Mark Ready for Pickup", print shipping slip.
- **Wallet & Payouts (`SellerWalletScreen`)**: Total escrow balance, available balance for payout, payout history, bank/MoMo withdrawal request modal.
- **KYC Submission (`KYCOnboardingScreen`)**: Multi-step submission (Government ID front/back, storefront photo with GPS timestamp, business registration document).

#### 3. Transport Provider Flow
- **Jobs Dashboard (`DeliveryJobsScreen`)**: Nearby available delivery requests, distance to pickup, delivery fee, item size indicator, "Accept Job" CTA.
- **Active Delivery Workflow (`ActiveDeliveryScreen`)**:
  - Step 1: Navigate to store (Google Maps Directions).
  - Step 2: Confirm pickup & upload store pickup receipt photo.
  - Step 3: Navigate to buyer location (Background GPS broadcasting at 10s intervals).
  - Step 4: Confirm delivery, capture recipient delivery photo, release escrow trigger.
- **Earnings (`TransporterEarningsScreen`)**: Daily/weekly earnings charts, completed trip count, payout logs.

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

  // Request Interceptor: Attach JWT
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

## 9. Real-Time Services (Supabase Realtime)

Real-time channels handle order tracking updates, in-app messaging, and staff alerts.

```typescript
// packages/realtime/src/tracking-channel.ts
import { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';

export interface GPSLocationUpdate {
  order_id: string;
  transporter_id: string;
  latitude: number;
  longitude: number;
  heading: number;
  timestamp: string;
}

export function subscribeToDeliveryTracking(
  supabase: SupabaseClient,
  orderId: string,
  onLocationUpdate: (update: GPSLocationUpdate) => void
): RealtimeChannel {
  const channel = supabase.channel(`tracking:${orderId}`);

  channel
    .on('broadcast', { event: 'gps_update' }, (payload) => {
      onLocationUpdate(payload.payload as GPSLocationUpdate);
    })
    .subscribe();

  return channel;
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

Image uploads are compressed on-device before uploading to Supabase Storage to conserve user bandwidth (NFR-058 target: upload under 3s on 3G).

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
export function formatCurrency(amount: number, currency: 'XAF' | 'NGN' | 'KES' = 'XAF'): string {
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
**End of Document**
