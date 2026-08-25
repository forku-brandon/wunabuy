# Wunabuy Laravel 13 Modular Monolith Backend

This directory contains the production-grade Laravel 13 backend service for Wunabuy.

## Architecture
- **Framework:** Laravel 13 (PHP 8.3+)
- **Modular Layout:** Managed via `nwidart/laravel-modules` across 10 domain modules (`Auth`, `Commerce`, `Payment`, `Delivery`, `Chat`, `KYC`, `Search`, `Video`, `Staff`, `Notification`).
- **Database:** PostgreSQL 15 + PostGIS spatial extensions.
- **Queues:** Laravel Horizon with Redis backend.
- **WebSockets:** Laravel Reverb for real-time delivery tracking and chat messaging.
- **Authentication:** Laravel Sanctum API Tokens + TOTP MFA for Staff Portal.

## Local Setup
```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan horizon
php artisan reverb:start
php artisan serve
```

For complete specifications, refer to [docs/Wunabuy_Backend_Tech_Spec_v1.0.md](file:///c:/Users/HP/Desktop/wunabuy%20mobile%20project/wunabuy/docs/Wunabuy_Backend_Tech_Spec_v1.0.md).
