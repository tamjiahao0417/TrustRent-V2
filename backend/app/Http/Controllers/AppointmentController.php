<?php

namespace App\Http\Controllers;

use App\Services\AppointmentService;
use Illuminate\Http\Request;
use Exception;

class AppointmentController extends Controller
{
    protected AppointmentService $appointmentService;

    // Inject the Business Logic Service
    public function __construct(AppointmentService $appointmentService)
    {
        $this->appointmentService = $appointmentService;
    }

    public function index(Request $request)
    {
        $userId = $request->query('user_id');
        $role = $request->query('role');

        $appointments = $this->appointmentService->getAppointments($userId, $role);
        
        return response()->json($appointments);
    }

    public function store(Request $request)
    {
        // Presentation Layer handles basic data validation
        $validated = $request->validate([
            'property_id' => 'required|exists:properties,id',
            'landlord_id' => 'required|exists:users,id',
            'tenant_id' => 'required|exists:users,id',
            'appointment_date' => 'required|date|after_or_equal:today',
            'appointment_time' => 'required',
            'appointment_type' => 'required|in:Physical,Virtual',
        ]);

        try {
            $appointment = $this->appointmentService->createAppointment($validated);
            
            return response()->json([
                'message' => 'Appointment requested successfully!',
                'appointment' => $appointment
            ], 201);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 500);
        }
    }

    public function show($id)
    {
        // try {
        //     $appointment = $this->appointmentService->getAppointmentDetails($id);
        //     return response()->json($appointment);
        // } catch (Exception $e) {
        //     return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 404);
        // }
        return response()->json(['received_id' => $id]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'appointment_date' => 'required|date|after_or_equal:today',
            'appointment_time' => 'required',
            'appointment_type' => 'required|in:Physical,Virtual',
        ]);

        try {
            $this->appointmentService->updateAppointment($id, $validated);
            return response()->json(['message' => 'Appointment updated successfully']);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 500);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:Approved,Rejected'
        ]);

        try {
            $this->appointmentService->updateAppointmentStatus($id, $validated['status']);
            return response()->json(['message' => 'Status updated successfully']);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 404);
        }
    }

    public function destroy($id)
    {
        try {
            $this->appointmentService->deleteAppointment($id);
            return response()->json(['message' => 'Appointment deleted successfully']);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 404);
        }
    }
}