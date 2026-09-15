<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the high-performance database indexing optimizations for 1 Million Users scale.
     */
    public function up(): void
    {
        // 1. Enable PostgreSQL pg_trgm extension for blazing fast substring/ILIKE search if supported
        try {
            DB::statement('CREATE EXTENSION IF NOT EXISTS pg_trgm;');
        } catch (\Throwable $e) {
            // Log notice or continue if user lacks superuser permissions
        }

        // 2. Orders Table (High Volume Transaction Processing)
        Schema::table('orders', function (Blueprint $table) {
            $table->index(['customer_id', 'status', 'created_at'], 'idx_orders_customer_status_created');
            $table->index(['store_id', 'status', 'created_at'], 'idx_orders_store_status_created');
            $table->index(['transporter_id', 'status', 'created_at'], 'idx_orders_transporter_status_created');
            $table->index(['status', 'created_at'], 'idx_orders_status_created');
            $table->index('created_at', 'idx_orders_created_at');
        });

        // 3. PostgreSQL Partial Index for Transporter Live Dispatch Queue
        try {
            DB::statement("
                CREATE INDEX IF NOT EXISTS idx_orders_dispatch_queue 
                ON orders (created_at DESC) 
                WHERE transporter_id IS NULL AND status IN ('ready_for_pickup', 'pending', 'preparing');
            ");
        } catch (\Throwable $e) {
            // Fallback composite index
            Schema::table('orders', function (Blueprint $table) {
                $table->index(['status', 'transporter_id', 'created_at'], 'idx_orders_dispatch_fallback');
            });
        }

        // 4. Order Items Table
        Schema::table('order_items', function (Blueprint $table) {
            $table->index('order_id', 'idx_order_items_order_id');
            $table->index('product_id', 'idx_order_items_product_id');
        });

        // 5. Wallet Transactions Ledger
        Schema::table('wallet_transactions', function (Blueprint $table) {
            $table->index(['wallet_id', 'created_at'], 'idx_wallet_tx_wallet_created');
            $table->index(['wallet_id', 'type'], 'idx_wallet_tx_wallet_type');
            $table->index(['status', 'type', 'created_at'], 'idx_wallet_tx_status_type_created');
        });

        // 6. Products Catalog
        Schema::table('products', function (Blueprint $table) {
            $table->index(['is_active', 'category', 'created_at'], 'idx_products_cat_active_created');
            $table->index(['store_id', 'is_active'], 'idx_products_store_active');
            $table->index(['is_active', 'price'], 'idx_products_active_price');
            $table->index(['is_active', 'rating_avg'], 'idx_products_active_rating');
        });

        // PostgreSQL GIN Trigram index for product search
        try {
            DB::statement("
                CREATE INDEX IF NOT EXISTS idx_products_name_trgm 
                ON products USING gin (name gin_trgm_ops);
            ");
        } catch (\Throwable $e) {
            // If pg_trgm extension is not installed in the PostgreSQL instance, fallback to standard B-Tree index
            Schema::table('products', function (Blueprint $table) {
                $table->index('name', 'idx_products_name_btree');
            });
        }

        // 7. Stores Table
        Schema::table('stores', function (Blueprint $table) {
            $table->index('user_id', 'idx_stores_user_id');
            $table->index(['is_active', 'city', 'category'], 'idx_stores_active_city_cat');
            $table->index(['is_active', 'rating_avg'], 'idx_stores_active_rating');
        });

        // 8. Users Table
        Schema::table('users', function (Blueprint $table) {
            $table->index(['role', 'status'], 'idx_users_role_status');
            $table->index('created_at', 'idx_users_created_at');
        });

        // 9. KYC Submissions Tables
        Schema::table('seller_kyc_submissions', function (Blueprint $table) {
            $table->index('user_id', 'idx_seller_kyc_user_id');
            $table->index(['status', 'created_at'], 'idx_seller_kyc_status_created');
        });

        Schema::table('transporter_kyc_submissions', function (Blueprint $table) {
            $table->index('user_id', 'idx_transporter_kyc_user_id');
            $table->index(['status', 'created_at'], 'idx_transporter_kyc_status_created');
        });

        // 10. Disputes Table
        Schema::table('disputes', function (Blueprint $table) {
            $table->index('order_id', 'idx_disputes_order_id');
            $table->index('user_id', 'idx_disputes_user_id');
            $table->index(['status', 'created_at'], 'idx_disputes_status_created');
        });

        // 11. Notifications Table
        Schema::table('notifications', function (Blueprint $table) {
            $table->index(['user_id', 'is_read', 'created_at'], 'idx_notifs_user_read_created');
        });

        // 12. Adverts Table
        if (Schema::hasTable('adverts')) {
            Schema::table('adverts', function (Blueprint $table) {
                $table->index(['is_active', 'target_audience', 'sort_order'], 'idx_adverts_active_audience_sort');
            });
        }

        // 13. Transporters Table
        Schema::table('transporters', function (Blueprint $table) {
            $table->index(['is_online', 'status'], 'idx_transporters_online_status');
        });

        // 14. Audit Logs Table
        if (Schema::hasTable('audit_logs')) {
            Schema::table('audit_logs', function (Blueprint $table) {
                $table->index('created_at', 'idx_audit_logs_created_at');
            });
        }
    }

    /**
     * Revert the database indexing optimizations.
     */
    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS idx_orders_dispatch_queue;');
        DB::statement('DROP INDEX IF EXISTS idx_products_name_trgm;');

        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex('idx_orders_customer_status_created');
            $table->dropIndex('idx_orders_store_status_created');
            $table->dropIndex('idx_orders_transporter_status_created');
            $table->dropIndex('idx_orders_status_created');
            $table->dropIndex('idx_orders_created_at');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropIndex('idx_order_items_order_id');
            $table->dropIndex('idx_order_items_product_id');
        });

        Schema::table('wallet_transactions', function (Blueprint $table) {
            $table->dropIndex('idx_wallet_tx_wallet_created');
            $table->dropIndex('idx_wallet_tx_wallet_type');
            $table->dropIndex('idx_wallet_tx_status_type_created');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex('idx_products_cat_active_created');
            $table->dropIndex('idx_products_store_active');
            $table->dropIndex('idx_products_active_price');
            $table->dropIndex('idx_products_active_rating');
            if (Schema::hasIndex('products', 'idx_products_name_btree')) {
                $table->dropIndex('idx_products_name_btree');
            }
        });

        Schema::table('stores', function (Blueprint $table) {
            $table->dropIndex('idx_stores_user_id');
            $table->dropIndex('idx_stores_active_city_cat');
            $table->dropIndex('idx_stores_active_rating');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('idx_users_role_status');
            $table->dropIndex('idx_users_created_at');
        });

        Schema::table('seller_kyc_submissions', function (Blueprint $table) {
            $table->dropIndex('idx_seller_kyc_user_id');
            $table->dropIndex('idx_seller_kyc_status_created');
        });

        Schema::table('transporter_kyc_submissions', function (Blueprint $table) {
            $table->dropIndex('idx_transporter_kyc_user_id');
            $table->dropIndex('idx_transporter_kyc_status_created');
        });

        Schema::table('disputes', function (Blueprint $table) {
            $table->dropIndex('idx_disputes_order_id');
            $table->dropIndex('idx_disputes_user_id');
            $table->dropIndex('idx_disputes_status_created');
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex('idx_notifs_user_read_created');
        });

        if (Schema::hasTable('adverts')) {
            Schema::table('adverts', function (Blueprint $table) {
                $table->dropIndex('idx_adverts_active_audience_sort');
            });
        }

        Schema::table('transporters', function (Blueprint $table) {
            $table->dropIndex('idx_transporters_online_status');
        });

        if (Schema::hasTable('audit_logs')) {
            Schema::table('audit_logs', function (Blueprint $table) {
                $table->dropIndex('idx_audit_logs_created_at');
            });
        }
    }
};
