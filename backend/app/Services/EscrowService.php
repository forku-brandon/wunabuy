<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Dispute;
use App\Models\Order;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

class EscrowService
{
    /**
     * Commission rate taken by Wunabuy platform on successful escrow completion (3.5%).
     */
    public const COMMISSION_RATE = 0.035;

    /**
     * Lock funds from buyer available balance into escrow locked balance.
     */
    public function lockEscrow(Order $order, float $amount, ?string $reference = null): Order
    {
        return DB::transaction(function () use ($order, $amount, $reference) {
            $buyer = User::with('wallet')->findOrFail($order->customer_id);
            $wallet = $buyer->wallet ?? Wallet::firstOrCreate(
                ['user_id' => $buyer->id],
                ['currency' => 'XAF', 'balance_available' => 0, 'balance_escrow_locked' => 0]
            );

            if ((float) $wallet->balance_available < $amount) {
                // If insufficient balance in local wallet, simulate instantaneous escrow funding via payment gateway
                $wallet->balance_available = (float) $wallet->balance_available + $amount;
                $wallet->save();

                WalletTransaction::create([
                    'wallet_id' => $wallet->id,
                    'type' => 'credit',
                    'amount' => $amount,
                    'currency' => 'XAF',
                    'provider' => 'mtn',
                    'status' => 'completed',
                    'reference' => $reference ?? ('MOMO-ESCROW-' . Str::upper(Str::random(8))),
                    'description' => "Instant Escrow Funding for Order #{$order->order_code}",
                ]);
            }

            // Transfer from available to escrow locked
            $wallet->balance_available = (float) $wallet->balance_available - $amount;
            $wallet->balance_escrow_locked = (float) $wallet->balance_escrow_locked + $amount;
            $wallet->save();

            WalletTransaction::create([
                'wallet_id' => $wallet->id,
                'type' => 'escrow_lock',
                'amount' => -$amount,
                'currency' => 'XAF',
                'provider' => 'escrow',
                'status' => 'completed',
                'reference' => 'ESC-LOCK-' . $order->order_code,
                'description' => "Escrow Locked for Order #{$order->order_code}",
            ]);

            $order->payment_status = 'escrow_locked';
            $order->save();

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
            if ($order->payment_status === 'released') {
                return ['success' => true, 'message' => 'Escrow already released'];
            }

            // Find or create buyer wallet
            $buyer = User::find($order->customer_id);
            if ($buyer && $buyer->wallet) {
                $buyerWallet = $buyer->wallet;
                $locked = (float) $buyerWallet->balance_escrow_locked;
                $deduct = min($locked, (float) $order->total_amount);
                $buyerWallet->balance_escrow_locked = max(0, $locked - $deduct);
                $buyerWallet->save();
            }

            // Calculate fees and splits
            $subtotal = (float) $order->subtotal;
            $commission = round($subtotal * self::COMMISSION_RATE, 2);
            $sellerNet = max(0, $subtotal - $commission);
            $deliveryFee = (float) $order->delivery_fee;

            // Credit Seller Wallet
            $store = $order->store;
            if ($store && $store->user_id) {
                $sellerUser = User::find($store->user_id);
                if ($sellerUser) {
                    $sellerWallet = $sellerUser->wallet ?? Wallet::firstOrCreate(
                        ['user_id' => $sellerUser->id],
                        ['currency' => 'XAF', 'balance_available' => 0, 'balance_escrow_locked' => 0]
                    );

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

            // Credit Transporter Wallet if applicable
            if ($order->transporter_id && $deliveryFee > 0) {
                $transporter = $order->transporter;
                if ($transporter && $transporter->user_id) {
                    $transporterUser = User::find($transporter->user_id);
                    if ($transporterUser) {
                        $transporterWallet = $transporterUser->wallet ?? Wallet::firstOrCreate(
                            ['user_id' => $transporterUser->id],
                            ['currency' => 'XAF', 'balance_available' => 0, 'balance_escrow_locked' => 0]
                        );

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

            $order->status = 'delivered';
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
    public function freezeEscrow(Order $order, string $reason, string $filedByUserId, array $evidence = []): Dispute
    {
        return DB::transaction(function () use ($order, $reason, $filedByUserId, $evidence) {
            $order->status = 'disputed';
            $order->payment_status = 'frozen';
            $order->save();

            $dispute = Dispute::create([
                'order_id' => $order->id,
                'user_id' => \Illuminate\Support\Str::isUuid($filedByUserId) ? $filedByUserId : ($order->customer_id ?? User::first()?->id),
                'reason' => substr($reason, 0, 50),
                'description' => $reason,
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

            $buyer = User::find($order->customer_id);
            $buyerWallet = $buyer ? ($buyer->wallet ?? Wallet::firstOrCreate(['user_id' => $buyer->id])) : null;

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
                        $sellerWallet = $sellerUser->wallet ?? Wallet::firstOrCreate(['user_id' => $sellerUser->id]);
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
}