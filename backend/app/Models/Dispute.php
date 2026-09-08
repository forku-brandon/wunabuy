<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Dispute extends Model
{
    use HasFactory, HasUuids;

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