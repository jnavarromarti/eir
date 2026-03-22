<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PatientSeeder extends Seeder
{
    public function run(): void
    {
        $createdBy = DB::table('users')->where('role', 'ADMIN')->value('id');

        $patients = [
            [
                'first_name'   => 'María',
                'last_name'    => 'Fernández López',
                'dni'          => '12345678A',
                'birth_date'   => '1985-03-15',
                'gender'       => 'F',
                'phone'        => '612345678',
                'email'        => 'maria.fernandez@example.com',
                'address'      => 'Calle Mayor 10',
                'city'         => 'Madrid',
                'postal_code'  => '28001',
                'province'     => 'Madrid',
            ],
            [
                'first_name'   => 'Juan',
                'last_name'    => 'Martínez García',
                'dni'          => '87654321B',
                'birth_date'   => '1978-07-22',
                'gender'       => 'M',
                'phone'        => '698765432',
                'email'        => 'juan.martinez@example.com',
                'address'      => 'Avenida de la Constitución 5',
                'city'         => 'Sevilla',
                'postal_code'  => '41001',
                'province'     => 'Sevilla',
            ],
            [
                'first_name'   => 'Ana',
                'last_name'    => 'Rodríguez Pérez',
                'dni'          => '11223344C',
                'birth_date'   => '1992-11-08',
                'gender'       => 'F',
                'phone'        => '655443322',
                'email'        => 'ana.rodriguez@example.com',
                'address'      => 'Plaza España 3',
                'city'         => 'Valencia',
                'postal_code'  => '46001',
                'province'     => 'Valencia',
            ],
            [
                'first_name'   => 'Pedro',
                'last_name'    => 'Sánchez Moreno',
                'dni'          => '55667788D',
                'birth_date'   => '1965-01-30',
                'gender'       => 'M',
                'phone'        => '611223344',
                'email'        => 'pedro.sanchez@example.com',
                'address'      => 'Calle Larios 22',
                'city'         => 'Málaga',
                'postal_code'  => '29001',
                'province'     => 'Málaga',
            ],
            [
                'first_name'   => 'Carmen',
                'last_name'    => 'Díaz Navarro',
                'dni'          => '99887766E',
                'birth_date'   => '2000-06-12',
                'gender'       => 'F',
                'phone'        => '677889900',
                'email'        => 'carmen.diaz@example.com',
                'address'      => 'Gran Vía 45',
                'city'         => 'Barcelona',
                'postal_code'  => '08001',
                'province'     => 'Barcelona',
            ],
        ];

        foreach ($patients as $patient) {
            DB::table('patients')->updateOrInsert(
                ['dni' => $patient['dni']],
                array_merge($patient, [
                    'id'          => Str::uuid(),
                    'is_active'   => true,
                    'created_by'  => $createdBy,
                    'created_at'  => now(),
                    'updated_at'  => now(),
                ])
            );
        }
    }
}
