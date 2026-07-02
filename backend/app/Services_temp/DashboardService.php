<?php

namespace App\Services;

use App\Repositories\DashboardRepository;
use Carbon\Carbon;
use Exception;

class DashboardService
{
    protected DashboardRepository $repository;

    public function __construct(DashboardRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getDashboardStats($userId, $role)
    {
        if ($role === 'admin') {
            return [
                'totalUsers' => $this->repository->getTotalUsersCount(),
                'openReports' => $this->repository->getOpenReportsCount(),
                'totalProperties' => $this->repository->getTotalPropertiesCount(),
                'recentReports' => $this->repository->getRecentReports(5)
            ];
        }

        if ($role === 'tenant') {
            $activeContracts = $this->repository->getActiveContractsByTenant($userId);

            $nearestExpiry = null;
            foreach ($activeContracts as $contract) {
                // Parse thumbnail image
                $images = json_decode($contract->property_image, true);
                $contract->property_image = (is_array($images) && count($images) > 0) ? $images[0] : null;

                // Calculate days remaining in lease
                $days = Carbon::now()->diffInDays(Carbon::parse($contract->end_date), false);
                $contract->days_left = $days < 0 ? 0 : floor($days);
                
                if (is_null($nearestExpiry) || $contract->days_left < $nearestExpiry) {
                    $nearestExpiry = $contract->days_left;
                }
            }

            return [
                'activeContracts' => $activeContracts,
                'daysLeft' => $nearestExpiry ?? 0,
                'openIssuesCount' => $this->repository->getOpenMaintenanceIssuesCount($userId),
                'pendingPayment' => $this->repository->getFirstPendingTransaction($userId),
            ];
        }

        if ($role === 'landlord') {
            $totalProperties = $this->repository->getPropertiesCountByLandlord($userId);
            $activeContractsData = $this->repository->getActiveContractsByLandlord($userId);

            // Compute metrics from collection mapping
            $activeTenants = $activeContractsData->unique('tenant_id')->count();
            $monthlyRevenue = $activeContractsData->sum('rent_amount');

            $rentedProperties = $this->repository->getRentedPropertiesDetailsByLandlord($userId);
            foreach ($rentedProperties as $prop) {
                $images = json_decode($prop->property_image, true);
                $prop->property_image = (is_array($images) && count($images) > 0) ? $images[0] : null;
            }

            return [
                'totalProperties' => $totalProperties,
                'activeTenants' => $activeTenants,
                'monthlyRevenue' => $monthlyRevenue,
                'rentedProperties' => $rentedProperties
            ];
        }

        throw new Exception('Invalid role', 400);
    }
}