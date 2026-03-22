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
            DB::statement("CREATE TYPE appointment_status AS ENUM (
                'SCHEDULED',
                'CONFIRMED',
                'IN_PROGRESS',
                'COMPLETED',
                'CANCELLED',
                'NO_SHOW'
            )");
        }

        Schema::create('appointments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('patient_id')->constrained('patients')->restrictOnDelete();
            $table->foreignUuid('practitioner_id')->constrained('users')->restrictOnDelete();
            $table->foreignUuid('service_id')->constrained('services')->restrictOnDelete();

            $table->timestamp('starts_at');
            $table->timestamp('ends_at');
            $table->string('status')->default('SCHEDULED');
            $table->text('notes')->nullable();

            $table->foreignUuid('created_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();

            $table->index('patient_id');
            $table->index('practitioner_id');
            $table->index('starts_at');
            $table->index('status');
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE appointments ADD CONSTRAINT appointments_status_check CHECK (status::appointment_status IS NOT NULL)');
            DB::statement('ALTER TABLE appointments ADD CONSTRAINT appointments_time_check CHECK (ends_at > starts_at)');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('DROP TYPE IF EXISTS appointment_status');
        }
    }
};
