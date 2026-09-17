import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, ProductCategory, QualityTier } from '@wunabuy/types';

export type SellerOrderStatus =
  | 'pending_acceptance' // New incoming order (2-hour acceptance timer)
  | 'pending'
  | 'pending_payment'
  | 'paid_escrow'
  | 'preparing'          // Accepted, merchant packing
  | 'ready_for_pickup'   // Packaged, ready for driver handover
  | 'in_transit'         // Picked up by transporter / in-house rider
  | 'en_route'
  | 'delivered'
  | 'received'
  | 'completed'          // Delivered & escrow released
  | 'cancelled'          // Declined or timed out
  | 'disputed'           // Buyer raised issue
  | 'resolved';

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
  pickup_pin?: string; // 4-digit security PIN sent to rider for handover verification
  decline_reason?: string;
  dispute_reason?: string;
}

export interface SellerTransaction {
  id: string;
  type: 'escrow_release' | 'payout' | 'commission_deduction';
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'pending_approval';
  reference: string;
  description: string;
  created_at: string;
}

interface SellerState {
  storeId?: string;
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
    store_id?: string;
    store_name?: string;
    category?: string;
    address?: string;
    landmark?: string;
    tagline?: string;
    description?: string;
    primary_phone?: string;
    secondary_phone?: string;
    email?: string;
    operating_hours?: string;
    rider_pickup_instructions?: string;
    logo_url?: string;
    cover_photo_url?: string;
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


export const useSellerStore = create<SellerState>()(
  persist(
    (set, get) => ({
      storeId: '',
      storeName: '',
      storePhone: '',
      category: '',
      tagline: '',
      description: '',
      address: '',
      landmarkDirections: '',
      primaryPhone: '',
      secondaryPhone: '',
      email: '',
      operatingHours: '',
      riderPickupInstructions: '',
      latitude: 4.0510,
      longitude: 9.7679,
      logoUrl: '',
      coverPhotoUrl: '',
      isVerified: false,
      ratingAvg: 0,
      totalReviews: 0,
      followersCount: 0,

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
          storeId: data.store_id ?? state.storeId,
          storeName: data.store_name ?? state.storeName,
          category: data.category ?? state.category,
          address: data.address ?? state.address,
          landmarkDirections: data.landmark ?? state.landmarkDirections,
          tagline: data.tagline ?? state.tagline,
          description: data.description ?? state.description,
          primaryPhone: data.primary_phone ?? state.primaryPhone,
          secondaryPhone: data.secondary_phone ?? state.secondaryPhone,
          email: data.email ?? state.email,
          operatingHours: data.operating_hours ?? state.operatingHours,
          riderPickupInstructions: data.rider_pickup_instructions ?? state.riderPickupInstructions,
          logoUrl: data.logo_url ?? state.logoUrl,
          coverPhotoUrl: data.cover_photo_url ?? state.coverPhotoUrl,
          isVerified: data.is_verified ?? state.isVerified,
          ratingAvg: data.rating_avg ?? state.ratingAvg,
          totalReviews: data.total_reviews ?? state.totalReviews,
          availableBalance: data.available_balance ?? state.availableBalance,
          escrowLockedBalance: data.escrow_locked_balance ?? state.escrowLockedBalance,
          totalRevenue: data.total_revenue ?? state.totalRevenue,
          totalPaidOut: data.total_paid_out ?? state.totalPaidOut,
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
            const generatedPin = o.pickup_pin || Math.floor(1000 + Math.random() * 9000).toString();
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

