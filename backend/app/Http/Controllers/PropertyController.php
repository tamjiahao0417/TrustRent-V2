<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\PropertyService;
use Exception;

class PropertyController extends Controller
{
    protected PropertyService $propertyService;

    // Inject the Business Logic Layer
    public function __construct(PropertyService $propertyService)
    {
        $this->propertyService = $propertyService;
    }

    // 1. Fetch all properties for a specific landlord (Used in My Properties)
    public function index(Request $request)
    {
        $userId = $request->query('user_id');

        if (!$userId) {
            return response()->json(['message' => 'User ID is required'], 400);
        }

        $properties = $this->propertyService->getLandlordProperties($userId);
        
        return response()->json($properties);
    }

    // 2. Save a new property and upload images (Used in Create Property)
    public function store(Request $request)
    {
        $userId = $request->input('user_id');

        if (!$userId) return response()->json(['message' => 'Unauthorized'], 401);

        try {
            $this->propertyService->createProperty(
                $userId,
                $request->except(['user_id', 'property_images']),
                $request->file('property_images')
            );
            return response()->json(['message' => 'Property created successfully'], 201);
        } catch (Exception $e) {
            // 🌟 NEW: This will return the EXACT line and error from Laravel to your browser!
            return response()->json([
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    // 3. Fetch specific property details
    public function show($id)
    {
        try {
            $property = $this->propertyService->getPropertyDetails($id);
            return response()->json($property);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 404);
        }
    }

    // 4. Delete property listing
    public function destroy($id, Request $request)
    {
        $userId = $request->query('user_id');
        
        try {
            $this->propertyService->deleteProperty($id, $userId);
            return response()->json(['message' => 'Property deleted successfully']);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 400);
        }
    }

    // 5. Update Property Details and append new images
    public function update(Request $request, $id)
    {
        try {
            $this->propertyService->updateProperty(
                $id,
                $request->except(['user_id', 'property_images', 'existing_images']),
                $request->file('property_images'),
                $request->input('existing_images', [])
            );
            return response()->json(['message' => 'Updated successfully']);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    // 6. Fetch ALL properties for the public feed
    public function getAll()
    {
        $properties = $this->propertyService->getAllPublicProperties();
        
        return response()->json($properties);
    }
}