# SYSTEM ARCHITECTURE & COMPLIANCE SPECIFICATION
## Project Name: wuanbuy (Cameroon)
### Document Version: 1.1.0
### Last Updated: 2026-09-17
### Target Region: CEMAC Zone (Cameroon, Gabon, Chad, Congo, CAR, Equatorial Guinea)
### Classification: Confidential - Internal Engineering & Regulatory Standards

---

## 1. Executive Summary & Core Target

### 1.1 Objective
This document specifies the technical architecture, financial ledger logic, regulatory compliance framework, and operational procedures for the **wuanbuy** three-party escrow system. The system securely locks transactions between Buyers, Sellers, and Transporters within the e-commerce mobile application to mitigate fraud, optimize logistics reliability, and formalize digital commerce across the **CEMAC** sub-region.

### 1.2 The Ecosystem Challenge
In the Central African e-commerce landscape, trust deficit and volatile delivery infrastructure represent the highest barriers to conversion. **wuanbuy** solves this by positioning itself as a neutral financial intermediary via automated digital escrow, ensuring:
* **Buyers** only release funds upon verifiable physical receipt of goods.
* **Sellers** receive guaranteed payment protection prior to dispatching items.
* **Transporters** (both freelance riders/drivers and established logistics corporations) are guaranteed immediate milestone payouts upon successful parcel delivery.

### 1.3 Target Audience & Demographics
* **Primary Geography:** Headquartered in Cameroon (Douala/Yaoundé hubs) with immediate architectural scaling for the broader CEMAC zone.
* **Socio-Economic Segment:** Retail consumers, informal MSMEs, independent transport freelancers (moto-taximen, taxi drivers, bus operators), and formal third-party logistics (3PL) companies.
* **Payment Layer Default:** Mobile Money (MTN MoMo, Orange Money) serving as the primary infrastructure, with secondary banking rails for corporate logistics partners.

---

## 2. Institutional Framework & Organizations Involved

The execution of the **wuanbuy** escrow model involves four primary structural layers:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        COBAC / BEAC REGULATORS                         │
│             (Financial Overseers & Central Banking Compliance)         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  PRIMARY AGGREGATOR PARTNER: BIZAO                     │
│         (Handles Cross-Border XAF Collections, Escrow Pots, & Payouts) │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        WUANBUY PLATFORM ENGINE                         │
│               (Core Database, Local Servers, Logic & Ledger)           │
└───────────────────────────────────┬────────────────────────────────────┘
          ┌─────────────────────────┼─────────────────────────┐
          ▼                         ▼                         ▼
