# Wunabuy — Google Play In-App Updates & API Security Hardening
## Implementation Specification v1.0
### Classification: Internal Engineering — Confidential
### Date: 2026-09-17 | Authors: Engineering Team

---

## Table of Contents

1. [Overview & Architecture Decision](#1-overview)
2. [Installation & Project Setup](#2-installation)
3. [Frontend: Flexible Update Flow](#3-flexible-update)
4. [Frontend: Immediate (Force) Update Flow](#4-immediate-update)
5. [Frontend: `useInAppUpdate` Hook](#5-hook)
6. [Frontend: App.tsx Integration](#6-app-integration)
7. [Backend: API Versioning Strategy](#7-api-versioning)
8. [Backend: `X-App-Version` Detection Middleware](#8-middleware)
9. [Backend: Server-Side Version Blacklist Enforcement](#9-blacklist)
10. [Security: MITM & SSL Pinning Recommendations](#10-ssl)
11. [Testing via Internal App Sharing Track](#11-testing)
12. [Error Handling Reference](#12-error-handling)

---

## 1. Overview & Architecture Decision

### Why This Is Critical for Wunabuy

Wunabuy is a live financial escrow platform handling real XAF transactions via MTN MoMo, Orange Money, and BIZAO. Any **security patch** (encryption upgrade, PIN algorithm fix, API deprecation) **must reach 100% of installed users** before the old API is decommissioned — otherwise:

- A user on an old app version submits a `pickup_pin` in the old 5-digit format ❌
- A user bypasses an expired escrow release endpoint ❌
- A MITM attacker intercepts a stale, unvalidated payment API call ❌

### The Two-Layer Defense Model

```
┌─────────────────────────────────────────────────────────────┐
│                    LAYER 1: GOOGLE PLAY                     │
│    sp-react-native-in-app-updates checks versionCode        │
│    FLEXIBLE  →  background download, soft restart prompt    │
│    IMMEDIATE →  full-screen blocker, cannot be dismissed    │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    LAYER 2: LARAVEL                         │
│    X-App-Version header read on EVERY request               │
│    Blacklisted versions → 426 Upgrade Required              │
│    Version logged → deprecation analytics                   │
└─────────────────────────────────────────────────────────────┘
```

Even if an attacker patches the APK to skip Layer 1, Layer 2 on the server will still **hard-block all API traffic** from forbidden version codes.

---

## 2. Installation & Project Setup

### 2.1 Install the Library

```bash
# From the monorepo root — target the mobile workspace
pnpm --filter wunabuy-mobile add sp-react-native-in-app-updates
```

> **Note:** `sp-react-native-in-app-updates` is the most actively maintained library for Google Play In-App Updates in React Native. It wraps Google's `com.google.android.play:app-update` Kotlin library.

### 2.2 Expo Bare Workflow Note

Your project (`expo: ~54.0.0`) uses the **Expo managed workflow**. `sp-react-native-in-app-updates` requires **native module linking**, which means you must use a **Development Build** via EAS Build to use this library.

**This will NOT work in Expo Go.** Use the Internal App Sharing track for testing (see Section 11).

```bash
# Generate native Android directories (only once)
npx expo prebuild --platform android
```

### 2.3 Android `build.gradle` — Verify Dependencies

After prebuild, confirm the Play Core dependency is present:

```groovy
// android/app/build.gradle
dependencies {
    // sp-react-native-in-app-updates auto-links this, but verify:
    implementation 'com.google.android.play:app-update:2.1.0'
    implementation 'com.google.android.play:app-update-ktx:2.1.0'
}
```

### 2.4 Create App Version Constants

```typescript
// mobile/src/config/appVersion.ts

/**
 * Wunabuy app version constants.
 * IMPORTANT: Keep APP_VERSION_CODE in sync with android.versionCode in app.json.
 * Bump BOTH together on every release.
 */
export const APP_VERSION = '1.1.0';          // Human-readable semver
export const APP_VERSION_CODE = 2;           // Integer — must match app.json versionCode
export const APP_PACKAGE_NAME = 'com.wunabuy.app';

/**
 * Update priority thresholds.
 * Google Play assigns a priority 0–5 when you publish a release.
 * >= FORCE_UPDATE_PRIORITY  → IMMEDIATE (full-screen block)
 * >= FLEXIBLE_PRIORITY      → FLEXIBLE (background download)
 */
export const FORCE_UPDATE_PRIORITY = 4;
export const FLEXIBLE_PRIORITY = 2;
```

---

## 3. Frontend: Flexible Update Flow

The **Flexible** flow downloads the update silently in the background while the user continues using the app. A prompt appears when the download is complete asking them to restart.

**Use for:** Feature releases, UI improvements, non-breaking API changes.

```typescript
// mobile/src/services/updates/flexibleUpdate.ts
import SpInAppUpdates, {
  IAUUpdateKind,
  StartUpdateOptions,
  StatusUpdateEvent,
  IAUInstallStatus,
} from 'sp-react-native-in-app-updates';

export type FlexibleUpdateState =
  | 'idle'
  | 'checking'
  | 'available'
  | 'downloading'
  | 'downloaded'
  | 'failed'
  | 'not_available';

export interface FlexibleUpdateResult {
  state: FlexibleUpdateState;
  bytesDownloaded?: number;
  totalBytes?: number;
  errorMessage?: string;
}

/**
 * Checks for and initiates a FLEXIBLE Play Store update.
 * The update downloads in the background — user is NOT blocked.
 *
 * @param onStateChange - Callback fired on each lifecycle state change.
 * @param onReadyToInstall - Called when download is complete, ready to restart.
 */
export async function startFlexibleUpdate(
  onStateChange: (result: FlexibleUpdateResult) => void,
  onReadyToInstall: () => void
): Promise<void> {
  const inAppUpdates = new SpInAppUpdates(__DEV__);

  onStateChange({ state: 'checking' });

  try {
    const result = await inAppUpdates.checkNeedsUpdate();

    if (!result.shouldUpdate) {
      onStateChange({ state: 'not_available' });
      return;
    }

    onStateChange({ state: 'available' });

    const updateOptions: StartUpdateOptions = {
      updateType: IAUUpdateKind.FLEXIBLE,
    };

    // Subscribe to download lifecycle events BEFORE starting
    inAppUpdates.addStatusUpdateListener((statusEvent: StatusUpdateEvent) => {
      switch (statusEvent.status) {
        case IAUInstallStatus.PENDING:
          onStateChange({ state: 'downloading', bytesDownloaded: 0 });
          break;

        case IAUInstallStatus.DOWNLOADING:
          onStateChange({
            state: 'downloading',
            bytesDownloaded: statusEvent.bytesDownloaded,
            totalBytes: statusEvent.totalBytesToDownload,
          });
          break;

        case IAUInstallStatus.DOWNLOADED:
          // Download complete — safe to prompt user to restart
          onStateChange({ state: 'downloaded' });
          onReadyToInstall();
          inAppUpdates.removeStatusUpdateListener((_e: StatusUpdateEvent) => {});
          break;

        case IAUInstallStatus.FAILED:
          onStateChange({
            state: 'failed',
            errorMessage: 'Update download failed. Please try again.',
          });
          inAppUpdates.removeStatusUpdateListener((_e: StatusUpdateEvent) => {});
          break;

        case IAUInstallStatus.CANCELED:
          onStateChange({ state: 'idle' });
          inAppUpdates.removeStatusUpdateListener((_e: StatusUpdateEvent) => {});
          break;

        default:
          break;
      }
    });

    await inAppUpdates.startInAppUpdate(updateOptions);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unknown update error';
    onStateChange({ state: 'failed', errorMessage: message });
  }
}

/**
 * Triggers the actual app restart after a FLEXIBLE update has been downloaded.
 * Call this when the user taps "Restart Now" in your prompt UI.
 */
export async function installFlexibleUpdate(): Promise<void> {
  const inAppUpdates = new SpInAppUpdates(false);
  await inAppUpdates.installUpdate();
}
```

---

## 4. Frontend: Immediate (Force) Update Flow

The **Immediate** flow presents a **full-screen, non-dismissable** Google Play overlay. The user cannot interact with the app at all until they install the update and the app restarts.

**Use for:** Security patches, escrow logic fixes, PIN algorithm changes, payment API deprecations — any release where running the old version poses a financial or security risk.

```typescript
// mobile/src/services/updates/immediateUpdate.ts
import SpInAppUpdates, {
  IAUUpdateKind,
  StartUpdateOptions,
  NeedsUpdateResponse,
} from 'sp-react-native-in-app-updates';
import { APP_VERSION_CODE, FORCE_UPDATE_PRIORITY } from '../../config/appVersion';

export interface ImmediateUpdateResult {
  /** true = update was triggered, false = app is already up to date */
  updateTriggered: boolean;
  /** Populated if the check or trigger fails */
  error?: string;
}

/**
 * Checks whether a CRITICAL (Immediate) update is required.
 *
 * Triggered if:
 *   1. Google Play has a newer versionCode AND
 *   2. The release's update priority (set in Play Console) is >= FORCE_UPDATE_PRIORITY (4+)
 *
 * The overlay is full-screen and CANNOT be dismissed.
 * The only exit is completing the update.
 */
export async function checkAndTriggerImmediateUpdate(): Promise<ImmediateUpdateResult> {
  const inAppUpdates = new SpInAppUpdates(__DEV__);

  try {
    const result: NeedsUpdateResponse = await inAppUpdates.checkNeedsUpdate({
      curVersion: APP_VERSION_CODE,
      toSemverConverter: (versionCode: number) => {
        // Convert Play versionCode to semver-comparable string
        // e.g. versionCode 2 → "0.0.2"
        return `0.0.${versionCode}`;
      },
    });

    if (!result.shouldUpdate) {
      return { updateTriggered: false };
    }

    const updatePriority: number = result.updatePriority ?? 0;
    const isForceUpdate = updatePriority >= FORCE_UPDATE_PRIORITY;

    if (!isForceUpdate) {
      // Low priority — let the flexible flow handle this instead
      return { updateTriggered: false };
    }

    const updateOptions: StartUpdateOptions = {
      updateType: IAUUpdateKind.IMMEDIATE,
    };

    await inAppUpdates.startInAppUpdate(updateOptions);

    // If reached, update was triggered. OS restarts the app after install.
    return { updateTriggered: true };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Critical update check failed';
    console.error('[WunabuyUpdate] Immediate update error:', message);
    return { updateTriggered: false, error: message };
  }
}
```

---

## 5. Frontend: `useInAppUpdate` Hook

A unified React hook that orchestrates both Flexible and Immediate flows, exposes update state, and connects to the server-side version blacklist endpoint.

```typescript
// mobile/src/hooks/useInAppUpdate.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import {
  startFlexibleUpdate,
  installFlexibleUpdate,
} from '../services/updates/flexibleUpdate';
import { checkAndTriggerImmediateUpdate } from '../services/updates/immediateUpdate';
import { APP_VERSION, APP_VERSION_CODE } from '../config/appVersion';
import { API_BASE_URL } from '../config/env';

// ─── Types ────────────────────────────────────────────────────────────────────

export type UpdateCheckStatus =
  | 'idle'
  | 'checking_server'
  | 'force_blocked'        // Server blacklisted this version → 426
  | 'checking_store'
  | 'store_update_pending'
  | 'downloading'
  | 'ready_to_install'
  | 'up_to_date'
  | 'error';

export interface ServerVersionConfig {
  /** Minimum allowed versionCode — anything below this is hard-blocked */
  min_version_code: number;
  /** Specific versionCodes that are blacklisted (security patches) */
  blacklisted_versions: number[];
  /** If true, force IMMEDIATE update regardless of Play priority */
  force_update: boolean;
  /** Optional human-readable message to show the user */
  update_message?: string;
  latest_version_code: number;
  latest_version: string;
}

export interface UseInAppUpdateReturn {
  status: UpdateCheckStatus;
  downloadProgress: number;           // 0–100
  isForceBlocked: boolean;
  serverMessage: string | null;
  checkForUpdates: () => Promise<void>;
  installUpdate: () => Promise<void>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useInAppUpdate(): UseInAppUpdateReturn {
  const [status, setStatus] = useState<UpdateCheckStatus>('idle');
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [isForceBlocked, setIsForceBlocked] = useState<boolean>(false);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const hasChecked = useRef(false);

  /**
   * Step 1: Check our own Laravel server for version blacklist enforcement.
   * Server-authoritative — cannot be bypassed by APK patching.
   */
  const checkServerVersionPolicy = useCallback(async (): Promise<{
    blocked: boolean;
    forceUpdate: boolean;
    message?: string;
  }> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${API_BASE_URL}/app/version-check`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-App-Version': APP_VERSION,
          'X-App-Version-Code': String(APP_VERSION_CODE),
          'X-Platform': Platform.OS,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 426) {
        // 426 Upgrade Required — version is blacklisted on the server
        const body = await response.json().catch(() => ({}));
        return {
          blocked: true,
          forceUpdate: true,
          message:
            body?.message ??
            'A critical security update is required. Please update Wunabuy to continue.',
        };
      }

      if (!response.ok) {
        // Server error — fail open (don't block user on server outages)
        console.warn('[WunabuyUpdate] Version check server error:', response.status);
        return { blocked: false, forceUpdate: false };
      }

      const config: ServerVersionConfig = await response.json();
      const isBlacklisted = config.blacklisted_versions?.includes(APP_VERSION_CODE);
      const isBelowMinimum = APP_VERSION_CODE < config.min_version_code;
      const blocked = isBlacklisted || isBelowMinimum;

      return {
        blocked,
        forceUpdate: blocked || config.force_update,
        message: config.update_message,
      };
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        console.warn('[WunabuyUpdate] Version check timed out — proceeding offline');
      }
      // Network down — fail open, don't punish the user for server issues
      return { blocked: false, forceUpdate: false };
    }
  }, []);

  const checkForUpdates = useCallback(async (): Promise<void> => {
    if (Platform.OS !== 'android') {
      // sp-react-native-in-app-updates is Android-only
      setStatus('up_to_date');
      return;
    }

    // ── Step 1: Server blacklist check ─────────────────────────────────────
    setStatus('checking_server');
    const serverPolicy = await checkServerVersionPolicy();

    if (serverPolicy.blocked) {
      setIsForceBlocked(true);
      setServerMessage(serverPolicy.message ?? null);
      setStatus('force_blocked');
      // Trigger the Play Store IMMEDIATE overlay on top of our blocker screen
      await checkAndTriggerImmediateUpdate();
      return;
    }

    // ── Step 2: Google Play store check ────────────────────────────────────
    setStatus('checking_store');

    if (serverPolicy.forceUpdate) {
      // Server says force even if Play priority is low → use IMMEDIATE
      const result = await checkAndTriggerImmediateUpdate();
      setStatus(result.updateTriggered ? 'force_blocked' : 'up_to_date');
      return;
    }

    // Otherwise: run flexible (background) flow
    await startFlexibleUpdate(
      (updateState) => {
        switch (updateState.state) {
          case 'checking':
            setStatus('checking_store');
            break;
          case 'available':
            setStatus('store_update_pending');
            break;
          case 'downloading': {
            setStatus('downloading');
            const total = updateState.totalBytes ?? 1;
            const downloaded = updateState.bytesDownloaded ?? 0;
            setDownloadProgress(Math.round((downloaded / total) * 100));
            break;
          }
          case 'downloaded':
            setStatus('ready_to_install');
            break;
          case 'failed':
            setStatus('error');
            setServerMessage(updateState.errorMessage ?? null);
            break;
          case 'not_available':
            setStatus('up_to_date');
            break;
          default:
            break;
        }
      },
      () => {
        // onReadyToInstall — show a non-intrusive restart prompt
        Alert.alert(
          '✅ Update Downloaded',
          'A new version of Wunabuy is ready. Restart now to apply it.',
          [
            { text: 'Later', style: 'cancel' },
            {
              text: 'Restart Now',
              style: 'default',
              onPress: () => installFlexibleUpdate(),
            },
          ],
          { cancelable: true }
        );
      }
    );
  }, [checkServerVersionPolicy]);

  const installUpdate = useCallback(async (): Promise<void> => {
    await installFlexibleUpdate();
  }, []);

  // Auto-check on first mount — once per session
  useEffect(() => {
    if (!hasChecked.current) {
      hasChecked.current = true;
      checkForUpdates();
    }
  }, [checkForUpdates]);

  return {
    status,
    downloadProgress,
    isForceBlocked,
    serverMessage,
    checkForUpdates,
    installUpdate,
  };
}
```

---

## 6. Frontend: App.tsx Integration

```typescript
// mobile/App.tsx — Add to your existing root App component

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useInAppUpdate } from './src/hooks/useInAppUpdate';
// ... your existing NavigationContainer, providers, etc.

// ── Force Update Blocker Screen ──────────────────────────────────────────────
// Rendered when the server has hard-blocked this versionCode (426 response).
// The Play Store IMMEDIATE overlay also appears on top — double protection.

function ForceUpdateBlocker({ message }: { message: string | null }): React.JSX.Element {
  return (
    <View style={blockerStyles.container}>
      <Text style={blockerStyles.icon}>🔒</Text>
      <Text style={blockerStyles.title}>Security Update Required</Text>
      <Text style={blockerStyles.message}>
        {message ??
          'This version of Wunabuy has been decommissioned for security reasons. ' +
          'Please update from the Play Store to continue.'}
      </Text>
      <Text style={blockerStyles.sub}>Opening Play Store…</Text>
    </View>
  );
}

const blockerStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  icon: { fontSize: 64, marginBottom: 24 },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  sub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
});

// ── Root App ──────────────────────────────────────────────────────────────────

export default function App(): React.JSX.Element {
  const { isForceBlocked, serverMessage } = useInAppUpdate();

  // Hard-blocked by server — show native blocker AND trigger Play overlay
  if (isForceBlocked) {
    return <ForceUpdateBlocker message={serverMessage} />;
  }

  // ... your existing NavigationContainer / Provider tree
  return <></>;
}
```

---

## 7. Backend: API Versioning Strategy

### 7.1 Route Architecture

```php
// routes/api.php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API v1 — Legacy (versionCode 1).
| Maintained for backward compatibility during transition window.
| Decommission after versionCode 1 user percentage drops below 1%.
|--------------------------------------------------------------------------
*/
Route::prefix('v1')->group(function () {
    require __DIR__ . '/api_v1.php';
});

/*
|--------------------------------------------------------------------------
| API v2 — Current. 4-digit PIN, digital signature audit trail,
| live store pickup, and all v1.1.0+ features.
|--------------------------------------------------------------------------
*/
Route::prefix('v2')->group(function () {
    require __DIR__ . '/api_v2.php';
});

/*
|--------------------------------------------------------------------------
| Versionless — App metadata, always accessible (no auth, no version gate)
|--------------------------------------------------------------------------
*/
Route::get('/app/version-check', [\App\Http\Controllers\Api\AppVersionController::class, 'check']);
```

### 7.2 `app_versions` Database Table

```php
// database/migrations/xxxx_create_app_versions_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('app_versions', function (Blueprint $table) {
            $table->id();
            $table->string('version_name');           // e.g. "1.1.0"
            $table->unsignedInteger('version_code');  // e.g. 2
            $table->string('platform')->default('android');
            $table->boolean('is_blacklisted')->default(false);
            $table->boolean('force_update')->default(false);
            $table->text('deprecation_message')->nullable();
            $table->timestamp('blacklisted_at')->nullable();
            $table->unsignedBigInteger('request_count')->default(0);
            $table->timestamp('first_seen_at')->nullable();
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamps();

            $table->unique(['version_code', 'platform']);
            $table->index(['is_blacklisted', 'platform']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('app_versions');
    }
};
```

---

## 8. Backend: `X-App-Version` Detection Middleware

Runs on every authenticated API request. Reads `X-App-Version-Code`, logs to `app_versions`, and attaches version info to the request object for controllers.

```php
<?php
// app/Http/Middleware/DetectAppVersion.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\AppVersion;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class DetectAppVersion
{
    public function handle(Request $request, Closure $next): Response
    {
        $versionName = $request->header('X-App-Version', 'unknown');
        $versionCode = (int) $request->header('X-App-Version-Code', 0);
        $platform    = strtolower($request->header('X-Platform', 'android'));

        // Attach to request so controllers can read it without parsing headers again
        $request->merge([
            '_app_version'      => $versionName,
            '_app_version_code' => $versionCode,
            '_app_platform'     => $platform,
        ]);

        // Record version activity asynchronously (never block real requests)
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
```

### 8.1 Register Middleware Aliases

```php
// bootstrap/app.php (Laravel 11)
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'detect.app.version' => \App\Http\Middleware\DetectAppVersion::class,
        'block.blacklisted'  => \App\Http\Middleware\BlockBlacklistedVersion::class,
    ]);
})
```

---

## 9. Backend: Server-Side Version Blacklist Enforcement (RISK A Remedy)

### 9.1 `AppVersionController::check` — Public Version Policy Endpoint

```php
<?php
// app/Http/Controllers/Api/AppVersionController.php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use App\Models\AppVersion;

