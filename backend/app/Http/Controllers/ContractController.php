<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ContractController extends Controller
{
    public function store(Request $request)
    {
        $existingContract = DB::table('contracts')
            ->where('property_id', $request->input('property_id'))
            ->whereIn('status', ['Draft', 'Pending Tenant', 'Active'])
            ->exists();

        if ($existingContract) {
            return response()->json([
                'message' => 'A contract already exists for this property!'
            ], 400);
        }

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
            'landlord_signature' => 'required|string' // The Base64 Canvas Image
        ]);

        // Calculate lease term in months
        $start = Carbon::parse($validated['start_date']);
        $end = Carbon::parse($validated['end_date']);
        $validated['lease_term'] = $start->diffInMonths($end) . ' months';

        $validated['landlord_id'] = $request->input('user_id');
        $validated['status'] = 'Pending Tenant'; // Skip Draft, go straight to tenant
        $validated['landlord_signed_at'] = now();

        $contract = Contract::create($validated);

        DB::table('properties')
            ->where('id', $request->input('property_id'))
            ->update(['is_rented' => 1]);
            
        return response()->json(['message' => 'Contract generated and sent to tenant!', 'data' => $contract], 201);
    }

    // Fetch all contracts for the list page
    public function index(Request $request)
    {
        $userId = $request->query('user_id');
        $role = $request->query('role');

        $query = Contract::with(['property']); // We only need the property address for the table

        if ($role === 'landlord') {
            $query->where('landlord_id', $userId);
        } else {
            $query->where('tenant_id', $userId);
        }

        return response()->json($query->orderBy('created_at', 'desc')->get());
    }

    // Fetch ONE contract for the A4 Document Page
    public function show($id)
    {
        // THIS is where we fetch the Landlord and Tenant Profile info!
        $contract = Contract::with(['property', 'landlord', 'tenant'])->find($id);
        
        if (!$contract) {
            return response()->json(['message' => 'Contract not found'], 404);
        }
        
        return response()->json($contract);
    }
    
    // Tenant signs the contract
    public function signTenant(Request $request, $id)
    {
        $contract = Contract::find($id);

        if (!$contract) {
            return response()->json(['message' => 'Contract not found'], 404);
        }

        $validated = $request->validate([
            'tenant_signature' => 'required|string'
        ]);

        $contract->update([
            'tenant_signature' => $validated['tenant_signature'],
            'tenant_signed_at' => now(),
            'status' => 'Active' // Move it to Active so the Landlord can seal it!
        ]);

        return response()->json(['message' => 'Contract signed successfully!']);
    }

    // Tenant requests an edit
    public function requestEdit(Request $request, $id)
    {
        $contract = Contract::find($id);

        if (!$contract) {
            return response()->json(['message' => 'Contract not found'], 404);
        }

        // 1. Revert status to Draft
        // 2. Erase the landlord's signature so they have to re-sign the new terms
        $contract->update([
            'status' => 'Draft',
            'landlord_signature' => null,
            'landlord_signed_at' => null
        ]);

        // Note: $request->input('reason') contains the tenant's edit request message!
        // You could save this to a database column or send it via email here.

        return response()->json(['message' => 'Contract sent back to landlord for edits.']);
    }

    // Landlord Edits and Re-signs a Draft Contract
    public function reDraft(Request $request, $id)
    {
        $contract = Contract::find($id);

        if (!$contract) {
            return response()->json(['message' => 'Contract not found'], 404);
        }

        // Security check: Only allow edits if status is Draft
        if ($contract->status !== 'Draft') {
            return response()->json(['message' => 'This contract cannot be edited right now.'], 403);
        }

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
            'landlord_signature' => 'required|string' // The NEW Base64 Canvas Image
        ]);

        // Recalculate lease term in months based on new dates
        $start = \Carbon\Carbon::parse($validated['start_date']);
        $end = \Carbon\Carbon::parse($validated['end_date']);
        $validated['lease_term'] = $start->diffInMonths($end) . ' months';

        // Update the contract, apply the new signature, and push back to Tenant
        $contract->update([
            'landlord_ic' => $validated['landlord_ic'],
            'landlord_address' => $validated['landlord_address'],
            'tenant_ic' => $validated['tenant_ic'],
            'tenant_address' => $validated['tenant_address'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'rent_amount' => $validated['rent_amount'],
            'utilities_deposit' => $validated['utilities_deposit'],
            'security_deposit' => $validated['security_deposit'],
            'notice_period' => $validated['notice_period'],
            'additional_terms' => $validated['additional_terms'],
            'lease_term' => $validated['lease_term'],
            'landlord_signature' => $validated['landlord_signature'],
            'landlord_signed_at' => now(),
            'status' => 'Pending Tenant' // Send back to tenant!
        ]);

        return response()->json(['message' => 'Contract edited, re-signed, and sent to tenant!']);
    }

    // Seal the contract on the blockchain
    public function seal(Request $request, $id)
    {
        $validated = $request->validate([
            'blockchain_hash' => 'required|string'
        ]);

        $contract = Contract::find($id);

        if (!$contract) {
            return response()->json(['message' => 'Contract not found'], 404);
        }

        $contract->update([
            'blockchain_hash' => $validated['blockchain_hash'],
            'status' => 'Active' // Ensure it remains Active
        ]);

        return response()->json(['message' => 'Contract successfully sealed on the blockchain!']);
    }
}