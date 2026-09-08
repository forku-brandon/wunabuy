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
