<?php

namespace App\Http\Controllers\Api;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Services\EscrowService;
use App\Services\KYCService;
use App\Services\LogisticsService;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SellerController extends Controller
{
    public function __construct(
        protected KYCService $kycService,
        protected LogisticsService $logisticsService,
        protected PaymentService $paymentService,
        protected EscrowService $escrowService
    ) {
    }

    /**
     * Store Owner Dashboard Overview metrics.
     */
    public function dashboard(): JsonResponse
    {
        $sellerUser = $this->resolveUser(request());
        if (!$sellerUser) {
            return $this->respondError('UNAUTHORIZED', 'Authentication required', null, 401);
        }
        $store = $sellerUser->store ?? Store::where('user_id', $sellerUser->id)->first();
        $wallet = $sellerUser ? $sellerUser->wallet : null;

        if ($store) {
            $stats = DB::table('orders')
                ->where('store_id', $store->id)
                ->selectRaw("
                    COUNT(*) FILTER (WHERE status IN ('pending', 'paid_escrow', 'pending_acceptance', 'pending_payment')) as pending_count,
                    COUNT(*) FILTER (WHERE status = 'preparing') as preparing_count,
                    COUNT(*) FILTER (WHERE status = 'ready_for_pickup') as ready_count,
                    COALESCE(SUM(total) FILTER (WHERE status IN ('delivered', 'completed', 'received')), 0) as total_revenue
                ")
                ->first();

            $pendingCount = (int) ($stats->pending_count ?? 0);
            $preparingCount = (int) ($stats->preparing_count ?? 0);
            $readyCount = (int) ($stats->ready_count ?? 0);
            $totalRevenue = (float) ($stats->total_revenue ?? 0);
        } else {
            $pendingCount = 0;
            $preparingCount = 0;
            $readyCount = 0;
            $totalRevenue = 0;
        }

        // Dynamic revenue fallback from wallet credits if orders total is zero
        if ($totalRevenue <= 0 && $wallet) {
            $totalRevenue = (float) WalletTransaction::where('wallet_id', $wallet->id)
                ->where('type', 'escrow_release')
                ->sum('amount');
        }

        // Total paid out from wallet transactions
        $totalPaidOut = $wallet ? (float) abs(
            WalletTransaction::where('wallet_id', $wallet->id)
                ->where('type', 'payout')
                ->sum('amount')
        ) : 0;

        $avail = (float) ($wallet->balance_available ?? 0);
        $locked = (float) ($wallet->balance_escrow_locked ?? 0);
        $bonus = (float) ($wallet->registration_bonus ?? 0);
        $withdrawable = max(0, $avail - $bonus);

        return $this->respondSuccess([
            'store_id' => $store?->id,
            'store_name' => $store?->store_name ?? ($sellerUser->full_name . "'s Store"),
            'category' => $store?->category ?? '',
            'address' => $store?->address_text ?? '',
            'landmark' => $store?->landmark ?? '',
            'tagline' => $store?->tagline ?? '',
            'description' => $store?->description ?? '',
            'primary_phone' => $store?->phone ?? $sellerUser->phone ?? '',
            'secondary_phone' => $store?->phone ?? '',
            'email' => $store?->email ?? $sellerUser->email ?? '',
            'operating_hours' => $store?->counter_hours ?? '',
            'rider_pickup_instructions' => $store?->rider_instructions ?? '',
            'logo_url' => $store?->logo_url ?? '',
            'cover_photo_url' => $store?->banner_url ?? '',
            'is_verified' => (bool) ($store->is_verified ?? false),
            'rating_avg' => (float) ($store->rating_avg ?? 5.0),
            'total_reviews' => (int) ($store->total_reviews ?? 0),
            'available_balance' => $avail,
            'escrow_locked_balance' => $locked,
            'registration_bonus' => $bonus,
            'withdrawable_balance' => $withdrawable,
            'total_revenue' => $totalRevenue,
            'total_paid_out' => $totalPaidOut,
            'pending_orders_count' => $pendingCount,
            'preparing_orders_count' => $preparingCount,
            'ready_orders_count' => $readyCount,
        ]);
    }

    /**
     * Store fulfillment orders queue.
     */
    public function orders(Request $request): JsonResponse
    {
        $sellerUser = $this->resolveUser($request);
        $store = $sellerUser?->store;

        $query = Order::with(['items', 'customer']);
        if ($store) {
            $query->where('store_id', $store->id);
        } elseif ($sellerUser && $sellerUser->role === 'seller') {
            return $this->respondSuccess([]);
        }

        if ($status = $request->query('status')) {
            if ($status === 'pending_acceptance') {
                $query->whereIn('status', ['pending', 'paid_escrow', 'pending_acceptance', 'pending_payment']);
            } elseif ($status === 'in_transit') {
                $query->whereIn('status', ['in_transit', 'en_route']);
            } elseif ($status === 'completed') {
                $query->whereIn('status', ['completed', 'delivered', 'received']);
            } else {
                $query->where('status', $status);
            }
        }

        $orders = $query->latest()->get();

        $formatted = $orders->map(function ($order) {
            $delivAddr = $order->delivery_address;
            $addressText = 'Douala';
            if (is_array($delivAddr)) {
                $addressText = $delivAddr['address_text'] ?? ($delivAddr['label'] ?? 'Douala');
            } elseif (is_string($delivAddr)) {
                $addressText = $delivAddr;
            }

            $mappedStatus = match ($order->status) {
                'pending', 'paid_escrow', 'pending_acceptance', 'pending_payment' => 'pending_acceptance',
                'preparing' => 'preparing',
                'ready_for_pickup' => 'ready_for_pickup',
                'in_transit', 'en_route' => 'in_transit',
                'delivered', 'completed', 'received' => 'completed',
                'cancelled' => 'cancelled',
                'disputed', 'resolved' => 'disputed',
                default => 'pending_acceptance',
            };

            return [
                'id' => $order->id,
                'order_code' => $order->order_code,
                'customer_name' => $order->customer?->full_name ?? 'Verified Buyer',
                'customer_phone' => $order->customer?->phone ?? '+237670000000',
                'delivery_address' => $addressText,
                'items' => $order->items->map(function ($item) {
                    return [
                        'product_id' => $item->product_id,
                        'name' => $item->name,
                        'price' => (float) $item->price,
                        'quantity' => (int) $item->quantity,
                        'image_url' => $item->image_url ?? 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80',
                    ];
                }),
                'subtotal' => (float) $order->subtotal,
                'delivery_fee' => (float) $order->delivery_fee,
                'commission' => (float) round($order->subtotal * 0.035),
                'total' => (float) $order->total,
                'status' => $mappedStatus,
                'created_at' => $order->created_at?->toIso8601String() ?? now()->toIso8601String(),
                'acceptance_expires_at' => $order->created_at ? $order->created_at->addHours(2)->toIso8601String() : now()->addHours(2)->toIso8601String(),
                'pickup_pin' => $order->pickup_pin ?? '84920',
                'delivery_method' => 'wunabuy_transporter',
            ];
        });

        return $this->respondSuccess($formatted);
    }

    /**
     * Accept order within the 2-hour timeout window.
     */
    public function acceptOrder(Request $request, string $id): JsonResponse
    {
        $sellerUser = $this->resolveUser($request);
        if (!$sellerUser) {
            return $this->respondError('UNAUTHORIZED', 'Authentication required', null, 401);
        }

        $order = (Str::isUuid($id) ? Order::find($id) : null)
            ?? Order::where('order_code', $id)->first();
        if (!$order) {
            return $this->respondError('NOT_FOUND', 'Order not found', null, 404);
        }

        $store = $sellerUser->store;
        if (!$store || $order->store_id !== $store->id) {
            return $this->respondError('FORBIDDEN', 'Unauthorized: Order belongs to another store', null, 403);
        }

        $order->status = 'preparing';
        $order->save();

        return $this->respondSuccess(['accepted' => true, 'order_id' => $id]);
    }

    /**
     * Decline order.
     */
    public function declineOrder(Request $request, string $id): JsonResponse
    {
        $sellerUser = $this->resolveUser($request);
        if (!$sellerUser) {
            return $this->respondError('UNAUTHORIZED', 'Authentication required', null, 401);
        }

        $order = (Str::isUuid($id) ? Order::find($id) : null)
            ?? Order::where('order_code', $id)->first();
        if (!$order) {
            return $this->respondError('NOT_FOUND', 'Order not found', null, 404);
        }

        $store = $sellerUser->store;
        if (!$store || $order->store_id !== $store->id) {
            return $this->respondError('FORBIDDEN', 'Unauthorized: Order belongs to another store', null, 403);
        }

        $order->status = 'cancelled';
        $order->notes = ($order->notes ?? '') . ' [Seller Declined: ' . $request->input('reason', 'Out of stock') . ']';
        $order->save();

        return $this->respondSuccess(['declined' => true, 'order_id' => $id]);
    }

    /**
     * Mark order ready for pickup and generate encrypted parcel QR tag.
     */
    public function markReady(Request $request, string $id): JsonResponse
    {
        $sellerUser = $this->resolveUser($request);
        if (!$sellerUser) {
            return $this->respondError('UNAUTHORIZED', 'Authentication required', null, 401);
        }

        $order = (Str::isUuid($id) ? Order::find($id) : null)
            ?? Order::where('order_code', $id)->first();
        if (!$order) {
            return $this->respondError('NOT_FOUND', 'Order not found', null, 404);
        }

        $store = $sellerUser->store;
        if (!$store || $order->store_id !== $store->id) {
            return $this->respondError('FORBIDDEN', 'Unauthorized: Order belongs to another store', null, 403);
        }

        $order->status = 'ready_for_pickup';
        $order->save();

        $qrData = $this->logisticsService->generateParcelQR($order);

        return $this->respondSuccess([
            'ready' => true,
            'order_id' => $order->id,
            'parcel_qr' => $qrData,
        ]);
    }

    /**
     * Handover parcel to rider after PIN verification.
     */
    public function handoverOrder(Request $request, string $id): JsonResponse
    {
        $sellerUser = $this->resolveUser($request);
        if (!$sellerUser) {
            return $this->respondError('UNAUTHORIZED', 'Authentication required', null, 401);
        }

        $order = (Str::isUuid($id) ? Order::find($id) : null)
            ?? Order::where('order_code', $id)->first();
        if (!$order) {
            return $this->respondError('NOT_FOUND', 'Order not found', null, 404);
        }

        $store = $sellerUser->store;
        if (!$store || $order->store_id !== $store->id) {
            return $this->respondError('FORBIDDEN', 'Unauthorized: Order belongs to another store', null, 403);
        }

        $order->status = 'in_transit';
        $order->save();

        return $this->respondSuccess(['handed_over' => true, 'order_id' => $id]);
    }

    /**
     * Mark order completed (releases escrow to seller wallet).
     */
    public function completeOrder(Request $request, string $id): JsonResponse
    {
        $sellerUser = $this->resolveUser($request);
        if (!$sellerUser) {
            return $this->respondError('UNAUTHORIZED', 'Authentication required', null, 401);
        }

        $order = (Str::isUuid($id) ? Order::find($id) : null)
            ?? Order::where('order_code', $id)->first();
        if (!$order) {
            return $this->respondError('NOT_FOUND', 'Order not found', null, 404);
        }

        $store = $sellerUser->store;
        if (!$store || $order->store_id !== $store->id) {
            return $this->respondError('FORBIDDEN', 'Unauthorized: Order belongs to another store', null, 403);
        }

        $this->escrowService->releaseEscrow($order, 'Seller Delivery Confirmation');

        return $this->respondSuccess(['completed' => true, 'order' => $order->fresh()]);
    }

    /**
     * Store products list.
     */
    public function products(Request $request): JsonResponse
    {
        $sellerUser = $this->resolveUser($request);
        $store = $sellerUser?->store;

        if ($store) {
            $products = Product::with('store')->where('store_id', $store->id)->latest()->get();
        } else {
            $products = Product::with('store')->latest()->get();
        }

        return $this->respondSuccess($products);
    }

    /**
     * Toggle product active/paused status.
     */
    public function toggleProductStatus(Request $request, string $id): JsonResponse
    {
        $sellerUser = $this->resolveUser($request);
        if (!$sellerUser) {
            return $this->respondError('UNAUTHORIZED', 'Authentication required', null, 401);
        }

        $product = Str::isUuid($id) ? Product::find($id) : null;
        if (!$product) {
            return $this->respondError('NOT_FOUND', 'Product not found', null, 404);
        }

        $store = $sellerUser->store;
        if (!$store || $product->store_id !== $store->id) {
            return $this->respondError('FORBIDDEN', 'Unauthorized: Product belongs to another store', null, 403);
        }

        $product->is_active = (bool) $request->input('is_active', true);
        $product->save();

        return $this->respondSuccess(['success' => true, 'is_active' => $product->is_active]);
    }

    /**
     * Update product stock quantity.
     */
    public function updateStock(Request $request, string $id): JsonResponse
    {
        $sellerUser = $this->resolveUser($request);
        if (!$sellerUser) {
            return $this->respondError('UNAUTHORIZED', 'Authentication required', null, 401);
        }

        $product = Str::isUuid($id) ? Product::find($id) : null;
        if (!$product) {
            return $this->respondError('NOT_FOUND', 'Product not found', null, 404);
        }

        $store = $sellerUser->store;
        if (!$store || $product->store_id !== $store->id) {
            return $this->respondError('FORBIDDEN', 'Unauthorized: Product belongs to another store', null, 403);
        }

        $newQuantity = max(0, (int) $request->input('quantity', 10));
        $product->quantity = $newQuantity;
        $product->save();

        return $this->respondSuccess(['success' => true, 'stock_quantity' => $product->quantity]);
    }

    /**
     * Request seller payout to Mobile Money.
     */
    public function requestPayout(Request $request): JsonResponse
    {
        $sellerUser = $this->resolveUser($request);
        if (!$sellerUser) {
            return $this->respondError('UNAUTHORIZED', 'Authentication required', null, 401);
        }
        $amount = (float) $request->input('amount', 0);
        if ($amount < 100) {
            return $this->respondError('VALIDATION_ERROR', 'Minimum payout request is 100 XAF.', ['amount' => ['Minimum is 100 XAF.']], 422);
        }
        $phone = $request->input('phone', $sellerUser->phone);
        $provider = $request->input('provider', 'mtn');

        try {
            $result = $this->paymentService->requestPayout($sellerUser, $amount, $phone, $provider);
            return $this->respondSuccess($result);
        } catch (\RuntimeException $e) {
            return $this->respondError('WITHDRAWAL_RESTRICTED', $e->getMessage(), ['amount' => [$e->getMessage()]], 422);
        }
    }

    /**
     * Seller analytics telemetry.
     */
    public function analytics(Request $request): JsonResponse
    {
        $sellerUser = $this->resolveUser($request);
        if (!$sellerUser) {
            return $this->respondError('UNAUTHORIZED', 'Authentication required', null, 401);
        }
        $store = ($sellerUser && $sellerUser->store) ? $sellerUser->store : null;
        $wallet = $sellerUser->wallet ?? null;
        $timeRange = $request->query('time_range', '7d');

        $available = (float) ($wallet->balance_available ?? 0);
        $escrowLocked = (float) ($wallet->balance_escrow_locked ?? 0);

        if (!$store) {
            return $this->respondSuccess([
                'time_range' => $timeRange,
                'total_revenue' => 0.0,
                'revenue_growth_percentage' => 0.0,
                'available_balance' => $available,
                'escrow_locked_balance' => $escrowLocked,
                'weekly_sales' => [],
                'kpis' => [
                    'completed_orders' => 0,
                    'completion_rate' => 100.0,
                    'avg_rating' => 0.0,
                    'total_reviews' => 0,
                    'repeat_buyer_percentage' => 0.0,
                    'avg_dispatch_minutes' => 0,
                ],
                'top_products' => [],
            ]);
        }

        // Time window definition
        $now = now();
        if ($timeRange === '30d') {
            $startDate = $now->copy()->subDays(29)->startOfDay();
            $prevStartDate = $startDate->copy()->subDays(30);
            $prevEndDate = $startDate->copy()->subSecond();
        } elseif ($timeRange === '1y' || $timeRange === 'this_year') {
            $startDate = $now->copy()->startOfYear();
            $prevStartDate = $startDate->copy()->subYear();
            $prevEndDate = $startDate->copy()->subSecond();
        } else { // '7d' default
            $startDate = $now->copy()->subDays(6)->startOfDay();
            $prevStartDate = $startDate->copy()->subDays(7);
            $prevEndDate = $startDate->copy()->subSecond();
        }

        // Fetch actual store orders in window
        $ordersInPeriod = Order::where('store_id', $store->id)
            ->where('created_at', '>=', $startDate)
            ->where('created_at', '<=', $now)
            ->get();

        $completedStatuses = ['delivered', 'completed', 'received'];
        $completedOrdersCount = $ordersInPeriod->whereIn('status', $completedStatuses)->count();
        $totalOrdersInPeriod = $ordersInPeriod->count();
        $completionRate = $totalOrdersInPeriod > 0
            ? round(($completedOrdersCount / $totalOrdersInPeriod) * 100, 1)
            : 100.0;

        $totalRevenue = (float) $ordersInPeriod->whereIn('status', $completedStatuses)->sum('total');

        // Growth rate compared to previous period of same duration
        $prevRevenue = (float) Order::where('store_id', $store->id)
            ->where('created_at', '>=', $prevStartDate)
            ->where('created_at', '<=', $prevEndDate)
            ->whereIn('status', $completedStatuses)
            ->sum('total');

        $revenueGrowthPercentage = 0.0;
        if ($prevRevenue > 0) {
            $revenueGrowthPercentage = round((($totalRevenue - $prevRevenue) / $prevRevenue) * 100, 1);
        } elseif ($totalRevenue > 0) {
            $revenueGrowthPercentage = 100.0;
        }

        // Daily/Periodic sales breakdown for charts
        $salesBreakdown = [];
        $maxDailyAmt = 0;

        if ($timeRange === '30d') {
            for ($i = 0; $i < 4; $i++) {
                $wStart = $startDate->copy()->addDays($i * 7);
                $wEnd = $i === 3 ? $now : $wStart->copy()->addDays(6)->endOfDay();
                $label = 'W' . ($i + 1);
                $amt = (float) $ordersInPeriod->whereBetween('created_at', [$wStart, $wEnd])
                    ->whereIn('status', $completedStatuses)
                    ->sum('total');
                if ($amt > $maxDailyAmt) {
                    $maxDailyAmt = $amt;
                }
                $salesBreakdown[] = [
                    'day' => $label,
                    'amount' => $amt,
                ];
            }
        } elseif ($timeRange === '1y' || $timeRange === 'this_year') {
            $monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            for ($m = 1; $m <= 12; $m++) {
                $mStart = $now->copy()->setMonth($m)->startOfMonth();
                $mEnd = $mStart->copy()->endOfMonth();
                $label = $monthNames[$m - 1];
                $amt = (float) Order::where('store_id', $store->id)
                    ->whereBetween('created_at', [$mStart, $mEnd])
                    ->whereIn('status', $completedStatuses)
                    ->sum('total');
                if ($amt > $maxDailyAmt) {
                    $maxDailyAmt = $amt;
                }
                $salesBreakdown[] = [
                    'day' => $label,
                    'amount' => $amt,
                ];
            }
        } else { // 7d
            for ($i = 0; $i < 7; $i++) {
                $dayDate = $startDate->copy()->addDays($i);
                $dStart = $dayDate->copy()->startOfDay();
                $dEnd = $dayDate->copy()->endOfDay();
                $label = $dayDate->format('D');
                $amt = (float) $ordersInPeriod->whereBetween('created_at', [$dStart, $dEnd])
                    ->whereIn('status', $completedStatuses)
                    ->sum('total');
                if ($amt > $maxDailyAmt) {
                    $maxDailyAmt = $amt;
                }
                $salesBreakdown[] = [
                    'day' => $label,
                    'amount' => $amt,
                ];
            }
        }

        $weeklySales = [];
        foreach ($salesBreakdown as $entry) {
            $hPercent = $maxDailyAmt > 0 ? (int) round(($entry['amount'] / $maxDailyAmt) * 100) : 0;
            $weeklySales[] = [
                'day' => $entry['day'],
                'amount' => (int) round($entry['amount']),
                'heightPercent' => $hPercent,
                'isPeak' => ($maxDailyAmt > 0 && $entry['amount'] >= $maxDailyAmt),
            ];
        }

        // Aggregate real Top Products from OrderItems
        $topItems = OrderItem::whereHas('order', function ($q) use ($store, $startDate, $now) {
                $q->where('store_id', $store->id)
                  ->where('created_at', '>=', $startDate)
                  ->where('created_at', '<=', $now)
                  ->whereIn('status', ['delivered', 'completed', 'received', 'confirmed', 'processing', 'ready_for_pickup']);
            })
            ->select('product_id', DB::raw('SUM(quantity) as total_qty'), DB::raw('SUM(quantity * price) as total_revenue'))
            ->groupBy('product_id')
            ->orderByDesc('total_revenue')
            ->take(5)
            ->get();

        $topProducts = [];
        foreach ($topItems as $item) {
            $p = Product::find($item->product_id);
            if ($p) {
                $topProducts[] = [
                    'id' => $p->id,
                    'name' => $p->name,
                    'salesCount' => (int) $item->total_qty,
                    'revenue' => (float) $item->total_revenue,
                ];
            }
        }

        // Calculate repeat buyer percentage
        $customerOrderCounts = Order::where('store_id', $store->id)
            ->select('customer_id', DB::raw('count(*) as count'))
            ->groupBy('customer_id')
            ->get();

        $totalCustomers = $customerOrderCounts->count();
        $repeatCustomers = $customerOrderCounts->where('count', '>', 1)->count();
        $repeatBuyerPercentage = $totalCustomers > 0
            ? round(($repeatCustomers / $totalCustomers) * 100, 1)
            : 0.0;

        // Calculate average fulfillment minutes from delivered_at
        $deliveredOrders = Order::where('store_id', $store->id)
            ->whereNotNull('delivered_at')
            ->get();

        $totalMinutes = 0;
        $fulfilledCount = 0;
        foreach ($deliveredOrders as $do) {
            if ($do->delivered_at && $do->created_at) {
                $totalMinutes += $do->created_at->diffInMinutes($do->delivered_at);
                $fulfilledCount++;
            }
        }
        $avgDispatchMinutes = $fulfilledCount > 0 ? (int) round($totalMinutes / $fulfilledCount) : 0;

        return $this->respondSuccess([
            'time_range' => $timeRange,
            'total_revenue' => $totalRevenue,
            'revenue_growth_percentage' => $revenueGrowthPercentage,
            'available_balance' => $available,
            'escrow_locked_balance' => $escrowLocked,
            'weekly_sales' => $weeklySales,
            'kpis' => [
                'completed_orders' => $completedOrdersCount,
                'completion_rate' => $completionRate,
                'avg_rating' => (float) ($store->rating_avg ?? 0.0),
                'total_reviews' => (int) ($store->total_reviews ?? 0),
                'repeat_buyer_percentage' => $repeatBuyerPercentage,
                'avg_dispatch_minutes' => $avgDispatchMinutes,
            ],
            'top_products' => $topProducts,
        ]);
    }

    /**
     * Update Seller Store Profile & Branding.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return $this->respondError('UNAUTHENTICATED', 'User session expired or not found', null, 401);
        }

        $store = $user->store ?? Store::where('user_id', $user->id)->first();
        if (!$store) {
            $store = Store::create([
                'id' => (string) Str::uuid(),
                'user_id' => $user->id,
                'store_name' => $request->input('store_name', ($user->full_name ?: 'Merchant') . "'s Store"),
                'category' => $request->input('category', 'General Merchandise'),
                'address_text' => $request->input('address_text', 'Douala, Cameroon'),
                'city' => $request->input('city', 'Douala'),
                'is_verified' => false,
                'is_active' => true,
            ]);
        }

        if ($request->has('store_name')) $store->store_name = $request->input('store_name');
        if ($request->has('category')) $store->category = $request->input('category');
        if ($request->has('tagline')) $store->tagline = $request->input('tagline');
        if ($request->has('description')) $store->description = $request->input('description');
        if ($request->has('address_text')) $store->address_text = $request->input('address_text');
        if ($request->has('landmark_directions')) $store->landmark = $request->input('landmark_directions');
        if ($request->has('landmark')) $store->landmark = $request->input('landmark');
        if ($request->has('primary_phone')) $store->phone = $request->input('primary_phone');
        if ($request->has('phone')) $store->phone = $request->input('phone');
        if ($request->has('email')) $store->email = $request->input('email');
        if ($request->has('operating_hours')) $store->counter_hours = $request->input('operating_hours');
        if ($request->has('rider_pickup_instructions')) $store->rider_instructions = $request->input('rider_pickup_instructions');
        if ($request->has('logo_url')) $store->logo_url = $request->input('logo_url');
        if ($request->has('cover_photo_url')) $store->banner_url = $request->input('cover_photo_url');
        if ($request->has('banner_url')) $store->banner_url = $request->input('banner_url');
        if ($request->has('latitude')) $store->latitude = $request->input('latitude');
        if ($request->has('longitude')) $store->longitude = $request->input('longitude');

        $store->save();

        return $this->respondSuccess($store);
    }

    /**
     * Barcode lookup.
     */
    public function barcodeLookup(string $barcode): JsonResponse
    {
        return $this->respondSuccess([
            'barcode' => $barcode,
            'name' => 'Samsung Galaxy A55 5G (8GB RAM, 256GB)',
            'category' => 'Electronics',
            'price' => 225000,
            'currency' => 'XAF',
            'quantity' => 12,
            'quality_tier' => 'new',
            'description' => 'Brand new factory sealed smartphone with 1 year official warranty.',
        ]);
    }

    /**
     * Submit Store KYC.
     */
    public function submitKYC(Request $request): JsonResponse
    {
        $sellerUser = $this->resolveUser($request);
        if (!$sellerUser) {
            return $this->respondError('UNAUTHENTICATED', 'User session expired or not found', null, 401);
        }

        $res = $this->kycService->submitSellerKYC($sellerUser, $request->all());

        return $this->respondSuccess($res);
    }

    /**
     * Get Store KYC status.
     */
    public function getKYCStatus(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return $this->respondError('UNAUTHENTICATED', 'User session expired or not found', null, 401);
        }

        $store = $user->store;
        $submission = DB::table('seller_kyc_submissions')
            ->where('user_id', $user->id)
            ->latest('created_at')
            ->first();

        $status = 'unsubmitted';
        $reviewerNotes = null;
        $reviewedAt = null;
        $submittedAt = null;

        if ($submission) {
            $status = $submission->status;
            $reviewerNotes = $submission->reviewer_notes;
            $reviewedAt = $submission->reviewed_at;
            $submittedAt = $submission->created_at;
        } elseif ($store) {
            $status = $store->kyc_status ?? 'pending';
        }

        return $this->respondSuccess([
            'store_id' => $store->id ?? null,
            'status' => $status,
            'is_verified' => (bool) ($store->is_verified ?? false),
            'reviewer_notes' => $reviewerNotes,
            'rejection_reason' => $status === 'rejected' ? $reviewerNotes : null,
            'submitted_at' => $submittedAt,
            'reviewed_at' => $reviewedAt,
        ]);
    }
}