<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\ReportService;
use Exception;

class ReportController extends Controller
{
    protected ReportService $reportService;

    // Inject the Business Logic Service
    public function __construct(ReportService $reportService)
    {
        $this->reportService = $reportService;
    }

    public function store(Request $request)
    {
        $user = $request->user('sanctum');

        $validated = $request->validate([
            'issue_type' => 'required|string',
            'description' => 'required|string',
            'attachment' => 'nullable|array', 
            'attachment.*' => 'file|max:5120|mimes:jpeg,png,jpg,gif,webp', // Max 5MB
            'related_user_id' => 'nullable|exists:users,id'
        ], [
            'issue_type.required' => 'Please select an issue type.',
            'description.required' => 'Please complete all required fields before submitting.'
        ]);

        try {
            $report = $this->reportService->createReport($user, $validated, $request->file('attachment'));
            return response()->json(['message' => 'Report submitted successfully', 'data' => $report], 201);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function index(Request $request)
    {
        $user = $request->user('sanctum');

        $reports = $this->reportService->getReportsList($user);
        
        return response()->json($reports);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user('sanctum');

        try {
            $report = $this->reportService->getReportDetails($id, $user);
            return response()->json($report);
        } catch (Exception $e) {
            $code = $e->getMessage() === 'Unauthorized access.' ? 403 : 404;
            return response()->json(['message' => $e->getMessage()], $code);
        }
    }

    public function update(Request $request, $id)
    {
        $user = $request->user('sanctum');

        $validated = $request->validate([
            'issue_type' => 'required|string',
            'description' => 'required|string',
            'new_attachments' => 'nullable|array',
            'new_attachments.*' => 'file|max:5120|mimes:jpeg,png,jpg,gif,webp',
            'related_user_id' => 'nullable|exists:users,id',
        ]);

        try {
            $this->reportService->updateReport(
                $id, 
                $user, 
                $validated, 
                $request->file('new_attachments'), 
                $request->input('existing_attachments', '[]')
            );
            return response()->json(['message' => 'Report updated successfully']);
        } catch (Exception $e) {
            $code = $e->getMessage() === 'Unauthorized access.' ? 403 : 500;
            return response()->json(['message' => $e->getMessage()], $code);
        }
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user('sanctum');

        try {
            $this->reportService->deleteReport($id, $user);
            return response()->json(['message' => 'Report deleted successfully']);
        } catch (Exception $e) {
            $code = str_contains($e->getMessage(), 'Cannot delete') || $e->getMessage() === 'Unauthorized access.' ? 403 : 404;
            return response()->json(['message' => $e->getMessage()], $code);
        }
    }
}