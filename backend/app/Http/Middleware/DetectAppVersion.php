<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\AppVersion;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class DetectAppVersion
{
    /**
     * Inspects client version headers and attaches them to the request.
     * Asynchronously records client activity in the app_versions table for analytics.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $versionName = $request->header('X-App-Version', 'unknown');
        $versionCode = (int) $request->header('X-App-Version-Code', 0);
        $platform    = strtolower($request->header('X-Platform', 'android'));

        // Attach parsed versioning context to request attributes
        $request->merge([
            '_app_version'      => $versionName,
            '_app_version_code' => $versionCode,
            '_app_platform'     => $platform,
        ]);

        // Record version activity asynchronously (never fail the user's request)
        if ($versionCode > 0) {
            try {
                $this->recordVersionActivity($versionName, $versionCode, $platform);
            } catch (\Throwable $e) {
                Log::warning('[AppVersion] Failed to record activity: ' . $e->getMessage());
            }
        }

        return $next($request);
    }

    private function recordVersionActivity(
        string $versionName,
        int $versionCode,
        string $platform
    ): void {
        AppVersion::updateOrCreate(
            ['version_code' => $versionCode, 'platform' => $platform],
            ['version_name' => $versionName, 'first_seen_at' => now()]
        );

        AppVersion::where('version_code', $versionCode)
            ->where('platform', $platform)
            ->update([
                'last_seen_at'  => now(),
                'request_count' => DB::raw('request_count + 1'),
            ]);
    }
}
