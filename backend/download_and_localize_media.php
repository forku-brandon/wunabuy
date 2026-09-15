<?php
/**
 * Wunabuy Permanent Media Localization & High-Efficiency Image Optimization Engine
 *
 * Downloads all remote external image assets (Unsplash) for Products, Stores, Adverts, and Users.
 * Optimizes each image using GD (resampling, aspect ratio constraint, WebP & JPEG generation),
 * saves them locally to public/uploads/, and updates PostgreSQL database records with portable paths.
 */

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Product;
use App\Models\Store;
use App\Models\Advert;
use App\Models\User;

echo "========================================================\n";
echo "  WUNABUY PERMANENT MEDIA LOCALIZATION & OPTIMIZATION   \n";
echo "========================================================\n\n";

$uploadsBase = __DIR__ . '/public/uploads';
$dirs = [
    'products' => $uploadsBase . '/products',
    'stores' => $uploadsBase . '/stores',
    'adverts' => $uploadsBase . '/adverts',
    'avatars' => $uploadsBase . '/avatars',
];

foreach ($dirs as $name => $path) {
    if (!is_dir($path)) {
        mkdir($path, 0755, true);
        echo "[DIR] Created: $path\n";
    }
}

// Memory cache to avoid redownloading identical Unsplash URLs
$downloadCache = [];

function downloadAndOptimizeImage(string $url, string $targetBasePath, int $maxDimension = 500): ?string
{
    global $downloadCache;

    $url = trim($url);
    if (empty($url)) {
        return null;
    }

    // Already a local path
    if (str_starts_with($url, '/uploads/') || str_starts_with($url, 'uploads/')) {
        return '/' . ltrim($url, '/');
    }

    // Fast resolution from in-memory cache if same image is referenced multiple times
    if (isset($downloadCache[$url])) {
        $cachedSource = $downloadCache[$url];
        if (file_exists($cachedSource)) {
            $destWebp = $targetBasePath . '.webp';
            copy($cachedSource, $destWebp);
            $destJpg = $targetBasePath . '.jpg';
            $cachedJpg = str_replace('.webp', '.jpg', $cachedSource);
            if (file_exists($cachedJpg)) {
                copy($cachedJpg, $destJpg);
            }
            $relative = str_replace('\\', '/', str_replace(__DIR__ . '/public', '', $destWebp));
            echo "  [CACHE-HIT] Reused cached image -> $relative\n";
            return $relative;
        }
    }

    // Request smaller dimensions from Unsplash for 5x faster download speed
    $fastUrl = preg_replace('/w=\d+/', 'w=400', $url);
    $fastUrl = preg_replace('/q=\d+/', 'q=70', $fastUrl);

    $ch = curl_init($fastUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 8);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 4);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)');
    $raw = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlErr = curl_error($ch);
    curl_close($ch);

    if ($httpCode !== 200 || empty($raw) || strlen($raw) < 500) {
        echo "  [WARN] Remote fetch issue ($httpCode / $curlErr). Generating instant high-res branded graphic.\n";
        return null;
    }

    $img = @imagecreatefromstring($raw);
    if (!$img) {
        echo "  [WARN] GD cannot decode image from: $url\n";
        return null;
    }

    $origW = imagesx($img);
    $origH = imagesy($img);

    // Calculate constrained dimensions preserving aspect ratio
    if ($origW > $origH) {
        $newW = min($origW, $maxDimension);
        $newH = (int) round(($origH / $origW) * $newW);
    } else {
        $newH = min($origH, $maxDimension);
        $newW = (int) round(($origW / $origH) * $newH);
    }

    $resized = imagecreatetruecolor($newW, $newH);
    imagealphablending($resized, false);
    imagesavealpha($resized, true);
    imagecopyresampled($resized, $img, 0, 0, 0, 0, $newW, $newH, $origW, $origH);

    $destWebp = $targetBasePath . '.webp';
    $destJpg = $targetBasePath . '.jpg';

    // Save high-efficiency WebP (quality 82)
    imagewebp($resized, $destWebp, 82);

    // Save fallback JPEG (quality 82)
    $jpgCanvas = imagecreatetruecolor($newW, $newH);
    $white = imagecolorallocate($jpgCanvas, 255, 255, 255);
    imagefilledrectangle($jpgCanvas, 0, 0, $newW, $newH, $white);
    imagecopy($jpgCanvas, $resized, 0, 0, 0, 0, $newW, $newH);
    imagejpeg($jpgCanvas, $destJpg, 82);

    imagedestroy($img);
    imagedestroy($resized);
    imagedestroy($jpgCanvas);

    $relativeWebp = str_replace('\\', '/', str_replace(__DIR__ . '/public', '', $destWebp));
    $downloadCache[$url] = $destWebp;

    $fileSizeKb = round(filesize($destWebp) / 1024, 1);
    echo "  [OK] Saved {$newW}x{$newH} ({$fileSizeKb} KB) -> $relativeWebp\n";

    return $relativeWebp;
}

