# Wunabuy — Multi-Sided E-Commerce & Logistics Platform

An enterprise multi-team monorepo repository for the Wunabuy ecosystem, powering mobile applications, web operations, and backend micro-services.

---

## 📁 Repository Structure

```
wunabuy/
├── backend/               # Laravel 13 Modular Monolith (PHP 8.3+, Eloquent, Sanctum, Horizon, Reverb)
│   ├── app/               # Core Application Service Providers & Middleware
│   ├── Modules/           # nwidart/laravel-modules (Auth, Commerce, Payment, Delivery, etc.)
│   ├── config/            # Horizon, Reverb, Sanctum, Permissions configuration
│   ├── database/          # PostgreSQL DDL Migrations & Seeders
│   └── routes/            # API v1 & Reverb WebSocket channels
│
├── mobile/                # Expo React Native App (iOS & Android for Buyers, Sellers, Transporters)
│   ├── src/               # Dynamic role navigation, Zustand stores, React Query
│   └── app.json           # Expo SDK 51 configuration
│
├── staff-portal/          # React Web Staff Portal (Vite 5 + Tailwind CSS + Radix UI)
│   ├── src/               # Departmental Dashboards (Finance, Ops, CS, Compliance, Marketing, IT)
│   └── vite.config.ts
│
├── packages/              # Shared Monorepo Packages
│   ├── design-tokens/     # Core color palette, typography scales, spacing tokens
│   ├── types/             # Shared TypeScript API contracts & domain interfaces
│   ├── api-client/        # Shared Axios instance with Sanctum refresh handling
│   ├── realtime/          # Laravel Reverb Echo WebSocket subscriptions
│   └── utils/             # XAF currency formatting, date, phone, geo helpers
│
├── docs/                  # Architecture & Product Specifications
│   ├── Wunabuy_PRD_v1.0.md                 # Product Requirements Document v1.1
│   ├── Wunabuy_SRS_v1.2.md                 # Software Requirements Specification v1.2
│   ├── Wunabuy_Backend_Tech_Spec_v1.0.md   # Canonical Laravel 13 Backend Technical Spec
│   └── Wunabuy_Frontend_Tech_Spec_v1.0.md  # Canonical Frontend Technical Spec
│
├── .github/
│   └── workflows/         # Enterprise CI/CD Pipelines
│       ├── backend-ci.yml
│       ├── mobile-ci.yml
│       └── staff-portal-ci.yml
│
├── pnpm-workspace.yaml    # Monorepo Workspace Configuration
├── turbo.json             # Turborepo Build Cache Configuration
├── package.json           # Monorepo Root Scripts
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v20 LTS
- **pnpm**: v9.0+
- **PHP**: v8.3+
- **Composer**: v2.6+
- **PostgreSQL**: v15+ (with PostGIS extension)
- **Redis**: v7.0+

### Installation

```bash
# 1. Install monorepo frontend dependencies
pnpm install

# 2. Setup backend Laravel application
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
```

### Running Development Servers

```bash
# Run Mobile Expo Client
pnpm dev:mobile

# Run Staff Portal Web Client
pnpm dev:staff

# Run Backend Laravel Application
pnpm dev:backend
```

---

## 📚 Technical Documentation

- 📄 [Product Requirements Document (PRD v1.1)](file:///c:/Users/HP/Desktop/wunabuy%20mobile%20project/wunabuy/docs/Wunabuy_PRD_v1.0.md)
- 📄 [Software Requirements Specification (SRS v1.2)](file:///c:/Users/HP/Desktop/wunabuy%20mobile%20project/wunabuy/docs/Wunabuy_SRS_v1.2.md)
- 📄 [Laravel 13 Backend Technical Specification (v1.0)](file:///c:/Users/HP/Desktop/wunabuy%20mobile%20project/wunabuy/docs/Wunabuy_Backend_Tech_Spec_v1.0.md)
- 📄 [Frontend Technical Specification (v1.0)](file:///c:/Users/HP/Desktop/wunabuy%20mobile%20project/wunabuy/docs/Wunabuy_Frontend_Tech_Spec_v1.0.md)

---
