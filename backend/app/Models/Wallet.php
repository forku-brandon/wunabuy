<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Wallet extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'balance_available',
        'balance_escrow_locked',
        'registration_bonus',
        'currency',
        'is_active',
    ];

    protected $casts = [
        'balance_available' => 'float',
        'balance_escrow_locked' => 'float',
        'registration_bonus' => 'float',
        'is_active' => 'boolean',
    ];

    /**
     * Net balance available for withdrawal (excluding non-withdrawable promotional registration rewards).
     */
    public function getWithdrawableBalanceAttribute(): float
    {
        return max(0, (float) $this->balance_available - (float) ($this->registration_bonus ?? 0));
    }


    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function transactions()
    {
        return $this->hasMany(WalletTransaction::class);
    }
}