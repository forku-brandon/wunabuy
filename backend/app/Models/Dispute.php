<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\HasNormalizedImages;

class Dispute extends Model
{
    use HasFactory, HasUuids, HasNormalizedImages;

    protected $fillable = [
        'order_id',
        'user_id',
        'reason',
        'description',
        'evidence_photos',
        'status',
        'resolution',
        'refund_amount',
        'resolved_by',
        'resolved_at',
    ];

    protected $casts = [
        'evidence_photos' => 'array',
        'refund_amount' => 'float',
        'resolved_at' => 'datetime',
    ];

    public function getEvidencePhotosAttribute($value): array
    {
        $decoded = is_string($value) ? json_decode($value, true) : (is_array($value) ? $value : []);
        return self::normalizeImageArray($decoded);
    }

    public function setEvidencePhotosAttribute($value): void
    {
        $array = is_string($value) ? json_decode($value, true) : (is_array($value) ? $value : []);
        $cleaned = self::cleanImageArrayForStorage($array);
        $this->attributes['evidence_photos'] = json_encode($cleaned);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function raisedBy()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}