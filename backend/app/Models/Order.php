<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'order_code',
        'customer_id',
        'store_id',
        'transporter_id',
        'status',
        'subtotal',
        'delivery_fee',
        'commission',
        'total',
        'currency',
        'delivery_address',
        'payment_method',
        'payment_ref',
        'pickup_pin',
        'signature_data',
        'expires_at',
        'delivered_at',
    ];

    protected $casts = [
        'subtotal' => 'float',
        'delivery_fee' => 'float',
        'commission' => 'float',
        'total' => 'float',
        'delivery_address' => 'array',
        'expires_at' => 'datetime',
        'delivered_at' => 'datetime',
    ];

    protected $appends = [
        'total_amount',
        'payment_status',
        'pickup_verification_pin',
    ];

    public function getTotalAmountAttribute(): float
    {
        return (float) ($this->attributes['total'] ?? 0);
    }

    public function getPickupVerificationPinAttribute(): ?string
    {
        return $this->attributes['pickup_pin'] ?? null;
    }

    public function getPaymentStatusAttribute(): string
    {
        return match ($this->attributes['status'] ?? 'pending') {
            'delivered', 'completed' => 'released',
            'disputed' => 'frozen',
            'cancelled' => 'refunded',
            default => 'escrow_locked',
        };
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public function transporter()
    {
        return $this->belongsTo(Transporter::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function dispute()
    {
        return $this->hasOne(Dispute::class);
    }
}