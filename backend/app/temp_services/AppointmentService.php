<?php

namespace App\Services;

use App\Repositories\AppointmentRepository;
use Exception;

class AppointmentService
{
    protected AppointmentRepository $repository;

    // Inject the Data Access Layer
    public function __construct(AppointmentRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getAppointments($userId, $role)
    {
        return $this->repository->getByRole($userId, $role);
    }

    public function getAppointmentDetails($id)
    {
        $appointment = $this->repository->getById($id);
        
        if (!$appointment) {
            throw new Exception('Appointment not found', 404);
        }
        return $appointment;
    }

    public function createAppointment(array $data)
    {
        // 1. Business Logic: Check for conflicts
        $conflict = $this->repository->checkConflict(
            $data['property_id'],
            $data['appointment_date'],
            $data['appointment_time']
        );

        if ($conflict) {
            throw new Exception('Selected time slot is no longer available. Please choose another.', 409);
        }

        // 2. Set default status
        $data['status'] = 'Pending';
        
        return $this->repository->create($data);
    }

    public function updateAppointment($id, array $data)
    {
        // 1. Get existing appointment to find the property_id
        $existing = $this->repository->getById($id);
        if (!$existing) {
            throw new Exception('Appointment not found', 404);
        }

        // 2. Business Logic: Check for conflicts (excluding current appointment)
        $conflict = $this->repository->checkConflict(
            $existing->property_id,
            $data['appointment_date'],
            $data['appointment_time'],
            $id
        );

        if ($conflict) {
            throw new Exception('The new time slot is already taken. Please choose another.', 409);
        }

        // 3. Reset status to Pending if the tenant edits it
        $data['status'] = 'Pending';
        
        return $this->repository->update($id, $data);
    }

    public function updateAppointmentStatus($id, $status)
    {
        $existing = $this->repository->getById($id);
        if (!$existing) {
            throw new Exception('Appointment not found', 404);
        }

        return $this->repository->update($id, ['status' => $status]);
    }

    public function deleteAppointment($id)
    {
        $deleted = $this->repository->delete($id);
        if (!$deleted) {
            throw new Exception('Appointment not found', 404);
        }
        return true;
    }
}