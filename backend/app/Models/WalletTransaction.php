<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WalletTransaction extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'wallet_id',
        'type',
        'amount',
        'currency',
        'provider',
        'status',
        'reference',
        'description',
    ];

    protected $casts = [
        'amount' => 'float',
    ];

    public function wallet()
    {
        return $this->belongsTo(Wallet::class);
    }
}