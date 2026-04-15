<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        // Get the email from the URL parameters
        $email = $request->query('email');

        if (!$email) {
            return response()->json(['message' => 'No email provided'], 400);
        }

        $user = DB::table('users')->where('email', $email)->first();
        
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        return response()->json($user);
    }

    public function update(Request $request)
    {
        // Use 'original_email' to find the user, in case they are changing their email address
        $emailToFind = $request->input('original_email') ?? $request->input('email');
        
        $user = DB::table('users')->where('email', $emailToFind)->first();

        if (!$user) {
            // CHANGE THIS LINE to print the email on the screen!
            return response()->json([
                'message' => "User not found. Laravel searched for email: '" . $emailToFind . "'"
            ], 401);
        }

        $userId = $user->id;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'ic' => 'nullable|string|max:20',
            // Ensure the new email is unique, ignoring their own ID
            'email' => 'required|email|unique:users,email,' . $userId, 
            'phone_number' => 'nullable|string|max:50',
            'house_address' => 'nullable|string',
            'wallet_address' => 'nullable|string|max:255',
        ]);

        DB::table('users')->where('id', $userId)->update([
            'name' => $validated['name'],
            'ic' => $validated['ic'],
            'email' => $validated['email'],
            'phone_number' => $validated['phone_number'],
            'house_address' => $validated['house_address'],
            'wallet_address' => $validated['wallet_address'],
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Profile updated successfully']);
    }
}