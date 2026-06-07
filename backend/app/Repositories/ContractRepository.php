<?php

namespace App\Repositories;

use App\Models\Contract;
use Illuminate\Support\Facades\DB;

class ContractRepository
{
    // Checks if a property already has an ongoing contract
    public function hasActiveContractForProperty($propertyId)
    {
        return DB::table('contracts')
            ->where('property_id', $propertyId)
            ->whereIn('status', ['Draft', 'Pending Tenant', 'Active'])
            ->exists();
    }

    public function create(array $data)
    {
        return Contract::create($data);
    }

    // Cross-table update to mark property as rented
    public function markPropertyAsRented($propertyId)
    {
        DB::table('properties')
            ->where('id', $propertyId)
            ->update(['is_rented' => 1]);
    }

    public function getByRole($userId, $role)
    {
        $query = Contract::with(['property']); // Only need property address for the table

        if ($role === 'landlord') {
            $query->where('landlord_id', $userId);
        } else {
            $query->where('tenant_id', $userId);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    public function getByIdWithRelations($id)
    {
        return Contract::with(['property', 'landlord', 'tenant'])->find($id);
    }

    public function getBasicById($id)
    {
        return Contract::find($id);
    }

    public function update(Contract $contract, array $data)
    {
        $contract->update($data);
        return $contract;
    }
}