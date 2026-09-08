<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transporters', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('vehicle_type', 50);
            $table->string('vehicle_plate', 50)->nullable();
            $table->string('license_number', 100)->nullable();
            $table->string('status', 50)->default('active');
            $table->boolean('is_online')->default(false);
            $table->decimal('current_lat', 10, 7)->nullable();
            $table->decimal('current_lng', 10, 7)->nullable();
            $table->decimal('rating_avg', 3, 2)->default(5.00);
            $table->integer('total_trips')->default(0);
            $table->decimal('total_earnings', 14, 2)->default(0.00);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transporters');
    }
};