<?php

namespace App\Http\Controllers;

use App\Models\RentalRequest;
use Illuminate\Http\Request;

class RentalRequestController extends Controller
{
    // 1. Submit a new request (Replaces create_rental_request_controller)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'property_id' => 'required|exists:properties,id',
            'landlord_id' => 'required|exists:users,id',
            'tenant_id' => 'required|exists:users,id',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after:start_date', // Must be after start date
            'move_in_date' => 'required|date|after_or_equal:start_date', 
            'notes' => 'nullable|string'
        ]);

        // Duplicate Check (Replaces hasPendingRequest)
        $exists = RentalRequest::where('tenant_id', $validated['tenant_id'])
            ->where('property_id', $validated['property_id'])
            ->whereIn('status', ['Pending', 'In Progress'])
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'You already have a pending request for this property.'], 409);
        }

        $validated['status'] = 'Pending';
        $rentalRequest = RentalRequest::create($validated);

        return response()->json(['message' => 'Rental request sent successfully!', 'data' => $rentalRequest], 201);
    }

    // 2. Fetch list for Tenant or Landlord (Replaces getTenantRentalRequests / getLandlordRentalRequests)
    public function index(Request $request)
    {
        $userId = $request->query('user_id');
        $role = $request->query('role');

        $query = RentalRequest::with(['property', 'landlord', 'tenant']);

        if ($role === 'tenant') {
            $query->where('tenant_id', $userId);
        } else {
            $query->where('landlord_id', $userId);
        }

        $requests = $query->orderBy('created_at', 'desc')->get();
        return response()->json($requests);
    }

    // 3. View Details (Replaces getRentalRequestDetails)
    public function show($id)
    {
        $rentalRequest = RentalRequest::with(['property', 'landlord', 'tenant'])->find($id);

        if (!$rentalRequest) return response()->json(['message' => 'Not found'], 404);
        
        return response()->json($rentalRequest);
    }

    // 4. Edit Request (Replaces update_rental_request_controller)
    public function update(Request $request, $id)
    {
        $rentalRequest = RentalRequest::where('id', $id)->where('status', 'Pending')->first();
        if (!$rentalRequest) return response()->json(['message' => 'Cannot edit this request'], 403);

        $validated = $request->validate([
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after:start_date',
            'move_in_date' => 'required|date|after_or_equal:start_date',
            'notes' => 'nullable|string'
        ]);

        $rentalRequest->update($validated);
        return response()->json(['message' => 'Updated successfully']);
    }

    // 5. Delete Request (Replaces delete_rental_request_controller)
    public function destroy($id, Request $request)
    {
        $tenantId = $request->query('user_id');
        $rentalRequest = RentalRequest::where('id', $id)
            ->where('tenant_id', $tenantId)
            ->where('status', 'Pending')
            ->first();

        if (!$rentalRequest) return response()->json(['message' => 'Unable to delete'], 403);

        $rentalRequest->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }

    // 6. Update Status (Landlord Only - Replaces update_rental_request_status_controller)
    public function updateStatus(Request $request, $id)
    {
        $rentalRequest = RentalRequest::find($id);
        if (!$rentalRequest) return response()->json(['message' => 'Not found'], 404);

        $validated = $request->validate(['status' => 'required|in:Approved,Rejected,Completed']);
        
        $rentalRequest->update(['status' => $validated['status']]);
        return response()->json(['message' => 'Status updated']);
    }
}