<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Store extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'store_name',
        'tagline',
        'description',
        'category',
        'address_text',
        'landmark',
        'city',
        'latitude',
        'longitude',
        'counter_hours',
        'phone',
        'email',
        'rider_instructions',
        'logo_url',
        'banner_url',
        'rating_avg',
        'total_reviews',
        'is_verified',
        'is_active',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'rating_avg' => 'float',
        'total_reviews' => 'integer',
        'is_verified' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}