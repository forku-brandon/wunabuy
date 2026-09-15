<?php

namespace App\Traits;

trait HasNormalizedImages
{
    /**
     * Get the active base URL for resolving relative image assets.
     */
    public static function getActiveAssetBaseUrl(): string
    {
        try {
            if (app()->runningInConsole()) {
                return rtrim(config('app.url') ?: 'http://localhost:8000', '/');
            }
            $request = request();
            if ($request) {
                return rtrim($request->getSchemeAndHttpHost(), '/');
            }
        } catch (\Throwable $e) {
            // fallback if outside request context
        }

        return rtrim(config('app.url') ?: 'http://localhost:8000', '/');
    }

    /**
     * Normalize a single image URL for client responses.
     */
    public static function normalizeImageUrl(?string $url): ?string
    {
        if ($url === null) {
            return null;
        }

        $trimmed = trim($url);
        if ($trimmed === '') {
            return '';
        }

        // Never expose local device temporary cache paths
        if (str_starts_with($trimmed, 'file:///')) {
            return null;
        }

        // Keep inline base64 images intact
        if (str_starts_with($trimmed, 'data:image')) {
            return $trimmed;
        }

        $baseUrl = self::getActiveAssetBaseUrl();

        // Check if URL points to local uploads or storage with a stale host (localhost, 127.0.0.1, 192.168.*, 10.*, 172.*)
        if (preg_match('#^https?://(?:localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.\d+\.\d+\.\d+)(?::\d+)?(/uploads/.*|/storage/.*)$#i', $trimmed, $matches)) {
            return $baseUrl . $matches[1];
        }

        // Relative path starting with /uploads/ or /storage/
        if (str_starts_with($trimmed, '/uploads/') || str_starts_with($trimmed, '/storage/')) {
            return $baseUrl . $trimmed;
        }

        if (str_starts_with($trimmed, 'uploads/') || str_starts_with($trimmed, 'storage/')) {
            return $baseUrl . '/' . $trimmed;
        }

        // Valid external CDN/HTTPS URL (e.g. Unsplash, S3, Cloudinary)
        if (str_starts_with($trimmed, 'http://') || str_starts_with($trimmed, 'https://')) {
            return $trimmed;
        }

        // Default: if it's an un-prefixed relative path like "avatars/abc.jpg"
        return $baseUrl . '/uploads/' . ltrim($trimmed, '/');
    }

    /**
     * Clean and strip hardcoded hosts before saving to the database.
     * Guarantees database portability across local dev, staging, and production servers.
     */
    public static function cleanImageForStorage(?string $url): ?string
    {
        if ($url === null) {
            return null;
        }

        $trimmed = trim($url);
        if ($trimmed === '') {
            return '';
        }

        // Discard local device temporary cache paths
        if (str_starts_with($trimmed, 'file:///')) {
            return null;
        }

        // If it's a URL pointing to local /uploads/ or /storage/, strip the host to keep database portable
        if (preg_match('#^https?://[^/]+(/uploads/.*|/storage/.*)$#i', $trimmed, $matches)) {
            return $matches[1];
        }

        // External URLs (Unsplash, Cloudinary, S3, etc.) are preserved in full
        return $trimmed;
    }

    /**
     * Normalize an array of image URLs (for Product images).
     */
    public static function normalizeImageArray(?array $images): array
    {
        if (empty($images)) {
            return [];
        }

        $normalized = [];
        foreach ($images as $img) {
            if (is_string($img)) {
                $clean = self::normalizeImageUrl($img);
                if ($clean !== null && $clean !== '') {
                    $normalized[] = $clean;
                }
            }
        }

        return $normalized;
    }

    /**
     * Clean an array of image URLs before saving to database.
     */
    public static function cleanImageArrayForStorage(?array $images): array
    {
        if (empty($images)) {
            return [];
        }

        $cleaned = [];
        foreach ($images as $img) {
            if (is_string($img)) {
                $clean = self::cleanImageForStorage($img);
                if ($clean !== null && $clean !== '') {
                    $cleaned[] = $clean;
                }
            }
        }

        return $cleaned;
    }
}
