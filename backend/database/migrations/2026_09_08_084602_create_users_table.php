<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('phone', 20)->unique();
            $table->string('email', 255)->unique()->nullable();
            $table->string('full_name', 255);
            $table->string('role', 50)->default('buyer');
            $table->string('status', 50)->default('active');
            $table->text('avatar_url')->nullable();
            $table->boolean('is_phone_verified')->default(true);
            $table->json('available_roles')->nullable();
            $table->string('password')->nullable();
            $table->string('otp', 10)->nullable();
            $table->timestamp('otp_expires_at')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};