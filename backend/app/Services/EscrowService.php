<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Dispute;
use App\Models\Order;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use RuntimeException;

class EscrowService
{
    /**
     * Commission rate — sourced from config so it can be changed without code deployment.
     * @see config/payment.php
     */
    public static function commissionRate(): float
    {
        return (float) config('payment.escrow.commission_rate', 0.035);
    }

    /**
     * Lock funds from buyer available balance into escrow locked balance.
     *
     * SECURITY: If the buyer has insufficient funds this throws RuntimeException
     * with INSUFFICIENT_FUNDS — it NEVER silently credits the wallet.
     * The buyer must top up their wallet first via the payment gateway.
     *
     * @throws RuntimeException if buyer wallet balance is insufficient
     */
    public function lockEscrow(Order $order, float $amount, ?string $reference = null): Order
    {
        return DB::transaction(function () use ($order, $amount, $reference) {
            $buyer  = User::findOrFail($order->customer_id);
            $wallet = Wallet::where('user_id', $buyer->id)->lockForUpdate()->first();

            if (!$wallet) {
                // Auto-create wallet with zero balance — do NOT pre-credit it
                $wallet = Wallet::create([
                    'user_id'              => $buyer->id,
                    'currency'             => 'XAF',
                    'balance_available'    => 0,
                    'balance_escrow_locked'=> 0,
                    'registration_bonus'   => (int) config('payment.escrow.registration_bonus', 100),
                ]);
                $wallet = Wallet::where('id', $wallet->id)->lockForUpdate()->first();
            }

            // ── STRICT BALANCE ENFORCEMENT ──────────────────────────────────
            // Never silently top up. Buyer MUST have sufficient balance.
            $available = (float) $wallet->balance_available;
            if ($available < $amount) {
                $shortfall = round($amount - $available, 2);
                Log::warning('[EscrowService] Escrow lock rejected — insufficient funds', [
                    'order_id'   => $order->id,
                    'required'   => $amount,
                    'available'  => $available,
                    'shortfall'  => $shortfall,
                    'buyer_id'   => $buyer->id,
                ]);
                throw new RuntimeException(
                    "Insufficient wallet balance. " .
                    "Required: " . number_format($amount) . " XAF. " .
                    "Available: " . number_format($available) . " XAF. " .
                    "Shortfall: " . number_format($shortfall) . " XAF. " .
                    "Please top up your wallet before placing this order."
                );
            }
            // ────────────────────────────────────────────────────────────────

            // Consume registration bonus if applicable (non-withdrawable spend)
            $bonus = (float) ($wallet->registration_bonus ?? 0);
            if ($bonus > 0) {
                $bonusSpent = min($bonus, $amount);
                $wallet->registration_bonus = max(0, $bonus - $bonusSpent);
            }

            // Atomic: deduct available, add to escrow locked
            $wallet->balance_available     = $available - $amount;
            $wallet->balance_escrow_locked = (float) $wallet->balance_escrow_locked + $amount;
            $wallet->save();

            $escrowRef = $reference ?? ('ESC-LOCK-' . $order->order_code);

            WalletTransaction::create([
                'wallet_id'   => $wallet->id,
                'type'        => 'escrow_lock',
                'amount'      => -$amount,
                'currency'    => 'XAF',
                'provider'    => 'escrow',
                'status'      => 'completed',
                'reference'   => $escrowRef,
                'description' => "Escrow Locked for Order #{$order->order_code} — held until delivery confirmed",
            ]);

            $order->payment_status = 'escrow_locked';
            $order->save();

            Log::info('[EscrowService] Escrow lock successful', [
                'order_id'  => $order->id,
                'amount'    => $amount,
                'buyer_id'  => $buyer->id,
                'reference' => $escrowRef,
            ]);

            return $order;
        });
    }

