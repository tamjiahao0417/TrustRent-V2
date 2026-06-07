<?php

namespace App\Http\Controllers;

use App\Services\RentalRequestService;
use Illuminate\Http\Request;
use Exception;

class RentalRequestController extends Controller
{
    protected RentalRequestService $rentalRequestService;

    // Inject the Business Logic Service
    public function __construct(RentalRequestService $rentalRequestService)
    {
        $this->rentalRequestService = $rentalRequestService;
    }

    // 1. Submit a new request
    public function store(Request $request)
    {
        $validated = $request->validate([
            'property_id' => 'required|exists:properties,id',
            'landlord_id' => 'required|exists:users,id',
            'tenant_id' => 'required|exists:users,id',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after:start_date',
            'move_in_date' => 'required|date|after_or_equal:start_date', 
            'notes' => 'nullable|string'
        ]);

        try {
            $rentalRequest = $this->rentalRequestService->createRentalRequest($validated);
            return response()->json([
                'message' => 'Rental request sent successfully!', 
                'data' => $rentalRequest
            ], 201);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 500);
        }
    }

    // 2. Fetch list for Tenant or Landlord
    public function index(Request $request)
    {
        $userId = $request->query('user_id');
        $role = $request->query('role');

        $requests = $this->rentalRequestService->getRentalRequests($userId, $role);
        
        return response()->json($requests);
    }

    // 3. View Details
    public function show($id)
    {
        try {
            $rentalRequest = $this->rentalRequestService->getRentalRequestDetails($id);
            return response()->json($rentalRequest);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 404);
        }
    }

    // 4. Edit Request
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after:start_date',
            'move_in_date' => 'required|date|after_or_equal:start_date',
            'notes' => 'nullable|string'
        ]);

        try {
            $this->rentalRequestService->updateRentalRequest($id, $validated);
            return response()->json(['message' => 'Updated successfully']);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 403);
        }
    }

    // 5. Delete Request
    public function destroy($id, Request $request)
    {
        $tenantId = $request->query('user_id');

        try {
            $this->rentalRequestService->deleteRentalRequest($id, $tenantId);
            return response()->json(['message' => 'Deleted successfully']);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 403);
        }
    }

    // 6. Update Status (Landlord Only)
    public function updateStatus(Request $request, $id)
    {
        $newStatus = $request->input('status');

        try {
            $this->rentalRequestService->updateStatus($id, $newStatus);
            return response()->json(['message' => 'Status updated successfully']);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 400);
        }
    }
}