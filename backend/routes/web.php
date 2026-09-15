<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'service' => 'Wunabuy API Gateway',
        'status' => 'operational',
        'version' => '1.0.0',
        'environment' => config('app.env')
    ]);
});

Route::get('/uploads/{folder}/{filename}', function (string $folder, string $filename) {
    $path = public_path("uploads/{$folder}/{$filename}");
    if (!file_exists($path)) {
        abort(404);
    }

    $mime = mime_content_type($path) ?: 'image/webp';
    $lastModified = filemtime($path);
    $etag = '"' . md5($lastModified . filesize($path)) . '"';

    if (request()->header('If-None-Match') === $etag) {
        return response('', 304, [
            'Cache-Control' => 'public, max-age=31536000, immutable',
            'ETag' => $etag,
        ]);
    }

    return response()->file($path, [
        'Content-Type' => $mime,
        'Cache-Control' => 'public, max-age=31536000, immutable',
        'ETag' => $etag,
        'Last-Modified' => gmdate('D, d M Y H:i:s T', $lastModified),
    ]);
})->where('folder', '[a-zA-Z0-9_-]+')->where('filename', '[a-zA-Z0-9_.-]+');
