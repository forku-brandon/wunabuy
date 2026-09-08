<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'order_id',
        'product_id',
        'name',
        'price',
        'quantity',
        'image_url',
    ];

    protected $casts = [
        'price' => 'float',
        'quantity' => 'integer',
    ];

    protected $appends = [
        'product_name',
        'unit_price',
        'total_price',
    ];

    public function getProductNameAttribute(): string
    {
        return $this->attributes['name'] ?? '';
    }

    public function getUnitPriceAttribute(): float
    {
        return (float) ($this->attributes['price'] ?? 0);
    }

    public function getTotalPriceAttribute(): float
    {
        return (float) (($this->attributes['price'] ?? 0) * ($this->attributes['quantity'] ?? 1));
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}