<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Services\AuthService;
use Illuminate\Support\Facades\DB; // 🌟 1. Add this at the top!
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
    // --- 1. REGISTRATION LOGIC ---
    // --- 1. REGISTRATION LOGIC ---
    public function register(Request $request)
    {
        $validated = $request->validate([
            'role' => 'required|string',
            // 🌟 FIX 1: Removed the 'dns' check because it crashes on local XAMPP servers
            'email' => 'required|email|unique:users,email', 
            'password' => 'required|min:6',
        ]);

        // Start the Database Transaction
        DB::beginTransaction();

        try {
            // 1. Create the user
            $this->authService->registerUser($validated);
            
            // 2. Generate a 6-digit OTP
            $otp = rand(100000, 999999);
            
            // 3. Store OTP in cache for 10 minutes
            \Illuminate\Support\Facades\Cache::put('otp_' . $validated['email'], $otp, now()->addMinutes(10));

            // 4. Send the Email using the new HTML template
            // 🌟 Changed from Mail::raw to Mail::send
            \Illuminate\Support\Facades\Mail::send('emails.otp', ['otp' => $otp], function ($message) use ($validated) {
                
                // Explicitly state who the email is FROM so the mailer doesn't crash
                $message->from('noreply@trustrent.com', 'TrustRent');
                
                $message->to($validated['email'])
                        ->subject('Verify your TrustRent Account');
            });

            // 5. Commit the transaction
            DB::commit();

            return response()->json(['message' => 'Registration successful. OTP sent.', 'email' => $validated['email']], 201);
            
        } catch (Exception $e) {
            
            // If ANYTHING crashes, ROLLBACK and delete the inserted user!
            DB::rollBack();
            
            $statusCode = $e->getCode();
            if (!is_numeric($statusCode) || $statusCode < 100 || $statusCode >= 600) {
                $statusCode = 500; 
            }

            return response()->json([
                'message' => 'Registration failed: ' . $e->getMessage() 
            ], $statusCode);
        }
    }

    // --- 1.5 OTP VERIFICATION ---
    public function verifyOtp(Request $request)
    {
        $request->validate(['email' => 'required|email', 'otp' => 'required|numeric']);

        $cachedOtp = \Illuminate\Support\Facades\Cache::get('otp_' . $request->email);

        if (!$cachedOtp || $cachedOtp != $request->otp) {
            return response()->json(['message' => 'Invalid or expired OTP.'], 400);
        }

        // Find user and mark as verified
        $user = \App\Models\User::where('email', $request->email)->first();
        $user->email_verified_at = now();
        $user->save();

        // Clear the OTP from cache
        \Illuminate\Support\Facades\Cache::forget('otp_' . $request->email);

        return response()->json(['message' => 'Email verified successfully!']);
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
            
            // Prevent the "Status Code 7" crash during login
            $statusCode = $e->getCode();
            
            if (!is_numeric($statusCode) || $statusCode < 100 || $statusCode >= 600) {
                $statusCode = 500; // Default to standard 500 Server Error
            }

            return response()->json([
                'message' => 'Login Error: ' . $e->getMessage() 
            ], $statusCode);
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