<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class CheckIfSuspended
{
    public function handle(Request $request, Closure $next): Response
    {
        // 🌟 Check the Sanctum user attached to the request
        if ($request->user() && $request->user()->status === 'Suspended') {
            
            // Delete their token so they are fully logged out
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'message' => 'Your account has been suspended.'
            ], 403);
        }

        return $next($request);
    }
}