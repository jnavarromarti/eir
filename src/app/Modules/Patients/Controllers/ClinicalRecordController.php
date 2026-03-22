<?php

namespace App\Modules\Patients\Controllers;

use App\Http\Controllers\Controller;
use App\Models\ClinicalRecord;
use App\Models\Patient;
use App\Modules\Patients\Application\DTOs\CreateClinicalRecordRequest;
use Illuminate\Http\JsonResponse;

class ClinicalRecordController extends Controller
{
    public function index(Patient $patient): JsonResponse
    {
        $records = $patient->clinicalRecords()
            ->with(['specialty', 'practitioner:id,name'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json($records);
    }

    public function store(CreateClinicalRecordRequest $request, Patient $patient): JsonResponse
    {
        $record = $patient->clinicalRecords()->create(array_merge(
            $request->validated(),
            ['practitioner_id' => $request->user()->id],
        ));

        $record->load(['specialty', 'practitioner:id,name']);

        return response()->json($record, 201);
    }

    public function show(Patient $patient, ClinicalRecord $record): JsonResponse
    {
        $record->load(['specialty', 'practitioner:id,name']);

        return response()->json($record);
    }
}
