<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed Buyer User
        $buyerId = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';
        DB::table('users')->insertOrIgnore([
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

        // Buyer Wallet
        DB::table('wallets')->insertOrIgnore([
            'id' => (string) Str::uuid(),
            'user_id' => $buyerId,
            'balance_available' => 47500.00,
            'balance_escrow_locked' => 236000.00,
            'currency' => 'XAF',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 2. Seed Seller User & Store
        $sellerId = (string) Str::uuid();
        DB::table('users')->insertOrIgnore([
            'id' => $sellerId,
            'phone' => '+237699112233',
            'email' => 'store.akwa@wunabuy.com',
            'full_name' => 'Amadou Bello (Akwa Super Store)',
            'role' => 'seller',
            'status' => 'active',
            'avatar_url' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
            'is_phone_verified' => true,
            'available_roles' => json_encode(['buyer', 'seller']),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $storeId = (string) Str::uuid();
        DB::table('stores')->insertOrIgnore([
            'id' => $storeId,
            'user_id' => $sellerId,
            'store_name' => 'Akwa Super Store',
            'tagline' => 'Best Electronics & Gadgets in Douala',
            'description' => 'Authentic smartphones, accessories, and certified electronics with warranty.',
            'category' => 'Electronics',
            'address_text' => 'Akwa Main Blvd, Opposite Pharmacie du Centre, Douala',
            'landmark' => 'Near Rond-point Deido / Pharmacie du Centre',
            'city' => 'Douala',
            'latitude' => 4.0510564,
            'longitude' => 9.7678687,
            'counter_hours' => 'Mon - Sat: 08:00 AM - 07:30 PM',
            'phone' => '+237670123456',
            'email' => 'akwa.store@wunabuy.com',
            'rider_instructions' => 'Counter pickup at Gate B. Ask for Manager Jean.',
            'logo_url' => 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=400&q=80',
            'banner_url' => 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
            'rating_avg' => 4.90,
            'total_reviews' => 142,
            'is_verified' => true,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Seed Products for the store
        DB::table('products')->insertOrIgnore([
            [
                'id' => (string) Str::uuid(),
                'store_id' => $storeId,
                'name' => 'Samsung Galaxy A54 5G (128GB, Awesome Lime)',
                'description' => 'Official Samsung Cameroon warranty, Super AMOLED 120Hz display, 50MP OIS camera.',
                'category' => 'Smartphones',
                'price' => 188000.00,
                'currency' => 'XAF',
                'quantity' => 15,
                'quality_tier' => 'brand_new',
                'images' => json_encode(['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80']),
                'is_active' => true,
                'rating_avg' => 4.95,
                'total_reviews' => 38,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => (string) Str::uuid(),
                'store_id' => $storeId,
                'name' => 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
                'description' => 'Industry-leading noise cancellation, 30-hour battery life, crystal clear hands-free calling.',
                'category' => 'Audio',
                'price' => 165000.00,
                'currency' => 'XAF',
                'quantity' => 8,
                'quality_tier' => 'brand_new',
                'images' => json_encode(['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80']),
                'is_active' => true,
                'rating_avg' => 4.88,
                'total_reviews' => 19,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // 3. Seed Transporter
        $transporterUserId = (string) Str::uuid();
        DB::table('users')->insertOrIgnore([
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

        DB::table('transporters')->insertOrIgnore([
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

        // 4. Seed Staff SuperAdmin
        $adminId = (string) Str::uuid();
        DB::table('users')->insertOrIgnore([
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
}