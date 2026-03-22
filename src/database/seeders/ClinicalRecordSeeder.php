<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ClinicalRecordSeeder extends Seeder
{
    public function run(): void
    {
        $patients = DB::table('patients')->pluck('id', 'dni');
        $specialties = DB::table('specialties')->pluck('id', 'slug');
        $practitioners = DB::table('users')
            ->whereIn('role', ['CHIROPODIST', 'RADIOLOGY_TECHNICIAN'])
            ->pluck('id', 'role');

        $podologoId = $practitioners['CHIROPODIST'] ?? null;
        $tecnicoId  = $practitioners['RADIOLOGY_TECHNICIAN'] ?? null;

        if (!$podologoId || !$tecnicoId) {
            return;
        }

        $records = [
            // María Fernández — podología
            [
                'patient_dni'    => '12345678A',
                'specialty_slug' => 'podologia',
                'practitioner'   => $podologoId,
                'reason'         => 'Dolor en la planta del pie izquierdo al caminar',
                'diagnosis'      => 'Fascitis plantar grado II',
                'treatment'      => 'Plantillas ortopédicas a medida + estiramientos diarios de gemelos y fascia plantar. AINE tópico durante 10 días.',
                'observations'   => 'Paciente refiere inicio de molestias hace 3 meses. Peor al levantarse por la mañana. Revisión en 4 semanas.',
                'created_at'     => '2026-01-10 09:30:00',
            ],
            [
                'patient_dni'    => '12345678A',
                'specialty_slug' => 'podologia',
                'practitioner'   => $podologoId,
                'reason'         => 'Revisión fascitis plantar',
                'diagnosis'      => 'Fascitis plantar en remisión',
                'treatment'      => 'Continuar con plantillas ortopédicas. Reducir AINE. Incorporar ejercicios de fortalecimiento del arco plantar.',
                'observations'   => 'Mejoría notable. Dolor EVA 3/10 vs 7/10 en consulta anterior. Próxima revisión en 2 meses.',
                'created_at'     => '2026-02-07 10:00:00',
            ],

            // Juan Martínez — podología + imagen
            [
                'patient_dni'    => '87654321B',
                'specialty_slug' => 'podologia',
                'practitioner'   => $podologoId,
                'reason'         => 'Uña encarnada en primer dedo pie derecho',
                'diagnosis'      => 'Onicocriptosis bilateral del hallux derecho con granuloma',
                'treatment'      => 'Matricectomía parcial con fenolización. Curas con betadine y gasa vaselinada cada 48h durante 2 semanas.',
                'observations'   => 'Procedimiento realizado bajo anestesia digital troncular. Buena tolerancia. Control en 1 semana.',
                'created_at'     => '2026-02-15 11:00:00',
            ],
            [
                'patient_dni'    => '87654321B',
                'specialty_slug' => 'diagnostico-por-imagen',
                'practitioner'   => $tecnicoId,
                'reason'         => 'Radiografía control post-cirugía ungueal',
                'diagnosis'      => 'Sin hallazgos óseos patológicos',
                'treatment'      => 'No precisa tratamiento adicional por imagen.',
                'observations'   => 'Radiografía AP y oblicua de primer dedo pie derecho. No se observan signos de osteomielitis. Tejidos blandos sin alteraciones significativas.',
                'created_at'     => '2026-02-22 09:00:00',
            ],

            // Ana Rodríguez — podología (estudio biomecánico)
            [
                'patient_dni'    => '11223344C',
                'specialty_slug' => 'podologia',
                'practitioner'   => $podologoId,
                'reason'         => 'Dolor bilateral en rodillas al correr',
                'diagnosis'      => 'Síndrome pronador bilateral con repercusión fémoro-patelar',
                'treatment'      => 'Plantillas termoconformadas con cuña supinadora de retropié 4° bilateral. Tabla de ejercicios de potenciación de vasto medial oblicuo.',
                'observations'   => 'Estudio biomecánico completo en estática y dinámica. Corredora habitual (30 km/semana). FPI: +8 bilateral. Revisión en 6 semanas con plantillas.',
                'custom_fields'  => ['fpi_izq' => '+8', 'fpi_der' => '+8', 'km_semana' => 30, 'tipo_calzado' => 'neutro'],
                'created_at'     => '2026-01-20 16:00:00',
            ],
            [
                'patient_dni'    => '11223344C',
                'specialty_slug' => 'podologia',
                'practitioner'   => $podologoId,
                'reason'         => 'Revisión plantillas y evolución',
                'diagnosis'      => 'Mejoría clínica con ortesis plantar',
                'treatment'      => 'Mantener plantillas actuales. Autorizada vuelta a entreno progresivo.',
                'observations'   => 'Sin dolor en últimos 10 días. Retoma carrera a partir de 15 km/semana con incremento progresivo del 10% semanal.',
                'created_at'     => '2026-03-03 17:00:00',
            ],

            // Pedro Sánchez — diagnóstico por imagen + podología
            [
                'patient_dni'    => '55667788D',
                'specialty_slug' => 'diagnostico-por-imagen',
                'practitioner'   => $tecnicoId,
                'reason'         => 'Ecografía del tendón de Aquiles derecho',
                'diagnosis'      => 'Tendinopatía insercional del Aquiles con calcificación intratendinosa',
                'treatment'      => 'Se recomienda valoración por podología para tratamiento conservador. Posible derivación a traumatología si no responde.',
                'observations'   => 'Ecografía muestra engrosamiento fusiforme del tendón a 2 cm de inserción (12 mm vs 5 mm contralateral). Señal Doppler positiva. Calcificación de 4 mm.',
                'custom_fields'  => ['grosor_tendon_mm' => 12, 'grosor_contralateral_mm' => 5, 'calcificacion_mm' => 4, 'doppler' => 'positivo'],
                'created_at'     => '2025-12-05 10:30:00',
            ],
            [
                'patient_dni'    => '55667788D',
                'specialty_slug' => 'podologia',
                'practitioner'   => $podologoId,
                'reason'         => 'Valoración tendinopatía de Aquiles tras ecografía',
                'diagnosis'      => 'Tendinopatía crónica insercional del Aquiles derecho',
                'treatment'      => 'Protocolo Alfredson de excéntricos 12 semanas. Talonera de descarga 5 mm bilateral. Ondas de choque focales 1 sesión/semana × 5 semanas.',
                'observations'   => 'Paciente con dolor crónico de 6 meses. Empeora al subir escaleras. Ecografía previa confirma tendinopatía. Inicio tratamiento combinado.',
                'created_at'     => '2025-12-12 12:00:00',
            ],
            [
                'patient_dni'    => '55667788D',
                'specialty_slug' => 'podologia',
                'practitioner'   => $podologoId,
                'reason'         => 'Control tras 3ª sesión de ondas de choque',
                'diagnosis'      => 'Tendinopatía de Aquiles en evolución favorable',
                'treatment'      => 'Continuar protocolo de excéntricos y ondas de choque. 2 sesiones restantes.',
                'observations'   => 'Dolor EVA 4/10 vs 8/10 inicial. Buena adherencia al programa de excéntricos. Próxima ecografía de control al finalizar el ciclo.',
                'created_at'     => '2026-01-09 12:30:00',
            ],

            // Carmen Díaz — podología (quiropodia)
            [
                'patient_dni'    => '99887766E',
                'specialty_slug' => 'podologia',
                'practitioner'   => $podologoId,
                'reason'         => 'Hiperqueratosis dolorosa en quinto metatarsiano derecho',
                'diagnosis'      => 'Heloma plantar por sobrecarga del quinto metatarsiano',
                'treatment'      => 'Deslaminación del heloma. Descarga con fieltro adhesivo. Plantilla con barra retrocapital.',
                'observations'   => 'Heloma de 8 mm de diámetro con núcleo central. Paciente usa calzado estrecho habitualmente. Recomendación de cambio de calzado.',
                'created_at'     => '2026-03-01 09:00:00',
            ],
            [
                'patient_dni'    => '99887766E',
                'specialty_slug' => 'diagnostico-por-imagen',
                'practitioner'   => $tecnicoId,
                'reason'         => 'Radiografía de antepié derecho para valorar morfología metatarsal',
                'diagnosis'      => 'Fórmula metatarsal tipo index minus. Sin fracturas ni luxaciones.',
                'treatment'      => 'No precisa. Correlacionar con clínica podológica.',
                'observations'   => 'Proyecciones dorsoplantar y oblicua. Quinto metatarsiano con cabeza plantarflexionada respecto al eje. Compatible con sobrecarga mecánica.',
                'created_at'     => '2026-03-08 10:00:00',
            ],
        ];

        foreach ($records as $record) {
            $patientId = $patients[$record['patient_dni']] ?? null;
            $specialtyId = $specialties[$record['specialty_slug']] ?? null;

            if (!$patientId || !$specialtyId) {
                continue;
            }

            DB::table('clinical_records')->insert([
                'id'              => Str::uuid(),
                'patient_id'      => $patientId,
                'specialty_id'    => $specialtyId,
                'practitioner_id' => $record['practitioner'],
                'reason'          => $record['reason'],
                'diagnosis'       => $record['diagnosis'],
                'treatment'       => $record['treatment'],
                'observations'    => $record['observations'],
                'custom_fields'   => isset($record['custom_fields']) ? json_encode($record['custom_fields']) : null,
                'created_at'      => $record['created_at'],
                'updated_at'      => $record['created_at'],
            ]);
        }
    }
}
