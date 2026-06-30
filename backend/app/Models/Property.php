<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Property extends Model
{
    use HasFactory;

    // The fields we are allowed to save/update
    protected $fillable = [
        'landlord_id',
        'title',
        'description',
        'location',
        'price',
        'rooms',
        'address',
        'phone_number',
        'image_path',
        'is_rented' 
    ];

    // Laravel automatically encodes/decodes the JSON images array for you
    protected $casts = [
        'image_path' => 'array',
    ];

    // --- Relationships ---

    public function landlord()
    {
        return $this->belongsTo(User::class, 'landlord_id');
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class, 'property_id');
    }

    public function contracts()
    {
        return $this->hasMany(Contract::class, 'property_id');
    }
}