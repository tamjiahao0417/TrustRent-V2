<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function getStats(Request $request)
    {
        $userId = $request->query('user_id');
        $role = $request->query('role');

        if (!$userId || !$role) {
            return response()->json(['error' => 'Missing user ID or role'], 400);
        }

        /* ================================================= */
        /* 🏠 TENANT LOGIC                                   */
        /* ================================================= */
        if ($role === 'tenant') {
            // 🌟 Use get() to fetch ALL active contracts
            $activeContracts = DB::table('contracts')
                ->join('properties', 'contracts.property_id', '=', 'properties.id')
                ->join('users as landlords', 'contracts.landlord_id', '=', 'landlords.id')
                ->where('contracts.tenant_id', $userId)
                ->where('contracts.status', 'Active')
                ->select(
                    'contracts.end_date', 
                    'contracts.rent_amount',
                    'properties.title as property_title', 
                    'properties.address as property_address', 
                    'properties.thumbnail as property_image', // 🌟 Change to thumbnail!
                    'landlords.name as landlord_name'
                )
                ->get();

            // Calculate days left for the top stat card (finds the closest expiry)
            $nearestExpiry = null;
            foreach ($activeContracts as $contract) {
                $days = \Carbon\Carbon::now()->diffInDays(\Carbon\Carbon::parse($contract->end_date), false);
                $contract->days_left = $days < 0 ? 0 : floor($days);
                
                if (is_null($nearestExpiry) || $contract->days_left < $nearestExpiry) {
                    $nearestExpiry = $contract->days_left;
                }
            }

            $openIssuesCount = DB::table('maintenance_issues')
                ->where('tenant_id', $userId)
                ->whereIn('status', ['Open', 'In Progress'])
                ->count();

            $pendingPayment = DB::table('transactions')
                ->where('tenant_id', $userId)
                ->where('status', 'Pending')
                ->orderBy('created_at', 'asc')
                ->first();

            return response()->json([
                'activeContracts' => $activeContracts, // 🌟 Now an array!
                'daysLeft' => $nearestExpiry ?? 0,
                'openIssuesCount' => $openIssuesCount,
                'pendingPayment' => $pendingPayment,
            ]);
        }

        /* ================================================= */
        /* 🏢 LANDLORD LOGIC                                 */
        /* ================================================= */
        if ($role === 'landlord') {
            $totalProperties = DB::table('properties')
                ->where('landlord_id', $userId)
                ->count();

            $activeContractsData = DB::table('contracts')
                ->where('landlord_id', $userId)
                ->where('status', 'Active')
                ->get();

            $activeTenants = $activeContractsData->unique('tenant_id')->count();
            $monthlyRevenue = $activeContractsData->sum('rent_amount');

            // 🌟 Use get() to fetch ALL rented properties
            $rentedProperties = DB::table('contracts')
                ->join('properties', 'contracts.property_id', '=', 'properties.id')
                ->join('users as tenants', 'contracts.tenant_id', '=', 'tenants.id')
                ->where('contracts.landlord_id', $userId)
                ->where('contracts.status', 'Active')
                ->select(
                    'properties.title', 
                    'properties.address', 
                    'properties.thumbnail as property_image',
                    'tenants.email as tenant_email', 
                    'contracts.rent_amount'
                )
                ->get(); // 🌟 Just end it right here!

            return response()->json([
                'totalProperties' => $totalProperties,
                'activeTenants' => $activeTenants,
                'monthlyRevenue' => $monthlyRevenue,
                'rentedProperties' => $rentedProperties // 🌟 Now an array!
            ]);
        }

        return response()->json(['error' => 'Invalid role'], 400);
    }
}