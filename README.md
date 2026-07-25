# Wunabuy 🛒

> Multi-sided mobile e-commerce platform for the African market — connecting customers, stores, and transport providers with escrow payments and live delivery tracking.

[![Status](https://img.shields.io/badge/status-in%20development-orange)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()

## Overview

Wunabuy is a Pinduoduo-style e-commerce platform adapted for African markets. It connects three user groups — **buyers**, **sellers (store owners)**, and **transport providers** — into an integrated marketplace with escrow-based payments, real-time GPS delivery tracking, and a company Staff Portal for internal operations.

### Key Features

- 🏪 **Store Marketplace** — KYC-verified stores upload products, manage inventory
- 🔍 **Smart Discovery** — Rules-based ranking engine (location, price, quality, behavior)
- 💰 **Escrow Payments** — Mobile money (MTN MoMo, Orange Money) + card via Flutterwave/Paystack
- 📍 **Live Delivery Tracking** — Real-time GPS via Google Maps
- 💬 **In-App Chat** — Real-time messaging between all users
- 🎥 **Social Video Feed** (Phase 2) — Short-form product showcase videos with shoppable tags
- 🏢 **Staff Portal** — 6 department dashboards with RBAC and audit logging

## Project Structure

```
wunabuy/
├── wunabuy-backend/          # Node.js + TypeScript + Express API
├── wunabuy-mobile/           # React Native mobile app (Buyer, Seller, Transport)
├── wunabuy-staff-portal/     # React web app for company staff
├── docs/                     # SRS, backend tech spec, design docs
├── supabase/                 # Database migrations, RLS policies, edge functions
└── .github/                  # CI/CD workflows
```

## Documentation

| Document | Description |
|---|---|
| [SRS v1.2](docs/Wunabuy_SRS_v1.2.md) | Software Requirements Specification — full feature set |
| [Backend Tech Spec v1.0](docs/Wunabuy_Backend_Tech_Spec_v1.0.md) | Backend architecture, database schema, API spec |

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile App | React Native, Zustand, React Query, React Navigation |
| Staff Portal | React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Node.js 20, TypeScript, Express.js |
| Database | PostgreSQL 15 + PostGIS (Supabase) |
| Realtime | Supabase Realtime (WebSocket) |
| Serverless | Firebase Cloud Functions |
| Payments | Flutterwave + Paystack |
| Maps | Google Maps Platform |
| Video (Phase 2) | Mux / Cloudflare Stream |
| CI/CD | GitHub Actions |

## Getting Started

### Prerequisites

- Node.js 20 LTS
- PostgreSQL 15 with PostGIS
- Redis 7
- Supabase CLI
- Firebase CLI

### Backend Setup

```bash
cd wunabuy-backend
npm install
cp .env.example .env  # Fill in your values
npm run migrate:local
npm run seed:local
npm run dev
```

### Mobile App Setup

```bash
cd wunabuy-mobile
npm install
cp .env.example .env  # Fill in your values
npx expo start
```

### Staff Portal Setup

```bash
cd wunabuy-staff-portal
npm install
cp .env.example .env
npm run dev
```

## Development

### Branch Strategy

- `main` — Production-ready code
- `develop` — Integration branch
- `feature/*` — Feature branches
- `fix/*` — Bug fix branches
- `release/*` — Release preparation

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(auth): add phone OTP verification
fix(payment): handle gateway timeout gracefully
docs(api): update endpoint documentation
refactor(search): extract ranking service
```

## License

MIT — See [LICENSE](LICENSE) file for details.

## Team

Built by **Agemo Technologies**

---

*This project is in active development. See the [SRS](docs/Wunabuy_SRS_v1.2.md) for the complete feature specification.*
