<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class WalletController extends Controller
{
    public function __construct(protected PaymentService $paymentService)
    {
    }

    /**
     * Get wallet balances (escrow vs available).
     */
    public function getWallet(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return $this->respondError('UNAUTHORIZED', 'Authentication required', null, 401);
        }
        $wallet = $user->wallet ?? Wallet::where('user_id', $user->id)->first();

        if (!$wallet && $user) {
            $wallet = Wallet::create([
                'id' => (string) Str::uuid(),
                'user_id' => $user->id,
                'currency' => 'XAF',
                'balance_available' => 100.00,
                'registration_bonus' => 100.00,
                'balance_escrow_locked' => 0.00,
                'is_active' => true,
            ]);
        }

        $avail = (float) ($wallet->balance_available ?? 0);
        $locked = (float) ($wallet->balance_escrow_locked ?? 0);
        $bonus = (float) ($wallet->registration_bonus ?? 0);
        $withdrawable = max(0, $avail - $bonus);

        return $this->respondSuccess([
            'wallet_id' => $wallet->id ?? 'wal_demo',
            'currency' => $wallet->currency ?? 'XAF',
            'balance_available' => $avail,
            'balance_escrow_locked' => $locked,
            'balance_total' => $avail + $locked,
            'registration_bonus' => $bonus,
            'balance_withdrawable' => $withdrawable,
            'is_active' => (bool) ($wallet->is_active ?? true),
            'last_updated_at' => $wallet->updated_at?->toIso8601String() ?? now()->toIso8601String(),
        ]);
    }

    /**
     * Top-up funding via Mobile Money.
     */
    public function fund(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return $this->respondError('UNAUTHORIZED', 'Authentication required', null, 401);
        }

        $amount = (float) $request->input('amount', 0);
        if ($amount < 100) {
            return $this->respondError('VALIDATION_ERROR', 'Minimum funding amount is 100 XAF.', ['amount' => ['Minimum is 100 XAF.']], 422);
        }

        $phone = $request->input('phone', $user->phone);
        $provider = $request->input('provider', 'mtn');

        $result = $this->paymentService->initiateMoMoFund($user, $amount, $phone, $provider);

        return $this->respondSuccess($result);
    }

    /**
     * Request withdrawal payout.
     */
    public function withdraw(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return $this->respondError('UNAUTHORIZED', 'Authentication required', null, 401);
        }

        $amount = (float) $request->input('amount', 0);
        if ($amount < 100) {
            return $this->respondError('VALIDATION_ERROR', 'Minimum withdrawal amount is 100 XAF.', ['amount' => ['Minimum is 100 XAF.']], 422);
        }

        $phone = $request->input('phone', $user->phone);
        $provider = $request->input('provider', 'mtn');

        try {
            $result = $this->paymentService->requestPayout($user, $amount, $phone, $provider);
            return $this->respondSuccess($result);
        } catch (\RuntimeException $e) {
            return $this->respondError('WITHDRAWAL_RESTRICTED', $e->getMessage(), ['amount' => [$e->getMessage()]], 422);
        }
    }

    /**
     * Wallet transaction ledger history.
     */
    public function getTransactions(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            // Unauthenticated callers receive an empty ledger
            return $this->respondPaginated([], false, null, 0);
        }

        $wallet = $user->wallet;
        if (!$wallet) {
            return $this->respondPaginated([], false, null, 0);
        }

        $transactions = WalletTransaction::where('wallet_id', $wallet->id)
            ->latest('created_at')
            ->take(50)
            ->get()
            ->map(function ($tx) {
                return [
                    'id' => $tx->id,
                    'wallet_id' => $tx->wallet_id,
                    'type' => $tx->type,
                    'amount' => (float) $tx->amount,
                    'currency' => $tx->currency ?? 'XAF',
                    'description' => $tx->description ?? 'Wallet Transaction',
                    'provider' => $tx->provider ?? 'wallet_escrow',
                    'status' => $tx->status ?? 'completed',
                    'reference' => $tx->reference ?? ('TX-' . substr($tx->id, 0, 8)),
                    'created_at' => $tx->created_at?->toIso8601String() ?? now()->toIso8601String(),
                ];
            });

        return $this->respondPaginated($transactions, false, null, count($transactions));
    }

    /**
     * Check transaction status by ID.
     */
    public function checkTransactionStatus(string $id): JsonResponse
    {
        $tx = WalletTransaction::where('id', $id)->orWhere('reference', $id)->first();
        $wallet = $tx ? $tx->wallet : null;

        return $this->respondSuccess([
            'transaction_id' => $id,
            'status' => $tx ? $tx->status : 'completed',
            'amount' => $tx ? abs((float) $tx->amount) : 0,
            'new_balance' => (float) ($wallet?->balance_available ?? 0),
        ]);
    }

    /**
     * Charge payment gateway.
     */
    public function chargePayment(Request $request): JsonResponse
    {
        $result = $this->paymentService->chargePayment($request->all());

        return $this->respondSuccess($result);
    }

    /**
     * Verify payment status.
     */
    public function verifyPayment(string $ref): JsonResponse
    {
        $result = $this->paymentService->verifyPayment($ref);

        return $this->respondSuccess($result);
    }
}