    /**
     * Release escrow funds upon buyer delivery confirmation or automated timeout.
     * Deducts 3.5% platform commission and credits seller & transporter.
     */
    public function releaseEscrow(Order $order, ?string $releasedBy = null): array
    {
        return DB::transaction(function () use ($order, $releasedBy) {
            // Idempotent — safe to call multiple times
            if ($order->payment_status === 'released') {
                return ['success' => true, 'message' => 'Escrow already released'];
            }

            // Verify order is in a releasable state
            $releasableStatuses = ['delivered', 'in_transit', 'completed', 'disputed'];
            if (!in_array($order->status, $releasableStatuses) && $releasedBy !== 'System Automation / Buyer Confirmation') {
                throw new RuntimeException(
                    "Order #{$order->order_code} is not in a releasable state (current: {$order->status})."
                );
            }

            // Acquire lock on buyer wallet and release escrow lock
            $buyerWallet = Wallet::where('user_id', $order->customer_id)->lockForUpdate()->first();
            if ($buyerWallet) {
                $locked = (float) $buyerWallet->balance_escrow_locked;
                $deduct = min($locked, (float) $order->total_amount);
                $buyerWallet->balance_escrow_locked = max(0, $locked - $deduct);
                $buyerWallet->save();
            }

            // ── Fee calculation — all rates sourced from config ────────────
            // Formula:
            //   commission  = subtotal × COMMISSION_RATE (default 3.5%)
            //   seller_net  = subtotal − commission
            //   transporter = delivery_fee (100%, no commission deducted)
            // ─────────────────────────────────────────────────────────────────
            $subtotal    = (float) $order->subtotal;
            $commission  = (float) round($subtotal * self::commissionRate());
            $sellerNet   = max(0, $subtotal - $commission);
            $deliveryFee = (float) ($order->delivery_fee ?? config('payment.escrow.default_delivery_fee', 1500));

            // Credit Seller Wallet with row lock
            $store = $order->store;
            if ($store && $store->user_id) {
                $sellerUser = User::find($store->user_id);
                if ($sellerUser) {
                    $sellerWallet = Wallet::where('user_id', $sellerUser->id)->lockForUpdate()->first();
                    if (!$sellerWallet) {
                        $sellerWallet = Wallet::create([
                            'user_id' => $sellerUser->id,
                            'currency' => 'XAF',
                            'balance_available' => 0,
                            'balance_escrow_locked' => 0,
                        ]);
                        $sellerWallet = Wallet::where('id', $sellerWallet->id)->lockForUpdate()->first();
                    }

                    $sellerWallet->balance_available = (float) $sellerWallet->balance_available + $sellerNet;
                    $sellerWallet->save();

                    WalletTransaction::create([
                        'wallet_id' => $sellerWallet->id,
                        'type' => 'escrow_release',
                        'amount' => $sellerNet,
                        'currency' => 'XAF',
                        'provider' => 'escrow',
                        'status' => 'completed',
                        'reference' => 'ESC-REL-' . $order->order_code,
                        'description' => "Payout for Order #{$order->order_code} (Gross: {$subtotal} XAF, Comm: {$commission} XAF)",
                    ]);
                }
            }

            // Credit Transporter Wallet with row lock if applicable
            if ($order->transporter_id && $deliveryFee > 0) {
                $transporter = $order->transporter;
                if ($transporter && $transporter->user_id) {
                    $transporterUser = User::find($transporter->user_id);
                    if ($transporterUser) {
                        $transporterWallet = Wallet::where('user_id', $transporterUser->id)->lockForUpdate()->first();
                        if (!$transporterWallet) {
                            $transporterWallet = Wallet::create([
                                'user_id' => $transporterUser->id,
                                'currency' => 'XAF',
                                'balance_available' => 0,
                                'balance_escrow_locked' => 0,
                            ]);
                            $transporterWallet = Wallet::where('id', $transporterWallet->id)->lockForUpdate()->first();
                        }

                        $transporterWallet->balance_available = (float) $transporterWallet->balance_available + $deliveryFee;
                        $transporterWallet->save();

                        WalletTransaction::create([
                            'wallet_id' => $transporterWallet->id,
                            'type' => 'delivery_earning',
                            'amount' => $deliveryFee,
                            'currency' => 'XAF',
                            'provider' => 'escrow',
                            'status' => 'completed',
                            'reference' => 'DLV-REL-' . $order->order_code,
                            'description' => "Delivery Fee for Order #{$order->order_code}",
                        ]);
                    }
                }
            }

            $order->status = 'completed';
            $order->delivered_at = $order->delivered_at ?? now();
            $order->payment_status = 'released';
            $order->save();

            AuditLog::create([
                'action' => 'ESCROW_RELEASED',
                'staff_name' => $releasedBy ?? 'System Automation / Buyer Confirmation',
                'staff_role' => 'SYSTEM',
                'department' => 'FINANCE',
                'ip_address' => request()->ip() ?? '127.0.0.1',
                'target_resource' => 'ORDER:' . $order->order_code,
                'status' => 'SUCCESS',
                'details' => [
                    'order_id' => $order->id,
                    'order_code' => $order->order_code,
                    'total_amount' => $order->total_amount,
                    'subtotal' => $subtotal,
                    'commission' => $commission,
                    'seller_net' => $sellerNet,
                    'delivery_fee' => $deliveryFee,
                ],
            ]);

            return [
                'success' => true,
                'order' => $order,
                'subtotal' => $subtotal,
                'commission' => $commission,
                'seller_net' => $sellerNet,
                'delivery_fee' => $deliveryFee,
            ];
        });
    }

