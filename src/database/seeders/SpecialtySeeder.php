<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SpecialtySeeder extends Seeder
{
    public function run(): void
    {
        $specialties = [
            ['name' => 'Podología',              'slug' => 'podologia'],
            ['name' => 'Diagnóstico por imagen',  'slug' => 'diagnostico-por-imagen'],
            ['name' => 'Fisioterapia',            'slug' => 'fisioterapia'],
            ['name' => 'Logopedia',               'slug' => 'logopedia'],
            ['name' => 'Odontología',             'slug' => 'odontologia'],
        ];

        foreach ($specialties as $specialty) {
            DB::table('specialties')->updateOrInsert(
                ['slug' => $specialty['slug']],
                [
                    'id'          => Str::uuid(),
                    'name'        => $specialty['name'],
                    'slug'        => $specialty['slug'],
                    'is_active'   => true,
                    'created_at'  => now(),
                    'updated_at'  => now(),
                ]
            );
        }
    }
}
