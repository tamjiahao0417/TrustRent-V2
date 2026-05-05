<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckIfSuspended
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle($request, Closure $next)
   {
       // If the user is logged in BUT their status is Suspended
       if (auth()->check() && auth()->user()->status === 'Suspended') {
           
           // Log them out on the backend
           auth()->logout();
           $request->session()->invalidate();
           $request->session()->regenerateToken();

           // Send a 403 Forbidden error to Angular
           return response()->json([
               'message' => 'Your account has been suspended.'
           ], 403);
       }

       return $next($request);
   }
}
