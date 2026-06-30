<?php

namespace App\Services;

use App\Repositories\ChatRepository;
use Exception;

class ChatService
{
    protected ChatRepository $repository;

    public function __construct(ChatRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getContactsList($userId, $role)
    {
        if (!$userId || !$role) {
            throw new Exception('Missing user ID or role', 400);
        }

        // Logic: Tenant sees Landlords, Landlord sees Tenants
        $targetRole = ($role === 'tenant') ? 'landlord' : 'tenant';
        
        return $this->repository->getContactsByRole($targetRole);
    }

    public function getChatHistory($userId, $contactId)
    {
        if (!$userId || !$contactId) {
            throw new Exception('Missing IDs', 400);
        }

        return $this->repository->getConversation($userId, $contactId);
    }

    public function sendMessage(array $data)
    {
        return $this->repository->createMessage([
            'sender_id' => $data['sender_id'],
            'receiver_id' => $data['receiver_id'],
            'message' => $data['message']
        ]);
    }
}