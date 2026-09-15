<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Traits\HasNormalizedImages;

class Product extends Model
{
    use HasFactory, HasUuids, HasNormalizedImages;

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

    protected $appends = [
        'image_url',
    ];

    public function getImageUrlAttribute(): ?string
    {
        $images = $this->images;
        return !empty($images) && isset($images[0]) ? $images[0] : null;
    }

    public function getImagesAttribute($value): array
    {
        $decoded = is_string($value) ? json_decode($value, true) : (is_array($value) ? $value : []);
        return self::normalizeImageArray($decoded);
    }

    public function setImagesAttribute($value): void
    {
        $array = is_string($value) ? json_decode($value, true) : (is_array($value) ? $value : []);
        $cleaned = self::cleanImageArrayForStorage($array);
        $this->attributes['images'] = json_encode($cleaned);
    }

    public function store()
    {
        return $this->belongsTo(Store::class);
    }
}