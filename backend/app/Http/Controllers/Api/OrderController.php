<?php

namespace App\Http\Controllers\Api;

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