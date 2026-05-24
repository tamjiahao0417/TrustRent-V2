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

        $request->validate([
            'issue_type' => 'required|string',
            'description' => 'required|string',
            'attachment' => 'nullable|array', // 🌟 Accept an array of files
            'attachment.*' => 'file|max:5120|mimes:jpeg,png,jpg,gif,webp', // Max 5MB per file
            'related_user_id' => 'nullable|exists:users,id'
        ], [
            'issue_type.required' => 'Please select an issue type.',
            'description.required' => 'Please complete all required fields before submitting.'
        ]);

        $paths = [];
        if ($request->hasFile('attachment')) {
            foreach ($request->file('attachment') as $file) {
                if ($file->isValid()) {
                    $paths[] = $file->store('reports', 'public');
                }
            }
        }

        $referenceId = 'REP-' . strtoupper(Str::random(6));

        $report = Report::create([
            'reference_id' => $referenceId,
            'reporter_id' => $user->id,
            'issue_type' => $request->issue_type,
            'description' => $request->description,
            'related_user_id' => $request->related_user_id,
            'attachment_path' => count($paths) > 0 ? json_encode($paths) : null, // 🌟 Store as JSON
            'status' => 'Open'
        ]);

        return response()->json([
            'message' => 'Issue reported successfully.',
            'reference_id' => $referenceId
        ], 201);
    }

    public function index(Request $request)
    {
        $user = $request->user('sanctum');

        if ($user->role === 'admin') {
            $reports = Report::with(['reporter', 'relatedUser'])->orderBy('created_at', 'desc')->get();
        } else {
            $reports = Report::with(['relatedUser'])->where('reporter_id', $user->id)->orderBy('created_at', 'desc')->get();
        }
        return response()->json($reports);
    }

    public function show(Request $request, $id)
    {
        $report = Report::with(['reporter', 'relatedUser'])->find($id);
        
        if (!$report) return response()->json(['message' => 'Report not found'], 404);

        $user = $request->user('sanctum');

        if ($user->role !== 'admin' && $user->id !== $report->reporter_id) {
            return response()->json(['message' => 'Unauthorized access.'], 403);
        }

        return response()->json($report);
    }

    public function updateStatus(Request $request, $id)
    {
        $user = $request->user('sanctum');
        if ($user->role !== 'admin') return response()->json(['message' => 'Unauthorized.'], 403);

        $validated = $request->validate(['status' => 'required|string']);

        $report = Report::find($id);
        if (!$report) return response()->json(['message' => 'Report not found'], 404);

        $report->status = $validated['status'];
        $report->save();

        return response()->json(['message' => 'Report status updated successfully!', 'report' => $report]);
    }

    public function update(Request $request, $id)
    {
        $report = Report::find($id);
        if (!$report) return response()->json(['message' => 'Report not found'], 404);

        $user = $request->user('sanctum');
        if ($user->role !== 'admin' && $user->id !== $report->reporter_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'issue_type' => 'required|string', 
            'description' => 'required|string',
            'attachment' => 'nullable|array',
            'attachment.*' => 'file|max:5120|mimes:jpeg,png,jpg,gif,webp'
        ]);

        // 🌟 Handle Multiple File Updating
        $existingMedia = json_decode($request->input('existing_media', '[]'), true) ?? [];
        $currentPaths = [];
        if ($report->attachment_path) {
            $currentPaths = json_decode($report->attachment_path, true);
            if (!is_array($currentPaths)) $currentPaths = [$report->attachment_path]; // Fallback for old single strings
        }

        // Delete files that were removed in the frontend
        $toDelete = array_diff($currentPaths, $existingMedia);
        foreach ($toDelete as $oldFile) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($oldFile);
        }

        $finalPaths = $existingMedia;

        // Save new files
        if ($request->hasFile('attachment')) {
            foreach ($request->file('attachment') as $file) {
                if ($file->isValid()) {
                    $finalPaths[] = $file->store('reports', 'public');
                }
            }
        }

        $report->attachment_path = count($finalPaths) > 0 ? json_encode(array_values($finalPaths)) : null;
        $report->issue_type = $request->issue_type;
        $report->description = $request->description;
        $report->related_user_id = $request->related_user_id;
        $report->save();

        return response()->json(['message' => 'Report updated successfully']);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user('sanctum');
        $report = Report::find($id);

        if (!$report) return response()->json(['message' => 'Report not found'], 404);

        if ($user->role !== 'admin' && $user->id !== $report->reporter_id) {
            return response()->json(['message' => 'Unauthorized access.'], 403);
        }

        if ($report->status !== 'Open' && $user->role !== 'admin') {
            return response()->json(['message' => 'Cannot delete a report that is already being processed.'], 403);
        }

        // 🌟 Delete all files from storage if it's an array
        if ($report->attachment_path) {
            $paths = json_decode($report->attachment_path, true);
            if (!is_array($paths)) $paths = [$report->attachment_path];
            foreach ($paths as $path) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($path);
            }
        }

        $report->delete();
        return response()->json(['message' => 'Report deleted successfully.'], 200);
    }
}