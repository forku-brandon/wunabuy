<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('addresses')) {
            Schema::create('addresses', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('user_id')->index();
                $table->string('label', 100)->default('Home');
                $table->text('address_text');
                $table->string('city', 100)->default('Douala');
                $table->string('quarter', 100)->nullable();
                $table->decimal('latitude', 10, 7)->nullable();
                $table->decimal('longitude', 10, 7)->nullable();
                $table->boolean('is_default')->default(false);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('reviews')) {
            Schema::create('reviews', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('user_id')->index();
                $table->string('target_type', 50); // product, store, transporter
                $table->string('target_id', 100)->index();
                $table->integer('rating')->default(5);
                $table->text('comment')->nullable();
                $table->json('images')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('audit_logs')) {
            Schema::create('audit_logs', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('action', 150);
                $table->string('staff_id', 100)->nullable()->index();
                $table->string('staff_name', 150);
                $table->string('staff_role', 100);
                $table->string('department', 100)->default('OPERATIONS');
                $table->string('ip_address', 50)->default('127.0.0.1');
                $table->string('target_resource', 150)->nullable();
                $table->string('status', 30)->default('SUCCESS');
                $table->json('details')->nullable();
                $table->timestamp('created_at')->useCurrent();
            });
        }

        if (!Schema::hasTable('staff_tasks')) {
            Schema::create('staff_tasks', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('assigned_to_id', 100)->index();
                $table->string('assigned_to_name', 150);
                $table->string('assigned_to_role', 100);
                $table->string('assigned_by_name', 150);
                $table->string('task_title', 255);
                $table->text('task_description');
                $table->string('recurrence', 50)->default('DAILY');
                $table->timestamp('due_date')->nullable();
                $table->string('status', 50)->default('ASSIGNED');
                $table->string('priority', 50)->default('MEDIUM');
                $table->timestamp('accepted_at')->nullable();
                $table->timestamp('completed_at')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('staff_tasks');
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('reviews');
        Schema::dropIfExists('addresses');
    }
};