/**
 * Wunabuy App Version Constants
 * ─────────────────────────────────────────────────────────────────────────────
 * CRITICAL: Keep APP_VERSION_CODE in sync with android.versionCode in app.json.
 * Bump BOTH together on every release before building with EAS.
 *
 * Current: app.json → "android": { "versionCode": 1 }
 * After next release: set both to 2 simultaneously.
 */

/** Human-readable semver string matching package.json version */
export const APP_VERSION = '1.1.0';

/**
 * Integer versionCode — must exactly match android.versionCode in app.json.
 * Google Play uses this integer for update comparison (not the semver string).
 */
export const APP_VERSION_CODE = 1;

/** Google Play package name — must match app.json android.package */
export const APP_PACKAGE_NAME = 'com.wunabuy.app';

/**
 * Play Console update priority thresholds.
 * Set priority in Play Console when publishing a new release (0–5).
 *
 * Priority >= FORCE_UPDATE_PRIORITY → IMMEDIATE full-screen blocker
 * Priority >= FLEXIBLE_PRIORITY     → FLEXIBLE background download
 * Priority < FLEXIBLE_PRIORITY      → no automatic prompt
 */
export const FORCE_UPDATE_PRIORITY = 4;
export const FLEXIBLE_PRIORITY = 2;
