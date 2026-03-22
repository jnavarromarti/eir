<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('services', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');                              // "Consulta podológica", "Radiografía panorámica"
            $table->text('description')->nullable();
            $table->foreignUuid('specialty_id')->constrained('specialties')->restrictOnDelete();
            $table->decimal('price', 10, 2);
            $table->integer('duration_minutes')->default(30);    // Duración estimada
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('specialty_id');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
