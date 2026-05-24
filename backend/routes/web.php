<?php

use Illuminate\Support\Facades\Route;
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

Route::get('/api/debug-token', function (\Illuminate\Http\Request $request) {
    return response()->json([
        'raw_header' => $request->header('Authorization'),
        'extracted_token' => $request->bearerToken(),
        'found_user' => $request->user('sanctum')
    ]);
});

Route::get('/login', function () {
    return response()->json(['message' => 'Unauthenticated token.'], 401);
})->name('login');
// =========================================================
// 1. PUBLIC ROUTES (Anyone can access these to log in)
// =========================================================
Route::post('/api/register', [AuthController::class, 'register']);
Route::post('/api/login', [AuthController::class, 'login']);



// 🌟 Add ->withoutMiddleware(['auth']) to the end of these two lines!
// =========================================================
// 2. PRIVATE ROUTES (The Security Guard checks the 1-minute timer here!)
// =========================================================
// 🌟 Add ":sanctum" to the auth middleware
Route::middleware(['auth:sanctum', \App\Http\Middleware\CheckIfSuspended::class])->group(function () {
    // User & Profile
    Route::put('/api/user/update', [AuthController::class, 'updateProfile']);
    Route::get('/api/user/details', [AuthController::class, 'getUserDetails']); 
    Route::get('/api/user/profile', [ProfileController::class, 'show']);
    Route::put('/api/user/profile', [ProfileController::class, 'update']);
    
    // Dashboard
    Route::get('/api/dashboard-stats', [DashboardController::class, 'getStats']);

    // Properties
    Route::get('/api/properties', [PropertyController::class, 'index']);
    Route::get('/api/properties/all', [PropertyController::class, 'getAll']);
    Route::post('/api/properties', [PropertyController::class, 'store']);
    Route::post('/api/properties/{id}', [PropertyController::class, 'update']);
    Route::get('/api/properties/{id}', [PropertyController::class, 'show']); 
    Route::delete('/api/properties/{id}', [PropertyController::class, 'destroy']);
    
    // Appointments
    Route::post('/api/appointments', [AppointmentController::class, 'store']);
    Route::get('/api/appointments', [AppointmentController::class, 'index']);
    Route::get('/api/appointments/{id}', [AppointmentController::class, 'show']);
    Route::delete('/api/appointments/{id}', [AppointmentController::class, 'destroy']);
    Route::put('/api/appointments/{id}', [AppointmentController::class, 'update']);
    Route::patch('/api/appointments/{id}/status', [AppointmentController::class, 'updateStatus']);
    
    // Rental Requests
    Route::post('/api/rental-requests', [RentalRequestController::class, 'store']);
    Route::get('/api/rental-requests', [RentalRequestController::class, 'index']);
    Route::get('/api/rental-requests/{id}', [RentalRequestController::class, 'show']);
    Route::put('/api/rental-requests/{id}', [RentalRequestController::class, 'update']);
    Route::delete('/api/rental-requests/{id}', [RentalRequestController::class, 'destroy']);
    Route::patch('/api/rental-requests/{id}/status', [RentalRequestController::class, 'updateStatus']);
    
    // Contracts
    Route::post('/api/contracts', [ContractController::class, 'store']);
    Route::get('/api/contracts', [ContractController::class, 'index']);
    Route::get('/api/contracts/{id}', [ContractController::class, 'show']);
    Route::patch('/api/contracts/{id}/sign', [ContractController::class, 'signTenant']);
    Route::put('/api/contracts/{id}/redraft', [ContractController::class, 'reDraft']);
    Route::patch('/api/contracts/{id}/request-edit', [ContractController::class, 'requestEdit']);
    Route::patch('/api/contracts/{id}/seal', [ContractController::class, 'seal']);
    
    // Transactions
    Route::get('/api/billing/{tenant_id}', [TransactionController::class, 'getBillingDetails']);
    Route::post('/api/payments', [TransactionController::class, 'storePayment']);
    Route::get('/api/transactions', [TransactionController::class, 'index']);
    Route::get('/api/transactions/{id}', [TransactionController::class, 'show']);
    
    // AI Features
    Route::get('/api/ai/properties/{landlordId}', [AiController::class, 'getLandlordProperties']);
    Route::post('/api/ai/predict', [AiController::class, 'predictPrice']);
    
    // Maintenance
    Route::get('/api/maintenance', [MaintenanceController::class, 'index']);
    Route::get('/api/maintenance/{id}', [MaintenanceController::class, 'show']);
    Route::delete('/api/maintenance/{id}', [MaintenanceController::class, 'destroy']);
    Route::get('/api/maintenance-properties', [MaintenanceController::class, 'getActiveProperties']);
    Route::post('/api/maintenance', [MaintenanceController::class, 'store']);
    Route::put('/api/maintenance/{id}/status', [MaintenanceController::class, 'updateStatus']);
    Route::put('/api/maintenance/{id}', [MaintenanceController::class, 'update']);

    Route::get('/api/chat/contacts', [ChatController::class, 'getContacts']);
    Route::get('/api/chat/messages', [ChatController::class, 'getMessages']);
    Route::post('/api/chat/send', [ChatController::class, 'sendMessage']);

    Route::get('/api/admin/users', [AdminController::class, 'getUsers']);
    Route::patch('/api/admin/users/{id}/suspend', [AdminController::class, 'suspendUser']);
    Route::patch('/api/admin/users/{id}/activate', [AdminController::class, 'activateUser']);
    //Route::get('/admin/users', [AdminController::class, 'index']);

    Route::post('/api/reports', [ReportController::class, 'store']);
    Route::get('/api/reports', [ReportController::class, 'index']);
    Route::get('/api/reports/{id}', [ReportController::class, 'show']);
    Route::patch('/api/reports/{id}/status', [ReportController::class, 'updateStatus']);

    // 🌟 ADD THIS NEW LINE FOR EDITING REPORTS:
    Route::put('/api/reports/{id}', [ReportController::class, 'update']);

    // 🌟 ALSO UPDATE THIS LINE to include /api/ so your delete button works properly!
    Route::delete('/api/reports/{id}', [ReportController::class, 'destroy']);
    
    Route::post('/api/ai/match', [AiController::class, 'match']);
});

// =========================================================
// 3. ANGULAR FRONTEND SERVING (Keep this completely outside!)
// =========================================================
Route::get('/{asset}', function ($asset) {
    $filename = basename($asset);
    $path = public_path("frontend/" . $filename);
    if (file_exists($path)) {
        $extension = pathinfo($path, PATHINFO_EXTENSION);
        $mimeType = match($extension) {
            'js' => 'application/javascript',
            'css' => 'text/css',
            'ico' => 'image/x-icon',
            'svg' => 'image/svg+xml', 
            'png' => 'image/png',      
            'jpg', 'jpeg' => 'image/jpeg', 
            default => 'text/plain'
        };
        return response()->file($path, ['Content-Type' => $mimeType]);
    }
    abort(404);
})->where('asset', '.*\.(js|css|ico|png|jpg|jpeg|svg|woff|woff2|ttf|eot)$');

// =========================================================
// 3. ANGULAR FRONTEND SERVING
// =========================================================
// ... (Keep the asset route the same) ...

// Route::get('/{any}', function () {
//     $path = public_path('frontend/index.html');
//     return file_exists($path) ? response()->file($path) : "Error: index.html not found";
    
// // 🌟 THE FIX: This regex tells Laravel to ignore anything starting with 'api/'
// })->where('any', '^(?!api).*$');