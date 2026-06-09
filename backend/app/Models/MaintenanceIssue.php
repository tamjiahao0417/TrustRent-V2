<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MaintenanceIssue extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id', 
        'landlord_id', 
        'property_id', 
        'category', 
        'urgency', 
        'description', 
        'media_path', 
        'status', 
        'latest_update'
    ];

    // Automatically convert the JSON string of image URLs into a PHP array
    protected $casts = [
        'media_path' => 'array',
    ];
}