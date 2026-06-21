<?php

namespace App\Repositories;

use App\Models\Transaction;
use App\Models\Contract;

class TransactionRepository
{
    // Fetches the currently active contract for a tenant
    public function getActiveContractsByTenant($tenantId)
    {
        return Contract::with(['property', 'landlord'])
            ->where('tenant_id', $tenantId)
            ->where('status', 'Active')
            ->get(); // 🌟 FIX: Now it gets ALL contracts!
    }

    // Fetches all past transactions for a specific contract
    public function getHistoryByContract($contractId)
    {
        return Transaction::where('contract_id', $contractId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function create(array $data)
    {
        return Transaction::create($data);
    }

    // For Admin: Get all transactions globally
    public function getAll()
    {
        return Transaction::with(['property', 'tenant', 'landlord'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    // For Landlord: Get received payments
    public function getByLandlord($landlordId)
    {
        return Transaction::with(['property', 'tenant', 'landlord'])
            ->where('landlord_id', $landlordId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    // For Tenant: Get sent payments
    public function getByTenant($tenantId)
    {
        return Transaction::with(['property', 'tenant', 'landlord'])
            ->where('tenant_id', $tenantId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    // Fetch a single transaction with all its relationship data
    public function getByIdWithRelations($id)
    {
        return Transaction::with(['property', 'tenant', 'landlord', 'contract'])->find($id);
    }
}