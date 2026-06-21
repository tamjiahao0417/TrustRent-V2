<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\ProfileService;
use Exception;

class ProfileController extends Controller
{
    protected ProfileService $profileService;

    // Inject the Business Logic Service
    public function __construct(ProfileService $profileService)
    {
        $this->profileService = $profileService;
    }

    public function show(Request $request)
    {
        try {
            $user = $this->profileService->getProfileByEmail($request->query('email'));
            return response()->json($user);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 400);
        }
    }

    public function update(Request $request)
    {
        // Use 'original_email' to find the user, in case they are changing their email address
        $emailToFind = $request->input('original_email') ?? $request->input('email');
        
        try {
            // Find the user to get their ID for the validation rule
            $user = $this->profileService->getProfileByEmail($emailToFind);
        } catch (Exception $e) {
            // 🌟 Preserved your exact custom debug line!
            return response()->json([
                'message' => "User not found. Laravel searched for email: '" . $emailToFind . "'"
            ], 401);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'ic' => 'nullable|string|max:20',
            // Ensure the new email is unique, ignoring their own ID
            'email' => 'required|email|unique:users,email,' . $user->id, 
            'phone_number' => 'nullable|string|max:50',
            'house_address' => 'nullable|string',
            'wallet_address' => 'nullable|string|max:255',
            'rental_preferences' => 'nullable|string',
        ]);

        try {
            $this->profileService->updateProfile($user->id, $validated);
            return response()->json(['message' => 'Profile updated successfully']);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
}