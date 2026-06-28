<?php

namespace App\Services;

use App\Repositories\RentalRequestRepository;
use Exception;

class RentalRequestService
{
    protected RentalRequestRepository $repository;

    public function __construct(RentalRequestRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getRentalRequests($userId, $role)
    {
        return $this->repository->getByRole($userId, $role);
    }

    public function getRentalRequestDetails($id)
    {
        $request = $this->repository->getById($id);
        
        if (!$request) {
            throw new Exception('Not found', 404);
        }
        
        return $request;
    }

    public function createRentalRequest(array $data)
    {
        // Business Rule: No duplicate pending requests allowed
        if ($this->repository->checkDuplicatePending($data['tenant_id'], $data['property_id'])) {
            throw new Exception('You already have a pending request for this property.', 409);
        }

        $data['status'] = 'Pending';
        return $this->repository->create($data);
    }

    public function updateRentalRequest($id, array $data)
    {
        // Business Rule: Can only edit Pending requests
        $request = $this->repository->getPendingById($id);
        
        if (!$request) {
            throw new Exception('Cannot edit this request', 403);
        }
        
        return $this->repository->update($request, $data);
    }

    public function deleteRentalRequest($id, $tenantId)
    {
        // Business Rule: Can only delete your own pending request
        $request = $this->repository->getPendingByIdAndTenant($id, $tenantId);
        
        if (!$request) {
            throw new Exception('Unable to delete', 403);
        }

        return $this->repository->delete($request);
    }

    public function updateStatus($id, $newStatus)
    {
        $rentalRequest = $this->repository->getBasicById($id);
        
        if (!$rentalRequest) {
            throw new Exception('Request not found', 404);
        }

        // 🌟 Business Logic: Landlord Approval Sequence
        if ($newStatus === 'Approved') {
            
            // Check 1: Does property already have a contract?
            if ($this->repository->hasExistingContract($rentalRequest->property_id)) {
                throw new Exception('Cannot approve: This property already has an ongoing contract!', 400);
            }

            // Check 2: Did landlord already approve someone else?
            if ($this->repository->hasApprovedRequest($rentalRequest->property_id)) {
                throw new Exception('Cannot approve: You already approved a different tenant for this property!', 400);
            }

            // Execute: Auto-reject everyone else
            $this->repository->rejectOtherPendingRequests($rentalRequest->property_id, $id);
        }

        // Apply the new status
        $this->repository->updateStatus($id, $newStatus);
        
        return true;
    }
}