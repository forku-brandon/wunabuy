<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\AppVersion;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class BlockBlacklistedVersion
{
    /**
     * Hard-blocks any request from a blacklisted or outdated client app version.
     * Enforces RFC 7231 HTTP 426 Upgrade Required.
     *
     * Applied to all money-touching, escrow, and sensitive routes.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $versionCode = (int) $request->header('X-App-Version-Code', 0);
        $platform    = strtolower($request->header('X-Platform', 'android'));

        // Cache blacklisted codes per platform for 5 minutes
        $cacheKey = "wunabuy_blacklisted_versions_{$platform}";
        $blacklistedCodes = Cache::remember($cacheKey, 300, function () use ($platform) {
            return AppVersion::where('platform', $platform)
                ->where('is_blacklisted', true)
                ->pluck('version_code')
                ->toArray();
        });

        $minVersionCode = (int) config('wunabuy.min_version_code', 1);
        $isBlacklisted  = in_array($versionCode, $blacklistedCodes, true);
        $isBelowMin     = $versionCode > 0 && $versionCode < $minVersionCode;

        if ($isBlacklisted || $isBelowMin) {
            Log::warning('[WunabuySecurity] Blocked request from deprecated app version', [
                'version_code' => $versionCode,
                'platform'     => $platform,
                'ip'           => $request->ip(),
                'endpoint'     => $request->path(),
                'user_agent'   => $request->userAgent(),
                'user_id'      => $request->header('X-User-Id', 'unauthenticated'),
            ]);

            return response()->json([
                'success' => false,
                'error'   => [
                    'code'    => 'VERSION_BLACKLISTED',
                    'message' => 'This version of Wunabuy has been decommissioned for security reasons. Please update from the Google Play Store to continue.',
                    'action'  => 'force_update',
                ],
            ], 426); // 426 Upgrade Required
        }

        return $next($request);
    }
}
