<?php

namespace App\Services\Gateways;

use App\Contracts\GatewayResponse;
use App\Contracts\PaymentGatewayInterface;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * InternalEscrowGateway
 *
 * Handles wallet-to-wallet internal fund transfers.
 * This gateway is ALWAYS live — it never uses stub mode because
 * it operates entirely within the Wunabuy database.
 *
 * Used for:
 * - Escrow lock (buyer available → buyer escrow_locked)
 * - Escrow release (buyer escrow_locked → seller available + transporter available)
 * - Dispute refunds (buyer escrow_locked → buyer available)
 *
 * @package App\Services\Gateways
 */
class InternalEscrowGateway implements PaymentGatewayInterface
{
    /**
     * Debit a user's available balance and hold in escrow_locked.
     * Used when a buyer pays for an order.
     *
     * @param  string $walletId   The buyer wallet ID (phone param is repurposed here)
     * @param  float  $amount     Amount to lock
     * @param  string $reference  Order reference (e.g. ESC-LOCK-WB-2026-1234)
     * @param  string $description Human readable escrow reason
     */
    public function initiatePush(string $walletId, float $amount, string $reference, string $description): GatewayResponse
    {
        return DB::transaction(function () use ($walletId, $amount, $reference, $description) {
            $wallet = Wallet::where('id', $walletId)->lockForUpdate()->first();

            if (!$wallet) {
                return GatewayResponse::failed($reference, $amount, 'escrow', 'Wallet not found.', 'WALLET_NOT_FOUND');
            }

            if ((float) $wallet->balance_available < $amount) {
                return GatewayResponse::failed(
                    $reference, $amount, 'escrow',
                    "Insufficient balance. Available: {$wallet->balance_available} XAF, Required: {$amount} XAF.",
                    'INSUFFICIENT_FUNDS'
                );
            }

            $wallet->balance_available      = (float) $wallet->balance_available - $amount;
            $wallet->balance_escrow_locked  = (float) $wallet->balance_escrow_locked + $amount;
            $wallet->save();

            WalletTransaction::create([
                'wallet_id'   => $wallet->id,
                'type'        => 'escrow_lock',
                'amount'      => -$amount,
                'currency'    => 'XAF',
                'provider'    => 'escrow',
                'status'      => 'completed',
                'reference'   => $reference,
                'description' => $description,
            ]);

            Log::info('[InternalEscrowGateway] Escrow lock successful', [
                'wallet_id' => $walletId, 'amount' => $amount, 'reference' => $reference,
            ]);

            return GatewayResponse::completed($reference, $amount, 'escrow', 'Escrow funds locked successfully.');
        });
    }

    /**
     * Credit a user's available balance (escrow release or payout).
     *
     * @param  string $walletId  Target wallet ID (phone param repurposed)
     * @param  float  $amount    Amount to credit
     * @param  string $reference Release reference
     * @param  string $description Human-readable reason
     */
    public function initiatePull(string $walletId, float $amount, string $reference, string $description): GatewayResponse
    {
        return DB::transaction(function () use ($walletId, $amount, $reference, $description) {
            $wallet = Wallet::where('id', $walletId)->lockForUpdate()->first();

            if (!$wallet) {
                return GatewayResponse::failed($reference, $amount, 'escrow', 'Wallet not found.', 'WALLET_NOT_FOUND');
            }

            $wallet->balance_available = (float) $wallet->balance_available + $amount;
            $wallet->save();

            WalletTransaction::create([
                'wallet_id'   => $wallet->id,
                'type'        => 'escrow_release',
                'amount'      => $amount,
                'currency'    => 'XAF',
                'provider'    => 'escrow',
                'status'      => 'completed',
                'reference'   => $reference,
                'description' => $description,
            ]);

            return GatewayResponse::completed($reference, $amount, 'escrow', 'Funds credited successfully.');
        });
    }

    /**
     * Internal transfers are synchronous — status is always immediately known.
     */
    public function queryStatus(string $reference): GatewayResponse
    {
        $tx = WalletTransaction::where('reference', $reference)->first();

        if (!$tx) {
            return GatewayResponse::failed($reference, 0, 'escrow', 'Transaction not found.', 'NOT_FOUND');
        }

        return new GatewayResponse(
            success:   $tx->status === 'completed',
            status:    $tx->status,
            reference: $reference,
            message:   "Internal transaction {$tx->status}.",
            amount:    abs((float) $tx->amount),
            provider:  'escrow',
        );
    }

    /**
     * Internal gateway has no webhooks — always returns an error if called.
     */
    public function handleWebhook(array $payload, string $signature): GatewayResponse
    {
        return GatewayResponse::failed('', 0, 'escrow',
            'Internal escrow gateway does not support webhooks.', 'NOT_SUPPORTED');
    }

    /** Internal gateway is never in stub mode — it always writes to the real DB. */
    public function isStubMode(): bool { return false; }

    public function getProviderCode(): string { return 'escrow'; }
}
