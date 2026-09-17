/**
 * Wunabuy — Flexible In-App Update Flow
 * ─────────────────────────────────────────────────────────────────────────────
 * Downloads the update silently in the background while the user continues
 * using the app. Shows a non-intrusive "Restart Now" prompt when complete.
 *
 * Use for: Feature releases, UI improvements, non-critical API changes.
 *
 * Requires: sp-react-native-in-app-updates (EAS Build / bare workflow only)
 * Does NOT work in Expo Go.
 */
import SpInAppUpdates, {
  IAUUpdateKind,
  StartUpdateOptions,
  StatusUpdateEvent,
  IAUInstallStatus,
} from 'sp-react-native-in-app-updates';

// ─── Types ────────────────────────────────────────────────────────────────────

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
  /** Bytes downloaded so far (only present during 'downloading' state) */
  bytesDownloaded?: number;
  /** Total bytes to download (only present during 'downloading' state) */
  totalBytes?: number;
  /** Human-readable error message (only present during 'failed' state) */
  errorMessage?: string;
}

// ─── Flexible Update ─────────────────────────────────────────────────────────

/**
 * Checks for and initiates a FLEXIBLE Play Store update.
 * Non-blocking — the user can continue using the app during download.
 *
 * Lifecycle events emitted via `onStateChange`:
 *   idle → checking → available → downloading → downloaded
 *                                             └→ failed
 *                             └→ not_available
 *
 * @param onStateChange   - Fired on every state transition with progress info.
 * @param onReadyToInstall - Called once when download is complete and it is
 *                          safe to prompt the user to restart.
 */
export async function startFlexibleUpdate(
  onStateChange: (result: FlexibleUpdateResult) => void,
  onReadyToInstall: () => void
): Promise<void> {
  // Pass `true` in DEV to enable verbose Play library logging
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

    // Subscribe to download lifecycle BEFORE calling startInAppUpdate
    const statusListener = (statusEvent: StatusUpdateEvent) => {
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
          // Download complete — ready to install on next restart
          onStateChange({ state: 'downloaded' });
          onReadyToInstall();
          inAppUpdates.removeStatusUpdateListener(statusListener);
          break;

        case IAUInstallStatus.FAILED:
          onStateChange({
            state: 'failed',
            errorMessage: 'Update download failed. Please check your connection and try again.',
          });
          inAppUpdates.removeStatusUpdateListener(statusListener);
          break;

        case IAUInstallStatus.CANCELED:
          onStateChange({ state: 'idle' });
          inAppUpdates.removeStatusUpdateListener(statusListener);
          break;

        default:
          break;
      }
    };

    inAppUpdates.addStatusUpdateListener(statusListener);
    await inAppUpdates.startUpdate(updateOptions);
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Could not connect to the Play Store. Please try again later.';
    onStateChange({ state: 'failed', errorMessage: message });
  }
}

// ─── Install Downloaded Update ────────────────────────────────────────────────

/**
 * Triggers the app restart to install a previously downloaded flexible update.
 * Only call this after `onReadyToInstall` has been invoked — calling it earlier
 * is a no-op in the best case and may crash in the worst case.
 */
export async function installFlexibleUpdate(): Promise<void> {
  const inAppUpdates = new SpInAppUpdates(false);
  await inAppUpdates.installUpdate();
}
