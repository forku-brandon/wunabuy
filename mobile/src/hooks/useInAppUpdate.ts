/**
 * Wunabuy — `useInAppUpdate` Hook
 * ─────────────────────────────────────────────────────────────────────────────
 * Unified hook that orchestrates the full update lifecycle:
 *
 *   1. Calls our own Laravel server first (GET /v1/app/version-check)
 *      → If server returns 426 / force_update: true → trigger IMMEDIATE overlay
 *      → Blacklisted? → show ForceUpdateBlocker screen in App.tsx
 *
 *   2. Calls the Google Play Store check
 *      → High priority (4+)? → IMMEDIATE full-screen blocker
 *      → Low priority?       → FLEXIBLE background download
 *
 * The server check is the authoritative security control.
 * The Play Store check is the UX convenience layer.
 *
 * Auto-runs once on app mount. Can also be triggered manually.
 */
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

/** All possible states the update check can be in */
export type UpdateCheckStatus =
  | 'idle'                   // Not started yet
  | 'checking_server'        // Querying our Laravel version-check endpoint
  | 'force_blocked'          // Server returned 426 — version is blacklisted
  | 'checking_store'         // Querying Google Play for a newer version
  | 'store_update_pending'   // Play Store found an update, not yet downloading
  | 'downloading'            // Flexible update downloading in background
  | 'ready_to_install'       // Flexible update downloaded, awaiting user restart
  | 'up_to_date'             // No update available
  | 'error';                 // Non-fatal error (network/Play Services issue)

/** Shape of the version policy response from our Laravel server */
export interface ServerVersionConfig {
  /** Minimum allowed versionCode — requests below this get hard-blocked */
  min_version_code: number;
  /** Specific versionCodes that are blacklisted (security patches) */
  blacklisted_versions: number[];
  /** Server-initiated force update flag (overrides Play priority) */
  force_update: boolean;
  /** Human-readable message shown in the ForceUpdateBlocker screen */
  update_message?: string;
  latest_version_code: number;
  latest_version: string;
}

/** Return type of the hook */
export interface UseInAppUpdateReturn {
  /** Current update check status */
  status: UpdateCheckStatus;
  /** Download progress 0–100 (only meaningful in 'downloading' state) */
  downloadProgress: number;
  /** true when the server has hard-blocked this version (show blocker screen) */
  isForceBlocked: boolean;
  /** Message from the server to display in the ForceUpdateBlocker */
  serverMessage: string | null;
  /** Manually re-trigger the full check (server + Play Store) */
  checkForUpdates: () => Promise<void>;
  /** Install a previously downloaded flexible update (triggers app restart) */
  installUpdate: () => Promise<void>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useInAppUpdate(): UseInAppUpdateReturn {
  const [status, setStatus] = useState<UpdateCheckStatus>('idle');
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [isForceBlocked, setIsForceBlocked] = useState<boolean>(false);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  // Ensure we only auto-check once per app session, not on every re-render
  const hasChecked = useRef(false);

  // ── Step 1: Server Version Policy Check ─────────────────────────────────────
  // This is authoritative. Even if the Play check is bypassed,
  // the backend BlockBlacklistedVersion middleware still hard-blocks API calls.

  const checkServerVersionPolicy = useCallback(async (): Promise<{
    blocked: boolean;
    forceUpdate: boolean;
    message?: string;
  }> => {
    try {
      const controller = new AbortController();
      // 8-second timeout — avoid hanging on slow Cameroonian mobile connections
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
        // 426 Upgrade Required — version is explicitly blacklisted on the server
        const body = await response.json().catch(() => ({}));
        return {
          blocked: true,
          forceUpdate: true,
          message:
            (body as any)?.message ??
            'A critical security update is required. Please update Wunabuy from the Play Store to continue.',
        };
      }

      if (!response.ok) {
        // Server error (5xx, 404, etc.) — FAIL OPEN
        // Never punish a user for our server having issues
        console.warn('[WunabuyUpdate] Version check server error:', response.status);
        return { blocked: false, forceUpdate: false };
      }

      const config: ServerVersionConfig = await response.json();
      const isBlacklisted = config.blacklisted_versions?.includes(APP_VERSION_CODE) ?? false;
      const isBelowMinimum = config.min_version_code > 0 && APP_VERSION_CODE < config.min_version_code;
      const blocked = isBlacklisted || isBelowMinimum;

      return {
        blocked,
        forceUpdate: blocked || config.force_update,
        message: config.update_message,
      };
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        console.warn('[WunabuyUpdate] Server version check timed out — proceeding offline');
      } else {
        console.warn('[WunabuyUpdate] Server version check failed:', error);
      }
      // Network down or server unreachable — FAIL OPEN
      // The user should be able to use the app even without connectivity
      return { blocked: false, forceUpdate: false };
    }
  }, []);

  // ── Main Check Orchestrator ──────────────────────────────────────────────────

  const checkForUpdates = useCallback(async (): Promise<void> => {
    if (Platform.OS !== 'android') {
      // sp-react-native-in-app-updates is Android-only
      // iOS would use StoreKit or a manual App Store version check
      setStatus('up_to_date');
      return;
    }

    // ── Phase 1: Our server says so → hard block ─────────────────────────────
    setStatus('checking_server');
    const serverPolicy = await checkServerVersionPolicy();

    if (serverPolicy.blocked) {
      setIsForceBlocked(true);
      setServerMessage(serverPolicy.message ?? null);
      setStatus('force_blocked');
      // Also trigger the Play Store IMMEDIATE overlay on top of our blocker screen
      // (belt and suspenders — two layers of enforcement visible to the user)
      await checkAndTriggerImmediateUpdate();
      return;
    }

    // ── Phase 2: Server says force (not blacklisted, but urgent) ─────────────
    setStatus('checking_store');

    if (serverPolicy.forceUpdate) {
      const result = await checkAndTriggerImmediateUpdate();
      setStatus(result.updateTriggered ? 'force_blocked' : 'up_to_date');
      return;
    }

    // ── Phase 3: Normal case — flexible background download ──────────────────
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
            const percent = total > 0 ? Math.round((downloaded / total) * 100) : 0;
            setDownloadProgress(Math.min(percent, 100));
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
        // onReadyToInstall — non-intrusive restart prompt
        Alert.alert(
          '✅ Update Ready',
          'A new version of Wunabuy is downloaded and ready. Restart now for the latest features.',
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

  // ── Auto-check on first mount ────────────────────────────────────────────────
  useEffect(() => {
    if (!hasChecked.current) {
      hasChecked.current = true;
      // Small delay so the app renders first before the network call
      const timer = setTimeout(() => {
        checkForUpdates();
      }, 2000);
      return () => clearTimeout(timer);
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
