<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RentalRequest extends Model
{
    use HasFactory;

    // 🌟 ADD THIS LINE to stop Laravel from looking for updated_at
    public $timestamps = false;

    protected $fillable = [
        'tenant_id',
        'landlord_id',
        'property_id',
        'start_date',
        'end_date',
        'move_in_date',
        'notes',
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