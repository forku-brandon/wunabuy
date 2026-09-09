import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, ProductCategory, QualityTier } from '@wunabuy/types';

export type SellerOrderStatus =
  | 'pending_acceptance' // New incoming order (2-hour acceptance timer)
  | 'preparing'          // Accepted, merchant packing
  | 'ready_for_pickup'   // Packaged, ready for driver handover
  | 'in_transit'         // Picked up by transporter / in-house rider
  | 'completed'          // Delivered & escrow released
  | 'cancelled'          // Declined or timed out
  | 'disputed';          // Buyer raised issue

export interface SellerOrderItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
}

export interface SellerOrder {
  id: string;
  order_code: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  items: SellerOrderItem[];
  subtotal: number;
  delivery_fee: number;
  commission: number;
  total: number;
  status: SellerOrderStatus;
  created_at: string;
  acceptance_expires_at: string; // ISO 8601 string (2 hours from creation)
  delivery_method?: 'wunabuy_transporter' | 'in_house_rider' | 'self_pickup';
  transporter_name?: string;
  transporter_phone?: string;
  pickup_pin?: string; // 5-digit security PIN sent to rider for handover verification
  decline_reason?: string;
  dispute_reason?: string;
}

export interface SellerTransaction {
  id: string;
  type: 'escrow_release' | 'payout' | 'commission_deduction';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  reference: string;
  description: string;
  created_at: string;
}

interface SellerState {
  storeName: string;
  storePhone: string;
  category: string;
  tagline: string;
  description: string;
  address: string;
  landmarkDirections: string;
  primaryPhone: string;
  secondaryPhone: string;
  email: string;
  operatingHours: string;
  riderPickupInstructions: string;
  latitude: number;
  longitude: number;
  logoUrl: string;
  coverPhotoUrl: string;
  isVerified: boolean;
  ratingAvg: number;
  totalReviews: number;
  followersCount: number;
  
  // Balances
  availableBalance: number;
  escrowLockedBalance: number;
  totalRevenue: number;
  totalPaidOut: number;

  // Orders & Catalog
  orders: SellerOrder[];
  products: Product[];
  transactions: SellerTransaction[];

  // Profile Action
  updateStoreProfile: (profile: Partial<SellerState>) => void;
  setDashboardMetrics: (data: {
    store_name?: string;
    is_verified?: boolean;
    rating_avg?: number;
    total_reviews?: number;
    available_balance?: number;
    escrow_locked_balance?: number;
    total_revenue?: number;
    total_paid_out?: number;
    pending_orders_count?: number;
    preparing_orders_count?: number;
    ready_orders_count?: number;
  }) => void;
  setTransactions: (transactions: SellerTransaction[]) => void;
  setOrders: (orders: SellerOrder[]) => void;
  setProducts: (products: Product[]) => void;

  // Actions
  acceptOrder: (orderId: string) => void;
  declineOrder: (orderId: string, reason: string) => void;
  markOrderReady: (orderId: string, deliveryMethod: 'wunabuy_transporter' | 'in_house_rider', driverPhone?: string) => void;
  markOrderInTransit: (orderId: string) => void;
  markOrderCompleted: (orderId: string) => void;
  
