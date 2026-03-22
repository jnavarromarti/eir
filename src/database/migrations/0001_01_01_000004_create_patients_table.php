<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patients', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // Personal data
            $table->string('first_name');
            $table->string('last_name');
            $table->string('dni', 20)->unique()->nullable();
            $table->date('birth_date')->nullable();
            $table->string('gender', 20)->nullable();          // male, female, other
            $table->string('phone', 20)->nullable();
            $table->string('phone_secondary', 20)->nullable();
            $table->string('email')->nullable();

            // Address
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('postal_code', 10)->nullable();
            $table->string('province')->nullable();

            // Medical
            $table->text('allergies')->nullable();
            $table->text('medical_notes')->nullable();

            // Administrative
            $table->boolean('is_active')->default(true);
            $table->foreignUuid('created_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();

            $table->index(['last_name', 'first_name']);
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};
