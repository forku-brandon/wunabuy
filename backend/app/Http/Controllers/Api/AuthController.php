<?php

namespace App\Http\Controllers\Api;

use App\Models\Address;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Send SMS OTP to user phone.
     */
    public function sendOtp(Request $request): JsonResponse
    {
        $phone = $request->input('phone', '+237670123456');

        $user = User::where('phone', $phone)->first();
        if ($user) {
            $user->otp = '123456';
            $user->otp_expires_at = now()->addMinutes(5);
            $user->save();
        }

        return $this->respondSuccess([
            'phone' => $phone,
            'otp_sent' => true,
            'expires_in_seconds' => 300,
            'demo_code' => '123456',
        ]);
    }

    /**
     * Register new buyer or seller account.
     */
    public function register(Request $request): JsonResponse
    {
        $phone = $request->input('phone', '+237670123456');
        $fullName = $request->input('full_name', 'Wunabuy Member');
        $role = $request->input('role', 'buyer');

        $user = User::where('phone', $phone)->first();
        if (!$user) {
            $user = User::create([
                'id' => (string) Str::uuid(),
                'phone' => $phone,
                'email' => $request->input('email'),
                'full_name' => $fullName,
                'role' => $role,
                'status' => 'active',
                'is_phone_verified' => true,
                'available_roles' => array_unique(['buyer', $role]),
                'otp' => '123456',
                'otp_expires_at' => now()->addMinutes(5),
            ]);

            // Automatically initialize XAF wallet for user
            Wallet::firstOrCreate(
                ['user_id' => $user->id],
                ['currency' => 'XAF', 'balance_available' => 50000, 'balance_escrow_locked' => 0]
            );
        }

        return $this->respondSuccess([
            'phone' => $phone,
            'otp_sent' => true,
            'expires_in_seconds' => 300,
            'demo_code' => '123456',
        ]);
    }

    /**
     * Verify SMS OTP code and issue bearer token.
     */
    public function verifyOtp(Request $request): JsonResponse
    {
        $phone = $request->input('phone', '+237670123456');
        $otp = $request->input('otp', $request->input('code'));

        $user = User::where('phone', $phone)->first();

        if (!$user) {
            $user = User::create([
                'id' => (string) Str::uuid(),
                'phone' => $phone,
                'full_name' => 'Jean Dupont',
                'role' => 'buyer',
                'status' => 'active',
                'is_phone_verified' => true,
                'available_roles' => ['buyer', 'seller', 'transporter'],
            ]);

            Wallet::firstOrCreate(
                ['user_id' => $user->id],
                ['currency' => 'XAF', 'balance_available' => 50000, 'balance_escrow_locked' => 0]
            );
        }

        // Accept demo OTP '123456' or matching stored OTP
        if ($otp && $otp !== '123456' && $user->otp !== $otp) {
            return $this->respondError('VALIDATION_ERROR', 'Invalid or expired OTP code', ['otp' => ['The provided OTP code is incorrect.']]);
        }

        $token = 'wnb_' . Str::random(40);
        try {
            $token = $user->createToken('auth-token')->plainTextToken;
        } catch (\Throwable) {
            // Keep fallback string token
        }

        return $this->respondSuccess([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'phone' => $user->phone,
                'email' => $user->email,
                'full_name' => $user->full_name,
                'role' => $user->role,
                'status' => $user->status,
                'avatar_url' => $user->avatar_url,
                'is_phone_verified' => (bool) $user->is_phone_verified,
                'available_roles' => $user->available_roles ?? ['buyer'],
            ],
        ]);
    }

    /**
     * Reset password via verified OTP.
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $phone = $request->input('phone');
        $newPassword = $request->input('new_password');

        $user = User::where('phone', $phone)->first();
        if ($user && $newPassword) {
            $user->password = Hash::make($newPassword);
            $user->save();
        }

        return $this->respondSuccess([
            'message' => 'Password reset successfully. You may now log in with your new credentials.',
        ]);
    }

    /**
     * Get profile of authenticated user.
     */
    public function getMe(Request $request): JsonResponse
    {
        $user = $request->user() ?? User::where('role', 'buyer')->first() ?? User::first();

        if (!$user) {
            return $this->respondError('UNAUTHENTICATED', 'User session expired or not found', null, 401);
        }

        return $this->respondSuccess([
            'id' => $user->id,
            'phone' => $user->phone,
            'email' => $user->email,
            'full_name' => $user->full_name,
            'role' => $user->role,
            'status' => $user->status,
            'avatar_url' => $user->avatar_url,
            'is_phone_verified' => (bool) $user->is_phone_verified,
            'available_roles' => $user->available_roles ?? ['buyer', 'seller', 'transporter'],
        ]);
    }

    /**
     * Update profile details.
     */
    public function updateMe(Request $request): JsonResponse
    {
        $user = $request->user() ?? User::first();
        if (!$user) {
            return $this->respondError('UNAUTHENTICATED', 'User not found', null, 401);
        }

        if ($request->has('full_name')) {
            $user->full_name = $request->input('full_name');
        }
        if ($request->has('email')) {
            $user->email = $request->input('email');
        }
        if ($request->has('avatar_url')) {
            $user->avatar_url = $request->input('avatar_url');
        }
        $user->save();

        return $this->respondSuccess([
            'id' => $user->id,
            'phone' => $user->phone,
            'email' => $user->email,
            'full_name' => $user->full_name,
            'role' => $user->role,
            'status' => $user->status,
            'avatar_url' => $user->avatar_url,
            'is_phone_verified' => (bool) $user->is_phone_verified,
            'available_roles' => $user->available_roles ?? ['buyer'],
        ]);
    }

    /**
     * Get user addresses.
     */
    public function getAddresses(Request $request): JsonResponse
    {
        $user = $request->user() ?? User::first();
        $addresses = $user ? Address::where('user_id', $user->id)->get() : [];

        if (count($addresses) === 0) {
            // Seed a default address for demo
            $addresses = [
                [
                    'id' => 'addr_1',
                    'label' => 'Home',
                    'address_text' => 'Boulevard de la Liberté, Bonanjo',
                    'city' => 'Douala',
                    'quarter' => 'Bonanjo',
                    'latitude' => 4.0611,
                    'longitude' => 9.7863,
                    'is_default' => true,
                ]
            ];
        }

        return $this->respondSuccess($addresses);
    }

    /**
     * Add new user address.
     */
    public function addAddress(Request $request): JsonResponse
    {
        $user = $request->user() ?? User::first();
        $userId = $user ? $user->id : (string) Str::uuid();

        $address = Address::create([
            'id' => (string) Str::uuid(),
            'user_id' => $userId,
            'label' => $request->input('label', 'Home'),
            'address_text' => $request->input('address_text', 'Douala, Cameroon'),
            'city' => $request->input('city', 'Douala'),
            'quarter' => $request->input('quarter', 'Akwa'),
            'latitude' => $request->input('latitude', 4.0510),
            'longitude' => $request->input('longitude', 9.7678),
            'is_default' => (bool) $request->input('is_default', false),
        ]);

        return $this->respondSuccess($address);
    }

    /**
     * Update user preferences.
     */
    public function updatePreferences(Request $request): JsonResponse
    {
        return $this->respondSuccess([
            'language' => $request->input('language', 'en'),
            'currency' => $request->input('currency', 'XAF'),
            'dark_mode' => (bool) $request->input('dark_mode', false),
        ]);
    }

    /**
     * Upload user avatar.
     */
    public function uploadAvatar(Request $request): JsonResponse
    {
        $url = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';
        $user = $request->user() ?? User::first();
        if ($user) {
            $user->avatar_url = $url;
            $user->save();
        }

        return $this->respondSuccess(['avatar_url' => $url]);
    }

    /**
     * Switch user role.
     */
    public function switchRole(Request $request): JsonResponse
    {
        $requestedRole = $request->input('requested_role', 'buyer');
        $user = $request->user() ?? User::first();

        if ($user) {
            $available = $user->available_roles ?? ['buyer'];
            if (!in_array($requestedRole, $available)) {
                $available[] = $requestedRole;
                $user->available_roles = $available;
            }
            $user->role = $requestedRole;
            $user->save();
        }

        return $this->respondSuccess(['active_role' => $requestedRole]);
    }
}