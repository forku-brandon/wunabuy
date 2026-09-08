<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'store_id',
        'name',
        'description',
        'category',
        'price',
        'currency',
        'quantity',
        'quality_tier',
        'images',
        'is_active',
        'rating_avg',
        'total_reviews',
    ];

    protected $casts = [
        'price' => 'float',
        'quantity' => 'integer',
        'images' => 'array',
        'is_active' => 'boolean',
        'rating_avg' => 'float',
        'total_reviews' => 'integer',
    ];

    public function store()
    {
        return $this->belongsTo(Store::class);
    }
}