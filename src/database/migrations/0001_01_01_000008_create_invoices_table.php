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
            DB::statement("CREATE TYPE invoice_status AS ENUM (
                'DRAFT',
                'ISSUED',
                'PAID',
                'CANCELLED'
            )");
        }

        Schema::create('invoices', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('invoice_number')->unique();
            $table->foreignUuid('patient_id')->constrained('patients')->restrictOnDelete();
            $table->foreignUuid('issued_by')->constrained('users')->restrictOnDelete();

            $table->string('status')->default('DRAFT');
            $table->decimal('subtotal', 10, 2)->default(0);
            $table->decimal('tax_rate', 5, 2)->default(21.00);       // IVA
            $table->decimal('tax_amount', 10, 2)->default(0);
            $table->decimal('total', 10, 2)->default(0);

            $table->date('issued_at')->nullable();
            $table->date('paid_at')->nullable();
            $table->text('notes')->nullable();

            $table->timestamps();

            $table->index('patient_id');
            $table->index('status');
            $table->index('issued_at');
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE invoices ADD CONSTRAINT invoices_status_check CHECK (status::invoice_status IS NOT NULL)');
        }

        Schema::create('invoice_lines', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('invoice_id')->constrained('invoices')->cascadeOnDelete();
            $table->foreignUuid('service_id')->nullable()->constrained('services')->nullOnDelete();
            $table->foreignUuid('appointment_id')->nullable()->constrained('appointments')->nullOnDelete();

            $table->string('description');
            $table->integer('quantity')->default(1);
            $table->decimal('unit_price', 10, 2);
            $table->decimal('line_total', 10, 2);

            $table->timestamps();

            $table->index('invoice_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoice_lines');
        Schema::dropIfExists('invoices');
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('DROP TYPE IF EXISTS invoice_status');
        }
    }
};
