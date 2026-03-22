<?php

use Illuminate\Support\Facades\Route;

use App\Modules\Auth\Controllers\AuthController;
use App\Modules\Users\Controllers\UserController;
use App\Modules\Patients\Controllers\PatientController;
use App\Modules\Patients\Controllers\ClinicalRecordController;
use App\Modules\Appointments\Controllers\AppointmentController;
use App\Modules\Services\Controllers\ServiceController;
use App\Modules\Services\Controllers\SpecialtyController;
use App\Modules\Billing\Controllers\InvoiceController;
use App\Modules\Analytics\Controllers\AnalyticsController;

/*
|--------------------------------------------------------------------------
| Public routes (no auth)
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('2fa/verify', [AuthController::class, 'verifyTwoFactor']);
});

/*
|--------------------------------------------------------------------------
| Protected routes (Sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // --- Auth ---
    Route::prefix('auth')->group(function () {
        Route::get('me', [AuthController::class, 'me']);
        Route::post('logout', [AuthController::class, 'logout']);
        Route::post('2fa/enable', [AuthController::class, 'enableTwoFactor']);
    });

    // --- Users (ADMIN only) ---
    Route::middleware('role:ADMIN')->group(function () {
        Route::apiResource('users', UserController::class);

        // --- Analytics ---
        Route::prefix('analytics')->group(function () {
            Route::get('overview', [AnalyticsController::class, 'overview']);
            Route::get('practitioners', [AnalyticsController::class, 'practitioners']);
            Route::get('revenue-chart', [AnalyticsController::class, 'revenueChart']);
        });
    });

    // --- Patients ---
    Route::middleware('role:ADMIN,ADMINISTRATIVE,CHIROPODIST,RADIOLOGY_TECHNICIAN')->group(function () {
        Route::apiResource('patients', PatientController::class);
        Route::patch('patients/{patient}/activate', [PatientController::class, 'activate']);

        Route::prefix('patients/{patient}')->group(function () {
            Route::get('clinical-records', [ClinicalRecordController::class, 'index']);
            Route::post('clinical-records', [ClinicalRecordController::class, 'store']);
            Route::get('clinical-records/{clinicalRecord}', [ClinicalRecordController::class, 'show']);
        });
    });

    // --- Appointments ---
    Route::middleware('role:ADMIN,ADMINISTRATIVE,CHIROPODIST,RADIOLOGY_TECHNICIAN')->group(function () {
        Route::apiResource('appointments', AppointmentController::class)->except(['destroy']);
    });

    // --- Services ---
    Route::middleware('role:ADMIN,ADMINISTRATIVE')->group(function () {
        Route::apiResource('services', ServiceController::class);
    });

    // --- Specialties ---
    Route::get('specialties', [SpecialtyController::class, 'index']);

    // --- Invoices ---
    Route::middleware('role:ADMIN,ADMINISTRATIVE')->group(function () {
        Route::apiResource('invoices', InvoiceController::class)->only(['index', 'store', 'show']);
        Route::patch('invoices/{invoice}/issue', [InvoiceController::class, 'issue']);
        Route::patch('invoices/{invoice}/pay', [InvoiceController::class, 'markPaid']);
        Route::patch('invoices/{invoice}/cancel', [InvoiceController::class, 'cancel']);
        Route::get('invoices/{invoice}/pdf', [InvoiceController::class, 'pdf']);
    });
});
