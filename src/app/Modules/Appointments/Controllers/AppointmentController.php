<?php

namespace App\Modules\Appointments\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Modules\Appointments\Application\DTOs\CreateAppointmentRequest;
use App\Modules\Appointments\Application\DTOs\UpdateAppointmentRequest;
use App\Modules\Appointments\Application\UseCases\CheckOverlapUseCase;
use App\Shared\Domain\DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    public function __construct(
        private readonly CheckOverlapUseCase $checkOverlap,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = Appointment::with(['patient:id,first_name,last_name,phone', 'practitioner:id,name', 'service:id,name']);

        if ($request->has('practitioner_id')) {
            $query->where('practitioner_id', $request->input('practitioner_id'));
        }

        if ($request->has('from') && $request->has('to')) {
            $query->whereDate('starts_at', '>=', $request->input('from'))
                  ->whereDate('starts_at', '<=', $request->input('to'));
        }

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        return response()->json(
            $query->orderBy('starts_at')->get()
        );
    }

    public function store(CreateAppointmentRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();

            $this->checkOverlap->execute(
                $data['practitioner_id'],
                $data['starts_at'],
                $data['ends_at'],
            );

            $appointment = Appointment::create(array_merge(
                $data,
                ['created_by' => $request->user()->id],
            ));

            $appointment->load(['patient:id,first_name,last_name,phone', 'practitioner:id,name', 'service:id,name']);

            return response()->json($appointment, 201);
        } catch (DomainException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function show(Appointment $appointment): JsonResponse
    {
        $appointment->load(['patient', 'practitioner:id,name', 'service']);

        return response()->json($appointment);
    }

    public function update(UpdateAppointmentRequest $request, Appointment $appointment): JsonResponse
    {
        try {
            $data = $request->validated();

            // Validate overlap if time changed
            if (isset($data['starts_at']) || isset($data['ends_at'])) {
                $this->checkOverlap->execute(
                    $appointment->practitioner_id,
                    $data['starts_at'] ?? $appointment->starts_at,
                    $data['ends_at'] ?? $appointment->ends_at,
                    $appointment->id,
                );
            }

            $appointment->update($data);
            $appointment->load(['patient:id,first_name,last_name,phone', 'practitioner:id,name', 'service:id,name']);

            return response()->json($appointment);
        } catch (DomainException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}
