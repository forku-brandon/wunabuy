<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * WalletController
 *
 * Handles all buyer, seller, and transporter wallet operations:
 *   - Balance queries (full + lightweight)
 *   - Wallet top-up via MTN MoMo / Orange Money
 *   - Withdrawal / payout requests
 *   - Transaction ledger history
 *   - Transaction status polling
 *   - Payment gateway webhook callbacks
 *
 * @package App\Http\Controllers\Api
 */
class WalletController extends Controller
{
    public function __construct(protected PaymentService $paymentService)
    {
    }

    // ─── Balance ──────────────────────────────────────────────────────────────

    /**
     * Get full wallet details: balances, escrow, withdrawable, and metadata.
     */
    public function getWallet(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return $this->respondError('UNAUTHORIZED', 'Authentication required', null, 401);
        }

        $wallet = Wallet::firstOrCreate(
            ['user_id' => $user->id],
            [
                'currency'              => 'XAF',
                'balance_available'     => 0,
                'balance_escrow_locked' => 0,
                'registration_bonus'    => (int) config('payment.escrow.registration_bonus', 100),
                'is_active'             => true,
            ]
        );

        $avail       = (float) ($wallet->balance_available ?? 0);
        $locked      = (float) ($wallet->balance_escrow_locked ?? 0);
        $bonus       = (float) ($wallet->registration_bonus ?? 0);
        $withdrawable = max(0, $avail - $bonus);

