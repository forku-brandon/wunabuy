# Changelog

All notable changes to the **Wunabuy** platform are documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).  
Versioning follows [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

---

## [1.1.0] — 2026-09-17

### Added

#### Buyer App
- **Live Buyer Name in Digital Signature** — `DigitalSignatureModal` now reads the authenticated user's `full_name` from `useAuthStore` (instant cache) and refreshes it silently via `AuthService.getCurrentUser()` on every open. The hardcoded placeholder "Jean Dupont" has been permanently removed.
- **`DigitalSignaturePayload` type** — `onConfirmSignature` now emits a rich typed payload `{ signature_data, buyer_name, buyer_id, signed_at }` instead of a raw mock string. Callers in `BuyerOrdersScreen`, `OrderTrackingScreen`, and `TransporterActiveTripScreen` all updated.
- **`submitting` prop on `DigitalSignatureModal`** — Parent screens control a loading state; the Confirm button shows `"Releasing Escrow…"` while the API call is in flight.
- **Real-time order polling in `BuyerOrdersScreen`** — Orders list auto-refreshes every **6 seconds** without manual pull-to-refresh.
- **Real-time order polling in `OrderTrackingScreen`** — Single order detail auto-refreshes every **5 seconds**; status stepper and escrow state advance live.
- **Self-pickup conditional rendering** — `OrderTrackingScreen` now detects self-pickup orders (`delivery_method === 'self_pickup'` / presence of `pickup_pin`) and renders `StorePickupTable` instead of `LiveTrackingMap`.
- **Self-pickup PIN badge on order cards** — `BuyerOrdersScreen` displays a green `🚶 Self-Pickup PIN: #xxxx` badge on each self-pickup order card.
- **Live store pickup data** — `BuyerCartScreen` fetches real store data via `BuyerService.getStorePickupLocation(storeId)` and propagates `storeName`, `addressText`, `landmark`, `primaryPhone`, `operatingHours`, `riderInstructions`, `latitude`, `longitude` through the full navigation stack (Cart → Checkout → OrderSuccess → OrderTracking).
- **`BuyerService.getStorePickupLocation(storeId)`** — New service method calling `GET /api/v1/stores/{id}/pickup-location`.

#### Shared Types (`@wunabuy/types`)
- Added `pickup_pin?`, `delivery_method?`, and `store?` fields to `Order` type.
- Added `delivery_method?` and `pickup_pin?` to `CreateOrderPayload`.

#### Navigation
- Added `storeData?` to `CheckoutPayment` route params.
- Added `storeAddress?` and `storePhone?` to `OrderSuccess` route params.

### Changed

#### 4-Digit Pickup PIN Standardization (was incorrectly 5-digit in UI)
- `StorePickupTable.tsx` — default PIN `'84920'` → `'7842'`; header `PERSONAL RIDER 4-DIGIT VERIFICATION PIN`.
- `BuyerCartScreen.tsx` — PIN state: `useState('84920')` → `useState(() => Math.floor(1000 + Math.random() * 9000).toString())`.
- `CheckoutPaymentScreen.tsx` — default param PIN `'84920'` → `'7842'`.
- `OrderSuccessScreen.tsx` — label `4-DIGIT RIDER PIN CODE`; default `'7842'`.
- `seller.store.ts` — PIN generator: `Math.floor(10000 + rand * 90000)` → `Math.floor(1000 + rand * 9000)`.
- `SellerQRScannerModal.tsx` — sample test code `#84920` → `#7842`; all UI copy updated.
- `EditStoreProfileScreen.tsx` — placeholder "5-digit PIN" → "4-digit PIN".

### Backend

#### `OrderController.php`
- `confirmReceipt()` now accepts `buyer_signature`, `buyer_name`, `buyer_id`, `signed_at` from request body and persists them to `orders.metadata.buyer_signature_audit` (includes IP address, user agent, and server-side `confirmed_at` timestamp).
- Escrow release reason updated from `"Buyer Confirmation"` → `"Buyer Confirmation — Digital Signature"`.
- Order creation now stores `delivery_method` and 4-digit `pickup_verification_pin` from request payload.

#### `CommerceController.php`
- `getStorePickupLocation()` now returns full store attributes: `store_id`, `store_name`, `address_text`, `landmark`, `city`, `latitude`, `longitude`, `phone`, `counter_hours`, `rider_instructions`, `is_verified`, and `pickup_specs[]`.

#### `ordersService.ts`
- `confirmDelivery(orderId, signaturePayload?)` now POSTs signature audit fields to `POST /orders/{id}/confirm-receipt`. Falls back to `api.orders.confirmOrderReceipt()` if the client route differs.

### Documentation
- `docs/wuanbuy_escrow_system_specification.md` bumped to **v1.1.0** — added Section 9 (implementation changes) and Section 10 (changelog table).
- `CHANGELOG.md` created.

---

## [1.0.0] — 2026-09-16

### Added
- Initial platform release.
- Three-party escrow system (Buyer / Seller / Transporter).
- MTN MoMo and Orange Money payment integration via BIZAO aggregator.
- Real-time push notifications (Expo Notifications + FCM).
- KYC verification flow for sellers and transporters.
- Staff portal (React + Tailwind) for order management, KYC review, and dispute resolution.
- Buyer mobile app (React Native / Expo).
- Seller mobile app module (role-switching).
- Transporter mobile app module with 4-stage delivery workflow.
- Digital Signature modal for proof-of-delivery (POD).
- QR/PIN scanner for merchant handover verification.
- Wallet system with escrow locking, balance tracking, and withdrawal flows.
- In-app dispute filing with evidence photo upload.
- Real-time notification system for KYC events, order updates, and staff alerts.
