<?php

namespace App\Repositories;

use App\Models\Report;

class ReportRepository
{
    // Fetches reports based on user role
    public function getReportsForUser($user)
    {
        $query = Report::with(['reporter', 'relatedUser'])->orderBy('created_at', 'desc');
        
        // If not an admin, they can only see their own reports
        if ($user->role !== 'admin') {
            $query->where('reporter_id', $user->id);
        }
        
        return $query->get();
    }

    public function getById($id)
    {
        return Report::with(['reporter', 'relatedUser'])->find($id);
    }

    public function create(array $data)
    {
        return Report::create($data);
    }

    public function update(Report $report, array $data)
    {
        $report->update($data);
        return $report;
    }

    public function delete(Report $report)
    {
        return $report->delete();
    }
}