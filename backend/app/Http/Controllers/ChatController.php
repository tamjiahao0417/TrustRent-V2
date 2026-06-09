<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\ChatService;
use Exception;

class ChatController extends Controller
{
    protected ChatService $chatService;

    // Inject the Business Logic Service
    public function __construct(ChatService $chatService)
    {
        $this->chatService = $chatService;
    }

    // 1. Get the list of contacts to show in the sidebar
    public function getContacts(Request $request)
    {
        try {
            $contacts = $this->chatService->getContactsList(
                $request->query('user_id'),
                $request->query('role')
            );
            return response()->json($contacts);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], $e->getCode() ?: 400);
        }
    }

    // 2. Get the chat history between two users
    public function getMessages(Request $request)
    {
        try {
            $messages = $this->chatService->getChatHistory(
                $request->query('user_id'),
                $request->query('contact_id')
            );
            return response()->json($messages);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], $e->getCode() ?: 400);
        }
    }

    // 3. Save a new message to the database
    public function sendMessage(Request $request)
    {
        $validated = $request->validate([
            'sender_id' => 'required|integer',
            'receiver_id' => 'required|integer',
            'message' => 'required|string'
        ]);

        try {
            $message = $this->chatService->sendMessage($validated);
            return response()->json([
                'message' => 'Message sent', 
                'data' => $message
            ], 201);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}