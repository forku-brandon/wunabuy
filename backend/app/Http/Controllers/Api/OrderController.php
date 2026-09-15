<?php

namespace App\Http\Controllers\Api;

use App\Models\Dispute;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use App\Services\EscrowService;
use App\Services\LogisticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function __construct(
        protected EscrowService $escrowService,
        protected LogisticsService $logisticsService
    ) {
    }

    /**
     * List user orders with optional status & role filters.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return $this->respondError('UNAUTHORIZED', 'Authentication required', null, 401);
        }

        $query = Order::with(['items', 'store', 'transporter'])
            ->where('customer_id', $user->id);

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $orders = $query->latest()->get();

        $escrowLockedTotal = $orders->where('payment_status', 'escrow_locked')->sum('total_amount');

        return response()->json([
            'success' => true,
            'data' => $orders,
            'escrow_summary' => [
                'total_locked_xaf' => (float) $escrowLockedTotal,
                'active_escrow_orders_count' => $orders->where('payment_status', 'escrow_locked')->count(),
            ],
            'meta' => [
                'pagination' => [
                    'has_more' => false,
                    'next_cursor' => null,
                    'per_page' => 20,
                ],
                'timestamp' => now()->toIso8601String(),
                'request_id' => 'req_' . Str::random(12),
            ],
        ]);
    }

    /**
     * Create order & lock funds in escrow.
     */
    public function store(Request $request): JsonResponse
    {
        $idempotencyKey = $request->header('Idempotency-Key');
        if ($idempotencyKey) {
            $existing = Order::where('notes', 'like', "%{$idempotencyKey}%")->first();
            if ($existing) {
                return $this->respondSuccess($existing->load(['items', 'store']));
            }
        }

        return DB::transaction(function () use ($request, $idempotencyKey) {
            $buyer = $this->resolveUser($request);
            if (!$buyer) {
                return $this->respondError('UNAUTHORIZED', 'Authentication required', null, 401);
            }

            // Resolve store from items or request
            $storeId = $request->input('store_id');
            $store = ($storeId && Str::isUuid($storeId)) ? Store::find($storeId) : null;

            // Try to get the store from the first product in items
            if (!$store) {
                $firstItemProductId = $request->input('items.0.product_id');
                if ($firstItemProductId && Str::isUuid($firstItemProductId)) {
                    $firstProduct = Product::find($firstItemProductId);
                    if ($firstProduct) {
                        $store = Store::find($firstProduct->store_id);
                    }
                }
            }

            if (!$store) {
                return $this->respondError('STORE_NOT_FOUND', 'Store not found — please provide a valid store_id or valid product items', null, 422);
            }

            $itemsData = $request->input('items', []);
            $subtotal = 0;

            $orderId = (string) Str::uuid();
            $orderCode = 'WB-' . date('Y') . '-' . rand(1000, 9999);
            $pickupPin = (string) rand(1000, 9999);

            $rawAddress = $request->input('delivery_address');
            if (is_string($rawAddress)) {
                $delivAddress = [
                    'label' => 'Delivery Location',
                    'address_text' => $rawAddress,
                    'city' => 'Douala',
                    'latitude' => 4.0611,
                    'longitude' => 9.7863,
                ];
            } elseif (is_array($rawAddress)) {
                $delivAddress = $rawAddress;
            } else {
                $delivAddress = [
                    'label' => 'Home',
                    'address_text' => 'Douala',
                    'city' => 'Douala',
                    'latitude' => 4.0611,
                    'longitude' => 9.7863,
                ];
            }

            $order = Order::create([
                'id' => $orderId,
                'order_code' => $orderCode,
                'customer_id' => $buyer->id,
                'store_id' => $store->id,
                'status' => 'pending',
                'subtotal' => 0,
                'delivery_fee' => (float) $request->input('delivery_fee', 1500),
                'total' => 0,
                'currency' => 'XAF',
                'payment_method' => $request->input('payment_method', 'mtn_momo'),
                'payment_status' => 'pending',
                'delivery_address' => $delivAddress,
                'pickup_pin' => $pickupPin,
                'notes' => ($request->input('notes') ?? '') . ($idempotencyKey ? " [IDEMPOTENCY:{$idempotencyKey}]" : ''),
            ]);

            foreach ($itemsData as $item) {
                $productId = $item['product_id'] ?? null;
                $product = Str::isUuid($productId) ? Product::find($productId) : null;
                if (!$product) {
                    continue; // skip invalid item — no fake product fallback
                }

                $price = (float) $product->price;
                $qty = (int) ($item['quantity'] ?? 1);
                $lineTotal = $price * $qty;
                $subtotal += $lineTotal;

                // Decrement stock quantity
                $product->decrement('quantity', min($qty, $product->quantity));

                OrderItem::create([
                    'id' => (string) Str::uuid(),
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'name' => $product->name,
                    'price' => $price,
                    'quantity' => $qty,
                    'image_url' => is_array($product->images) ? ($product->images[0] ?? null) : null,
                ]);
            }

            if ($subtotal === 0) {
                // No valid items provided — rollback
                $order->delete();
                return $this->respondError('NO_ITEMS', 'No valid product items provided for this order', null, 422);
            }

            $deliveryFee = (float) $order->delivery_fee;
            $order->subtotal = $subtotal;
            $order->total = $subtotal + $deliveryFee;
            $order->save();

            // Lock Escrow via Service
            $this->escrowService->lockEscrow($order, (float) $order->total);

            return $this->respondSuccess($order->load(['items', 'store']), [], 201);
        });
    }

    /**
     * Show single order with tracking timeline.
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $order = (Str::isUuid($id) ? Order::with(['items', 'store', 'transporter'])->find($id) : null)
            ?? Order::where('order_code', $id)->first();

        if (!$order) {
            return $this->respondError('NOT_FOUND', 'Order not found', null, 404);
        }

        $user = $this->resolveUser($request);
        if ($user) {
            $isAuthorized = ($user->id === $order->customer_id)
                || ($user->store && $user->store->id === $order->store_id)
                || ($user->transporter && $user->transporter->id === $order->transporter_id)
                || in_array($user->role, ['admin', 'superadmin']);
            if (!$isAuthorized) {
                return $this->respondError('FORBIDDEN', 'Access denied to this order', null, 403);
            }
        }

        return $this->respondSuccess($order);
    }

    /**
     * Update order fulfillment status.
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $order = (Str::isUuid($id) ? Order::find($id) : null)
            ?? Order::where('order_code', $id)->first();
        if (!$order) {
            return $this->respondError('NOT_FOUND', 'Order not found', null, 404);
        }

        $newStatus = $request->input('status');
        $order->status = $newStatus;
        $order->save();

        return $this->respondSuccess($order->load(['items', 'store']));
    }

    /**
     * Confirm delivery receipt by Buyer -> Releases Escrow.
     */
    public function confirmReceipt(Request $request, string $id): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return $this->respondError('UNAUTHORIZED', 'Authentication required', null, 401);
        }

        $order = (Str::isUuid($id) ? Order::find($id) : null)
            ?? Order::where('order_code', $id)->first();
        if (!$order) {
            return $this->respondError('NOT_FOUND', 'Order not found', null, 404);
        }

        if ($order->customer_id !== $user->id && !in_array($user->role, ['admin', 'superadmin'])) {
            return $this->respondError('FORBIDDEN', 'Only the buyer who placed the order can confirm receipt and release escrow', null, 403);
        }

        $result = $this->escrowService->releaseEscrow($order, 'Buyer Confirmation');

        return $this->respondSuccess($order->fresh()->load(['items', 'store']));
    }

    /**
     * Get details of dispute on an order.
     */
    public function getDisputeDetails(string $id): JsonResponse
    {
        $order = Str::isUuid($id) ? Order::find($id) : Order::where('order_code', $id)->first();
        $dispute = Dispute::where('order_id', $order?->id ?? $id)->latest()->first();

        if (!$dispute) {
            return $this->respondError('NOT_FOUND', 'No dispute found for this order', null, 404);
        }

        return $this->respondSuccess([
            'id' => $dispute->id,
            'order_id' => $dispute->order_id,
            'order_code' => $order?->order_code ?? 'WB-2026-8812',
            'reason' => $dispute->reason,
            'description' => $dispute->description,
            'status' => $dispute->status,
            'refund_amount' => (float) $dispute->refund_amount,
            'evidence_photos' => $dispute->evidence_photos ?? [],
            'created_at' => $dispute->created_at?->toIso8601String(),
            'resolved_at' => $dispute->resolved_at?->toIso8601String(),
        ]);
    }

    /**
     * Get buyer refund history and active dispute claims.
     */
    public function getRefunds(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return $this->respondError('UNAUTHORIZED', 'Authentication required', null, 401);
        }
        $disputes = Dispute::with(['order.store', 'order.items'])
            ->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhereHas('order', function ($oq) use ($user) {
                      $oq->where('customer_id', $user->id);
                  });
            })
            ->latest()
            ->get();

        $refunds = [];
        foreach ($disputes as $d) {
            $order = $d->order;
            $firstItem = $order?->items?->first();

            // Map DB status to mobile app contract ('pending_review', 'merchant_evidence', 'refunded', 'rejected')
            $statusMap = [
                'open' => 'pending_review',
                'disputed' => 'pending_review',
                'pending_review' => 'pending_review',
                'under_review' => 'pending_review',
                'merchant_evidence' => 'merchant_evidence',
                'refunded' => 'refunded',
                'resolved' => 'refunded',
                'rejected' => 'rejected',
            ];
            $mobileStatus = $statusMap[$d->status] ?? 'pending_review';

            $refunds[] = [
                'id' => $d->id,
                'order_code' => $order?->order_code ?? ('WB-' . strtoupper(substr(str_replace('-', '', $d->id), 0, 8))),
                'store_name' => $order?->store?->store_name ?? 'Store',
                'product_name' => $firstItem?->name ?? 'Order Item',
                'product_image' => $firstItem?->image_url ?? '',
                'amount' => (float) ($d->refund_amount > 0 ? $d->refund_amount : ($order?->total ?? 0)),
                'reason' => $d->reason,
                'status' => $mobileStatus,
                'requested_at' => $d->created_at?->toIso8601String() ?? now()->toIso8601String(),
                'refunded_at' => $d->resolved_at?->toIso8601String(),
                'refund_destination' => 'Wunabuy Wallet (Available Balance)',
                'reference_id' => 'WNB-REF-' . strtoupper(substr(str_replace('-', '', $d->id), 0, 8)),
            ];
        }

        return $this->respondSuccess($refunds);
    }

    /**
     * Cancel order.
     */
    public function cancel(Request $request, string $id): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return $this->respondError('UNAUTHORIZED', 'Authentication required', null, 401);
        }

        $order = (Str::isUuid($id) ? Order::find($id) : null)
            ?? Order::where('order_code', $id)->first();
        if (!$order) {
            return $this->respondError('NOT_FOUND', 'Order not found', null, 404);
        }

        $isCustomer = $order->customer_id === $user->id;
        $isStoreOwner = $user->store && $order->store_id === $user->store->id;
        if (!$isCustomer && !$isStoreOwner && !in_array($user->role, ['admin', 'superadmin'])) {
            return $this->respondError('FORBIDDEN', 'Unauthorized: you are not authorized to cancel this order', null, 403);
        }

        if (in_array($order->status, ['in_transit', 'delivered', 'completed'])) {
            return $this->respondError('INVALID_ORDER_STATE', 'Cannot cancel an order currently in transit or delivered.', null, 422);
        }

        $order->status = 'cancelled';
        $order->notes = ($order->notes ?? '') . ' Reason: ' . $request->input('reason', 'Cancelled by user');
        $order->save();

        return $this->respondSuccess($order);
    }

    /**
     * Dispute order (freezes escrow).
     */
    public function dispute(Request $request, string $id): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return $this->respondError('UNAUTHORIZED', 'Authentication required', null, 401);
        }

        $order = (Str::isUuid($id) ? Order::find($id) : null)
            ?? Order::where('order_code', $id)->first();
        if (!$order) {
            return $this->respondError('NOT_FOUND', 'Order not found', null, 404);
        }

        if ($order->customer_id !== $user->id && !in_array($user->role, ['admin', 'superadmin'])) {
            return $this->respondError('FORBIDDEN', 'Unauthorized: only the buyer can dispute this order', null, 403);
        }

        $reason = $request->input('reason', 'Goods damaged or not received');
        $description = $request->input('description', $reason);
        $userId = $user->id;
        $evidence = $request->input('evidence_photos', []);

        $this->escrowService->freezeEscrow($order, $reason, $userId, $evidence, $description);

        return $this->respondSuccess($order->fresh()->load(['items', 'store']));
    }
}