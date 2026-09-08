# Wunabuy Laravel 13 Modular Monolith Backend

Production-grade enterprise backend service for Wunabuy engineered with **Laravel 13**, **PHP 8.3**, and **PostgreSQL 18**.

## Architecture & Domain Services
- **Framework:** Laravel 13 (PHP 8.3+) with Sanctum stateful token middleware and Spatie RBAC.
- **Database:** PostgreSQL 18 with 23 tables across 15 migrations (`wallets`, `orders`, `transporters`, `disputes`, `audit_logs`, etc.) and pure Haversine geodesic routing.
- **Escrow Engine (`EscrowService.php`):** Dual-entry escrow locking, automated release with 3.5% platform commission deduction, dispute freezing, and binding arbitration rulings (`BUYER_REFUND`, `SELLER_RELEASE`, `SPLIT_50_50`).
- **Logistics & Parcel Chain of Custody (`LogisticsService.php`):** Haversine distance calculations, dynamic delivery fees by vehicle category (`BIKE`, `CAR`, `VAN`), HMAC-SHA256 signed parcel custody QR tags (`WB-PARCEL:...`), and background driver GPS breadcrumbs.
- **Fintech & Mobile Money (`PaymentService.php`):** High-fidelity USSD push simulation (`*126#` for MTN MoMo, `#150*50#` for Orange Money), instant wallet funding, and dual-control PIN verification for fraud thresholds ($\ge 500,000$ XAF).
- **Web Staff Portal API:** 18-permission RBAC matrix, immutable audit logging, and direct operational controllers across 7 departments.
- **Environment & Hosting:** Zero-code deployment switching via environment variables (`APP_URL`, `CORS_ALLOWED_ORIGINS`, `SANCTUM_STATEFUL_DOMAINS`).

## API Route Coverage
- **Total Registered Endpoints:** 123 production routes in `routes/api.php`
- **Standardized Response Envelopes:** `{ success: true, data: ..., meta: { timestamp, request_id } }`

## Local Setup & Run
```powershell
# Install PHP dependencies
composer install

# Environment setup
cp .env.example .env
php artisan key:generate

# Database migration & demo seeding
php artisan migrate --seed

# Start daemon server (default port 8000)
php artisan serve --port=8000
```

## Verification
```powershell
# Health check
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/health"

# Route catalog
php artisan route:list
```

For complete technical specifications, refer to [`docs/Wunabuy_Backend_Tech_Spec_v1.0.md`](file:///c:/Users/HP/Desktop/wunabuy%20mobile%20project/wunabuy/docs/Wunabuy_Backend_Tech_Spec_v1.0.md).
