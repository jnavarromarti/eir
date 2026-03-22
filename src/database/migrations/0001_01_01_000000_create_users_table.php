<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement("CREATE TYPE user_role AS ENUM (
                'ADMIN',
                'ADMINISTRATIVE',
                'CHIROPODIST',
                'PHYSIOTHERAPIST',
                'SPEECH_THERAPIST',
                'DENTIST',
                'RADIOLOGY_TECHNICIAN'
            )");
        }

        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->timestamp('email_verified_at')->nullable();

            // Role
            $table->string('role'); // backed by user_role enum via DB::statement
            $table->boolean('is_active')->default(true);

            // 2FA
            $table->string('two_factor_secret')->nullable();
            $table->boolean('two_factor_enabled')->default(false);

            $table->rememberToken();
            $table->timestamps();

            $table->index('role');
            $table->index('is_active');
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role::user_role IS NOT NULL)');
        }

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignUuid('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('DROP TYPE IF EXISTS user_role');
        }
    }
};
