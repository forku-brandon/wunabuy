/**
 * Wunabuy — Immediate (Force) In-App Update Flow
 * ─────────────────────────────────────────────────────────────────────────────
 * Presents a FULL-SCREEN, non-dismissable Google Play overlay.
 * The user cannot interact with the app at all until the update is installed
 * and the app restarts automatically.
 *
 * Use for:
 *   - Security patches (encryption changes, vulnerability fixes)
 *   - Escrow logic corrections
 *   - PIN algorithm changes (e.g., 5-digit → 4-digit migration)
 *   - Payment API deprecations where old behavior causes financial risk
 *   - Any release that the Laravel server has flagged as force_update: true
 *
 * Requires: sp-react-native-in-app-updates (EAS Build / bare workflow only)
 * Does NOT work in Expo Go.
 */
import SpInAppUpdates, {
  IAUUpdateKind,
  StartUpdateOptions,
  NeedsUpdateResponse,
} from 'sp-react-native-in-app-updates';
import { APP_VERSION_CODE, FORCE_UPDATE_PRIORITY } from '../../config/appVersion';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ImmediateUpdateResult {
  /** true = Play Store overlay was successfully triggered */
  updateTriggered: boolean;
  /** Populated when the check fails (network error, Play Services unavailable) */
  error?: string;
}

// ─── Immediate Update ─────────────────────────────────────────────────────────

/**
 * Checks whether a CRITICAL (Immediate) update is required and triggers the
 * full-screen non-dismissable Google Play overlay if so.
 *
 * Triggered automatically when:
 *   (a) The Laravel server responds with `force_update: true` or HTTP 426, OR
 *   (b) Google Play reports a newer versionCode with a release priority >= 4
 *
 * After `startInAppUpdate` is called with IMMEDIATE, the OS takes full control.
 * The app restarts automatically once the update is installed — code after
 * `startInAppUpdate` may never execute.
 */
export async function checkAndTriggerImmediateUpdate(): Promise<ImmediateUpdateResult> {
  const inAppUpdates = new SpInAppUpdates(__DEV__);

  try {
    const result: NeedsUpdateResponse = await inAppUpdates.checkNeedsUpdate({
      curVersion: `0.0.${APP_VERSION_CODE}`,
      // Convert Play integer versionCode to a semver string for comparison:
      // e.g., versionCode 2 → "0.0.2", versionCode 10 → "0.0.10"
      toSemverConverter: (version: string | number) => `0.0.${version}`,
    });

    if (!result.shouldUpdate) {
      // Already on the latest version — no update needed
      return { updateTriggered: false };
    }

    const updatePriority: number =
      (result as any)?.other?.updatePriority ??
      (result as any)?.updatePriority ??
      0;
    const isHighPriority = updatePriority >= FORCE_UPDATE_PRIORITY;

    if (!isHighPriority) {
      // Play priority is too low for IMMEDIATE — let the flexible flow handle it
      return { updateTriggered: false };
    }

    const updateOptions: StartUpdateOptions = {
      updateType: IAUUpdateKind.IMMEDIATE,
    };

    // This call takes over the screen. The user CANNOT dismiss it.
    // The app automatically restarts after the update installs.
    await inAppUpdates.startUpdate(updateOptions);

    // Lines below may not execute if update installs and app restarts
    return { updateTriggered: true };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Could not check for critical security update. Please restart the app.';

    console.error('[WunabuyUpdate] Immediate update failed:', message);
    return { updateTriggered: false, error: message };
  }
}
