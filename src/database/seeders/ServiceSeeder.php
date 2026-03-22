<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        $specialties = DB::table('specialties')->pluck('id', 'slug');

        $services = [
            // Podología
            [
                'name'             => 'Quiropodia',
                'description'      => 'Tratamiento general de cuidado del pie',
                'specialty_slug'   => 'podologia',
                'price'            => 45.00,
                'duration_minutes' => 30,
            ],
            [
                'name'             => 'Estudio biomecánico',
                'description'      => 'Análisis de la marcha y postura del pie',
                'specialty_slug'   => 'podologia',
                'price'            => 80.00,
                'duration_minutes' => 60,
            ],
            // Diagnóstico por imagen
            [
                'name'             => 'Radiografía digital',
                'description'      => 'Radiografía convencional digitalizada',
                'specialty_slug'   => 'diagnostico-por-imagen',
                'price'            => 35.00,
                'duration_minutes' => 15,
            ],
            [
                'name'             => 'Ecografía musculoesquelética',
                'description'      => 'Ecografía de tejidos blandos y articulaciones',
                'specialty_slug'   => 'diagnostico-por-imagen',
                'price'            => 60.00,
                'duration_minutes' => 30,
            ],
            // Fisioterapia
            [
                'name'             => 'Rehabilitación funcional',
                'description'      => 'Sesión de rehabilitación personalizada',
                'specialty_slug'   => 'fisioterapia',
                'price'            => 50.00,
                'duration_minutes' => 45,
            ],
            // Logopedia
            [
                'name'             => 'Evaluación logopédica',
                'description'      => 'Evaluación inicial del habla y lenguaje',
                'specialty_slug'   => 'logopedia',
                'price'            => 55.00,
                'duration_minutes' => 45,
            ],
            // Odontología
            [
                'name'             => 'Limpieza dental',
                'description'      => 'Limpieza y profilaxis dental profesional',
                'specialty_slug'   => 'odontologia',
                'price'            => 65.00,
                'duration_minutes' => 40,
            ],
        ];

        foreach ($services as $service) {
            $specialtyId = $specialties[$service['specialty_slug']] ?? null;
            if (!$specialtyId) {
                continue;
            }

            DB::table('services')->updateOrInsert(
                ['name' => $service['name']],
                [
                    'id'               => Str::uuid(),
                    'name'             => $service['name'],
                    'description'      => $service['description'],
                    'specialty_id'     => $specialtyId,
                    'price'            => $service['price'],
                    'duration_minutes' => $service['duration_minutes'],
                    'is_active'        => true,
                    'created_at'       => now(),
                    'updated_at'       => now(),
                ]
            );
        }
    }
}
