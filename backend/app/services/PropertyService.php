<?php

namespace App\Services;

use App\Repositories\PropertyRepository;
use Exception;

class PropertyService
{
    protected PropertyRepository $repository;

    // Inject the Data Access Layer
    public function __construct(PropertyRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getLandlordProperties($userId)
    {
        $properties = $this->repository->getByLandlordId($userId);

        foreach ($properties as $property) {
            $property->images = json_decode($property->image_path) ?: [];
            $property->thumbnail = !empty($property->images) ? $property->images[0] : 'default_property.jpg';
        }

        return $properties;
    }

    public function getAllPublicProperties()
    {
        $properties = $this->repository->getAll();

        foreach ($properties as $property) {
            $property->images = json_decode($property->image_path) ?: [];
            $property->thumbnail = !empty($property->images) ? $property->images[0] : 'default_property.jpg';
        }

        return $properties;
    }

    public function createProperty($userId, array $data, $files)
    {
        $uploadedImages = [];

        // Identical file upload logic to your original controller
        if ($files) {
            $uploadDirectory = public_path('uploads/');
            if (!file_exists($uploadDirectory)) {
                mkdir($uploadDirectory, 0777, true);
            }

            foreach ($files as $file) {
                $newFilename = uniqid('prop_') . '_' . time() . '.' . $file->getClientOriginalExtension();
                $file->move($uploadDirectory, $newFilename);
                $uploadedImages[] = $newFilename;
            }
        }

        $data['landlord_id'] = $userId;
        $data['image_path'] = json_encode($uploadedImages);

        return $this->repository->create($data);
    }

    public function getPropertyDetails($id)
    {
        $property = $this->repository->getById($id);

        if (!$property) {
            throw new Exception('Property not found', 404);
        }

        $property->images = json_decode($property->image_path) ?: [];
        $property->is_rented = $this->repository->isPropertyRented($id);

        return $property;
    }

    public function deleteProperty($id, $userId)
    {
        // Business Rule: Cannot delete a rented property
        if ($this->repository->isPropertyRented($id)) {
            throw new Exception('Cannot delete a property that is currently rented.', 400);
        }

        $deleted = $this->repository->delete($id, $userId);

        if (!$deleted) {
            throw new Exception('Unauthorized or property not found.', 403);
        }

        return true;
    }

    public function updateProperty($id, array $data, $newFiles, $existingImages)
    {
        $finalImages = $existingImages ?? [];

        // Upload new images and merge with existing ones
        if ($newFiles) {
            $uploadDirectory = public_path('uploads/');
            if (!file_exists($uploadDirectory)) {
                mkdir($uploadDirectory, 0777, true);
            }

            foreach ($newFiles as $file) {
                $newFilename = uniqid('prop_') . '_' . time() . '.' . $file->getClientOriginalExtension();
                $file->move($uploadDirectory, $newFilename);
                $finalImages[] = $newFilename;
            }
        }

        $data['image_path'] = json_encode($finalImages);

        return $this->repository->update($id, $data);
    }
}