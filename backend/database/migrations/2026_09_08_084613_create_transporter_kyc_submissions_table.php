<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transporter_kyc_submissions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('vehicle_type', 50);
            $table->string('vehicle_plate', 50);
            $table->text('driver_license_url');
            $table->text('national_id_url');
            $table->text('vehicle_insurance_url')->nullable();
            $table->string('status', 30)->default('under_review');
            $table->text('reviewer_notes')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transporter_kyc_submissions');
    }
};