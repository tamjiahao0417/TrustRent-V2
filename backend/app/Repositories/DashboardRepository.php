<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;

class DashboardRepository
{
    // --- ADMIN METRICS ---
    public function getTotalUsersCount()
    {
        return DB::table('users')->count();
    }

    public function getOpenReportsCount()
    {
        return DB::table('reports')->where('status', 'Open')->count();
    }

    public function getTotalPropertiesCount()
    {
        return DB::table('properties')->count();
    }

    public function getRecentReports($limit = 5)
    {
        return DB::table('reports')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    // --- TENANT METRICS ---
    public function getActiveContractsByTenant($userId)
    {
        return DB::table('contracts')
            ->join('properties', 'contracts.property_id', '=', 'properties.id')
            ->join('users as landlords', 'contracts.landlord_id', '=', 'landlords.id')
            ->where('contracts.tenant_id', $userId)
            ->where('contracts.status', 'Active')
            ->select(
                'contracts.end_date', 
                'contracts.rent_amount',
                'properties.title as property_title', 
                'properties.address as property_address', 
                'properties.image_path as property_image', 
                'landlords.name as landlord_name',
                'contracts.created_at'
            )
            ->orderBy('contracts.created_at', 'desc')
            ->get();
    }

    public function getOpenMaintenanceIssuesCount($userId)
    {
        return DB::table('maintenance_issues')
            ->where('tenant_id', $userId)
            ->whereIn('status', ['Open', 'In Progress'])
            ->count();
    }

    public function getFirstPendingTransaction($userId)
    {
        return DB::table('transactions')
            ->where('tenant_id', $userId)
            ->where('status', 'Pending')
            ->orderBy('created_at', 'asc')
            ->first();
    }

    // --- LANDLORD METRICS ---
    public function getPropertiesCountByLandlord($userId)
    {
        return DB::table('properties')
            ->where('landlord_id', $userId)
            ->count();
    }

    public function getActiveContractsByLandlord($userId)
    {
        return DB::table('contracts')
            ->where('landlord_id', $userId)
            ->where('status', 'Active')
            ->get();
    }

    public function getRentedPropertiesDetailsByLandlord($userId)
    {
        return DB::table('contracts')
            ->join('properties', 'contracts.property_id', '=', 'properties.id')
            ->join('users as tenants', 'contracts.tenant_id', '=', 'tenants.id')
            ->where('contracts.landlord_id', $userId)
            ->where('contracts.status', 'Active')
            ->select(
                'properties.title', 
                'properties.address', 
                'properties.image_path as property_image', 
                'tenants.email as tenant_email', 
                'contracts.rent_amount'
            )
            ->orderBy('contracts.created_at', 'desc')
            ->get();
    }
}