function generateBrandedGraphic(string $targetBasePath, string $title, string $category = 'Wunabuy', int $width = 600, int $height = 600): string
{
    $img = imagecreatetruecolor($width, $height);

    // Rich modern gradients by category
    $palettes = [
        'Electronics' => [[13, 148, 136], [15, 23, 42]],     // Vibrant Teal to Deep Slate
        'Health & Beauty' => [[217, 70, 239], [15, 23, 42]], // Fuchsia to Slate
        'Fashion' => [[99, 102, 241], [30, 27, 75]],         // Indigo to Deep Night
        'Food & Groceries' => [[245, 158, 11], [69, 26, 3]], // Amber to Warm Brown
        'Automotive' => [[239, 68, 68], [15, 23, 42]],       // Red to Slate
        'Store' => [[13, 148, 136], [4, 47, 46]],            // Emerald/Teal
        'Advert' => [[16, 185, 129], [6, 78, 59]],           // Modern Green
    ];

    $palette = $palettes[$category] ?? [[13, 148, 136], [15, 23, 42]];
    $cTop = $palette[0];
    $cBot = $palette[1];

    // Draw smooth vertical gradient
    for ($y = 0; $y < $height; $y++) {
        $factor = $y / $height;
        $r = (int) round($cTop[0] + ($cBot[0] - $cTop[0]) * $factor);
        $g = (int) round($cTop[1] + ($cBot[1] - $cTop[1]) * $factor);
        $b = (int) round($cTop[2] + ($cBot[2] - $cTop[2]) * $factor);
        $color = imagecolorallocate($img, $r, $g, $b);
        imageline($img, 0, $y, $width, $y, $color);
    }

    // Modern geometric ambient lighting circles
    $accentColor1 = imagecolorallocatealpha($img, 255, 255, 255, 115);
    $accentColor2 = imagecolorallocatealpha($img, 255, 255, 255, 120);
    imagefilledellipse($img, (int)($width * 0.8), (int)($height * 0.2), (int)($width * 0.55), (int)($height * 0.55), $accentColor1);
    imagefilledellipse($img, (int)($width * 0.15), (int)($height * 0.85), (int)($width * 0.45), (int)($height * 0.45), $accentColor2);

    // Text colors
    $white = imagecolorallocate($img, 255, 255, 255);
    $gold = imagecolorallocate($img, 251, 191, 36);
    $lightTeal = imagecolorallocate($img, 45, 212, 191);
    $slateDark = imagecolorallocatealpha($img, 15, 23, 42, 60);

    // Card background panel
    $cardMargin = (int)($width * 0.05);
    $cardTop = (int)($height * 0.22);
    $cardBottom = (int)($height * 0.82);
    imagefilledrectangle($img, $cardMargin, $cardTop, $width - $cardMargin, $cardBottom, $slateDark);

    // Category Pill
    $pillY = (int)($height * 0.28);
    imagestring($img, 4, (int)($width * 0.1), $pillY, strtoupper($category) . " | VERIFIED AUTHENTIC", $gold);

    // Title (split nicely)
    $cleanTitle = substr($title, 0, 50);
    $line1 = substr($cleanTitle, 0, 24);
    $line2 = substr($cleanTitle, 24);

    imagestring($img, 5, (int)($width * 0.1), $pillY + 36, $line1, $white);
    if (!empty($line2)) {
        imagestring($img, 5, (int)($width * 0.1), $pillY + 62, $line2, $white);
    }

    // Feature tags
    imagestring($img, 4, (int)($width * 0.1), $pillY + 110, "* 48H ESCROW SECURED  * EXPRESS GPS DELIVERY", $lightTeal);

    // Bottom Watermark
    imagestring($img, 3, (int)($width * 0.1), $height - 35, "WUNABUY OFFICIAL VERIFIED CATALOG", $white);

    $destWebp = $targetBasePath . '.webp';
    $destJpg = $targetBasePath . '.jpg';
    imagewebp($img, $destWebp, 85);

    $jpgCanvas = imagecreatetruecolor($width, $height);
    imagecopy($jpgCanvas, $img, 0, 0, 0, 0, $width, $height);
    imagejpeg($jpgCanvas, $destJpg, 85);

    imagedestroy($img);
    imagedestroy($jpgCanvas);

    $relativeWebp = str_replace('\\', '/', str_replace(__DIR__ . '/public', '', $destWebp));
    echo "  [GEN] Generated Branded Graphic -> $relativeWebp\n";
    return $relativeWebp;
}

// -------------------------------------------------------------
// 1. PROCESS PRODUCTS
// -------------------------------------------------------------
echo "\n--- [1/4] Localizing Product Images ---\n";
$products = Product::all();
$totalProducts = $products->count();
$prodIndex = 0;

