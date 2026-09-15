<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\HasNormalizedImages;

class Advert extends Model
{
    use HasFactory, HasUuids, HasNormalizedImages;

    protected $fillable = [
        'target_audience',
        'type',
        'badge',
        'badge_color',
        'title',
        'subtitle',
        'cta_text',
        'action_screen',
        'action_url',
        'image_url',
        'icon_name',
        'icon_color',
        'category',
        'discount_percent',
        'sort_order',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'discount_percent' => 'integer',
        'sort_order' => 'integer',
        'is_active' => 'boolean',
    ];

    public function getImageUrlAttribute($value): ?string
    {
        return self::normalizeImageUrl($value);
    }

    public function setImageUrlAttribute($value): void
    {
        $this->attributes['image_url'] = self::cleanImageForStorage($value);
    }
}

