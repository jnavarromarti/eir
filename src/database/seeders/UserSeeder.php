<?php

namespace Database\Seeders;

use App\Shared\Domain\UserRole;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Map roles to specialty slugs
        $roleSpecialtyMap = [
            UserRole::CHIROPODIST->value          => 'podologia',
            UserRole::RADIOLOGY_TECHNICIAN->value => 'diagnostico-por-imagen',
            UserRole::PHYSIOTHERAPIST->value       => 'fisioterapia',
            UserRole::SPEECH_THERAPIST->value      => 'logopedia',
            UserRole::DENTIST->value               => 'odontologia',
        ];

        $specialties = DB::table('specialties')->pluck('id', 'slug');

        $users = [
            [
                'name'     => 'Admin EIR',
                'email'    => 'admin@eir.com',
                'role'     => UserRole::ADMIN->value,
            ],
            [
                'name'     => 'Laura García',
                'email'    => 'administrativa@eir.com',
                'role'     => UserRole::ADMINISTRATIVE->value,
            ],
            [
                'name'     => 'Dr. Carlos Ruiz',
                'email'    => 'podologo@eir.com',
                'role'     => UserRole::CHIROPODIST->value,
            ],
            [
                'name'     => 'Marta López',
                'email'    => 'tecnico@eir.com',
                'role'     => UserRole::RADIOLOGY_TECHNICIAN->value,
            ],
        ];

        foreach ($users as $user) {
            $specialtySlug = $roleSpecialtyMap[$user['role']] ?? null;
            $specialtyId = $specialtySlug ? ($specialties[$specialtySlug] ?? null) : null;

            DB::table('users')->updateOrInsert(
                ['email' => $user['email']],
                [
                    'id'                => Str::uuid(),
                    'name'              => $user['name'],
                    'email'             => $user['email'],
                    'password'          => Hash::make('password'),
                    'role'              => $user['role'],
                    'specialty_id'      => $specialtyId,
                    'is_active'         => true,
                    'two_factor_enabled' => false,
                    'email_verified_at' => now(),
                    'created_at'        => now(),
                    'updated_at'        => now(),
                ]
            );
        }
    }
}
