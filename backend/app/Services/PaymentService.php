<?php

namespace App\Services;

use App\Contracts\GatewayResponse;
use App\Contracts\PaymentGatewayInterface;
use App\Models\AuditLog;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Services\Gateways\InternalEscrowGateway;
use App\Services\Gateways\MtnMomoGateway;
use App\Services\Gateways\OrangeMoneyGateway;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * PaymentService
 *
 * Orchestrates all payment operations by routing through the correct
 * PaymentGatewayInterface implementation. This service owns:
 *   - Wallet top-up (MoMo push / internal credit)
 *   - Withdrawal payout (MoMo pull / bank transfer)
 *   - Transaction status polling
 *   - Webhook processing from MTN / Orange
 *
 * ─── Fee Formula Reference ────────────────────────────────────────────────────
 *   Top-up credit:       amount (gross, no fee on deposits)
 *   Withdrawal fee:      min(FEE_CAP, amount × PAYOUT_FEE_RATE)
 *   Net withdrawal:      amount − withdrawal_fee
 *   Platform commission: subtotal × COMMISSION_RATE   (applied at escrow release)
 *   Transporter payout:  delivery_fee (100%, no commission)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * @package App\Services
 */
class PaymentService
{
    // ─── Fee Constants (sourced from config — never hardcoded) ────────────────

    public static function commissionRate(): float
    {
        return (float) config('payment.escrow.commission_rate', 0.035);
    }

    public static function payoutFeeRate(): float
    {
        return (float) config('payment.escrow.payout_fee_rate', 0.015);
    }

    public static function payoutFeeCap(): int
    {
        return (int) config('payment.escrow.payout_fee_cap', 500);
    }

    public static function minWithdrawal(): int
    {
        return (int) config('payment.escrow.min_withdrawal', 100);
    }

    public static function minDeposit(): int
    {
        return (int) config('payment.escrow.min_deposit', 100);
    }

    // ─── Gateway resolution ───────────────────────────────────────────────────

    /**
     * Resolve the correct gateway implementation for a given provider code.
     *
     * @param  string $provider  'mtn' | 'orange' | 'escrow'
     * @return PaymentGatewayInterface
     */
    public function gateway(string $provider): PaymentGatewayInterface
    {
        return match (strtolower($provider)) {
            'orange'          => new OrangeMoneyGateway(),
            'escrow'          => new InternalEscrowGateway(),
            default           => new MtnMomoGateway(),   // 'mtn' + any unknown → MTN
        };
    }

    // ─── Wallet Top-Up ────────────────────────────────────────────────────────

    /**
     * Initiate Mobile Money wallet top-up / funding push.
     *
     * Flow (stub mode):    Immediately credits wallet + writes completed tx.
     * Flow (live mode):    Initiates gateway push → returns pending.
     *                      Wallet credited on webhook confirmation.
     *
     * @throws RuntimeException if amount is below minimum
     */
    public function initiateMoMoFund(User $user, float $amount, string $phone, string $provider): array
    {
        if ($amount < self::minDeposit()) {
            throw new RuntimeException('Minimum deposit is ' . self::minDeposit() . ' XAF.');
        }

        return DB::transaction(function () use ($user, $amount, $phone, $provider) {
            $wallet = Wallet::firstOrCreate(
                ['user_id' => $user->id],
                ['currency' => 'XAF', 'balance_available' => 0, 'balance_escrow_locked' => 0]
            );

            $reference = 'WNB-MOMO-' . strtoupper(Str::random(10));
            $gw        = $this->gateway($provider);

            $gwResponse = $gw->initiatePush(
                $phone,
                $amount,
                $reference,
                "Wallet Top-Up for {$user->full_name}"
            );

            // In stub mode, gateway returns 'completed' → credit immediately.
            // In live mode, gateway returns 'pending' → credit on webhook.
            $txStatus = $gwResponse->status;

            if ($gwResponse->success && $txStatus === 'completed') {
                // Atomic credit
                $wallet = Wallet::where('id', $wallet->id)->lockForUpdate()->first();
                $wallet->balance_available = (float) $wallet->balance_available + $amount;
                $wallet->save();
            }

            $tx = WalletTransaction::create([
                'wallet_id'   => $wallet->id,
                'type'        => 'credit',
                'amount'      => $amount,
                'currency'    => 'XAF',
                'provider'    => $provider,
                'status'      => $txStatus,
                'reference'   => $reference,
                'description' => "Wallet Top-Up via " . strtoupper($provider) . " ({$phone})"
                    . ($gw->isStubMode() ? ' [SANDBOX]' : ''),
            ]);

            Log::info('[PaymentService] MoMo fund initiated', [
                'user_id'   => $user->id,
                'amount'    => $amount,
                'provider'  => $provider,
                'stub_mode' => $gw->isStubMode(),
                'status'    => $txStatus,
            ]);

            return [
                'transaction_id'  => $tx->id,
                'reference'       => $reference,
                'status'          => $txStatus,
                'provider'        => $provider,
                'phone'           => $phone,
                'amount'          => $amount,
                'currency'        => 'XAF',
                'dial_code'       => $provider === 'orange' ? '#150*50#' : '*126#',
                'instruction'     => "Approve the prompt on your mobile handset by entering your " . strtoupper($provider) . " PIN.",
                'expires_at'      => now()->addMinutes(10)->toIso8601String(),
                'new_balance'     => (float) $wallet->fresh()->balance_available,
                'sandbox_mode'    => $gw->isStubMode(),
            ];
        });
    }

