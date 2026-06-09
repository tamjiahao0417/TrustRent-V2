<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ChatRepository
{
    public function getContactsByRole($targetRole)
    {
        return DB::table('users')
            ->where('role', $targetRole)
            ->select('id', 'name', 'email', 'role')
            ->get();
    }

    public function getConversation($userId, $contactId)
    {
        // Find messages where A sent to B, OR B sent to A
        return DB::table('messages')
            ->where(function($query) use ($userId, $contactId) {
                $query->where('sender_id', $userId)
                      ->where('receiver_id', $contactId);
            })
            ->orWhere(function($query) use ($userId, $contactId) {
                $query->where('sender_id', $contactId)
                      ->where('receiver_id', $userId);
            })
            ->orderBy('created_at', 'asc') // Oldest at top, newest at bottom
            ->get();
    }

    public function createMessage(array $data)
    {
        $data['created_at'] = Carbon::now();
        $data['updated_at'] = Carbon::now();

        $id = DB::table('messages')->insertGetId($data);

        return DB::table('messages')->where('id', $id)->first();
    }
}