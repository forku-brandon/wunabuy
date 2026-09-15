<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== PRODUCTS IMAGE URLS ===" . PHP_EOL;
foreach (App\Models\Product::all() as $p) {
    echo "ID: {$p->id} | Name: {$p->name}" . PHP_EOL;
    echo "  image_url: " . var_export($p->image_url, true) . PHP_EOL;
    echo "  raw images: " . json_encode($p->images) . PHP_EOL;
}

echo PHP_EOL . "=== ADVERTS IMAGE URLS ===" . PHP_EOL;
foreach (App\Models\Advert::take(3)->get() as $a) {
    echo "Title: {$a->title} | image_url: {$a->image_url}" . PHP_EOL;
}

echo PHP_EOL . "=== STORES IMAGE URLS ===" . PHP_EOL;
foreach (App\Models\Store::take(3)->get() as $s) {
    echo "Store: {$s->store_name} | logo_url: {$s->logo_url} | banner_url: {$s->banner_url}" . PHP_EOL;
}

echo PHP_EOL . "=== USERS AVATARS ===" . PHP_EOL;
foreach (App\Models\User::whereNotNull('avatar_url')->take(3)->get() as $u) {
    echo "User: {$u->full_name} | avatar_url: {$u->avatar_url}" . PHP_EOL;
}
