<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\ContractService;
use Exception;

class ContractController extends Controller
{
    protected ContractService $contractService;

    // Inject the Business Logic Service
    public function __construct(ContractService $contractService)
    {
        $this->contractService = $contractService;
    }

    // 1. Generate new contract
    public function store(Request $request)
    {
        $validated = $request->validate([
            'rental_request_id' => 'required|exists:rental_requests,id',
            'tenant_id' => 'required|exists:users,id',
            'property_id' => 'required|exists:properties,id',
            'landlord_ic' => 'required|string',
            'landlord_address' => 'required|string',
            'tenant_ic' => 'required|string',
            'tenant_address' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date',
            'rent_amount' => 'required|numeric',
            'utilities_deposit' => 'required|numeric',
            'security_deposit' => 'required|numeric',
            'payment_frequency' => 'required|string',
            'due_date' => 'required|string',
            'notice_period' => 'required|numeric',
            'additional_terms' => 'required|string',
            'landlord_signature' => 'required|string'
        ]);

        try {
            $contract = $this->contractService->createContract($request->input('user_id'), $validated);
            return response()->json([
                'message' => 'Contract generated and sent to tenant!', 
                'data' => $contract
            ], 201);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 500);
        }
    }

    // 2. Fetch all contracts for the list page
    public function index(Request $request)
    {
        $userId = $request->query('user_id');
        $role = $request->query('role');

        $contracts = $this->contractService->getContracts($userId, $role);
        return response()->json($contracts);
    }

    // 3. Fetch ONE contract for the A4 Document Page
    public function show($id)
    {
        try {
            $contract = $this->contractService->getContractDetails($id);
            return response()->json($contract);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 404);
        }
    }
    
    // 4. Tenant signs the contract
    public function signTenant(Request $request, $id)
    {
        $validated = $request->validate([
            'tenant_signature' => 'required|string'
        ]);

        try {
            $this->contractService->signTenant($id, $validated['tenant_signature']);
            return response()->json(['message' => 'Contract signed successfully!']);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 404);
        }
    }

    // 5. Tenant requests an edit
    public function requestEdit(Request $request, $id)
    {
        try {
            $this->contractService->requestEdit($id, $request->input('reason'));
            return response()->json(['message' => 'Contract sent back to landlord for edits.']);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 404);
        }
    }

    // 6. Landlord Edits and Re-signs a Draft Contract
    public function reDraft(Request $request, $id)
    {
        $validated = $request->validate([
            'landlord_ic' => 'required|string',
            'landlord_address' => 'required|string',
            'tenant_ic' => 'required|string',
            'tenant_address' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date',
            'rent_amount' => 'required|numeric',
            'utilities_deposit' => 'required|numeric',
            'security_deposit' => 'required|numeric',
            'notice_period' => 'required|numeric',
            'additional_terms' => 'required|string',
            'landlord_signature' => 'required|string'
        ]);

        try {
            $this->contractService->reDraftContract($id, $validated);
            return response()->json(['message' => 'Contract edited, re-signed, and sent to tenant!']);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 500);
        }
    }

    // 7. Seal the contract on the blockchain
    public function seal(Request $request, $id)
    {
        $validated = $request->validate([
            'blockchain_hash' => 'required|string'
        ]);

        try {
            $this->contractService->sealContract($id, $validated['blockchain_hash']);
            return response()->json(['message' => 'Contract successfully sealed on the blockchain!']);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 404);
        }
    }
}