    // ─── Withdrawal Payout ────────────────────────────────────────────────────

    /**
     * Request a withdrawal / payout to Mobile Money or Bank.
     *
     * Security:
     *   - Registration bonus cannot be withdrawn.
     *   - Large payouts (>= LARGE_PAYOUT_THRESHOLD) are flagged as 'pending_approval'.
     *   - Wallet is row-locked before balance check to prevent race conditions.
     *
     * @throws RuntimeException on insufficient balance or other validation failure
     */
    public function requestPayout(User $user, float $amount, string $phone, string $provider): array
    {
        if ($amount < self::minWithdrawal()) {
            throw new RuntimeException('Minimum withdrawal is ' . self::minWithdrawal() . ' XAF.');
        }

        return DB::transaction(function () use ($user, $amount, $phone, $provider) {
            // Row-lock wallet to prevent concurrent overdraw
            $wallet = Wallet::where('user_id', $user->id)->lockForUpdate()->first();

            if (!$wallet) {
                throw new RuntimeException('Wallet not found. Please contact support.');
            }

            // Enforce non-withdrawable registration bonus
            $bonus       = (float) ($wallet->registration_bonus ?? 0);
            $withdrawable = max(0, (float) $wallet->balance_available - $bonus);

            if ($withdrawable < $amount) {
                if ($bonus > 0 && (float) $wallet->balance_available >= $amount) {
                    throw new RuntimeException(
                        "Your {$bonus} FCFA registration reward cannot be withdrawn. " .
                        "It can only be used to purchase items or combined with a top-up."
                    );
                }
                throw new RuntimeException(
                    "Insufficient withdrawable balance. " .
                    "Available to withdraw: " . number_format($withdrawable) . " XAF. " .
                    "Requested: " . number_format($amount) . " XAF."
                );
            }

            // Calculate fee
            $fee       = min(self::payoutFeeCap(), round($amount * self::payoutFeeRate(), 2));
            $netPayout = $amount - $fee;

            // Deduct from available balance atomically
            $wallet->balance_available = (float) $wallet->balance_available - $amount;
            $wallet->save();

            // Determine status — large payouts need staff approval
            $largeThreshold = (int) config('payment.escrow.large_payout_threshold', 100000);
            $txStatus = $amount >= $largeThreshold ? 'pending_approval' : 'completed';

            $ref = 'WNB-PO-' . strtoupper(Str::random(10));
            $gw  = $this->gateway($provider);

            // Trigger gateway disbursement
            if ($txStatus === 'completed') {
                $gwResponse = $gw->initiatePull($phone, $netPayout, $ref,
                    "Wunabuy Payout to {$user->full_name}");
                if (!$gwResponse->success) {
                    // Rollback balance deduction on gateway failure
                    $wallet->balance_available = (float) $wallet->balance_available + $amount;
                    $wallet->save();
                    throw new RuntimeException($gwResponse->message);
                }
            }

            $tx = WalletTransaction::create([
                'wallet_id'   => $wallet->id,
                'type'        => 'debit',
                'amount'      => -$amount,
                'currency'    => 'XAF',
                'provider'    => $provider,
                'status'      => $txStatus,
                'reference'   => $ref,
                'description' => "Payout to " . strtoupper($provider) . " ({$phone})"
                    . ($gw->isStubMode() ? ' [SANDBOX]' : ''),
            ]);

            AuditLog::create([
                'action'          => 'PAYOUT_REQUESTED',
                'staff_name'      => $user->full_name,
                'staff_role'      => strtoupper($user->role),
                'department'      => 'FINANCE',
                'ip_address'      => request()->ip() ?? '127.0.0.1',
                'target_resource' => 'TX:' . $tx->id,
                'status'          => 'SUCCESS',
                'details'         => [
                    'amount'      => $amount,
                    'fee'         => $fee,
                    'net'         => $netPayout,
                    'provider'    => $provider,
                    'phone'       => $phone,
                    'sandbox'     => $gw->isStubMode(),
                ],
            ]);

            return [
                'reference'          => $ref,
                'status'             => $txStatus,
                'amount'             => $amount,
                'fee'                => $fee,
                'net_amount'         => $netPayout,
                'currency'           => 'XAF',
                'new_balance'        => (float) $wallet->fresh()->balance_available,
                'estimated_arrival'  => $txStatus === 'completed' ? 'Instant (within 5 minutes)' : 'Pending staff approval',
                'sandbox_mode'       => $gw->isStubMode(),
            ];
        });
    }

