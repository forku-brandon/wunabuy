<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Support\Str;

abstract class Controller extends BaseController
{
    /**
     * Standard success envelope matching @wunabuy/api-client & staff-portal expectations:
     * { success: true, data: T, meta: { timestamp, request_id, ... } }
     */
    protected function respondSuccess(mixed $data, array $meta = [], int $status = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $data,
            'meta' => array_merge([
                'timestamp' => now()->toIso8601String(),
                'request_id' => 'req_' . Str::random(12),
            ], $meta),
        ], $status);
    }

    /**
     * Standard paginated response envelope:
     * { success: true, data: T[], meta: { pagination: { has_more, next_cursor, per_page } } }
     */
    protected function respondPaginated(mixed $items, bool $hasMore = false, ?string $nextCursor = null, int $perPage = 15, int $status = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $items,
            'meta' => [
                'pagination' => [
                    'has_more' => $hasMore,
                    'next_cursor' => $nextCursor,
                    'per_page' => $perPage,
                ],
                'timestamp' => now()->toIso8601String(),
            ],
        ], $status);
    }

    /**
     * Standard error envelope matching ApiError interface:
     * { success: false, error: { code, message, details, request_id } }
     */
    protected function respondError(string $code, string $message, ?array $details = null, int $status = 400): JsonResponse
    {
        return response()->json([
            'success' => false,
            'error' => [
                'code' => $code,
                'message' => $message,
                'details' => $details,
                'request_id' => 'err_' . Str::random(12),
            ],
        ], $status);
    }
}