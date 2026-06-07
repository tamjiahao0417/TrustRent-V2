<?php

namespace App\Repositories;

use App\Models\Appointment;

class AppointmentRepository
{
    public function getByRole($userId, $role)
    {
        $query = Appointment::with(['property', 'landlord', 'tenant']);
        
        if ($role === 'tenant') {
            $query->where('tenant_id', $userId);
        } else {
            $query->where('landlord_id', $userId);
        }

        return $query->orderBy('appointment_date', 'asc')
                     ->orderBy('appointment_time', 'asc')
                     ->get();
    }

    public function getById($id)
    {
        return Appointment::with(['property', 'landlord', 'tenant'])->find($id);
    }

    public function checkConflict($propertyId, $date, $time, $excludeId = null)
    {
        $query = Appointment::where('property_id', $propertyId)
            ->where('appointment_date', $date)
            ->where('appointment_time', $time)
            ->where('status', '!=', 'Rejected');

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->exists();
    }

    public function create(array $data)
    {
        return Appointment::create($data);
    }

    public function update($id, array $data)
    {
        $appointment = Appointment::find($id);
        if ($appointment) {
            $appointment->update($data);
            return $appointment;
        }
        return null;
    }

    public function delete($id)
    {
        $appointment = Appointment::find($id);
        if ($appointment) {
            return $appointment->delete();
        }
        return false;
    }
}