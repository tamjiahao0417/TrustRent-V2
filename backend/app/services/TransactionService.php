<?php

namespace App\Services;

use App\Repositories\TransactionRepository;
use Carbon\Carbon;
use Exception;

class TransactionService
{
    protected TransactionRepository $repository;

    public function __construct(TransactionRepository $repository)
    {
        $this->repository = $repository;
    }

    public function calculateBillingDetails($tenantId)
    {
        $contract = $this->repository->getActiveContractByTenant($tenantId);
        
        if (!$contract) {
            throw new Exception('No active contract found', 404);
        }

        $history = $this->repository->getHistoryByContract($contract->id);
        
        $isFirstPayment = true;
        $normalPaymentCount = 0;

        // Determine payment state based on history
        foreach ($history as $tx) {
            if ($tx->type === 'Initial Deposit & Rent') $isFirstPayment = false;
            elseif ($tx->type === 'Monthly Rent & Utilities') $normalPaymentCount++;
        }

        $startDate = Carbon::parse($contract->start_date);

        if ($isFirstPayment) {
            $totalDue = $contract->rent_amount + $contract->security_deposit + $contract->utilities_deposit;
            $endOfFirstMonth = $startDate->copy()->addMonth()->subDay();
            $period = $startDate->format('M j, Y') . ' - ' . $endOfFirstMonth->format('M j, Y');

            return [
                'is_first' => true, 'contract' => $contract, 
                'rent' => $contract->rent_amount, 'sec_dep' => $contract->security_deposit, 
                'util_dep' => $contract->utilities_deposit, 'total' => $totalDue, 
                'type' => 'Initial Deposit & Rent', 'period' => $period, 'history' => $history
            ];
        } else {
            $monthlyUtil = 150.00;
            $totalDue = $contract->rent_amount + $monthlyUtil;
            
            $targetStart = $startDate->copy()->addMonths($normalPaymentCount + 1);
            $targetEnd = $targetStart->copy()->addMonth()->subDay();
            $period = $targetStart->format('M j, Y') . ' - ' . $targetEnd->format('M j, Y');

            return [
                'is_first' => false, 'contract' => $contract, 
                'rent' => $contract->rent_amount, 'util' => $monthlyUtil, 
                'total' => $totalDue, 'type' => 'Monthly Rent & Utilities', 
                'period' => $period, 'history' => $history
            ];
        }
    }

    public function recordPayment(array $data)
    {
        $data['status'] = 'Completed';
        return $this->repository->create($data);
    }

    public function getTransactionsList($user)
    {
        // Branch logic based on the user's role
        if ($user->role === 'admin') {
            return $this->repository->getAll();
        } else if ($user->role === 'landlord') {
            return $this->repository->getByLandlord($user->id);
        } else {
            return $this->repository->getByTenant($user->id);
        }
    }

    public function getTransactionDetails($id, $user)
    {
        $tx = $this->repository->getByIdWithRelations($id);
        
        if (!$tx) {
            throw new Exception('Not found', 404);
        }

        // SECURITY CHECK: Block access UNLESS they are an Admin, or the specific Tenant/Landlord involved
        if ($user->role !== 'admin' && $user->id !== $tx->tenant_id && $user->id !== $tx->landlord_id) {
            throw new Exception('Unauthorized access.', 403);
        }

        return $tx;
    }
}