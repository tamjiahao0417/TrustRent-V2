<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ReportController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user('sanctum');

        // EF1: Incomplete Form Submission validation
        $request->validate([
            'issue_type' => 'required|string',
            'description' => 'required|string',
            'attachment' => 'nullable|file|max:5120', // EF2: Max 5MB file upload
            'related_user_id' => 'nullable|exists:users,id'
        ], [
            'issue_type.required' => 'Please select an issue type.',
            'description.required' => 'Please complete all required fields before submitting.'
        ]);

        // Handle File Upload if it exists
        $path = null;
        if ($request->hasFile('attachment') && $request->file('attachment')->isValid()) {
            $path = $request->file('attachment')->store('reports', 'public');
        }

        // Generate a random unique Reference ID
        $referenceId = 'REP-' . strtoupper(Str::random(6));

        $report = Report::create([
            'reference_id' => $referenceId,
            'reporter_id' => $user->id,
            'issue_type' => $request->issue_type,
            'description' => $request->description,
            'related_user_id' => $request->related_user_id,
            'attachment_path' => $path,
            'status' => 'Open'
        ]);

        // Postcondition: System generates reference ID for tracking
        return response()->json([
            'message' => 'Issue reported successfully.',
            'reference_id' => $referenceId
        ], 201);
    }

    // Fetch reports for the list view
    public function index(Request $request)
    {
        $user = $request->user('sanctum');

        // If Admin, get ALL reports and load the user names
        if ($user->role === 'admin') {
            $reports = Report::with(['reporter', 'relatedUser'])
                ->orderBy('created_at', 'desc')
                ->get();
        } 
        // If normal user, only get the reports THEY created
        else {
            $reports = Report::with(['relatedUser'])
                ->where('reporter_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();
        }

        return response()->json($reports);
    }

    // Fetch a single report for the Details view
    public function show(Request $request, $id)
    {
        $report = Report::with(['reporter', 'relatedUser'])->find($id);
        
        if (!$report) {
            return response()->json(['message' => 'Report not found'], 404);
        }

        $user = $request->user('sanctum');

        // Security: Block access UNLESS they are an Admin OR they are the person who reported it
        if ($user->role !== 'admin' && $user->id !== $report->reporter_id) {
            return response()->json(['message' => 'Unauthorized access.'], 403);
        }

        return response()->json($report);
    }

    // Admin Action: Update the status of the report
    public function updateStatus(Request $request, $id)
    {
        $user = $request->user('sanctum');
        
        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized. Only admins can update status.'], 403);
        }

        $validated = $request->validate([
            'status' => 'required|string'
        ]);

        $report = Report::find($id);
        if (!$report) {
            return response()->json(['message' => 'Report not found'], 404);
        }

        $report->status = $validated['status'];
        $report->save();

        // Optional: In a real app, you might trigger an email notification to the reporter here!

        return response()->json(['message' => 'Report status updated successfully!', 'report' => $report]);
    }
}