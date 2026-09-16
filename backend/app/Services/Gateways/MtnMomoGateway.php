<?php

namespace App\Services\Gateways;

use App\Contracts\GatewayResponse;
use App\Contracts\PaymentGatewayInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * MtnMomoGateway
 *
 * MTN Mobile Money gateway implementation.
 *
 * ─── ACTIVATION CHECKLIST (when licence is obtained) ─────────────────────────
 * 1. Set MTN_MOMO_STUB_MODE=false in .env
 * 2. Fill in MTN_MOMO_API_KEY, MTN_MOMO_API_SECRET, MTN_MOMO_SUBSCRIPTION_KEY
 * 3. Set MTN_MOMO_TARGET_ENV=production
 * 4. Replace the stub body inside initiatePush() / initiatePull() / queryStatus()
 *    with real MTN MoMo SDK / REST API calls (see inline TODO comments).
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * @package App\Services\Gateways
 */
class MtnMomoGateway implements PaymentGatewayInterface
{
    private bool   $stubMode;
    private string $baseUrl;
    private string $apiKey;
    private string $apiSecret;
    private string $subscriptionKey;
    private string $targetEnv;

    public function __construct()
    {
        $cfg                   = config('payment.mtn', []);
        $this->stubMode        = (bool) ($cfg['stub_mode'] ?? true);
        $this->baseUrl         = rtrim($cfg['base_url'] ?? 'https://sandbox.momodeveloper.mtn.com', '/');
        $this->apiKey          = $cfg['api_key'] ?? '';
        $this->apiSecret       = $cfg['api_secret'] ?? '';
        $this->subscriptionKey = $cfg['subscription_key'] ?? '';
        $this->targetEnv       = $cfg['target_env'] ?? 'sandbox';
    }

    // ─── Interface implementation ─────────────────────────────────────────────

    /**
     * Request-to-Pay: debit the customer's MoMo wallet (wallet top-up / checkout).
     */
    public function initiatePush(string $phone, float $amount, string $reference, string $description): GatewayResponse
    {
        if ($this->stubMode) {
            Log::info('[MtnMomoGateway][STUB] initiatePush', compact('phone', 'amount', 'reference'));
            // Stub returns "pending" — mirrors real async MoMo behaviour.
            // Production: POST /collection/v1_0/requesttopay with bearer token.
            return GatewayResponse::pending($reference, $amount, 'mtn',
                "MTN MoMo push sent to {$phone}. Awaiting PIN confirmation.");
        }

        // ── TODO: Uncomment when MTN licence is active ────────────────────────
        // $token = $this->getAccessToken('collection');
        // $response = Http::withHeaders([
        //     'Authorization'          => "Bearer {$token}",
        //     'X-Reference-Id'         => $reference,
        //     'X-Target-Environment'   => $this->targetEnv,
        //     'Ocp-Apim-Subscription-Key' => $this->subscriptionKey,
        //     'Content-Type'           => 'application/json',
        // ])->post("{$this->baseUrl}/collection/v1_0/requesttopay", [
        //     'amount'       => (string) intval($amount),
        //     'currency'     => 'XAF',
        //     'externalId'   => $reference,
        //     'payer'        => ['partyIdType' => 'MSISDN', 'partyId' => ltrim($phone, '+')],
        //     'payerMessage' => $description,
        //     'payeeNote'    => $description,
        // ]);
        // if ($response->status() === 202) {
        //     return GatewayResponse::pending($reference, $amount, 'mtn');
        // }
        // return GatewayResponse::failed($reference, $amount, 'mtn',
        //     $response->json('message') ?? 'MTN push failed', (string) $response->status(), $response->json());
        // ─────────────────────────────────────────────────────────────────────

        return GatewayResponse::failed($reference, $amount, 'mtn', 'MTN gateway is not activated yet.');
    }

    /**
     * Transfer (Disbursement): credit the recipient's MoMo wallet (withdrawals/payouts).
     */
    public function initiatePull(string $phone, float $amount, string $reference, string $description): GatewayResponse
    {
        if ($this->stubMode) {
            Log::info('[MtnMomoGateway][STUB] initiatePull (disbursement)', compact('phone', 'amount', 'reference'));
            return GatewayResponse::completed($reference, $amount, 'mtn',
                "MTN MoMo payout to {$phone} queued.");
        }

        // ── TODO: Uncomment when MTN licence is active ────────────────────────
        // $token = $this->getAccessToken('disbursement');
        // $response = Http::withHeaders([...]) ->post("{$this->baseUrl}/disbursement/v1_0/transfer", [...]);
        // ─────────────────────────────────────────────────────────────────────

        return GatewayResponse::failed($reference, $amount, 'mtn', 'MTN gateway is not activated yet.');
    }

    /**
     * Query an existing transaction status by reference UUID.
     */
    public function queryStatus(string $reference): GatewayResponse
    {
        if ($this->stubMode) {
            // Stub always resolves pending → completed after first query
            return GatewayResponse::completed($reference, 0, 'mtn', 'Transaction completed (stub).');
        }

        // ── TODO: GET /collection/v1_0/requesttopay/{referenceId}
        return GatewayResponse::failed($reference, 0, 'mtn', 'MTN gateway is not activated yet.');
    }

    /**
     * Validate and parse MTN webhook callbacks.
     * MTN sends a POST to your webhook URL after async transaction completion.
     */
    public function handleWebhook(array $payload, string $signature): GatewayResponse
    {
        // ── TODO: Verify HMAC-SHA256 signature using MTN_MOMO_API_SECRET
        // $computed = hash_hmac('sha256', json_encode($payload), $this->apiSecret);
        // if (!hash_equals($computed, $signature)) {
        //     return GatewayResponse::failed('', 0, 'mtn', 'Invalid webhook signature', 'INVALID_SIGNATURE');
        // }

        $reference = $payload['externalId'] ?? $payload['financialTransactionId'] ?? Str::uuid();
        $status    = strtolower($payload['status'] ?? 'pending');
        $amount    = (float) ($payload['amount'] ?? 0);

        if ($status === 'successful') {
            return GatewayResponse::completed($reference, $amount, 'mtn',
                'MTN MoMo payment confirmed via webhook.', $payload);
        }

        return GatewayResponse::failed($reference, $amount, 'mtn',
            $payload['reason'] ?? 'MTN payment failed', $status, $payload);
    }

    public function isStubMode(): bool { return $this->stubMode; }
    public function getProviderCode(): string { return 'mtn'; }

    // ─── Private helpers ──────────────────────────────────────────────────────

    /**
     * Obtain OAuth2 bearer token from MTN MoMo API.
     * @param string $product 'collection' | 'disbursement'
     */
    private function getAccessToken(string $product): string
    {
        // TODO: POST /token with Basic Auth (apiKey:apiSecret, base64-encoded)
        // Cache the token for its TTL (typically 3600s)
        // $response = Http::withBasicAuth($this->apiKey, $this->apiSecret)
        //     ->withHeaders(['Ocp-Apim-Subscription-Key' => $this->subscriptionKey])
        //     ->post("{$this->baseUrl}/{$product}/token/");
        // return $response->json('access_token');
        return '';
    }
}
