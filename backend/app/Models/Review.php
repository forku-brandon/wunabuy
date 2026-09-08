<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'target_type',
        'target_id',
        'rating',
        'comment',
        'images',
    ];

    protected $casts = [
        'rating' => 'integer',
        'images' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}