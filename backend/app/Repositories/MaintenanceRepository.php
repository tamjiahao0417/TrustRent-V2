<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;

class MaintenanceRepository
{
    public function getByRole($userId, $role)
    {
        $query = DB::table('maintenance_issues')
            ->join('properties', 'maintenance_issues.property_id', '=', 'properties.id')
            ->select('maintenance_issues.*', 'properties.address as property_address')
            ->orderBy('maintenance_issues.updated_at', 'desc');

        if ($role === 'tenant') {
            $query->where('maintenance_issues.tenant_id', $userId);
        } else if ($role === 'landlord') {
            $query->where('maintenance_issues.landlord_id', $userId);
        }

        return $query->get();
    }

    public function getById($id)
    {
        return DB::table('maintenance_issues')
            ->join('properties', 'maintenance_issues.property_id', '=', 'properties.id')
            ->join('users', 'maintenance_issues.tenant_id', '=', 'users.id')
            ->select('maintenance_issues.*', 'properties.address as property_address', 'users.name as tenant_name')
            ->where('maintenance_issues.id', $id)
            ->first();
    }

    public function getBasicById($id)
    {
        return DB::table('maintenance_issues')->where('id', $id)->first();
    }

    public function delete($id)
    {
        return DB::table('maintenance_issues')->where('id', $id)->delete();
    }

    public function getActivePropertiesByTenant($userId)
    {
        return DB::table('contracts')
            ->join('properties', 'contracts.property_id', '=', 'properties.id')
            ->where('contracts.tenant_id', $userId)
            ->where('contracts.status', 'Active')
            ->select('properties.id as property_id', 'contracts.landlord_id', 'properties.address')
            ->get();
    }

    public function create(array $data)
    {
        $data['created_at'] = now();
        $data['updated_at'] = now();
        return DB::table('maintenance_issues')->insert($data);
    }

    public function updateStatus($id, $status, $latestUpdate)
    {
        return DB::table('maintenance_issues')
            ->where('id', $id)
            ->update([
                'status' => $status,
                'latest_update' => $latestUpdate,
                'updated_at' => now()
            ]);
    }

    public function update($id, array $data)
    {
        $data['updated_at'] = now();
        return DB::table('maintenance_issues')
            ->where('id', $id)
            ->update($data);
    }
}