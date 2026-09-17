<?php

namespace App\Http\Controllers\Api;

use App\Models\Notification;
use App\Models\UserDeviceToken;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get paginated notifications for authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return $this->respondError('UNAUTHENTICATED', 'Authentication required', null, 401);
        }

        $query = Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc');

        $role = $request->query('role');
        if ($role && in_array(strtolower($role), ['buyer', 'seller', 'transporter'])) {
            $normalizedRole = strtolower($role);
            $query->where(function ($q) use ($normalizedRole) {
                $q->where('data->role', $normalizedRole)
                  ->orWhere('data->role', 'all')
                  ->orWhereNull('data->role');
            });
        }

        $type = $request->query('type');
        if ($type && $type !== 'all') {
            if ($type === 'orders') {
                $query->whereIn('type', ['order_status', 'escrow', 'delivery', 'order']);
            } elseif ($type === 'marketing') {
                $query->whereIn('type', ['marketing', 'promo', 'campaign']);
            } elseif ($type === 'updates') {
                $query->whereIn('type', ['system', 'security', 'alert', 'kyc']);
            } else {
                $query->where('type', $type);
            }
        }

        $perPage = min((int) $request->query('per_page', 20), 50);
        $notifications = $query->paginate($perPage);

        $unreadQuery = Notification::where('user_id', $user->id)
            ->where('is_read', false);

        if ($role && in_array(strtolower($role), ['buyer', 'seller', 'transporter'])) {
            $normalizedRole = strtolower($role);
            $unreadQuery->where(function ($q) use ($normalizedRole) {
                $q->where('data->role', $normalizedRole)
                  ->orWhere('data->role', 'all')
                  ->orWhereNull('data->role');
            });
        }

        $unreadCount = $unreadQuery->count();

        return $this->respondSuccess([
            'notifications' => $notifications->items(),
            'unread_count' => $unreadCount,
            'pagination' => [
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
                'per_page' => $notifications->perPage(),
                'total' => $notifications->total(),
            ],
        ]);
    }

    /**
     * Get unread notifications count for real-time header bell badge.
     */
    public function getUnreadCount(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return $this->respondSuccess(['unread_count' => 0]);
        }

        $query = Notification::where('user_id', $user->id)
            ->where('is_read', false);

        $role = $request->query('role');
        if ($role && in_array(strtolower($role), ['buyer', 'seller', 'transporter'])) {
            $normalizedRole = strtolower($role);
            $query->where(function ($q) use ($normalizedRole) {
                $q->where('data->role', $normalizedRole)
                  ->orWhere('data->role', 'all')
                  ->orWhereNull('data->role');
            });
        }

        $count = $query->count();

        return $this->respondSuccess([
            'unread_count' => $count,
        ]);
    }

    /**
     * Mark a specific notification as read.
     */
    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return $this->respondError('UNAUTHENTICATED', 'Authentication required', null, 401);
        }

        $notification = Notification::where('user_id', $user->id)
            ->where('id', $id)
            ->first();

        if (!$notification) {
            return $this->respondError('NOT_FOUND', 'Notification not found', null, 404);
        }

        $notification->is_read = true;
        $notification->save();

        $unreadCount = Notification::where('user_id', $user->id)
            ->where('is_read', false)
            ->count();

        return $this->respondSuccess([
            'notification' => $notification,
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return $this->respondError('UNAUTHENTICATED', 'Authentication required', null, 401);
        }

        Notification::where('user_id', $user->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return $this->respondSuccess([
            'unread_count' => 0,
            'message' => 'All notifications marked as read.',
        ]);
    }

    /**
     * Delete a specific notification.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return $this->respondError('UNAUTHENTICATED', 'Authentication required', null, 401);
        }

        Notification::where('user_id', $user->id)
            ->where('id', $id)
            ->delete();

        return $this->respondSuccess([
            'deleted' => true,
        ]);
    }

    /**
     * Clear all notifications for user.
     */
    public function clearAll(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return $this->respondError('UNAUTHENTICATED', 'Authentication required', null, 401);
        }

        Notification::where('user_id', $user->id)->delete();

        return $this->respondSuccess([
            'cleared' => true,
            'unread_count' => 0,
        ]);
    }

    /**
     * Register or update user device push token.
     */
    public function registerDeviceToken(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return $this->respondError('UNAUTHENTICATED', 'Authentication required', null, 401);
        }

        $validated = $request->validate([
            'token' => 'required|string|max:500',
            'platform' => 'nullable|string|max:50',
            'device_name' => 'nullable|string|max:255',
        ]);

        $deviceToken = UserDeviceToken::updateOrCreate(
            [
                'user_id' => $user->id,
                'token' => $validated['token'],
            ],
            [
                'platform' => $validated['platform'] ?? 'android',
                'device_name' => $validated['device_name'] ?? null,
                'is_active' => true,
            ]
        );

        return $this->respondSuccess([
            'registered' => true,
            'device_token' => $deviceToken,
        ]);
    }

    /**
     * De-register a device push token on user logout.
     */
    public function removeDeviceToken(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return $this->respondError('UNAUTHENTICATED', 'Authentication required', null, 401);
        }

        $token = $request->input('token');
        if ($token) {
            UserDeviceToken::where('user_id', $user->id)
                ->where('token', $token)
                ->delete();
        }

        return $this->respondSuccess([
            'removed' => true,
        ]);
    }
}