┌───────────────────┐     ┌───────────────────┐     ┌────────────────────┐
│      BUYERS       │     │      SELLERS      │     │    TRANSPORTERS    │
│  (Mobile Wallets) │     │ (Virtual Wallets) │     │ (Freelance & 3PLs) │
└───────────────────┘     └───────────────────┘     └────────────────────┘
```

1. **wuanbuy Platform (The Escrow Administrator):** Acts as the sole arbitrator and technical layer executing database modifications, tracking order lifecycle events, and triggering financial APIs.
2. **Payment Aggregator Partner (BIZAO):** Selected as the optimal gateway infrastructure due to its deep technical deployment across the CEMAC region (direct connectivity with MTN Cameroon, Orange Cameroon, and cross-border MNOs in Gabon/Congo). Bizao acts as the master custodian wallet holding the collective pool of physical XAF currency in high-availability liquidity pools.
3. **The Regulatory Authorities:** 
   * **BEAC (Bank of Central African States):** Governs physical and digital XAF movement.
   * **COBAC (Central African Banking Commission):** Sets strict compliance mandates for payment service intermediaries and anti-money laundering (AML) controls.
   * **ANTIC (National Agency for Information and Communication Technologies - Cameroon):** Governs cryptographic compliance, local server security tokens, and electronic commerce validation.
4. **Third-Party Logistics (3PL) Corporations & Freelancers:** Integrated via a unified mobile application driver module or discrete secure webhooks allowing external logistics APIs to broadcast transport state vectors.

---

## 3. Regulatory & Legal Compliance Framework

To run a digital financial ledger legally within the CEMAC zone without operating as a fully licensed commercial bank, **wuanbuy** utilizes an **Aggregated Escrow Custody Model** structurally optimized for local laws:

### 3.1 Electronic Transactions & Digital Commerce Validation
Under the Cameroon Electronic Transactions Law, electronic agreements carry full legal enforceability. When a user creates an account on **wuanbuy**, they execute a binding digital contract granting the platform explicit power of attorney to hold funds in escrow and settle payouts according to automated algorithmic conditions.

### 3.2 Financial Intermediation & COBAC Alignment
* **Non-Deposit Taking Status:** The application does not pay interest on virtual wallet balances, avoiding classification as a banking institution or microfinance. All funds are bound directly to specialized underlying transaction requests.
* **KYC (Know Your Customer) Mandates:**
  * **Buyers:** Level 1 KYC (Verified Phone Number linked to SIM registration + Name).
  * **Freelance Transporters:** Level 2 KYC (National Identity Card, Driver's License, and Utility/Locational verification).
  * **Sellers & Corporate 3PLs:** Level 3 KYC (Business registration/RCCM, Taxpayer ID, and Authorized Corporate Bank Account verification).

### 3.3 Data Privacy (ANTIC Regulations)
All customer transaction data, names, tracking records, and geolocations must be stored on local or regionally secure cloud networks compliant with ANTIC data localization rules. PII (Personally Identifiable Information) data fields must be encrypted at rest utilizing AES-256 standards.

---

## 4. Local Server Architecture & Data Logic

### 4.1 High-Level Architecture Diagram
The architecture is structured around a central application container interacting asynchronously with relational ledgers and exterior Mobile Money provider networks via webhooks.

```
                  ┌──────────────────────────────────────┐
                  │          wuanbuy Client Apps         │
                  │       (Buyer / Seller / Driver)      │
                  └──────────────────┬───────────────────┘
                                     │ (HTTPS/REST)
                                     ▼
                  ┌──────────────────────────────────────┐
                  │        Nginx Reverse Proxy           │
                  └──────────────────┬───────────────────┘
                                     │
                                     ▼
                  ┌──────────────────────────────────────┐
                  │    App Server Container (NodeJS/Go)  │
                  └──────┬────────────────────────┬──────┘
                         │                        │
                         ▼                        ▼
         ┌────────────────────────┐      ┌────────────────────────┐
         │ PostgreSQL DB Instance │      │  Redis Cache (Locks &  │
         │  (ACID Compliant)      │      │     Idempotency)       │
         └────────────────────────┘      └────────────────────────┘
                         │
                         ▼ (Asynchronous Webhooks)
         ┌────────────────────────────────────────────────────────┐
         │               BIZAO PAYMENT AGGREGATOR                 │
         └────────────────────────────────────────────────────────┘
```

### 4.2 Database Ledger Design (PostgreSQL DDL)
To maintain accurate balance definitions across multiple concurrent accounts, an ACID-compliant schema is strictly required. This design explicitly segments real wallet assets from frozen escrow accounts.

```sql
-- Enums for state control
CREATE TYPE order_lifecycle_state AS ENUM ('pending_pickup', 'in_transit', 'delivered', 'cancelled', 'disputed');
CREATE TYPE escrow_financial_state AS ENUM ('funds_locked', 'disbursed_to_parties', 'disputed_held', 'fully_refunded');
CREATE TYPE financial_ledger_type AS ENUM ('deposit', 'escrow_lock', 'payout_release', 'withdrawal', 'fee_deduction');

