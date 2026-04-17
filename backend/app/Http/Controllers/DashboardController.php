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
                    'properties.image_path as property_image', // 🌟 FIXED COLUMN NAME
                    'landlords.name as landlord_name'
                )
                ->orderBy('contracts.created_at', 'desc')
                ->get();

            $nearestExpiry = null;
            foreach ($activeContracts as $contract) {
                // 🌟 EXTRACT FIRST IMAGE FROM JSON ARRAY
                $images = json_decode($contract->property_image, true);
                $contract->property_image = (is_array($images) && count($images) > 0) ? $images[0] : null;

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
                'activeContracts' => $activeContracts,
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

            $rentedProperties = DB::table('contracts')
                ->join('properties', 'contracts.property_id', '=', 'properties.id')
                ->join('users as tenants', 'contracts.tenant_id', '=', 'tenants.id')
                ->where('contracts.landlord_id', $userId)
                ->where('contracts.status', 'Active')
                ->select(
                    'properties.title', 
                    'properties.address', 
                    'properties.image_path as property_image', // 🌟 FIXED COLUMN NAME
                    'tenants.email as tenant_email', 
                    'contracts.rent_amount'
                )
                ->orderBy('contracts.created_at', 'desc')
                ->get();

            // 🌟 EXTRACT FIRST IMAGE FROM JSON ARRAY FOR LANDLORDS
            foreach ($rentedProperties as $prop) {
                $images = json_decode($prop->property_image, true);
                $prop->property_image = (is_array($images) && count($images) > 0) ? $images[0] : null;
            }

            return response()->json([
                'totalProperties' => $totalProperties,
                'activeTenants' => $activeTenants,
                'monthlyRevenue' => $monthlyRevenue,
                'rentedProperties' => $rentedProperties
            ]);
        }

        return response()->json(['error' => 'Invalid role'], 400);
    }
}