<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Support\Facades\DB;
use App\Traits\HasNormalizedImages;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasUuids, HasRoles, HasNormalizedImages;

    protected $fillable = [
        'phone',
        'email',
        'full_name',
        'role',
        'status',
        'avatar_url',
        'is_phone_verified',
        'available_roles',
        'password',
        'pin',
        'otp',
        'otp_expires_at',
    ];

    protected $hidden = [
        'password',
        'pin',
        'remember_token',
        'otp',
    ];

    protected $casts = [
        'is_phone_verified' => 'boolean',
        'available_roles' => 'array',
        'otp_expires_at' => 'datetime',
    ];

    public function getAvatarUrlAttribute($value): ?string
    {
        return self::normalizeImageUrl($value);
    }

    public function setAvatarUrlAttribute($value): void
    {
        $this->attributes['avatar_url'] = self::cleanImageForStorage($value);
    }

    public function store()
    {
        return $this->hasOne(Store::class);
    }

    public function wallet()
    {
        return $this->hasOne(Wallet::class);
    }

    public function transporter()
    {
        return $this->hasOne(Transporter::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class, 'customer_id');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function deviceTokens()
    {
        return $this->hasMany(UserDeviceToken::class);
    }

    public function addresses()
    {
        return $this->hasMany(Address::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Compute fine-grained user permissions based on active role and status.
     */
    public function getPermissionsList(): array
    {
        $role = $this->role ?? 'buyer';
        $status = $this->status ?? 'active';

        if ($status !== 'active') {
            return ['browse_catalog', 'view_product'];
        }

        $permissionsByRole = [
            'buyer' => [
                'browse_catalog',
                'view_product',
                'create_order',
                'cancel_order',
                'manage_cart',
                'manage_wallet',
                'fund_wallet',
                'withdraw_wallet',
                'file_dispute',
                'submit_review',
                'manage_addresses',
                'view_orders',
                'track_delivery',
            ],
            'seller' => [
                'manage_store',
                'view_store_dashboard',
                'create_product',
                'edit_product',
                'delete_product',
                'manage_inventory',
                'accept_orders',
                'decline_orders',
                'fulfill_orders',
                'view_sales_analytics',
                'request_payout',
                'manage_store_profile',
                'submit_seller_kyc',
            ],
            'transporter' => [
                'view_dispatch_jobs',
                'accept_trip',
                'reject_trip',
                'update_trip_stage',
                'submit_proof_of_delivery',
                'scan_verification_code',
                'view_earnings',
                'withdraw_earnings',
                'submit_transporter_kyc',
            ],
            'staff' => [
                'access_staff_portal',
                'view_kyc_queue',
                'adjudicate_disputes',
                'audit_logs_read',
                'manage_system_roles',
                'financial_payout_override',
            ],
        ];

        $perms = $permissionsByRole[$role] ?? $permissionsByRole['buyer'];

        // If user has multiple available roles, include base buyer permissions for shopping
        if (in_array('buyer', $this->available_roles ?? []) && $role !== 'buyer') {
            $perms = array_values(array_unique(array_merge($perms, [
                'browse_catalog',
                'view_product',
                'create_order',
                'manage_cart',
            ])));
        }

        return $perms;
    }

    /**
     * Convert user model to a complete auth payload with all associated account details.
     */
    public function toAuthProfileArray(): array
    {
        $this->loadMissing(['wallet', 'addresses', 'store', 'transporter']);

        $defaultAddress = $this->addresses->firstWhere('is_default', true) ?? $this->addresses->first();

        $walletData = null;
        if ($this->wallet) {
            $walletData = [
                'id' => $this->wallet->id,
                'balance_available' => (float) $this->wallet->balance_available,
                'balance_escrow_locked' => (float) $this->wallet->balance_escrow_locked,
                'registration_bonus' => (float) ($this->wallet->registration_bonus ?? 0),
                'balance_withdrawable' => (float) $this->wallet->withdrawable_balance,
                'currency' => $this->wallet->currency ?? 'XAF',
            ];
        }

        $storeData = null;
        if ($this->store) {
            $storeSub = DB::table('seller_kyc_submissions')->where('user_id', $this->id)->latest('created_at')->first();
            $storeData = [
                'id' => $this->store->id,
                'store_name' => $this->store->store_name,
                'category' => $this->store->category,
                'rating_avg' => (float) ($this->store->rating_avg ?? 5.0),
                'is_verified' => (bool) $this->store->is_verified,
                'kyc_status' => $storeSub->status ?? ($this->store->is_verified ? 'approved' : 'pending'),
                'logo_url' => $this->store->logo_url,
            ];
        }

        $transporterData = null;
        if ($this->transporter) {
            $transporterSub = DB::table('transporter_kyc_submissions')->where('user_id', $this->id)->latest('created_at')->first();
            $isVerified = ($transporterSub->status ?? null) === 'approved' || in_array($this->transporter->status, ['active', 'online']);
            $transporterData = [
                'id' => $this->transporter->id,
                'vehicle_type' => $this->transporter->vehicle_type,
                'status' => $this->transporter->status ?? 'pending',
                'kyc_status' => $transporterSub->status ?? ($isVerified ? 'approved' : 'pending'),
                'is_verified' => $isVerified,
                'rating_avg' => (float) ($this->transporter->rating_avg ?? 5.0),
                'completed_trips' => (int) ($this->transporter->total_trips ?? 0),
            ];
        }

        return [
            'id' => $this->id,
            'phone' => $this->phone,
            'email' => $this->email,
            'full_name' => $this->full_name,
            'role' => $this->role ?? 'buyer',
            'status' => $this->status ?? 'active',
            'avatar_url' => $this->avatar_url,
            'is_phone_verified' => (bool) $this->is_phone_verified,
            'available_roles' => $this->available_roles ?? ['buyer'],
            'permissions' => $this->getPermissionsList(),
            'wallet' => $walletData,
            'default_address' => $defaultAddress ? [
                'id' => $defaultAddress->id,
                'label' => $defaultAddress->label,
                'address_text' => $defaultAddress->address_text,
                'city' => $defaultAddress->city,
                'latitude' => (float) $defaultAddress->latitude,
                'longitude' => (float) $defaultAddress->longitude,
                'is_default' => (bool) $defaultAddress->is_default,
            ] : null,
            'store' => $storeData,
            'transporter' => $transporterData,
            'created_at' => $this->created_at?->toIso8601String() ?? now()->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String() ?? now()->toIso8601String(),
        ];
    }
}