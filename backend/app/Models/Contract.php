<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Contract extends Model
{
    use HasFactory;

    // Turn off automatic timestamps if your DB handles created_at manually
    public $timestamps = false; 

    protected $fillable = [
        'rental_request_id', 'landlord_id', 'tenant_id', 'property_id',
        'rent_amount', 'start_date', 'end_date', 'lease_term', 'additional_terms',
        'landlord_ic', 'landlord_address', 'tenant_ic', 'tenant_address',
        'utilities_deposit', 'security_deposit', 'notice_period', 'status', 
        'blockchain_hash', 'landlord_signature', 'landlord_signed_at',
        'tenant_signature', 'tenant_signed_at', 'payment_frequency', 'due_date', 'edit_reason'
    ];

    public function property() { return $this->belongsTo(Property::class, 'property_id'); }
    public function landlord() { return $this->belongsTo(User::class, 'landlord_id'); }
    public function tenant() { return $this->belongsTo(User::class, 'tenant_id'); }
}