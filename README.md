# wunabuy 🏪

African mobile marketplace — Pinduoduo-style e-commerce for the African market.

Connects customers to local goods with delivery by local transporters. Full escrow payment flow with live GPS tracking.

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Customer     │     │  Store Owner  │     │  Transporter  │
│  (Flutter)    │     │  (Flutter)    │     │  (Flutter)    │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                     │                     │
       └──────────┬──────────┴──────────┬──────────┘
                  │                     │
         ┌────────▼────────┐   ┌───────▼────────┐
         │  REST API       │   │  WebSocket      │
         │  (Express)      │   │  (Socket.io)    │
         └────────┬────────┘   └───────┬────────┘
                  │                     │
         ┌────────▼────────────────────▼────────┐
         │           PostgreSQL                    │
         │   Users · Stores · Products · Orders     │
         │   Escrow · Tracking · KYC               │
         └──────────────────────────────────────────┘
```

## Three User Roles

- **Customer** — browse, search, order, pay via MTN/Orange Money, track live delivery, confirm receipt
- **Store Owner** — KYC registration, manage inventory, receive orders, dispatch via transporter
- **Transporter** — receive delivery assignments, share live GPS location

## Escrow Payment Flow

1. Customer pays → funds held in escrow (CamPay)
2. Store notified → confirms & prepares goods
3. Transporter picks up → GPS shared live with customer
4. Customer receives → confirms on platform
5. Funds released to store

Edge cases: auto-confirm after 72h, dispute window for refunds, admin oversight.

## Getting Started

```bash
# Install dependencies
npm install

# Set up database (requires PostgreSQL)
cp .env.example .env
# Edit .env with your database URL and CamPay credentials

# Run migrations
npx prisma migrate dev --name init

# Start dev server
npm run dev
```

## Tech Stack

- **Backend:** Node.js/TypeScript, Express
- **Database:** PostgreSQL + Prisma ORM
- **Payments:** CamPay (MTN Mobile Money + Orange Money)
- **Real-time:** Socket.io for live tracking
- **Auth:** JWT with bcrypt

## API Endpoints

### Auth
- `POST /auth/register` — Create account (choose role)
- `POST /auth/login` — Get JWT token
- `GET /auth/me` — Current user profile

### KYC (Store Owners)
- `POST /kyc` — Submit KYC application
- `PATCH /kyc/:id/review` — Admin reviews KYC

### Stores
- `POST /stores` — Register store (after KYC approval)
- `GET /stores/:storeId/products` — List store products
- `POST /stores/:storeId/products` — Add product

### Orders
- `POST /orders` — Create order
- `GET /orders` — List my orders

### Escrow Flow
- `POST /orders/:orderId/pay` — Confirm payment received
- `POST /orders/:orderId/process` — Store starts processing
- `POST /orders/:orderId/dispatch` — Assign transporter
- `POST /orders/:orderId/transit` — Transporter en route
- `POST /orders/:orderId/deliver` — Mark delivered
- `POST /orders/:orderId/confirm` — Customer confirms receipt
- `POST /orders/:orderId/refund-request` — Customer disputes

### Tracking
- `POST /tracking/location` — Transporter reports GPS
- `GET /orders/:orderId/tracking` — Get tracking history
- `GET /transporters/nearby?lat=...&lng=...` — Find nearby transporters

## WebSocket Events

- `track:subscribe {orderId}` — Customer subscribes to order tracking
- `track:update {orderId, lat, lng, speed}` — Transporter sends location
- Server emits: `track:location {orderId, lat, lng, speed, timestamp}`

## License

Private — wunabuy
