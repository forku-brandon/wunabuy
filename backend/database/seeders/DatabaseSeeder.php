<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ─────────────────────────────────────────────────────────────────────
        // 1. SEED USERS & WALLETS
        // ─────────────────────────────────────────────────────────────────────

        // Buyer User: Jean Dupont
        $existingBuyer = DB::table('users')->where('phone', '+237670123456')->first();
        if ($existingBuyer) {
            $buyerId = $existingBuyer->id;
            DB::table('users')->where('id', $buyerId)->update([
                'email' => 'jean.dupont@wunabuy.com',
                'full_name' => 'Jean Dupont',
                'role' => 'buyer',
                'status' => 'active',
                'avatar_url' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                'is_phone_verified' => true,
                'available_roles' => json_encode(['buyer']),
                'updated_at' => now(),
            ]);
        } else {
            $buyerId = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';
            DB::table('users')->insert([
                'id' => $buyerId,
                'phone' => '+237670123456',
                'email' => 'jean.dupont@wunabuy.com',
                'full_name' => 'Jean Dupont',
                'role' => 'buyer',
                'status' => 'active',
                'avatar_url' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                'is_phone_verified' => true,
                'available_roles' => json_encode(['buyer']),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Buyer Wallet
        $existingBuyerWallet = DB::table('wallets')->where('user_id', $buyerId)->first();
        if ($existingBuyerWallet) {
            DB::table('wallets')->where('user_id', $buyerId)->update([
                'balance_available' => 47500.00,
                'balance_escrow_locked' => 236000.00,
                'currency' => 'XAF',
                'is_active' => true,
                'updated_at' => now(),
            ]);
        } else {
            DB::table('wallets')->insert([
                'id' => (string) Str::uuid(),
                'user_id' => $buyerId,
                'balance_available' => 47500.00,
                'balance_escrow_locked' => 236000.00,
                'currency' => 'XAF',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Transporter User: Paul Eto'o
        $existingTrans = DB::table('users')->where('phone', '+237680445566')->first();
        if ($existingTrans) {
            $transporterUserId = $existingTrans->id;
            DB::table('users')->where('id', $transporterUserId)->update([
                'email' => 'paul.rider@wunabuy.com',
                'full_name' => 'Paul Eto’o (Express Courier)',
                'role' => 'transporter',
                'status' => 'active',
                'is_phone_verified' => true,
                'available_roles' => json_encode(['buyer', 'transporter']),
                'updated_at' => now(),
            ]);
        } else {
            $transporterUserId = (string) Str::uuid();
            DB::table('users')->insert([
                'id' => $transporterUserId,
                'phone' => '+237680445566',
                'email' => 'paul.rider@wunabuy.com',
                'full_name' => 'Paul Eto’o (Express Courier)',
                'role' => 'transporter',
                'status' => 'active',
                'is_phone_verified' => true,
                'available_roles' => json_encode(['buyer', 'transporter']),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $existingTransporterRecord = DB::table('transporters')->where('user_id', $transporterUserId)->first();
        if ($existingTransporterRecord) {
            DB::table('transporters')->where('user_id', $transporterUserId)->update([
                'vehicle_type' => 'moto',
                'vehicle_plate' => 'LT-8492-AB',
                'license_number' => 'CM-DRV-2024-99120',
                'status' => 'active',
                'is_online' => true,
                'current_lat' => 4.0535,
                'current_lng' => 9.7690,
                'rating_avg' => 4.95,
                'total_trips' => 312,
                'total_earnings' => 468000.00,
                'updated_at' => now(),
            ]);
        } else {
            DB::table('transporters')->insert([
                'id' => (string) Str::uuid(),
                'user_id' => $transporterUserId,
                'vehicle_type' => 'moto',
                'vehicle_plate' => 'LT-8492-AB',
                'license_number' => 'CM-DRV-2024-99120',
                'status' => 'active',
                'is_online' => true,
                'current_lat' => 4.0535,
                'current_lng' => 9.7690,
                'rating_avg' => 4.95,
                'total_trips' => 312,
                'total_earnings' => 468000.00,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Transporter Wallet
        $existingTransporterWallet = DB::table('wallets')->where('user_id', $transporterUserId)->first();
        if ($existingTransporterWallet) {
            DB::table('wallets')->where('user_id', $transporterUserId)->update([
                'balance_available' => 48500.00,
                'balance_escrow_locked' => 12500.00,
                'currency' => 'XAF',
                'is_active' => true,
                'updated_at' => now(),
            ]);
        } else {
            DB::table('wallets')->insert([
                'id' => (string) Str::uuid(),
                'user_id' => $transporterUserId,
                'balance_available' => 48500.00,
                'balance_escrow_locked' => 12500.00,
                'currency' => 'XAF',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Staff SuperAdmin
        $existingAdmin = DB::table('users')->where('phone', '+237699000001')->first();
        if ($existingAdmin) {
            $adminId = $existingAdmin->id;
            DB::table('users')->where('id', $adminId)->update([
                'email' => 'admin@wunabuy.com',
                'full_name' => 'Wunabuy SuperAdmin',
                'role' => 'superadmin',
                'status' => 'active',
                'is_phone_verified' => true,
                'available_roles' => json_encode(['superadmin', 'finance', 'logistics', 'compliance']),
                'updated_at' => now(),
            ]);
        } else {
            $adminId = (string) Str::uuid();
            DB::table('users')->insert([
                'id' => $adminId,
                'phone' => '+237699000001',
                'email' => 'admin@wunabuy.com',
                'full_name' => 'Wunabuy SuperAdmin',
                'role' => 'superadmin',
                'status' => 'active',
                'is_phone_verified' => true,
                'available_roles' => json_encode(['superadmin', 'finance', 'logistics', 'compliance']),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // ─────────────────────────────────────────────────────────────────────
        // 2. SEED 5 VERIFIED STORES
        // ─────────────────────────────────────────────────────────────────────

        $storesData = [
            [
                'id' => 'c6ed6a51-aa38-4d68-b27a-66331c85c858',
                'seller_phone' => '+237699112233',
                'seller_name' => 'Amadou Bello (Akwa Super Store)',
                'store_name' => 'Akwa Super Store',
                'tagline' => 'Best Electronics & Gadgets in Douala',
                'description' => 'Authentic smartphones, accessories, audio gear, and certified electronics with warranty.',
                'category' => 'Electronics',
                'address_text' => 'Akwa Main Blvd, Opposite Pharmacie du Centre, Douala',
                'landmark' => 'Near Rond-point Deido / Pharmacie du Centre',
                'city' => 'Douala',
                'latitude' => 4.0510564,
                'longitude' => 9.7678687,
                'counter_hours' => 'Mon - Sat: 08:00 AM - 07:30 PM',
                'phone' => '+237699112233',
                'email' => 'akwa.store@wunabuy.com',
                'rider_instructions' => 'Counter pickup at Gate B. Ask for Manager Jean.',
                'logo_url' => 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=400&q=80',
                'banner_url' => 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
                'rating_avg' => 4.90,
                'total_reviews' => 142,
            ],
            [
                'id' => '7b39a820-410d-4892-8021-998811223344',
                'seller_phone' => '+237675223344',
                'seller_name' => 'Fatima Njoya (Douala Glam)',
                'store_name' => 'Douala Glam Beauty & Cosmetics',
                'tagline' => 'Natural Radiance & Certified French Cosmetics',
                'description' => 'Premium dermatological skincare, organic shea body care, makeup, and hair tonics.',
                'category' => 'Health & Beauty',
                'address_text' => 'Rue Joss, Bonanjo Business District, Douala',
                'landmark' => 'Opposite Total Bonanjo, 2nd Floor',
                'city' => 'Douala',
                'latitude' => 4.0450,
                'longitude' => 9.6912,
                'counter_hours' => 'Mon - Sat: 08:30 AM - 06:30 PM',
                'phone' => '+237675223344',
                'email' => 'contact@doualaglam.cm',
                'rider_instructions' => 'Enter lobby, express pickup counter on right.',
                'logo_url' => 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80',
                'banner_url' => 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80',
                'rating_avg' => 4.95,
                'total_reviews' => 186,
            ],
            [
                'id' => '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
                'seller_phone' => '+237691334455',
                'seller_name' => 'Cedric Tagne (K-Town Fashion)',
                'store_name' => 'K-Town Fashion Hub',
                'tagline' => 'Contemporary African Prints & Urban Streetwear',
                'description' => 'Authentic Bamenda Toghu, tailored wax shirts, sneakers, and premium streetwear.',
                'category' => 'Fashion',
                'address_text' => 'Boulevard de la Liberté, Bali, Douala',
                'landmark' => 'Adjacent to Bicec Bali Branch',
                'city' => 'Douala',
                'latitude' => 4.0390,
                'longitude' => 9.7020,
                'counter_hours' => 'Mon - Sat: 09:00 AM - 08:00 PM',
                'phone' => '+237691334455',
                'email' => 'orders@ktownfashion.cm',
                'rider_instructions' => 'Dispatch door facing Boulevard. Ask for Cedric.',
                'logo_url' => 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80',
                'banner_url' => 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1200&q=80',
                'rating_avg' => 4.88,
                'total_reviews' => 95,
            ],
            [
                'id' => '5d6e7f8a-9b0c-1d2e-3f4a-5b6c7d8e9f0a',
                'seller_phone' => '+237678445566',
                'seller_name' => 'Mama Helene (Marché Central)',
                'store_name' => 'Marché Central Fresh & Organics',
                'tagline' => 'Fresh Farm Harvest & Cameroon Spices',
                'description' => 'Penja white pepper, Foumbot Arabica coffee, pure forest honey, and organic dry goods.',
                'category' => 'Food & Groceries',
                'address_text' => 'Avenue des Cocotiers, Marché Central, New Bell, Douala',
                'landmark' => 'Secteur Épices, Counter 14B',
                'city' => 'Douala',
                'latitude' => 4.0340,
                'longitude' => 9.7150,
                'counter_hours' => 'Mon - Sun: 07:00 AM - 06:00 PM',
                'phone' => '+237678445566',
                'email' => 'marche.central@wunabuy.com',
                'rider_instructions' => 'Motorbike parking behind Sector Epices.',
                'logo_url' => 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
                'banner_url' => 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1200&q=80',
                'rating_avg' => 4.92,
                'total_reviews' => 210,
            ],
            [
                'id' => '8e9f0a1b-2c3d-4e5f-6a7b-8c9d0e1f2a3b',
                'seller_phone' => '+237694556677',
                'seller_name' => 'Ingénieur Roger (Bassa Tech)',
                'store_name' => 'Bassa Auto Spares & Hardware',
                'tagline' => 'Certified Auto Parts, Diagnostic Tools & Home Gadgets',
                'description' => 'Car electronics, OBD2 scanners, tire inflators, power tools, and high-efficiency home lighting.',
                'category' => 'Automotive',
                'address_text' => 'Zone Industrielle Bassa, Douala',
                'landmark' => 'Near Brasseries du Cameroun Factory Gate 3',
                'city' => 'Douala',
                'latitude' => 4.0620,
                'longitude' => 9.7480,
                'counter_hours' => 'Mon - Sat: 07:30 AM - 06:00 PM',
                'phone' => '+237694556677',
                'email' => 'roger.bassa@wunabuy.com',
                'rider_instructions' => 'Heavy parcel loading dock at side entrance.',
                'logo_url' => 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80',
                'banner_url' => 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
                'rating_avg' => 4.82,
                'total_reviews' => 78,
            ],
        ];

        foreach ($storesData as $s) {
            $existingUser = DB::table('users')->where('phone', $s['seller_phone'])->first();
            if ($existingUser) {
                $sellerUserId = $existingUser->id;
                DB::table('users')->where('id', $sellerUserId)->update([
                    'email' => $s['email'],
                    'full_name' => $s['seller_name'],
                    'role' => 'seller',
                    'status' => 'active',
                    'avatar_url' => $s['logo_url'],
                    'is_phone_verified' => true,
                    'available_roles' => json_encode(['buyer', 'seller']),
                    'updated_at' => now(),
                ]);
            } else {
                $sellerUserId = (string) Str::uuid();
                DB::table('users')->insert([
                    'id' => $sellerUserId,
                    'phone' => $s['seller_phone'],
                    'email' => $s['email'],
                    'full_name' => $s['seller_name'],
                    'role' => 'seller',
                    'status' => 'active',
                    'avatar_url' => $s['logo_url'],
                    'is_phone_verified' => true,
                    'available_roles' => json_encode(['buyer', 'seller']),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // Seller Wallet
            $existingSellerWallet = DB::table('wallets')->where('user_id', $sellerUserId)->first();
            if ($existingSellerWallet) {
                DB::table('wallets')->where('user_id', $sellerUserId)->update([
                    'balance_available' => 145000.00,
                    'balance_escrow_locked' => 68000.00,
                    'currency' => 'XAF',
                    'is_active' => true,
                    'updated_at' => now(),
                ]);
            } else {
                DB::table('wallets')->insert([
                    'id' => (string) Str::uuid(),
                    'user_id' => $sellerUserId,
                    'balance_available' => 145000.00,
                    'balance_escrow_locked' => 68000.00,
                    'currency' => 'XAF',
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            DB::table('stores')->updateOrInsert(
                ['id' => $s['id']],
                [
                    'user_id' => $sellerUserId,
                    'store_name' => $s['store_name'],
                    'tagline' => $s['tagline'],
                    'description' => $s['description'],
                    'category' => $s['category'],
                    'address_text' => $s['address_text'],
                    'landmark' => $s['landmark'],
                    'city' => $s['city'],
                    'latitude' => $s['latitude'],
                    'longitude' => $s['longitude'],
                    'counter_hours' => $s['counter_hours'],
                    'phone' => $s['phone'],
                    'email' => $s['email'],
                    'rider_instructions' => $s['rider_instructions'],
                    'logo_url' => $s['logo_url'],
                    'banner_url' => $s['banner_url'],
                    'rating_avg' => $s['rating_avg'],
                    'total_reviews' => $s['total_reviews'],
                    'is_verified' => true,
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        // ─────────────────────────────────────────────────────────────────────
        // 3. SEED 20+ REAL CATALOG PRODUCTS ACROSS ALL CATEGORIES
        // ─────────────────────────────────────────────────────────────────────

        $productsData = [
            // ── ELECTRONICS (Akwa Super Store) ──
            [
                'id' => '030d5e57-533a-421f-bdff-688e1eac866e',
                'store_id' => 'c6ed6a51-aa38-4d68-b27a-66331c85c858',
                'name' => 'Samsung Galaxy A54 5G (128GB, Awesome Lime)',
                'description' => 'Official Samsung Cameroon warranty, Super AMOLED 120Hz display, 50MP OIS camera, 5000mAh battery with 25W fast charge.',
                'category' => 'Electronics',
                'price' => 188000.00,
                'quantity' => 15,
                'quality_tier' => 'brand_new',
                'images' => [
                    'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
                ],
                'rating_avg' => 4.95,
                'total_reviews' => 38,
            ],
            [
                'id' => 'addc80d6-1a71-44dc-ab64-7cf007ad91dd',
                'store_id' => 'c6ed6a51-aa38-4d68-b27a-66331c85c858',
                'name' => 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
                'description' => 'Industry-leading noise cancellation with two processors and 8 microphones. 30-hour battery life and ultra-comfortable soft fit leather.',
                'category' => 'Electronics',
                'price' => 165000.00,
                'quantity' => 8,
                'quality_tier' => 'brand_new',
                'images' => [
                    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80',
                ],
                'rating_avg' => 4.88,
                'total_reviews' => 19,
            ],
            [
                'id' => '22114433-5566-7788-9900-aabbccddeeff',
                'store_id' => 'c6ed6a51-aa38-4d68-b27a-66331c85c858',
                'name' => 'Apple iPhone 14 Pro (256GB, Deep Purple)',
                'description' => 'Dynamic Island, Always-On display, 48MP main camera with phototonic engine. Factory unlocked with 12-month Apple warranty.',
                'category' => 'Electronics',
                'price' => 560000.00,
                'quantity' => 6,
                'quality_tier' => 'brand_new',
                'images' => [
                    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80',
                ],
                'rating_avg' => 5.0,
                'total_reviews' => 42,
            ],
            [
                'id' => '33221100-4455-6677-8899-bbccddeeff00',
                'store_id' => 'c6ed6a51-aa38-4d68-b27a-66331c85c858',
                'name' => 'JBL Charge 5 Waterproof Portable Bluetooth Speaker',
                'description' => 'Bold JBL Original Pro Sound with long excursion driver, separate tweeter and dual pumping bass radiators. 20 hours of playtime.',
                'category' => 'Electronics',
                'price' => 72000.00,
                'quantity' => 12,
                'quality_tier' => 'brand_new',
                'images' => [
                    'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
                ],
                'rating_avg' => 4.90,
                'total_reviews' => 27,
            ],
            [
                'id' => '44332211-5566-7788-9900-ccddeeff0011',
                'store_id' => 'c6ed6a51-aa38-4d68-b27a-66331c85c858',
                'name' => 'Xiaomi Fast Charge Power Bank 20000mAh (22.5W)',
                'description' => 'Triple port output (USB-A & Type-C), two-way fast charging, supports low-current charging for fitness bands & earbuds.',
                'category' => 'Electronics',
                'price' => 19500.00,
                'quantity' => 30,
                'quality_tier' => 'brand_new',
                'images' => [
                    'https://images.unsplash.com/photo-1609592424368-e4b2d18cbfe1?auto=format&fit=crop&w=800&q=80',
                ],
                'rating_avg' => 4.85,
                'total_reviews' => 64,
            ],

            // ── HEALTH & BEAUTY (Douala Glam) ──
            [
                'id' => '55443322-6677-8899-0011-ddeeff001122',
                'store_id' => '7b39a820-410d-4892-8021-998811223344',
                'name' => 'Glow Radiance Niacinamide 10% & Zinc Serum (30ml)',
                'description' => 'Brightening & pore-refining facial serum. Reduces blemishes, smooths skin texture, and enhances natural glow. Tested in French laboratories.',
                'category' => 'Health & Beauty',
                'price' => 18500.00,
                'quantity' => 25,
                'quality_tier' => 'brand_new',
                'images' => [
                    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1608248597262-838d89066dfd?auto=format&fit=crop&w=800&q=80',
                ],
                'rating_avg' => 4.96,
                'total_reviews' => 126,
            ],
            [
                'id' => '66554433-7788-9900-1122-eeff00112233',
                'store_id' => '7b39a820-410d-4892-8021-998811223344',
                'name' => 'Hydra Moisturizer 24H Intense Hyaluronic Cream (50ml)',
                'description' => 'Multi-depth hydration cream enriched with pure botanical shea butter and hyaluronic acid. Non-greasy barrier protection.',
                'category' => 'Health & Beauty',
                'price' => 14500.00,
                'quantity' => 35,
                'quality_tier' => 'brand_new',
                'images' => [
                    'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
                ],
                'rating_avg' => 4.90,
                'total_reviews' => 98,
            ],
            [
                'id' => '77665544-8899-0011-2233-ff0011223344',
                'store_id' => '7b39a820-410d-4892-8021-998811223344',
                'name' => 'Velvet Matte Long-Wear Lipstick (Rouge Passion)',
                'description' => 'High-pigment, weightless matte formula that stays flawless for up to 16 hours without drying lips. Infused with vitamin E.',
                'category' => 'Health & Beauty',
                'price' => 8500.00,
                'quantity' => 40,
                'quality_tier' => 'brand_new',
                'images' => [
                    'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80',
                ],
                'rating_avg' => 4.88,
                'total_reviews' => 74,
            ],
            [
                'id' => '88776655-9900-1122-3344-001122334455',
                'store_id' => '7b39a820-410d-4892-8021-998811223344',
                'name' => 'Pure Argan & Keratin Hair Repair Oil (100ml)',
                'description' => 'Intensive restorative elixir for dry or treated hair. Eliminates frizz, adds brilliant mirror shine, and shields against heat.',
                'category' => 'Health & Beauty',
                'price' => 16000.00,
                'quantity' => 20,
                'quality_tier' => 'brand_new',
                'images' => [
                    'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80',
                ],
                'rating_avg' => 4.92,
                'total_reviews' => 53,
            ],
            [
                'id' => '99887766-0011-2233-4455-112233445566',
                'store_id' => '7b39a820-410d-4892-8021-998811223344',
                'name' => 'Mineral Invisible Shield Sunscreen SPF 50+ (80ml)',
                'description' => 'Broad-spectrum UVA/UVB defense leaving zero white cast on melanin-rich skin. Water and sweat resistant formula.',
                'category' => 'Health & Beauty',
                'price' => 15500.00,
                'quantity' => 28,
                'quality_tier' => 'brand_new',
                'images' => [
                    'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80',
                ],
                'rating_avg' => 4.94,
                'total_reviews' => 67,
            ],

            // ── FASHION (K-Town Fashion) ──
            [
                'id' => 'aa998877-1122-3344-5566-223344556677',
                'store_id' => '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
                'name' => 'Handmade Bamenda Toghu Heritage Cultural Robe',
                'description' => 'Masterfully hand-embroidered royal velvet Toghu regalia. Perfect for traditional ceremonies, galas, and cultural milestones.',
                'category' => 'Fashion',
                'price' => 75000.00,
                'quantity' => 5,
                'quality_tier' => 'brand_new',
                'images' => [
                    'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
                ],
                'rating_avg' => 5.0,
                'total_reviews' => 22,
            ],
            [
                'id' => 'bb009988-2233-4455-6677-334455667788',
                'store_id' => '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
                'name' => 'Men\'s Italian Leather Penny Loafers (Dark Brown)',
                'description' => 'Genuine full-grain calfskin leather, hand-stitched welt, cushioned ergonomic memory-foam insole.',
                'category' => 'Fashion',
                'price' => 38000.00,
                'quantity' => 12,
                'quality_tier' => 'brand_new',
                'images' => [
                    'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80',
                ],
                'rating_avg' => 4.87,
                'total_reviews' => 41,
            ],
            [
                'id' => 'cc110099-3344-5566-7788-445566778899',
                'store_id' => '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
                'name' => 'Casual Lightweight Denim Trucker Jacket',
                'description' => '100% premium washed cotton denim. Classic button flap chest pockets, adjustable waist tabs, durable brass hardware.',
                'category' => 'Fashion',
                'price' => 24500.00,
                'quantity' => 18,
                'quality_tier' => 'brand_new',
                'images' => [
                    'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80',
                ],
                'rating_avg' => 4.82,
                'total_reviews' => 35,
            ],
            [
                'id' => 'dd221100-4455-6677-8899-556677889900',
                'store_id' => '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
                'name' => 'Breathable City Air Cushion Running Sneakers',
                'description' => 'Engineered knit upper with responsive impact air-pocket sole. Ideal for daily athletic jogging and comfortable walking in Douala.',
                'category' => 'Fashion',
                'price' => 29000.00,
                'quantity' => 22,
                'quality_tier' => 'brand_new',
                'images' => [
                    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
                ],
                'rating_avg' => 4.91,
                'total_reviews' => 58,
            ],

            // ── FOOD & GROCERIES (Marché Central) ──
            [
                'id' => 'ee332211-5566-7788-9900-667788990011',
                'store_id' => '5d6e7f8a-9b0c-1d2e-3f4a-5b6c7d8e9f0a',
                'name' => 'Authentic Penja White Pepper IGP (250g Jar)',
                'description' => 'World-famous volcanic soil Penja white peppercorns. Protected Geographical Indication (PGI). Intense gourmet aroma.',
                'category' => 'Food & Groceries',
                'price' => 9500.00,
                'quantity' => 45,
                'quality_tier' => 'brand_new',
                'images' => [
                    'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=800&q=80',
                ],
                'rating_avg' => 4.98,
                'total_reviews' => 112,
            ],
            [
                'id' => 'ff443322-6677-8899-0011-778899001122',
                'store_id' => '5d6e7f8a-9b0c-1d2e-3f4a-5b6c7d8e9f0a',
                'name' => 'Foumbot Highlands Arabica Coffee Beans (500g)',
                'description' => 'Single-origin roasted coffee beans harvested from the high plateaus of West Cameroon. Rich chocolate & caramel notes.',
                'category' => 'Food & Groceries',
                'price' => 7500.00,
                'quantity' => 50,
                'quality_tier' => 'brand_new',
                'images' => [
                    'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80',
                ],
                'rating_avg' => 4.93,
                'total_reviews' => 84,
            ],
            [
                'id' => '00554433-7788-9900-1122-889900112233',
                'store_id' => '5d6e7f8a-9b0c-1d2e-3f4a-5b6c7d8e9f0a',
                'name' => 'Pure Adamawa Natural Forest Honey (1 Litre)',
                'description' => '100% raw, unheated, unpasteurized natural wild forest honey from Ngaoundéré. Rich in antioxidants and natural enzymes.',
                'category' => 'Food & Groceries',
                'price' => 6000.00,
                'quantity' => 60,
                'quality_tier' => 'brand_new',
                'images' => [
                    'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
                ],
                'rating_avg' => 4.97,
                'total_reviews' => 140,
            ],

            // ── AUTOMOTIVE & HARDWARE (Bassa Auto Spares) ──
            [
                'id' => '11665544-8899-0011-2233-990011223344',
                'store_id' => '8e9f0a1b-2c3d-4e5f-6a7b-8c9d0e1f2a3b',
                'name' => 'Digital 12V High-Pressure Car Tire Inflator Pump',
                'description' => 'Compact 150 PSI air compressor with auto-shutoff, digital LCD pressure gauge, and emergency bright LED flashlight.',
                'category' => 'Automotive',
                'price' => 26000.00,
                'quantity' => 20,
                'quality_tier' => 'brand_new',
                'images' => [
                    'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
                ],
                'rating_avg' => 4.84,
                'total_reviews' => 39,
            ],
            [
                'id' => '22776655-9900-1122-3344-001122334455',
                'store_id' => '8e9f0a1b-2c3d-4e5f-6a7b-8c9d0e1f2a3b',
                'name' => 'OBD2 Bluetooth Diagnostic Scanner Tool (Universal)',
                'description' => 'Read & clear Check Engine fault codes, real-time sensor telemetry directly to Android/iOS smartphone app via Bluetooth 5.0.',
                'category' => 'Automotive',
                'price' => 17500.00,
                'quantity' => 25,
                'quality_tier' => 'brand_new',
                'images' => [
                    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
                ],
                'rating_avg' => 4.88,
                'total_reviews' => 45,
            ],
        ];

        foreach ($productsData as $p) {
            DB::table('products')->updateOrInsert(
                ['id' => $p['id']],
                [
                    'store_id' => $p['store_id'],
                    'name' => $p['name'],
                    'description' => $p['description'],
                    'category' => $p['category'],
                    'price' => $p['price'],
                    'currency' => 'XAF',
                    'quantity' => $p['quantity'],
                    'quality_tier' => $p['quality_tier'],
                    'images' => json_encode($p['images']),
                    'is_active' => true,
                    'rating_avg' => $p['rating_avg'],
                    'total_reviews' => $p['total_reviews'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        // ─────────────────────────────────────────────────────────────────────
        // 4. SEED SAMPLE REVIEWS
        // ─────────────────────────────────────────────────────────────────────

        $reviewsData = [
            [
                'id' => (string) Str::uuid(),
                'user_id' => $buyerId,
                'target_type' => 'product',
                'target_id' => '030d5e57-533a-421f-bdff-688e1eac866e',
                'rating' => 5,
                'comment' => 'Fast delivery to Bonanjo! Phone is 100% factory original and escrow gave me peace of mind.',
                'created_at' => now()->subDays(3),
            ],
            [
                'id' => (string) Str::uuid(),
                'user_id' => $buyerId,
                'target_type' => 'product',
                'target_id' => '55443322-6677-8899-0011-ddeeff001122',
                'rating' => 5,
                'comment' => 'The Niacinamide serum worked wonders on my skin texture after just one week! Highly recommend Douala Glam.',
                'created_at' => now()->subDays(5),
            ],
            [
                'id' => (string) Str::uuid(),
                'user_id' => $buyerId,
                'target_type' => 'product',
                'target_id' => 'ee332211-5566-7788-9900-667788990011',
                'rating' => 5,
                'comment' => 'Pure Penja pepper quality is unmatched. Delivered fresh and tightly sealed.',
                'created_at' => now()->subDays(8),
            ],
        ];

        foreach ($reviewsData as $r) {
            DB::table('reviews')->updateOrInsert(
                ['id' => $r['id']],
                array_merge($r, ['updated_at' => now()])
            );
        }

        // ─────────────────────────────────────────────────────────────────────
        // 5. SEED INITIAL SAMPLE ORDERS FOR BUYER
        // ─────────────────────────────────────────────────────────────────────

        $ordersData = [
            [
                'id' => '9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d',
                'order_code' => 'WNB-2026-8812',
                'customer_id' => $buyerId,
                'store_id' => 'c6ed6a51-aa38-4d68-b27a-66331c85c858',
                'status' => 'paid_escrow',
                'subtotal' => 188000.00,
                'delivery_fee' => 1500.00,
                'total' => 189500.00,
                'currency' => 'XAF',
                'payment_method' => 'mtn_momo',
                'payment_status' => 'escrow_locked',
                'pickup_pin' => '4821',
                'notes' => 'Deliver to Bonanjo office reception.',
                'delivery_address' => json_encode([
                    'label' => 'Office',
                    'address_text' => 'Boulevard de la Liberté, Bonanjo, Douala',
                    'city' => 'Douala',
                    'latitude' => 4.0460,
                    'longitude' => 9.6920,
                ]),
                'created_at' => now()->subHours(2),
            ],
            [
                'id' => '8b7c6d5e-4f3a-2b1c-0d9e-8f7a6b5c4d3e',
                'order_code' => 'WNB-2026-6420',
                'customer_id' => $buyerId,
                'store_id' => '7b39a820-410d-4892-8021-998811223344',
                'status' => 'en_route',
                'subtotal' => 33000.00,
                'delivery_fee' => 1200.00,
                'total' => 34200.00,
                'currency' => 'XAF',
                'payment_method' => 'orange_money',
                'payment_status' => 'escrow_locked',
                'pickup_pin' => '9105',
                'notes' => 'Rider is on bike en route to Bonanjo.',
                'delivery_address' => json_encode([
                    'label' => 'Home',
                    'address_text' => 'Rue Deido, Akwa, Douala',
                    'city' => 'Douala',
                    'latitude' => 4.0530,
                    'longitude' => 9.7120,
                ]),
                'created_at' => now()->subHours(5),
            ],
            [
                'id' => '7c6d5e4f-3a2b-1c0d-9e8f-7a6b5c4d3e2f',
                'order_code' => 'WNB-2026-3199',
                'customer_id' => $buyerId,
                'store_id' => '5d6e7f8a-9b0c-1d2e-3f4a-5b6c7d8e9f0a',
                'status' => 'completed',
                'subtotal' => 15500.00,
                'delivery_fee' => 1000.00,
                'total' => 16500.00,
                'currency' => 'XAF',
                'payment_method' => 'wallet',
                'payment_status' => 'released',
                'pickup_pin' => '2309',
                'notes' => 'Order completed and delivery signed.',
                'delivery_address' => json_encode([
                    'label' => 'Home',
                    'address_text' => 'Boulevard de la Liberté, Bonanjo, Douala',
                    'city' => 'Douala',
                    'latitude' => 4.0460,
                    'longitude' => 9.6920,
                ]),
                'created_at' => now()->subDays(2),
            ],
        ];

        foreach ($ordersData as $o) {
            DB::table('orders')->updateOrInsert(
                ['id' => $o['id']],
                array_merge($o, ['updated_at' => now()])
            );
        }

        // Seed order items
        DB::table('order_items')->updateOrInsert(
            ['order_id' => '9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d'],
            [
                'id' => (string) Str::uuid(),
                'order_id' => '9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d',
                'product_id' => '030d5e57-533a-421f-bdff-688e1eac866e',
                'name' => 'Samsung Galaxy A54 5G (128GB, Awesome Lime)',
                'price' => 188000.00,
                'quantity' => 1,
                'image_url' => 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        DB::table('order_items')->updateOrInsert(
            ['order_id' => '8b7c6d5e-4f3a-2b1c-0d9e-8f7a6b5c4d3e', 'product_id' => '55443322-6677-8899-0011-ddeeff001122'],
            [
                'id' => (string) Str::uuid(),
                'order_id' => '8b7c6d5e-4f3a-2b1c-0d9e-8f7a6b5c4d3e',
                'product_id' => '55443322-6677-8899-0011-ddeeff001122',
                'name' => 'Glow Radiance Niacinamide 10% & Zinc Serum (30ml)',
                'price' => 18500.00,
                'quantity' => 1,
                'image_url' => 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        DB::table('order_items')->updateOrInsert(
            ['order_id' => '8b7c6d5e-4f3a-2b1c-0d9e-8f7a6b5c4d3e', 'product_id' => '66554433-7788-9900-1122-eeff00112233'],
            [
                'id' => (string) Str::uuid(),
                'order_id' => '8b7c6d5e-4f3a-2b1c-0d9e-8f7a6b5c4d3e',
                'product_id' => '66554433-7788-9900-1122-eeff00112233',
                'name' => 'Hydra Moisturizer 24H Intense Hyaluronic Cream (50ml)',
                'price' => 14500.00,
                'quantity' => 1,
                'image_url' => 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        DB::table('order_items')->updateOrInsert(
            ['order_id' => '7c6d5e4f-3a2b-1c0d-9e8f-7a6b5c4d3e2f'],
            [
                'id' => (string) Str::uuid(),
                'order_id' => '7c6d5e4f-3a2b-1c0d-9e8f-7a6b5c4d3e2f',
                'product_id' => 'ee332211-5566-7788-9900-667788990011',
                'name' => 'Authentic Penja White Pepper IGP (250g Jar)',
                'price' => 9500.00,
                'quantity' => 1,
                'image_url' => 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=800&q=80',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        // ─────────────────────────────────────────────────────────────────────
        // 5b. SEED SAMPLE DISPUTES & REFUNDS FOR BUYER
        // ─────────────────────────────────────────────────────────────────────
        DB::table('disputes')->updateOrInsert(
            ['id' => 'd1590001-3a2b-4c5d-8e9f-0123456789ab'],
            [
                'id' => 'd1590001-3a2b-4c5d-8e9f-0123456789ab',
                'order_id' => '9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d',
                'user_id' => $buyerId,
                'reason' => 'Screen arrived cracked in transit',
                'description' => 'Buyer unboxed smartphone package in presence of transporter and discovered spiderweb hairline crack across lower OLED screen panel.',
                'evidence_photos' => json_encode(['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80']),
                'status' => 'pending_review',
                'refund_amount' => 189500.00,
                'created_at' => now()->subDays(1),
                'updated_at' => now()->subDays(1),
            ]
        );

        DB::table('disputes')->updateOrInsert(
            ['id' => 'd1590002-4b3c-5d6e-9f0a-123456789abc'],
            [
                'id' => 'd1590002-4b3c-5d6e-9f0a-123456789abc',
                'order_id' => '8b7c6d5e-4f3a-2b1c-0d9e-8f7a6b5c4d3e',
                'user_id' => $buyerId,
                'reason' => 'Wrong product variant dispatched by merchant',
                'description' => 'Ordered 30ml facial serum bottle, received completely different product formula with missing factory security seal.',
                'evidence_photos' => json_encode(['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80']),
                'status' => 'refunded',
                'refund_amount' => 34200.00,
                'resolution' => 'Merchant acknowledged incorrect item dispatch. Full refund of 34,200 XAF credited back to Buyer Wallet.',
                'resolved_at' => now()->subHours(8),
                'created_at' => now()->subDays(3),
                'updated_at' => now()->subHours(8),
            ]
        );

        // ─────────────────────────────────────────────────────────────────────
        // 5. SEED WALLET TRANSACTIONS
        // ─────────────────────────────────────────────────────────────────────
        $sellerUser = DB::table('users')->where('phone', '+237699112233')->first();
        $sellerWallet = $sellerUser ? DB::table('wallets')->where('user_id', $sellerUser->id)->first() : null;
        $transporterWallet = DB::table('wallets')->where('user_id', $transporterUserId)->first();

        // Seed transactions for all buyer wallets (e.g. Jean Dupont phone +237670123456 and mobile test user)
        $buyerWallets = DB::table('wallets')
            ->join('users', 'wallets.user_id', '=', 'users.id')
            ->where('users.role', 'buyer')
            ->select('wallets.*')
            ->get();

        foreach ($buyerWallets as $index => $bWallet) {
            DB::table('wallets')->where('id', $bWallet->id)->update([
                'balance_available' => 47500.00,
                'balance_escrow_locked' => 236000.00,
            ]);

            DB::table('wallet_transactions')->where('wallet_id', $bWallet->id)->delete();

            $prefix = sprintf('ba%06x', $index + 1);
            $refSuffix = strtoupper(substr($bWallet->id, 0, 4));
            $buyerTxs = [
                [
                    'id' => "{$prefix}-0001-4000-8000-000000000001",
                    'wallet_id' => $bWallet->id,
                    'type' => 'credit',
                    'amount' => 100000.00,
                    'currency' => 'XAF',
                    'provider' => 'mtn',
                    'status' => 'completed',
                    'reference' => "WNB-MOMO-88129-{$refSuffix}",
                    'description' => 'Wallet Top-Up via MTN Mobile Money',
                    'created_at' => now()->subDays(3),
                ],
                [
                    'id' => "{$prefix}-0002-4000-8000-000000000002",
                    'wallet_id' => $bWallet->id,
                    'type' => 'credit',
                    'amount' => 50000.00,
                    'currency' => 'XAF',
                    'provider' => 'orange',
                    'status' => 'completed',
                    'reference' => "WNB-OM-99214-{$refSuffix}",
                    'description' => 'Top-Up via Orange Money Deposit',
                    'created_at' => now()->subDays(2),
                ],
                [
                    'id' => "{$prefix}-0003-4000-8000-000000000003",
                    'wallet_id' => $bWallet->id,
                    'type' => 'debit',
                    'amount' => -188000.00,
                    'currency' => 'XAF',
                    'provider' => 'wallet_escrow',
                    'status' => 'completed',
                    'reference' => "WNB-ESC-8812-{$refSuffix}",
                    'description' => 'Escrow Payment — Order #WNB-2026-8812',
                    'created_at' => now()->subHours(2),
                ],
                [
                    'id' => "{$prefix}-0004-4000-8000-000000000004",
                    'wallet_id' => $bWallet->id,
                    'type' => 'debit',
                    'amount' => -34200.00,
                    'currency' => 'XAF',
                    'provider' => 'orange',
                    'status' => 'completed',
                    'reference' => "WNB-ESC-6420-{$refSuffix}",
                    'description' => 'Escrow Payment — Order #WNB-2026-6420',
                    'created_at' => now()->subHours(5),
                ],
                [
                    'id' => "{$prefix}-0005-4000-8000-000000000005",
                    'wallet_id' => $bWallet->id,
                    'type' => 'debit',
                    'amount' => -16500.00,
                    'currency' => 'XAF',
                    'provider' => 'wallet_escrow',
                    'status' => 'completed',
                    'reference' => "WNB-ESC-3199-{$refSuffix}",
                    'description' => 'Delivered Order #WNB-2026-3199',
                    'created_at' => now()->subDays(2),
                ],
            ];

            foreach ($buyerTxs as $tx) {
                DB::table('wallet_transactions')->updateOrInsert(
                    ['id' => $tx['id']],
                    array_merge($tx, ['updated_at' => now()])
                );
            }
        }

        if ($sellerWallet) {
            DB::table('wallet_transactions')->where('wallet_id', $sellerWallet->id)->delete();
            $sellerTxs = [
                [
                    'id' => 'c1a2c3d4-0001-4000-8000-000000000001',
                    'wallet_id' => $sellerWallet->id,
                    'type' => 'escrow_release',
                    'amount' => 188000.00,
                    'currency' => 'XAF',
                    'provider' => 'wallet_escrow',
                    'status' => 'completed',
                    'reference' => 'WNB-REL-8812',
                    'description' => 'Escrow released for Order #WNB-2026-8812',
                    'created_at' => now()->subDays(1),
                ],
                [
                    'id' => 'c1a2c3d4-0002-4000-8000-000000000002',
                    'wallet_id' => $sellerWallet->id,
                    'type' => 'commission_deduction',
                    'amount' => -9400.00,
                    'currency' => 'XAF',
                    'provider' => 'wallet_escrow',
                    'status' => 'completed',
                    'reference' => 'WNB-COM-8812',
                    'description' => 'Platform 5% fulfillment fee for Order #WNB-2026-8812',
                    'created_at' => now()->subDays(1),
                ],
                [
                    'id' => 'c1a2c3d4-0003-4000-8000-000000000003',
                    'wallet_id' => $sellerWallet->id,
                    'type' => 'payout',
                    'amount' => -50000.00,
                    'currency' => 'XAF',
                    'provider' => 'mtn',
                    'status' => 'completed',
                    'reference' => 'WNB-PO-55120',
                    'description' => 'Payout to MTN MoMo (+237 699 112 233)',
                    'created_at' => now()->subHours(6),
                ],
            ];

            foreach ($sellerTxs as $tx) {
                DB::table('wallet_transactions')->updateOrInsert(
                    ['id' => $tx['id']],
                    array_merge($tx, ['updated_at' => now()])
                );
            }
        }

        if ($transporterWallet) {
            DB::table('wallet_transactions')->where('wallet_id', $transporterWallet->id)->delete();
            $transporterTxs = [
                [
                    'id' => 'd1a2c3d4-0001-4000-8000-000000000001',
                    'wallet_id' => $transporterWallet->id,
                    'type' => 'credit',
                    'amount' => 1500.00,
                    'currency' => 'XAF',
                    'provider' => 'wallet_escrow',
                    'status' => 'completed',
                    'reference' => 'TRIP-2026-9842',
                    'description' => 'Delivery Fee — Order #WNB-2026-9842',
                    'created_at' => now()->subHours(2),
                ],
                [
                    'id' => 'd1a2c3d4-0002-4000-8000-000000000002',
                    'wallet_id' => $transporterWallet->id,
                    'type' => 'credit',
                    'amount' => 2000.00,
                    'currency' => 'XAF',
                    'provider' => 'wallet_escrow',
                    'status' => 'completed',
                    'reference' => 'TRIP-2026-7731',
                    'description' => 'Delivery Fee — Order #WNB-2026-7731',
                    'created_at' => now()->subHours(4),
                ],
                [
                    'id' => 'd1a2c3d4-0003-4000-8000-000000000003',
                    'wallet_id' => $transporterWallet->id,
                    'type' => 'credit',
                    'amount' => 1500.00,
                    'currency' => 'XAF',
                    'provider' => 'wallet_escrow',
                    'status' => 'completed',
                    'reference' => 'TRIP-2026-3390',
                    'description' => 'Delivery Fee — Order #WNB-2026-3390',
                    'created_at' => now()->subDay(),
                ],
                [
                    'id' => 'd1a2c3d4-0004-4000-8000-000000000004',
                    'wallet_id' => $transporterWallet->id,
                    'type' => 'credit',
                    'amount' => 500.00,
                    'currency' => 'XAF',
                    'provider' => 'wallet_escrow',
                    'status' => 'completed',
                    'reference' => 'TIP-2026-004',
                    'description' => 'Customer Tip for Express Service',
                    'created_at' => now()->subDay(),
                ],
                [
                    'id' => 'd1a2c3d4-0005-4000-8000-000000000005',
                    'wallet_id' => $transporterWallet->id,
                    'type' => 'debit',
                    'amount' => -10000.00,
                    'currency' => 'XAF',
                    'provider' => 'mtn',
                    'status' => 'completed',
                    'reference' => 'CASHOUT-881',
                    'description' => 'Instant Cashout to MTN MoMo (*126#)',
                    'created_at' => now()->subDays(2),
                ],
            ];

            foreach ($transporterTxs as $tx) {
                DB::table('wallet_transactions')->updateOrInsert(
                    ['id' => $tx['id']],
                    array_merge($tx, ['updated_at' => now()])
                );
            }
        }
    }
}
