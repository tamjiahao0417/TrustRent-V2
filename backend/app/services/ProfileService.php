<?php

namespace App\Services;

use App\Repositories\ProfileRepository;
use Exception;

class ProfileService
{
    protected ProfileRepository $repository;

    public function __construct(ProfileRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getProfileByEmail($email)
    {
        if (!$email) {
            throw new Exception('No email provided', 400);
        }

        $user = $this->repository->findByEmail($email);
        
        if (!$user) {
            throw new Exception('User not found', 404);
        }

        return $user;
    }

    public function updateProfile($userId, array $data)
    {
        return $this->repository->update($userId, $data);
    }
}