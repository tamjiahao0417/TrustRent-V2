<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ChatController extends Controller
{
    // 1. Get the list of contacts to show in the sidebar
    public function getContacts(Request $request)
    {
        $userId = $request->query('user_id');
        $role = $request->query('role');

        if (!$userId || !$role) {
            return response()->json(['error' => 'Missing user ID or role'], 400);
        }

        // To keep it simple and ensure you always have someone to chat with during testing:
        // If you are a Tenant, you will see all Landlords. If you are a Landlord, you see all Tenants.
        $targetRole = ($role === 'tenant') ? 'landlord' : 'tenant';
        
        $contacts = DB::table('users')
            ->where('role', $targetRole)
            ->select('id', 'name', 'email', 'role')
            ->get();

        return response()->json($contacts);
    }

    // 2. Get the chat history between two users
    public function getMessages(Request $request)
    {
        $userId = $request->query('user_id');
        $contactId = $request->query('contact_id');

        if (!$userId || !$contactId) {
            return response()->json(['error' => 'Missing IDs'], 400);
        }

        // Find messages where User A sent to User B, OR User B sent to User A
        $messages = DB::table('messages')
            ->where(function($query) use ($userId, $contactId) {
                $query->where('sender_id', $userId)
                      ->where('receiver_id', $contactId);
            })
            ->orWhere(function($query) use ($userId, $contactId) {
                $query->where('sender_id', $contactId)
                      ->where('receiver_id', $userId);
            })
            ->orderBy('created_at', 'asc') // Oldest messages at the top, newest at the bottom
            ->get();

        return response()->json($messages);
    }

    // 3. Save a new message to the database
    public function sendMessage(Request $request)
    {
        $request->validate([
            'sender_id' => 'required|integer',
            'receiver_id' => 'required|integer',
            'message' => 'required|string'
        ]);

        $messageId = DB::table('messages')->insertGetId([
            'sender_id' => $request->sender_id,
            'receiver_id' => $request->receiver_id,
            'message' => $request->message,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        $newMessage = DB::table('messages')->where('id', $messageId)->first();

        return response()->json($newMessage, 201);
    }
}