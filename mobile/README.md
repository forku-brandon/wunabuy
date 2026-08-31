# Wunabuy Mobile App

Enterprise React Native application for Wunabuy (Expo SDK 51+, React Native 0.74+, TypeScript 5.4) supporting three distinct role workspaces with dynamic key-based isolation:

- **🛒 Buyer Workspace** — Discovery feed, auto-sliding hero & partners carousels, expandable product quick-views, full-text category filtering, 48-hour escrow protection, in-app mobile wallet (MTN MoMo & Orange Money), live GPS delivery tracking, and rich profile tools (Followed Stores, Favorites, Browsing Footprints, Disputes/Refunds).
- **🏪 Seller (Store Owner) Workspace** — Modern Merchant Dashboard with AppBar same-line actions (`☰`, `🔔`, `🔲`, `🛒`), Merchant Subtitle Stack, Emerald Teal balance card with 1-tap store account ID copy, Top Services 4x2 grid, Auto-Slide Sales Tips & Merchant Growth Carousel Presenter, Interactive Store Products Catalog with stock steppers and quick-view expand modal, 2-Hour Auto-Cancel Fulfillment Queue (`SellerOrdersScreen`), Dual Dispatch Modals, Store Wallet & MoMo Payout Engine, and dedicated `SellerProfileScreen`.
- **🏍️ Transport Provider Workspace** — Driver onboarding welcome carousel, 4-stage Driver KYC form, nearby delivery job offers with distance sorting, live trip route navigation, and driver earnings ledger.

---

## 🚀 Getting Started

```bash
# From workspace root
pnpm install

# Start mobile bundler
cd mobile
npx expo start
```

---

## 📱 Mobile Screen Inventory

### 1. Buyer Workspace (`BuyerApp`)
| Screen | File | Highlights |
|---|---|---|
| **Home** | `HomeScreen.tsx` | AppBar (`☰`, `🔍`, `🔔`, `🛒`), `HeroCarousel` (4.5s auto-scroll), `PartnersCarousel`, circular `CategoryChip` avatars, 2-column verified products grid |
| **Search** | `SearchScreen.tsx` | Category filter bar, search query filter, price/distance radius bottom sheet |
| **Product Detail** | `ProductDetailScreen.tsx` | 92% width hero gallery, floating action bar (`❤️`, share, cart), 2-col related recommendations, sticky stepper & dual CTA bottom bar |
| **Cart** | `BuyerCartScreen.tsx` | Item list with steppers, dynamic backend promo banner with 6s timeout, checkout CTA |
| **Checkout** | `CheckoutPaymentScreen.tsx` | Dual payment tabs: In-app Wallet Balance vs Mobile Money (MTN `*126#` / Orange `#150*50#`) |
| **Order Tracking** | `OrderTrackingScreen.tsx` | Real-time rider GPS marker, polyline route, ETA countdown, call/chat triggers |
| **My Wallet** | `WalletScreen.tsx` | Available Balance card, privacy eye toggle (`👁`), 4-stage MoMo funding/withdrawal modal, transaction ledger |
| **Profile** | `ProfileScreen.tsx` | 52px 3D clay avatar with camera picker, Wallet Quick-Access card, My Orders status shortcuts, My Tools shortcuts |
| **Followed Stores** | `FollowedStoresScreen.tsx` | Followed merchant feed with latest product previews and 1-tap cart addition |
| **Favorites** | `FavoritesScreen.tsx` | 2-column wishlist grid hooked into `useFavoritesStore` |
| **Footprints** | `FootprintScreen.tsx` | Chronological browsing history logging up to 50 items with timestamps |
| **Refunds** | `RefundsScreen.tsx` | In-progress escrow dispute tracker vs completed refund ledger |
| **Address Manager** | `AddressManagerScreen.tsx` | Delivery addresses with default switcher and bottom-sheet form |

