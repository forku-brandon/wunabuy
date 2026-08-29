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
  delivery_method?: 'wunabuy_transporter' | 'in_house_rider';
  transporter_name?: string;
  transporter_phone?: string;
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

const INITIAL_SELLER_ORDERS: SellerOrder[] = [
  {
    id: 'ord_101',
    order_code: 'WB-2026-9901',
    customer_name: 'Marie Claire Ngono',
    customer_phone: '+237 671 234 567',
    delivery_address: 'Boulevard de la Liberté, Akwa, Douala',
    items: [
      {
        product_id: 'p1',
        name: 'Samsung Galaxy A54 5G',
        price: 185000,
        quantity: 1,
        image_url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800',
      },
    ],
    subtotal: 185000,
    delivery_fee: 1500,
    commission: 9250,
    total: 186500,
    status: 'pending_acceptance',
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    acceptance_expires_at: new Date(Date.now() + 105 * 60 * 1000).toISOString(), // 1h 45m left
  },
  {
    id: 'ord_102',
    order_code: 'WB-2026-9902',
    customer_name: 'Emmanuel Tabi',
    customer_phone: '+237 699 876 543',
    delivery_address: 'Rue des Palmiers, Bonanjo, Douala',
    items: [
      {
        product_id: 'p2',
        name: 'Wireless Bluetooth Earbuds Pro',
        price: 25000,
        quantity: 2,
        image_url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800',
      },
    ],
    subtotal: 50000,
    delivery_fee: 1200,
    commission: 2500,
    total: 51200,
    status: 'pending_acceptance',
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    acceptance_expires_at: new Date(Date.now() + 90 * 60 * 1000).toISOString(), // 1h 30m left
  },
  {
    id: 'ord_103',
    order_code: 'WB-2026-8819',
    customer_name: 'Pauline Mballa',
    customer_phone: '+237 677 345 678',
    delivery_address: 'Carrefour Agip, Deido, Douala',
    items: [
      {
        product_id: 'p3',
        name: '4K Ultra HD Action Camera',
        price: 45000,
        quantity: 1,
        image_url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800',
      },
    ],
    subtotal: 45000,
    delivery_fee: 1000,
    commission: 2250,
    total: 46000,
    status: 'preparing',
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    acceptance_expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ord_104',
    order_code: 'WB-2026-7732',
    customer_name: 'Georges Mbida',
    customer_phone: '+237 690 112 233',
    delivery_address: 'Rond Point 4ème, Makepe, Douala',
    items: [
      {
        product_id: 'p1',
        name: 'Samsung Galaxy A54 5G',
        price: 185000,
        quantity: 1,
        image_url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800',
      },
    ],
    subtotal: 185000,
    delivery_fee: 2000,
    commission: 9250,
    total: 187000,
    status: 'ready_for_pickup',
    delivery_method: 'wunabuy_transporter',
    transporter_name: 'Jean-Pierre Kamga (Bike 🏍️)',
    transporter_phone: '+237 670 998 877',
    created_at: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    acceptance_expires_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ord_105',
    order_code: 'WB-2026-6621',
    customer_name: 'Alain Fogue',
    customer_phone: '+237 675 443 322',
    delivery_address: 'Total Logpom, Douala',
    items: [
      {
        product_id: 'p2',
        name: 'Wireless Bluetooth Earbuds Pro',
        price: 25000,
        quantity: 1,
        image_url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800',
      },
    ],
    subtotal: 25000,
    delivery_fee: 1500,
    commission: 1250,
    total: 26500,
    status: 'in_transit',
    delivery_method: 'wunabuy_transporter',
    transporter_name: 'Moussa Bakary (Taxi 🚕)',
    transporter_phone: '+237 694 556 677',
    created_at: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    acceptance_expires_at: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
  },
  {
    id: 'ord_106',
    order_code: 'WB-2026-5510',
    customer_name: 'Sandrine Eyenga',
    customer_phone: '+237 673 889 900',
    delivery_address: 'Tradex Yassa, Douala',
    items: [
      {
        product_id: 'p3',
        name: '4K Ultra HD Action Camera',
        price: 45000,
        quantity: 1,
        image_url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800',
      },
    ],
    subtotal: 45000,
    delivery_fee: 1500,
    commission: 2250,
    total: 46500,
    status: 'completed',
    delivery_method: 'in_house_rider',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    acceptance_expires_at: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
  },
];

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

const INITIAL_SELLER_TRANSACTIONS: SellerTransaction[] = [
  {
    id: 'tx_s1',
    type: 'payout',
    amount: 150000,
    status: 'completed',
    reference: 'WNB-PO-9921-MOMO',
    description: 'Payout to MTN MoMo (+237 670 123 456)',
    created_at: '2026-08-28T14:30:00Z',
  },
  {
    id: 'tx_s2',
    type: 'escrow_release',
    amount: 185000,
    status: 'completed',
    reference: 'WNB-ESC-8812',
    description: 'Escrow released for Order #WB-2026-5510',
    created_at: '2026-08-27T18:00:00Z',
  },
  {
    id: 'tx_s3',
    type: 'commission_deduction',
    amount: 9250,
    status: 'completed',
    reference: 'WNB-COM-8812',
    description: 'Platform 5% fulfillment fee for Order #WB-2026-5510',
    created_at: '2026-08-27T18:00:00Z',
  },
  {
    id: 'tx_s4',
    type: 'escrow_release',
    amount: 45000,
    status: 'completed',
    reference: 'WNB-ESC-7719',
    description: 'Escrow released for Order #WB-2026-4402',
    created_at: '2026-08-26T10:15:00Z',
  },
];

export const useSellerStore = create<SellerState>()(
  persist(
    (set, get) => ({
      storeName: 'Douala Tech Hub',
      storePhone: '+237 670 123 456',
      isVerified: true,
      ratingAvg: 4.9,
      totalReviews: 87,
      followersCount: 1420,

      availableBalance: 450000,
      escrowLockedBalance: 235000,
      totalRevenue: 2850000,
      totalPaidOut: 2400000,

      orders: INITIAL_SELLER_ORDERS,
      products: INITIAL_SELLER_PRODUCTS,
      transactions: INITIAL_SELLER_TRANSACTIONS,

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
          orders: state.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: 'ready_for_pickup',
                  delivery_method: deliveryMethod,
                  transporter_phone: driverPhone,
                  transporter_name:
                    deliveryMethod === 'wunabuy_transporter'
                      ? 'Wunabuy Express Rider (Assigned)'
                      : 'Store In-House Rider',
                }
              : o
          ),
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
      name: 'wunabuy-seller-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
