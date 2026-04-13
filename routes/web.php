<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController; // 1. Added this
use App\Http\Controllers\ProfileController; // 1. Added this
use App\Http\Controllers\PropertyController;

// 2. Added these API routes so Angular can "call" the controller
Route::post('/api/register', [AuthController::class, 'register']);
Route::post('/api/login', [AuthController::class, 'login']);
Route::put('/api/user/update', [AuthController::class, 'updateProfile']);
Route::put('/api/user/update', [AuthController::class, 'updateProfile']);
Route::get('/api/user/details', [AuthController::class, 'getUserDetails']); 
Route::get('/api/user/profile', [ProfileController::class, 'show']);
Route::put('/api/user/profile', [ProfileController::class, 'update']);
Route::get('/api/properties', [PropertyController::class, 'index']);
Route::post('/api/properties', [PropertyController::class, 'store']);
Route::post('/api/properties/{id}', [PropertyController::class, 'update']);
Route::get('/api/properties/{id}', [PropertyController::class, 'show']);       // <-- ADD THIS
Route::delete('/api/properties/{id}', [PropertyController::class, 'destroy']);

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