### 2. Seller Workspace (`SellerApp`)
| Screen | File | Highlights |
|---|---|---|
| **Dashboard** | `SellerDashboardScreen.tsx` | Top AppBar with same-line actions, Subtitle Stack, Emerald Teal balance card with 1-tap account ID copy, Top Services 4x2 grid, Auto-Slide Sales Tips carousel, interactive store products catalog with quick-view modal and stock steppers, hidden-by-default KYC banner |
| **Products** | `SellerProductsScreen.tsx` | 2-column store catalog, active/paused switch, real-time `[ − 1 + ]` stock steppers, low-stock warning badges ($\le 5$ units) |
| **Add/Edit Product** | `AddEditProductScreen.tsx` | 5-photo upload grid with native camera & gallery picker, category horizontal selector, quality tier chips |
| **Orders Queue** | `SellerOrdersScreen.tsx` | 2-hour auto-cancel countdown timer (`⏳ 01:45:00`), Dual Delivery Dispatch Modal (Express Transporter vs In-House Rider), step-by-step lifecycle actions |
| **Store Wallet** | `SellerWalletScreen.tsx` | Available & Escrow balances, privacy eye toggle (`👁`), instant Mobile Money payout modal with 1% telecom fee calculation and percentage presets (`25%`, `50%`, `75%`, `Max`) |
| **Store Profile** | `SellerProfileScreen.tsx` | Store photo camera picker, Store ID copy, Store Wallet card, Fulfillment Queue status grid (`Accept`, `Pack`, `Handover`, `En Route`, `Settled`), Store Tools grid, 1-tap Buyer switcher |
| **Seller Welcome** | `SellerWelcomeScreen.tsx` | 70% automated benefit carousel (3.5s interval across 4 benefit cards) and 20% capsule CTA button |
| **Store KYC** | `StoreKYCScreen.tsx` | 4-stage wizard with 80% form / 20% button split, multiline description textarea (`minHeight: 110px`, `0/300` char limit), category chips, and celebration modal |

### 3. Transport Provider Workspace (`TransporterApp`)
| Screen | File | Highlights |
|---|---|---|
| **Transporter Welcome** | `TransporterWelcomeScreen.tsx` | Logo-free modern header, live status badge, 70% automated hero carousel with 4 benefit slides, 4 Transport Modality Cards (`Bike 🏍️`, `Taxi 🚕`, `Van 🚐`, `Plane ✈️`), and 20% capsule CTA |
| **Driver KYC** | `TransporterKYCScreen.tsx` | 4-stage driver verification (Driver Info & Bio, Vehicle Class & Base Quarter, CNI & Driver's License photos, Carte Grise & Assurance photos) |
| **Job Offers** | `TransporterJobsScreen.tsx` | Nearby transport offers sorted by spatial distance, pickup/drop-off cards |
| **Driver Earnings** | `TransporterEarningsScreen.tsx` | Available balance card, MoMo payout trigger, completed trip history |
| **Active Delivery** | `TransporterActiveTripScreen.tsx` | GPS route navigation, store pickup confirmation, live location broadcasting, digital signature proof of delivery |

---

## 🎨 Design System & Tokens

Imported directly from `@wunabuy/design-tokens`:
- **Primary Brand Palette**: Emerald Teal (`#0D9488` / `#0F766E`)
- **Accent Brand Palette**: Warm Amber (`#F59E0B`)
- **Neutral Surface Palette**: Slate (`#FFFFFF` Light / `#0F766E` Dark / `#0F172A` Slate Dark)
- **Semantic Feedback**: Green (`#10B981`), Amber (`#F59E0B`), Red (`#EF4444`), Blue (`#3B82F6`)

---

## 📚 Complete Project Documentation

- [Wunabuy PRD v1.9](../docs/Wunabuy_PRD_v1.0.md) — Comprehensive Product Requirements
- [Wunabuy SRS v1.9](../docs/Wunabuy_SRS_v1.2.md) — Software Requirements Specification
- [Frontend Technical Specification v1.9](../docs/Wunabuy_Frontend_Tech_Spec_v1.0.md) — Architecture, UI & State Spec
- [Backend Technical Specification v1.4](../docs/Wunabuy_Backend_Tech_Spec_v1.0.md) — Modular Laravel API & Database
