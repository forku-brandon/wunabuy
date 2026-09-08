<?php

namespace App\Http\Controllers\Api;

use App\Models\Product;
use App\Models\Review;
use App\Models\Store;
use App\Services\LogisticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CommerceController extends Controller
{
    public function __construct(protected LogisticsService $logisticsService)
    {
    }

    /**
     * Aggregated Home Feed for Mobile Marketplace.
     */
    public function homeFeed(): JsonResponse
    {
        $products = Product::with('store')
            ->where('is_active', true)
            ->limit(10)
            ->get();

        return $this->respondSuccess([
            'hero_banners' => [
                [
                    'id' => 'hero_1',
                    'tag' => '100% ESCROW GUARANTEE',
                    'title' => 'Shop with Total Peace of Mind',
                    'subtitle' => 'Your payment is held safely until you inspect & confirm delivery.',
                    'bg_color' => '#0D9488',
                    'image_url' => 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80',
                ]
            ],
            'partners' => [
                [
                    'id' => 'partner_1',
                    'name' => 'MTN Mobile Money',
                    'category' => 'Official MoMo Partner',
                    'icon_name' => 'phone-portrait-outline',
                    'icon_color' => '#F59E0B',
                    'badge' => '1-Tap Cashout',
                    'dial_code' => '*126#',
                ],
                [
                    'id' => 'partner_2',
                    'name' => 'Orange Money',
                    'category' => 'Mobile Wallet Partner',
                    'icon_name' => 'wallet-outline',
                    'icon_color' => '#F97316',
                    'badge' => 'Instant Transfer',
                    'dial_code' => '#150*50#',
                ],
                [
                    'id' => 'partner_3',
                    'name' => 'Flutterwave',
                    'category' => 'PCI-DSS Escrow Gateway',
                    'icon_name' => 'card-outline',
                    'icon_color' => '#0D9488',
                    'badge' => 'Verified Gateway',
                ],
                [
                    'id' => 'partner_4',
                    'name' => 'Ecobank Cameroon',
                    'category' => 'Bank Settlement Partner',
                    'icon_name' => 'business-outline',
                    'icon_color' => '#2563EB',
                    'badge' => 'Bank Partner',
                ],
            ],
            'categories' => ['All', 'Smartphones', 'Audio', 'Electronics', 'Fashion', 'Beauty', 'Offers'],
            'best_sellers' => $products,
            'special_offer' => [
                'eyebrow' => 'Special Offer',
                'title' => 'Up to 30% Off',
                'subtitle' => 'On selected verified electronics across Douala',
                'discount_percent' => 30,
                'image_url' => 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80',
            ],
        ]);
    }

    /**
     * Personalized Smart Discovery feed.
     */
    public function discoveryFeed(Request $request): JsonResponse
    {
        $products = Product::with('store')
            ->where('is_active', true)
            ->limit(20)
            ->get();

        return $this->respondPaginated($products, false, null, 20);
    }

    /**
     * Search and filter products catalog with spatial distance ranking.
     */
    public function getProducts(Request $request): JsonResponse
    {
        $query = Product::with('store')->where('is_active', true);

        if ($cat = $request->query('category')) {
            if ($cat !== 'All') {
                $query->where('category', $cat);
            }
        }

        if ($search = $request->query('search', $request->query('q'))) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                    ->orWhere('description', 'ilike', "%{$search}%");
            });
        }

        if ($tier = $request->query('quality_tier')) {
            $query->where('quality_tier', $tier);
        }

        if ($min = $request->query('min_price')) {
            $query->where('price', '>=', (float) $min);
        }

        if ($max = $request->query('max_price')) {
            $query->where('price', '<=', (float) $max);
        }

        $sort = $request->query('sort_by', 'relevance');
        if ($sort === 'price_asc') {
            $query->orderBy('price', 'asc');
        } elseif ($sort === 'price_desc') {
            $query->orderBy('price', 'desc');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $limit = (int) $request->query('limit', 15);
        $products = $query->take($limit)->get();

        // Calculate real distance if buyer lat/lng provided
        $buyerLat = $request->query('lat');
        $buyerLng = $request->query('lng');
        if ($buyerLat && $buyerLng) {
            $products->each(function ($p) use ($buyerLat, $buyerLng) {
                $sLat = (float) ($p->store->latitude ?? 4.0510);
                $sLng = (float) ($p->store->longitude ?? 9.7678);
                $p->distance_km = $this->logisticsService->calculateHaversineDistance((float) $buyerLat, (float) $buyerLng, $sLat, $sLng);
            });
        }

        return $this->respondPaginated($products, count($products) >= $limit, null, $limit);
    }

    /**
     * Single product details with store and reviews.
     */
    public function getProduct(string $id): JsonResponse
    {
        $product = Str::isUuid($id)
            ? Product::with('store')->find($id)
            : Product::with('store')->first();

        if (!$product) {
            return $this->respondError('NOT_FOUND', 'Product not found', null, 404);
        }

        $reviews = Review::where('target_type', 'product')
            ->where('target_id', $product->id)
            ->latest()
            ->take(5)
            ->get();

        $product->reviews = $reviews;

        return $this->respondSuccess([
            'product' => $product,
            'store' => $product->store,
        ]);
    }

    /**
     * Create product listing (Seller).
     */
    public function createProduct(Request $request): JsonResponse
    {
        $store = Store::first();

        $product = Product::create([
            'id' => (string) Str::uuid(),
            'store_id' => $store ? $store->id : (string) Str::uuid(),
            'name' => $request->input('name', 'New Product'),
            'description' => $request->input('description', ''),
            'price' => (float) $request->input('price', 10000),
            'currency' => 'XAF',
            'stock_quantity' => (int) $request->input('stock_quantity', 10),
            'category' => $request->input('category', 'Electronics'),
            'quality_tier' => $request->input('quality_tier', 'new'),
            'images' => $request->input('images', ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80']),
            'is_active' => true,
            'rating_avg' => 5.0,
            'total_reviews' => 0,
        ]);

        return $this->respondSuccess($product, [], 201);
    }

    /**
     * Update product listing.
     */
    public function updateProduct(Request $request, string $id): JsonResponse
    {
        $product = Str::isUuid($id) ? Product::find($id) : Product::first();
        if (!$product) {
            return $this->respondError('NOT_FOUND', 'Product not found', null, 404);
        }

        $product->fill($request->all());
        $product->save();

        return $this->respondSuccess($product);
    }

    /**
     * Delete product listing.
     */
    public function deleteProduct(string $id): JsonResponse
    {
        $product = Str::isUuid($id) ? Product::find($id) : null;
        if ($product) {
            $product->delete();
        }

        return $this->respondSuccess(['message' => 'Product deleted successfully']);
    }

    /**
     * Store details.
     */
    public function getStore(string $id): JsonResponse
    {
        $store = (Str::isUuid($id) ? Store::find($id) : null) ?? Store::first();
        if (!$store) {
            return $this->respondError('NOT_FOUND', 'Store not found', null, 404);
        }

        return $this->respondSuccess($store);
    }

    /**
     * Store 2D pickup specifications.
     */
    public function getStorePickupLocation(string $id): JsonResponse
    {
        $store = (Str::isUuid($id) ? Store::find($id) : null) ?? Store::first();
        if (!$store) {
            return $this->respondError('NOT_FOUND', 'Store not found', null, 404);
        }

        return $this->respondSuccess([
            'store_id' => $store->id,
            'store_name' => $store->store_name,
            'pickup_specs' => [
                ['spec' => 'STORE LOCATION', 'details' => $store->address_text],
                ['spec' => 'COUNTER HOURS', 'details' => $store->counter_hours ?? 'Mon - Sat: 08:00 AM - 07:30 PM'],
                ['spec' => 'PICKUP INSTRUCTIONS', 'details' => $store->rider_instructions ?? 'Show order QR or PIN to counter manager.'],
                ['spec' => 'STORE CONTACT', 'details' => $store->phone ?? '+237 670 123 456'],
            ],
        ]);
    }

    /**
     * Dynamic promotional banner for Cart screen.
     */
    public function getCartBanner(): JsonResponse
    {
        return $this->respondSuccess([
            'show_banner' => true,
            'promo_id' => 'promo_free_dlv_01',
            'promo_code' => 'WUNAFREE',
            'headline' => 'Free Delivery in Douala',
            'subtext' => 'On orders over 25,000 XAF with 100% Escrow Protection',
            'auto_dismiss_seconds' => 15,
            'expires_at' => now()->addDays(7)->toIso8601String(),
        ]);
    }

    /**
     * Create review.
     */
    public function createReview(Request $request): JsonResponse
    {
        $review = Review::create([
            'id' => (string) Str::uuid(),
            'user_id' => (string) Str::uuid(),
            'target_type' => $request->input('target_type', 'product'),
            'target_id' => $request->input('target_id', 'p_1'),
            'rating' => (int) $request->input('rating', 5),
            'comment' => $request->input('comment', 'Excellent quality and verified seller!'),
            'images' => $request->input('images', []),
        ]);

        return $this->respondSuccess($review, [], 201);
    }

    /**
     * Get paginated reviews for target resource.
     */
    public function getReviews(string $type, string $id): JsonResponse
    {
        $reviews = Review::where('target_type', strtolower($type))
            ->where('target_id', $id)
            ->latest()
            ->take(15)
            ->get();

        return $this->respondPaginated($reviews, false, null, 15);
    }
}