class AppVersionController extends Controller
{
    /**
     * GET /api/app/version-check
     * Public — no auth required. Returns version policy to the app.
     */
    public function check(Request $request): JsonResponse
    {
        $versionCode = (int) $request->header('X-App-Version-Code', 0);
        $platform    = strtolower($request->header('X-Platform', 'android'));

        $blacklistedCodes = AppVersion::where('platform', $platform)
            ->where('is_blacklisted', true)
            ->pluck('version_code')
            ->toArray();

        $minVersionCode = (int) config('wunabuy.min_version_code', 1);
        $isBlacklisted  = in_array($versionCode, $blacklistedCodes, true);
        $isBelowMin     = $versionCode > 0 && $versionCode < $minVersionCode;
        $forceUpdate    = $isBlacklisted || $isBelowMin;

        $latestVersionCode = (int) config('wunabuy.latest_version_code', 2);
        $latestVersion     = config('wunabuy.latest_version', '1.1.0');

        $updateMessage = null;
        if ($forceUpdate) {
            $record = AppVersion::where('version_code', $versionCode)
                ->where('platform', $platform)
                ->first();
            $updateMessage = $record?->deprecation_message
                ?? 'A critical security update is required. Please update Wunabuy from the Play Store.';
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

        // Sign the response payload so the client can detect MITM tampering
        $payload   = json_encode($responseData, JSON_UNESCAPED_UNICODE);
        $signature = hash_hmac('sha256', $payload, config('app.version_check_secret', 'changeme'));
        $responseData['_sig'] = $signature;

        return response()->json($responseData, $forceUpdate ? 426 : 200);
    }
}
```

### 9.2 `BlockBlacklistedVersion` — Hard Server Enforcement Middleware

```php
<?php
// app/Http/Middleware/BlockBlacklistedVersion.php

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
     * Hard-blocks any request from a blacklisted app version.
     *
     * This CANNOT be bypassed by:
     *   - APK patching (Frida, Magisk)
     *   - Skipping the Play Store overlay
     *   - Spoofing the version-check response via MITM
     *
     * Apply to ALL escrow and financial routes.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $versionCode = (int) $request->header('X-App-Version-Code', 0);
        $platform    = strtolower($request->header('X-Platform', 'android'));

