<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PropertyController extends Controller
{
    // 1. Fetch all properties for a specific landlord (Used in My Properties)
    public function index(Request $request)
    {
        $userId = $request->query('user_id');

        if (!$userId) {
            return response()->json(['message' => 'User ID is required'], 400);
        }

        $properties = DB::table('properties')
            ->where('landlord_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        foreach ($properties as $property) {
            $property->images = json_decode($property->image_path) ?: [];
            $property->thumbnail = !empty($property->images) ? $property->images[0] : 'default_property.jpg';
        }

        return response()->json($properties);
    }

    // 2. Save a new property and upload images (Used in Create Property)
    public function store(Request $request)
    {
        $userId = $request->input('user_id');

        if (!$userId) return response()->json(['message' => 'Unauthorized'], 401);

        $uploadDirectory = public_path('uploads/');
        if (!file_exists($uploadDirectory)) {
            mkdir($uploadDirectory, 0777, true);
        }

        $uploadedImages = [];

        if ($request->hasFile('property_images')) {
            foreach ($request->file('property_images') as $file) {
                $newFilename = uniqid('prop_') . '_' . time() . '.' . $file->getClientOriginalExtension();
                $file->move($uploadDirectory, $newFilename);
                $uploadedImages[] = $newFilename;
            }
        }

        if (empty($uploadedImages)) {
            return response()->json(['message' => 'At least one image is required.'], 422);
        }

        DB::table('properties')->insert([
            'landlord_id' => $userId,
            'title' => $request->input('title'),
            'description' => $request->input('description'),
            'location' => $request->input('location'),
            'price' => $request->input('price'),
            'rooms' => $request->input('rooms'),
            'address' => $request->input('address'),
            'phone_number' => $request->input('phone_number'),
            'image_path' => json_encode($uploadedImages)
        ]);

        return response()->json(['message' => 'Success']);
    }

    // 3. Fetch a single property's details (Used in View Property)
    public function show($id)
    {
        $property = DB::table('properties')->where('id', $id)->first();
        
        if (!$property) {
            return response()->json(['message' => 'Property not found'], 404);
        }

        // Check if rented so we can disable the delete button
        $isRented = DB::table('contracts')
            ->where('property_id', $id)
            ->where('status', 'Active')
            ->exists();

        $property->images = json_decode($property->image_path) ?: [];
        $property->is_rented = $isRented;

        return response()->json($property);
    }

    // 4. Delete a property (Used in View Property)
    public function destroy($id, Request $request)
    {
        $userId = $request->query('user_id');
        
        $isRented = DB::table('contracts')->where('property_id', $id)->where('status', 'Active')->exists();
        if ($isRented) {
            return response()->json(['message' => 'Cannot delete active rental'], 403);
        }

        DB::table('properties')->where('id', $id)->where('landlord_id', $userId)->delete();
        return response()->json(['message' => 'Deleted']);
    }

    // 5. Update an existing property
    // 5. Update an existing property
    public function update(Request $request, $id)
    {
        $userId = $request->input('user_id');

        $property = DB::table('properties')->where('id', $id)->where('landlord_id', $userId)->first();
        if (!$property) {
            return response()->json(['message' => 'Unauthorized or Property not found'], 403);
        }

        $updateData = [
            'title' => $request->input('title'),
            'description' => $request->input('description'),
            'location' => $request->input('location'),
            'price' => $request->input('price'),
            'rooms' => $request->input('rooms'),
            'address' => $request->input('address'),
            'phone_number' => $request->input('phone_number')
        ];

        // 1. Get the list of old images the user DID NOT delete
        $finalImages = $request->input('existing_images', []); 

        // 2. If they uploaded new images, save them and add them to the final list
        if ($request->hasFile('property_images')) {
            $uploadDirectory = public_path('uploads/');
            foreach ($request->file('property_images') as $file) {
                $newFilename = uniqid('prop_') . '_' . time() . '.' . $file->getClientOriginalExtension();
                $file->move($uploadDirectory, $newFilename);
                $finalImages[] = $newFilename; // Append the new image
            }
        }

        // 3. Save the combined list of kept images + new images to the database!
        $updateData['image_path'] = json_encode($finalImages);

        DB::table('properties')->where('id', $id)->update($updateData);

        return response()->json(['message' => 'Updated successfully']);
    }
}