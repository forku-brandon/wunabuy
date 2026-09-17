<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use App\Models\UserDeviceToken;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class NotificationService
{
    private const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

    /**
     * Send a real-time notification to a specific user (database + push notification).
     */
    public static function sendToUser(
        string $userId,
        string $title,
        string $message,
        string $type = 'info',
        array $data = []
    ): ?Notification {
        try {
            // 1. Create database notification record
            $notification = Notification::create([
                'user_id' => $userId,
                'title' => $title,
                'message' => $message,
                'type' => $type,
                'is_read' => false,
                'data' => $data,
            ]);

            // 2. Fetch active device tokens
            $tokens = UserDeviceToken::where('user_id', $userId)
                ->where('is_active', true)
                ->pluck('token')
                ->filter()
                ->values()
                ->all();

            if (!empty($tokens)) {
                self::dispatchExpoPush($tokens, $title, $message, array_merge($data, [
                    'notification_id' => $notification->id,
                    'type' => $type,
                ]));
            }

            return $notification;
        } catch (\Throwable $e) {
            Log::error('Failed to send notification to user', [
                'user_id' => $userId,
                'title' => $title,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Broadcast notification to all users or specific roles (buyer, seller, transporter).
     */
    public static function broadcast(
        array|string $roles,
        string $title,
        string $message,
        string $type = 'marketing',
        array $data = []
    ): int {
        try {
            $rolesList = is_array($roles) ? $roles : [$roles];
            $isAll = in_array('all', $rolesList) || empty($rolesList);

            $userQuery = User::where('status', 'active');
            if (!$isAll) {
                $userQuery->where(function ($q) use ($rolesList) {
                    $q->whereIn('role', $rolesList);
                    foreach ($rolesList as $r) {
                        $q->orWhereJsonContains('available_roles', $r);
                    }
                    if (in_array('seller', $rolesList)) {
                        $q->orWhereHas('store');
                    }
                    if (in_array('transporter', $rolesList)) {
                        $q->orWhereHas('transporter');
                    }
                });
            }

            $userIds = $userQuery->pluck('id')->all();
            if (empty($userIds)) {
                return 0;
            }

            $targetRole = $isAll ? 'all' : (is_array($roles) ? ($roles[0] ?? 'all') : $roles);
            $enrichedData = array_merge($data, [
                'role' => $targetRole,
                'broadcast' => true,
            ]);
            $jsonPayload = json_encode($enrichedData);

            $now = now();
            $batchRecords = [];
            foreach ($userIds as $userId) {
                $batchRecords[] = [
                    'id' => (string) Str::uuid(),
                    'user_id' => $userId,
                    'title' => $title,
                    'message' => $message,
                    'type' => $type,
                    'is_read' => false,
                    'data' => $jsonPayload,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            // Bulk insert in chunks of 500
            foreach (array_chunk($batchRecords, 500) as $chunk) {
                Notification::insert($chunk);
            }

            // Gather all active tokens for target users
            $tokens = UserDeviceToken::whereIn('user_id', $userIds)
                ->where('is_active', true)
                ->pluck('token')
                ->filter()
                ->values()
                ->all();

            if (!empty($tokens)) {
                self::dispatchExpoPush($tokens, $title, $message, array_merge($enrichedData, [
                    'type' => $type,
                ]));
            }

            return count($userIds);
        } catch (\Throwable $e) {
            Log::error('Failed to broadcast notification', [
                'roles' => $roles,
                'title' => $title,
                'error' => $e->getMessage(),
            ]);
            return 0;
        }
    }

    /**
     * Send push notifications via Expo Push Notification API.
     */
    public static function dispatchExpoPush(array $tokens, string $title, string $message, array $data = []): void
    {
        try {
            $messages = [];
            foreach ($tokens as $token) {
                $messages[] = [
                    'to' => $token,
                    'sound' => 'default',
                    'title' => $title,
                    'body' => $message,
                    'data' => $data,
                    'priority' => 'high',
                    'channelId' => 'default',
                ];
            }

            // Expo accepts arrays of up to 100 messages per request
            $chunks = array_chunk($messages, 100);
            foreach ($chunks as $chunk) {
                Http::timeout(6)
                    ->withHeaders([
                        'Accept' => 'application/json',
                        'Accept-Encoding' => 'gzip, deflate',
                        'Content-Type' => 'application/json',
                    ])
                    ->post(self::EXPO_PUSH_URL, $chunk);
            }
        } catch (\Throwable $e) {
            // Push service failure should not block or crash core transactions
            Log::warning('Expo push notification dispatch failed', [
                'error' => $e->getMessage(),
                'token_count' => count($tokens),
            ]);
        }
    }
}