  // Product Actions
  addProduct: (product: Product) => void;
  updateProduct: (productId: string, partial: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  toggleProductActive: (productId: string) => void;
  updateStock: (productId: string, delta: number) => void;

  // Wallet Actions
  requestPayout: (amount: number, destinationPhone: string, provider: 'mtn' | 'orange') => { success: boolean; reference: string };
}


const INITIAL_SELLER_PRODUCTS: Product[] = [
  {
    id: 'sp_1',
    store_id: 'store_1',
    name: 'Samsung Galaxy A54 5G (128GB)',
    description: 'Crisp Super AMOLED 120Hz display, 50MP OIS camera, 5000mAh battery with fast charging.',
    category: ProductCategory.ELECTRONICS,
    price: 185000,
    currency: 'XAF',
    quantity: 14,
    quality_tier: QualityTier.NEW,
    images: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
    ],
    is_active: true,
    rating_avg: 4.8,
    total_reviews: 32,
    distance_km: 1.2,
    store: { id: 'store_1', store_name: 'Douala Tech Hub', rating_avg: 4.9, is_verified: true },
    created_at: '2026-08-20T10:00:00Z',
    updated_at: '2026-08-28T12:00:00Z',
  },
  {
    id: 'sp_2',
    store_id: 'store_1',
    name: 'Wireless Bluetooth Earbuds Pro ANC',
    description: 'Active noise cancellation, deep bass, 30h battery life with wireless charging case.',
    category: ProductCategory.ELECTRONICS,
    price: 25000,
    currency: 'XAF',
    quantity: 4, // Low stock indicator test
    quality_tier: QualityTier.NEW,
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800',
    ],
    is_active: true,
    rating_avg: 4.6,
    total_reviews: 19,
    distance_km: 1.2,
    store: { id: 'store_1', store_name: 'Douala Tech Hub', rating_avg: 4.9, is_verified: true },
    created_at: '2026-08-21T11:00:00Z',
    updated_at: '2026-08-28T12:00:00Z',
  },
  {
    id: 'sp_3',
    store_id: 'store_1',
    name: '4K Ultra HD Action Camera + Accessories',
    description: 'Waterproof up to 30m, dual screens, image stabilization, WiFi app control.',
    category: ProductCategory.ELECTRONICS,
    price: 45000,
    currency: 'XAF',
    quantity: 8,
    quality_tier: QualityTier.LIKE_NEW,
    images: [
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800',
    ],
    is_active: true,
    rating_avg: 4.7,
    total_reviews: 14,
    distance_km: 1.2,
    store: { id: 'store_1', store_name: 'Douala Tech Hub', rating_avg: 4.9, is_verified: true },
    created_at: '2026-08-22T09:00:00Z',
    updated_at: '2026-08-28T12:00:00Z',
  },
  {
    id: 'sp_4',
    store_id: 'store_1',
    name: 'Fast Charging Power Bank 20000mAh',
    description: '22.5W Super Charge, dual USB + Type-C ports, LED digital display.',
    category: ProductCategory.ELECTRONICS,
    price: 18000,
    currency: 'XAF',
    quantity: 0, // Out of stock test
    quality_tier: QualityTier.NEW,
    images: [
      'https://images.unsplash.com/photo-1609592424368-e4b2d18cbfe1?w=800',
    ],
    is_active: false,
    rating_avg: 4.9,
    total_reviews: 41,
    distance_km: 1.2,
    store: { id: 'store_1', store_name: 'Douala Tech Hub', rating_avg: 4.9, is_verified: true },
    created_at: '2026-08-23T14:00:00Z',
    updated_at: '2026-08-28T12:00:00Z',
  },
];

const INITIAL_SELLER_TRANSACTIONS: SellerTransaction[] = [];

