<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transporter extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'vehicle_type',
        'vehicle_plate',
        'license_number',
        'status',
        'is_online',
        'current_lat',
        'current_lng',
        'rating_avg',
        'total_trips',
        'total_earnings',
    ];

    protected $casts = [
        'is_online' => 'boolean',
        'current_lat' => 'float',
        'current_lng' => 'float',
        'rating_avg' => 'float',
        'total_trips' => 'integer',
        'total_earnings' => 'float',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}