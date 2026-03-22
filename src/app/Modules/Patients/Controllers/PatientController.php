<?php

namespace App\Modules\Patients\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Modules\Patients\Application\DTOs\CreatePatientRequest;
use App\Modules\Patients\Application\DTOs\UpdatePatientRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PatientController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Patient::query()
            ->select('id', 'first_name', 'last_name', 'dni', 'birth_date', 'phone', 'email', 'address', 'city', 'postal_code', 'medical_notes', 'is_active');

        // Next appointment subquery
        $query->addSelect([
            'next_appointment_id' => \App\Models\Appointment::select('id')
                ->whereColumn('patient_id', 'patients.id')
                ->where('starts_at', '>=', now())
                ->orderBy('starts_at')
                ->limit(1),
            'next_appointment_at' => \App\Models\Appointment::select('starts_at')
                ->whereColumn('patient_id', 'patients.id')
                ->where('starts_at', '>=', now())
                ->orderBy('starts_at')
                ->limit(1),
        ]);

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'ilike', "%{$search}%")
                  ->orWhere('last_name', 'ilike', "%{$search}%")
                  ->orWhere('dni', 'ilike', "%{$search}%");
            });
        }

        if ($request->has('active')) {
            $query->where('is_active', $request->boolean('active'));
        }

        // Sorting
        $sortable = ['first_name', 'last_name', 'dni', 'birth_date', 'city', 'email', 'phone'];
        $sort = $request->input('sort', 'last_name');
        $direction = $request->input('direction', 'asc');
        if (in_array($sort, $sortable, true)) {
            $query->orderBy($sort, $direction === 'desc' ? 'desc' : 'asc');
        } else {
            $query->orderBy('last_name');
        }

        $paginated = $query->paginate(25);

        // Transform next_appointment columns into nested object
        $paginated->getCollection()->transform(function ($patient) {
            $patient->next_appointment = $patient->next_appointment_id
                ? ['id' => $patient->next_appointment_id, 'starts_at' => $patient->next_appointment_at]
                : null;
            unset($patient->next_appointment_id, $patient->next_appointment_at);
            return $patient;
        });

        return response()->json($paginated);
    }

    public function store(CreatePatientRequest $request): JsonResponse
    {
        $patient = Patient::create(array_merge(
            $request->validated(),
            ['created_by' => $request->user()->id],
        ));

        return response()->json($patient, 201);
    }

    public function show(Patient $patient): JsonResponse
    {
        $patient->load(['clinicalRecords.specialty', 'clinicalRecords.practitioner']);

        return response()->json($patient);
    }

    public function update(UpdatePatientRequest $request, Patient $patient): JsonResponse
    {
        $patient->update($request->validated());

        return response()->json($patient);
    }

    public function destroy(Patient $patient): JsonResponse
    {
        $patient->update(['is_active' => false]);

        return response()->json(['message' => 'Paciente desactivado.']);
    }

    public function activate(Patient $patient): JsonResponse
    {
        $patient->update(['is_active' => true]);

        return response()->json(['message' => 'Paciente activado.']);
    }
}
