<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Services\AuthService;
use Exception;

class AuthController extends Controller
{
    protected AuthService $authService;

    // Inject the Business Logic Service
    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    // --- 1. REGISTRATION LOGIC ---
    public function register(Request $request)
    {
        $validated = $request->validate([
            'role' => 'required|string',
            'email' => 'required|email',
            'password' => 'required|min:6',
        ]);

        try {
            $this->authService->registerUser($validated);
            return response()->json(['message' => 'Registration successful'], 201);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 400);
        }
    }

    // --- 2. LOGIN LOGIC ---
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        try {
            $authData = $this->authService->loginUser($validated);
            
            return response()->json([
                'message' => 'Login successful',
                'user' => $authData['user'],
                'token' => $authData['token']
            ], 200);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 401);
        }
    }

    // --- 3. FETCH EXISTING PROFILE ---
    public function getUserDetails(Request $request) 
    {
        $user = Auth::user(); 

        if (!$user) {
            return response()->json(['message' => 'Session expired'], 401);
        }

        try {
            $userDetails = $this->authService->getUserDetails($user->id);
            return response()->json($userDetails);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 404);
        }
    }

    // --- 4. SAVE UPDATED PROFILE ---
    public function updateProfile(Request $request) 
    {
        $user = $request->user(); 
    
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'ic' => 'required|string|max:20',
            // Allow the user to keep their current email without triggering the unique validation
            'email' => 'required|email|unique:users,email,' . $user->id,
            'phone_number' => 'nullable|string|max:50',
            'house_address' => 'nullable|string',
            'wallet_address' => 'nullable|string|max:255',
        ]);

        try {
            $this->authService->updateProfile($user->id, $validated);
            return response()->json(['message' => 'Profile updated successfully']);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
}