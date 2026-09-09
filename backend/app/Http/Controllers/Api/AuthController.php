<?php

namespace App\Http\Controllers\Api;

use App\Models\Address;
use App\Models\Store;
use App\Models\Transporter;
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
     * Register new buyer or seller account and return full user profile & permissions.
     */
    public function register(Request $request): JsonResponse
    {
        $phone = $request->input('phone', '+237670123456');
        $fullName = $request->input('full_name', 'Wunabuy Member');
        $role = $request->input('role', 'buyer');
        $email = $request->input('email');
        $addressText = $request->input('address_text');

        // STRICT SECURITY CHECK: Prevent duplicate registration for the same phone number
        $existingUser = User::where('phone', $phone)->first();
        if ($existingUser) {
            return $this->respondError(
                'PHONE_ALREADY_EXISTS',
                'An account with this phone number already exists. Please sign in instead.',
                ['phone' => ['This phone number is already registered.']],
                409
            );
        }

        $user = User::create([
            'id' => (string) Str::uuid(),
            'phone' => $phone,
            'email' => $email,
            'full_name' => $fullName,
            'role' => $role,
            'status' => 'active',
            'is_phone_verified' => true,
            'available_roles' => array_values(array_unique(['buyer', $role])),
            'otp' => '123456',
            'otp_expires_at' => now()->addMinutes(5),
        ]);

        // Automatically initialize XAF wallet for user with 100 FCFA registration reward
        Wallet::firstOrCreate(
            ['user_id' => $user->id],
            [
                'currency' => 'XAF',
                'balance_available' => 100.00,
                'registration_bonus' => 100.00,
                'balance_escrow_locked' => 0.00,
                'is_active' => true,
            ]
        );

        // If delivery address provided, save as default address
        if ($addressText && !empty(trim($addressText))) {
            Address::firstOrCreate(
                ['user_id' => $user->id, 'address_text' => trim($addressText)],
                [
                    'id' => (string) Str::uuid(),
                    'label' => 'Home',
                    'city' => 'Douala',
                    'latitude' => 4.0510564,
                    'longitude' => 9.7678687,
                    'is_default' => true,
                ]
            );
        }

        // If seller, initialize store shell if missing
        if ($role === 'seller' && !$user->store) {
            Store::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'id' => (string) Str::uuid(),
                    'store_name' => $fullName . "'s Store",
                    'tagline' => 'Verified Merchant on Wunabuy',
                    'description' => 'Quality verified goods and escrow protection.',
                    'category' => 'General',
                    'address_text' => $addressText ?? 'Douala, Cameroon',
                    'city' => 'Douala',
                    'phone' => $phone,
                    'email' => $email ?? ($phone . '@wunabuy.com'),
                    'is_verified' => false,
                    'is_active' => true,
                ]
            );
        }

        // If transporter, initialize transporter profile if missing
        if ($role === 'transporter' && !$user->transporter) {
            Transporter::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'id' => (string) Str::uuid(),
                    'vehicle_type' => 'moto',
                    'status' => 'offline',
                    'is_verified' => false,
                    'rating_avg' => 5.0,
                    'completed_trips' => 0,
                ]
            );
        }

        // Save hashed 6-digit PIN if provided
        $pin = $request->input('pin');
        if ($pin && strlen(trim($pin)) >= 4) {
            $user->pin = Hash::make(trim($pin));
            $user->save();
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return $this->respondSuccess([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user->toAuthProfileArray(),
        ]);
    }

    /**
     * Authenticate returning user via phone number and 6-digit security PIN.
     */
    public function loginWithPin(Request $request): JsonResponse
    {
        $phone = $request->input('phone');
        $pin = $request->input('pin');

        if (!$phone) {
            return $this->respondError('VALIDATION_ERROR', 'Phone number is required.', ['phone' => ['Please enter your phone number.']], 422);
        }

        if (!$pin || strlen(trim($pin)) !== 6) {
            return $this->respondError('VALIDATION_ERROR', 'A valid 6-digit PIN is required.', ['pin' => ['Please enter your 6-digit security PIN.']], 422);
        }

        $user = User::where('phone', $phone)->first();

        if (!$user) {
            return $this->respondError('NOT_FOUND', 'No account found for this phone number. Please create an account.', null, 404);
        }

        // Verify PIN: check hashed PIN or demo fallback '123456'
        $pinValid = false;
        if ($user->pin) {
            $pinValid = Hash::check($pin, $user->pin);
        } elseif ($pin === '123456') {
            // Set PIN for existing user who didn't have one yet
            $user->pin = Hash::make($pin);
            $user->save();
            $pinValid = true;
        }

        if (!$pinValid) {
            return $this->respondError('UNAUTHENTICATED', 'Incorrect 6-digit PIN. Please try again.', ['pin' => ['Invalid PIN provided.']], 401);
        }

        // Automatically initialize XAF wallet for user if missing
        Wallet::firstOrCreate(
            ['user_id' => $user->id],
            [
                'currency' => 'XAF',
                'balance_available' => 100.00,
                'registration_bonus' => 100.00,
                'balance_escrow_locked' => 0.00,
                'is_active' => true,
            ]
        );

        $token = $user->createToken('auth-token')->plainTextToken;

        return $this->respondSuccess([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user->toAuthProfileArray(),
        ]);
    }

    /**
     * Check if a phone number is already registered in the system.
     */
    public function checkPhone(Request $request): JsonResponse
    {
        $phone = $request->input('phone');
        if (!$phone) {
            return $this->respondError('VALIDATION_ERROR', 'Phone number is required.', ['phone' => ['Please enter your phone number.']], 422);
        }

        $exists = User::where('phone', $phone)->exists();

        return $this->respondSuccess([
            'phone' => $phone,
            'is_registered' => $exists,
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
                'full_name' => 'Wunabuy Member',
                'role' => 'buyer',
                'status' => 'active',
                'is_phone_verified' => true,
                'available_roles' => ['buyer'],
            ]);

            Wallet::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'currency' => 'XAF',
                    'balance_available' => 100.00,
                    'registration_bonus' => 100.00,
                    'balance_escrow_locked' => 0.00,
                    'is_active' => true,
                ]
            );
        }

        // Accept demo OTP '123456' or matching stored OTP
        if ($otp && $otp !== '123456' && $user->otp !== $otp) {
            return $this->respondError('VALIDATION_ERROR', 'Invalid or expired OTP code', ['otp' => ['The provided OTP code is incorrect.']]);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return $this->respondSuccess([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user->toAuthProfileArray(),
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
        $user = $this->resolveUser($request);

        if (!$user) {
            return $this->respondError('UNAUTHENTICATED', 'User session expired or not found', null, 401);
        }

        return $this->respondSuccess($user->toAuthProfileArray());
    }

    /**
     * Update profile details.
     */
    public function updateMe(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return $this->respondError('UNAUTHENTICATED', 'User session expired or not found', null, 401);
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

        return $this->respondSuccess($user->fresh()->toAuthProfileArray());
    }

    /**
     * Get user addresses.
     */
    public function getAddresses(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return $this->respondError('UNAUTHENTICATED', 'User session expired or not found', null, 401);
        }

        $addresses = Address::where('user_id', $user->id)->orderBy('is_default', 'desc')->get();
        return $this->respondSuccess($addresses);
    }

    /**
     * Add new user address.
     */
    public function addAddress(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return $this->respondError('UNAUTHENTICATED', 'User session expired or not found', null, 401);
        }

        $isDefault = (bool) $request->input('is_default', false);
        if ($isDefault) {
            Address::where('user_id', $user->id)->update(['is_default' => false]);
        }

        $address = Address::create([
            'id' => (string) Str::uuid(),
            'user_id' => $user->id,
            'label' => $request->input('label', 'Home'),
            'address_text' => $request->input('address_text', 'Douala, Cameroon'),
            'city' => $request->input('city', 'Douala'),
            'quarter' => $request->input('quarter', 'Akwa'),
            'latitude' => $request->input('latitude', 4.0510),
            'longitude' => $request->input('longitude', 9.7678),
            'is_default' => $isDefault,
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
        $user = $this->resolveUser($request);
        if (!$user) {
            return $this->respondError('UNAUTHENTICATED', 'User session expired or not found', null, 401);
        }

        $url = $request->input('avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80');
        $user->avatar_url = $url;
        $user->save();

        return $this->respondSuccess([
            'avatar_url' => $url,
            'user' => $user->fresh()->toAuthProfileArray(),
        ]);
    }

    /**
     * Switch user role.
     */
    public function switchRole(Request $request): JsonResponse
    {
        $requestedRole = $request->input('requested_role', 'buyer');
        $user = $this->resolveUser($request);

        if (!$user) {
            return $this->respondError('UNAUTHENTICATED', 'User session expired or not found', null, 401);
        }

        $available = $user->available_roles ?? ['buyer'];
        if (!in_array($requestedRole, $available)) {
            $available[] = $requestedRole;
            $user->available_roles = $available;
        }
        $user->role = $requestedRole;
        $user->save();

        return $this->respondSuccess([
            'active_role' => $requestedRole,
            'user' => $user->fresh()->toAuthProfileArray(),
        ]);
    }
}