        return $this->respondSuccess([
            'wallet_id'              => $wallet->id,
            'currency'               => $wallet->currency ?? 'XAF',
            'balance_available'      => $avail,
            'balance_escrow_locked'  => $locked,
            'balance_total'          => $avail + $locked,
            'registration_bonus'     => $bonus,
            'balance_withdrawable'   => $withdrawable,
            'is_active'              => (bool) ($wallet->is_active ?? true),
            'last_updated_at'        => $wallet->updated_at?->toIso8601String() ?? now()->toIso8601String(),
            // ── Fee info for display in app ──
            'fee_info' => [
                'payout_fee_rate'       => PaymentService::payoutFeeRate(),
                'payout_fee_cap_xaf'    => PaymentService::payoutFeeCap(),
                'platform_commission'   => PaymentService::commissionRate(),
                'min_withdrawal_xaf'    => PaymentService::minWithdrawal(),
                'min_deposit_xaf'       => PaymentService::minDeposit(),
            ],
        ]);
    }

    /**
     * Lightweight balance-only endpoint for quick polling without full wallet load.
     * Used by CheckoutPaymentScreen and WalletScreen balance refresh.
     */
    public function getBalance(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return $this->respondError('UNAUTHORIZED', 'Authentication required', null, 401);
        }

        $wallet = Wallet::where('user_id', $user->id)->first();

        $avail  = (float) ($wallet?->balance_available ?? 0);
        $locked = (float) ($wallet?->balance_escrow_locked ?? 0);
        $bonus  = (float) ($wallet?->registration_bonus ?? 0);

        return $this->respondSuccess([
            'balance_available'     => $avail,
            'balance_escrow_locked' => $locked,
            'balance_withdrawable'  => max(0, $avail - $bonus),
            'currency'              => 'XAF',
            'timestamp'             => now()->toIso8601String(),
        ]);
    }

    // ─── Top-Up ───────────────────────────────────────────────────────────────

    /**
     * Initiate wallet top-up via MTN MoMo or Orange Money.
     * In stub mode: immediately credits and returns completed.
     * In live mode: initiates gateway push, returns pending (credit on webhook).
     */
    public function fund(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return $this->respondError('UNAUTHORIZED', 'Authentication required', null, 401);
        }

        $amount = (float) $request->input('amount', 0);
        if ($amount < PaymentService::minDeposit()) {
            return $this->respondError(
                'VALIDATION_ERROR',
                'Minimum deposit amount is ' . PaymentService::minDeposit() . ' XAF.',
                ['amount' => ['Minimum is ' . PaymentService::minDeposit() . ' XAF.']],
                422
            );
        }

        $phone    = $request->input('phone', $user->phone);
        $provider = strtolower($request->input('provider', 'mtn'));

        if (!in_array($provider, ['mtn', 'orange'])) {
            return $this->respondError('VALIDATION_ERROR', 'Provider must be mtn or orange.', null, 422);
        }

        if (!$phone) {
            return $this->respondError('VALIDATION_ERROR', 'Phone number is required for MoMo top-up.', null, 422);
        }

        try {
            $result = $this->paymentService->initiateMoMoFund($user, $amount, $phone, $provider);
            return $this->respondSuccess($result);
        } catch (\RuntimeException $e) {
            return $this->respondError('PAYMENT_ERROR', $e->getMessage(), null, 422);
        }
    }

    // ─── Withdrawal ───────────────────────────────────────────────────────────

    /**
     * Request withdrawal payout to MTN MoMo, Orange Money, or Bank.
     * Enforces: minimum amount, non-withdrawable bonus, sufficient balance.
     */
    public function withdraw(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return $this->respondError('UNAUTHORIZED', 'Authentication required', null, 401);
        }

        $amount = (float) $request->input('amount', 0);
        if ($amount < PaymentService::minWithdrawal()) {
            return $this->respondError(
                'VALIDATION_ERROR',
                'Minimum withdrawal amount is ' . PaymentService::minWithdrawal() . ' XAF.',
                ['amount' => ['Minimum is ' . PaymentService::minWithdrawal() . ' XAF.']],
                422
            );
        }

        $phone    = $request->input('phone', $user->phone);
        $provider = strtolower($request->input('provider', 'mtn'));

        if (!in_array($provider, ['mtn', 'orange'])) {
            return $this->respondError('VALIDATION_ERROR', 'Provider must be mtn or orange.', null, 422);
        }

        if (!$phone) {
            return $this->respondError('VALIDATION_ERROR', 'Phone number is required for withdrawal.', null, 422);
        }

        try {
            $result = $this->paymentService->requestPayout($user, $amount, $phone, $provider);
            return $this->respondSuccess($result);
        } catch (\RuntimeException $e) {
            return $this->respondError('WITHDRAWAL_ERROR', $e->getMessage(), ['amount' => [$e->getMessage()]], 422);
        }
    }

    // ─── Transaction Ledger ───────────────────────────────────────────────────

    /**
     * Wallet transaction ledger history (last 50 transactions, newest first).
     */
    public function getTransactions(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return $this->respondPaginated([], false, null, 0);
        }

        $wallet = Wallet::where('user_id', $user->id)->first();
        if (!$wallet) {
            return $this->respondPaginated([], false, null, 0);
        }

        $type     = $request->query('type');      // 'credit' | 'debit' | null
        $provider = $request->query('provider');  // 'mtn' | 'orange' | 'escrow' | null

        $query = WalletTransaction::where('wallet_id', $wallet->id)->latest('created_at');

        if ($type)     { $query->where('type', $type); }
        if ($provider) { $query->where('provider', $provider); }

        $transactions = $query->take(50)->get()->map(function ($tx) {
            return [
                'id'          => $tx->id,
                'wallet_id'   => $tx->wallet_id,
                'type'        => $tx->type,
                'amount'      => abs((float) $tx->amount),
                'is_debit'    => (float) $tx->amount < 0,
                'currency'    => $tx->currency ?? 'XAF',
                'description' => $tx->description ?? 'Wallet Transaction',
                'provider'    => $tx->provider ?? 'escrow',
                'status'      => $tx->status ?? 'completed',
                'reference'   => $tx->reference ?? ('TX-' . substr($tx->id, 0, 8)),
                'created_at'  => $tx->created_at?->toIso8601String() ?? now()->toIso8601String(),
            ];
        });

        return $this->respondPaginated($transactions, false, null, count($transactions));
    }

    // ─── Transaction Status ───────────────────────────────────────────────────

    /**
     * Check and synchronise transaction status by ID or reference.
     * Queries the gateway if the transaction is still pending.
     */
    public function checkTransactionStatus(string $id): JsonResponse
    {
        $result = $this->paymentService->checkTransactionStatus($id);
        return $this->respondSuccess($result);
    }

    // ─── Webhooks ─────────────────────────────────────────────────────────────

    /**
     * Handle incoming MTN MoMo webhook notification.
     *
     * MTN sends async payment confirmation to this endpoint.
     * Must return HTTP 200 immediately — processing errors are logged.
     *
     * Header: X-MTN-Signature — HMAC-SHA256 of raw body using MTN_MOMO_WEBHOOK_SECRET
     */
    public function webhookMtn(Request $request): JsonResponse
    {
        $signature = $request->header('X-MTN-Signature', '');
        $payload   = $request->all();

        Log::info('[WalletController] MTN webhook received', [
            'reference' => $payload['externalId'] ?? 'unknown',
            'status'    => $payload['status'] ?? 'unknown',
        ]);

        try {
            $result = $this->paymentService->processWebhook('mtn', $payload, $signature);
            return response()->json(['received' => true, 'processed' => $result['processed'] ?? false]);
        } catch (\Exception $e) {
            Log::error('[WalletController] MTN webhook processing failed', ['error' => $e->getMessage()]);
            // Always return 200 to prevent MTN from retrying indefinitely
            return response()->json(['received' => true, 'processed' => false]);
        }
    }

    /**
     * Handle incoming Orange Money webhook notification.
     *
     * Orange Money sends payment confirmation to the notif_url.
     * Must return HTTP 200 immediately.
     */
    public function webhookOrange(Request $request): JsonResponse
    {
        $signature = $request->header('X-Orange-Signature', $request->input('merchant_key', ''));
        $payload   = $request->all();

        Log::info('[WalletController] Orange Money webhook received', [
            'reference' => $payload['order_id'] ?? 'unknown',
            'status'    => $payload['status'] ?? 'unknown',
        ]);

        try {
            $result = $this->paymentService->processWebhook('orange', $payload, $signature);
            return response()->json(['received' => true, 'processed' => $result['processed'] ?? false]);
        } catch (\Exception $e) {
            Log::error('[WalletController] Orange webhook processing failed', ['error' => $e->getMessage()]);
            return response()->json(['received' => true, 'processed' => false]);
        }
    }
}
