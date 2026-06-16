<?php

namespace App\Services;

use App\Repositories\ReportRepository;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Exception;

class ReportService
{
    protected ReportRepository $repository;

    public function __construct(ReportRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getReportsList($user)
    {
        return $this->repository->getReportsForUser($user);
    }

    public function getReportDetails($id, $user)
    {
        $report = $this->repository->getById($id);
        
        if (!$report) throw new Exception('Report not found', 404);

        // Security Check
        if ($user->role !== 'admin' && $user->id !== $report->reporter_id) {
            throw new Exception('Unauthorized access.', 403);
        }

        return $report;
    }

    public function createReport($user, array $data, $files)
    {
        $paths = [];
        
        // Upload Files to Storage
        if ($files) {
            foreach ($files as $file) {
                if ($file->isValid()) {
                    $paths[] = $file->store('reports', 'public');
                }
            }
        }

        // Generate Reference ID & prepare data
        $data['reference_id'] = 'REP-' . strtoupper(Str::random(6));
        $data['reporter_id'] = $user->id;
        $data['attachment_path'] = count($paths) > 0 ? json_encode($paths) : null;
        $data['status'] = 'Open'; // Default status

        return $this->repository->create($data);
    }

    public function updateReport($id, $user, array $data, $newFiles, $existingAttachmentsJson)
    {
        $report = $this->repository->getById($id);
        
        if (!$report) throw new Exception('Report not found', 404);
        
        // Security Check
        if ($user->role !== 'admin' && $user->id !== $report->reporter_id) {
            throw new Exception('Unauthorized access.', 403);
        }

        // --- File Sync Logic (Identical to your original code) ---
        $keptPaths = json_decode($existingAttachmentsJson, true) ?? [];
        if (!is_array($keptPaths)) $keptPaths = [$existingAttachmentsJson];

        $oldPaths = $report->attachment_path ? json_decode($report->attachment_path, true) : [];
        if (!is_array($oldPaths)) $oldPaths = [$report->attachment_path];

        // 1. Delete removed files from server storage
        $deletedPaths = array_diff($oldPaths, $keptPaths);
        foreach ($deletedPaths as $deletedPath) {
            Storage::disk('public')->delete($deletedPath);
        }

        $finalPaths = $keptPaths;

        // 2. Add brand new files
        if ($newFiles) {
            foreach ($newFiles as $file) {
                if ($file->isValid()) {
                    $finalPaths[] = $file->store('reports', 'public');
                }
            }
        }

        $data['attachment_path'] = count($finalPaths) > 0 ? json_encode(array_values($finalPaths)) : null;

        return $this->repository->update($report, $data);
    }

    public function deleteReport($id, $user)
    {
        $report = $this->repository->getById($id);
        if (!$report) throw new Exception('Report not found', 404);

        // Security Check 1: Ownership
        if ($user->role !== 'admin' && $user->id !== $report->reporter_id) {
            throw new Exception('Unauthorized access.', 403);
        }

        // Security Check 2: Lock prevention
        if ($report->status !== 'Open' && $user->role !== 'admin') {
            throw new Exception('Cannot delete a report that is already being processed.', 403);
        }

        // Wipe files from storage completely
        if ($report->attachment_path) {
            $paths = json_decode($report->attachment_path, true);
            if (!is_array($paths)) $paths = [$report->attachment_path];
            foreach ($paths as $path) {
                Storage::disk('public')->delete($path);
            }
        }

        return $this->repository->delete($report);
    }

    // 🌟 ADDED: The missing method to handle Status Updates for the Controller
    public function updateReportStatus($id, $user, array $data)
    {
        $report = $this->repository->getById($id);
        
        if (!$report) throw new Exception('Report not found', 404);

        // Security Check: Only Admins can update the status
        if ($user->role !== 'admin') {
            throw new Exception('Unauthorized access.', 403);
        }

        return $this->repository->update($report, $data);
    }
}