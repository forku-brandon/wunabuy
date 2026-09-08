<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seller_kyc_submissions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('store_name', 255);
            $table->text('description');
            $table->string('category', 100);
            $table->text('address_text');
            $table->string('city', 100)->default('Douala');
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('cni_number', 100);
            $table->text('id_card_front_url');
            $table->text('id_card_back_url');
            $table->text('storefront_photo_url');
            $table->text('business_reg_url')->nullable();
            $table->string('status', 30)->default('under_review');
            $table->text('reviewer_notes')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seller_kyc_submissions');
    }
};