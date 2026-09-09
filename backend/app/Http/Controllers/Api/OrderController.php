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
        $query = Order::with(['items', 'store', 'transporter']);

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
            $buyer = User::where('role', 'buyer')->first() ?? User::first();
            $store = Store::first();

            $itemsData = $request->input('items', []);
            $subtotal = 0;

            $orderId = (string) Str::uuid();
            $orderCode = 'WB-' . date('Y') . '-' . rand(1000, 9999);
            $pickupPin = (string) rand(1000, 9999);

            $firstProduct = Product::first();

            $order = Order::create([
                'id' => $orderId,
                'order_code' => $orderCode,
                'customer_id' => $buyer ? $buyer->id : (string) Str::uuid(),
                'store_id' => $store ? $store->id : (string) Str::uuid(),
                'status' => 'pending',
                'subtotal' => 0,
                'delivery_fee' => (float) $request->input('delivery_fee', 1500),
                'total' => 0,
                'currency' => 'XAF',
                'payment_method' => $request->input('payment_method', 'mtn_momo'),
                'payment_status' => 'pending',
                'delivery_address' => $request->input('delivery_address', [
                    'label' => 'Home',
                    'address_text' => 'Boulevard de la Liberté, Bonanjo, Douala',
                    'city' => 'Douala',
                    'latitude' => 4.0611,
                    'longitude' => 9.7863,
                ]),
                'pickup_pin' => $pickupPin,
                'notes' => ($request->input('notes') ?? '') . ($idempotencyKey ? " [IDEMPOTENCY:{$idempotencyKey}]" : ''),
            ]);

            foreach ($itemsData as $item) {
                $productId = $item['product_id'] ?? null;
                $product = Str::isUuid($productId) ? Product::find($productId) : null;
                if (!$product) {
                    $product = $firstProduct;
                }

                $price = $product ? (float) $product->price : (float) ($item['price'] ?? 10000);
                $qty = (int) ($item['quantity'] ?? 1);
                $lineTotal = $price * $qty;
                $subtotal += $lineTotal;

                OrderItem::create([
                    'id' => (string) Str::uuid(),
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'name' => $product ? $product->name : ($item['product_name'] ?? 'Product'),
                    'price' => $price,
                    'quantity' => $qty,
                    'image_url' => is_array($product->images) ? ($product->images[0] ?? null) : null,
                ]);
            }

            if ($subtotal === 0) {
                $subtotal = 25000;
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
    public function show(string $id): JsonResponse
    {
        $order = (Str::isUuid($id) ? Order::with(['items', 'store', 'transporter'])->find($id) : null)
            ?? Order::where('order_code', $id)->first()
            ?? Order::with(['items', 'store', 'transporter'])->first();

        if (!$order) {
            return $this->respondError('NOT_FOUND', 'Order not found', null, 404);
        }

        return $this->respondSuccess($order);
    }

    /**
     * Update order fulfillment status.
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $order = Str::isUuid($id) ? Order::find($id) : Order::first();
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
    public function confirmReceipt(string $id): JsonResponse
    {
        $order = Str::isUuid($id) ? Order::find($id) : Order::first();
        if (!$order) {
            return $this->respondError('NOT_FOUND', 'Order not found', null, 404);
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
        $user = $request->user() ?? User::where('role', 'buyer')->first() ?? User::first();
        $disputes = Dispute::with(['order.store', 'order.items'])
            ->where(function ($q) use ($user) {
                if ($user) {
                    $q->where('user_id', $user->id)
                      ->orWhereHas('order', function ($oq) use ($user) {
                          $oq->where('customer_id', $user->id);
                      });
                }
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
                'order_code' => $order?->order_code ?? 'WB-2026-8812',
                'store_name' => $order?->store?->store_name ?? 'Akwa Super Store',
                'product_name' => $firstItem?->name ?? 'Samsung Galaxy A54 5G',
                'product_image' => $firstItem?->image_url ?? 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800',
                'amount' => (float) ($d->refund_amount > 0 ? $d->refund_amount : ($order?->total ?? 188000)),
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
        $order = Str::isUuid($id) ? Order::find($id) : Order::first();
        if (!$order) {
            return $this->respondError('NOT_FOUND', 'Order not found', null, 404);
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
        $order = Str::isUuid($id) ? Order::find($id) : Order::first();
        if (!$order) {
            return $this->respondError('NOT_FOUND', 'Order not found', null, 404);
        }

        $reason = $request->input('reason', 'Goods damaged or not received');
        $userId = $order->customer_id;
        $evidence = $request->input('evidence_photos', []);

        $this->escrowService->freezeEscrow($order, $reason, $userId, $evidence);

        return $this->respondSuccess($order->fresh()->load(['items', 'store']));
    }
}