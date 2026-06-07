<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\MaintenanceService;
use Exception;

class MaintenanceController extends Controller
{
    protected MaintenanceService $maintenanceService;

    // Inject the Business Logic Service
    public function __construct(MaintenanceService $maintenanceService)
    {
        $this->maintenanceService = $maintenanceService;
    }

    // 1. Get Issues for the Main List
    public function index(Request $request)
    {
        $userId = $request->query('user_id');
        $role = $request->query('role');

        $issues = $this->maintenanceService->getIssues($userId, $role);
        return response()->json($issues);
    }

    // 2. Get specific Issue Details
    public function show($id)
    {
        try {
            $issue = $this->maintenanceService->getIssueDetails($id);
            return response()->json($issue);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], $e->getCode() ?: 404);
        }
    }

    // 3. Delete an Issue (Tenant Only)
    public function destroy(Request $request, $id)
    {
        try {
            $this->maintenanceService->deleteIssue($id, $request->query('user_id'));
            return response()->json(['success' => true]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], $e->getCode() ?: 403);
        }
    }

    // 4. Get Active Properties for the Dropdown
    public function getActiveProperties(Request $request)
    {
        $properties = $this->maintenanceService->getActiveProperties($request->query('user_id'));
        return response()->json($properties);
    }

    // 5. Create a new Issue
    public function store(Request $request)
    {
        try {
            $data = $request->only([
                'tenant_id', 'landlord_id', 'property_id', 
                'category', 'urgency', 'description'
            ]);

            $this->maintenanceService->createIssue($data, $request->file('media'));
            
            return response()->json(['success' => true]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false, 
                'error' => $e->getMessage(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    // 6. Update Issue Status (Landlord Only)
    public function updateStatus(Request $request, $id)
    {
        try {
            $this->maintenanceService->updateIssueStatus(
                $id, 
                $request->input('status'), 
                $request->input('latest_update')
            );
            return response()->json(['success' => true]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    // 7. Update an Issue's text and media (Tenant Only)
    public function update(Request $request, $id)
    {
        try {
            $data = $request->only([
                'landlord_id', 'property_id', 'category', 'urgency', 'description'
            ]);

            $this->maintenanceService->updateIssue(
                $id,
                $request->input('user_id'),
                $data,
                $request->file('media'),
                $request->input('existing_media', '[]')
            );

            return response()->json(['success' => true]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], $e->getCode() ?: 403);
        }
    }
}