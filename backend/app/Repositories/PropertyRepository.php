<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;

class PropertyRepository
{
    public function getByLandlordId($userId)
    {
        return DB::table('properties')
            ->where('landlord_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getAll()
    {
        return DB::table('properties')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getById($id)
    {
        return DB::table('properties')->where('id', $id)->first();
    }

    public function create(array $data)
    {
        $allowedColumns = [
            'landlord_id', 'title', 'description', 'location', 
            'price', 'rooms', 'address', 'phone_number', 'image_path'
        ];

        $cleanData = array_intersect_key($data, array_flip($allowedColumns));

        // 🚨 I REMOVED THE TIMESTAMPS HERE 🚨

        $id = DB::table('properties')->insertGetId($cleanData);
        return $this->getById($id);
    }

    public function update($id, array $data)
    {
        $allowedColumns = [
            'title', 'description', 'location', 'price', 
            'rooms', 'address', 'phone_number', 'image_path'
        ];

        $cleanData = array_intersect_key($data, array_flip($allowedColumns));
        
        // 🚨 I REMOVED THE TIMESTAMPS HERE 🚨
        
        DB::table('properties')->where('id', $id)->update($cleanData);
        
        return $this->getById($id);
    }

    public function delete($id, $userId)
    {
        return DB::table('properties')
            ->where('id', $id)
            ->where('landlord_id', $userId)
            ->delete();
    }

    public function isPropertyRented($propertyId)
    {
        // Checks if an active contract exists for this property
        return DB::table('contracts')
            ->where('property_id', $propertyId)
            ->where('status', 'Active')
            ->exists();
    }
}