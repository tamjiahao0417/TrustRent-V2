<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    use HasFactory;

    // ADD THIS LINE to turn off automatic timestamps
    public $timestamps = false;

    protected $fillable = [
        'tenant_id',
        'landlord_id',
        'property_id',
        'appointment_date',
        'appointment_time',
        'appointment_type',
        'status'
    ];

    public function tenant()
    {
        return $this->belongsTo(User::class, 'tenant_id');
    }

    public function landlord()
    {
        return $this->belongsTo(User::class, 'landlord_id');
    }

    public function property()
    {
        return $this->belongsTo(Property::class, 'property_id');
    }
}