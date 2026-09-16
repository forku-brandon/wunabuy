<?php

/**
 * payment.php — Wunabuy Payment Gateway Configuration
 *
 * ══════════════════════════════════════════════════════════════
 * HOW TO ACTIVATE A REAL PAYMENT PROVIDER:
 *
 *   1. Add your API credentials to the .env file.
 *   2. Set the provider's stub_mode to false in .env:
 *         MTN_MOMO_STUB_MODE=false
 *         ORANGE_MONEY_STUB_MODE=false
 *   3. The gateway will automatically route real API calls.
 *
 * While stub_mode=true the system runs entirely on internal
 * wallet balances — no real money moves.
 * ══════════════════════════════════════════════════════════════
 */

return [

    // ──────────────────────────────────────────────────────────────────────────
    // MTN Mobile Money (MoMo) — Cameroon
    // Docs: https://momodeveloper.mtn.com/
    // ──────────────────────────────────────────────────────────────────────────
    'mtn' => [
        'base_url'          => env('MTN_MOMO_BASE_URL', 'https://sandbox.momodeveloper.mtn.com'),

        // ── Insert values from MTN Developer Portal when licensed ──
        'api_key'           => env('MTN_MOMO_API_KEY', ''),
        'api_secret'        => env('MTN_MOMO_API_SECRET', ''),
        'subscription_key'  => env('MTN_MOMO_SUBSCRIPTION_KEY', ''),
        // ──────────────────────────────────────────────────────────

        'target_env'        => env('MTN_MOMO_TARGET_ENV', 'sandbox'),   // 'sandbox' | 'production'
        'stub_mode'         => env('MTN_MOMO_STUB_MODE', true),          // true = no real API calls
        'webhook_secret'    => env('MTN_MOMO_WEBHOOK_SECRET', ''),       // For HMAC signature verification
        'timeout_seconds'   => env('MTN_MOMO_TIMEOUT', 30),
    ],

    // ──────────────────────────────────────────────────────────────────────────
    // Orange Money — Cameroon
    // Docs: https://developer.orange.com/apis/om-webpay-cm
    // ──────────────────────────────────────────────────────────────────────────
    'orange' => [
        'base_url'          => env('ORANGE_MONEY_BASE_URL', 'https://api.orange.com/orange-money-webpay/cm/v1'),

        // ── Insert values from Orange Developer Portal when licensed ──
        'client_id'         => env('ORANGE_MONEY_CLIENT_ID', ''),
        'client_secret'     => env('ORANGE_MONEY_CLIENT_SECRET', ''),
        'merchant_key'      => env('ORANGE_MONEY_MERCHANT_KEY', ''),
        // ─────────────────────────────────────────────────────────────

        'stub_mode'         => env('ORANGE_MONEY_STUB_MODE', true),      // true = no real API calls
        'webhook_secret'    => env('ORANGE_MONEY_WEBHOOK_SECRET', ''),   // For notif_url verification
        'timeout_seconds'   => env('ORANGE_MONEY_TIMEOUT', 30),
    ],

    // ──────────────────────────────────────────────────────────────────────────
    // Escrow & Fee Configuration
    // ──────────────────────────────────────────────────────────────────────────
    'escrow' => [
        /**
         * Platform commission deducted from seller payout on successful delivery.
         * Formula: seller_net = subtotal - (subtotal × commission_rate)
         * Default: 3.5%
         */
        'commission_rate'   => (float) env('ESCROW_COMMISSION_RATE', 0.035),

        /**
         * Withdrawal processing fee applied to seller/transporter payouts.
         * Formula: withdrawal_fee = min(fee_cap, amount × payout_fee_rate)
         * Default: 1.5%, capped at 500 XAF
         */
        'payout_fee_rate'   => (float) env('PAYOUT_FEE_RATE', 0.015),
        'payout_fee_cap'    => (int)   env('PAYOUT_FEE_CAP', 500),

        /**
         * Minimum transaction thresholds (XAF).
         */
        'min_withdrawal'    => (int) env('MIN_WITHDRAWAL', 100),
        'min_deposit'       => (int) env('MIN_DEPOSIT', 100),

        /**
         * Delivery fee that goes 100% to the transporter (no commission applied).
         * Default: 1500 XAF
         */
        'default_delivery_fee' => (int) env('DEFAULT_DELIVERY_FEE', 1500),

        /**
         * Registration bonus credited to every new user.
         * This bonus is non-withdrawable (can only be spent on purchases).
         */
        'registration_bonus'   => (int) env('REGISTRATION_BONUS', 100),

        /**
         * Large payout threshold requiring manual staff authorization.
         */
        'large_payout_threshold' => (int) env('LARGE_PAYOUT_THRESHOLD', 100000),
    ],

];