    /**
     * Freeze escrow funds and register formal dispute.
     */
    public function freezeEscrow(Order $order, string $reason, string $filedByUserId, array $evidence = [], ?string $description = null): Dispute
    {
        return DB::transaction(function () use ($order, $reason, $filedByUserId, $evidence, $description) {
            $order->status = 'disputed';
            $order->payment_status = 'frozen';
            $order->save();

            $dispute = Dispute::create([
                'order_id' => $order->id,
                'user_id' => \Illuminate\Support\Str::isUuid($filedByUserId) ? $filedByUserId : ($order->customer_id ?? User::first()?->id),
                'reason' => substr($reason, 0, 50),
                'description' => $description ?: $reason,
                'status' => 'open',
                'evidence_photos' => $evidence,
            ]);

            AuditLog::create([
                'action' => 'ESCROW_FROZEN_DISPUTE',
                'staff_name' => 'User Initiated',
                'staff_role' => 'BUYER',
                'department' => 'DISPUTES',
                'ip_address' => request()->ip() ?? '127.0.0.1',
                'target_resource' => 'ORDER:' . $order->order_code,
                'status' => 'SUCCESS',
                'details' => [
                    'order_id' => $order->id,
                    'order_code' => $order->order_code,
                    'reason' => $reason,
                    'amount_locked' => $order->total_amount,
                ],
            ]);

            return $dispute;
        });
    }

