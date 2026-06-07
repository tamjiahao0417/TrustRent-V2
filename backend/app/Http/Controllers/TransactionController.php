<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\TransactionService;
use Exception;

class TransactionController extends Controller
{
    protected TransactionService $transactionService;

    // Inject the Business Logic Service
    public function __construct(TransactionService $transactionService)
    {
        $this->transactionService = $transactionService;
    }

    // Fetches what the tenant owes right now
    public function getBillingDetails($tenantId)
    {
        try {
            $details = $this->transactionService->calculateBillingDetails($tenantId);
            return response()->json($details);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 400);
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

        try {
            $transaction = $this->transactionService->recordPayment($validated);
            return response()->json(['message' => 'Payment recorded!', 'data' => $transaction], 201);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    // Fetches all transactions for the List view
    public function index(Request $request)
    {
        $user = $request->user('sanctum');

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $txs = $this->transactionService->getTransactionsList($user);
        return response()->json($txs);
    }

    // Fetches a single transaction for the Details view
    public function show(Request $request, $id)
    {
        $user = $request->user('sanctum');

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        try {
            $tx = $this->transactionService->getTransactionDetails($id, $user);
            return response()->json($tx);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 404);
        }
    }
}