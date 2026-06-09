<?php

namespace App\Services;

use App\Repositories\UserRepository;
use Illuminate\Support\Facades\Hash;
use Exception;

class AuthService
{
    protected UserRepository $repository;

    public function __construct(UserRepository $repository)
    {
        $this->repository = $repository;
    }

    public function registerUser(array $data)
    {
        // 1. Business Rule: Prevent duplicate emails
        $existingUser = $this->repository->findByEmail($data['email']);
        if ($existingUser) {
            throw new Exception('An account with this email already exists.', 400);
        }

        // 2. Hash the password securely
        $data['password'] = Hash::make($data['password']);

        return $this->repository->create($data);
    }

    public function loginUser(array $credentials)
    {
        $user = $this->repository->findByEmail($credentials['email']);

        // 1. Verify user exists and password is correct
        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            throw new Exception('Invalid email or password.', 401);
        }

        // 2. Generate Sanctum token
        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token
        ];
    }

    public function getUserDetails($userId)
    {
        $user = $this->repository->findById($userId);
        
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