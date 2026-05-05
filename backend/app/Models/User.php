<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; // 🌟 1. Must be imported here

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role', // Assuming you have a role column for landlord/tenant
        'ic',
        'phone_number',
        'house_address',
        'wallet_address',
    ];

    /**
     * The attributes that should be hidden for serialization.
     * This stops the password from accidentally being sent to Angular!
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    // --- Relationships ---
    
    public function properties()
    {
        return $this->hasMany(Property::class, 'landlord_id');
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class, 'tenant_id');
    }
}