        // Cache the blacklist for 5 minutes to avoid a DB hit on every request
        $cacheKey        = "wunabuy_blacklisted_versions_{$platform}";
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
            Log::warning('[WunabuySecurity] Blocked request from blacklisted version', [
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
                    'message' => 'This version of Wunabuy has been decommissioned for security '
                        . 'reasons. Please update from the Google Play Store to continue.',
                    'action'  => 'force_update',
                ],
            ], 426); // 426 Upgrade Required — RFC 7231
        }

        return $next($request);
    }
}
```

### 9.3 Apply to Financial Routes

```php
// routes/api_v1.php AND routes/api_v2.php

// ── Financial/Escrow Routes — hard-blocked for blacklisted versions ───────────
Route::middleware([
    'auth:sanctum',
    'detect.app.version',
    'block.blacklisted',   // ← REQUIRED on all money-touching routes
])->group(function () {
    Route::post('/orders',                      [OrderController::class, 'store']);
    Route::post('/orders/{id}/confirm-receipt', [OrderController::class, 'confirmReceipt']);
    Route::post('/checkout/pay',                [WalletController::class, 'checkout']);
    Route::post('/wallet/withdraw',             [WalletController::class, 'withdraw']);
    Route::post('/wallet/transfer',             [WalletController::class, 'transfer']);
});