export const useSellerStore = create<SellerState>()(
  persist(
    (set, get) => ({
      storeName: 'Douala Tech Hub',
      storePhone: '+237 670 123 456',
      category: 'Electronics & Smart Devices',
      tagline: 'Premier Electronics Importer & Original Smartphone Hub in Douala',
      description: 'Douala Tech Hub is a certified merchant specializing in authentic smartphones, laptops, wireless audio, and consumer electronics with 100% Escrow Warranty.',
      address: 'Rue Joss, Quartier Akwa, Douala, Cameroon',
      landmarkDirections: 'Opposite Place du Gouvernement, Next to Akwa Mall (1st Floor, Suite 104)',
      primaryPhone: '+237 670 123 456',
      secondaryPhone: '+237 699 876 543',
      email: 'contact@doualatechhub.cm',
      operatingHours: 'Mon - Sat: 8:00 AM - 6:30 PM (Closed Sundays)',
      riderPickupInstructions: 'Present 5-digit PIN at counter #2. Dedicated motorcycle parking available in rear alley.',
      latitude: 4.0510,
      longitude: 9.7679,
      logoUrl: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400',
      coverPhotoUrl: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800',
      isVerified: true,
      ratingAvg: 4.9,
      totalReviews: 87,
      followersCount: 1420,

      availableBalance: 0,
      escrowLockedBalance: 0,
      totalRevenue: 0,
      totalPaidOut: 0,

      orders: [],
      products: [],
      transactions: [],

      updateStoreProfile: (partial) => {
        set((state) => ({
          ...state,
          ...partial,
          storePhone: partial.primaryPhone || partial.storePhone || state.storePhone,
        }));
      },

      setDashboardMetrics: (data) => {
        set((state) => ({
          ...state,
          storeName: data.store_name ?? state.storeName,
          isVerified: data.is_verified ?? false,
          ratingAvg: data.rating_avg ?? 5.0,
          totalReviews: data.total_reviews ?? 0,
          availableBalance: data.available_balance ?? 0,
          escrowLockedBalance: data.escrow_locked_balance ?? 0,
          totalRevenue: data.total_revenue ?? 0,
          totalPaidOut: data.total_paid_out ?? 0,
        }));
      },

      setTransactions: (transactions) => {
        set({ transactions });
      },

      setOrders: (orders) => {
        set({ orders });
      },

      setProducts: (products) => {
        set({ products });
      },

      acceptOrder: (orderId) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, status: 'preparing' } : o
          ),
        }));
      },

      declineOrder: (orderId, reason) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, status: 'cancelled', decline_reason: reason } : o
          ),
        }));
      },

      markOrderReady: (orderId, deliveryMethod, driverPhone) => {
        set((state) => ({
          orders: state.orders.map((o) => {
            if (o.id !== orderId) return o;
            const generatedPin = o.pickup_pin || Math.floor(10000 + Math.random() * 90000).toString();
            return {
              ...o,
              status: 'ready_for_pickup',
              delivery_method: deliveryMethod,
              transporter_phone: driverPhone,
              pickup_pin: generatedPin,
              transporter_name:
                deliveryMethod === 'wunabuy_transporter'
                  ? 'Wunabuy Express Rider (Assigned)'
                  : 'Store In-House Rider',
            };
          }),
        }));
      },

      markOrderInTransit: (orderId) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, status: 'in_transit' } : o
          ),
        }));
      },

      markOrderCompleted: (orderId) => {
        const order = get().orders.find((o) => o.id === orderId);
        if (!order) return;

        const netEscrow = order.subtotal - order.commission;
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, status: 'completed' } : o
          ),
          availableBalance: state.availableBalance + netEscrow,
          escrowLockedBalance: Math.max(0, state.escrowLockedBalance - order.subtotal),
          totalRevenue: state.totalRevenue + netEscrow,
          transactions: [
            {
              id: `tx_${Date.now()}`,
              type: 'escrow_release',
              amount: netEscrow,
              status: 'completed',
              reference: `WNB-ESC-${order.order_code}`,
              description: `Escrow released for Order #${order.order_code}`,
              created_at: new Date().toISOString(),
            },
            ...state.transactions,
          ],
        }));
      },

      addProduct: (product) => {
        set((state) => ({
          products: [product, ...state.products],
        }));
      },

      updateProduct: (productId, partial) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId ? { ...p, ...partial, updated_at: new Date().toISOString() } : p
          ),
        }));
      },

      deleteProduct: (productId) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== productId),
        }));
      },

      toggleProductActive: (productId) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId ? { ...p, is_active: !p.is_active } : p
          ),
        }));
      },

      updateStock: (productId, delta) => {
        set((state) => ({
          products: state.products.map((p) => {
            if (p.id === productId) {
              const newQty = Math.max(0, p.quantity + delta);
              return { ...p, quantity: newQty, is_active: newQty > 0 ? p.is_active : false };
            }
            return p;
          }),
        }));
      },

      requestPayout: (amount, destinationPhone, provider) => {
        const { availableBalance } = get();
        if (amount > availableBalance || amount <= 0) {
          return { success: false, reference: '' };
        }

        const fee = Math.round(amount * 0.01); // 1% telecom network fee
        const netAmount = amount - fee;
        const refId = `WNB-PO-${Math.floor(1000 + Math.random() * 9000)}-${provider.toUpperCase()}`;

        set((state) => ({
          availableBalance: state.availableBalance - amount,
          totalPaidOut: state.totalPaidOut + netAmount,
          transactions: [
            {
              id: `tx_${Date.now()}`,
              type: 'payout',
              amount: netAmount,
              status: 'completed',
              reference: refId,
              description: `Payout to ${provider === 'mtn' ? 'MTN MoMo' : 'Orange Money'} (${destinationPhone})`,
              created_at: new Date().toISOString(),
            },
            ...state.transactions,
          ],
        }));

        return { success: true, reference: refId };
      },
    }),
    {
      name: 'wunabuy-seller-storage-v3',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

