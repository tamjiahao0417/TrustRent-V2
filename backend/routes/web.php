<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController; // 1. Added this
use App\Http\Controllers\ProfileController; // 1. Added this
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\RentalRequestController;
use App\Http\Controllers\ContractController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\AiController;
use App\Http\Controllers\MaintenanceController;

// 2. Added these API routes so Angular can "call" the controller
Route::post('/api/register', [AuthController::class, 'register']);
Route::post('/api/login', [AuthController::class, 'login']);
Route::put('/api/user/update', [AuthController::class, 'updateProfile']);
Route::get('/api/user/details', [AuthController::class, 'getUserDetails']); 
Route::get('/api/user/profile', [ProfileController::class, 'show']);
Route::put('/api/user/profile', [ProfileController::class, 'update']);
Route::get('/api/properties', [PropertyController::class, 'index']);
Route::get('/api/properties/all', [PropertyController::class, 'getAll']);
Route::post('/api/properties', [PropertyController::class, 'store']);
Route::post('/api/properties/{id}', [PropertyController::class, 'update']);
Route::get('/api/properties/{id}', [PropertyController::class, 'show']);       // <-- ADD THIS
Route::delete('/api/properties/{id}', [PropertyController::class, 'destroy']);
Route::post('/api/appointments', [AppointmentController::class, 'store']);
Route::get('/api/appointments', [AppointmentController::class, 'index']);
Route::get('/api/appointments/{id}', [AppointmentController::class, 'show']);
Route::delete('/api/appointments/{id}', [AppointmentController::class, 'destroy']);
Route::put('/api/appointments/{id}', [AppointmentController::class, 'update']);
Route::patch('/api/appointments/{id}/status', [AppointmentController::class, 'updateStatus']);
Route::post('/api/rental-requests', [RentalRequestController::class, 'store']);
Route::get('/api/rental-requests', [RentalRequestController::class, 'index']);
Route::get('/api/rental-requests/{id}', [RentalRequestController::class, 'show']);
Route::put('/api/rental-requests/{id}', [RentalRequestController::class, 'update']);
Route::delete('/api/rental-requests/{id}', [RentalRequestController::class, 'destroy']);
Route::patch('/api/rental-requests/{id}/status', [RentalRequestController::class, 'updateStatus']);
Route::post('/api/contracts', [ContractController::class, 'store']);
Route::get('/api/contracts', [ContractController::class, 'index']);
Route::get('/api/contracts/{id}', [ContractController::class, 'show']);
Route::patch('/api/contracts/{id}/sign', [ContractController::class, 'signTenant']);
Route::put('/api/contracts/{id}/redraft', [ContractController::class, 'reDraft']);
Route::patch('/api/contracts/{id}/request-edit', [ContractController::class, 'requestEdit']);
Route::patch('/api/contracts/{id}/seal', [ContractController::class, 'seal']);
Route::get('/api/billing/{tenant_id}', [TransactionController::class, 'getBillingDetails']);
Route::post('/api/payments', [TransactionController::class, 'storePayment']);
Route::get('/api/transactions', [TransactionController::class, 'index']);
Route::get('/api/transactions/{id}', [TransactionController::class, 'show']);
Route::get('/api/ai/properties/{landlordId}', [AiController::class, 'getLandlordProperties']);
Route::post('/api/ai/predict', [AiController::class, 'predictPrice']);
Route::get('/api/maintenance', [MaintenanceController::class, 'index']);
Route::get('/api/maintenance/{id}', [MaintenanceController::class, 'show']);
Route::delete('/api/maintenance/{id}', [MaintenanceController::class, 'destroy']);
Route::get('/api/maintenance-properties', [MaintenanceController::class, 'getActiveProperties']);
Route::post('/api/maintenance', [MaintenanceController::class, 'store']);
Route::put('/api/maintenance/{id}/status', [MaintenanceController::class, 'updateStatus']);
Route::put('/api/maintenance/{id}', [MaintenanceController::class, 'update']);

// --- Your existing Angular serving logic stays below ---
Route::get('/{asset}', function ($asset) {
    $filename = basename($asset);
    $path = public_path("frontend/" . $filename);
    if (file_exists($path)) {
        $extension = pathinfo($path, PATHINFO_EXTENSION);
        $mimeType = match($extension) {
            'js' => 'application/javascript',
            'css' => 'text/css',
            'ico' => 'image/x-icon',
            'svg' => 'image/svg+xml',  // <-- ADDED THIS!
            'png' => 'image/png',      // <-- ADDED THIS!
            'jpg', 'jpeg' => 'image/jpeg', // <-- ADDED THIS!
            default => 'text/plain'
        };
        return response()->file($path, ['Content-Type' => $mimeType]);
    }
    abort(404);
})->where('asset', '.*\.(js|css|ico|png|jpg|jpeg|svg|woff|woff2|ttf|eot)$');

Route::get('/{any}', function () {
    $path = public_path('frontend/index.html');
    return file_exists($path) ? response()->file($path) : "Error: index.html not found";
})->where('any', '.*');