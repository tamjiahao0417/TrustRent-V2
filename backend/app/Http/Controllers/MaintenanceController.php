<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MaintenanceController extends Controller
{
    // 1. Get Issues for the Main List (Handles BOTH Tenant and Landlord views)
    public function index(Request $request)
    {
        $userId = $request->query('user_id');
        $role = $request->query('role');

        $query = DB::table('maintenance_issues')
            ->join('properties', 'maintenance_issues.property_id', '=', 'properties.id')
            ->select('maintenance_issues.*', 'properties.address as property_address')
            ->orderBy('maintenance_issues.updated_at', 'desc');

        if ($role === 'tenant') {
            $query->where('maintenance_issues.tenant_id', $userId);
        } else if ($role === 'landlord') {
            $query->where('maintenance_issues.landlord_id', $userId);
        }

        return response()->json($query->get());
    }

    // 2. Get specific Issue Details
    public function show($id)
    {
        $issue = DB::table('maintenance_issues')
            ->join('properties', 'maintenance_issues.property_id', '=', 'properties.id')
            ->join('users', 'maintenance_issues.tenant_id', '=', 'users.id')
            ->select('maintenance_issues.*', 'properties.address as property_address', 'users.name as tenant_name')
            ->where('maintenance_issues.id', $id)
            ->first();

        if (!$issue) {
            return response()->json(['error' => 'Issue not found'], 404);
        }

        return response()->json($issue);
    }

    // 3. Delete an Issue (Tenant Only)
    public function destroy(Request $request, $id)
    {
        $tenantId = $request->query('user_id');
        
        $issue = DB::table('maintenance_issues')->where('id', $id)->first();
        
        if (!$issue || $issue->tenant_id != $tenantId || $issue->status !== 'Open') {
            return response()->json(['success' => false, 'error' => 'Cannot delete this issue.'], 403);
        }

        DB::table('maintenance_issues')->where('id', $id)->delete();
        return response()->json(['success' => true]);
    }

    // Add this at the top with your other uses
    // use Illuminate\Support\Facades\DB;

    // 4. Get Active Properties for the Tenant's Dropdown
    public function getActiveProperties(Request $request)
    {
        $userId = $request->query('user_id');
        $properties = DB::table('contracts')
            ->join('properties', 'contracts.property_id', '=', 'properties.id')
            ->where('contracts.tenant_id', $userId)
            ->where('contracts.status', 'Active')
            ->select('properties.id as property_id', 'contracts.landlord_id', 'properties.address')
            ->get();

        return response()->json($properties);
    }

    // 5. Create a new Issue (With File Upload)
    // 5. Create a new Issue (With Multiple File Uploads)
    public function store(Request $request)
    {
        $paths = [];
        
        // Handle Multiple File Uploads
        if ($request->hasFile('media')) {
            // Loop through each file in the array
            foreach ($request->file('media') as $file) {
                // Generate a unique name for each file
                $filename = time() . '_' . str_replace(' ', '_', $file->getClientOriginalName());
                
                // Move it to the public folder
                $file->move(public_path('uploads/maintenance'), $filename); 
                
                // Add the URL to our array
                $paths[] = 'http://localhost:8000/uploads/maintenance/' . $filename;
            }
        }

        // Convert the array of URLs into a JSON string so it fits in your media_path column
        $finalMediaPath = count($paths) > 0 ? json_encode($paths) : null;

        DB::table('maintenance_issues')->insert([
            'tenant_id' => $request->input('tenant_id'),
            'landlord_id' => $request->input('landlord_id'),
            'property_id' => $request->input('property_id'),
            'category' => $request->input('category'),
            'urgency' => $request->input('urgency'),
            'description' => $request->input('description'),
            'media_path' => $finalMediaPath, // Save the JSON string here
            'status' => 'Open',
            'latest_update' => 'Tenant reported issue.',
            'created_at' => now(),
            'updated_at' => now()
        ]);

        return response()->json(['success' => true]);
    }

    // 6. Update Issue Status (Landlord Only)
    public function updateStatus(Request $request, $id)
    {
        DB::table('maintenance_issues')
            ->where('id', $id)
            ->update([
                'status' => $request->input('status'),
                'latest_update' => $request->input('latest_update'),
                'updated_at' => now()
            ]);

        return response()->json(['success' => true]);
    }

    // 7. Update an Issue's text (Tenant Only)
 // 7. Update an Issue's text and media (Tenant Only)
    public function update(Request $request, $id)
    {
        $tenantId = $request->input('user_id');
        $issue = DB::table('maintenance_issues')->where('id', $id)->first();

        // Security check
        if (!$issue || $issue->tenant_id != $tenantId || $issue->status !== 'Open') {
            return response()->json(['success' => false, 'error' => 'Cannot edit this issue.'], 403);
        }

        // 1. Grab the media that the user decided to keep
        $paths = json_decode($request->input('existing_media', '[]'), true) ?? [];

        // 2. Process any brand new files they uploaded
        if ($request->hasFile('media')) {
            foreach ($request->file('media') as $file) {
                $filename = time() . '_' . str_replace(' ', '_', $file->getClientOriginalName());
                $file->move(public_path('uploads/maintenance'), $filename); 
                $paths[] = 'http://localhost:8000/uploads/maintenance/' . $filename;
            }
        }

        // 3. Convert the combined array back into a JSON string
        $finalMediaPath = count($paths) > 0 ? json_encode($paths) : null;

        // 4. Save to database
        DB::table('maintenance_issues')
            ->where('id', $id)
            ->update([
                'landlord_id' => $request->input('landlord_id'),
                'property_id' => $request->input('property_id'),
                'category' => $request->input('category'),
                'urgency' => $request->input('urgency'),
                'description' => $request->input('description'),
                'media_path' => $finalMediaPath, // Update the media links
                'updated_at' => now()
            ]);

        return response()->json(['success' => true]);
    }
}