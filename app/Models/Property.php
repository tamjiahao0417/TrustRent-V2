<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Property extends Model
{
    use HasFactory;

    // IMPORTANT: If your properties table DOES NOT have an 'updated_at' column, 
    // uncomment the line below just like we did for Appointments!
    // public $timestamps = false; 

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
        'image_path'
    ];

    // 🌟 PRO-TIP: Laravel will automatically encode/decode the JSON images array for you!
    // You won't need to write json_decode() in your controller anymore.
    protected $casts = [
        'image_path' => 'array',
    ];

    // --- Relationships ---

    // A property belongs to a Landlord (User)
    public function landlord()
    {
        return $this->belongsTo(User::class, 'landlord_id');
    }

    // A property can have many appointments
    public function appointments()
    {
        return $this->hasMany(Appointment::class, 'property_id');
    }

    // A property can have many rental contracts
    public function contracts()
    {
        return $this->hasMany(Contract::class, 'property_id');
    }
}