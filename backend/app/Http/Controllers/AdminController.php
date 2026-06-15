<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminController extends Controller
{
    // Fetch all users for the table
    public function getUsers(Request $request)
    {
        // 🌟 Explicitly grab the user using the Sanctum guard we proved works!
        $user = $request->user('sanctum');

        if (!$user) {
            return response()->json(['message' => 'User not found or token invalid.'], 401);
        }

        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized access.'], 403);
        }

        $users = User::where('role', '!=', 'admin')->orderBy('id', 'asc')->get();
        return response()->json($users);
    }

    // NF Step 5: System changes the user's status to "Suspended"
    public function suspendUser($id)
    {
        try {
            $user = User::find($id);
            
            if (!$user) {
                return response()->json(['message' => 'User not found.'], 404);
            }

            // Update the status in the database
            $user->status = 'Suspended'; 
            $user->save();

            // 🌟 THE FIX: Instantly destroy all active login sessions for this user!
            $user->tokens()->delete();

            return response()->json(['message' => 'User suspended successfully.']);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to suspend account. Please try again later.'
            ], 500);
        }
    }

    // Add this right below your suspendUser method
    public function activateUser($id)
    {
        try {
            $user = User::find($id);
            
            if (!$user) {
                return response()->json(['message' => 'User not found.'], 404);
            }

            // Update the status back to Active
            $user->status = 'Active'; 
            $user->save();

            return response()->json(['message' => 'User activated successfully.']);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to activate account. Please try again later.'
            ], 500);
        }
    }
}