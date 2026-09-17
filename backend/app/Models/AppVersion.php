<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AppVersion extends Model
{
    use HasFactory;

    protected $table = 'app_versions';

    protected $fillable = [
        'version_name',
        'version_code',
        'platform',
        'is_blacklisted',
        'force_update',
        'deprecation_message',
        'blacklisted_at',
        'request_count',
        'first_seen_at',
        'last_seen_at',
    ];

    protected $casts = [
        'version_code'   => 'integer',
        'is_blacklisted' => 'boolean',
        'force_update'   => 'boolean',
        'request_count'  => 'integer',
        'blacklisted_at' => 'datetime',
        'first_seen_at'  => 'datetime',
        'last_seen_at'   => 'datetime',
    ];

    /**
     * Scope for active/allowed versions.
     */
    public function scopeAllowed($query)
    {
        return $query->where('is_blacklisted', false);
    }

    /**
     * Scope for blacklisted versions.
     */
    public function scopeBlacklisted($query)
    {
        return $query->where('is_blacklisted', true);
    }
}