-- Virtual Wallets Table
CREATE TABLE user_virtual_wallets (
    wallet_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    available_balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    escrow_balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'XAF',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Core Transaction Ledger (Immutable Audit Trail)
CREATE TABLE global_financial_ledger (
    ledger_id BIGSERIAL PRIMARY KEY,
    reference_id VARCHAR(100) NOT NULL UNIQUE, -- Generated tracking reference UUID
    bizao_api_reference VARCHAR(150),
    sender_wallet_id INT REFERENCES user_virtual_wallets(wallet_id),
    receiver_wallet_id INT REFERENCES user_virtual_wallets(wallet_id),
    gross_amount DECIMAL(12, 2) NOT NULL,
    net_payout_amount DECIMAL(12, 2) NOT NULL,
    platform_commission_fee DECIMAL(12, 2) NOT NULL,
    telco_network_fee DECIMAL(12, 2) NOT NULL,
    transaction_type financial_ledger_type NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Three-Party Escrow Lifecycle Matrix
CREATE TABLE escrow_orders (
    order_id SERIAL PRIMARY KEY,
    buyer_id INT NOT NULL,
    seller_id INT NOT NULL,
    transporter_id INT NOT NULL,
    
    -- Financial Split Definition
    total_charged_buyer DECIMAL(12, 2) NOT NULL, 
    seller_net_cut DECIMAL(12, 2) NOT NULL,          
    transporter_net_cut DECIMAL(12, 2) NOT NULL,     
    wuanbuy_net_commission DECIMAL(12, 2) NOT NULL, 
    total_allocated_fees DECIMAL(12, 2) NOT NULL,
    
    -- Safety Mechanics
    secure_delivery_otp VARCHAR(6) NOT NULL,
    otp_salt_hash VARCHAR(64) NOT NULL,
    delivery_timestamp TIMESTAMP,
    escrow_expiration_timestamp TIMESTAMP NOT NULL, -- Core 48-hour arbitration window marker
    
    -- Status Trackers
    order_state order_lifecycle_state DEFAULT 'pending_pickup',
    escrow_state escrow_financial_state DEFAULT 'funds_locked',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4.3 Idempotency & Concurrency Defenses
To prevent "double-spend" exploits or duplication glitches caused by erratic network coverage (common with 3G/4G infrastructure shifts in Central Africa), all API entry endpoints executing a wallet balance mutation must pass an explicit unique client header token (`Idempotency-Key`). The platform uses a high-performance Redis distributed lock mechanism to discard duplicate payout calls attempting execution within a 30-second window.

---

## 5. Optimal Micro-Pricing Model (Fee Distribution Strategy)

A fair fee distribution model prevents friction at checkout and payout. Telecom operators (MTN & Orange) charge collection and payout processing margins. The architecture distributes this burden systematically across the transaction chain to protect user satisfaction and operator trust:

```
                  ┌──────────────────────────────────────────────┐
                  │             BUYER CHECKOUT BILL              │
                  │ ──────────────────────────────────────────── │
                  │  • Item Price:                    CFA 10,000 │
                  │  • Delivery Base Fee:             CFA  4,000 │
                  │  • Escrow Operational Service Fee:CFA    500 │
                  │ ──────────────────────────────────────────── │
                  │  TOTAL PAID AT DISPATCH:          CFA 14,500 │
                  └──────────────────────┬───────────────────────┘
                                         │
                        (Bizao Automated Collection)
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │          wuanbuy ALLOCATION FLOW             │
                  │ ──────────────────────────────────────────── │
                  │  • Seller Virtual Wallet:         CFA 10,000 │
                  │  • Transporter Virtual Wallet:    CFA  3,800 │
                  │  • Platform Net Profit Margin:    CFA    400 │
                  │  • Unified Network Payout Pools:  CFA    300 │
                  └──────────────────────────────────────────────┘
```

### 5.1 Pricing Matrix Breakdowns
1. **The Collection Layer:** An explicit **CFA 500 Fixed Service Fee** is integrated into the Buyer's bill at checkout. This fee covers initial payment processing and offsets infrastructural platform maintenance.
2. **The Transporter Apportionment:** Transporters absorb a tiny network processing allocation (**5% of their delivery assignment value**; for instance, CFA 200 on a CFA 4,000 run). This contribution scales directly with distance metrics and funds automated mobile network termination fees when transferring actual cash to their phones.
3. **The Seller Safeguard:** Sellers receive **exactly 100% of their listed product retail value** (CFA 10,000). By shielding vendors from unexpected billing subtractions, wuanbuy ensures strong inventory recruitment, allowing merchants to quote clean retail parameters without inflating prices.
4. **Platform Optimization:** The platform aggregates the combined service adjustments into a centralized operations fund, covering automated API connection fees while leaving a sustainable net transaction profit margin.

---

## 6. Detailed Operational Procedures & Workflows

### 6.1 Step-by-Step Order Lifecycle

```
[Buyer Pays] ──>(Funds Locked) ──>[Transporter Pick-up] ──>[In Transit] ──>[Secure OTP Input] ──>(Automatic Split Disbursal)
```

1. **Initiation:** The Buyer submits an order. The mobile application targets Bizao's collection node, prompting a local network push USSD string on the user's mobile device asking for PIN confirmation.
2. **Lock-down:** Upon payment validation, the network relays a webhook to wuanbuy. The application server creates an entries group in `escrow_orders` with the state set to `funds_locked`. The system programmatically generates a random 6-digit `secure_delivery_otp` and broadcasts it to the Buyer's application module via an encrypted notification block.
3. **Fulfillment Transit:** The Transporter arrives at the designated vendor point. They scan the vendor's digital product package barcode to transform the systemic status to `in_transit`.
4. **Physical Transfer & Validation:** The Transporter reaches the buyer destination. The Buyer physically evaluates the parcel. If the product meets expectations, the Buyer verbally communicates the 6-digit Secure Delivery OTP to the Transporter.
5. **The Disbursal Engine Execution:** The Transporter keys the OTP string into their device. The local engine checks this value. Upon confirmation, the backend database shifts the escrow status to `disbursed_to_parties`, moving the respective financial components directly into the Seller's and Transporter's available virtual wallets.

### 6.2 The 48-Hour Arbitration Procedure
To prevent sellers and transporters from being paralyzed by negligent buyers who receive goods but forget to input their OTP code:
* The moment an order transitions to `in_transit`, a system cron job calculates a fixed `escrow_expiration_timestamp` exactly **48 hours** into the future.
* If 48 hours pass without a formal dispute report or an OTP input entry, the backend assumes successful completion. The cron execution process fires a force-release block, moving the held funds out of escrow directly into the Seller's and Transporter's available wallets.

### 6.3 Sole Arbitration Dispute Management Logic
If a customer receives an item broken, wrong, or counterfeit within the 48-hour threshold, they can press the **"File System Dispute"** button inside the application layout.
1. The system freezes the transaction state, updating it to `disputed_held`. This action blocks the 48-hour expiration timer.
2. **wuanbuy Operations Team** takes over as sole arbitrator. 
3. The platform interface prompts both the Transporter and the Buyer to upload structural evidence photos along with tracking notes within a 24-hour window.
4. An administration portal representative evaluates the case data. If the Buyer's claim is valid, the customer receives a mobile money push refund, while the Transporter is paid their delivery fee from the platform pool if they completed the physical route without negligence.

---

## 7. Mobile App API Integration Blueprints

### 7.1 Collection Endpoint (Buyer Initiates Checkout)
* **Endpoint:** `POST /api/v1/payments/collection`
* **Description:** Requests Mobile Money from the Buyer via Bizao's integrated gateway.

**Request Payload:**
```json
{
  "order_reference": "WUB-98762-CMR",
  "buyer_phone": "237677XXXXXX",
  "telco_operator": "MTN",
  "country_code": "CM",
  "total_amount": 14500.00,
  "currency": "XAF"
}
```

**Response Sample:**
```json
{
  "status": "PROCESSING",
  "bizao_transaction_id": "BZA-77123-XYZ",
  "message": "USSD Push sent to user device. Await Pin Entry input.",
  "timestamp": "2026-09-16T17:35:00Z"
}
```

### 7.2 OTP Delivery Validation Endpoint (The Release Trigger)
* **Endpoint:** `POST /api/v1/escrow/verify-otp`
* **Description:** Fired by the Transporter application upon delivery to unlock virtual balances.

**Request Payload:**
```json
{
  "order_id": 40221,
  "transporter_id": 983,
  "input_otp": "482910"
}
```

**Response Sample:**
```json
{
  "success": true,
  "order_id": 40221,
  "updated_escrow_state": "disbursed_to_parties",
  "ledger_updates": {
    "seller_credited": 10000.00,
    "transporter_credited": 3800.00,
    "platform_fee_secured": 400.00
  },
  "timestamp": "2026-09-16T17:35:10Z"
}
```

### 7.3 Automated Withdrawal Request (Seller or Transporter Clicks Withdraw)
* **Endpoint:** `POST /api/v1/wallets/withdraw`
* **Description:** Checks internal database balances and triggers Bizao’s Payout/Disbursement routing engine to push real money onto the user's phone.

**Request Payload:**
```json
{
  "user_id": 8832,
  "requested_withdrawal_amount": 10000.00,
  "payout_phone_target": "237699XXXXXX",
  "target_operator": "ORANGE"
}
```

**Response Sample:**
```json
{
  "withdrawal_status": "SUCCESSFUL",
  "transaction_reference": "WUB-WITHDRAW-88122",
  "disbursed_amount": 10000.00,
  "remaining_virtual_balance": 0.00,
  "timestamp": "2026-09-16T17:35:15Z"
}
```

---

## 8. Verification & Infrastructure Testing Protocols

To guarantee absolute ledger precision before deploying code to staging environments in Cameroon, the development team must implement strict technical compliance tests:

### 8.1 Network Failure Simulation Tests
* **Scenario:** The buyer submits their Mobile Money PIN, Bizao captures the cash, but the Cameroonian mobile network drops connectivity before delivering the confirmation webhook to **wuanbuy**.
* **Mitigation Protocol:** Implement an automated asynchronous reconciliation worker. If an order remains in a `pending_payment` state for longer than 15 minutes, the worker calls Bizao’s transaction inquiry endpoint (`GET /api/v1/payments/status/{bizao_transaction_id}`) to update the database state.

### 8.2 Mathematical Split Invariant Tests
* **Rule:** `total_charged_buyer` must always match the absolute sum of (`seller_net_cut` + `transporter_net_cut` + `wuanbuy_net_commission` + `total_allocated_fees`).
* **Implementation Requirement:** Run strict transactional unit tests inside the backend stack using floating-point safety libraries (e.g., using explicit arbitrary-precision `Decimal` objects instead of standard floats) to prevent fractional cent leakage over thousands of transactions.

---

## 9. Implementation Updates — v1.1.0 (2026-09-17)

This section documents the concrete changes shipped in release **v1.1.0**, covering the buyer-side PIN standardization, digital signature audit trail, and real-time data flow improvements.

### 9.1 4-Digit Pickup PIN Standardization

**Background:** Earlier system versions contained a hardcoded 5-digit test PIN (`84920`) in multiple frontend components. The backend has always generated 4-digit PINs via `rand(1000, 9999)`. This mismatch caused visual inconsistency in the buyer app and the transporter handover flow.

**Changes Applied:**

| Layer | Change |
|---|---|
| `OrderController.php` | `confirmReceipt()` now accepts `pickup_pin` from request body; fallback generation uses `str_pad(rand(1000,9999), 4)` |
| `StorePickupTable.tsx` | Default PIN changed to `'7842'`; label updated to `PERSONAL RIDER 4-DIGIT VERIFICATION PIN` |
| `BuyerCartScreen.tsx` | PIN state initialized with `Math.floor(1000 + Math.random() * 9000).toString()` |
| `CheckoutPaymentScreen.tsx` | Default param PIN `'84920'` → `'7842'` |
| `OrderSuccessScreen.tsx` | Label changed to `4-DIGIT RIDER PIN CODE`; default `'7842'` |
| `seller.store.ts` | Fixed: `Math.floor(10000 + rand * 90000)` → `Math.floor(1000 + rand * 9000)` |
| `SellerQRScannerModal.tsx` | Sample test code `#84920` → `#7842`; copy updated to 4-digit |
| `EditStoreProfileScreen.tsx` | Placeholder updated from "5-digit PIN" to "4-digit PIN" |

**PIN Data Flow:**
```
Backend (rand 1000-9999) → OrderController → Order.pickup_pin
     ↓
BuyerCartScreen (fetch storeData) → StorePickupTable (display 4-digit)
     ↓
CheckoutPaymentScreen → OrderSuccessScreen → OrderTrackingScreen
```

### 9.2 Buyer Digital Signature Audit Trail

**Background:** The `DigitalSignatureModal` previously displayed a hardcoded static name ("Jean Dupont") with a mock `data:image/svg+xml;base64,mock_buyer_digital_signature_blob` blob. There was no server-side persistence of the sign-off event.

**Changes Applied:**

#### 9.2.1 Frontend — `DigitalSignatureModal.tsx`

- On modal open: reads `user.full_name` from `useAuthStore` immediately (cache hit, no flicker), then silently refreshes via `AuthService.getCurrentUser()` in the background.
- Displays a **"Signing as ► [Real Name]"** chip above the canvas.
- `onConfirmSignature` now emits a typed `DigitalSignaturePayload` object:

```typescript
interface DigitalSignaturePayload {
  signature_data: string;   // base64( userId:fullName:isoTimestamp )
  buyer_name: string;        // Real full_name from server profile
  buyer_id: string;          // Authenticated user UUID
  signed_at: string;         // ISO-8601 timestamp of signature tap
}
```

- Confirm button shows `"Releasing Escrow…"` while the parent API call is in flight (`submitting` prop).

#### 9.2.2 Service Layer — `ordersService.ts`

`confirmDelivery(orderId, signaturePayload?)` now posts:
```json
{
  "buyer_signature": "data:application/vnd.wunabuy.signature;base64,...",
  "buyer_name": "Forku Brandon",
  "buyer_id": "01a0811d-27f9-7298-9b64-7cff01362fbe",
  "signed_at": "2026-09-17T04:35:00.000Z"
}
```
to `POST /api/v1/orders/{id}/confirm-receipt`.

#### 9.2.3 Backend — `OrderController.php → confirmReceipt()`

Persists the full signature audit entry to `orders.metadata`:
```json
{
  "buyer_signature_audit": {
    "buyer_signature": "data:application/vnd.wunabuy.signature;base64,...",
    "buyer_name": "Forku Brandon",
    "buyer_id": "01a0811d-...",
    "signed_at": "2026-09-17T04:35:00.000Z",
    "ip_address": "41.202.x.x",
    "user_agent": "Expo/Go Android/14",
    "confirmed_at": "2026-09-17T04:35:01.000Z"
  }
}
```
Escrow is then released with reason string `"Buyer Confirmation — Digital Signature"` (previously plain `"Buyer Confirmation"`).

**Affected Screens:** `BuyerOrdersScreen`, `OrderTrackingScreen`, `TransporterActiveTripScreen`.

### 9.3 Real-Time Live Order Polling

| Screen | Interval | Behavior |
|---|---|---|
| `BuyerOrdersScreen` | 6 seconds | Silent re-fetch of all orders; escrow locked total updated; self-pickup PIN badges refreshed |
| `OrderTrackingScreen` | 5 seconds | Silent re-fetch of single order; status stepper advances; no loading spinner on background polls |

Intervals are created in `useEffect` cleanup functions to prevent memory leaks on navigation.

### 9.4 Live Store Pickup Data Flow

**Previous state:** `StorePickupTable` received hardcoded dummy data for store name, address, phone, and counter hours.

**Current state:** Full live data fetched from `GET /api/v1/stores/{id}/pickup-location` and propagated through the navigation stack:

```
BuyerCartScreen.useEffect()
  → BuyerService.getStorePickupLocation(storeId)
  → CommerceController.getStorePickupLocation()
      returns: store_id, store_name, address_text, landmark, city,
               latitude, longitude, phone, counter_hours,
               rider_instructions, is_verified, pickup_specs[]
  → StorePickupTable (props: storeName, addressText, landmarkDirections,
                              primaryPhone, operatingHours, riderInstructions,
                              latitude, longitude)
  → CheckoutPaymentScreen (storeData via route.params)
  → OrderSuccessScreen (storeAddress, storePhone via route.params)
  → OrderTrackingScreen (conditional: StorePickupTable vs LiveTrackingMap)
```

**Self-pickup detection logic (`OrderTrackingScreen`):**
```typescript
const isSelfPickup =
  order.delivery_method === 'self_pickup' ||
  order.delivery_address?.type === 'self_pickup' ||
  (order.delivery_fee === 0 && Boolean(order.pickup_pin)) ||
  Boolean(order.pickup_pin);
```

---

## 10. Changelog

| Version | Date | Author | Summary |
|---|---|---|---|
| 1.0.0 | 2026-09-16 | Engineering Team | Initial escrow architecture specification |
| 1.1.0 | 2026-09-17 | Engineering Team | 4-digit PIN standardization, digital signature audit trail, real-time polling, live store pickup data |
