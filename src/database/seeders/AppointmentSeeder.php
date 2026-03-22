<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AppointmentSeeder extends Seeder
{
    public function run(): void
    {
        $patients     = DB::table('patients')->pluck('id', 'first_name');
        $carlosId     = DB::table('users')->where('name', 'Dr. Carlos Ruiz')->value('id');
        $martaId      = DB::table('users')->where('name', 'Marta López')->value('id');
        $adminId      = DB::table('users')->where('role', 'ADMIN')->value('id');
        $podologia    = DB::table('specialties')->where('name', 'Podología')->value('id');
        $imagen       = DB::table('specialties')->where('name', 'Diagnóstico por imagen')->value('id');

        $quiropodia   = DB::table('services')->where('name', 'Quiropodia')->value('id');
        $biomecanico  = DB::table('services')->where('name', 'Estudio biomecánico')->value('id');
        $radiografia  = DB::table('services')->where('name', 'Radiografía digital')->value('id');
        $ecografia    = DB::table('services')->where('name', 'Ecografía musculoesquelética')->value('id');

        $now = now();

        // Spread appointments from last Monday thru next Friday
        // Use 2026-03-16 (Mon) to 2026-03-27 (Fri) to ensure data around "today"
        $appointments = [
            // ── Monday March 16 ──
            ['patient' => 'María',  'practitioner' => $carlosId, 'service' => $quiropodia,  'date' => '2026-03-16', 'start' => '09:00', 'end' => '09:30', 'status' => 'COMPLETED'],
            ['patient' => 'Juan',   'practitioner' => $carlosId, 'service' => $biomecanico, 'date' => '2026-03-16', 'start' => '10:00', 'end' => '11:00', 'status' => 'COMPLETED'],
            ['patient' => 'Ana',    'practitioner' => $martaId,  'service' => $radiografia, 'date' => '2026-03-16', 'start' => '10:00', 'end' => '10:15', 'status' => 'COMPLETED'],
            // ↑ Ana & Juan overlap at 10:00 (different practitioners) — tests column layout

            // ── Tuesday March 17 ──
            ['patient' => 'Pedro',  'practitioner' => $martaId,  'service' => $ecografia,   'date' => '2026-03-17', 'start' => '09:00', 'end' => '09:30', 'status' => 'COMPLETED'],
            ['patient' => 'Carmen', 'practitioner' => $carlosId, 'service' => $quiropodia,  'date' => '2026-03-17', 'start' => '09:00', 'end' => '09:30', 'status' => 'COMPLETED'],
            // ↑ Pedro & Carmen overlap at 09:00
            ['patient' => 'María',  'practitioner' => $carlosId, 'service' => $quiropodia,  'date' => '2026-03-17', 'start' => '11:00', 'end' => '11:30', 'status' => 'COMPLETED'],

            // ── Wednesday March 18 ──
            ['patient' => 'Ana',    'practitioner' => $carlosId, 'service' => $biomecanico, 'date' => '2026-03-18', 'start' => '08:30', 'end' => '09:30', 'status' => 'COMPLETED'],
            ['patient' => 'Juan',   'practitioner' => $martaId,  'service' => $radiografia, 'date' => '2026-03-18', 'start' => '08:30', 'end' => '08:45', 'status' => 'COMPLETED'],
            ['patient' => 'Pedro',  'practitioner' => $carlosId, 'service' => $quiropodia,  'date' => '2026-03-18', 'start' => '12:00', 'end' => '12:30', 'status' => 'CANCELLED'],

            // ── Thursday March 19 ──
            ['patient' => 'Carmen', 'practitioner' => $martaId,  'service' => $ecografia,   'date' => '2026-03-19', 'start' => '10:00', 'end' => '10:30', 'status' => 'COMPLETED'],
            ['patient' => 'María',  'practitioner' => $carlosId, 'service' => $quiropodia,  'date' => '2026-03-19', 'start' => '10:00', 'end' => '10:30', 'status' => 'COMPLETED'],
            ['patient' => 'Juan',   'practitioner' => $carlosId, 'service' => $biomecanico, 'date' => '2026-03-19', 'start' => '15:00', 'end' => '16:00', 'status' => 'NO_SHOW'],

            // ── Friday March 20 ──
            ['patient' => 'Ana',    'practitioner' => $carlosId, 'service' => $quiropodia,  'date' => '2026-03-20', 'start' => '09:00', 'end' => '09:30', 'status' => 'COMPLETED'],
            ['patient' => 'Pedro',  'practitioner' => $martaId,  'service' => $radiografia, 'date' => '2026-03-20', 'start' => '09:00', 'end' => '09:15', 'status' => 'COMPLETED'],
            ['patient' => 'Carmen', 'practitioner' => $carlosId, 'service' => $quiropodia,  'date' => '2026-03-20', 'start' => '11:00', 'end' => '11:30', 'status' => 'COMPLETED'],
            ['patient' => 'María',  'practitioner' => $martaId,  'service' => $ecografia,   'date' => '2026-03-20', 'start' => '11:00', 'end' => '11:30', 'status' => 'COMPLETED'],
            ['patient' => 'Juan',   'practitioner' => $carlosId, 'service' => $quiropodia,  'date' => '2026-03-20', 'start' => '11:00', 'end' => '11:30', 'status' => 'COMPLETED'],
            // ↑ Triple overlap: Carmen, María, Juan all at 11:00 — 3 columns!

            // ── Monday March 23 (next week) ──
            ['patient' => 'María',  'practitioner' => $carlosId, 'service' => $quiropodia,  'date' => '2026-03-23', 'start' => '09:00', 'end' => '09:30', 'status' => 'CONFIRMED'],
            ['patient' => 'Pedro',  'practitioner' => $martaId,  'service' => $ecografia,   'date' => '2026-03-23', 'start' => '09:00', 'end' => '09:30', 'status' => 'SCHEDULED'],
            ['patient' => 'Ana',    'practitioner' => $carlosId, 'service' => $biomecanico, 'date' => '2026-03-23', 'start' => '10:30', 'end' => '11:30', 'status' => 'SCHEDULED'],
            ['patient' => 'Juan',   'practitioner' => $martaId,  'service' => $radiografia, 'date' => '2026-03-23', 'start' => '10:30', 'end' => '10:45', 'status' => 'SCHEDULED'],

            // ── Tuesday March 24 ──
            ['patient' => 'Carmen', 'practitioner' => $carlosId, 'service' => $quiropodia,  'date' => '2026-03-24', 'start' => '09:30', 'end' => '10:00', 'status' => 'SCHEDULED'],
            ['patient' => 'María',  'practitioner' => $carlosId, 'service' => $biomecanico, 'date' => '2026-03-24', 'start' => '11:00', 'end' => '12:00', 'status' => 'SCHEDULED'],
            ['patient' => 'Pedro',  'practitioner' => $martaId,  'service' => $ecografia,   'date' => '2026-03-24', 'start' => '11:00', 'end' => '11:30', 'status' => 'CONFIRMED'],

            // ── Wednesday March 25 ──
            ['patient' => 'Ana',    'practitioner' => $carlosId, 'service' => $quiropodia,  'date' => '2026-03-25', 'start' => '08:00', 'end' => '08:30', 'status' => 'SCHEDULED'],
            ['patient' => 'Juan',   'practitioner' => $carlosId, 'service' => $quiropodia,  'date' => '2026-03-25', 'start' => '09:00', 'end' => '09:30', 'status' => 'SCHEDULED'],
            ['patient' => 'Carmen', 'practitioner' => $martaId,  'service' => $radiografia, 'date' => '2026-03-25', 'start' => '09:00', 'end' => '09:15', 'status' => 'SCHEDULED'],
            ['patient' => 'Pedro',  'practitioner' => $carlosId, 'service' => $biomecanico, 'date' => '2026-03-25', 'start' => '14:00', 'end' => '15:00', 'status' => 'SCHEDULED'],
            ['patient' => 'María',  'practitioner' => $martaId,  'service' => $ecografia,   'date' => '2026-03-25', 'start' => '14:00', 'end' => '14:30', 'status' => 'SCHEDULED'],

            // ── Thursday March 26 ──
            ['patient' => 'Juan',   'practitioner' => $carlosId, 'service' => $quiropodia,  'date' => '2026-03-26', 'start' => '10:00', 'end' => '10:30', 'status' => 'SCHEDULED'],
            ['patient' => 'Ana',    'practitioner' => $martaId,  'service' => $ecografia,   'date' => '2026-03-26', 'start' => '10:00', 'end' => '10:30', 'status' => 'SCHEDULED'],
            ['patient' => 'Carmen', 'practitioner' => $carlosId, 'service' => $quiropodia,  'date' => '2026-03-26', 'start' => '10:00', 'end' => '10:30', 'status' => 'SCHEDULED'],
            // ↑ Triple overlap again

            ['patient' => 'Pedro',  'practitioner' => $carlosId, 'service' => $biomecanico, 'date' => '2026-03-26', 'start' => '16:00', 'end' => '17:00', 'status' => 'SCHEDULED'],

            // ── Friday March 27 ──
            ['patient' => 'María',  'practitioner' => $carlosId, 'service' => $quiropodia,  'date' => '2026-03-27', 'start' => '09:00', 'end' => '09:30', 'status' => 'SCHEDULED'],
            ['patient' => 'Carmen', 'practitioner' => $martaId,  'service' => $radiografia, 'date' => '2026-03-27', 'start' => '09:00', 'end' => '09:15', 'status' => 'SCHEDULED'],
            ['patient' => 'Juan',   'practitioner' => $carlosId, 'service' => $quiropodia,  'date' => '2026-03-27', 'start' => '12:00', 'end' => '12:30', 'status' => 'SCHEDULED'],
            ['patient' => 'Ana',    'practitioner' => $carlosId, 'service' => $biomecanico, 'date' => '2026-03-27', 'start' => '15:00', 'end' => '16:00', 'status' => 'SCHEDULED'],
        ];

        foreach ($appointments as $apt) {
            DB::table('appointments')->insert([
                'id'              => Str::uuid()->toString(),
                'patient_id'      => $patients[$apt['patient']],
                'practitioner_id' => $apt['practitioner'],
                'service_id'      => $apt['service'],
                'starts_at'       => $apt['date'] . ' ' . $apt['start'] . ':00',
                'ends_at'         => $apt['date'] . ' ' . $apt['end'] . ':00',
                'status'          => $apt['status'],
                'notes'           => null,
                'created_by'      => $adminId,
                'created_at'      => $now,
                'updated_at'      => $now,
            ]);
        }
    }
}
