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
    // --- 2. LOGIN LOGIC ---
    // --- 2. LOGIN LOGIC ---
    public function login(Request $request)
    {
        // 1. Validate inputs
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        // 2. Attempt to login
        // 2. Attempt to login
        if (Auth::attempt($credentials)) {
            // Fetch the user instance using your specific Model
            $user = User::find(Auth::id());

            // 🌟 THE NEW SUSPENSION CHECK 🌟
            if ($user->status === 'Suspended') {
                Auth::logout();
                return response()->json([
                    'message' => 'Your account has been suspended. Please contact the administrator.'
                ], 403);
            }

            // 3. Generate the Sanctum Token
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Login successful',
                'user' => $user,
                'token' => $token 
            ], 200);
        }

        // 4. If password/email is wrong
        return response()->json(['message' => 'Invalid email or password.'], 401);
    }

    // Fetch existing details to fill the profile page
    // Fetch existing details to fill the profile page
    public function getUserDetails(Request $request) {
        // 🌟 Get the securely authenticated user directly from Laravel
        $user = Auth::user(); 

        if (!$user) {
            return response()->json(['message' => 'Session expired'], 401);
        }

        // Return the fresh data from the database
        $userData = DB::table('users')->where('id', $user->id)->first();
        return response()->json($userData);
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