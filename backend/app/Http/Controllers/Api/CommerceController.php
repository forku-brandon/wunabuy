<?php

namespace App\Http\Controllers\Api;

use App\Models\Advert;
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
            ->orderBy('rating_avg', 'desc')
            ->limit(10)
            ->get();

        // Dynamic Hero Banners from DB
        $dbBanners = Advert::where('type', 'banner')
            ->where('is_active', true)
            ->whereIn('target_audience', ['buyer', 'all'])
            ->orderBy('sort_order')
            ->get();

        $heroBanners = $dbBanners->map(function ($b) {
            return [
                'id' => $b->id,
                'badge' => $b->badge ?? 'WUNABUY MARKETPLACE',
                'badgeColor' => $b->badge_color ?? '#0D9488',
                'title' => $b->title,
                'subtitle' => $b->subtitle ?? '',
                'ctaText' => $b->cta_text ?? 'Shop Now',
                'imageUrl' => $b->image_url ?? '',
                'actionScreen' => $b->action_screen,
                'actionUrl' => $b->action_url,
            ];
        });

        // Dynamic Partners from DB
        $dbPartners = Advert::where('type', 'partner')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        $partners = $dbPartners->map(function ($p) {
            return [
                'id' => $p->id,
                'name' => $p->title,
                'category' => $p->category ?? $p->subtitle ?? 'Official Partner',
                'iconName' => $p->icon_name ?? 'shield-checkmark-outline',
                'iconColor' => $p->icon_color ?? '#0D9488',
                'badge' => $p->badge ?? 'Verified Partner',
            ];
        });

        // Dynamic Special Offer from DB
        $dbSpecialOffer = Advert::where('type', 'special_offer')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->first();

        $specialOffer = $dbSpecialOffer ? [
            'eyebrow' => $dbSpecialOffer->badge ?? 'Special Offer',
            'title' => $dbSpecialOffer->title,
            'subtitle' => $dbSpecialOffer->subtitle ?? '',
            'discount_percent' => $dbSpecialOffer->discount_percent ?? 30,
            'image_url' => $dbSpecialOffer->image_url ?? '',
        ] : null;

        return $this->respondSuccess([
            'hero_banners' => $heroBanners,
            'partners' => $partners,
            'categories' => ['All', 'Electronics', 'Health & Beauty', 'Fashion', 'Food & Groceries', 'Automotive'],
            'best_sellers' => $products,
            'special_offer' => $specialOffer,
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

        if ($storeId = $request->query('store_id')) {
            $query->where('store_id', $storeId);
        }

        if ($cat = $request->query('category')) {
            if ($cat !== 'All') {
                if (in_array(strtolower($cat), ['skincare', 'makeup', 'fragrance', 'haircare', 'tools', 'beauty'])) {
                    $query->where('category', 'Health & Beauty');
                } else {
                    $query->where('category', 'ilike', "%{$cat}%");
                }
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

        $limit = (int) $request->query('limit', 20);
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
    public function getProduct(Request $request, string $id): JsonResponse
    {
        $product = Str::isUuid($id)
            ? Product::with('store')->find($id)
            : Product::with('store')->where('name', 'ilike', "%{$id}%")->first();

        if (!$product) {
            return $this->respondError('NOT_FOUND', 'Product not found', null, 404);
        }

        // Calculate real spatial distance if buyer lat/lng provided
        $buyerLat = $request->query('lat');
        $buyerLng = $request->query('lng');
        if ($buyerLat && $buyerLng && $product->store) {
            $sLat = (float) ($product->store->latitude ?? 4.0510);
            $sLng = (float) ($product->store->longitude ?? 9.7678);
            $product->distance_km = $this->logisticsService->calculateHaversineDistance((float) $buyerLat, (float) $buyerLng, $sLat, $sLng);
        }

        $reviews = Review::with('user:id,full_name,avatar_url')
            ->where('target_type', 'product')
            ->where('target_id', $product->id)
            ->latest()
            ->take(20)
            ->get();

        // Dynamically compute real mathematical rating from customer reviews
        $reviewStats = Review::where('target_type', 'product')
            ->where('target_id', $product->id)
            ->selectRaw('COUNT(*) as total_count, COALESCE(AVG(rating), 0) as avg_rating')
            ->first();

        $totalCount = (int) ($reviewStats->total_count ?? 0);
        $avgRating = $totalCount > 0 ? (float) round($reviewStats->avg_rating ?? 0, 1) : 0.0;

        $product->total_reviews = $totalCount;
        $product->rating_avg = $avgRating;
        $product->reviews = $reviews;

        return $this->respondSuccess($product);
    }

    /**
     * Create product listing (Seller).
     */
    public function createProduct(Request $request): JsonResponse
    {
        $sellerUser = $this->resolveUser($request);
        if (!$sellerUser) {
            return $this->respondError('UNAUTHORIZED', 'Authentication required to create a product listing', null, 401);
        }

        $store = $sellerUser->store ?? Store::where('user_id', $sellerUser->id)->first();
        if (!$store) {
            $storeId = $request->input('store_id');
            if ($storeId && Str::isUuid($storeId)) {
                $candidate = Store::find($storeId);
                if ($candidate && ($candidate->user_id === $sellerUser->id || in_array($sellerUser->role, ['admin', 'superadmin']))) {
                    $store = $candidate;
                }
            }
        }

        if (!$store) {
            return $this->respondError('STORE_NOT_FOUND', 'Active seller store required to list products', null, 422);
        }

        $quantity = (int) ($request->input('quantity') ?? $request->input('stock_quantity', 10));
        if ($quantity < 0) {
            $quantity = 10;
        }

        $images = $request->input('images');
        if (!is_array($images) || empty($images)) {
            $images = ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80'];
        }

        $product = Product::create([
            'id' => (string) Str::uuid(),
            'store_id' => $store->id,
            'name' => $request->input('name', 'New Product'),
            'description' => $request->input('description', ''),
            'price' => (float) $request->input('price', 10000),
            'currency' => 'XAF',
            'quantity' => $quantity,
            'category' => $request->input('category', 'Electronics'),
            'quality_tier' => $request->input('quality_tier', 'new'),
            'images' => $images,
            'is_active' => true,
            'rating_avg' => 0.0,
            'total_reviews' => 0,
        ]);

        return $this->respondSuccess($product->load('store'), [], 201);
    }

    /**
     * Update product listing.
     */
    public function updateProduct(Request $request, string $id): JsonResponse
    {
        $sellerUser = $this->resolveUser($request);
        if (!$sellerUser) {
            return $this->respondError('UNAUTHORIZED', 'Authentication required', null, 401);
        }

        $product = Str::isUuid($id) ? Product::find($id) : null;
        if (!$product) {
            return $this->respondError('NOT_FOUND', 'Product not found', null, 404);
        }

        $store = $sellerUser->store ?? Store::where('user_id', $sellerUser->id)->first();
        $isOwner = ($store && $product->store_id === $store->id)
            || ($product->store && $product->store->user_id === $sellerUser->id)
            || in_array($sellerUser->role, ['admin', 'superadmin']);

        if (!$isOwner) {
            return $this->respondError('FORBIDDEN', 'Unauthorized: product belongs to another store', null, 403);
        }

        $data = $request->all();
        if (isset($data['stock_quantity']) && !isset($data['quantity'])) {
            $data['quantity'] = (int) $data['stock_quantity'];
        }
        if (isset($data['quantity'])) {
            $data['quantity'] = max(0, (int) $data['quantity']);
        }

        $product->fill($data);
        $product->save();

        return $this->respondSuccess($product->load('store'));
    }

    /**
     * Delete product listing.
     */
    public function deleteProduct(Request $request, string $id): JsonResponse
    {
        $sellerUser = $this->resolveUser($request);
        if (!$sellerUser) {
            return $this->respondError('UNAUTHORIZED', 'Authentication required', null, 401);
        }

        $product = Str::isUuid($id) ? Product::find($id) : null;
        if (!$product) {
            return $this->respondError('NOT_FOUND', 'Product not found', null, 404);
        }

        $store = $sellerUser->store ?? Store::where('user_id', $sellerUser->id)->first();
        $isOwner = ($store && $product->store_id === $store->id)
            || ($product->store && $product->store->user_id === $sellerUser->id)
            || in_array($sellerUser->role, ['admin', 'superadmin']);

        if (!$isOwner) {
            return $this->respondError('FORBIDDEN', 'Unauthorized: product belongs to another store', null, 403);
        }

        $product->delete();

        return $this->respondSuccess(['message' => 'Product deleted successfully']);
    }

    /**
     * Store details.
     */
    public function getStore(Request $request, string $id): JsonResponse
    {
        if ($id === 'my_store' || $id === 'me') {
            $user = $this->resolveUser($request);
            if (!$user) {
                return $this->respondError('UNAUTHENTICATED', 'User session expired or not found', null, 401);
            }
            $store = $user->store ?? Store::where('user_id', $user->id)->first();
            if (!$store) {
                return $this->respondError('NOT_FOUND', 'You do not have a registered store yet.', null, 404);
            }
            $store->load('products');
            return $this->respondSuccess($store);
        }

        if (!Str::isUuid($id)) {
            return $this->respondError('NOT_FOUND', 'Invalid store identifier', null, 404);
        }

        $store = Store::with('products')->find($id);
        if (!$store) {
            return $this->respondError('NOT_FOUND', 'Store not found', null, 404);
        }

        return $this->respondSuccess($store);
    }

    /**
     * Store 2D pickup specifications.
     */
    public function getStorePickupLocation(Request $request, string $id): JsonResponse
    {
        if ($id === 'my_store' || $id === 'me') {
            $user = $this->resolveUser($request);
            $store = $user?->store ?? ($user ? Store::where('user_id', $user->id)->first() : null);
        } elseif (Str::isUuid($id)) {
            $store = Store::find($id);
        } else {
            $store = null;
        }

        if (!$store) {
            return $this->respondError('NOT_FOUND', 'Store not found', null, 404);
        }

        return $this->respondSuccess([
            'store_id' => $store->id,
            'store_name' => $store->store_name,
            'address_text' => $store->address_text,
            'landmark' => $store->landmark,
            'city' => $store->city,
            'latitude' => $store->latitude,
            'longitude' => $store->longitude,
            'phone' => $store->phone,
            'counter_hours' => $store->counter_hours,
            'rider_instructions' => $store->rider_instructions,
            'is_verified' => (bool) $store->is_verified,
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
        $user = $this->resolveUser($request);
        if (!$user) {
            return $this->respondError('UNAUTHORIZED', 'Authentication required to post a review', null, 401);
        }

        $targetType = strtolower((string) $request->input('target_type', 'product'));
        $targetId = (string) ($request->input('target_id') ?? $request->input('product_id') ?? '');
        $rating = max(1, min(5, (int) $request->input('rating', 5)));
        $comment = trim((string) ($request->input('comment') ?? $request->input('review_text') ?? ''));

        if (empty($targetId)) {
            return $this->respondError('VALIDATION_ERROR', 'Target ID is required', null, 422);
        }

        $review = Review::create([
            'id' => (string) Str::uuid(),
            'user_id' => $user->id,
            'target_type' => $targetType,
            'target_id' => $targetId,
            'rating' => $rating,
            'comment' => $comment,
            'images' => $request->input('images', []),
        ]);

        // Recompute real-time rating and total reviews for target in PostgreSQL
        if ($targetType === 'product') {
            $product = Product::find($targetId);
            if ($product) {
                $stats = Review::where('target_type', 'product')
                    ->where('target_id', $product->id)
                    ->selectRaw('COUNT(*) as total, COALESCE(AVG(rating), 0) as avg')
                    ->first();
                $product->total_reviews = (int) ($stats->total ?? 0);
                $product->rating_avg = (float) round($stats->avg ?? 0, 1);
                $product->save();
            }
        } elseif ($targetType === 'store') {
            $store = Store::find($targetId);
            if ($store) {
                $stats = Review::where('target_type', 'store')
                    ->where('target_id', $store->id)
                    ->selectRaw('COUNT(*) as total, COALESCE(AVG(rating), 0) as avg')
                    ->first();
                $store->total_reviews = (int) ($stats->total ?? 0);
                $store->rating_avg = (float) round($stats->avg ?? 0, 1);
                $store->save();
            }
        }

        return $this->respondSuccess($review->load('user:id,full_name,avatar_url'), [], 201);
    }

    /**
     * Get paginated reviews for target resource.
     */
    public function getReviews(string $type, string $id): JsonResponse
    {
        $reviews = Review::with('user:id,full_name,avatar_url')
            ->where('target_type', strtolower($type))
            ->where('target_id', $id)
            ->latest()
            ->take(30)
            ->get();

        return $this->respondPaginated($reviews, false, null, count($reviews));
    }

    /**
     * Get active adverts / tips / partners for client apps.
     */
    public function getAdverts(Request $request): JsonResponse
    {
        $query = Advert::where('is_active', true);

        if ($audience = $request->query('audience')) {
            $query->whereIn('target_audience', [$audience, 'all']);
        }

        if ($type = $request->query('type')) {
            $query->where('type', $type);
        }

        $adverts = $query->orderBy('sort_order', 'asc')->get();

        return $this->respondSuccess($adverts);
    }

    /**
     * Report objectionable review (Google Play Store User Generated Content Compliance).
     */
    public function reportReview(Request $request, string $id): JsonResponse
    {
        $review = Str::isUuid($id) ? Review::find($id) : null;
        if (!$review) {
            return $this->respondError('NOT_FOUND', 'Review not found', null, 404);
        }

        $user = $this->resolveUser($request);
        $reason = $request->input('reason', 'inappropriate');
        $details = $request->input('details', '');

        \App\Models\AuditLog::create([
            'action' => 'REVIEW_REPORTED',
            'staff_name' => $user ? $user->full_name : 'Anonymous Reporter',
            'staff_role' => 'USER',
            'department' => 'MODERATION',
            'ip_address' => $request->ip() ?? '127.0.0.1',
            'target_resource' => 'REVIEW:' . $review->id,
            'status' => 'SUCCESS',
            'details' => [
                'review_id' => $review->id,
                'target_type' => $review->target_type,
                'target_id' => $review->target_id,
                'reason' => $reason,
                'details' => $details,
                'reporter_user_id' => $user?->id,
            ],
        ]);

        return $this->respondSuccess([
            'reported' => true,
            'review_id' => $review->id,
            'message' => 'Thank you for reporting. Our moderation team has been notified and will review this content.',
        ]);
    }
}