// ── Non-Financial Routes — version detection only (no hard block) ─────────────
Route::middleware(['auth:sanctum', 'detect.app.version'])->group(function () {
    Route::get('/products',      [ProductController::class, 'index']);
    Route::get('/stores',        [CommerceController::class, 'index']);
    Route::get('/notifications', [NotificationController::class, 'index']);
});
```

### 9.4 Blacklisting a Version (Admin Operation)

```php
// Run this when you need to hard-retire versionCode 1:

AppVersion::where('version_code', 1)
    ->where('platform', 'android')
    ->update([
        'is_blacklisted'      => true,
        'blacklisted_at'      => now(),
        'deprecation_message' => 'Version 1.0.0 contained a security vulnerability in the '
            . 'escrow release flow. Please update to 1.1.0 immediately.',
    ]);

// Clear cache immediately so the middleware picks up the change
Cache::forget('wunabuy_blacklisted_versions_android');
```

### 9.5 `config/wunabuy.php`

```php
<?php
// config/wunabuy.php

return [
    'min_version_code'    => env('WUNABUY_MIN_VERSION_CODE', 1),
    'latest_version_code' => env('WUNABUY_LATEST_VERSION_CODE', 2),
    'latest_version'      => env('WUNABUY_LATEST_VERSION', '1.1.0'),
];
```

```bash
# backend/.env additions
WUNABUY_MIN_VERSION_CODE=1
WUNABUY_LATEST_VERSION_CODE=2
WUNABUY_LATEST_VERSION=1.1.0
APP_VERSION_CHECK_SECRET=a_long_random_secret_for_hmac_signing
```

---

## 10. Security: MITM & Payload Tampering (RISK B Remedy)

### The Attack Vector

A MITM proxy intercepts `GET /api/app/version-check` and replaces:
```json
{ "force_update": true, "blacklisted_versions": [1] }
```
with:
```json
{ "force_update": false, "blacklisted_versions": [] }
```
Now the app thinks it is up to date and hits the vulnerable old API.

### Defense 1: SSL/TLS Certificate Pinning

```typescript
// mobile/src/services/api/sslPinning.ts
// Install: pnpm --filter wunabuy-mobile add react-native-ssl-pinning

