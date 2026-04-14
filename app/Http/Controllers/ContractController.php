<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ContractController extends Controller
{
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
}