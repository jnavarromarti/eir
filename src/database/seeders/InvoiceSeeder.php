<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class InvoiceSeeder extends Seeder
{
    public function run(): void
    {
        $patients = DB::table('patients')->pluck('id', 'first_name');
        $adminId  = DB::table('users')->where('role', 'ADMIN')->value('id');
        $lauraId  = DB::table('users')->where('name', 'Laura García')->value('id');
        $issuer   = $lauraId ?? $adminId;

        $quiropodia  = DB::table('services')->where('name', 'Quiropodia')->first();
        $biomecanico = DB::table('services')->where('name', 'Estudio biomecánico')->first();
        $radiografia = DB::table('services')->where('name', 'Radiografía digital')->first();
        $ecografia   = DB::table('services')->where('name', 'Ecografía musculoesquelética')->first();

        $now = now();
        $invoiceNum = 1;

        $invoices = [
            // ── Paid invoices (past) ──
            [
                'patient'   => 'María',
                'status'    => 'PAID',
                'issued_at' => '2026-01-12',
                'paid_at'   => '2026-01-12',
                'notes'     => 'Sesión de quiropodia + revisión fascitis plantar.',
                'lines'     => [
                    ['service' => $quiropodia, 'qty' => 1],
                ],
            ],
            [
                'patient'   => 'Juan',
                'status'    => 'PAID',
                'issued_at' => '2026-02-16',
                'paid_at'   => '2026-02-18',
                'notes'     => 'Estudio biomecánico completo.',
                'lines'     => [
                    ['service' => $biomecanico, 'qty' => 1],
                ],
            ],
            [
                'patient'   => 'Ana',
                'status'    => 'PAID',
                'issued_at' => '2026-01-22',
                'paid_at'   => '2026-01-22',
                'notes'     => null,
                'reference_clinic' => 'Clínica Viamed Valencia',
                'lines'     => [
                    ['service' => $radiografia, 'qty' => 2],
                    ['service' => $ecografia,   'qty' => 1],
                ],
            ],
            [
                'patient'   => 'Pedro',
                'status'    => 'PAID',
                'issued_at' => '2025-12-08',
                'paid_at'   => '2025-12-10',
                'notes'     => 'Ecografía Aquiles + consulta podológica.',
                'lines'     => [
                    ['service' => $ecografia,  'qty' => 1],
                    ['service' => $quiropodia, 'qty' => 1],
                ],
            ],

            // ── Issued (pending payment) ──
            [
                'patient'   => 'Carmen',
                'status'    => 'ISSUED',
                'issued_at' => '2026-03-10',
                'paid_at'   => null,
                'notes'     => 'Hiperqueratosis + radiografía antepié.',
                'reference_clinic' => 'Hospital Quirónsalud Barcelona',
                'lines'     => [
                    ['service' => $quiropodia,  'qty' => 1],
                    ['service' => $radiografia, 'qty' => 1],
                ],
            ],
            [
                'patient'   => 'María',
                'status'    => 'ISSUED',
                'issued_at' => '2026-03-17',
                'paid_at'   => null,
                'notes'     => 'Revisión fascitis plantar — seguimiento mensual.',
                'lines'     => [
                    ['service' => $quiropodia, 'qty' => 1],
                ],
            ],

            // ── Draft invoices ──
            [
                'patient'   => 'Pedro',
                'status'    => 'DRAFT',
                'issued_at' => null,
                'paid_at'   => null,
                'notes'     => 'Pendiente de completar: sesiones ondas de choque.',
                'lines'     => [
                    ['service' => $quiropodia,  'qty' => 3],
                    ['service' => $ecografia,   'qty' => 1],
                ],
            ],
            [
                'patient'   => 'Ana',
                'status'    => 'DRAFT',
                'issued_at' => null,
                'paid_at'   => null,
                'notes'     => null,
                'lines'     => [
                    ['service' => $biomecanico, 'qty' => 1],
                ],
            ],

            // ── Cancelled invoice ──
            [
                'patient'   => 'Juan',
                'status'    => 'CANCELLED',
                'issued_at' => '2026-02-01',
                'paid_at'   => null,
                'notes'     => 'Anulada por duplicado.',
                'lines'     => [
                    ['service' => $quiropodia, 'qty' => 1],
                ],
            ],
        ];

        foreach ($invoices as $inv) {
            $invoiceId = Str::uuid()->toString();
            $number = 'IMD-' . str_pad($invoiceNum++, 5, '0', STR_PAD_LEFT);

            // Calculate totals
            $subtotal = 0;
            foreach ($inv['lines'] as $line) {
                $subtotal += $line['service']->price * $line['qty'];
            }

            DB::table('invoices')->insert([
                'id'               => $invoiceId,
                'invoice_number'   => $number,
                'patient_id'       => $patients[$inv['patient']],
                'issued_by'        => $issuer,
                'status'           => $inv['status'],
                'subtotal'         => $subtotal,
                'total'            => $subtotal, // IVA exempt (medical services)
                'issued_at'        => $inv['issued_at'],
                'paid_at'          => $inv['paid_at'],
                'notes'            => $inv['notes'] ?? null,
                'reference_clinic' => $inv['reference_clinic'] ?? null,
                'created_at'       => $now,
                'updated_at'       => $now,
            ]);

            foreach ($inv['lines'] as $idx => $line) {
                DB::table('invoice_lines')->insert([
                    'id'          => Str::uuid()->toString(),
                    'invoice_id'  => $invoiceId,
                    'service_id'  => $line['service']->id,
                    'description' => $line['service']->name,
                    'quantity'    => $line['qty'],
                    'unit_price'  => $line['service']->price,
                    'line_total'  => $line['service']->price * $line['qty'],
                    'created_at'  => $now,
                    'updated_at'  => $now,
                ]);
            }
        }
    }
}