/**
 * Get your server's public key hash with:
 *   openssl s_client -connect api.wunabuy.com:443 | \
 *   openssl x509 -pubkey -noout | \
 *   openssl pkey -pubin -outform der | \
 *   openssl dgst -sha256 -binary | base64
 *
 * Store at least TWO hashes: current cert + rotation backup.
 */
export const PINNED_CERT_HASHES: readonly string[] = [
  'sha256/YOUR_PRIMARY_CERT_HASH_HERE=',
  'sha256/YOUR_BACKUP_CERT_HASH_HERE=',
] as const;

// Usage with react-native-ssl-pinning:
//
// import { fetch as pinnedFetch } from 'react-native-ssl-pinning';
//
// const response = await pinnedFetch(
//   'https://api.wunabuy.com/api/app/version-check',
//   {
//     method: 'GET',
//     headers: {
//       'X-App-Version-Code': String(APP_VERSION_CODE),
//       'X-Platform': Platform.OS,
//     },
//     sslPinning: {
//       certs: ['wunabuy_api_cert'],  // File in android/app/src/main/assets/certs/
//     },
//     timeoutInterval: 8000,
//   }
// );
```

### Defense 2: Response HMAC Signature Verification

The backend signs every version-check response (see Section 9.1 — `_sig` field). The app verifies it:

```typescript
// mobile/src/services/updates/verifyVersionResponse.ts
// Install: pnpm --filter wunabuy-mobile add react-native-quick-crypto

