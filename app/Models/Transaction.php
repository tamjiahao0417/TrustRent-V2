<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;
    
    // Disable timestamps if you handle created_at manually like in your PHP
    public $timestamps = false; 

    protected $fillable = [
        'tenant_id', 'landlord_id', 'property_id', 'contract_id', 
        'amount', 'type', 'billing_period', 'blockchain_hash', 'status'
    ];

    public function property() { return $this->belongsTo(Property::class, 'property_id'); }
    public function tenant() { return $this->belongsTo(User::class, 'tenant_id'); }
    public function landlord() { return $this->belongsTo(User::class, 'landlord_id'); }
    public function contract() { return $this->belongsTo(Contract::class, 'contract_id'); }
}