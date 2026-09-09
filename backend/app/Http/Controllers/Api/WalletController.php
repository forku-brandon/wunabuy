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
        $user = $request->user() ?? User::where('role', 'buyer')->first() ?? User::first();
        $wallet = $user ? $user->wallet : Wallet::first();

        if (!$wallet && $user) {
            $wallet = Wallet::create([
                'id' => (string) Str::uuid(),
                'user_id' => $user->id,
                'currency' => 'XAF',
                'balance_available' => 0,
                'balance_escrow_locked' => 0,
                'is_active' => true,
            ]);
        }

        $avail = (float) ($wallet->balance_available ?? 0);
        $locked = (float) ($wallet->balance_escrow_locked ?? 0);

        return $this->respondSuccess([
            'wallet_id' => $wallet->id ?? 'wal_demo',
            'currency' => $wallet->currency ?? 'XAF',
            'balance_available' => $avail,
            'balance_escrow_locked' => $locked,
            'balance_total' => $avail + $locked,
            'is_active' => (bool) ($wallet->is_active ?? true),
            'last_updated_at' => $wallet->updated_at?->toIso8601String() ?? now()->toIso8601String(),
        ]);
    }

    /**
     * Top-up funding via Mobile Money.
     */
    public function fund(Request $request): JsonResponse
    {
        $user = $request->user() ?? User::first();
        $amount = (float) $request->input('amount', 20000);
        $phone = $request->input('phone', '+237670123456');
        $provider = $request->input('provider', 'mtn');

        $result = $this->paymentService->initiateMoMoFund($user, $amount, $phone, $provider);

        return $this->respondSuccess($result);
    }

    /**
     * Request withdrawal payout.
     */
    public function withdraw(Request $request): JsonResponse
    {
        $user = $request->user() ?? User::first();
        $amount = (float) $request->input('amount', 15000);
        $phone = $request->input('phone', '+237670123456');
        $provider = $request->input('provider', 'mtn');

        $result = $this->paymentService->requestPayout($user, $amount, $phone, $provider);

        return $this->respondSuccess($result);
    }

    /**
     * Wallet transaction ledger history.
     */
    public function getTransactions(Request $request): JsonResponse
    {
        $user = $request->user() ?? User::where('role', 'buyer')->first() ?? User::first();
        $wallet = $user ? $user->wallet : null;

        $walletId = $request->query('wallet_id', $wallet?->id);

        $query = WalletTransaction::query();
        if ($walletId) {
            $query->where('wallet_id', $walletId);
        }

        $transactions = $query->latest('created_at')->take(50)->get()->map(function ($tx) {
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