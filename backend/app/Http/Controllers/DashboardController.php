<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\DashboardService;
use Exception;

class DashboardController extends Controller
{
    protected DashboardService $dashboardService;

    // Inject the Business Logic Service Layer
    public function __construct(DashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    public function getStats(Request $request)
    {
        $userId = $request->query('user_id');
        $role = $request->query('role');

        if (!$userId || !$role) {
            return response()->json(['error' => 'Missing user ID or role'], 400);
        }

        try {
            $stats = $this->dashboardService->getDashboardStats($userId, $role);
            return response()->json($stats);
        } catch (Exception $e) {
            $statusCode = $e->getCode() === 400 ? 400 : 500;
            return response()->json(['error' => $e->getMessage()], $statusCode);
        }
    }
}