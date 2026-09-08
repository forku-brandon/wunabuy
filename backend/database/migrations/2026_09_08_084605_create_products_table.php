<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('store_id')->constrained('stores')->cascadeOnDelete();
            $table->string('name', 255);
            $table->text('description');
            $table->string('category', 100);
            $table->decimal('price', 12, 2);
            $table->string('currency', 10)->default('XAF');
            $table->integer('quantity')->default(0);
            $table->string('quality_tier', 50)->default('new');
            $table->json('images')->nullable();
            $table->boolean('is_active')->default(true);
            $table->decimal('rating_avg', 3, 2)->default(5.00);
            $table->integer('total_reviews')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};