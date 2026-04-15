<?php
namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Contract;
use Illuminate\Http\Request;
use Carbon\Carbon;

class TransactionController extends Controller
{
    // Fetches what the tenant owes right now
    public function getBillingDetails($tenantId)
    {
        $contract = Contract::with(['property', 'landlord'])->where('tenant_id', $tenantId)->where('status', 'Active')->first();
        
        if (!$contract) return response()->json(['message' => 'No active contract found'], 404);

        $history = Transaction::where('contract_id', $contract->id)->orderBy('created_at', 'desc')->get();
        
        $isFirstPayment = true;
        $normalPaymentCount = 0;

        foreach ($history as $tx) {
            if ($tx->type === 'Initial Deposit & Rent') $isFirstPayment = false;
            elseif ($tx->type === 'Monthly Rent & Utilities') $normalPaymentCount++;
        }

        $startDate = Carbon::parse($contract->start_date);

        if ($isFirstPayment) {
            $totalDue = $contract->rent_amount + $contract->security_deposit + $contract->utilities_deposit;
            $endOfFirstMonth = $startDate->copy()->addMonth()->subDay();
            $period = $startDate->format('M j, Y') . ' - ' . $endOfFirstMonth->format('M j, Y');

            return response()->json([
                'is_first' => true, 'contract' => $contract, 
                'rent' => $contract->rent_amount, 'sec_dep' => $contract->security_deposit, 
                'util_dep' => $contract->utilities_deposit, 'total' => $totalDue, 
                'type' => 'Initial Deposit & Rent', 'period' => $period, 'history' => $history
            ]);
        } else {
            $monthlyUtil = 150.00;
            $totalDue = $contract->rent_amount + $monthlyUtil;
            $targetStart = $startDate->copy()->addMonths($normalPaymentCount + 1);
            $targetEnd = $targetStart->copy()->addMonth()->subDay();
            $period = $targetStart->format('M j, Y') . ' - ' . $targetEnd->format('M j, Y');

            return response()->json([
                'is_first' => false, 'contract' => $contract, 
                'rent' => $contract->rent_amount, 'util' => $monthlyUtil, 
                'total' => $totalDue, 'type' => 'Monthly Rent & Utilities', 
                'period' => $period, 'history' => $history
            ]);
        }
    }

    // Records the successful Web3 payment
    public function storePayment(Request $request)
    {
        $validated = $request->validate([
            'tenant_id' => 'required', 'landlord_id' => 'required', 'property_id' => 'required',
            'contract_id' => 'required', 'amount' => 'required', 'type' => 'required',
            'billing_period' => 'required', 'blockchain_hash' => 'required'
        ]);

        $validated['status'] = 'Completed';
        $transaction = Transaction::create($validated);

        return response()->json(['message' => 'Payment recorded!', 'data' => $transaction], 201);
    }

    // Fetches all transactions for the List view
    public function index(Request $request)
    {
        $userId = $request->query('user_id');
        $role = $request->query('role');
        $column = ($role === 'tenant') ? 'tenant_id' : 'landlord_id';

        $txs = Transaction::with(['property'])->where($column, $userId)->orderBy('created_at', 'desc')->get();
        return response()->json($txs);
    }

    // Fetches a single transaction for the Details view
    public function show($id)
    {
        $tx = Transaction::with(['property', 'tenant', 'landlord', 'contract'])->find($id);
        if (!$tx) return response()->json(['message' => 'Not found'], 404);
        return response()->json($tx);
    }
}