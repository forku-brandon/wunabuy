<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stores', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('store_name', 255);
            $table->string('tagline', 255)->nullable();
            $table->text('description')->nullable();
            $table->string('category', 100);
            $table->text('address_text');
            $table->string('landmark', 255)->nullable();
            $table->string('city', 100)->default('Douala');
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('counter_hours', 255)->nullable();
            $table->string('phone', 50)->nullable();
            $table->string('email', 255)->nullable();
            $table->text('rider_instructions')->nullable();
            $table->text('logo_url')->nullable();
            $table->text('banner_url')->nullable();
            $table->decimal('rating_avg', 3, 2)->default(5.00);
            $table->integer('total_reviews')->default(0);
            $table->boolean('is_verified')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stores');
    }
};