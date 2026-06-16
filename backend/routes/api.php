<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Import all your controllers
use App\Http\Controllers\AuthController; 
use App\Http\Controllers\ProfileController; 
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\RentalRequestController;
use App\Http\Controllers\ContractController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\AiController;
use App\Http\Controllers\MaintenanceController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ReportController;

/* =========================================================
   1. PUBLIC ROUTES (No Token Required)
   ========================================================= */

Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/resend-otp', [AuthController::class, 'resendOtp']);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Anyone can view property listings
Route::get('/properties/feed', [PropertyController::class, 'getAll']);
Route::get('/properties/view/{id}', [PropertyController::class, 'show']);

// Debug tool
Route::get('/debug-token', function (Request $request) {
    return response()->json([
        'raw_header' => $request->header('Authorization'),
        'extracted_token' => $request->bearerToken(),
        'found_user' => $request->user('sanctum')
    ]);
});

/* =========================================================
   2. SECURE ROUTES (Requires a valid Sanctum Token)
   ========================================================= */
Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    
    // User & Profile
    Route::get('/user', function (Request $request) { return $request->user(); });
    Route::get('/user-details', [AuthController::class, 'getUserDetails']);
    Route::post('/update-profile', [AuthController::class, 'updateProfile']);
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::post('/profile', [ProfileController::class, 'update']);

    // Admin User Management
    Route::get('/users', [AdminController::class, 'getUsers']);
    Route::delete('/users/{id}', [AdminController::class, 'destroy']);
    Route::put('/users/{id}', [AdminController::class, 'update']);
    Route::patch('/users/{id}/suspend', [AdminController::class, 'suspendUser']);
    Route::patch('/users/{id}/activate', [AdminController::class, 'activateUser']);
    
    // Properties
    Route::post('/properties', [PropertyController::class, 'store']);
    Route::post('/properties/{id}', [PropertyController::class, 'update']);
    //Route::get('/properties/all', [PropertyController::class, 'getAll']);
    Route::delete('/properties/{id}', [PropertyController::class, 'destroy']);
    Route::get('/my-properties', [PropertyController::class, 'index']);
    Route::get('/properties/{id}', [PropertyController::class, 'show']);

    // Appointments
    Route::get('/appointments', [AppointmentController::class, 'index']);
    Route::post('/appointments', [AppointmentController::class, 'store']);
    Route::get('/appointments/{id}', [AppointmentController::class, 'show']);
    Route::put('/appointments/{id}', [AppointmentController::class, 'update']);
    Route::delete('/appointments/{id}', [AppointmentController::class, 'destroy']);
    Route::patch('/appointments/{id}/status', [AppointmentController::class, 'updateStatus']);

    // Rental Requests
    Route::get('/rental-requests', [RentalRequestController::class, 'index']);
    Route::post('/rental-requests', [RentalRequestController::class, 'store']);
    Route::get('/rental-requests/{id}', [RentalRequestController::class, 'show']);
    Route::put('/rental-requests/{id}', [RentalRequestController::class, 'update']);
    Route::delete('/rental-requests/{id}', [RentalRequestController::class, 'destroy']);
    Route::patch('/rental-requests/{id}/status', [RentalRequestController::class, 'updateStatus']);

    // Contracts
    Route::get('/contracts', [ContractController::class, 'index']);
    Route::post('/contracts', [ContractController::class, 'store']);
    Route::get('/contracts/{id}', [ContractController::class, 'show']);
    Route::post('/contracts/{id}/sign', [ContractController::class, 'signTenant']);
    Route::post('/contracts/{id}/request-edit', [ContractController::class, 'requestEdit']);
    Route::put('/contracts/{id}/redraft', [ContractController::class, 'reDraft']);
    Route::post('/contracts/{id}/seal', [ContractController::class, 'seal']);

    // Transactions
    Route::get('/transactions/billing-details/{tenantId}', [TransactionController::class, 'getBillingDetails']);
    Route::post('/transactions/payment', [TransactionController::class, 'storePayment']);
    Route::get('/transactions', [TransactionController::class, 'index']);
    Route::get('/transactions/{id}', [TransactionController::class, 'show']);

    // Maintenance
    Route::get('/maintenance', [MaintenanceController::class, 'index']);
    Route::post('/maintenance', [MaintenanceController::class, 'store']);
    Route::get('/active-properties', [MaintenanceController::class, 'getActiveProperties']);
    Route::get('/maintenance/{id}', [MaintenanceController::class, 'show']);
    Route::post('/maintenance/{id}', [MaintenanceController::class, 'update']);
    Route::delete('/maintenance/{id}', [MaintenanceController::class, 'destroy']);
    Route::patch('/maintenance/{id}/status', [MaintenanceController::class, 'updateStatus']);

    // Reports
    Route::get('/reports', [ReportController::class, 'index']);
    Route::post('/reports', [ReportController::class, 'store']);
    Route::get('/reports/{id}', [ReportController::class, 'show']);
    Route::post('/reports/{id}', [ReportController::class, 'update']);
    Route::delete('/reports/{id}', [ReportController::class, 'destroy']);
    Route::patch('/reports/{id}/status', [ReportController::class, 'updateStatus']);

    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'getStats']);

    // Chat
    Route::get('/chat/contacts', [ChatController::class, 'getContacts']);
    Route::get('/chat/messages', [ChatController::class, 'getMessages']);
    Route::post('/chat/send', [ChatController::class, 'sendMessage']);

    // AI
    Route::post('/ai/price-estimate', [AiController::class, 'estimatePrice']);
    Route::post('/ai/match', [AiController::class, 'match']);
    Route::post('/ai/match-tenants', [AiController::class, 'matchTenants']);
});