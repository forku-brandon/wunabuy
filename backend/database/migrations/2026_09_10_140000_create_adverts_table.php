<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('adverts')) {
            Schema::create('adverts', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('target_audience', 50)->default('all'); // 'seller', 'buyer', 'transporter', 'all'
                $table->string('type', 50)->default('banner'); // 'tip', 'banner', 'special_offer', 'partner'
                $table->string('badge', 100)->nullable();
                $table->string('badge_color', 50)->nullable();
                $table->string('title', 255);
                $table->text('subtitle')->nullable();
                $table->string('cta_text', 100)->nullable();
                $table->string('action_screen', 100)->nullable();
                $table->string('action_url', 255)->nullable();
                $table->text('image_url')->nullable();
                $table->string('icon_name', 100)->nullable();
                $table->string('icon_color', 50)->nullable();
                $table->string('category', 100)->nullable();
                $table->integer('discount_percent')->nullable();
                $table->integer('sort_order')->default(0);
                $table->boolean('is_active')->default(true);
                $table->string('created_by', 100)->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('adverts');
    }
};

