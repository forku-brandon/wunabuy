# Wunabuy Laravel 13 Modular Monolith Backend

Production-grade enterprise backend service for Wunabuy engineered with **Laravel 13**, **PHP 8.3**, and **PostgreSQL 18**.

## Architecture & Domain Services
- **Framework:** Laravel 13 (PHP 8.3+) with Sanctum stateful token middleware and Spatie RBAC.
- **Database:** PostgreSQL 18 with 23 tables across 16 migrations (`wallets`, `orders`, `transporters`, `disputes`, `adverts`, `audit_logs`, etc.) and pure Haversine geodesic routing.
- **High-Performance Scale Indexing (v3.7):** 19 composite and partial indexes (`2026_09_14_050000_optimize_database_architecture_for_scale.php`) on orders, wallet ledger, products, dispatch queues, and KYC tables for 1M scale.
- **Dynamic Media Normalization (`HasNormalizedImages.php`):** Model trait automatically resolving relative `/uploads/...` paths to client-reachable absolute URLs via `$request->getSchemeAndHttpHost()`, eliminating cross-origin and LAN connectivity issues.
- **Universal Media & Avatar Uploads:** Dedicated endpoints for mobile user avatars (`POST /api/v1/user/avatar`), general store/product media (`POST /api/v1/upload/image`), and corporate staff avatars (`POST /api/v1/staff/profile/avatar`).
- **Marketing Adverts & Partnerships Engine:** Full CRUD API (`/api/v1/staff/adverts` and `GET /api/v1/adverts`) synchronizing promotional campaigns and partner badges with the mobile app.
- **Escrow Engine (`EscrowService.php`):** Dual-entry escrow locking, automated release with 3.5% platform commission deduction, dispute freezing, and binding arbitration rulings (`BUYER_REFUND`, `SELLER_RELEASE`, `SPLIT_50_50`).
- **Logistics & Parcel Chain of Custody (`LogisticsService.php`):** Haversine distance calculations, dynamic delivery fees by vehicle category (`BIKE`, `CAR`, `VAN`), HMAC-SHA256 signed parcel custody QR tags (`WB-PARCEL:...`), and background driver GPS breadcrumbs.
- **Fintech & Mobile Money (`PaymentService.php`):** High-fidelity USSD push simulation (`*126#` for MTN MoMo, `#150*50#` for Orange Money), instant wallet funding, and dual-control PIN verification for fraud thresholds ($\ge 500,000$ XAF).
- **Web Staff Portal API:** 18-permission RBAC matrix, immutable audit logging, and direct operational controllers across 7 departments.
- **Environment & Hosting:** Zero-code deployment switching via environment variables (`APP_URL`, `CORS_ALLOWED_ORIGINS`, `SANCTUM_STATEFUL_DOMAINS`).
- **Token Self-Healing & Session Recovery (`AuthController.php`):** Token auto-refresh (`POST /api/v1/auth/refresh`) and developer test session minting (`POST /api/v1/auth/dev-session`) for frictionless mobile testing.
- **Anti-IDOR Authorization & Zero Fallbacks (v3.5):** Strict role-based ownership enforcement across all mutations (order fulfillment, escrow release, order cancellation, product catalog modifications, and delivery jobs). Total elimination of `::first()` database fallbacks — unassigned or unauthorized requests strictly return HTTP 403 or HTTP 404.
- **Zero-Demo Profile & Store Management:** Live endpoints for Seller Store branding & pickup instructions (`POST /api/v1/seller/store/profile`), Transporter vehicle & license management (`GET /api/v1/transporter/profile`, `POST /api/v1/transporter/profile`), and profile updates with strict unique phone/email validation (`PUT /api/v1/users/me`). 100% of catalog products affiliated to verified merchant *Brandon Official Tech Store*.

## API Route Coverage
- **Total Registered Endpoints:** 127 production routes in `routes/api.php`
- **Standardized Response Envelopes:** `{ success: true, data: ..., meta: { timestamp, request_id } }`
- **Authentication & Self-Healing:**
  - `POST /api/v1/auth/login-pin` — Phone + 6-digit bcrypt PIN login
  - `POST /api/v1/auth/register` — Account registration with role initialization
  - `POST /api/v1/auth/refresh` — Sanctum token renewal
  - `POST /api/v1/auth/dev-session` — Local dev token minting without manual re-login
  - `POST /api/v1/user/switch-role` — RBAC role switching with capability enforcement

## Local Setup & Run
```powershell
# Install PHP dependencies
composer install

# Environment setup
cp .env.example .env
php artisan key:generate

# Database migration & schema setup
php artisan migrate

# Start server accessible to mobile devices on LAN (0.0.0.0)
php artisan serve --host=0.0.0.0 --port=8000
```

## Verification
```powershell
# Health check
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/health"

# Route catalog
php artisan route:list
```

For complete technical specifications, refer to [`docs/Wunabuy_Backend_Tech_Spec_v1.0.md`](file:///c:/Users/HP/Desktop/wunabuy%20mobile%20project/wunabuy/docs/Wunabuy_Backend_Tech_Spec_v1.0.md).
