<?php

namespace App\Modules\Services\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Modules\Services\Application\DTOs\CreateServiceRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Service::with('specialty:id,name')->where('is_active', true);

        if ($request->has('specialty_id')) {
            $query->where('specialty_id', $request->input('specialty_id'));
        }

        return response()->json($query->orderBy('name')->get());
    }

    public function store(CreateServiceRequest $request): JsonResponse
    {
        $service = Service::create($request->validated());
        $service->load('specialty:id,name');

        return response()->json($service, 201);
    }

    public function show(Service $service): JsonResponse
    {
        $service->load('specialty:id,name');

        return response()->json($service);
    }

    public function update(CreateServiceRequest $request, Service $service): JsonResponse
    {
        $service->update($request->validated());
        $service->load('specialty:id,name');

        return response()->json($service);
    }

    public function destroy(Service $service): JsonResponse
    {
        $service->update(['is_active' => false]);

        return response()->json(['message' => 'Servicio desactivado.']);
    }
}
