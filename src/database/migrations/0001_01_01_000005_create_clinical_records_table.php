<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clinical_records', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignUuid('specialty_id')->constrained('specialties')->restrictOnDelete();
            $table->foreignUuid('practitioner_id')->constrained('users')->restrictOnDelete();

            $table->text('reason')->nullable();             // Motivo de consulta
            $table->text('diagnosis')->nullable();
            $table->text('treatment')->nullable();
            $table->text('observations')->nullable();
            $table->json('custom_fields')->nullable();     // Campos específicos por especialidad

            $table->timestamps();

            $table->index('patient_id');
            $table->index('specialty_id');
            $table->index('practitioner_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clinical_records');
    }
};