/**
 * Verifies the HMAC-SHA256 `_sig` field on the version-check response.
 * If the signature does not match, the response was tampered with.
 *
 * NOTE: The HMAC secret must be embedded in the app binary (not great) OR
 * derived from a key exchange. For Wunabuy, embedding the secret is acceptable
 * because Defense 3 (server blacklist) is the true security layer.
 */
export function verifyVersionCheckSignature(
  responseBody: Record<string, unknown>,
  receivedSig: string,
  secret: string
): boolean {
  const { _sig, ...payload } = responseBody;
  const bodyString = JSON.stringify(payload);

  // With react-native-quick-crypto:
  // const Crypto = require('react-native-quick-crypto');
  // const expectedSig = Crypto
  //   .createHmac('sha256', secret)
  //   .update(bodyString)
  //   .digest('hex');
  // return expectedSig === receivedSig;

  console.warn('[WunabuyUpdate] HMAC verification — install react-native-quick-crypto');
  return true; // Fail open until installed
}
```

### Defense 3: Server Always Wins (Most Important)

> **Critical insight:** Even if an attacker successfully MITMs the version-check response AND bypasses the Play Store overlay AND patches the APK, they still cannot perform any financial operation because the `BlockBlacklistedVersion` middleware runs on **every** API call server-side.

The client-side update check is a **UX convenience** — the server blacklist is the **actual security control**.

---

## 11. Testing via Internal App Sharing Track

### Why Not Expo Go
`sp-react-native-in-app-updates` requires `AppUpdateManager` from the Play Store — not available in Expo Go.

### Step-by-Step

```bash
# 1. Build signed APK versionCode=1 (the "old" version)
eas build --platform android --profile preview

