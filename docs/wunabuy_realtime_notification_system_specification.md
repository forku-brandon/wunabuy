# Wunabuy Real-Time Enterprise Notification System Specification

## 1. Executive Summary & Architecture Overview
The Wunabuy Real-Time Notification System is an enterprise-grade multi-channel alerting infrastructure designed to deliver synchronized in-app inbox events and native push notifications (Android & iOS) across the Douala commerce ecosystem.

Modeled after tier-1 global ecommerce applications (Alibaba, Amazon, 1688), every notification event is:
- **Zero Mock / 100% Real Data**: Triggered strictly by authoritative state transitions in PostgreSQL and verified delivery rails.
- **Role-Aware & Multi-Aspect**: Tailored to distinct buyer, seller, and transporter workflows.
- **Dual-Channel Delivery**: Persisted to the recipient's in-app inbox (`notifications` table) while dispatching push payloads to registered physical device tokens via the Expo Push API.
- **Staff-Audited Broadcast Engine**: Equips Wunabuy staff with targeted audience broadcasting (All, Buyers, Sellers, Transporters) featuring live lockscreen previews.

---

## 2. Native Device Permission & Onboarding Flow

### 2.1 First-Launch Permission Prompt
1. Upon application launch post-installation, `NotificationManager.hasPromptedPermission()` inspects persistent storage (`@wunabuy:notification_permission_prompted`).
2. If unprompted, after initial view hydration, the app presents the high-conversion **Stay Updated in Real Time** modal (`PermissionPromptModal.tsx`):
   - **Order & Escrow Milestones**: Live alerts for payment escrow, vendor dispatch, and delivery confirmations.
   - **Live Transporter Arrival**: Proximity notification when the assigned rider is at the customer location.
   - **Flash Sales & Merchant Deals**: Limited-time promotional drops and voucher credits.
3. Upon customer tap:
   - **Enable Notifications**: Calls `Notifications.requestPermissionsAsync()` requesting OS-level push authorization (`POST_NOTIFICATIONS` on Android 13+, APNs on iOS).
   - Once granted, resolves the unique Expo Push Token and dispatches an upsert request to `/api/v1/notifications/device-token`.
   - **Maybe Later / Dismiss**: Persists the prompted state without prompting repeatedly on subsequent launches, respecting user preferences.

---

## 3. Database Schema & Token Lifecycle

### 3.1 Device Tokens Table (`user_device_tokens`)
```sql
CREATE TABLE user_device_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_token VARCHAR(255) NOT NULL,
    device_type VARCHAR(32) NOT NULL DEFAULT 'android', -- 'android', 'ios', 'web'
    device_name VARCHAR(128) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_used_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    CONSTRAINT uq_user_device_token UNIQUE (user_id, device_token)
);

CREATE INDEX idx_user_device_tokens_user ON user_device_tokens (user_id, is_active);
CREATE INDEX idx_user_device_tokens_token ON user_device_tokens (device_token);
```

### 3.2 In-App Notifications Table (`notifications`)
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'order_status', 'escrow', 'delivery', 'marketing', 'promo', 'system', 'alert'
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    data JSONB NULL,           -- Screen targets, order codes, action URLs
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

CREATE INDEX idx_notifications_user_read ON notifications (user_id, is_read);
CREATE INDEX idx_notifications_user_type ON notifications (user_id, type);
```

---

## 4. Multi-Aspect Notification Matrix

| Role | Event / Trigger | Channel | Type | Sample Message | In-App Screen Target |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Buyer** | Order Placed & Escrow Locked | Push + Inbox | `order_status` | "Your payment of 45,000 XAF for Order #WB-102948 is secured in Wunabuy Escrow." | `OrderTracking` |
| **Seller** | New Order Received | Push + Inbox | `order_status` | "🎉 New Order #WB-102948 received! 2 items awaiting your acceptance." | `SellerOrders` |
| **Buyer** | Order Accepted & Preparing | Push + Inbox | `order_status` | "Merchant accepted Order #WB-102948. Your package is currently being packed." | `OrderTracking` |
| **Transporter** | Order Ready for Pickup | Push + Inbox | `delivery` | "📦 New dispatch job available in Akwa! Order #WB-102948 ready for pickup." | `TransporterJobs` |
| **Buyer** | Rider Assigned & En Route | Push + Inbox | `delivery` | "Rider Michel assigned to Order #WB-102948. Tracking is now live on map." | `OrderTracking` |
| **Buyer & Seller** | Package Delivered & Escrow Released | Push + Inbox | `escrow` | "Order #WB-102948 delivered. 42,750 XAF credited to seller wallet." | `BuyerOrders` / `BuyerWallet` |
| **All / Segment** | Staff Broadcast | Push + Inbox | `marketing` / `system` | "Flash Sale: Up to 40% off electronics this Saturday in Douala!" | Dynamic Deep Link |

---

## 5. API Endpoints

### 5.1 Mobile Client Endpoints
- `GET /api/v1/notifications`: Paginated notifications for authenticated user, with optional `?type=orders|marketing|updates` filter.
- `GET /api/v1/notifications/unread-count`: Returns integer unread count for dynamic bell badge indicators.
- `POST /api/v1/notifications/{id}/read`: Marks notification as read.
- `POST /api/v1/notifications/mark-all-read`: Marks all unread notifications as read.
- `DELETE /api/v1/notifications/{id}`: Soft/hard deletes notification item.
- `DELETE /api/v1/notifications/clear-all`: Clears notification inbox for current user.
- `POST /api/v1/notifications/device-token`: Registers/refreshes Expo push token (`device_token`, `device_type`, `device_name`).
- `DELETE /api/v1/notifications/device-token`: Unregisters token on sign-out.

### 5.2 Staff Operations Portal Endpoints
- `POST /api/v1/staff/notifications/broadcast`:
  - Request body: `{ audience: 'all'|'buyers'|'sellers'|'transporters', title, message, type, data }`.
  - Response: `{ success: true, data: { message: "...", queued_count: 1420 } }`.
- `POST /api/v1/staff/notifications/send-direct`:
  - Request body: `{ user_id, title, message, type, data }`.
  - Response: `{ success: true, data: { message: "Direct notification dispatched." } }`.

---

## 6. Staff Broadcast Portal Features
- **Audience Filtering**: All Users, Buyers Only, Sellers Only, Transporters Only.
- **Category Badging**: Marketing & Promotions, System Announcements, Security & Platform Alerts.
- **Deep Link Customization**: Link directly to Buyer Orders, Buyer Wallet, Seller Fulfillment, or Transporter Dispatch boards.
- **Live Device Lockscreen Preview**: Instant visual preview rendering how the notification appears on a mobile lock screen with Wunabuy branding, title, body, and timestamp.
