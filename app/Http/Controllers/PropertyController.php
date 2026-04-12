<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PropertyController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->query('user_id');

        if (!$userId) {
            return response()->json(['message' => 'User ID is required'], 400);
        }

        // Fetch properties just like your old PropertyRepository
        $properties = DB::table('properties')
            ->where('landlord_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        // Decode the JSON image string before sending to Angular, so Angular doesn't have to!
        foreach ($properties as $property) {
            $property->images = json_decode($property->image_path) ?: [];
            // Determine the thumbnail (first image or a default)
            $property->thumbnail = !empty($property->images) ? $property->images[0] : 'default_property.jpg';
        }

        return response()->json($properties);
    }

    public function store(Request $request)
    {
        $userId = $request->input('user_id');

        if (!$userId) return response()->json(['message' => 'Unauthorized'], 401);

        // Define the exact same upload folder from your PHP script
        $uploadDirectory = public_path('uploads/');
        if (!file_exists($uploadDirectory)) {
            mkdir($uploadDirectory, 0777, true);
        }

        $uploadedImages = [];

        // Handle the file uploads
        if ($request->hasFile('property_images')) {
            foreach ($request->file('property_images') as $file) {
                // Generate secure filename
                $newFilename = uniqid('prop_') . '_' . time() . '.' . $file->getClientOriginalExtension();
                $file->move($uploadDirectory, $newFilename);
                $uploadedImages[] = $newFilename;
            }
        }

        if (empty($uploadedImages)) {
            return response()->json(['message' => 'At least one image is required.'], 422);
        }

        // Save to Database
        DB::table('properties')->insert([
            'landlord_id' => $userId,
            'title' => $request->input('title'),
            'description' => $request->input('description'),
            'location' => $request->input('location'),
            'price' => $request->input('price'),
            'rooms' => $request->input('rooms'),
            'address' => $request->input('address'),
            'phone_number' => $request->input('phone_number'),
            'image_path' => json_encode($uploadedImages),
        ]);

        return response()->json(['message' => 'Success']);
    }
}