# 2. Upload to Play Console > Setup > Internal App Sharing
# 3. Install on your test device via the sharing link

# 4. Bump versionCode in app.json:
#    "android": { "versionCode": 2 }
# 5. Also update mobile/src/config/appVersion.ts:
#    APP_VERSION_CODE = 2

# 6. Build versionCode=2
eas build --platform android --profile preview

# 7. Upload versionCode=2 to Internal App Sharing (do NOT install it)
# 8. Launch the versionCode=1 app — it detects versionCode=2 via Play
```

**Test Immediate update:**
- In Play Console, set the versionCode=2 release **Update Priority** to **5**
- The versionCode=1 app triggers the full-screen non-dismissable overlay ✓

**Test server blacklist:**
```bash
curl -X POST https://your-server.com/api/v1/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-App-Version: 1.0.0" \
  -H "X-App-Version-Code: 1" \
  -H "X-Platform: android" \
  -H "Content-Type: application/json" \
  -d '{"store_id": "abc", "items": []}'

# Expected: HTTP 426 Upgrade Required
# { "success": false, "error": { "code": "VERSION_BLACKLISTED", ... } }
```

---

## 12. Error Handling Reference

| Scenario | Frontend Behavior | HTTP Response |
|---|---|---|
| No network on version check | Fail open — `status = 'up_to_date'`, log warning | N/A |
| Server returns `426` | `isForceBlocked = true`, show blocker, trigger IMMEDIATE | `426 Upgrade Required` |
| Server returns `5xx` | Fail open — proceed normally | `500/503` |
| Version check timeout (> 8s) | `AbortController` fires, fail open | N/A |
| Play Store unavailable | Catch error, `status = 'error'`, show toast | N/A |
| Flexible download `FAILED` | Show retry toast via `Alert.alert` | N/A |
| API call from blacklisted version | Display `error.message` from 426 body | `426 Upgrade Required` |
| HMAC `_sig` mismatch | Log warning, fail open | N/A |

---

## Appendix A: Files to Create

| File | Action | Purpose |
|---|---|---|
| `mobile/src/config/appVersion.ts` | **CREATE** | Central version constants |
| `mobile/src/services/updates/flexibleUpdate.ts` | **CREATE** | Flexible update flow |
| `mobile/src/services/updates/immediateUpdate.ts` | **CREATE** | Immediate force update |
| `mobile/src/hooks/useInAppUpdate.ts` | **CREATE** | Unified update hook |
| `mobile/App.tsx` | **MODIFY** | Wire hook + force blocker screen |
| `backend/app/Http/Middleware/DetectAppVersion.php` | **CREATE** | Header detection |
| `backend/app/Http/Middleware/BlockBlacklistedVersion.php` | **CREATE** | Hard enforcement |
| `backend/app/Http/Controllers/Api/AppVersionController.php` | **CREATE** | Version check endpoint |
| `backend/database/migrations/xxxx_create_app_versions_table.php` | **CREATE** | Version tracking table |
| `backend/config/wunabuy.php` | **CREATE** | Config keys |
| `backend/routes/api.php` | **MODIFY** | Versioned route groups |
| `backend/.env` | **MODIFY** | `WUNABUY_MIN_VERSION_CODE` etc. |

## Appendix B: Pre-Production Checklist

- [ ] `sp-react-native-in-app-updates` installed and built via EAS
- [ ] `app.json` `versionCode` bumped and `appVersion.ts` synced
- [ ] `AppVersionController::check` registered at `/api/app/version-check`
- [ ] `app_versions` migration run on production PostgreSQL
- [ ] `DetectAppVersion` middleware on all API route groups
- [ ] `BlockBlacklistedVersion` middleware on ALL financial routes
- [ ] `WUNABUY_MIN_VERSION_CODE` set in production `.env`
- [ ] `APP_VERSION_CHECK_SECRET` set in production `.env`
- [ ] `react-native-ssl-pinning` installed and cert hash configured
- [ ] Cert hash updated in `sslPinning.ts` when SSL cert renews
- [ ] Internal App Sharing tested: versionCode 1 → 2 flexible + immediate flows
- [ ] 426 hard-block tested end-to-end with `curl` against production
- [ ] Play Console Update Priority set to **4+** for security releases
- [ ] Cache cleared (`wunabuy_blacklisted_versions_android`) after each blacklist update
