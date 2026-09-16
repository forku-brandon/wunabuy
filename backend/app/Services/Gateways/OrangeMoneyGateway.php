<?php

namespace App\Services\Gateways;

use App\Contracts\GatewayResponse;
use App\Contracts\PaymentGatewayInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * OrangeMoneyGateway
 *
 * Orange Money (Cameroon) gateway implementation.
 *
 * ─── ACTIVATION CHECKLIST (when licence is obtained) ─────────────────────────
 * 1. Set ORANGE_MONEY_STUB_MODE=false in .env
 * 2. Fill in ORANGE_MONEY_CLIENT_ID, ORANGE_MONEY_CLIENT_SECRET, ORANGE_MONEY_MERCHANT_KEY
 * 3. Replace stub body inside initiatePush() / initiatePull() with real API calls.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * @package App\Services\Gateways
 */
class OrangeMoneyGateway implements PaymentGatewayInterface
{
    private bool   $stubMode;
    private string $baseUrl;
    private string $clientId;
    private string $clientSecret;
    private string $merchantKey;

    public function __construct()
    {
        $cfg                = config('payment.orange', []);
        $this->stubMode     = (bool) ($cfg['stub_mode'] ?? true);
        $this->baseUrl      = rtrim($cfg['base_url'] ?? 'https://api.orange.com/orange-money-webpay/cm/v1', '/');
        $this->clientId     = $cfg['client_id'] ?? '';
        $this->clientSecret = $cfg['client_secret'] ?? '';
        $this->merchantKey  = $cfg['merchant_key'] ?? '';
    }

    // ─── Interface implementation ─────────────────────────────────────────────

    /**
     * Initiate Orange Money payment push (debit customer wallet).
     */
    public function initiatePush(string $phone, float $amount, string $reference, string $description): GatewayResponse
    {
        if ($this->stubMode) {
            Log::info('[OrangeMoneyGateway][STUB] initiatePush', compact('phone', 'amount', 'reference'));
            return GatewayResponse::pending($reference, $amount, 'orange',
                "Orange Money payment push sent to {$phone}. Awaiting authorization.");
        }

        // ── TODO: Uncomment when Orange Money licence is active ───────────────
        // $token = $this->getAccessToken();
        // $response = Http::withToken($token)
        //     ->withHeaders(['X-Merchant-Key' => $this->merchantKey])
        //     ->post("{$this->baseUrl}/webpayment", [
        //         'merchant_key'  => $this->merchantKey,
        //         'currency'      => 'XAF',
        //         'order_id'      => $reference,
        //         'amount'        => intval($amount),
        //         'return_url'    => config('app.url') . '/payment/callback/orange',
        //         'cancel_url'    => config('app.url') . '/payment/cancel',
        //         'notif_url'     => config('app.url') . '/api/v1/wallet/webhook/orange',
        //         'lang'          => 'fr',
        //         'reference'     => $reference,
        //     ]);
        // if ($response->successful()) {
        //     $payUrl = $response->json('payment_url');
        //     return GatewayResponse::pending($reference, $amount, 'orange',
        //         "Redirect customer to: {$payUrl}", $response->json());
        // }
        // return GatewayResponse::failed($reference, $amount, 'orange',
        //     $response->json('message') ?? 'Orange Money initiation failed',
        //     (string) $response->status(), $response->json());
        // ─────────────────────────────────────────────────────────────────────

        return GatewayResponse::failed($reference, $amount, 'orange', 'Orange Money gateway is not activated yet.');
    }

    /**
     * Initiate Orange Money payout (credit recipient wallet — used for withdrawals).
     */
    public function initiatePull(string $phone, float $amount, string $reference, string $description): GatewayResponse
    {
        if ($this->stubMode) {
            Log::info('[OrangeMoneyGateway][STUB] initiatePull', compact('phone', 'amount', 'reference'));
            return GatewayResponse::completed($reference, $amount, 'orange',
                "Orange Money payout to {$phone} queued.");
        }

        // ── TODO: Implement Orange Money B2C disbursement when licensed ───────
        return GatewayResponse::failed($reference, $amount, 'orange', 'Orange Money gateway is not activated yet.');
    }

    /**
     * Query transaction status by reference.
     */
    public function queryStatus(string $reference): GatewayResponse
    {
        if ($this->stubMode) {
            return GatewayResponse::completed($reference, 0, 'orange', 'Transaction completed (stub).');
        }

        // ── TODO: GET {baseUrl}/paymentstatus/{reference}
        return GatewayResponse::failed($reference, 0, 'orange', 'Orange Money gateway is not activated yet.');
    }

    /**
     * Parse and validate incoming Orange Money webhook notification.
     */
    public function handleWebhook(array $payload, string $signature): GatewayResponse
    {
        // ── TODO: Orange Money sends POST to notif_url with transaction status
        // Verify authenticity by checking the provided merchant_key matches
        // $receivedKey = $payload['merchant_key'] ?? '';
        // if ($receivedKey !== $this->merchantKey) {
        //     return GatewayResponse::failed('', 0, 'orange', 'Invalid merchant key', 'INVALID_KEY');
        // }

        $reference = $payload['order_id'] ?? $payload['txnid'] ?? Str::uuid();
        $status    = strtolower($payload['status'] ?? '');
        $amount    = (float) ($payload['amount'] ?? 0);

        if (in_array($status, ['success', 'successful', '00'])) {
            return GatewayResponse::completed($reference, $amount, 'orange',
                'Orange Money payment confirmed via webhook.', $payload);
        }

        return GatewayResponse::failed($reference, $amount, 'orange',
            $payload['message'] ?? 'Orange Money payment failed', $status, $payload);
    }

    public function isStubMode(): bool { return $this->stubMode; }
    public function getProviderCode(): string { return 'orange'; }

    // ─── Private helpers ──────────────────────────────────────────────────────

    /**
     * Obtain OAuth2 bearer token from Orange Money API.
     */
    private function getAccessToken(): string
    {
        // TODO: POST https://api.orange.com/oauth/v3/token
        // with client_credentials grant, client_id, client_secret
        // Cache for token TTL (typically 3600s)
        return '';
    }
}
