<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class AuthController extends Controller
{
    // --- 1. REGISTRATION LOGIC ---
    public function register(Request $request)
    {
        // Check if all fields are provided (Laravel's version of your empty() checks)
        $request->validate([
            'role' => 'required|string',
            'email' => 'required|email',
            'password' => 'required|min:6',
        ]);

        // Check if the email already exists
        $existingUser = DB::table('users')->where('email', $request->email)->first();
        if ($existingUser) {
            return response()->json(['message' => 'An account with this email already exists.'], 400);
        }

        // Hash the password and save to database
        DB::table('users')->insert([
            'role' => $request->role,
            'email' => $request->email,
            'password' => Hash::make($request->password)
        ]);

        return response()->json(['message' => 'Registration successful'], 201);
    }

    // --- 2. LOGIN LOGIC ---
    public function login(Request $request)
    {
        // 1. Validate inputs
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        // 2. Attempt to login
        // This automatically checks the 'users' table and verifies the hashed password
        if (Auth::attempt($credentials)) {
            $request->session()->regenerate();
            $user = Auth::user();

            return response()->json([
                'message' => 'Login successful',
                'user' => $user
            ], 200);
        }

        // 3. If it fails
        return response()->json(['message' => 'Invalid email or password.'], 401);
    }

    // Fetch existing details to fill the profile page
    public function getUserDetails(Request $request) {
        $userId = $request->session()->get('user_id'); // Get ID from session
        $user = DB::table('users')->where('id', $userId)->first();
        return response()->json($user);
    }

    // Save updated details
    public function updateProfile(Request $request) {
        $user = $request->user(); // Get authenticated user via Sanctum
    
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'ic' => 'required|string|max:20',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'phone_number' => 'nullable|string|max:50',
            'house_address' => 'nullable|string',
            'wallet_address' => 'nullable|string|max:255',
        ]);
    
        DB::table('users')->where('id', $user->id)->update($validated);
    
        return response()->json(['message' => 'Profile updated successfully']);
    }
}