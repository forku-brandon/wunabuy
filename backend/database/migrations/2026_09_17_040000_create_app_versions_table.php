<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('app_versions', function (Blueprint $table) {
            $table->id();
            $table->string('version_name');           // e.g. "1.1.0"
            $table->unsignedInteger('version_code');  // e.g. 1, 2
            $table->string('platform')->default('android');
            $table->boolean('is_blacklisted')->default(false);
            $table->boolean('force_update')->default(false);
            $table->text('deprecation_message')->nullable();
            $table->timestamp('blacklisted_at')->nullable();
            $table->unsignedBigInteger('request_count')->default(0);
            $table->timestamp('first_seen_at')->nullable();
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamps();

            $table->unique(['version_code', 'platform']);
            $table->index(['is_blacklisted', 'platform']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('app_versions');
    }
};