    /**
     * Execute staff arbitration adjudication on a dispute.
     */
    public function adjudicateDispute(string $disputeId, string $rulingType, string $rationale, string $staffName): Dispute
    {
        return DB::transaction(function () use ($disputeId, $rulingType, $rationale, $staffName) {
            $dispute = (Str::isUuid($disputeId) ? Dispute::with('order')->find($disputeId) : null) ?? Dispute::with('order')->first();
            if (!$dispute) {
                throw new RuntimeException("Dispute not found");
            }
            $order = $dispute->order;

            $buyerWallet = Wallet::where('user_id', $order->customer_id)->lockForUpdate()->first();

            $totalAmount = (float) $order->total_amount;
            $subtotal = (float) $order->subtotal;

            if ($rulingType === 'BUYER_REFUND') {
                // Refund 100% back to buyer available balance
                if ($buyerWallet) {
                    $buyerWallet->balance_escrow_locked = max(0, (float) $buyerWallet->balance_escrow_locked - $totalAmount);
                    $buyerWallet->balance_available = (float) $buyerWallet->balance_available + $totalAmount;
                    $buyerWallet->save();

                    WalletTransaction::create([
                        'wallet_id' => $buyerWallet->id,
                        'type' => 'credit',
                        'amount' => $totalAmount,
                        'currency' => 'XAF',
                        'provider' => 'escrow',
                        'status' => 'completed',
                        'reference' => 'REFUND-' . $order->order_code,
                        'description' => "Dispute Refund for Order #{$order->order_code} (Ruling: BUYER_REFUND)",
                    ]);
                }

                $order->status = 'cancelled';
                $order->payment_status = 'refunded';
            } elseif ($rulingType === 'SELLER_RELEASE') {
                // Release funds to seller minus commission
                $this->releaseEscrow($order, $staffName);
                $order->status = 'delivered';
                $order->payment_status = 'released';
            } elseif ($rulingType === 'SPLIT_50_50') {
                $half = round($totalAmount / 2, 2);
                if ($buyerWallet) {
                    $buyerWallet->balance_escrow_locked = max(0, (float) $buyerWallet->balance_escrow_locked - $totalAmount);
                    $buyerWallet->balance_available = (float) $buyerWallet->balance_available + $half;
                    $buyerWallet->save();
                }

                $store = $order->store;
                if ($store && $store->user_id) {
                    $sellerUser = User::find($store->user_id);
                    if ($sellerUser) {
                        $sellerWallet = Wallet::where('user_id', $sellerUser->id)->lockForUpdate()->first();
                        if (!$sellerWallet) {
                            $sellerWallet = Wallet::create([
                                'user_id' => $sellerUser->id,
                                'currency' => 'XAF',
                                'balance_available' => 0,
                                'balance_escrow_locked' => 0,
                            ]);
                            $sellerWallet = Wallet::where('id', $sellerWallet->id)->lockForUpdate()->first();
                        }
                        $sellerWallet->balance_available = (float) $sellerWallet->balance_available + $half;
                        $sellerWallet->save();
                    }
                }

                $order->status = 'completed';
                $order->payment_status = 'split_settled';
            }

            $order->save();

            $dispute->status = 'resolved';
            $dispute->resolution = $rationale;
            $dispute->resolved_at = now();
            $dispute->save();

            AuditLog::create([
                'action' => 'DISPUTE_ADJUDICATED',
                'staff_name' => $staffName,
                'staff_role' => 'COMPLIANCE_OFFICER',
                'department' => 'DISPUTES',
                'ip_address' => request()->ip() ?? '127.0.0.1',
                'target_resource' => 'DISPUTE:' . $dispute->id,
                'status' => 'SUCCESS',
                'details' => [
                    'dispute_id' => $dispute->id,
                    'order_id' => $order->id,
                    'order_code' => $order->order_code,
                    'ruling_type' => $rulingType,
                    'rationale' => $rationale,
                ],
            ]);

            return $dispute;
        });
    }

    /**
     * Refund locked escrow funds back to buyer (e.g. order cancelled, declined, or unfulfilled).
     */
    public function refundEscrow(Order $order, ?string $reason = null): array
    {
        return DB::transaction(function () use ($order, $reason) {
            if ($order->payment_status === 'refunded') {
                return ['success' => true, 'message' => 'Escrow already refunded'];
            }

            $buyerWallet = Wallet::where('user_id', $order->customer_id)->lockForUpdate()->first();
            $refundAmount = (float) $order->total_amount;

            if ($buyerWallet && $refundAmount > 0) {
                // Return from escrow_locked back to available balance
                $locked = (float) $buyerWallet->balance_escrow_locked;
                $deduct = min($locked, $refundAmount);
                $buyerWallet->balance_escrow_locked = max(0, $locked - $deduct);
                $buyerWallet->balance_available = (float) $buyerWallet->balance_available + $refundAmount;
                $buyerWallet->save();

                WalletTransaction::create([
                    'wallet_id'   => $buyerWallet->id,
                    'type'        => 'credit',
                    'amount'      => $refundAmount,
                    'currency'    => 'XAF',
                    'provider'    => 'escrow',
                    'status'      => 'completed',
                    'reference'   => 'ESC-REF-' . $order->order_code,
                    'description' => "Escrow Refund for Order #{$order->order_code} (" . ($reason ?? 'Order Cancelled') . ")",
                ]);
            }

            $order->payment_status = 'refunded';
            $order->save();

            AuditLog::create([
                'action' => 'ESCROW_REFUNDED',
                'staff_name' => 'System / Escrow Refund',
                'staff_role' => 'SYSTEM',
                'department' => 'FINANCE',
                'ip_address' => request()->ip() ?? '127.0.0.1',
                'target_resource' => 'ORDER:' . $order->order_code,
                'status' => 'SUCCESS',
                'details' => [
                    'order_id' => $order->id,
                    'order_code' => $order->order_code,
                    'refund_amount' => $refundAmount,
                    'reason' => $reason,
                ],
            ]);

            return [
                'success' => true,
                'refund_amount' => $refundAmount,
            ];
        });
    }
}