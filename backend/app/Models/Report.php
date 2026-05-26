<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    use HasFactory;

    protected $fillable = [
        'reference_id', 'reporter_id', 'issue_type', 
        'description', 'related_user_id', 'attachment_path', 'status', 'admin_comment'
    ];

    // Optional: Add relationships so Admin can see names later
    public function reporter() { return $this->belongsTo(User::class, 'reporter_id'); }
    public function relatedUser() { return $this->belongsTo(User::class, 'related_user_id'); }
}