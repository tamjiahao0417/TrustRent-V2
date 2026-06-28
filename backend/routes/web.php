<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;

// This route catches requests from users without a token and sends a proper JSON 401 error.
Route::get('/login', function () {
    return response()->json(['message' => 'Unauthenticated token.'], 401);
})->name('login');


// =========================================================
// ANGULAR FRONTEND ASSET SERVING
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


Route::get('/run-migrations', function () {
    try {
        // 1. Wipe the old cached settings
        \Illuminate\Support\Facades\Artisan::call('optimize:clear');
        
        // 2. Run the database migrations
        \Illuminate\Support\Facades\Artisan::call('migrate --force');
        
        return 'Cache cleared and Migrations run successfully!';
    } catch (\Exception $e) {
        return 'Error: ' . $e->getMessage();
    }
});

// =========================================================
// ANGULAR CATCH-ALL (SPA Routing)
// =========================================================
// Any URL typed in the browser that is not an API call will fall back to loading the Angular app.
Route::get('/{any}', function () {
    $path = public_path('frontend/index.html');
     return file_exists($path) ? response()->file($path) : "Error: index.html not found. Please build Angular first.";
})->where('any', '.*');

