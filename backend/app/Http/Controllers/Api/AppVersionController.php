<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\AppVersion;

class AppVersionController extends Controller
{
    /**
     * GET /api/app/version-check and GET /api/v1/app/version-check
     * Public endpoint — no auth required.
     * Evaluates client versionCode against server policy and returns update directives.
     */
    public function check(Request $request): JsonResponse
    {
        $versionCode = (int) $request->header('X-App-Version-Code', 0);
        $platform    = strtolower($request->header('X-Platform', 'android'));

        // Query blacklisted codes for this platform
        $blacklistedCodes = AppVersion::where('platform', $platform)
            ->where('is_blacklisted', true)
            ->pluck('version_code')
            ->toArray();

        $minVersionCode    = (int) config('wunabuy.min_version_code', 1);
        $latestVersionCode = (int) config('wunabuy.latest_version_code', 2);
        $latestVersion     = config('wunabuy.latest_version', '1.1.0');

        $isBlacklisted = in_array($versionCode, $blacklistedCodes, true);
        $isBelowMin    = $versionCode > 0 && $versionCode < $minVersionCode;
        $forceUpdate   = $isBlacklisted || $isBelowMin;

        $updateMessage = null;
        if ($forceUpdate) {
            $record = AppVersion::where('version_code', $versionCode)
                ->where('platform', $platform)
                ->first();

            $updateMessage = $record?->deprecation_message
                ?? 'A critical security update is required to use Wunabuy. Please update from the Google Play Store to continue.';
        }

        $responseData = [
            'success'              => !$forceUpdate,
            'min_version_code'     => $minVersionCode,
            'blacklisted_versions' => $blacklistedCodes,
            'force_update'         => $forceUpdate,
            'latest_version_code'  => $latestVersionCode,
            'latest_version'       => $latestVersion,
            'update_message'       => $updateMessage,
            'issued_at'            => now()->toIso8601String(),
        ];

        // Tamper-proof signature verification against MITM interception
        $secret = config('wunabuy.version_check_secret', 'wunabuy-sec-escrow-cemac-key-2026');
        $payloadToSign = json_encode($responseData, JSON_UNESCAPED_UNICODE);
        $responseData['_sig'] = hash_hmac('sha256', $payloadToSign, $secret);

        return response()->json($responseData, $forceUpdate ? 426 : 200);
    }
}
