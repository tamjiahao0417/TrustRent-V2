<?php

namespace App\Services;

use App\Repositories\ContractRepository;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Mail;
use App\Mail\ContractSealedMail;

class ContractService
{
    protected ContractRepository $repository;

    public function __construct(ContractRepository $repository)
    {
        $this->repository = $repository;
    }

    public function createContract($landlordId, array $data)
    {
        // Business Rule: One active contract per property
        if ($this->repository->hasActiveContractForProperty($data['property_id'])) {
            throw new Exception('A contract already exists for this property!', 400);
        }

        // Calculate lease term in months
        $start = Carbon::parse($data['start_date']);
        $end = Carbon::parse($data['end_date']);
        $data['lease_term'] = $start->diffInMonths($end) . ' months';

        $data['landlord_id'] = $landlordId;
        $data['status'] = 'Pending Tenant'; // Skip Draft, go straight to tenant
        $data['landlord_signed_at'] = now();

        $contract = $this->repository->create($data);

        // Business Rule: Lock the property
        $this->repository->markPropertyAsRented($data['property_id']);

        return $contract;
    }

    public function getContracts($userId, $role)
    {
        return $this->repository->getByRole($userId, $role);
    }

    public function getContractDetails($id)
    {
        $contract = $this->repository->getByIdWithRelations($id);
        
        if (!$contract) {
            throw new Exception('Contract not found', 404);
        }
        
        return $contract;
    }

    public function signTenant($id, $signature)
    {
        $contract = $this->repository->getBasicById($id);
        if (!$contract) throw new Exception('Contract not found', 404);

        return $this->repository->update($contract, [
            'tenant_signature' => $signature,
            'tenant_signed_at' => now(),
            'status' => 'Active' // Move it to Active so the Landlord can seal it!
        ]);
    }

    public function requestEdit($id, $reason = null)
    {
        $contract = $this->repository->getBasicById($id);
        if (!$contract) throw new Exception('Contract not found', 404);

        // 1. Revert status to Draft
        // 2. Erase the landlord's signature so they have to re-sign the new terms
        return $this->repository->update($contract, [
            'status' => 'Draft',
            'landlord_signature' => null,
            'landlord_signed_at' => null
        ]);
    }

    public function reDraftContract($id, array $data)
    {
        $contract = $this->repository->getBasicById($id);
        if (!$contract) throw new Exception('Contract not found', 404);

        // Security check: Only allow edits if status is Draft
        if ($contract->status !== 'Draft') {
            throw new Exception('This contract cannot be edited right now.', 403);
        }

        // Recalculate lease term in months based on new dates
        $start = Carbon::parse($data['start_date']);
        $end = Carbon::parse($data['end_date']);
        $data['lease_term'] = $start->diffInMonths($end) . ' months';

        $data['landlord_signed_at'] = now();
        $data['status'] = 'Pending Tenant'; // Send back to tenant!

        return $this->repository->update($contract, $data);
    }

    public function sealContract($id, $blockchainHash)
    {
        // 🌟 Changed to WithRelations so we can access $contract->tenant->email
        $contract = $this->repository->getByIdWithRelations($id);
        if (!$contract) throw new Exception('Contract not found', 404);

        $updatedContract = $this->repository->update($contract, [
            'blockchain_hash' => $blockchainHash,
            'status' => 'Active' 
        ]);

        // 🌟 NEW: Send Email to Landlord
        if ($contract->landlord && $contract->landlord->email) {
            Mail::to($contract->landlord->email)->send(new ContractSealedMail($updatedContract));
        }
        
        // 🌟 NEW: Send Email to Tenant
        if ($contract->tenant && $contract->tenant->email) {
            Mail::to($contract->tenant->email)->send(new ContractSealedMail($updatedContract));
        }

        return $updatedContract;
    }
}