    // ─── Webhook Processing ───────────────────────────────────────────────────

    /**
     * Process incoming webhook from MTN or Orange Money and credit/update wallet.
     *
     * @param  string $provider  'mtn' | 'orange'
     * @param  array  $payload   Raw webhook body
     * @param  string $signature HMAC signature from provider header
     * @return array             Processing result
     */
    public function processWebhook(string $provider, array $payload, string $signature): array
    {
        $gw       = $this->gateway($provider);
        $response = $gw->handleWebhook($payload, $signature);

        if (!$response->success) {
            Log::warning('[PaymentService] Webhook rejected', [
                'provider'  => $provider,
                'reference' => $response->reference,
                'error'     => $response->message,
            ]);
            return ['processed' => false, 'reason' => $response->message];
        }

        // Find pending transaction and complete it
        return DB::transaction(function () use ($response) {
            $tx = WalletTransaction::where('reference', $response->reference)->lockForUpdate()->first();

            if (!$tx || $tx->status === 'completed') {
                // Already processed (idempotent)
                return ['processed' => true, 'already_completed' => true];
            }

            $tx->status = 'completed';
            $tx->save();

            // Credit wallet if this was a deposit (type = credit)
            if ($tx->type === 'credit') {
                $wallet = Wallet::where('id', $tx->wallet_id)->lockForUpdate()->first();
                if ($wallet) {
                    $wallet->balance_available = (float) $wallet->balance_available + (float) $tx->amount;
                    $wallet->save();
                }
            }

            Log::info('[PaymentService] Webhook processed', [
                'reference' => $response->reference,
                'amount'    => $response->amount,
                'provider'  => $response->provider,
            ]);

            return ['processed' => true, 'reference' => $response->reference, 'status' => 'completed'];
        });
    }

    // ─── Transaction Status ───────────────────────────────────────────────────

    /**
     * Check and synchronise the status of a transaction.
     * Queries both the local DB and the gateway (if live).
     */
    public function checkTransactionStatus(string $reference): array
    {
        $tx = WalletTransaction::where('reference', $reference)
            ->orWhere('id', $reference)
            ->first();

        if (!$tx) {
            return ['reference' => $reference, 'status' => 'not_found', 'amount' => 0];
        }

        // If already completed/failed, return DB state
        if (in_array($tx->status, ['completed', 'failed', 'pending_approval'])) {
            return [
                'reference'   => $tx->reference ?? $reference,
                'status'      => $tx->status,
                'amount'      => abs((float) $tx->amount),
                'provider'    => $tx->provider ?? 'escrow',
                'new_balance' => (float) ($tx->wallet?->balance_available ?? 0),
            ];
        }

        // For pending transactions — query gateway for fresh status
        $gw       = $this->gateway($tx->provider ?? 'mtn');
        $gwStatus = $gw->queryStatus($tx->reference ?? $reference);

        if ($gwStatus->success && $gwStatus->status === 'completed' && $tx->status !== 'completed') {
            // Gateway confirmed — update local DB
            DB::transaction(function () use ($tx) {
                $tx->status = 'completed';
                $tx->save();
                if ($tx->type === 'credit') {
                    $wallet = Wallet::where('id', $tx->wallet_id)->lockForUpdate()->first();
                    if ($wallet) {
                        $wallet->balance_available = (float) $wallet->balance_available + (float) $tx->amount;
                        $wallet->save();
                    }
                }
            });
        }

        $tx->refresh();
        return [
            'reference'   => $tx->reference ?? $reference,
            'status'      => $tx->status,
            'amount'      => abs((float) $tx->amount),
            'provider'    => $tx->provider ?? 'escrow',
            'new_balance' => (float) ($tx->wallet?->balance_available ?? 0),
        ];
    }
}