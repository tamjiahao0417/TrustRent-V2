<?php

namespace App\Repositories;

use App\Models\RentalRequest;
use Illuminate\Support\Facades\DB;

class RentalRequestRepository
{
    public function getByRole($userId, $role)
    {
        $query = RentalRequest::with(['property', 'landlord', 'tenant']);

        if ($role === 'tenant') {
            $query->where('tenant_id', $userId);
        } else {
            $query->where('landlord_id', $userId);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    public function getById($id)
    {
        return RentalRequest::with(['property', 'landlord', 'tenant'])->find($id);
    }

    public function getPendingByIdAndTenant($id, $tenantId)
    {
        return RentalRequest::where('id', $id)
            ->where('tenant_id', $tenantId)
            ->where('status', 'Pending')
            ->first();
    }

    public function getPendingById($id)
    {
        return RentalRequest::where('id', $id)->where('status', 'Pending')->first();
    }

    public function checkDuplicatePending($tenantId, $propertyId)
    {
        return RentalRequest::where('tenant_id', $tenantId)
            ->where('property_id', $propertyId)
            ->whereIn('status', ['Pending', 'In Progress'])
            ->exists();
    }

    public function create(array $data)
    {
        return RentalRequest::create($data);
    }

    public function update(RentalRequest $request, array $data)
    {
        $request->update($data);
        return $request;
    }

    public function delete(RentalRequest $request)
    {
        return $request->delete();
    }

    // --- Helper methods for Landlord Approval Logic using DB facade ---

    public function getBasicById($id)
    {
        return DB::table('rental_requests')->where('id', $id)->first();
    }

    public function hasExistingContract($propertyId)
    {
        return DB::table('contracts')
            ->where('property_id', $propertyId)
            ->whereIn('status', ['Draft', 'Pending Tenant', 'Active'])
            ->exists();
    }

    public function hasApprovedRequest($propertyId)
    {
        return DB::table('rental_requests')
            ->where('property_id', $propertyId)
            ->where('status', 'Approved')
            ->exists();
    }

    public function rejectOtherPendingRequests($propertyId, $excludeId)
    {
        return DB::table('rental_requests')
            ->where('property_id', $propertyId)
            ->where('id', '!=', $excludeId)
            ->where('status', 'Pending')
            ->update(['status' => 'Rejected']);
    }

    public function updateStatus($id, $status)
    {
        return DB::table('rental_requests')->where('id', $id)->update(['status' => $status]);
    }
}