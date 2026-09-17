<?php

return [
    /**
     * Minimum client versionCode allowed to communicate with financial/escrow APIs.
     * Anything strictly below this version code is rejected with HTTP 426 Upgrade Required.
     */
    'min_version_code' => (int) env('WUNABUY_MIN_VERSION_CODE', 1),

    /**
     * The latest production release information published to Google Play / App Stores.
     */
    'latest_version_code' => (int) env('WUNABUY_LATEST_VERSION_CODE', 1),
    'latest_version'      => env('WUNABUY_LATEST_VERSION', '1.1.0'),

    /**
     * Secret key used to sign the public version-check response payload.
     * Protects client from MITM tampering.
     */
    'version_check_secret' => env('WUNABUY_VERSION_CHECK_SECRET', 'wunabuy-sec-escrow-cemac-key-2026'),
];
