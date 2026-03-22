<?php

namespace App\Modules\Services\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Specialty;
use Illuminate\Http\JsonResponse;

class SpecialtyController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            Specialty::where('is_active', true)->orderBy('name')->get(['id', 'name', 'slug'])
        );
    }
}