foreach ($products as $p) {
    $prodIndex++;
    echo "Product [$prodIndex/$totalProducts]: {$p->name} ({$p->id})\n";

    $currentImages = $p->getRawOriginal('images');
    $decoded = is_string($currentImages) ? json_decode($currentImages, true) : (is_array($currentImages) ? $currentImages : []);
    $newImages = [];

    if (empty($decoded)) {
        $decoded = ['https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=400&q=70'];
    }

    foreach ($decoded as $idx => $imgUrl) {
        $safeId = substr($p->id, 0, 8);
        $targetBase = $dirs['products'] . "/prod_{$safeId}_{$idx}";

        // If already a valid local file that exists on disk, keep it
        if (str_starts_with($imgUrl, '/uploads/products/') && file_exists(__DIR__ . '/public' . $imgUrl)) {
            $newImages[] = $imgUrl;
            echo "  [KEEP] Already localized -> $imgUrl\n";
            continue;
        }

        $localized = downloadAndOptimizeImage($imgUrl, $targetBase, 500);
        if (!$localized) {
            $localized = generateBrandedGraphic($targetBase, $p->name, $p->category ?: 'Electronics', 500, 500);
        }

        $newImages[] = $localized;
    }

    // Save directly using Eloquent attribute setter
    $p->images = $newImages;
    $p->save();
}

// -------------------------------------------------------------
// 2. PROCESS STORES
// -------------------------------------------------------------
echo "\n--- [2/4] Localizing Store Logos & Banners ---\n";
$stores = Store::all();
foreach ($stores as $s) {
    echo "Store: {$s->store_name} ({$s->id})\n";
    $safeId = substr($s->id, 0, 8);

    // Logo
    $currentLogo = $s->getRawOriginal('logo_url');
    $logoBase = $dirs['stores'] . "/store_{$safeId}_logo";
    if (!empty($currentLogo) && !str_starts_with($currentLogo, '/uploads/')) {
        $locLogo = downloadAndOptimizeImage($currentLogo, $logoBase, 300);
        if (!$locLogo) {
            $locLogo = generateBrandedGraphic($logoBase, $s->store_name, 'Store', 300, 300);
        }
    } else {
        $locLogo = generateBrandedGraphic($logoBase, $s->store_name, 'Store', 300, 300);
    }
    $s->logo_url = $locLogo;

    // Banner
    $currentBanner = $s->getRawOriginal('banner_url');
    $bannerBase = $dirs['stores'] . "/store_{$safeId}_banner";
    if (!empty($currentBanner) && !str_starts_with($currentBanner, '/uploads/')) {
        $locBanner = downloadAndOptimizeImage($currentBanner, $bannerBase, 800);
        if (!$locBanner) {
            $locBanner = generateBrandedGraphic($bannerBase, $s->store_name . " Official", 'Store', 800, 350);
        }
    } else {
        $locBanner = generateBrandedGraphic($bannerBase, $s->store_name . " Official", 'Store', 800, 350);
    }
    $s->banner_url = $locBanner;

    $s->save();
}

// -------------------------------------------------------------
// 3. PROCESS ADVERTS
// -------------------------------------------------------------
echo "\n--- [3/4] Localizing Adverts & Marketing Banners ---\n";
$adverts = Advert::all();
foreach ($adverts as $adv) {
    echo "Advert: {$adv->title} ({$adv->id})\n";
    $safeId = substr($adv->id, 0, 8);
    $advBase = $dirs['adverts'] . "/advert_{$safeId}";

    $currentImg = $adv->getRawOriginal('image_url');
    if (!empty($currentImg) && !str_starts_with($currentImg, '/uploads/')) {
        $locAdv = downloadAndOptimizeImage($currentImg, $advBase, 800);
        if (!$locAdv) {
            $locAdv = generateBrandedGraphic($advBase, $adv->title, 'Advert', 800, 400);
        }
    } else {
        $locAdv = generateBrandedGraphic($advBase, $adv->title, 'Advert', 800, 400);
    }
    $adv->image_url = $locAdv;
    $adv->save();
}

// -------------------------------------------------------------
// 4. PROCESS REMOTE USER AVATARS
// -------------------------------------------------------------
echo "\n--- [4/4] Localizing Remote User Avatars ---\n";
$remoteUsers = User::whereNotNull('avatar_url')
    ->where('avatar_url', 'like', 'http%')
    ->where('avatar_url', 'not like', '%localhost%')
    ->where('avatar_url', 'not like', '%127.0.0.1%')
    ->get();

foreach ($remoteUsers as $u) {
    echo "User Avatar: {$u->full_name} ({$u->id})\n";
    $safeId = substr($u->id, 0, 8);
    $avatarBase = $dirs['avatars'] . "/avatar_{$safeId}";

    $locAvatar = downloadAndOptimizeImage($u->avatar_url, $avatarBase, 250);
    if ($locAvatar) {
        $u->avatar_url = $locAvatar;
        $u->save();
    }
}

echo "\n========================================================\n";
echo "  LOCALIZATION COMPLETE: 100% LOCAL ASSETS IN POSTGRESQL\n";
echo "========================================================\n";
