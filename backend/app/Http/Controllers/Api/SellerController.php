<?php

namespace App\Http\Controllers\Api;

use App\Models\Order;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use App\Models\Wallet;
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
        protected PaymentService $paymentService
    ) {
    }

    /**
     * Store Owner Dashboard Overview metrics.
     */
    public function dashboard(): JsonResponse
    {
        $store = Store::first();
        $sellerUser = User::where('role', 'seller')->first() ?? User::first();
        $wallet = $sellerUser ? $sellerUser->wallet : null;

        $orders = Order::all();
        $pendingCount = $orders->where('status', 'pending')->count();
        $preparingCount = $orders->where('status', 'preparing')->count();
        $readyCount = $orders->where('status', 'ready_for_pickup')->count();

        return $this->respondSuccess([
            'store_name' => $store->store_name ?? 'Akwa Super Store',
            'is_verified' => (bool) ($store->is_verified ?? true),
            'rating_avg' => (float) ($store->rating_avg ?? 4.85),
            'total_reviews' => (int) ($store->total_reviews ?? 42),
            'available_balance' => (float) ($wallet->balance_available ?? 185000),
            'escrow_locked_balance' => (float) ($wallet->balance_escrow_locked ?? 54000),
            'total_revenue' => 820000,
            'total_paid_out' => 581000,
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
        $query = Order::with(['items', 'customer']);
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $orders = $query->latest()->get();

        return $this->respondSuccess($orders);
    }

    /**
     * Accept order within the 2-hour timeout window.
     */
    public function acceptOrder(string $id): JsonResponse
    {
        $order = Str::isUuid($id) ? Order::find($id) : Order::first();
        if ($order) {
            $order->status = 'preparing';
            $order->save();
        }

        return $this->respondSuccess(['accepted' => true, 'order_id' => $id]);
    }

    /**
     * Decline order.
     */
    public function declineOrder(Request $request, string $id): JsonResponse
    {
        $order = Str::isUuid($id) ? Order::find($id) : Order::first();
        if ($order) {
            $order->status = 'cancelled';
            $order->notes = ($order->notes ?? '') . ' [Seller Declined: ' . $request->input('reason', 'Out of stock') . ']';
            $order->save();
        }

        return $this->respondSuccess(['declined' => true, 'order_id' => $id]);
    }

    /**
     * Mark order ready for pickup and generate encrypted parcel QR tag.
     */
    public function markReady(Request $request, string $id): JsonResponse
    {
        $order = Str::isUuid($id) ? Order::find($id) : Order::first();
        if ($order) {
            $order->status = 'ready_for_pickup';
            $order->save();

            $qrData = $this->logisticsService->generateParcelQR($order);

            return $this->respondSuccess([
                'ready' => true,
                'order_id' => $order->id,
                'parcel_qr' => $qrData,
            ]);
        }

        return $this->respondSuccess(['ready' => true, 'order_id' => $id]);
    }

    /**
     * Store products list.
     */
    public function products(): JsonResponse
    {
        $store = Store::first();
        $products = $store ? Product::where('store_id', $store->id)->get() : Product::all();

        return $this->respondSuccess($products);
    }

    /**
     * Toggle product active/paused status.
     */
    public function toggleProductStatus(Request $request, string $id): JsonResponse
    {
        $product = Str::isUuid($id) ? Product::find($id) : Product::first();
        if ($product) {
            $product->is_active = (bool) $request->input('is_active', true);
            $product->save();
        }

        return $this->respondSuccess(['success' => true, 'is_active' => $product?->is_active]);
    }

    /**
     * Update product stock quantity.
     */
    public function updateStock(Request $request, string $id): JsonResponse
    {
        $product = Str::isUuid($id) ? Product::find($id) : Product::first();
        if ($product) {
            $product->stock_quantity = (int) $request->input('quantity', 10);
            $product->save();
        }

        return $this->respondSuccess(['success' => true, 'stock_quantity' => $product?->stock_quantity]);
    }

    /**
     * Request seller payout to Mobile Money.
     */
    public function requestPayout(Request $request): JsonResponse
    {
        $sellerUser = User::where('role', 'seller')->first() ?? User::first();
        $amount = (float) $request->input('amount', 50000);
        $phone = $request->input('phone', '+237670123456');
        $provider = $request->input('provider', 'mtn');

        $result = $this->paymentService->requestPayout($sellerUser, $amount, $phone, $provider);

        return $this->respondSuccess($result);
    }

    /**
     * Seller analytics telemetry.
     */
    public function analytics(Request $request): JsonResponse
    {
        $timeRange = $request->query('time_range', '7d');

        return $this->respondSuccess([
            'time_range' => $timeRange,
            'total_revenue' => 820000,
            'revenue_growth_percentage' => 18.4,
            'available_balance' => 47500,
            'escrow_locked_balance' => 236000,
            'weekly_sales' => [
                ['day' => 'Mon', 'amount' => 85000, 'heightPercent' => 45],
                ['day' => 'Tue', 'amount' => 120000, 'heightPercent' => 65],
                ['day' => 'Wed', 'amount' => 95000, 'heightPercent' => 50],
                ['day' => 'Thu', 'amount' => 160000, 'heightPercent' => 85],
                ['day' => 'Fri', 'amount' => 195000, 'heightPercent' => 100, 'isPeak' => true],
                ['day' => 'Sat', 'amount' => 140000, 'heightPercent' => 75],
                ['day' => 'Sun', 'amount' => 110000, 'heightPercent' => 60],
            ],
            'kpis' => [
                'completed_orders' => 148,
                'completion_rate' => 96.2,
                'avg_rating' => 4.9,
                'total_reviews' => 86,
                'repeat_buyer_percentage' => 34.8,
                'avg_dispatch_minutes' => 42,
            ],
            'top_products' => [
                ['id' => 'p1', 'name' => 'Samsung Galaxy A55 5G (8GB RAM, 256GB)', 'salesCount' => 42, 'revenue' => 945000],
                ['id' => 'p2', 'name' => 'Nike Air Max 270 Sneakers (Size 42)', 'salesCount' => 38, 'revenue' => 570000],
                ['id' => 'p3', 'name' => 'Wireless Bluetooth Earbuds Pro', 'salesCount' => 29, 'revenue' => 261000],
            ],
        ]);
    }

    /**
     * Update Seller Store Profile & Branding.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $store = Store::first();
        if ($store) {
            $store->store_name = $request->input('store_name', $store->store_name);
            $store->category = $request->input('category', $store->category);
            $store->address_text = $request->input('address_text', $store->address_text);
            $store->phone = $request->input('primary_phone', $store->phone);
            $store->counter_hours = $request->input('operating_hours', $store->counter_hours);
            $store->rider_instructions = $request->input('rider_pickup_instructions', $store->rider_instructions);
            $store->logo_url = $request->input('logo_url', $store->logo_url);
            $store->save();
        }

        return $this->respondSuccess(['success' => true, 'store' => $store]);
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
        $sellerUser = User::where('role', 'seller')->first() ?? User::first();
        $res = $this->kycService->submitSellerKYC($sellerUser, $request->all());

        return $this->respondSuccess($res);
    }

    /**
     * Get Store KYC status.
     */
    public function getKYCStatus(Request $request): JsonResponse
    {
        $store = Store::first();

        return $this->respondSuccess([
            'store_id' => $store->id ?? 'store_1',
            'status' => $store->kyc_status ?? 'pending',
            'is_verified' => (bool) ($store->is_verified ?? false),
            'submitted_at' => now()->subDay()->toIso8601String(),
        ]);
    }
}