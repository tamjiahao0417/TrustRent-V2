<?php

namespace App\Services;

use App\Repositories\MaintenanceRepository;
use Exception;

class MaintenanceService
{
    protected MaintenanceRepository $repository;

    public function __construct(MaintenanceRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getIssues($userId, $role)
    {
        return $this->repository->getByRole($userId, $role);
    }

    public function getIssueDetails($id)
    {
        $issue = $this->repository->getById($id);
        if (!$issue) {
            throw new Exception('Issue not found', 404);
        }
        return $issue;
    }

    public function deleteIssue($id, $tenantId)
    {
        $issue = $this->repository->getBasicById($id);
        
        if (!$issue || $issue->tenant_id != $tenantId) {
            throw new Exception('Cannot delete this issue. It may be locked or unauthorized.', 403);
        }

        return $this->repository->delete($id);
    }

    public function getActiveProperties($userId)
    {
        return $this->repository->getActivePropertiesByTenant($userId);
    }

    public function createIssue(array $data, $files)
    {
        $paths = $this->uploadFiles($files);

        $data['media_path'] = count($paths) > 0 ? json_encode($paths) : null;
        $data['status'] = 'Open';
        $data['latest_update'] = 'Tenant reported issue.';

        return $this->repository->create($data);
    }

    public function updateIssueStatus($id, $status, $latestUpdate)
    {
        return $this->repository->updateStatus($id, $status, $latestUpdate);
    }

    public function updateIssue($id, $tenantId, array $data, $newFiles, $existingMediaJson)
    {
        $issue = $this->repository->getBasicById($id);

        if (!$issue || $issue->tenant_id != $tenantId) {
            throw new Exception('Cannot edit this issue. It may be locked or unauthorized.', 403);
        }

        // Grab media user kept
        $paths = json_decode($existingMediaJson, true) ?? [];

        // Process brand new files uploaded
        $newPaths = $this->uploadFiles($newFiles);
        
        // Merge the kept files with the new files
        $paths = array_merge($paths, $newPaths);

        $data['media_path'] = count($paths) > 0 ? json_encode($paths) : null;

        return $this->repository->update($id, $data);
    }

    // --- Private Helper ---
    private function uploadFiles($files)
    {
        $paths = [];
        if ($files) {
            $uploadDirectory = public_path('uploads/maintenance');
            
            if (!file_exists($uploadDirectory)) {
                mkdir($uploadDirectory, 0777, true);
            }

            foreach ($files as $file) {
                $filename = time() . '_' . str_replace(' ', '_', $file->getClientOriginalName());
                $file->move($uploadDirectory, $filename); 
                $paths[] = 'http://localhost:8000/uploads/maintenance/' . $filename;
            }
        }
        return $paths;
    }
}