<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    public function store(Request $request)
    {
        // 1. Validation (Replaces your manual empty() and strtotime() checks)
        // after_or_equal:today prevents users from booking in the past
        $validated = $request->validate([
            'property_id' => 'required|exists:properties,id',
            'landlord_id' => 'required|exists:users,id',
            'tenant_id' => 'required|exists:users,id',
            'appointment_date' => 'required|date|after_or_equal:today',
            'appointment_time' => 'required', // Optionally add date_format:H:i
            'appointment_type' => 'required|in:Physical,Virtual',
        ]);

        // 2. Conflict Checking (Replaces your isTimeSlotAvailable method)
        $conflict = Appointment::where('property_id', $validated['property_id'])
            ->where('appointment_date', $validated['appointment_date'])
            ->where('appointment_time', $validated['appointment_time'])
            ->where('status', '!=', 'Rejected') // Ignore rejected appointments
            ->exists();

        if ($conflict) {
            return response()->json([
                'message' => 'Selected time slot is no longer available. Please choose another.'
            ], 409); // 409 Conflict status code
        }

        // 3. Save to Database
        $validated['status'] = 'Pending'; // Default status
        
        $appointment = Appointment::create($validated);

        // 4. Return success response to Angular
        return response()->json([
            'message' => 'Appointment requested successfully!',
            'appointment' => $appointment
        ], 201); // 201 Created status code
    }

    public function index(Request $request)
    {
        $userId = $request->query('user_id');
        $role = $request->query('role');

        // Query builder using the Appointment model
        $query = Appointment::with(['property', 'landlord', 'tenant']);

        if ($role === 'tenant') {
            $query->where('tenant_id', $userId);
        } else {
            $query->where('landlord_id', $userId);
        }

        $appointments = $query->orderBy('appointment_date', 'asc')
                            ->orderBy('appointment_time', 'asc')
                            ->get();

        return response()->json($appointments);
    }

    // Fetch specific appointment details
    public function show($id)
    {
        $appointment = Appointment::with(['property', 'landlord', 'tenant'])->find($id);

        if (!$appointment) {
            return response()->json(['message' => 'Appointment not found'], 404);
        }

        return response()->json($appointment);
    }

    // Delete/Cancel an appointment
    public function destroy($id)
    {
        $appointment = Appointment::find($id);
        
        if (!$appointment) {
            return response()->json(['message' => 'Appointment not found'], 404);
        }

        $appointment->delete();
        return response()->json(['message' => 'Appointment deleted successfully']);
    }

    public function update(Request $request, $id)
{
    $appointment = Appointment::find($id);

    if (!$appointment) {
        return response()->json(['message' => 'Appointment not found'], 404);
    }

    $validated = $request->validate([
        'appointment_date' => 'required|date|after_or_equal:today',
        'appointment_time' => 'required',
        'appointment_type' => 'required|in:Physical,Virtual',
    ]);

    // Check for conflicts, excluding the current appointment record
    $conflict = Appointment::where('property_id', $appointment->property_id)
        ->where('appointment_date', $validated['appointment_date'])
        ->where('appointment_time', $validated['appointment_time'])
        ->where('status', '!=', 'Rejected')
        ->where('id', '!=', $id)
        ->exists();

    if ($conflict) {
        return response()->json([
            'message' => 'The new time slot is already taken. Please choose another.'
        ], 409);
    }

    // Reset status to Pending if the tenant edits it
    $validated['status'] = 'Pending';
    
    $appointment->update($validated);

    return response()->json(['message' => 'Appointment updated successfully']);
}
public function updateStatus(Request $request, $id)
    {
        $appointment = Appointment::find($id);

        if (!$appointment) {
            return response()->json(['message' => 'Appointment not found'], 404);
        }

        $validated = $request->validate([
            'status' => 'required|in:Approved,Rejected'
        ]);

        $appointment->update(['status' => $validated['status']]);

        return response()->json(['message' => 'Status updated successfully']);
    }
}