<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            SpecialtySeeder::class,
            UserSeeder::class,
            ServiceSeeder::class,
            PatientSeeder::class,
            ClinicalRecordSeeder::class,
            AppointmentSeeder::class,
            InvoiceSeeder::class,
        ]);
    }
}
