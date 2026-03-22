<?php

namespace App\Modules\Billing\Application\UseCases;

use App\Models\Invoice;
use App\Shared\Domain\InvoiceStatus;
use Illuminate\Support\Facades\DB;

class CreateInvoiceUseCase
{
    public function execute(array $data, string $issuerId): Invoice
    {
        return DB::transaction(function () use ($data, $issuerId) {
            $invoice = Invoice::create([
                'invoice_number' => $this->generateInvoiceNumber(),
                'patient_id'     => $data['patient_id'],
                'issued_by'      => $issuerId,
                'status'         => InvoiceStatus::DRAFT->value,
                'notes'            => $data['notes'] ?? null,
                'reference_clinic'  => $data['reference_clinic'] ?? null,
            ]);

            foreach ($data['lines'] as $line) {
                $invoice->lines()->create([
                    'service_id'     => $line['service_id'] ?? null,
                    'appointment_id' => $line['appointment_id'] ?? null,
                    'description'    => $line['description'],
                    'quantity'       => $line['quantity'],
                    'unit_price'     => $line['unit_price'],
                    'line_total'     => round($line['quantity'] * $line['unit_price'], 2),
                ]);
            }

            $invoice->load('lines');
            $invoice->recalculateTotals();
            $invoice->save();

            return $invoice;
        });
    }

    private function generateInvoiceNumber(): string
    {
        $year = now()->format('Y');
        $last = Invoice::where('invoice_number', 'like', "FAC-{$year}-%")
            ->orderByDesc('invoice_number')
            ->value('invoice_number');

        $sequence = 1;
        if ($last) {
            $parts = explode('-', $last);
            $sequence = ((int) end($parts)) + 1;
        }

        return sprintf('FAC-%s-%05d', $year, $sequence);
    }
}
